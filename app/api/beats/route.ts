import { NextResponse } from 'next/server'
export const revalidate = 3600 // Cache for 1 hour (ISR)

// Fallback beats to ensure the app works even if DB/Prisma fails completely
const FALLBACK_BEATS = [
  {
    id: 'fallback-1',
    title: 'Classic Flow (Offline)',
    bpm: 90,
    storageUrl: '/beats/2-Naughty.mp3', // Using known safe asset from lib/db/beats fallback
    isPremium: false,
    artistName: 'FreeStyla Default',
    genre: 'Boom Bap',
    duration: 180,
  },
  {
    id: 'fallback-2',
    title: 'Modern Trap (Offline)',
    bpm: 140,
    storageUrl: '/beats/2-Naughty.mp3',
    isPremium: false,
    artistName: 'FreeStyla Default',
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

      if (result.success && result.data && result.data.length > 0) {
        beatsData = result.data
      } else {
        console.warn('DB returned success but 0 beats. Triggering fallback.')
        throw new Error(result.error || 'No beats found in DB')
      }
    } catch (dbError) {
      console.warn('Database beat fetch failed, using fallback:', dbError)
      beatsData = FALLBACK_BEATS
    }

    // HARDCODED URL MAP - Guarantees correct file paths regardless of DB state
    // This bypasses all sanitization issues by directly mapping known beats
    const BEAT_URL_MAP: Record<string, string> = {
      '2 Naughty': '/beats/2-Naughty.mp3',
      'Bam Beater': '/beats/Bam-Beater.mp3',
      'Bass Beats Battle': '/beats/Bass-Beats-Battle.mp3',
      Battle: '/beats/Battle-.mp3',
      'Battle Baby': '/beats/Battle-Baby.mp3',
      'Battle Cracker': '/beats/Battle-Cracker.mp3',
      'Battle Made': '/beats/Battle-Made.mp3',
      'Battle Yo': '/beats/Battle-Yo.mp3',
      'Be Battle Be': '/beats/Be-Battle-Be.mp3',
      'Beat Down': '/beats/Beat-Down.mp3',
      'Big Battle Drops': '/beats/Big-Battle-Drops.mp3',
      Breaks: '/beats/Breaks.mp3',
      'FRB 4': '/beats/FRB-4.mp3',
      'FRB 5': '/beats/FRB-5.mp3',
      'FreeStyle Boom': '/beats/FreeStyle-Boom.mp3',
      'Freestyle Battle Beats 01': '/beats/Freestyle-Battle-Beats-01.mp3',
      'Rap Freestyle Underground': '/beats/Rap-Freestyle-Underground-.mp3',
      'Shotgun Boom': '/beats/Shotgun-Boom.mp3',
    }

    // Apply URL mapping with fallback to sanitization
    const sanitizedBeats = beatsData.map((beat) => {
      // First check hardcoded map by title
      const mappedUrl = BEAT_URL_MAP[beat.title]
      if (mappedUrl) {
        return { ...beat, storageUrl: mappedUrl }
      }

      // Fallback: sanitize URL for unknown beats
      let url = beat.storageUrl
      if (url && typeof url === 'string') {
        if (!url.startsWith('/') && !url.startsWith('http')) {
          url = '/' + url
        }
        url = url.trim().replace(/ /g, '-')
      }
      return { ...beat, storageUrl: url }
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
