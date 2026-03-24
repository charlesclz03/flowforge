import { getBeats } from '@/lib/db/beats'
import { redirectIncompleteProfileSetupIfNeeded } from '@/lib/auth/require-user-session'
import { DifficultySelectionClient } from './DifficultySelectionClient'
import { Beat } from '@/types/database'

// Cache beats for 1 hour to improve TTFB
export const revalidate = 3600

const FALLBACK_BEATS: Beat[] = [
  {
    id: 'fallback-1',
    title: 'Classic Flow (Offline)',
    bpm: 90,
    storageUrl: '/beats/2-Naughty.mp3',
    isPremium: false,
    artistName: 'FreeStyla Default',
    genre: 'Boom Bap',
    duration: 180,
    tags: [],
    difficulty: 'Medium',
    createdAt: new Date(),
    updatedAt: new Date(),
    uploaderId: null,
    coverImage: null,
    label: null,
    offset: 0,
    sortOrder: 0,
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
    tags: [],
    difficulty: 'Medium',
    createdAt: new Date(),
    updatedAt: new Date(),
    uploaderId: null,
    coverImage: null,
    label: null,
    offset: 0,
    sortOrder: 0,
  },
]

// Hardcoded map to guarantee correct file paths
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

export default async function DifficultySelectionPage() {
  await redirectIncompleteProfileSetupIfNeeded('/difficultyselection')
  let beats: Beat[] = []

  try {
    const result = await getBeats()

    if (result.success && result.data && result.data.length > 0) {
      // Apply URL mapping with fallback to sanitization
      beats = result.data.map((beat) => {
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
    } else {
      console.warn('DB returned success but 0 beats. Triggering fallback.')
      throw new Error(result.error || 'No beats found in DB')
    }
  } catch (error) {
    console.warn('Database beat fetch failed, using fallback:', error)
    beats = FALLBACK_BEATS
  }

  return <DifficultySelectionClient initialBeats={beats} />
}
