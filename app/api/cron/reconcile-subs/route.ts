import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // 1. Authorization Check (Vercel Cron)
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // 2. Fetch users who might be out of sync
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { customerId: { not: null } },
          { subscriptionStatus: { in: ['trialing', 'past_due', 'active'] } }, // Check active too occasionally?
        ],
      },
      select: {
        id: true,
        customerId: true,
        subscriptionStatus: true,
      },
      take: 50, // Batch limit to avoid timeouts
    })

    const results = {
      total: users.length,
      updated: 0,
      errors: 0,
    }

    // 3. Check Stripe for each user
    for (const user of users) {
      if (!user.customerId) continue

      try {
        const customer = await stripe.customers.retrieve(user.customerId, {
          expand: ['subscriptions'],
        })

        if (!customer || customer.deleted) {
          // Handle deleted customer if needed
          continue
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscriptions = (customer as any).subscriptions?.data || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const activeSub = subscriptions.find((s: any) => ['active', 'trialing'].includes(s.status))

        // Determine correct status
        let realStatus = 'free'
        let subId = null

        if (activeSub) {
          realStatus = activeSub.status
          subId = activeSub.id
        } else {
          // Check for past_due
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pastDueSub = subscriptions.find((s: any) => s.status === 'past_due')
          if (pastDueSub) {
            realStatus = 'past_due'
            subId = pastDueSub.id
          }
        }

        // 4. Update if different
        if (realStatus !== user.subscriptionStatus) {
          console.log(
            `[Cron] Updating user ${user.id}: ${user.subscriptionStatus} -> ${realStatus}`
          )
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: realStatus,
              subscriptionId: subId,
            },
          })
          results.updated++
        }
      } catch (err) {
        console.error(`[Cron] Error checking user ${user.id}:`, err)
        results.errors++
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('[Cron] Reconcile Subs failed:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
