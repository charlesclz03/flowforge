import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Get Totals
    const [wordCount, sessionAgg, recentSessions] = await Promise.all([
      prisma.collectedWord.count({
        where: { userId: session.user.id },
      }),
      prisma.freestyleSession.aggregate({
        where: { userId: session.user.id },
        _count: { id: true },
        _sum: { durationSeconds: true },
      }),
      // 2. Get recent history for graph (Last 14 days)
      prisma.freestyleSession.findMany({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
        },
        select: { createdAt: true },
      }),
    ])

    // 3. Process History (Day buckets)
    const historyMap = new Map<string, number>()
    recentSessions.forEach((s) => {
      const dateKey = s.createdAt.toISOString().split('T')[0] // YYYY-MM-DD
      historyMap.set(dateKey, (historyMap.get(dateKey) || 0) + 1)
    })

    const historyCurve = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i)) // Past to Present
      const dateKey = d.toISOString().split('T')[0]
      return {
        date: dateKey,
        count: historyMap.get(dateKey) || 0,
        label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      }
    })

    return NextResponse.json({
      wordVaultCount: wordCount,
      totalWordsPool: 2000,
      totalSessions: sessionAgg._count.id || 0,
      totalDuration: Math.floor((sessionAgg._sum.durationSeconds || 0) / 60), // Minutes
      historyCurve,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
