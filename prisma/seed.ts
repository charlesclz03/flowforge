import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Word data with difficulty levels
const words = [
  // Easy words (1-2 syllables)
  { wordText: 'flow', syllableCount: 1, difficultyLevel: 1, category: 'noun' },
  { wordText: 'beat', syllableCount: 1, difficultyLevel: 1, category: 'noun' },
  { wordText: 'rhyme', syllableCount: 1, difficultyLevel: 1, category: 'noun' },
  { wordText: 'time', syllableCount: 1, difficultyLevel: 1, category: 'noun' },
  { wordText: 'mind', syllableCount: 1, difficultyLevel: 1, category: 'noun' },
  { wordText: 'shine', syllableCount: 1, difficultyLevel: 1, category: 'verb' },
  { wordText: 'climb', syllableCount: 1, difficultyLevel: 1, category: 'verb' },
  { wordText: 'fire', syllableCount: 2, difficultyLevel: 1, category: 'noun' },
  { wordText: 'power', syllableCount: 2, difficultyLevel: 1, category: 'noun' },
  { wordText: 'money', syllableCount: 2, difficultyLevel: 1, category: 'noun' },
  { wordText: 'city', syllableCount: 2, difficultyLevel: 1, category: 'noun' },
  { wordText: 'hustle', syllableCount: 2, difficultyLevel: 1, category: 'verb' },
  { wordText: 'struggle', syllableCount: 2, difficultyLevel: 1, category: 'noun' },
  { wordText: 'battle', syllableCount: 2, difficultyLevel: 1, category: 'noun' },
  { wordText: 'winner', syllableCount: 2, difficultyLevel: 1, category: 'noun' },

  // Medium words (2-3 syllables)
  { wordText: 'elevate', syllableCount: 3, difficultyLevel: 2, category: 'verb' },
  { wordText: 'dedicate', syllableCount: 3, difficultyLevel: 2, category: 'verb' },
  { wordText: 'authentic', syllableCount: 3, difficultyLevel: 2, category: 'adjective' },
  { wordText: 'energy', syllableCount: 3, difficultyLevel: 2, category: 'noun' },
  { wordText: 'legacy', syllableCount: 3, difficultyLevel: 2, category: 'noun' },
  { wordText: 'melody', syllableCount: 3, difficultyLevel: 2, category: 'noun' },
  { wordText: 'symphony', syllableCount: 3, difficultyLevel: 2, category: 'noun' },
  { wordText: 'strategy', syllableCount: 3, difficultyLevel: 2, category: 'noun' },
  { wordText: 'connection', syllableCount: 3, difficultyLevel: 2, category: 'noun' },
  { wordText: 'reflection', syllableCount: 3, difficultyLevel: 2, category: 'noun' },
  { wordText: 'perfection', syllableCount: 3, difficultyLevel: 2, category: 'noun' },
  { wordText: 'direction', syllableCount: 3, difficultyLevel: 2, category: 'noun' },
  { wordText: 'precision', syllableCount: 3, difficultyLevel: 2, category: 'noun' },
  { wordText: 'ambition', syllableCount: 3, difficultyLevel: 2, category: 'noun' },
  { wordText: 'tradition', syllableCount: 3, difficultyLevel: 2, category: 'noun' },

  // Hard words (3+ syllables)
  { wordText: 'metamorphosis', syllableCount: 5, difficultyLevel: 3, category: 'noun' },
  { wordText: 'revolutionary', syllableCount: 5, difficultyLevel: 3, category: 'adjective' },
  { wordText: 'philosophical', syllableCount: 5, difficultyLevel: 3, category: 'adjective' },
  { wordText: 'extraordinary', syllableCount: 5, difficultyLevel: 3, category: 'adjective' },
  { wordText: 'deteriorate', syllableCount: 5, difficultyLevel: 3, category: 'verb' },
  { wordText: 'magnificence', syllableCount: 4, difficultyLevel: 3, category: 'noun' },
  { wordText: 'incomparable', syllableCount: 5, difficultyLevel: 3, category: 'adjective' },
  { wordText: 'intellectual', syllableCount: 5, difficultyLevel: 3, category: 'adjective' },
  { wordText: 'unbelievable', syllableCount: 5, difficultyLevel: 3, category: 'adjective' },
  { wordText: 'astronomical', syllableCount: 5, difficultyLevel: 3, category: 'adjective' },
  { wordText: 'acceleration', syllableCount: 5, difficultyLevel: 3, category: 'noun' },
  { wordText: 'manifestation', syllableCount: 5, difficultyLevel: 3, category: 'noun' },
  { wordText: 'determination', syllableCount: 5, difficultyLevel: 3, category: 'noun' },
  { wordText: 'refrigerator', syllableCount: 5, difficultyLevel: 3, category: 'noun' },
  { wordText: 'communication', syllableCount: 5, difficultyLevel: 3, category: 'noun' },
]

