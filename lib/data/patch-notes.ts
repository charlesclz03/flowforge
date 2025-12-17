export type PatchNoteCategory = 'New Features' | 'System Updates' | 'Fixes & Improvements' | 'Visual Overhaul' | 'Premium Features'

export interface PatchNoteItem {
  category: PatchNoteCategory
  items: string[]
}

export interface PatchNote {
  version: string
  title: string
  codename: string
  date: string
  description: string
  changes: PatchNoteItem[]
}

export const PATCH_NOTES: PatchNote[] = [
  {
    version: '0.8.0',
    title: 'The Social Awakening',
    codename: 'Arena of Voices',
    date: 'December 14, 2025',
    description: 'The silence has been broken. The barriers between emcees have fallen. The Social Awakening brings the community to life with the introduction of public profiles, feeds, and the ultimate test of skill: Duels.',
    changes: [
      {
        category: 'New Features',
        items: [
          'The Global Feed: A live stream of the latest fire dropped by the community.',
          'Duels System: Challenge another emcee to a asynchronous rap battle.',
          'Public Profiles: Showcase your best tracks, stats, and duel history.',
          'Follow System: Build your crew and never miss a drop.',
        ],
      },
      {
        category: 'System Updates',
        items: [
          'Voting Mechanics: Secure, context-aware voting system ensuring fair play.',
          'Notification Infrastructure: The foundation for future alerts has been laid.',
        ],
      },
    ],
  },
  {
    version: '0.7.0',
    title: 'The Polish & The Pragmatic',
    codename: 'Crystal Clarity',
    date: 'December 14, 2025',
    description: 'Before the gates opened, the world had to be perfected. This update focused on squashing the bugs that hid in the shadows and refining the experience to a mirror shine.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'Mobile responsiveness overhauled for seamless flow on all devices.',
          'Navigation refined for intuitive movement through the app.',
          'Performance optimizations to ensure the beat never skips.',
        ],
      },
    ],
  },
  {
    version: '0.5.0',
    title: 'The Purple Void',
    codename: 'Royal Ascension',
    date: 'December 11, 2025',
    description: 'A shift in the visual spectrum. The old Orange has faded, replaced by the regal FlowForge Purple (#7D7AFF). This massive design overhaul redefined the aesthetic of the entire platform.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'New Color System: All UI elements migrated to the new Purple Design System.',
          'Premium Indicators: Gold badges now mark the elite features.',
          'Dark Mode Perfection: Contrast and shadows tuned for late-night studio sessions.',
        ],
      },
      {
        category: 'Premium Features',
        items: [
          'Subscription Foundations: The groundwork for Pro accounts has been laid.',
          'Exclusive Beats: 8 new high-fidelity beats added to the vault.',
        ],
      },
    ],
  },
  {
    version: '0.4.0',
    title: 'The Vault',
    codename: 'Memory Keepers',
    date: 'November 11, 2025',
    description: 'The ability to capture time. Emcees can now save their sessions to the cloud, building a library of their lyrical evolution.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Cloud Storage: Secure uploads to Supabase Storage.',
          'Recording Library: A dedicated space to manage, rename, and download tracks.',
          'Auto-Save: Sessions save automatically upon completion.',
          'Delete Policy: Automated cleanup ensures the storage eco-system remains healthy.',
        ],
      },
    ],
  },
  {
    version: '0.3.0',
    title: 'Echoes of the Beat',
    codename: 'Sonic Boom',
    date: 'November 11, 2025',
    description: 'The core engine roars to life. The audio system was finalized, bringing low-latency playback, perfectly synchronized word prompts, and the visual feedback of the Timer Ring.',
    changes: [
      {
        category: 'New Features',
        items: [
          'The Practice Studio: The heart of FlowForge. A fully immersive freestyle environment.',
          'Timer Ring: A visual representation of time, looping perfectly with the beat.',
          'Word Prompts: Dynamic words that challenge your flow in real-time.',
          'Audio Recorder: Browser-based recording with waveform visualization.',
        ],
      },
    ],
  },
  {
    version: '0.1.0',
    title: 'Genesis',
    codename: 'The Foundation',
    date: 'November 10, 2025',
    description: 'In the beginning, there was code. The infrastructure was forged from the void.',
    changes: [
      {
        category: 'System Updates',
        items: [
          'Next.js 14 initialized.',
          'Database connected (Supabase & Prisma).',
          'Authentication secured (Google OAuth).',
          'Design System established (Tailwind CSS).',
        ],
      },
    ],
  },
]
