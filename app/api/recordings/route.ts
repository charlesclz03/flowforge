import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createServerClient, RECORDINGS_BUCKET } from '@/lib/supabase/server'
import { createSession } from '@/lib/db/sessions'
import { randomUUID } from 'crypto'
import { AchievementSystem } from '@/lib/gamification/achievements'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { calculateSessionXP, getLevelInfo } from '@/lib/gamification/xp'
import { isProUser } from '@/lib/subscription/isPro'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Pro hint, Hobby limit remains 10s
const SIGNED_URL_TTL_SECONDS = 60 * 60

function parseOptionalInt(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return fallback
    const parsed = Number(trimmed)
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed)
    }
  }

  return fallback
}

/**
 * POST /api/recordings
 * Upload a recording and create a session
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    const isJsonPayload = contentType.includes('application/json')

    let audioFile: File | null = null
    let beatId = ''
    let title = ''
    let durationSeconds = 0
    let frequency = 8
    let difficulty = 2
    let restarts = 0
    let playbacks = 0
    let beatOffsetMs = 0
    let fileSize = 0
    let storagePath = ''
    let fxConfig: unknown = null
    let words: string[] = []

    if (isJsonPayload) {
      const body = (await request.json()) as Record<string, unknown>

      beatId = typeof body.beatId === 'string' ? body.beatId : ''
      title = typeof body.title === 'string' ? body.title : ''
      durationSeconds = parseOptionalInt(body.durationSeconds)
      frequency = parseOptionalInt(body.frequency, 8)
      difficulty = parseOptionalInt(body.difficulty, 2)
      restarts = parseOptionalInt(body.restarts, 0)
      playbacks = parseOptionalInt(body.playbacks, 0)
      beatOffsetMs = parseOptionalInt(body.beatOffsetMs, 0)
      fileSize = parseOptionalInt(body.fileSizeBytes, 0)
      storagePath =
        typeof body.storagePath === 'string' ? body.storagePath.trim() : ''

      if (Array.isArray(body.wordsUsed)) {
        words = body.wordsUsed.filter(
          (value): value is string => typeof value === 'string'
        )
      } else if (typeof body.wordsUsed === 'string') {
        try {
          const parsedWords = JSON.parse(body.wordsUsed) as unknown
          words = Array.isArray(parsedWords)
            ? parsedWords.filter(
                (value): value is string => typeof value === 'string'
              )
            : []
        } catch {
          words = []
        }
      }

      if (body.fxConfig && typeof body.fxConfig === 'object') {
        fxConfig = body.fxConfig
      }
    } else {
      const formData = await request.formData()
      audioFile = formData.get('audio') as File
      beatId = (formData.get('beatId') as string) || ''
      title = (formData.get('title') as string) || ''
      durationSeconds = parseOptionalInt(formData.get('durationSeconds'))
      frequency = parseOptionalInt(formData.get('frequency'), 8)
      difficulty = parseOptionalInt(formData.get('difficulty'), 2)
      restarts = parseOptionalInt(formData.get('restarts'), 0)
      playbacks = parseOptionalInt(formData.get('playbacks'), 0)
      beatOffsetMs = parseOptionalInt(formData.get('beatOffsetMs'), 0)
      fileSize = audioFile?.size ?? 0

      const fxConfigRaw = formData.get('fxConfig') as string
      if (fxConfigRaw) {
        try {
          fxConfig = JSON.parse(fxConfigRaw)
        } catch (e) {
          console.warn('Failed to parse fxConfig', e)
        }
      }

      const wordsUsedRaw = formData.get('wordsUsed') as string
      if (wordsUsedRaw) {
        try {
          const parsedWords = JSON.parse(wordsUsedRaw) as unknown
          words = Array.isArray(parsedWords)
            ? parsedWords.filter(
                (value): value is string => typeof value === 'string'
              )
            : []
        } catch {
          words = []
        }
      }
    }

    // Validate required fields
    if (!beatId || !title || durationSeconds <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields: beatId, title, durationSeconds' },
        { status: 400 }
      )
    }

    if (isJsonPayload) {
      if (!storagePath || fileSize <= 0) {
        return NextResponse.json(
          { error: 'Missing required fields: storagePath, fileSizeBytes' },
          { status: 400 }
        )
      }

      const expectedPrefix = `users/${session.user.id}/`
      if (!storagePath.startsWith(expectedPrefix)) {
        return NextResponse.json(
          { error: 'Invalid storagePath for current user' },
          { status: 400 }
        )
      }
    } else if (!audioFile) {
      return NextResponse.json(
        { error: 'Missing required field: audio' },
        { status: 400 }
      )
    }

    // PRE-CALCULATE SCORE & PREP DATA
    const wordCount = Array.isArray(words) ? words.length : 0
    const serverScore = Math.round(durationSeconds * 10 * (1 + wordCount / 10))

    // STORAGE LIMIT CHECK (For Free / Non-Pro Users)
    const FREE_LIMIT_BYTES = 0 // 0MB (Free users cannot save)
    const canStoreRecording = isProUser({
      subscriptionStatus: session.user.subscriptionStatus,
      role: session.user.role,
    })

    // Fetch current usage only for users who are not Pro / Superadmin
    if (!canStoreRecording) {
      const currentUsage = await prisma.freestyleSession.aggregate({
        where: { userId: session.user.id },
        _sum: { fileSizeBytes: true },
      })

      const totalUsed = currentUsage._sum.fileSizeBytes || 0
      const estimatedLegacyUsage = await prisma.freestyleSession
        .count({
          where: { userId: session.user.id, fileSizeBytes: null },
        })
        .then((count) => count * (60 * 16384)) // Estimate ~1MB per minute (approx)

      if (totalUsed + estimatedLegacyUsage + fileSize > FREE_LIMIT_BYTES) {
        return NextResponse.json(
          {
            error:
              'Storage Limit Exceeded. Please upgrade to Pro or delete old recordings.',
          },
          { status: 403 }
        )
      }
    }

    const supabase = createServerClient()
    let uploadedStoragePath = storagePath

    if (!isJsonPayload && audioFile) {
      // Legacy multipart flow: upload server-side
      const recordingId = randomUUID()
      uploadedStoragePath = `users/${session.user.id}/${recordingId}.webm`
      const { error: uploadError } = await supabase.storage
        .from(RECORDINGS_BUCKET)
        .upload(uploadedStoragePath, audioFile, {
          contentType: audioFile.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        return NextResponse.json(
          { error: `Failed to upload recording: ${uploadError.message}` },
          { status: 500 }
        )
      }
    }

    // PARALLEL OPERATIONS: DB Creation + Signed URL
    const [sessRes, signedUrlRes] = await Promise.all([
      createSession({
        userId: session.user.id,
        beatId,
        title,
        storageUrl: uploadedStoragePath,
        fileSizeBytes: fileSize, // Save file size
        durationSeconds,
        frequency,
        difficulty,
        score: serverScore,
        vibe: null,
        mode: 'solo',
        restarts,
        playbacks,
        wordCount,
        beatOffsetMs,
        fxConfig: fxConfig || Prisma.DbNull,
      }),
      supabase.storage
        .from(RECORDINGS_BUCKET)
        .createSignedUrl(uploadedStoragePath, SIGNED_URL_TTL_SECONDS),
    ])

    if (!sessRes.success) {
      // Cleanup storage if DB fails
      await supabase.storage
        .from(RECORDINGS_BUCKET)
        .remove([uploadedStoragePath])
      return NextResponse.json(
        { error: sessRes.error || 'Failed to save session' },
        { status: 500 }
      )
    }

    const signedUrl = signedUrlRes.data?.signedUrl || null

    // NON-BLOCKING (ish) / PARALLEL FEEDBACK: Achievements & Words
    let newBadges: string[] = []
    try {
      const uniqueWords = [
        ...new Set(words.map((w) => w.toLowerCase().trim())),
      ].filter((w) => w.length > 0)

      // 1. Update Streak FIRST (Blocking for Gamification Logic)
      try {
        const { StreakSystem } = await import('@/lib/gamification/streak')
        await StreakSystem.checkAndUpdate(session.user.id)
      } catch (e) {
        console.error('[GAMIFICATION] Streak update failed:', e)
      }

      // 2. Check Achievements (Now that user stats are fresh)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tasks: Promise<any>[] = [
        AchievementSystem.checkAndUnlock(session.user.id, {
          type: 'RECORDING_SAVED',
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
      console.error('Secondary ingestion/gamification failed:', e)
    }

    // --- XP CALCULATION & LEVEL UPDATE ---
    let xpData = {
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

    let currentUser = null
    try {
      // Calculate XP
      const xpResult = calculateSessionXP({
        durationSeconds,
        wordCount,
        achievementsUnlocked: newBadges.length,
      })

      // Default response with gained XP (so user sees progress even if DB save fails)
      xpData = {
        gained: xpResult.total,
        newLevel: 1, // Fallback
        currentXP: xpResult.total, // Ensure bar animates from 0 -> total
        maxXP: 1000, // Fallback
        breakdown: xpResult.breakdown,
      }

      // Fetch current user XP
      console.log(`[XP_UPDATE] Starting update for user: ${session.user.id}`)

      currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          xp: true,
          level: true,
          hasRated: true,
          currentStreak: true,
        },
      })

      if (currentUser) {
        console.log(
          `[XP_UPDATE] User found found. Current XP: ${currentUser.xp}, Level: ${currentUser.level}`
        )

        const totalXP = (currentUser.xp || 0) + xpResult.total
        const levelInfo = getLevelInfo(totalXP)

        console.log(
          `[XP_UPDATE] New Totals - XP: ${totalXP}, Level: ${levelInfo.level}`
        )

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
      } else {
        console.warn(
          `[XP_UPDATE] User ${session.user.id} not found in public.users table. XP not saved.`
        )
      }
    } catch (err) {
      console.error(
        'XP update failed. Possible causes: DB Schema mismatch, missing User record, or connection issue.',
        err
      )
      if (err instanceof Error) console.error(err.stack)
    }

    return NextResponse.json({
      session: {
        ...sessRes.data,
        storageUrl: signedUrl,
        newBadges,
        xp: xpData, // Return XP data to client
        meta: {
          totalSessions: await prisma.freestyleSession.count({
            where: { userId: session.user.id },
          }),
          currentStreak: currentUser?.currentStreak || 0, // Pass actual streak
          hasRated: currentUser?.hasRated || false,
        },
      },
      storageUrl: signedUrl,
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

/**
 * GET /api/recordings
 * Get all recordings for the current user
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { getSessions } = await import('@/lib/db/sessions')
    const result = await getSessions({ userId: session.user.id })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch recordings' },
        { status: 500 }
      )
    }

    const includeMetadata =
      new URL(request.url).searchParams.get('includeMetadata') === 'true'

    const sourceRecordings = includeMetadata
      ? result.data || []
      : (result.data || []).filter((recording) => Boolean(recording.storageUrl))

    const supabase = createServerClient()
    const recordingsWithSignedUrls = await Promise.all(
      sourceRecordings.map(async (recording) => {
        if (!recording.storageUrl) return recording

        if (recording.storageUrl.startsWith('http')) {
          return recording
        }

        const { data: signedUrlData } = await supabase.storage
          .from(RECORDINGS_BUCKET)
          .createSignedUrl(recording.storageUrl, SIGNED_URL_TTL_SECONDS)

        return {
          ...recording,
          storageUrl: signedUrlData?.signedUrl ?? null,
        }
      })
    )

    return NextResponse.json({
      recordings: recordingsWithSignedUrls,
      count: recordingsWithSignedUrls.length,
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
