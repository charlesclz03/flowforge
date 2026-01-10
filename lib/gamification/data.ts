export const ACHIEVEMENTS = [
  // Session Milestones
  {
    code: 'FIRST_FLOW',
    name: 'First Flow',
    description: 'Completed your first freestyle session.',
    icon: 'Mic',
    points: 10,
    target: 1,
    progressType: 'sessions',
  },
  {
    code: 'SESSION_5',
    name: 'Getting Started',
    description: 'Completed 5 sessions.',
    icon: 'Play',
    points: 25,
    target: 5,
    progressType: 'sessions',
  },
  {
    code: 'SESSION_20',
    name: 'Dedicated',
    description: 'Completed 20 sessions.',
    icon: 'TrendingUp',
    points: 50,
    target: 20,
    progressType: 'sessions',
  },
  {
    code: 'SESSION_50',
    name: 'Studio Rat',
    description: 'Completed 50 sessions.',
    icon: 'Headphones',
    points: 100,
    target: 50,
    progressType: 'sessions',
  },
  {
    code: 'SESSION_100',
    name: 'Freestyla Legend',
    description: 'Completed 100 sessions.',
    icon: 'Crown',
    points: 500,
    target: 100,
    progressType: 'sessions',
  },

  // Recording Milestones
  {
    code: 'FIRST_RECORDING',
    name: 'Mic Check',
    description: 'Saved your first recording.',
    icon: 'CassetteTape',
    points: 15,
    target: 1,
    progressType: 'recordings',
  },
  {
    code: 'RECORDING_10',
    name: 'Tape Deck',
    description: 'Saved 10 recordings.',
    icon: 'Library',
    points: 50,
    target: 10,
    progressType: 'recordings',
  },
  {
    code: 'RECORDING_50',
    name: 'Album Ready',
    description: 'Saved 50 recordings.',
    icon: 'Disc',
    points: 200,
    target: 50,
    progressType: 'recordings',
  },

  // Streaks
  {
    code: 'STREAK_3',
    name: 'Heating Up',
    description: 'Practiced for 3 days in a row.',
    icon: 'Flame',
    points: 50,
    target: 3,
    progressType: 'streak',
  },
  {
    code: 'STREAK_7',
    name: 'On Fire',
    description: 'Practiced for 7 days in a row.',
    icon: 'Zap',
    points: 100,
    target: 7,
    progressType: 'streak',
  },
  {
    code: 'STREAK_30',
    name: 'Unstoppable',
    description: 'Practiced for 30 days in a row.',
    icon: 'Trophy',
    points: 500,
    target: 30,
    progressType: 'streak',
  },

  // Beat Exploration
  {
    code: 'BEAT_EXPLORER_5',
    name: 'Vibe Checker',
    description: 'Practiced on 5 different beats.',
    icon: 'Music',
    points: 30,
    target: 5,
    progressType: 'beats',
  },
  {
    code: 'BEAT_MASTER_20',
    name: 'Crate Digger',
    description: 'Practiced on 20 different beats.',
    icon: 'Disc3',
    points: 100,
    target: 20,
    progressType: 'beats',
  },

  // Word Vault
  {
    code: 'WORDS_50',
    name: 'Word Smith',
    description: 'Collected 50 unique words.',
    icon: 'Book',
    points: 50,
    target: 50,
    progressType: 'words',
  },
  {
    code: 'WORDS_200',
    name: 'Lyricist',
    description: 'Collected 200 unique words.',
    icon: 'Feather',
    points: 150,
    target: 200,
    progressType: 'words',
  },
  {
    code: 'WORDS_1000',
    name: 'Vocabulary God',
    description: 'Collected 1000 unique words.',
    icon: 'Scroll',
    points: 1000,
    target: 1000,
    progressType: 'words',
  },

  // Time Based (no progress tracking - one-time conditions)
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

// Type for progress calculation
export type ProgressType =
  | 'sessions'
  | 'recordings'
  | 'beats'
  | 'streak'
  | 'words'
