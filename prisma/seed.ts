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
const beats = [
  {
    title: 'Anonimowy Wrocław',
    bpm: 90,
    storageUrl: '/beats/Anonimowy Wrocław.mp3',
    isPremium: false,
    genre: 'Polish Hip-Hop',
    duration: 180,
    artistName: 'Polski Hip-Hop',
  },
  {
    title: 'CD Kinematografii',
    bpm: 85,
    storageUrl: '/beats/CD Kinematografii.mp3',
    isPremium: false,
    genre: 'Polish Hip-Hop',
    duration: 180,
    artistName: 'Polski Hip-Hop',
  },
  {
    title: 'Co To Za Miejsce',
    bpm: 92,
    storageUrl: '/beats/Co To Za Miejsce.mp3',
    isPremium: false,
    genre: 'Polish Hip-Hop',
    duration: 180,
    artistName: 'Polski Hip-Hop',
  },
  {
    title: 'Grill Na Dziauce',
    bpm: 88,
    storageUrl: '/beats/Grill Na Dziauce.mp3',
    isPremium: false,
    genre: 'Polish Hip-Hop',
    duration: 180,
    artistName: 'Polski Hip-Hop',
  },
  {
    title: 'Hip-hop art',
    bpm: 95,
    storageUrl: '/beats/Hip-hop art.mp3',
    isPremium: false,
    genre: 'Polish Hip-Hop',
    duration: 180,
    artistName: 'Polski Hip-Hop',
  },
  {
    title: 'Mam Pięć Gram',
    bpm: 88,
    storageUrl: '/beats/Mam Pięć Gram.mp3',
    isPremium: false,
    genre: 'Polish Hip-Hop',
    duration: 180,
    artistName: 'Polski Hip-Hop',
  },
  {
    title: 'Nieme Kino',
    bpm: 93,
    storageUrl: '/beats/Nieme Kino.mp3',
    isPremium: false,
    genre: 'Polish Hip-Hop',
    duration: 180,
    artistName: 'Polski Hip-Hop',
  },
  {
    title: 'Tyle spraff',
    bpm: 100,
    storageUrl: '/beats/Tyle spraff.mp3',
    isPremium: false,
    genre: 'Polish Hip-Hop',
    duration: 180,
    artistName: 'Polski Hip-Hop',
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

