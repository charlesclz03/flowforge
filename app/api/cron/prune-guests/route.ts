import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Define "Stale": 30 days of inactivity
    // Since we don't have 'lastActive', we use 'updatedAt'
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Find guests to prune
    // Guest = No email (usually) AND not subscribed
    const staleGuests = await prisma.user.findMany({
      where: {
        email: null,
        updatedAt: { lt: thirtyDaysAgo },
        subscriptionStatus: 'free', // Safety check
        // Also ensure they haven't created any POPULAR content?
        // If they have 0 flow points, safe to delete.
        // If they have meaningful content, maybe keep?
        // For now, Strict Prune: If Guest & Inactive & Free -> Delete.
        // But we should Cascade delete their sessions?
        // Prisma schema has 'onDelete: Cascade' for sessions. OK.
      },
      select: { id: true },
    })

    if (staleGuests.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 })
    }

    // Delete in batch
    const { count } = await prisma.user.deleteMany({
      where: {
        id: { in: staleGuests.map((u) => u.id) },
      },
    })

    return NextResponse.json({ success: true, deleted: count })
  } catch (error) {
    console.error('[Cron] Prune Guests failed:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
