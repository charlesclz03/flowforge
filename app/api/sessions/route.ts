import { NextResponse } from 'next/server'

/**
 * Get sessions endpoint (stub for MVP)
 * In V2, this will fetch from database
 */
export async function GET(request: Request) {
  try {
    // For MVP, return empty array
    // In V2, this will fetch from database
    return NextResponse.json({
      sessions: [],
      message: 'For MVP, sessions are stored client-side only',
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

