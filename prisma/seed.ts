import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Word data with difficulty levels
import { expandedWords } from './expanded-words'

const frWords = [
  { wordText: 'rime', syllableCount: 1, difficultyLevel: 1, category: 'noun' },
  {
    wordText: 'flamme',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'scene',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  { wordText: 'voix', syllableCount: 1, difficultyLevel: 1, category: 'noun' },
  {
    wordText: 'style',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'phase',
    syllableCount: 1,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'energie',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'rythme',
    syllableCount: 1,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'vision',
    syllableCount: 2,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'horizon',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'respect',
    syllableCount: 2,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'ambition',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'determination',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'imagination',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'vibration',
    syllableCount: 3,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'authentique',
    syllableCount: 3,
    difficultyLevel: 3,
    category: 'adjective',
  },
  {
    wordText: 'transformation',
    syllableCount: 4,
    difficultyLevel: 3,
    category: 'noun',
  },
]

const ptWords = [
  { wordText: 'rima', syllableCount: 2, difficultyLevel: 1, category: 'noun' },
  { wordText: 'voz', syllableCount: 1, difficultyLevel: 1, category: 'noun' },
  {
    wordText: 'pulso',
    syllableCount: 2,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'ritmo',
    syllableCount: 2,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'chama',
    syllableCount: 2,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'forca',
    syllableCount: 2,
    difficultyLevel: 1,
    category: 'noun',
  },
  {
    wordText: 'energia',
    syllableCount: 4,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'visao',
    syllableCount: 2,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'caminho',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'batida',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'proposito',
    syllableCount: 4,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'respeito',
    syllableCount: 3,
    difficultyLevel: 2,
    category: 'noun',
  },
  {
    wordText: 'determinacao',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'transformacao',
    syllableCount: 4,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'autenticidade',
    syllableCount: 6,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'oportunidade',
    syllableCount: 6,
    difficultyLevel: 3,
    category: 'noun',
  },
  {
    wordText: 'manifestacao',
    syllableCount: 5,
    difficultyLevel: 3,
    category: 'noun',
  },
]

const words = [
  ...expandedWords.map((word) => ({ ...word, language: 'en-US' })),
  ...frWords.map((word) => ({ ...word, language: 'fr-FR' })),
  ...ptWords.map((word) => ({ ...word, language: 'pt-PT' })),
]

// Beat data with actual audio files from public/beats/
// Duration values are approximate seconds, derived from file metadata
const beats = [
  {
    title: '2 Naughty',
    bpm: 99,
    storageUrl: '/beats/2-Naughty.mp3',
    isPremium: false,
    genre: null,
    duration: 264,
    artistName: 'FreeStyla',
  },
  {
    title: 'Bam Beater',
    bpm: 95,
    storageUrl: '/beats/Bam-Beater.mp3',
    isPremium: false,
    genre: null,
    duration: 240,
    artistName: 'FreeStyla',
  },
  {
    title: 'Bass Beats Battle',
    bpm: 89,
    storageUrl: '/beats/Bass-Beats-Battle.mp3',
    isPremium: false,
    genre: null,
    duration: 240,
    artistName: 'FreeStyla',
  },
  {
    title: 'Battle',
    bpm: 90,
    storageUrl: '/beats/Battle-.mp3',
    isPremium: false,
    genre: null,
    duration: 300,
    artistName: 'FreeStyla',
  },
  {
    title: 'Battle Baby',
    bpm: 89,
    storageUrl: '/beats/Battle-Baby.mp3',
    isPremium: false,
    genre: null,
    duration: 40,
    artistName: 'FreeStyla',
  },
  {
    title: 'Battle Cracker',
    bpm: 96,
    storageUrl: '/beats/Battle-Cracker.mp3',
    isPremium: false,
    genre: null,
    duration: 204,
    artistName: 'FreeStyla',
  },
  {
    title: 'Battle Made',
    bpm: 89,
    storageUrl: '/beats/Battle-Made.mp3',
    isPremium: false,
    genre: null,
    duration: 45,
    artistName: 'FreeStyla',
  },
  {
    title: 'Battle Yo',
    bpm: 90,
    storageUrl: '/beats/Battle-Yo.mp3',
    isPremium: false,
    genre: null,
    duration: 120,
    artistName: 'FreeStyla',
  },
  {
    title: 'Be Battle Be',
    bpm: 145,
    storageUrl: '/beats/Be-Battle-Be.mp3',
    isPremium: true,
    genre: null,
    duration: 219,
    artistName: 'FreeStyla',
  },
  {
    title: 'Beat Down',
    bpm: 92,
    storageUrl: '/beats/Beat-Down.mp3',
    isPremium: true,
    genre: null,
    duration: 240,
    artistName: 'FreeStyla',
  },
  {
    title: 'Big Battle Drops',
    bpm: 96,
    storageUrl: '/beats/Big-Battle-Drops.mp3',
    isPremium: true,
    genre: null,
    duration: 240,
    artistName: 'FreeStyla',
  },
  {
    title: 'Breaks',
    bpm: 88,
    storageUrl: '/beats/Breaks.mp3',
    isPremium: true,
    genre: null,
    duration: 240,
    artistName: 'FreeStyla',
  },
  {
    title: 'FRB 4',
    bpm: 90,
    storageUrl: '/beats/FRB-4.mp3',
    isPremium: true,
    genre: null,
    duration: 215,
    artistName: 'FreeStyla',
  },
  {
    title: 'FRB 5',
    bpm: 90,
    storageUrl: '/beats/FRB-5.mp3',
    isPremium: true,
    genre: null,
    duration: 81,
    artistName: 'FreeStyla',
  },
  {
    title: 'FreeStyle Boom',
    bpm: 92,
    storageUrl: '/beats/FreeStyle-Boom.mp3',
    isPremium: true,
    genre: null,
    duration: 101,
    artistName: 'FreeStyla',
  },
  {
    title: 'Freestyle Battle Beats 01',
    bpm: 93,
    storageUrl: '/beats/Freestyle-Battle-Beats-01.mp3',
    isPremium: true,
    genre: null,
    duration: 176,
    artistName: 'FreeStyla',
  },
  {
    title: 'Rap Freestyle Underground',
    bpm: 89,
    storageUrl: '/beats/Rap-Freestyle-Underground-.mp3',
    isPremium: false,
    genre: null,
    duration: 218,
    artistName: 'FreeStyla',
  },
  {
    title: 'Shotgun Boom',
    bpm: 95,
    storageUrl: '/beats/Shotgun-Boom.mp3',
    isPremium: false,
    genre: null,
    duration: 84,
    artistName: 'FreeStyla',
  },
]

// Premium beats (placeholder - to be added later)
const _premiumBeats = [
  {
    title: 'East Coast Grit',
    bpm: 88,
    storageUrl: '/beats/east-coast-grit.mp3',
    isPremium: false,
    genre: 'East Coast',
    duration: 145,
    artistName: 'FreeStyla',
  },
  {
    title: 'Ambient Dreams',
    bpm: 75,
    storageUrl: '/beats/ambient-dreams.mp3',
    isPremium: false,
    genre: 'Ambient',
    duration: 210,
    artistName: 'FreeStyla',
  },
  {
    title: 'Afro Fusion',
    bpm: 110,
    storageUrl: '/beats/afro-fusion.mp3',
    isPremium: false,
    genre: 'Afrobeat',
    duration: 185,
    artistName: 'FreeStyla',
  },
  {
    title: 'Latin Heat',
    bpm: 105,
    storageUrl: '/beats/latin-heat.mp3',
    isPremium: false,
    genre: 'Latin',
    duration: 155,
    artistName: 'FreeStyla',
  },
  {
    title: 'Experimental Wave',
    bpm: 130,
    storageUrl: '/beats/experimental-wave.mp3',
    isPremium: false,
    genre: 'Experimental',
    duration: 195,
    artistName: 'FreeStyla',
  },
]

void _premiumBeats

// Achievements Data
const achievements = [
  // Session Milestones
  {
    code: 'FIRST_FLOW',
    name: 'First Flow',
    description: 'Completed your first freestyle session.',
    icon: 'Mic',
    points: 10,
  },
  {
    code: 'SESSION_5',
    name: 'Getting Started',
    description: 'Completed 5 sessions.',
    icon: 'Play',
    points: 25,
  },
  {
    code: 'SESSION_20',
    name: 'Dedicated',
    description: 'Completed 20 sessions.',
    icon: 'TrendingUp',
    points: 50,
  },
  {
    code: 'SESSION_50',
    name: 'Studio Rat',
    description: 'Completed 50 sessions.',
    icon: 'Headphones',
    points: 100,
  },
  {
    code: 'SESSION_100',
    name: 'Freestyla Legend',
    description: 'Completed 100 sessions.',
    icon: 'Crown',
    points: 500,
  },

  // Recording Milestones
  {
    code: 'FIRST_RECORDING',
    name: 'Mic Check',
    description: 'Saved your first recording.',
    icon: 'CassetteTape',
    points: 15,
  },
  {
    code: 'RECORDING_10',
    name: 'Tape Deck',
    description: 'Saved 10 recordings.',
    icon: 'Library',
    points: 50,
  },
  {
    code: 'RECORDING_50',
    name: 'Album Ready',
    description: 'Saved 50 recordings.',
    icon: 'Disc',
    points: 200,
  },

  // Performance (Context Sensitive)
  {
    code: 'SPITFIRE',
    name: 'Spitfire',
    description: 'Rapped over 150 words in a single session.',
    icon: 'Flame',
    points: 100,
  },
  {
    code: 'RAP_GOD',
    name: 'Rap God',
    description: 'Rapped over 300 words in a single session.',
    icon: 'Zap', // Or Crown
    points: 500,
  },
  {
    code: 'MARATHON',
    name: 'Marathon',
    description: 'Recorded a session longer than 5 minutes.',
    icon: 'Timer',
    points: 200,
  },
  {
    code: 'ONE_TAKE',
    name: 'One Take',
    description: 'Recorded for over 30s with zero restarts.',
    icon: 'CheckCircle',
    points: 150,
  },

  // Streaks
  {
    code: 'STREAK_3',
    name: 'Heating Up',
    description: 'Practiced for 3 days in a row.',
    icon: 'Flame',
    points: 50,
  },
  {
    code: 'STREAK_7',
    name: 'On Fire',
    description: 'Practiced for 7 days in a row.',
    icon: 'Zap',
    points: 100,
  },
  {
    code: 'STREAK_30',
    name: 'Unstoppable',
    description: 'Practiced for 30 days in a row.',
    icon: 'Trophy',
    points: 500,
  },

  // Beat Exploration
  {
    code: 'BEAT_EXPLORER_5',
    name: 'Vibe Checker',
    description: 'Practiced on 5 different beats.',
    icon: 'Music',
    points: 30,
  },
  {
    code: 'BEAT_MASTER_20',
    name: 'Crate Digger',
    description: 'Practiced on 20 different beats.',
    icon: 'Disc3',
    points: 100,
  },

  // Word Vault
  {
    code: 'WORDS_50',
    name: 'Word Smith',
    description: 'Collected 50 unique words.',
    icon: 'Book',
    points: 50,
  },
  {
    code: 'WORDS_200',
    name: 'Lyricist',
    description: 'Collected 200 unique words.',
    icon: 'Feather',
    points: 150,
  },
  {
    code: 'WORDS_1000',
    name: 'Vocabulary God',
    description: 'Collected 1000 unique words.',
    icon: 'Scroll',
    points: 1000,
  },

  // Time Based
  {
    code: 'EARLY_BIRD',
    name: 'Early Bird',
    description: 'Completed a session before 8 AM.',
    icon: 'Sun',
    points: 20,
  },
  {
    code: 'NIGHT_OWL',
    name: 'Night Owl',
    description: 'Completed a session after 11 PM.',
    icon: 'Moon',
    points: 20,
  },
  {
    code: 'WEEKEND_WARRIOR',
    name: 'Weekend Warrior',
    description: 'Completed sessions on both Saturday and Sunday.',
    icon: 'Calendar',
    points: 30,
  },
  {
    code: 'LUNCH_BREAK',
    name: 'Lunch Break',
    description: 'Recorded a session between 12 PM and 2 PM.',
    icon: 'Coffee',
    points: 20,
  },
  {
    code: 'MIDNIGHT',
    name: 'Midnight Oil',
    description: 'Recorded a session between 12 AM and 3 AM.',
    icon: 'MoonStar',
    points: 50,
  },
]

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (Be careful with production!)
  // In dev pivot, we clear to ensure consistency
  // console.log('🗑️  Clearing existing data...')
  // await prisma.freestyleSession.deleteMany()
  // await prisma.beat.deleteMany()
  // await prisma.word.deleteMany()
  // await prisma.achievement.deleteMany() // Clear achievements to re-seed

  // Seed words
  console.log('📝 Seeding words...')
  for (const word of words) {
    await prisma.word.upsert({
      where: {
        language_wordText: {
          language: word.language,
          wordText: word.wordText,
        },
      },
      update: {},
      create: word,
    })
  }
  console.log(`✅ Synced words`)

  // Seed beats
  console.log('🎵 Seeding beats...')
  for (const beat of beats) {
    // using storageUrl as a pseudo-unique key for upsert if possible, or just create
    // Beats don't have a unique constraint other than ID, so we might duplicate if we just create.
    // For seeding, checking existing by title/artist might be better.
    const existing = await prisma.beat.findFirst({
      where: { title: beat.title, artistName: beat.artistName },
    })

    if (!existing) {
      await prisma.beat.create({ data: beat })
    }
  }
  console.log(`✅ Synced beats`)

  // Seed Achievements
  console.log('🏆 Seeding achievements...')
  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: ach, // Update details if changed
      create: ach,
    })
  }
  console.log(`✅ Synced ${achievements.length} achievements`)

  console.log('✨ Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
