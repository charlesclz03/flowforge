import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createServerClient, RECORDINGS_BUCKET } from '@/lib/supabase/server'
import { createSession } from '@/lib/db/sessions'
import { randomUUID } from 'crypto'
import { AchievementSystem } from '@/lib/gamification/achievements'

export const dynamic = 'force-dynamic'
const SIGNED_URL_TTL_SECONDS = 60 * 60

/**
 * POST /api/recordings
 * Upload a recording and create a session
 */
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const beatId = formData.get('beatId') as string
    const title = formData.get('title') as string
    const durationSeconds = parseInt(formData.get('durationSeconds') as string)
    const frequency = parseInt(formData.get('frequency') as string) || 8
    const difficulty = parseInt(formData.get('difficulty') as string) || 2
    const score = parseInt(formData.get('score') as string) || 0
    const vibe = (formData.get('vibe') as string) || null
    const restarts = parseInt(formData.get('restarts') as string) || 0
    const playbacks = parseInt(formData.get('playbacks') as string) || 0

    // Validate required fields
    if (!audioFile || !beatId || !title || !durationSeconds) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: audio, beatId, title, durationSeconds',
        },
        { status: 400 }
      )
    }

    // Generate recording ID
    const recordingId = randomUUID()
    const filePath = `${session.user.id}/${recordingId}.webm`

    // Upload to Supabase Storage
    const supabase = createServerClient()
    const { data: _uploadData, error: uploadError } = await supabase.storage
      .from(RECORDINGS_BUCKET)
      .upload(filePath, audioFile, {
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

    // Generate a signed URL for temporary access
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from(RECORDINGS_BUCKET)
        .createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS)

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError)
      // Clean up uploaded file if we can't issue a signed URL
      await supabase.storage.from(RECORDINGS_BUCKET).remove([filePath])
      return NextResponse.json(
        { error: 'Failed to generate download URL for recording' },
        { status: 500 }
      )
    }

    // Create session record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionResult = await createSession({
      userId: session.user.id,
      beatId,
      title,
      storageUrl: filePath,
      durationSeconds,
      frequency,
      difficulty,
      score,
      vibe: vibe || null,
      mode: 'solo',
      restarts,
      playbacks,
    })

    if (!sessionResult.success) {
      // Rollback storage if DB fails
      const supabase = createServerClient()
      await supabase.storage.from(RECORDINGS_BUCKET).remove([filePath])
      return NextResponse.json(
        { error: sessionResult.error || 'Failed to save session' },
        { status: 500 }
      )
    }

    // Word Vault: Ingest used words
    const wordsUsedRaw = formData.get('wordsUsed') as string
    if (wordsUsedRaw) {
      try {
        const words = JSON.parse(wordsUsedRaw) as string[]
        if (Array.isArray(words) && words.length > 0) {
          // Deduplicate and sanitize
          const uniqueWords = [
            ...new Set(words.map((w) => w.toLowerCase().trim())),
          ].filter((w) => w.length > 0)

          if (uniqueWords.length > 0) {
            await prisma.collectedWord.createMany({
              data: uniqueWords.map((word) => ({
                userId: session.user.id,
                wordText: word,
              })),
              skipDuplicates: true,
            })
          }
        }

        // Check for Achievements
        await AchievementSystem.checkAndUnlock(session.user.id, {
          type: 'RECORDING_SAVED',
        })

        // Update Streak
        const { StreakSystem } = await import('@/lib/gamification/streak')
        await StreakSystem.checkAndUpdate(session.user.id)
      } catch (e) {
        console.error('Word Vault/Achievement ingestion failed', e)
      }
    }

    return NextResponse.json({
      session: sessionResult.data
        ? { ...sessionResult.data, storageUrl: signedUrlData.signedUrl }
        : null,
      storageUrl: signedUrlData.signedUrl,
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
export async function GET() {
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

    const supabase = createServerClient()
    const recordingsWithSignedUrls = await Promise.all(
      (result.data || []).map(async (recording) => {
        if (!recording.storageUrl) return recording

        if (recording.storageUrl.startsWith('http')) {
          return recording
        }

        const { data: signedUrlData } = await supabase.storage
          .from(RECORDINGS_BUCKET)
          .createSignedUrl(recording.storageUrl, SIGNED_URL_TTL_SECONDS)

        return {
          ...recording,
          storageUrl: signedUrlData?.signedUrl ?? recording.storageUrl,
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
