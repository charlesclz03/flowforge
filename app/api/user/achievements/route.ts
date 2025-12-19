import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { Achievement } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' }
    })

    const allAchievements = await prisma.achievement.findMany({
        orderBy: { points: 'asc' }
    })

    return NextResponse.json({ 
        userAchievements,
        allAchievements
    })
  } catch (error) {
    console.error('Failed to fetch achievements', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
