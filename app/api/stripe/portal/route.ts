import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is missing')
}

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

    let customerId = user?.customerId

    if (!customerId) {
      // Fix for Superadmins who don't have a subscription but need access
      if (session.user.role === 'SUPERADMIN') {
        const userEmail = session.user.email
        const newCustomer = await stripe.customers.create({
          email: userEmail!,
          name: session.user.name || undefined,
        })

        await prisma.user.update({
          where: { id: session.user.id },
          data: { customerId: newCustomer.id },
        })
        customerId = newCustomer.id
      } else {
        return NextResponse.json(
          { error: 'No subscription found' },
          { status: 404 }
        )
      }
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId!,
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
