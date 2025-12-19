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

    // Fetch user stats for checks
    const sessionCount = await prisma.freestyleSession.count({ where: { userId } })
    const recordingCount = await prisma.freestyleSession.count({
      where: { userId, storageUrl: { not: null } },
    })

    // Fetch distinct beats used
    const distinctBeats = await prisma.freestyleSession.groupBy({
      by: ['beatId'],
      where: { userId },
    })
    const distinctBeatCount = distinctBeats.length

    // Fetch user's current achievements to avoid re-unlocking
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, achievement: { select: { code: true } } },
    })
    const unlockedCodes = new Set(
      userAchievements.map((ua: { achievement: { code: string } }) => ua.achievement.code)
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
        condition: context.type === 'SESSION_COMPLETE' && new Date().getHours() < 8,
      },
      {
        code: 'NIGHT_OWL',
        condition: context.type === 'SESSION_COMPLETE' && new Date().getHours() >= 23,
      },
      {
        code: 'WEEKEND_WARRIOR',
        condition:
          context.type === 'SESSION_COMPLETE' &&
          (new Date().getDay() === 0 || new Date().getDay() === 6),
      },
    ]

    // Execute Checks
    for (const check of checks) {
      if (!unlockedCodes.has(check.code) && check.condition) {
        await this.unlock(userId, check.code)
        newlyUnlocked.push(check.code)
      }
    }

    return newlyUnlocked
  }

  private static async unlock(userId: string, code: string) {
    const achievement = await prisma.achievement.findUnique({ where: { code } })
    if (!achievement) return

    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
      },
    })
  }

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
    entries.forEach((entry: { userId: string; achievement: { points: number } }) => {
      const pts = entry.achievement.points
      scores[entry.userId] = (scores[entry.userId] || 0) + pts
    })

    // Sort
    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)

    return sorted.map(([userId, points]) => ({ userId, points }))
  }
}
