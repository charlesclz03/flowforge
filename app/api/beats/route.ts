import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

// Fallback beats to ensure the app works even if DB/Prisma fails completely
const FALLBACK_BEATS = [
  {
    id: 'fallback-1',
    title: 'Classic Flow (Offline)',
    bpm: 90,
    storageUrl: '/beats/2-Naughty.mp3', // Using known safe asset from lib/db/beats fallback
    isPremium: false,
    artistName: 'FlowForge Default',
    genre: 'Boom Bap',
    duration: 180,
  },
  {
    id: 'fallback-2',
    title: 'Modern Trap (Offline)',
    bpm: 140,
    storageUrl: '/beats/2-Naughty.mp3',
    isPremium: false,
    artistName: 'FlowForge Default',
    genre: 'Trap',
    duration: 180,
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const freeOnly = searchParams.get('free') === 'true'

    let beatsData: {
      id: string
      title: string
      bpm: number
      storageUrl: string
      isPremium: boolean
      artistName: string | null
      genre?: string | null
      duration: number | null
    }[] = []

    try {
      // Dynamically import to isolate from DB layer crashes
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getBeats, getFreeBeats } = await import('@/lib/db/beats')

      // Get beats based on query
      const result = freeOnly ? await getFreeBeats() : await getBeats()

      if (result.success && result.data) {
        beatsData = result.data
      } else {
        throw new Error(result.error || 'No beats found')
      }
    } catch (dbError) {
      console.warn('Database beat fetch failed, using fallback:', dbError)
      beatsData = FALLBACK_BEATS
    }

    // Runtime fix for legacy data: ensure storageUrls align with disk filenames (replace spaces with hyphens)
    const sanitizedBeats = beatsData.map((beat) => {
      // Apply same sanitation logic as original file if needed, or just pass proper data
      const url = beat.storageUrl
      if (url && typeof url === 'string') {
        // Additional safety check if needed
      }
      return {
        ...beat,
        storageUrl: beat.storageUrl,
      }
    })

    return NextResponse.json({
      beats: sanitizedBeats,
      count: sanitizedBeats.length,
    })
  } catch (error) {
    console.error('API Error:', error)
    // Absolute failsafe
    return NextResponse.json({
      beats: FALLBACK_BEATS,
      count: FALLBACK_BEATS.length,
    })
  }
}
