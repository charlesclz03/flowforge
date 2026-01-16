import { NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { createServerClient, RECORDINGS_BUCKET } from '@/lib/supabase/server'
import { createSession } from '@/lib/db/sessions'
import { randomUUID } from 'crypto'
import { AchievementSystem } from '@/lib/gamification/achievements'
import { prisma } from '@/lib/prisma'
import { calculateSessionXP, getLevelInfo } from '@/lib/gamification/xp'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Pro hint, Hobby limit remains 10s
const SIGNED_URL_TTL_SECONDS = 60 * 60

// Temp interface to handle Prisma type lag
interface UserWithRate {
  xp: number
  level: number
  hasRated: boolean
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
        wordCount,
      } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
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

    const signedUrl = signedUrlRes.data?.signedUrl || null

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

      currentUser = (await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true, level: true, hasRated: true } as any,
      })) as UserWithRate | null

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
