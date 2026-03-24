import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createServerClient, RECORDINGS_BUCKET } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { isProUser } from '@/lib/subscription/isPro'
import { applyRateLimit } from '@/lib/api-rate-limit'
import {
  buildSessionSaveInput,
  parseRecordingSubmissionRequest,
} from '@/lib/sessions/session-submission'
import { saveSessionWithProgress } from '@/lib/sessions/save-session-with-progress'
import {
  trackReliabilityEvent,
  trackReliabilityException,
} from '@/lib/telemetry/reliability'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Pro hint, Hobby limit remains 10s
const SIGNED_URL_TTL_SECONDS = 60 * 60

function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 })
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

    const parsedSubmission = await parseRecordingSubmissionRequest(
      request,
      session.user.id
    )
    if (parsedSubmission instanceof NextResponse) {
      return parsedSubmission
    }

    const {
      isJsonPayload,
      audioFile,
      beatId,
      title,
      durationSeconds,
      frequency,
      difficulty,
      restarts,
      playbacks,
      beatOffsetMs,
      fileSizeBytes,
      storagePath,
      wordsUsed,
      fxConfig,
    } = parsedSubmission

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

      if (totalUsed + estimatedLegacyUsage + fileSizeBytes > FREE_LIMIT_BYTES) {
        trackReliabilityEvent(
          'recordings_storage_limit_exceeded',
          {
            userRole: session.user.role || 'unknown',
            subscriptionStatus: session.user.subscriptionStatus || 'unknown',
            fileSizeBytes,
          },
          'warning'
        )
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
      trackReliabilityEvent(
        'recordings_legacy_multipart_used',
        {
          mimeType: audioFile.type || 'unknown',
          fileSizeBytes: audioFile.size,
        },
        'warning'
      )
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
        trackReliabilityException(
          uploadError,
          'recordings_storage_upload_failed',
          {
            isJsonPayload,
            fileSizeBytes,
          }
        )
        return serverError('Failed to upload recording')
      }
    }

    const sessionPayload = buildSessionSaveInput({
      userId: session.user.id,
      beatId,
      title,
      mode: 'solo',
      durationSeconds,
      frequency,
      difficulty,
      restarts,
      playbacks,
      beatOffsetMs,
      fileSizeBytes,
      storageUrl: uploadedStoragePath,
      fxConfig,
      wordsUsed,
    })

    if (isJsonPayload) {
      trackReliabilityEvent('recordings_signed_upload_submission', {
        fileSizeBytes,
        durationSeconds,
        wordCount: sessionPayload.wordCount,
        languageMode: 'signed-url-json',
      })
    }

    const [sessionSaveResult, signedUrlRes] = await Promise.all([
      saveSessionWithProgress({
        userId: session.user.id,
        createInput: sessionPayload.createInput,
        wordsUsed: sessionPayload.wordsUsed,
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
      trackReliabilityEvent(
        'recordings_session_save_failed',
        {
          isJsonPayload,
          durationSeconds,
          wordCount: sessionPayload.wordCount,
        },
        'error'
      )
      return serverError('Failed to save session')
    }

    const signedUrl = signedUrlRes.data?.signedUrl || null
    if (!signedUrl) {
      trackReliabilityEvent(
        'recordings_signed_url_missing_after_save',
        {
          isJsonPayload,
          durationSeconds,
          storagePathPresent: Boolean(uploadedStoragePath),
        },
        'warning'
      )
    }

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
    trackReliabilityException(error, 'recordings_post_unhandled_error', {})
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
