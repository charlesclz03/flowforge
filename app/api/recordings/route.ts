import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createServerClient, RECORDINGS_BUCKET } from '@/lib/supabase/server'
import { createSession } from '@/lib/db/sessions'
import { randomUUID } from 'crypto'
import { AchievementSystem } from '@/lib/gamification/achievements'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Pro hint, Hobby limit remains 10s
const SIGNED_URL_TTL_SECONDS = 60 * 60

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

    // Parse form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const beatId = formData.get('beatId') as string
    const title = formData.get('title') as string
    const durationSeconds = parseInt(formData.get('durationSeconds') as string)
    const frequency = parseInt(formData.get('frequency') as string) || 8
    const difficulty = parseInt(formData.get('difficulty') as string) || 2
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

    // PRE-CALCULATE SCORE & PREP DATA
    const wordsUsedRaw = formData.get('wordsUsed') as string
    let words: string[] = []
    try {
      words = wordsUsedRaw ? (JSON.parse(wordsUsedRaw) as string[]) : []
    } catch {
      words = []
    }
    const wordCount = Array.isArray(words) ? words.length : 0
    const serverScore = Math.round(durationSeconds * 10 * (1 + wordCount / 10))

    // Generate recording ID
    const recordingId = randomUUID()
    const filePath = `${session.user.id}/${recordingId}.webm`

    // Upload to Supabase Storage (Blocking)
    const supabase = createServerClient()
    const { error: uploadError } = await supabase.storage
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

    // PARALLEL OPERATIONS: DB Creation + Signed URL
    const [sessRes, signedUrlRes] = await Promise.all([
      createSession({
        userId: session.user.id,
        beatId,
        title,
        storageUrl: filePath,
        durationSeconds,
        frequency,
        difficulty,
        score: serverScore,
        vibe: null,
        mode: 'solo',
        restarts,
        playbacks,
      }),
      supabase.storage
        .from(RECORDINGS_BUCKET)
        .createSignedUrl(filePath, SIGNED_URL_TTL_SECONDS),
    ])

    if (!sessRes.success) {
      // Cleanup storage if DB fails
      await supabase.storage.from(RECORDINGS_BUCKET).remove([filePath])
      return NextResponse.json(
        { error: sessRes.error || 'Failed to save session' },
        { status: 500 }
      )
    }

    const signedUrl = signedUrlRes.data?.signedUrl || filePath

    // NON-BLOCKING (ish) / PARALLEL FEEDBACK: Achievements & Words
    let newBadges: string[] = []
    try {
      const uniqueWords = [
        ...new Set(words.map((w) => w.toLowerCase().trim())),
      ].filter((w) => w.length > 0)

      // Use explicit any for tasks to avoid complex type intersection issues in Promise.all
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tasks: Promise<any>[] = [
        AchievementSystem.checkAndUnlock(session.user.id, {
          type: 'RECORDING_SAVED',
        }),
        import('@/lib/gamification/streak').then(({ StreakSystem }) =>
          StreakSystem.checkAndUpdate(session.user.id)
        ),
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

    return NextResponse.json({
      session: {
        ...sessRes.data,
        storageUrl: signedUrl,
        newBadges,
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
