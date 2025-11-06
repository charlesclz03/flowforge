import { NextResponse } from 'next/server'
import { createSession, getSessions } from '@/lib/db/sessions'
export const dynamic = 'force-dynamic'

/**
 * Get sessions endpoint (stub for MVP)
 * In V2, this will fetch from database
 */
export async function GET() {
  try {
    const result = await getSessions()
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
    const body = await request.json()
    const {
      beatId,
      title,
      durationSeconds,
      frequency = 8,
      difficulty = 2,
      userId = null,
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
      userId,
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
