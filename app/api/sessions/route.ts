import { NextResponse } from 'next/server'
import { createSession, getSessions } from '@/lib/db/sessions'
import { getServerSessionWithUserId } from '@/lib/auth/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createSessionSchema = z.object({
  beatId: z.string().min(1),
  title: z.string().min(1),
  durationSeconds: z.number().int().positive(),
  frequency: z.number().int().positive().default(8),
  difficulty: z.number().int().min(1).max(3).default(2),
  storageUrl: z.string().nullable().optional(),
})

/**
 * Get sessions endpoint (stub for MVP)
 * In V2, this will fetch from database
 */
export async function GET() {
  try {
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getSessions({ userId: session.user.id })
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch sessions' },
        { status: 500 }
      )
    }
    return NextResponse.json({ sessions: result.data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parseResult = createSessionSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.format() },
        { status: 400 }
      )
    }

    const {
      beatId,
      title,
      durationSeconds,
      frequency,
      difficulty,
      storageUrl,
    } = parseResult.data

    const result = await createSession({
      beatId,
      title,
      durationSeconds,
      frequency,
      difficulty,
      userId: session.user.id,
      storageUrl: storageUrl || null,
      score: 0,
      vibe: null,
      mode: 'solo',
      restarts: 0,
      playbacks: 0,
      wordCount: 0,
    } as any) // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create session' },
        { status: 500 }
      )
    }
    return NextResponse.json({ session: result.data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
