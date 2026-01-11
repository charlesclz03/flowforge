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

    // Progress tracking variables
    let progress = {
      sessions: 0,
      recordings: 0,
      beats: 0,
      streak: 0,
      words: 0,
    }

    if (session?.user?.id) {
      const userId = session.user.id

      // Fetch achievements and progress counts in parallel
      const [
        achievements,
        sessionCount,
        recordingCount,
        distinctBeats,
        userStats,
        collectedWordsCount,
      ] = await Promise.all([
        prisma.userAchievement.findMany({
          where: { userId },
          include: { achievement: true },
          orderBy: { unlockedAt: 'desc' },
        }),
        prisma.freestyleSession.count({ where: { userId } }),
        prisma.freestyleSession.count({
          where: { userId, storageUrl: { not: null } },
        }),
        prisma.freestyleSession.groupBy({
          by: ['beatId'],
          where: { userId },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { currentStreak: true },
        }),
        prisma.collectedWord.count({ where: { userId } }),
      ])

      userAchievements = achievements
      progress = {
        sessions: sessionCount,
        recordings: recordingCount,
        beats: distinctBeats.length,
        streak: userStats?.currentStreak || 0,
        words: collectedWordsCount,
      }
    }

    let allAchievements = await prisma.achievement.findMany({
      orderBy: { points: 'asc' },
    })

    // Always ensure all defined achievements exist in DB
    // (This allows adding new achievements without wiping the DB)
    const { ACHIEVEMENTS } = await import('@/lib/gamification/data')

    // Check if we need to seed (if DB count < DATA count)
    if (allAchievements.length < ACHIEVEMENTS.length) {
      console.log('Detected new achievements, seeding...')
      for (const ach of ACHIEVEMENTS) {
        await prisma.achievement.upsert({
          where: { code: ach.code },
          update: ach,
          create: ach,
        })
      }
      // Re-fetch after seeding
      allAchievements = await prisma.achievement.findMany({
        orderBy: { points: 'asc' },
      })
    }

    return NextResponse.json({
      userAchievements,
      allAchievements,
      progress,
    })
  } catch (error) {
    console.error('Failed to fetch achievements', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
