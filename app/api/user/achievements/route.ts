import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { AchievementSystem } from '@/lib/gamification/achievements'

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

      // LAZY UNLOCK: Check for missing achievements (Self-Healing)
      try {
        await AchievementSystem.checkAndUnlock(userId, {
          type: 'SESSION_COMPLETE', // Generic context to trigger totals check
        })
      } catch (err) {
        console.warn('Lazy unlock failed:', err)
      }

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

    const { ACHIEVEMENTS } = await import('@/lib/gamification/data')

    // Always ensure all defined achievements exist in DB
    // (This allows adding new achievements without wiping the DB)
    // Check if we need to seed (if DB count < DATA count)
    // We filter for missing codes to avoid unnecessary operations
    const existingCodes = new Set(allAchievements.map((a) => a.code))
    const missingAchievements = ACHIEVEMENTS.filter(
      (a) => !existingCodes.has(a.code)
    )

    if (missingAchievements.length > 0) {
      console.log(`Seeding ${missingAchievements.length} new achievements...`)

      const creationData = missingAchievements.map((ach) => ({
        code: ach.code,
        name: ach.name,
        description: ach.description,
        icon: ach.icon || 'Trophy',
        points: ach.points,
      }))

      // Use createMany for bulk insertion (much faster than serial upserts)
      await prisma.achievement.createMany({
        data: creationData,
        skipDuplicates: true,
      })

      // Re-fetch after seeding to get the IDs
      allAchievements = await prisma.achievement.findMany({
        orderBy: { points: 'asc' },
      })
      console.log(`Seeding complete. New count: ${allAchievements.length}`)
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
