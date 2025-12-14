import { NextResponse } from 'next/server'
import { createSession, getSessions } from '@/lib/db/sessions'
import { getServerSessionWithUserId } from '@/lib/auth/server'
export const dynamic = 'force-dynamic'

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSessionWithUserId()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      beatId,
      title,
      durationSeconds,
      frequency = 8,
      difficulty = 2,
      storageUrl = null,
    } = body || {}
    if (!beatId || !title || !durationSeconds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const result = await createSession({
      beatId,
      title,
      durationSeconds,
      frequency,
      difficulty,
      userId: session.user.id,
      storageUrl,
    })
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create session' },
        { status: 500 }
      )
    }
    return NextResponse.json({ session: result.data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
