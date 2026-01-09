import { prisma } from '@/lib/prisma'

export class AchievementSystem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async checkAndUnlock(
    userId: string,
    context: {
      type: 'SESSION_COMPLETE' | 'RECORDING_SAVED'
      meta?: Record<string, unknown>
    }
  ) {
    const newlyUnlocked: string[] = []

    // PARALLEL STATS FETCHING
    const [sessionCount, recordingCount, distinctBeats, userAchievements] =
      await Promise.all([
        prisma.freestyleSession.count({ where: { userId } }),
        prisma.freestyleSession.count({
          where: { userId, storageUrl: { not: null } },
        }),
        prisma.freestyleSession.groupBy({
          by: ['beatId'],
          where: { userId },
        }),
        prisma.userAchievement.findMany({
          where: { userId },
          select: { achievement: { select: { code: true } } },
        }),
      ])

    const distinctBeatCount = distinctBeats.length
    const unlockedCodes = new Set(
      userAchievements.map((ua) => ua.achievement.code)
    )

    // Define Checks
    const checks = [
      // Sessions
      { code: 'FIRST_FLOW', condition: sessionCount >= 1 },
      { code: 'SESSION_5', condition: sessionCount >= 5 },
      { code: 'SESSION_20', condition: sessionCount >= 20 },
      { code: 'SESSION_50', condition: sessionCount >= 50 },
      { code: 'SESSION_100', condition: sessionCount >= 100 },

      // Recordings
      { code: 'FIRST_RECORDING', condition: recordingCount >= 1 },
      { code: 'RECORDING_10', condition: recordingCount >= 10 },
      { code: 'RECORDING_50', condition: recordingCount >= 50 },

      // Beats
      { code: 'BEAT_EXPLORER_5', condition: distinctBeatCount >= 5 },
      { code: 'BEAT_MASTER_20', condition: distinctBeatCount >= 20 },

      // Time (Context specific)
      {
        code: 'EARLY_BIRD',
        condition:
          context.type === 'SESSION_COMPLETE' && new Date().getHours() < 8,
      },
      {
        code: 'NIGHT_OWL',
        condition:
          context.type === 'SESSION_COMPLETE' && new Date().getHours() >= 23,
      },
      {
        code: 'WEEKEND_WARRIOR',
        condition:
          context.type === 'SESSION_COMPLETE' &&
          (new Date().getDay() === 0 || new Date().getDay() === 6),
      },
    ]

    const codesToUnlock = checks
      .filter((c) => !unlockedCodes.has(c.code) && c.condition)
      .map((c) => c.code)

    if (codesToUnlock.length > 0) {
      // Fetch all required achievement IDs in one go
      const achievements = await prisma.achievement.findMany({
        where: { code: { in: codesToUnlock } },
        select: { id: true, code: true },
      })

      // Create user achievement records in parallel or batch
      await Promise.all(
        achievements.map((a) =>
          prisma.userAchievement
            .create({
              data: {
                userId,
                achievementId: a.id,
              },
            })
            .catch((err) =>
              console.warn(`Silent failure unlocking ${a.code}:`, err)
            )
        )
      )

      newlyUnlocked.push(...achievements.map((a) => a.code))
    }

    return newlyUnlocked
  }

  // unlock method deprecated in favor of batch logic above

  static async getLeaderboard(period: 'all_time' | 'weekly' = 'all_time') {
    let whereClause = {}

    if (period === 'weekly') {
      // Find last Wednesday
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      while (d.getDay() !== 3) {
        d.setDate(d.getDate() - 1)
      }

      whereClause = {
        unlockedAt: { gte: d },
      }
    }

    const entries = await prisma.userAchievement.findMany({
      where: whereClause,
      include: {
        achievement: true,
      },
    })

    // Aggregate in memory
    const scores: Record<string, number> = {}
    entries.forEach(
      (entry: { userId: string; achievement: { points: number } }) => {
        const pts = entry.achievement.points
        scores[entry.userId] = (scores[entry.userId] || 0) + pts
      }
    )

    // Sort
    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)

    return sorted.map(([userId, points]) => ({ userId, points }))
  }
}
