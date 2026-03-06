import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { Prisma } from '@prisma/client'
import { applyRateLimit } from '@/lib/api-rate-limit'
import {
  validateJsonRequest,
  sessionCompleteSchema,
} from '@/lib/api-validation'
import { saveSessionWithProgress } from '@/lib/sessions/save-session-with-progress'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 })
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

    const sessionSaveResult = await saveSessionWithProgress({
      userId: session.user.id,
      createInput: {
        userId: session.user.id,
        beatId,
        title: title || 'Freestyle Session',
        storageUrl: null,
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
      },
      wordsUsed,
      achievementType: 'SESSION_COMPLETE',
      logPrefix: 'SESSION_COMPLETE',
    })

    if (!sessionSaveResult.success || !sessionSaveResult.data) {
      return serverError('Failed to save session')
    }

    return NextResponse.json({
      session: {
        ...sessionSaveResult.data.session,
        newBadges: sessionSaveResult.data.newBadges,
        xp: sessionSaveResult.data.xp,
        meta: sessionSaveResult.data.meta,
      },
    })
  } catch (error) {
    console.error('[SESSION_COMPLETE] Unhandled error', error)
    return serverError('Failed to save session')
  }
}
