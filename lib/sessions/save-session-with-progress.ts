import { createSession } from '@/lib/db/sessions'
import { AchievementSystem } from '@/lib/gamification/achievements'
import { calculateSessionXP, getLevelInfo } from '@/lib/gamification/xp'
import { prisma } from '@/lib/prisma'
import { Prisma, type FreestyleSession } from '@prisma/client'

const STREAK_TIMEOUT_MS = 1500
const GAMIFICATION_TIMEOUT_MS = 3000

interface SaveSessionWithProgressParams {
  userId: string
  createInput: Prisma.FreestyleSessionUncheckedCreateInput
  wordsUsed: string[]
  achievementType: 'RECORDING_SAVED' | 'SESSION_COMPLETE'
  logPrefix: string
}

interface UserProgressSnapshot {
  xp: number
  level: number
  hasRated: boolean
  currentStreak: number
}

interface SessionXPBreakdown {
  base: number
  duration: number
  words: number
  achievements: number
}

interface SessionProgressPayload {
  gained: number
  newLevel: number
  currentXP: number
  maxXP: number
  breakdown: SessionXPBreakdown
}

interface SessionMetaPayload {
  totalSessions: number
  currentStreak: number
  hasRated: boolean
}

interface SaveSessionWithProgressData {
  session: FreestyleSession
  newBadges: string[]
  xp: SessionProgressPayload
  meta: SessionMetaPayload
}

interface SaveSessionWithProgressResult {
  success: boolean
  data?: SaveSessionWithProgressData
  error?: string
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
  logPrefix: string
): Promise<T | null> {
  const safePromise: Promise<T | null> = promise.catch((error) => {
    console.error(`[${logPrefix}] Failed: ${label}`, error)
    return null
  })

  const TIMEOUT = Symbol('timeout')
  const timeout = new Promise<typeof TIMEOUT>((resolve) => {
    setTimeout(() => resolve(TIMEOUT), timeoutMs)
  })

  const result = await Promise.race([safePromise, timeout])
  if (result === TIMEOUT) {
    console.warn(`[${logPrefix}] Timed out: ${label}`)
    return null
  }

  return result as T | null
}

function createDefaultXPData(): SessionProgressPayload {
  return {
    gained: 0,
    newLevel: 1,
    currentXP: 0,
    maxXP: 1000,
    breakdown: {
      base: 0,
      duration: 0,
      words: 0,
      achievements: 0,
    },
  }
}

export async function saveSessionWithProgress({
  userId,
  createInput,
  wordsUsed,
  achievementType,
  logPrefix,
}: SaveSessionWithProgressParams): Promise<SaveSessionWithProgressResult> {
  const sessionResult = await createSession(createInput)

  if (!sessionResult.success || !sessionResult.data) {
    console.error(
      `[${logPrefix}] Failed to create session`,
      sessionResult.error
    )
    return {
      success: false,
      error: 'Failed to save session',
    }
  }

  const totalSessionsPromise = prisma.freestyleSession.count({
    where: { userId },
  })

  const wordCount = Array.isArray(wordsUsed) ? wordsUsed.length : 0
  const uniqueWords = [
    ...new Set(wordsUsed.map((word) => word.toLowerCase().trim())),
  ].filter((word) => word.length > 0)

  let newBadges: string[] = []

  try {
    const { StreakSystem } = await import('@/lib/gamification/streak')
    await withTimeout(
      StreakSystem.checkAndUpdate(userId),
      STREAK_TIMEOUT_MS,
      'streak update',
      logPrefix
    )
  } catch (error) {
    console.error(`[${logPrefix}] Streak update failed`, error)
  }

  try {
    const tasks: Promise<unknown>[] = [
      AchievementSystem.checkAndUnlock(userId, {
        type: achievementType,
        meta: {
          wordCount,
          durationSeconds: createInput.durationSeconds,
          restarts: createInput.restarts ?? 0,
          frequency: createInput.frequency ?? 0,
        },
      }),
    ]

    if (uniqueWords.length > 0) {
      tasks.push(
        prisma.collectedWord.createMany({
          data: uniqueWords.map((word) => ({
            userId,
            wordText: word,
          })),
          skipDuplicates: true,
        })
      )
    }

    const results = await withTimeout(
      Promise.all(tasks),
      GAMIFICATION_TIMEOUT_MS,
      'achievement + word ingestion',
      logPrefix
    )

    newBadges = Array.isArray(results?.[0]) ? (results[0] as string[]) : []
  } catch (error) {
    console.error(`[${logPrefix}] Gamification update failed`, error)
  }

  let xpData = createDefaultXPData()
  let currentUser: UserProgressSnapshot | null = null

  try {
    const xpResult = calculateSessionXP({
      durationSeconds: createInput.durationSeconds,
      wordCount,
      achievementsUnlocked: newBadges.length,
    })

    xpData = {
      gained: xpResult.total,
      newLevel: 1,
      currentXP: xpResult.total,
      maxXP: 1000,
      breakdown: xpResult.breakdown,
    }

    currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        hasRated: true,
        currentStreak: true,
      },
    })

    if (currentUser) {
      const totalXP = (currentUser.xp || 0) + xpResult.total
      const levelInfo = getLevelInfo(totalXP)

      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: totalXP,
          level: levelInfo.level,
        },
      })

      xpData = {
        gained: xpResult.total,
        newLevel: levelInfo.level,
        currentXP: levelInfo.currentXP,
        maxXP: levelInfo.maxXP,
        breakdown: xpResult.breakdown,
      }
    }
  } catch (error) {
    console.error(`[${logPrefix}] XP update failed`, error)
  }

  return {
    success: true,
    data: {
      session: sessionResult.data,
      newBadges,
      xp: xpData,
      meta: {
        totalSessions: (await totalSessionsPromise.catch(() => 0)) || 0,
        currentStreak: currentUser?.currentStreak || 0,
        hasRated: currentUser?.hasRated || false,
      },
    },
  }
}
