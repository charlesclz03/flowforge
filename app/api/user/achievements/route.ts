import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSessionWithUserId()
    let userAchievements: Prisma.UserAchievementGetPayload<{
      include: { achievement: true }
    }>[] = []

    if (session?.user?.id) {
      userAchievements = await prisma.userAchievement.findMany({
        where: { userId: session.user.id },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
      })
    }

    let allAchievements = await prisma.achievement.findMany({
      orderBy: { points: 'asc' },
    })

    // Auto-seed if empty
    if (allAchievements.length === 0) {
      console.log('Achievements table empty, auto-seeding...')
      const { ACHIEVEMENTS } = await import('@/lib/gamification/data')
      for (const ach of ACHIEVEMENTS) {
        await prisma.achievement.upsert({
          where: { code: ach.code },
          update: ach,
          create: ach,
        })
      }
      allAchievements = await prisma.achievement.findMany({
        orderBy: { points: 'asc' },
      })
    }

    return NextResponse.json({
      userAchievements,
      allAchievements,
    })
  } catch (error) {
    console.error('Failed to fetch achievements', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
