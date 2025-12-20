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

    if (!user?.customerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Portal session error:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
