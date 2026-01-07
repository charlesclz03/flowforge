import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getBeats, getFreeBeats } from '@/lib/db/beats'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const freeOnly = searchParams.get('free') === 'true'

    // Get beats based on query
    const result = freeOnly ? await getFreeBeats() : await getBeats()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch beats' },
        { status: 500 }
      )
    }

    // Runtime fix for legacy data: ensure storageUrls align with disk filenames (replace spaces with hyphens)
    const sanitizedBeats = result.data?.map((beat) => ({
      ...beat,
      storageUrl: beat.storageUrl,
    }))

    return NextResponse.json({
      beats: sanitizedBeats,
      count: sanitizedBeats?.length || 0,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
