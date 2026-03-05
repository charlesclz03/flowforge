import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Pro hint, Hobby limit remains 10s

const PROGRESS_CAPS = {
  sessions: 100,
  recordings: 50,
  beats: 20,
  words: 5000,
} as const

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

    let allAchievements: Prisma.AchievementGetPayload<Prisma.AchievementDefaultArgs>[] =
      []

    if (session?.user?.id) {
      const userId = session.user.id

      const queryRawPromise = prisma.$queryRaw<
        {
          sessions: number
          recordings: number
          beats: number
          words: number
          streak: number | null
        }[]
      >(Prisma.sql`
        SELECT
          (SELECT COUNT(*)::int FROM (SELECT 1 FROM freestyle_sessions WHERE user_id = ${userId} LIMIT ${PROGRESS_CAPS.sessions}) AS s) AS sessions,
          (SELECT COUNT(*)::int FROM (SELECT 1 FROM freestyle_sessions WHERE user_id = ${userId} AND storage_url IS NOT NULL LIMIT ${PROGRESS_CAPS.recordings}) AS r) AS recordings,
          (SELECT COUNT(*)::int FROM (SELECT DISTINCT beat_id FROM freestyle_sessions WHERE user_id = ${userId} LIMIT ${PROGRESS_CAPS.beats}) AS b) AS beats,
          (SELECT COUNT(*)::int FROM (SELECT 1 FROM collected_words WHERE user_id = ${userId} LIMIT ${PROGRESS_CAPS.words}) AS w) AS words,
          (SELECT "currentStreak"::int FROM users WHERE id = ${userId}) AS streak
      `)

      const userAchievementsPromise = prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
      })

      const allAchievementsPromise = prisma.achievement.findMany({
        orderBy: { points: 'asc' },
      })

      const [progressRowResult, userAchievementsResult, allAchievementsResult] =
        await Promise.all([
          queryRawPromise,
          userAchievementsPromise,
          allAchievementsPromise,
        ])

      const progressRow = progressRowResult[0]
      userAchievements = userAchievementsResult
      allAchievements = allAchievementsResult

      progress = {
        sessions: progressRow?.sessions ?? 0,
        recordings: progressRow?.recordings ?? 0,
        beats: progressRow?.beats ?? 0,
        streak: progressRow?.streak ?? 0,
        words: progressRow?.words ?? 0,
      }
    } else {
      // If no session, fetch allAchievements anyway to show what's available
      allAchievements = await prisma.achievement.findMany({
        orderBy: { points: 'asc' },
      })
    }

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
