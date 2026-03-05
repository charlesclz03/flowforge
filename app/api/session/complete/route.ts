import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createSession } from '@/lib/db/sessions'
import { AchievementSystem } from '@/lib/gamification/achievements'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { calculateSessionXP, getLevelInfo } from '@/lib/gamification/xp'
import { applyRateLimit } from '@/lib/api-rate-limit'
import {
  validateJsonRequest,
  sessionCompleteSchema,
} from '@/lib/api-validation'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface UserWithRate {
  xp: number
  level: number
  hasRated: boolean
  currentStreak?: number
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T | null> {
  const safePromise: Promise<T | null> = promise.catch((error) => {
    console.error(`[SESSION_COMPLETE] Failed: ${label}`, error)
    return null
  })

  const TIMEOUT = Symbol('timeout')
  const timeout = new Promise<typeof TIMEOUT>((resolve) => {
    setTimeout(() => resolve(TIMEOUT), timeoutMs)
  })

  const result = await Promise.race([safePromise, timeout])
  if (result === TIMEOUT) {
    console.warn(`[SESSION_COMPLETE] Timed out: ${label}`)
    return null
  }
  return result as T | null
}

/**
 * POST /api/session/complete
 * Submit a session result without a recording (metadata only).
 * Triggers XP, Streak, and Achievement updates.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: mutation tier (20 req/min)
    const blocked = applyRateLimit(request, 'mutation')
    if (blocked) return blocked

    // Check authentication
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Zod validation
    const parsedBody = await validateJsonRequest(request, sessionCompleteSchema)
    if (parsedBody instanceof NextResponse) return parsedBody

    const {
      beatId,
      title,
      mode,
      durationSeconds,
      frequency,
      difficulty,
      restarts,
      baseWordCount,
      wordsUsed,
    } = parsedBody

    // Calculate Word Count
    const wordCount = wordsUsed.length > 0 ? wordsUsed.length : baseWordCount

    // Calculate Server Score (for validation/anti-cheat)
    const serverScore = Math.round(durationSeconds * 10 * (1 + wordCount / 10))

    // 1. Create Session Record (No Storage URL)
    const sessRes = await createSession({
      userId: session.user.id,
      beatId,
      title: title || 'Freestyle Session',
      storageUrl: null, // No recording
      fileSizeBytes: 0,
      durationSeconds,
      frequency,
      difficulty,
      score: serverScore,
      vibe: null,
      mode,
      restarts,
      playbacks: 0,
      wordCount,
      beatOffsetMs: 0,
      fxConfig: Prisma.DbNull,
    })

    if (!sessRes.success) {
      console.error(
        '[SESSION_COMPLETE] Failed to create session:',
        sessRes.error
      )
      return NextResponse.json(
        { error: 'Failed to save session' },
        { status: 500 }
      )
    }

    const totalSessionsPromise = prisma.freestyleSession.count({
      where: { userId: session.user.id },
    })

    // 2. Gamification Logic (Mirrors /recordings route)
    let newBadges: string[] = []
    try {
      const uniqueWords = [
        ...new Set(wordsUsed.map((w: string) => w.toLowerCase().trim())),
      ].filter((w) => w.length > 0)

      // A. Update Streak
      try {
        const { StreakSystem } = await import('@/lib/gamification/streak')
        await withTimeout(
          StreakSystem.checkAndUpdate(session.user.id),
          1500,
          'streak update'
        )
      } catch (e) {
        console.error('[GAMIFICATION] Streak update failed:', e)
      }

      // B. Check Achievements
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tasks: Promise<any>[] = [
        AchievementSystem.checkAndUnlock(session.user.id, {
          type: 'SESSION_COMPLETE', // Different context than RECORDING_SAVED
          meta: {
            wordCount,
            durationSeconds,
            restarts,
            frequency,
          },
        }),
      ]

      if (uniqueWords.length > 0) {
        tasks.push(
          prisma.collectedWord.createMany({
            data: uniqueWords.map((word) => ({
              userId: session.user.id,
              wordText: word,
            })),
            skipDuplicates: true,
          })
        )
      }

      const results = await withTimeout(
        Promise.all(tasks),
        3000,
        'achievement + word ingestion'
      )
      newBadges = (results?.[0] as string[]) || []
    } catch (e) {
      console.error('Gamification update failed:', e)
    }

    // 3. XP Calculation
    let xpData = {
      gained: 0,
      newLevel: 1,
      currentXP: 0,
      maxXP: 1000,
      breakdown: { base: 0, duration: 0, words: 0, achievements: 0 },
    }

    let currentUser = null
    try {
      const xpResult = calculateSessionXP({
        durationSeconds,
        wordCount,
        achievementsUnlocked: newBadges.length,
      })

      // Default response
      xpData = {
        gained: xpResult.total,
        newLevel: 1,
        currentXP: xpResult.total,
        maxXP: 1000,
        breakdown: xpResult.breakdown,
      }

      // Fetch User
      currentUser = (await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          xp: true,
          level: true,
          hasRated: true,
          currentStreak: true,
        },
      })) as UserWithRate | null

      if (currentUser) {
        const totalXP = (currentUser.xp || 0) + xpResult.total
        const levelInfo = getLevelInfo(totalXP)

        // Update User
        await prisma.user.update({
          where: { id: session.user.id },
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
    } catch (err) {
      console.error('XP update failed:', err)
    }

    return NextResponse.json({
      session: {
        ...sessRes.data,
        newBadges,
        xp: xpData,
        meta: {
          totalSessions: (await totalSessionsPromise.catch(() => 0)) || 0,
          currentStreak: currentUser?.currentStreak || 0,
          hasRated: currentUser?.hasRated || false,
        },
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
