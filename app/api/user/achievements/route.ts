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

      // UNIFIED DATA FETCH: Fetch everything needed for both display and achievement checking
      const [
        sessionCount,
        recordingCount,
        distinctBeats,
        achievements,
        userStats,
        totalDurationResult,
        totalWordsResult,
        cypherCount,
        genreCounts,
        collectedWordsCount,
      ] = await Promise.all([
        // 1. Session Count
        prisma.freestyleSession.count({ where: { userId } }),
        // 2. Recording Count
        prisma.freestyleSession.count({
          where: { userId, storageUrl: { not: null } },
        }),
        // 3. Distinct Beats
        prisma.freestyleSession.groupBy({
          by: ['beatId'],
          where: { userId },
        }),
        // 4. Existing Achievements (Full object for display)
        prisma.userAchievement.findMany({
          where: { userId },
          include: { achievement: true },
          orderBy: { unlockedAt: 'desc' },
        }),
        // 5. User Stats
        prisma.user.findUnique({
          where: { id: userId },
          select: { xp: true, level: true, currentStreak: true, createdAt: true },
        }),
        // 6. Total Duration
        prisma.freestyleSession.aggregate({
          where: { userId },
          _sum: { durationSeconds: true },
        }),
        // 7. Total Words
        prisma.freestyleSession.aggregate({
          where: { userId },
          _sum: { wordCount: true },
        }),
        // 8. Cypher Count
        prisma.freestyleSession.count({
          where: { userId, mode: 'cypher' },
        }),
        // 9. Genre Counts
        prisma.freestyleSession.findMany({
          where: { userId },
          select: { beat: { select: { genre: true } } },
          distinct: ['beatId'],
        }),
        // 10. Collected Words
        prisma.collectedWord.count({ where: { userId } }),
      ])

      // LAZY UNLOCK: Check for missing achievements using PRE-FETCHED data
      try {
        await AchievementSystem.checkAndUnlock(
          userId,
          {
            type: 'SESSION_COMPLETE', // Generic context to trigger totals check
          },
          // Optimization: Pass pre-fetched stats to avoid re-querying
          {
            sessionCount,
            recordingCount,
            distinctBeats,
            userAchievements: achievements,
            userStats,
            totalDuration: totalDurationResult._sum.durationSeconds || 0,
            totalWords: totalWordsResult._sum.wordCount || 0,
            cypherCount,
            genreCounts,
            collectedWordCount: collectedWordsCount,
          }
        )
      } catch (err) {
        console.warn('Lazy unlock failed:', err)
      }

      // Populate response with the already fetched data
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
