import { NextResponse } from 'next/server'

/**
 * Legacy endpoint: directing clients to /api/recordings
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        'This endpoint has been deprecated. Please upload audio via POST /api/recordings using FormData.',
    },
    { status: 410 }
  )
}
