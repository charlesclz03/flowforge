import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
]

export async function GET() {
  try {
    const results = []
    for (const ach of achievements) {
      const res = await prisma.achievement.upsert({
        where: { code: ach.code },
        update: ach,
        create: ach,
      })
      results.push(res)
    }

    // Also check current counts
    const count = await prisma.achievement.count()

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.length} achievements. Total in DB: ${count}`,
      seeded: results,
    })
  } catch (error) {
    const e = error as Error
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