// Beat data with actual audio files from public/beats/
// Duration values are approximate seconds, derived from file metadata
const beats = [
  {
    title: '2 Naughty',
    bpm: 99,
    storageUrl: '/beats/2 Naughty.mp3',
    isPremium: false,
    genre: null,
    duration: 264,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Bam Beater',
    bpm: 95,
    storageUrl: '/beats/Bam Beater.mp3',
    isPremium: false,
    genre: null,
    duration: 240,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Bass Beats Battle',
    bpm: 89,
    storageUrl: '/beats/Bass Beats Battle.mp3',
    isPremium: false,
    genre: null,
    duration: 240,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Battle',
    bpm: 90,
    storageUrl: '/beats/Battle .mp3',
    isPremium: false,
    genre: null,
    duration: 300,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Battle Baby',
    bpm: 89,
    storageUrl: '/beats/Battle Baby.mp3',
    isPremium: false,
    genre: null,
    duration: 40,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Battle Cracker',
    bpm: 96,
    storageUrl: '/beats/Battle Cracker.mp3',
    isPremium: false,
    genre: null,
    duration: 204,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Battle Made',
    bpm: 89,
    storageUrl: '/beats/Battle Made.mp3',
    isPremium: false,
    genre: null,
    duration: 45,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Battle Yo',
    bpm: 90,
    storageUrl: '/beats/Battle Yo.mp3',
    isPremium: false,
    genre: null,
    duration: 120,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Be Battle Be',
    bpm: 145,
    storageUrl: '/beats/Be Battle Be.mp3',
    isPremium: true,
    genre: null,
    duration: 219,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Beat Down',
    bpm: 92,
    storageUrl: '/beats/Beat Down.mp3',
    isPremium: true,
    genre: null,
    duration: 240,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Big Battle Drops',
    bpm: 96,
    storageUrl: '/beats/Big Battle Drops.mp3',
    isPremium: true,
    genre: null,
    duration: 240,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Breaks',
    bpm: 88,
    storageUrl: '/beats/Breaks.mp3',
    isPremium: true,
    genre: null,
    duration: 240,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'FRB 4',
    bpm: 90,
    storageUrl: '/beats/FRB 4.mp3',
    isPremium: true,
    genre: null,
    duration: 215,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'FRB 5',
    bpm: 90,
    storageUrl: '/beats/FRB 5.mp3',
    isPremium: true,
    genre: null,
    duration: 81,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'FreeStyle Boom',
    bpm: 92,
    storageUrl: '/beats/FreeStyle Boom.mp3',
    isPremium: true,
    genre: null,
    duration: 101,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Freestyle Battle Beats 01',
    bpm: 93,
    storageUrl: '/beats/Freestyle Battle Beats 01.mp3',
    isPremium: true,
    genre: null,
    duration: 176,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Rap Freestyle Underground',
    bpm: 89,
    storageUrl: '/beats/Rap Freestyle Underground .mp3',
    isPremium: false,
    genre: null,
    duration: 218,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Shotgun Boom',
    bpm: 95,
    storageUrl: '/beats/Shotgun Boom.mp3',
    isPremium: false,
    genre: null,
    duration: 84,
    artistName: 'FlowForge Beats',
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
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Ambient Dreams',
    bpm: 75,
    storageUrl: '/beats/ambient-dreams.mp3',
    isPremium: false,
    genre: 'Ambient',
    duration: 210,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Afro Fusion',
    bpm: 110,
    storageUrl: '/beats/afro-fusion.mp3',
    isPremium: false,
    genre: 'Afrobeat',
    duration: 185,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Latin Heat',
    bpm: 105,
    storageUrl: '/beats/latin-heat.mp3',
    isPremium: false,
    genre: 'Latin',
    duration: 155,
    artistName: 'FlowForge Beats',
  },
  {
    title: 'Experimental Wave',
    bpm: 130,
    storageUrl: '/beats/experimental-wave.mp3',
    isPremium: false,
    genre: 'Experimental',
    duration: 195,
    artistName: 'FlowForge Beats',
  },
]

void _premiumBeats

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.freestyleSession.deleteMany()
  await prisma.beat.deleteMany()
  await prisma.word.deleteMany()

  // Seed words
  console.log('📝 Seeding words...')
  for (const word of words) {
    await prisma.word.create({
      data: word,
    })
  }
  console.log(`✅ Created ${words.length} words`)

  // Seed beats
  console.log('🎵 Seeding beats...')
  for (const beat of beats) {
    await prisma.beat.create({
      data: beat,
    })
  }
  console.log(`✅ Created ${beats.length} beats`)

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
