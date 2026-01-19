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
    const [
      sessionCount,
      recordingCount,
      distinctBeats,
      userAchievements,
      userStats,
      totalDurationResult,
      totalWordsResult,
      cypherCount,
      genreCounts,
      collectedWordCount,
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
      // 4. Existing Achievements
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievement: { select: { code: true } } },
      }),
      // 5. User Stats (XP, Level, Streak)
      prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, currentStreak: true, createdAt: true },
      }),
      // 6. Total Duration
      prisma.freestyleSession.aggregate({
        where: { userId },
        _sum: { durationSeconds: true },
      }),
      // 7. Total Words (using wordCount on Session)
      prisma.freestyleSession.aggregate({
        where: { userId },
        _sum: { wordCount: true },
      }),
      // 8. Cypher Count
      prisma.freestyleSession.count({
        where: { userId, mode: 'cypher' },
      }),
      // 9. Genre Counts (requires joining with Beat)
      prisma.freestyleSession.findMany({
        where: { userId },
        select: { beat: { select: { genre: true } } },
        distinct: ['beatId'], // Approximation for distinct genres visited
      }),
      // 10. Collected Words (Word Vault)
      prisma.collectedWord.count({ where: { userId } }),
    ])

    const distinctBeatCount = distinctBeats.length
    const unlockedCodes = new Set(
      userAchievements.map((ua) => ua.achievement.code)
    )

    // Derived Stats
    const xp = userStats?.xp || 0
    const level = userStats?.level || 1
    const streak = userStats?.currentStreak || 0
    const totalMinutes = Math.floor(
      (totalDurationResult._sum.durationSeconds || 0) / 60
    )
    const totalWords = totalWordsResult._sum.wordCount || 0
    const uniqueGenres = new Set(
      genreCounts.map((s) => s.beat.genre).filter(Boolean)
    ).size

    // Session Context Data
    const sessionWords = (context.meta?.wordCount as number) || 0
    const sessionDuration = (context.meta?.durationSeconds as number) || 0
    const sessionRestarts = (context.meta?.restarts as number) || 0
    const sessionFrequency = (context.meta?.frequency as number) || 0

    // Define Checks
    const checks = [
      // --- WAVE 1: CORE ---
      { code: 'FIRST_FLOW', condition: sessionCount >= 1 },
      { code: 'SESSION_5', condition: sessionCount >= 5 },
      { code: 'SESSION_20', condition: sessionCount >= 20 },
      { code: 'SESSION_50', condition: sessionCount >= 50 },
      { code: 'SESSION_100', condition: sessionCount >= 100 },

      { code: 'FIRST_RECORDING', condition: recordingCount >= 1 },
      { code: 'RECORDING_10', condition: recordingCount >= 10 },
      { code: 'RECORDING_50', condition: recordingCount >= 50 },

      { code: 'BEAT_EXPLORER_5', condition: distinctBeatCount >= 5 },
      { code: 'BEAT_MASTER_20', condition: distinctBeatCount >= 20 },

      // --- WAVE 2: XP & LEVEL ---
      { code: 'LEVEL_5', condition: level >= 5 },
      { code: 'LEVEL_10', condition: level >= 10 },
      { code: 'LEVEL_25', condition: level >= 25 },
      { code: 'LEVEL_50', condition: level >= 50 },
      { code: 'XP_10K', condition: xp >= 10000 },
      { code: 'XP_100K', condition: xp >= 100000 },

      // --- WAVE 2: STREAKS ---
      { code: 'STREAK_3', condition: streak >= 3 },
      { code: 'STREAK_7', condition: streak >= 7 },
      { code: 'STREAK_14', condition: streak >= 14 },
      { code: 'STREAK_30', condition: streak >= 30 },
      { code: 'STREAK_60', condition: streak >= 60 },
      { code: 'STREAK_100', condition: streak >= 100 },
      { code: 'STREAK_365', condition: streak >= 365 },

      // --- WAVE 2: SKILL & PERFORMANCE (Context Sensitive) ---
      {
        code: 'SPITFIRE',
        condition: context.type === 'SESSION_COMPLETE' && sessionWords >= 150,
      },
      {
        code: 'RAP_GOD',
        condition: context.type === 'SESSION_COMPLETE' && sessionWords >= 300,
      },
      {
        code: 'MARATHON',
        condition:
          context.type === 'SESSION_COMPLETE' && sessionDuration >= 300, // 5 mins
      },
      {
        code: 'ONE_TAKE',
        condition:
          context.type === 'SESSION_COMPLETE' &&
          sessionRestarts === 0 &&
          sessionDuration > 30, // Min duration to prevent cheese
      },
      {
        code: 'SLOW_FLOW',
        condition:
          context.type === 'SESSION_COMPLETE' && sessionFrequency === 4,
      },
      {
        code: 'DOUBLE_TIME',
        condition:
          context.type === 'SESSION_COMPLETE' && sessionFrequency === 16,
      },

      // --- WAVE 2: VOLUME & DEDICATION ---
      { code: 'TIME_1H', condition: totalMinutes >= 60 },
      { code: 'TIME_10H', condition: totalMinutes >= 600 },
      { code: 'TIME_24H', condition: totalMinutes >= 1440 },
      { code: 'TOTAL_WORDS_5K', condition: totalWords >= 5000 },

      // --- WORD VAULT (Unique Collected Words) ---
      { code: 'WORDS_50', condition: collectedWordCount >= 50 },
      { code: 'WORDS_200', condition: collectedWordCount >= 200 },
      { code: 'WORDS_1000', condition: collectedWordCount >= 1000 },

      // --- WAVE 2: EXPLORATION & SOCIAL ---
      { code: 'GENRE_3', condition: uniqueGenres >= 3 },
      // 'GENRE_ALL' would require knowing total available genres, skipping for now
      { code: 'CYPHER_1', condition: cypherCount >= 1 },
      { code: 'CYPHER_10', condition: cypherCount >= 10 },
      { code: 'CYPHER_50', condition: cypherCount >= 50 },

      // --- LIFESTYLE (Time Checks) ---
      {
        code: 'EARLY_BIRD',
        condition:
          context.type === 'SESSION_COMPLETE' && new Date().getHours() < 8,
      },
      {
        code: 'LUNCH_BREAK',
        condition:
          context.type === 'SESSION_COMPLETE' &&
          new Date().getHours() >= 12 &&
          new Date().getHours() < 14,
      },
      {
        code: 'NIGHT_OWL',
        condition:
          context.type === 'SESSION_COMPLETE' && new Date().getHours() >= 23,
      },
      {
        code: 'MIDNIGHT',
        condition:
          context.type === 'SESSION_COMPLETE' &&
          new Date().getHours() >= 0 &&
          new Date().getHours() < 3,
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
        select: { id: true, code: true, name: true },
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

      // Return achievement names (not codes) for user-friendly display
      newlyUnlocked.push(...achievements.map((a) => a.name))
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
