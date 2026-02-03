import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, PLANS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getBaseUrl } from '@/lib/url'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.email) {
      return NextResponse.json(
        { error: 'Missing user email' },
        { status: 400 }
      )
    }

    const { plan } = await request.json()

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const priceId = PLANS[plan as keyof typeof PLANS].priceId
    const baseUrl = getBaseUrl()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { customerId: true },
    })

    const customerId = user?.customerId || undefined

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
      success_url: `${baseUrl}/orderconfirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/profile`,
      ...(customerId
        ? { customer: customerId }
        : { customer_email: session.user.email }),
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    // Enhanced error logging
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorDetails =
      error instanceof Error ? error.stack : JSON.stringify(error)
    console.error('Stripe checkout error:', {
      message: errorMessage,
      details: errorDetails,
      priceIdMonthly: process.env.STRIPE_PRICE_ID_MONTHLY ? 'SET' : 'MISSING',
      priceIdYearly: process.env.STRIPE_PRICE_ID_YEARLY ? 'SET' : 'MISSING',
      stripeKey: process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING',
    })
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    )
  }
}
