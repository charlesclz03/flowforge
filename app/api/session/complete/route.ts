import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createSession } from '@/lib/db/sessions'
import { AchievementSystem } from '@/lib/gamification/achievements'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { calculateSessionXP, getLevelInfo } from '@/lib/gamification/xp'

export const dynamic = 'force-dynamic'

interface UserWithRate {
  xp: number
  level: number
  hasRated: boolean
  currentStreak?: number
}

function parseOptionalInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null

    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed)) return null

    return Math.trunc(parsed)
  }

  return null
}

/**
 * POST /api/session/complete
 * Submit a session result without a recording (metadata only).
 * Triggers XP, Streak, and Achievement updates.
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse JSON body
    const body = (await request.json()) as Record<string, unknown>

    const beatId = typeof body.beatId === 'string' ? body.beatId : ''
    const title = typeof body.title === 'string' ? body.title : undefined
    const mode = typeof body.mode === 'string' ? body.mode : 'solo'

    const durationSeconds = parseOptionalInt(body.durationSeconds)
    const frequencyRaw = parseOptionalInt(body.frequency)
    const difficultyRaw = parseOptionalInt(body.difficulty)
    const restartsRaw = parseOptionalInt(body.restarts)
    const baseWordCountRaw = parseOptionalInt(body.baseWordCount)

    const frequency = frequencyRaw ?? 8
    const difficulty = difficultyRaw ?? 2
    const restarts = Math.max(0, restartsRaw ?? 0)
    const baseWordCount = Math.max(0, baseWordCountRaw ?? 0)

    const wordsUsedRaw = body.wordsUsed
    const wordsUsed = Array.isArray(wordsUsedRaw)
      ? wordsUsedRaw.filter((w): w is string => typeof w === 'string')
      : []

    // Validate required fields
    if (!beatId || durationSeconds === null || durationSeconds <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields: beatId, durationSeconds' },
        { status: 400 }
      )
    }

    // Calculate Word Count
    const words = Array.isArray(wordsUsed) ? wordsUsed : []
    const wordCount = words.length > 0 ? words.length : baseWordCount

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
      console.error('[SESSION_COMPLETE] Failed to create session:', sessRes.error)
      return NextResponse.json(
        { error: 'Failed to save session' },
        { status: 500 }
      )
    }

    // 2. Gamification Logic (Mirrors /recordings route)
    let newBadges: string[] = []
    try {
      const uniqueWords = [
        ...new Set(words.map((w: string) => w.toLowerCase().trim())),
      ].filter((w) => w.length > 0)

      // A. Update Streak
      try {
        const { StreakSystem } = await import('@/lib/gamification/streak')
        await StreakSystem.checkAndUpdate(session.user.id)
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

      const results = await Promise.all(tasks)
      newBadges = (results[0] as string[]) || []
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
          totalSessions: await prisma.freestyleSession.count({
            where: { userId: session.user.id },
          }),
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
