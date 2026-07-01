import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendProWelcomeEmail } from '@/lib/email/lifecycle'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    console.error('[Stripe] Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe] STRIPE_WEBHOOK_SECRET is missing')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId) {
          console.warn(
            '[Stripe] checkout.session.completed missing metadata.userId',
            { eventId: event.id, checkoutSessionId: session.id }
          )
          break
        }

        // Snapshot the prior status so the Pro welcome email is sent only once,
        // on the genuine free->Pro transition (guards against Stripe retries).
        const priorUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true, subscriptionStatus: true },
        })

        let customerId = getId(session.customer)
        let subscriptionId = getId(session.subscription)

        // If Stripe didn't include the ids (or they were not expanded), retrieve for safety.
        if (!customerId || !subscriptionId) {
          try {
            const expanded = await stripe.checkout.sessions.retrieve(
              session.id,
              {
                expand: ['customer', 'subscription'],
              }
            )
            customerId = customerId || getId(expanded.customer)
            subscriptionId = subscriptionId || getId(expanded.subscription)
          } catch (err) {
            console.error('[Stripe] Failed to retrieve checkout session:', {
              eventId: event.id,
              checkoutSessionId: session.id,
              error: err instanceof Error ? err.message : String(err),
            })
          }
        }

        // Update user subscription status
        const result = await prisma.user.updateMany({
          where: { id: userId },
          data: {
            subscriptionStatus: 'active',
            ...(subscriptionId ? { subscriptionId } : {}),
            ...(customerId ? { customerId } : {}),
          },
        })

        if (result.count === 0) {
          console.warn(
            '[Stripe] checkout.session.completed: user not found for update',
            { eventId: event.id, userId }
          )
        } else if (
          priorUser &&
          priorUser.subscriptionStatus !== 'active' &&
          priorUser.email
        ) {
          // Genuine free->Pro activation — send the welcome-to-Pro email once,
          // fully guarded so it can never affect payment/webhook processing.
          await sendProWelcomeEmail({
            to: priorUser.email,
            name: priorUser.name,
          }).catch(() => {})
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = getCustomerId(subscription.customer)

        const result = await prisma.user.updateMany({
          where: {
            OR: [
              ...(customerId ? [{ customerId }] : []),
              { subscriptionId: subscription.id },
            ],
          },
          data: {
            subscriptionStatus: subscription.status,
          },
        })

        if (result.count === 0) {
          console.warn(
            '[Stripe] customer.subscription.updated: no user matched',
            {
              eventId: event.id,
              subscriptionId: subscription.id,
              customerId,
              status: subscription.status,
            }
          )
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = getCustomerId(subscription.customer)

        const result = await prisma.user.updateMany({
          where: {
            OR: [
              ...(customerId ? [{ customerId }] : []),
              { subscriptionId: subscription.id },
            ],
          },
          data: {
            subscriptionStatus: 'canceled',
            subscriptionId: null,
          },
        })

        if (result.count === 0) {
          console.warn(
            '[Stripe] customer.subscription.deleted: no user matched',
            { eventId: event.id, subscriptionId: subscription.id, customerId }
          )
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(
          `[Stripe] Invoice paid: ${invoice.id}, Amount: ${invoice.amount_paid}`
        )
        // Optional: Extend subscription expiry if we were tracking it locally
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[Stripe] Invoice payment failed: ${invoice.id}`)

        const customerId = getCustomerId(invoice.customer)
        const subscriptionDetails = invoice.parent?.subscription_details ?? null
        const subscriptionId = subscriptionDetails
          ? getId(subscriptionDetails.subscription)
          : null

        const result = await prisma.user.updateMany({
          where: {
            OR: [
              ...(customerId ? [{ customerId }] : []),
              ...(subscriptionId ? [{ subscriptionId }] : []),
            ],
          },
          data: {
            subscriptionStatus: 'past_due',
          },
        })

        if (result.count === 0) {
          console.warn('[Stripe] invoice.payment_failed: no user matched', {
            eventId: event.id,
            invoiceId: invoice.id,
            customerId,
            subscriptionId,
          })
        }
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

function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): string | null {
  if (!customer) return null
  if (typeof customer === 'string') return customer
  return customer.id
}

function getId(
  value:
    | string
    | { id: string }
    | Stripe.DeletedCustomer
    | Stripe.Customer
    | Stripe.Subscription
    | null
    | undefined
): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if ('id' in value) return value.id
  return null
}
