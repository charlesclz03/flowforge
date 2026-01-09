export type PatchNoteCategory =
  | 'New Features'
  | 'System Updates'
  | 'Fixes & Improvements'
  | 'Visual Overhaul'
  | 'Premium Features'

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
    version: '1.5.5',
    title: 'The Zero Warning',
    codename: 'Perfect Sync',
    date: 'January 09, 2026',
    description:
      'Critical regressions in audio timing and synchronization resolved. Achieved a perfectly clean build with 0 warnings.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'Audio Logic: Removed race conditions and laggy polling loops for absolute precision on start.',
          'Double TTS: Fixed logic bug causing the first word to repeat twice.',
          'Error Persistence: useBeatPlayer now clears errors on stop/restart.',
          'Achievements: Implemented auto-seeding to ensure milestones are always populated.',
          'Industrial Cleanup: Fixed all remaining 8 build warnings across the codebase.',
        ],
      },
    ],
  },
  {
    version: '1.5.4',
    title: 'The Polish',
    codename: 'Smooth Operator',
    date: 'January 09, 2026',
    description:
      'Quality-of-life improvements that make the app feel more responsive and polished.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'Collapsible Dropdown: Practice beat selector is now collapsible with smooth animations.',
          'Mic Icon Fix: Resolved rendering issues with the record button microphone icon.',
          'Profile Pictures: Fixed Google profile images not displaying in the sidebar/profile.',
          'Navigation: Improved transition flow from Vinyl Collection to Practice Studio.',
        ],
      },
    ],
  },
  {
    version: '1.5.3',
    title: 'The Resurrection',
    codename: 'Second Wind',
    date: 'January 09, 2026',
    description:
      'Critical fixes for audio playback, authentication loops, and UI visibility. The app was broken; now it works.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'Audio Engine: Implemented "Mute-Play-Unmute" strategy for guaranteed playback on Safari/Mobile.',
          'Auth Redirect Loop: Removed edge middleware protection for Profile/Recordings routes.',
          'Record Button: Fixed invisible "REC" button by changing black-on-black styling to white.',
          'Layout Overlap: Reduced min-height on Practice page to prevent bottom nav overlap.',
          'Cypher Mode: Created mock room creation API and lobby page.',
          'Tracks Fallback: Added client-side fallback beats if API fails.',
        ],
      },
      {
        category: 'System Updates',
        items: [
          'Audio Player Debugging: Added comprehensive lifecycle logging.',
          "Grace Period: Session won't stop before 1.5s to prevent instant-death glitches.",
          'Optimistic UI: Play state updates immediately for faster feedback.',
        ],
      },
    ],
  },
  {
    version: '1.4.0',
    title: 'The Platinum Polish',
    codename: 'Diamond Cutter',
    date: 'December 21, 2025',
    description:
      'The final layer of sheen. We heard your feedback and have refined the core experience. This update brings user beat uploads, a completely revamped layout, and critical stability fixes.',
    changes: [
      {
        category: 'New Features',
        items: [
          'User Beat Uploads: Pro users can now upload, calibrate, and manage their own instrumental tracks directly from the Tracks page.',
          'Beat Vault: Added tabs for "Public Tracks" and "My Tracks" for easier library management.',
          'Achievements System: The "Leaderboard" is now "Achievements", featuring 100+ Overwatch 2 style medals.',
          'Classic Mode: Restored the beloved central-player layout for the Practice Studio.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          'Windows Support: Resolved all file-system encoding issues for a smoother dev experience.',
          'Search & Filters: Fixed all filtering logic on the Tracks page.',
          'Performance: Optimized asset loading for instant playback.',
          'Visuals: Standardized font usage (Inter/JetBrains Mono) and removed visual clutter.',
        ],
      },
    ],
  },
  {
    version: '1.3.0',
    title: 'The Gamification Update',
    codename: 'Level Up',
    date: 'December 20, 2025',
    description:
      'Turn your practice into a game. We have introduced a robust streak system, XP progression, and a battle-pass style rewards track to keep you motivated.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Streak System: Track your daily consistency with fire and ice visual indicators.',
          'XP Battle Pass: Earn XP for every minute you flow and unlock tier rewards.',
          'Zen Mode: Toggle off all gamification elements when you just need to focus.',
        ],
      },
      {
        category: 'System Updates',
        items: [
          'Offline Support: Optimistic UI updates ensure your progress counts even if the connection drops.',
          'Safe Area Wrapper: Optimized layout for modern mobile devices (Notches/Dynamic Islands).',
        ],
      },
    ],
  },
  {
    version: '1.1.0',
    title: 'The Perfectionist',
    codename: 'Infinite Loop',
    date: 'December 18, 2025',
    description:
      'Reaching for the peak. This update completes the "Bible" requirements with a focus on deep practice mechanics, better progression tracking, and dynamic social sharing.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Word "Bag System": New shuffle algorithm ensures no word repeats until the entire 500-word set is exhausted.',
          'Stat Card Sharing: Export your sessions as custom PNG images shaped for social media stories.',
          'Random Mode: A new "Dice" button to instantly shake up your practice setup.',
          'Bug Reporting: Direct feedback link integrated into the settings dropdown.',
        ],
      },
      {
        category: 'System Updates',
        items: [
          'Advanced Badge Logic: "Perfectionist", "The Listener", and "Machine Gun" badges are now fully automated.',
          'Beat Preloading: Start buttons now wait for audio assets to be fully ready before allowing entry.',
          'Panic Penalty: Skips now correctly impact your Flow Density score.',
        ],
      },
    ],
  },
  {
    version: '0.8.0',
    title: 'The Social Awakening',
    codename: 'Arena of Voices',
    date: 'December 14, 2025',
    description:
      'The silence has been broken. The barriers between emcees have fallen. The Social Awakening brings the community to life with the introduction of public profiles, feeds, and the ultimate test of skill: Duels.',
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
    description:
      'Before the gates opened, the world had to be perfected. This update focused on squashing the bugs that hid in the shadows and refining the experience to a mirror shine.',
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
    description:
      'A shift in the visual spectrum. The old Orange has faded, replaced by the regal FreeStyla Purple (#7D7AFF). This massive design overhaul redefined the aesthetic of the entire platform.',
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
    description:
      'The ability to capture time. Emcees can now save their sessions to the cloud, building a library of their lyrical evolution.',
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
    description:
      'The core engine roars to life. The audio system was finalized, bringing low-latency playback, perfectly synchronized word prompts, and the visual feedback of the Timer Ring.',
    changes: [
      {
        category: 'New Features',
        items: [
          'The Practice Studio: The heart of FreeStyla. A fully immersive freestyle environment.',
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
    description:
      'In the beginning, there was code. The infrastructure was forged from the void.',
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
