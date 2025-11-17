# Stripe Integration Setup Guide

## Overview
Implement Stripe for FlowForge Pro subscription ($4.99/month or $49.99/year).

## 1. Stripe Account Setup

1. Create account at [stripe.com](https://stripe.com)
2. Complete business verification
3. Get API keys from Dashboard → Developers → API keys

## 2. Install Dependencies

```bash
npm install stripe @stripe/stripe-js
```

## 3. Environment Variables

Add to `.env.local`:

```bash
# Stripe (get from dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From webhook setup

# Product/Price IDs (create in Stripe Dashboard)
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...
```

## 4. Create Products in Stripe Dashboard

### Monthly Plan
- Name: FlowForge Pro (Monthly)
- Price: $4.99 USD
- Billing period: Monthly
- Copy Price ID → `STRIPE_PRICE_ID_MONTHLY`

### Yearly Plan
- Name: FlowForge Pro (Yearly)
- Price: $49.99 USD
- Billing period: Yearly
- Copy Price ID → `STRIPE_PRICE_ID_YEARLY`

## 5. Implementation Files

### `lib/stripe.ts`
```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY!,
    price: 4.99,
    interval: 'month' as const,
  },
  yearly: {
    priceId: process.env.STRIPE_PRICE_ID_YEARLY!,
    price: 49.99,
    interval: 'year' as const,
  },
}
```

### `app/api/stripe/checkout/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()
    
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const priceId = PLANS[plan as keyof typeof PLANS].priceId

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      customer_email: session.user.email!,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
```

### `app/api/stripe/webhook/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Update user subscription status
        await prisma.user.update({
          where: { id: session.metadata!.userId },
          data: {
            subscriptionStatus: 'active',
            subscriptionId: session.subscription as string,
            customerId: session.customer as string,
          },
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        await prisma.user.update({
          where: { customerId: subscription.customer as string },
          data: {
            subscriptionStatus: subscription.status,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        await prisma.user.update({
          where: { customerId: subscription.customer as string },
          data: {
            subscriptionStatus: 'canceled',
            subscriptionId: null,
          },
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        await prisma.user.update({
          where: { customerId: invoice.customer as string },
          data: {
            subscriptionStatus: 'past_due',
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
```

### `app/api/stripe/portal/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { customerId: true },
    })

    if (!user?.customerId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Portal session error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
```

## 6. Update Prisma Schema

Add subscription fields to User model:

```prisma
model User {
  id                 String    @id @default(uuid())
  email              String?   @unique
  name               String?
  image              String?
  emailVerified      DateTime? @map("email_verified")
  
  // Stripe fields
  customerId         String?   @unique @map("customer_id")
  subscriptionId     String?   @unique @map("subscription_id")
  subscriptionStatus String?   @default("free") @map("subscription_status")
  // Values: "free", "active", "past_due", "canceled", "trialing"
  
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  accounts           Account[]
  sessions           Session[]
  freestyleSessions  FreestyleSession[]

  @@map("users")
}
```

Run migration:
```bash
npx prisma migrate dev --name add_subscription_fields
npx prisma generate
```

## 7. Client Components

### Upgrade Button (`components/subscription/UpgradeButton.tsx`)
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function UpgradeButton({ plan = 'monthly' }: { plan?: 'monthly' | 'yearly' }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const { url } = await response.json()
      
      if (url) {
        router.push(url)
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="btn-primary px-8 py-3"
    >
      {loading ? 'Loading...' : 'Upgrade to Pro'}
    </button>
  )
}
```

### Manage Subscription Button
```typescript
'use client'

import { useState } from 'react'

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  const handleManage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="btn-secondary px-6 py-2"
    >
      {loading ? 'Loading...' : 'Manage Subscription'}
    </button>
  )
}
```

## 8. Feature Gating Utility

### `lib/subscription.ts`
```typescript
import { prisma } from '@/lib/prisma'

export async function checkSubscription(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true },
  })

  return user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing'
}

export async function requirePro(userId: string) {
  const isPro = await checkSubscription(userId)
  
  if (!isPro) {
    throw new Error('Pro subscription required')
  }
}
```

### Usage in API Routes
```typescript
import { requirePro } from '@/lib/subscription'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user has Pro subscription
  try {
    await requirePro(session.user.id)
  } catch {
    return NextResponse.json(
      { error: 'Pro subscription required' },
      { status: 403 }
    )
  }

  // Pro-only feature logic...
}
```

## 9. Webhook Setup in Stripe Dashboard

1. Go to Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://flowforge.app/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy webhook signing secret → `STRIPE_WEBHOOK_SECRET`

## 10. Testing

### Test Mode
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### Test Webhooks Locally
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy webhook secret to .env.local
```

## 11. Go Live Checklist

- [ ] Switch to live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test live checkout flow
- [ ] Verify webhook events are received
- [ ] Set up billing portal
- [ ] Configure email receipts
- [ ] Add tax collection (if required)
- [ ] Review refund policy

## 12. Pricing Page Example

```typescript
export default function PricingPage() {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto p-8">
      <div className="glass rounded-3xl p-8">
        <h3 className="text-2xl font-light mb-4">Monthly</h3>
        <div className="text-4xl font-light mb-6">
          $4.99<span className="text-lg text-text-secondary">/month</span>
        </div>
        <ul className="space-y-3 mb-8">
          <li>✓ Unlimited recording time</li>
          <li>✓ Full beat library</li>
          <li>✓ Advanced AI features</li>
          <li>✓ Upload your own beats</li>
          <li>✓ Ad-free experience</li>
        </ul>
        <UpgradeButton plan="monthly" />
      </div>

      <div className="glass rounded-3xl p-8 border-2 border-accent-orange">
        <div className="text-xs uppercase tracking-wider text-accent-orange mb-2">
          Best Value
        </div>
        <h3 className="text-2xl font-light mb-4">Yearly</h3>
        <div className="text-4xl font-light mb-2">
          $49.99<span className="text-lg text-text-secondary">/year</span>
        </div>
        <div className="text-sm text-accent-orange mb-6">Save $10/year</div>
        <ul className="space-y-3 mb-8">
          <li>✓ All Monthly features</li>
          <li>✓ 2 months free</li>
          <li>✓ Priority support</li>
        </ul>
        <UpgradeButton plan="yearly" />
      </div>
    </div>
  )
}
```

## 13. Security Best Practices

- Never expose secret key client-side
- Always verify webhook signatures
- Use HTTPS in production
- Implement rate limiting on checkout endpoint
- Log all subscription changes
- Handle failed payments gracefully
- Provide clear cancellation flow

