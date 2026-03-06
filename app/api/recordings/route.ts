import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createServerClient, RECORDINGS_BUCKET } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { isProUser } from '@/lib/subscription/isPro'
import { applyRateLimit } from '@/lib/api-rate-limit'
import { saveSessionWithProgress } from '@/lib/sessions/save-session-with-progress'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Pro hint, Hobby limit remains 10s
const SIGNED_URL_TTL_SECONDS = 60 * 60

function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 })
}

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
export async function POST(request: NextRequest) {
  try {
    // Rate limit: upload tier (5 req/min)
    const blocked = applyRateLimit(request, 'upload')
    if (blocked) return blocked

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
        return serverError('Failed to upload recording')
      }
    }

    const [sessionSaveResult, signedUrlRes] = await Promise.all([
      saveSessionWithProgress({
        userId: session.user.id,
        createInput: {
          userId: session.user.id,
          beatId,
          title,
          storageUrl: uploadedStoragePath,
          fileSizeBytes: fileSize,
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
        },
        wordsUsed: words,
        achievementType: 'RECORDING_SAVED',
        logPrefix: 'RECORDINGS_POST',
      }),
      supabase.storage
        .from(RECORDINGS_BUCKET)
        .createSignedUrl(uploadedStoragePath, SIGNED_URL_TTL_SECONDS),
    ])

    if (!sessionSaveResult.success || !sessionSaveResult.data) {
      await supabase.storage
        .from(RECORDINGS_BUCKET)
        .remove([uploadedStoragePath])
      return serverError('Failed to save session')
    }

    const signedUrl = signedUrlRes.data?.signedUrl || null

    return NextResponse.json({
      session: {
        ...sessionSaveResult.data.session,
        storageUrl: signedUrl,
        newBadges: sessionSaveResult.data.newBadges,
        xp: sessionSaveResult.data.xp,
        meta: sessionSaveResult.data.meta,
      },
      storageUrl: signedUrl,
    })
  } catch (error) {
    console.error('[RECORDINGS_POST] Unhandled error', error)
    return serverError('Failed to save session')
  }
}

/**
 * GET /api/recordings
 * Get all recordings for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limit: standard tier (60 req/min)
    const blocked = applyRateLimit(request, 'standard')
    if (blocked) return blocked

    // Check authentication
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { getSessions } = await import('@/lib/db/sessions')
    const result = await getSessions({ userId: session.user.id })

    if (!result.success) {
      console.error('[RECORDINGS_GET] Failed to fetch recordings', result.error)
      return serverError('Failed to fetch recordings')
    }

    const includeMetadata =
      new URL(request.url).searchParams.get('includeMetadata') === 'true'

    const sourceRecordings = includeMetadata
      ? result.data || []
      : (result.data || []).filter((recording) => Boolean(recording.storageUrl))

    const supabase = createServerClient()

    const pathsToSign = sourceRecordings
      .map((recording) => recording.storageUrl)
      .filter((storageUrl): storageUrl is string => Boolean(storageUrl))
      .filter((storageUrl) => !storageUrl.startsWith('http'))
      .map((storageUrl) => storageUrl.replace(/^\/+/, ''))

    const signedUrlByPath = new Map<string, string>()

    if (pathsToSign.length > 0) {
      const { data: signedUrls, error: signedUrlsError } =
        await supabase.storage
          .from(RECORDINGS_BUCKET)
          .createSignedUrls(pathsToSign, SIGNED_URL_TTL_SECONDS)

      if (signedUrlsError) {
        console.error('Failed to create signed URLs:', signedUrlsError)
      } else {
        for (const item of signedUrls) {
          if (item.path && item.signedUrl) {
            signedUrlByPath.set(item.path, item.signedUrl)
          }
        }
      }
    }

    const recordingsWithSignedUrls = sourceRecordings.map((recording) => {
      if (!recording.storageUrl) {
        return {
          ...recording,
          audioStatus: 'stats-only' as const,
        }
      }

      if (recording.storageUrl.startsWith('http')) {
        return {
          ...recording,
          audioStatus: 'ready' as const,
        }
      }

      const normalizedPath = recording.storageUrl.replace(/^\/+/, '')
      const signedUrl = signedUrlByPath.get(normalizedPath)

      if (signedUrl) {
        return {
          ...recording,
          storageUrl: signedUrl,
          audioStatus: 'ready' as const,
        }
      }

      // Storage path exists but signed URL is not ready yet (recent upload or
      // transient signing miss). Keep session visible as processing.
      return {
        ...recording,
        storageUrl: null,
        audioStatus: 'processing' as const,
      }
    })

    return NextResponse.json({
      recordings: recordingsWithSignedUrls,
      count: recordingsWithSignedUrls.length,
    })
  } catch (error) {
    console.error('[RECORDINGS_GET] Unhandled error', error)
    return serverError('Failed to fetch recordings')
  }
}
