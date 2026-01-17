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
    version: '0.9.37',
    date: '2026-01-17',
    title: 'The True Shuffle Update 🎲',
    codename: 'Fair Game',
    description:
      'We fixed the word randomization logic to ensure you actually get new words in every session, and now your stats will finally track "Words Unlocked" correctly.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          '🎲 **True Randomness**: Fixed a caching issue that caused the same words to appear repeatedly. Every session now pulls a fresh batch.',
          '📈 **Stats Sync**: "Words Unlocked" stats now correctly track unique words encountered, fixing the discrepancy with "Total Words Generated".',
        ],
      },
    ],
  },
  {
    version: '0.9.36',
    date: '2026-01-16',
    title: 'The Feedback Fix 🐛',
    codename: 'Direct Line',
    description:
      'We fixed the "Report Bug" link in the settings menu to correctly redirect to the dedicated feedback page, and cleaned up the Patch Notes UI.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          '🐛 **Report Bug Redirect**: The "Report Bug" button in Settings now correctly takes you to the Feedback page instead of the Patch Notes.',
          '🧹 **UI Cleanup**: Removed the redundant "Feedback" form from the bottom of the Patch Notes page.',
        ],
      },
    ],
  },
  {
    version: '0.9.35',
    date: '2026-01-16',
    title: 'The Flow State Update 🌊',
    codename: 'Seamless Upload',
    description:
      'We smoothed out the "My Tracks" experience. You can now upload beats directly from the difficulty menu and managing your library is easier than ever.',
    changes: [
      {
        category: 'New Features',
        items: [
          '📤 **Instant Upload**: Added a smart "Upload your first beat" prompt and a permanent "Upload new track" button right in the My Tracks dropdown.',
          '🔄 **Seamless Flow**: Uploading from the difficulty menu now auto-redirects you to the upload vault.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          "🗑️ **Delete Fixed**: Resolved an issue where deleting server-side tracks from the dropdown wasn't working. Clean up your library with confidence!",
        ],
      },
    ],
  },
  {
    version: '0.9.34',
    date: '2026-01-16',
    title: 'The Social Proof Update 🌟',
    codename: 'Five Stars',
    description:
      'We enabled a seamless rating experience, polished beat card visuals, and finally solved audio looping for infinite flow.',
    changes: [
      {
        category: 'New Features',
        items: [
          '🌟 **Rate Us**: Added a sleek rating modal that appears after your 3rd session. Love the app? Let us know!',
          '⭐ **Star Power**: You can now drop a star rating directly in the feedback form.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          '♾️ **Perfect Loops**: Rewrote the audio engine to use Web Audio scheduling. Beats now loop seamlessly with zero gaps.',
          '🎨 **Clean Cards**: Combined Artist and Producer names on beat cards for a cleaner look.',
        ],
      },
    ],
  },
  {
    version: '0.9.33',
    date: '2026-01-16',
    title: 'The Green Light Update 🟢',
    codename: 'Go Time',
    description:
      'We made sure your recordings always playback perfectly and gave the Practice Mode a clearer, punchier "START" button so you know exactly when to drop your bars.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          '📼 **Playback Rescued**: Fixed a "Failed to Play" bug caused by some beats having spaces in their cloud filenames. Your history is safe!',
          '🟢 **Clearer Start**: Swapped the ambiguous mic icon for a big, bold, pulsing "START" button. Less guessing, more rapping.',
        ],
      },
    ],
  },
  {
    version: '0.9.32',
    date: '2026-01-16',
    title: 'The Responsive Polish Update 📱',
    codename: 'Liquid Flow',
    description:
      'We smoothed out the Admin experience and fine-tuned the mobile layout to feel even more native. Plus, difficulty settings now stick instantly!',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          '🖱️ **Admin Focus Fix**: Resolved an annoying bug where editing track details would lose focus after every character. Smooth typing is back!',
          '🎚️ **Instant Difficulty**: Changing difficulty mid-session now instantly updates the word vibe for the rest of your session.',
        ],
      },
      {
        category: 'Visual Overhaul',
        items: [
          '📏 **Compact Mobile Layout**: Optimized padding and scaling for small iPhones (SE, Mini) to ensure all controls fit on a single screen without scrolling.',
          '🔄 **Responsive Practice controls**: The REC indicator and main buttons now scale aggressively to respect the viewport on smaller devices.',
        ],
      },
    ],
  },
  {
    version: '0.9.31',
    date: '2026-01-16',
    title: 'The Quality of Life Update 🛡️',
    codename: 'Safe Zone',
    description:
      'A massive polish update ensuring content never covers navigation, fixing audio glitches during review, and professionalizing the experience with better legal pages and feedback tools.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          '🛑 **Bottom Nav Safety**: Implemented global padding logic so content is never hidden behind the bottom bar on any device.',
          '📱 **Header Harmony**: Constrained header titles to prevent text overlapping with buttons on smaller screens.',
          '✨ **Professional Polish**: Refined the look of legal pages and feedback forms with cleaner iconography.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          '🐛 **Audio Glitch Eradicated**: Fixed stuttering and popping during recording review playback.',
          '🌊 **Smooth Waveform**: The playback indicator now smoothly glides across the track without jitter.',
          '🗣️ **Feedback Center**: Launched a dedicated /feedback page for easier bug reporting.',
        ],
      },
    ],
  },
  {
    version: '0.9.30',
    date: '2026-01-16',
    title: 'The Visual Polish Update 💅',
    codename: 'Neon Ring',
    description:
      'We gave the Cypher UI a major facelift with a new outer-ring layout and boosted the "Siren" intensity for maximum hype. Plus, a handy Help button in the header!',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          '💍 **Cypher Outer Ring**: The player segments now hug the outer edge of the main control button for a cleaner, futuristic look.',
          '🚨 **Siren Boost**: The "Police Siren" effect before word switches is now 200% more intense. You can\'t miss it!',
          'ℹ️ **Header Help**: Added a quick-access Help button (?) to the global header that takes you straight to the "How it Works" guide.',
          '🟣 **Glass Record Ring**: The central record button is now a consistent transparent glass ring with a purple border, ensuring the logo always shines through.',
        ],
      },
    ],
  },
  {
    version: '0.9.29',
    date: '2026-01-15',
    title: 'The Safe Resume & Admin Polish Update 💎',
    codename: 'Smooth Operator',
    description:
      'We’ve ironed out the playback wrinkles in Practice Mode (resuming works perfectly now!) and gave the Admin Beat Upload experience a serious upgrade with better layouts and stricter data controls.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          "⏯️ **Perfect Resume**: Fixed a bug where resuming a paused session wouldn't restart the beat. Now it picks up exactly where you left off.",
          '🧼 **Safe Pausing**: Switching browser tabs now safely pauses your session instead of stopping it completely.',
          '🎹 **Spacebar Safety**: Pressing Spacebar now gently pauses the session (with confirmation) instead of abruptly ending it.',
        ],
      },
      {
        category: 'New Features',
        items: [
          '🎛️ **Admin Upload 2.0**: Completely redesigned the beat upload card. Added a sleek "Free/Premium" toggle switch and optimized the layout.',
          '🏷️ **Smart Genre Filter**: The Beat Vault filter now dynamically updates to show only relevant genres for the tracks you are viewing.',
          '🔒 **Data Integrity**: Producer Name and Genre are now mandatory fields for new uploads.',
        ],
      },
    ],
  },
  {
    version: '0.9.28',
    date: '2026-01-15',
    title: 'Cypher Rings Restored 💍',
    codename: 'The One Ring',
    description:
      'Fixed a regression where the player turn indicators in Cypher Mode were missing. The visual rings are back!',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          '💍 **Cypher Mode**: Restored missing player turn rings.',
          '🎨 **Visual Fix**: Corrected SVG rendering for player segments.',
        ],
      },
    ],
  },
  {
    version: '0.9.27',
    date: '2026-01-15',
    title: 'The True Timer Fix ⏱️',
    codename: 'StrictMode Safe',
    description:
      'The session timer now runs at the correct speed! We discovered React StrictMode was causing the timer to run 2x faster by spawning duplicate animation loops.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          '⏰ **Accurate Timer**: Timer now counts at exactly 1 second per real second.',
          '🛡️ **StrictMode Guard**: Added animation ref guard to prevent duplicate timing loops.',
          '🧹 **Clean Exit Paths**: All animation loop exit points now properly clean up the frame reference.',
          '🚫 **Silence on Save**: Fixed "Leave site?" warning appearing after successful session save.',
        ],
      },
    ],
  },
  {
    version: '0.9.26',
    date: '2026-01-15',
    title: 'The Metronome Fix ⏱️',
    codename: 'True Time',
    description: 'Minor timer stability improvements and layout polish.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          '🎯 **Stable Dependencies**: Removed unstable object references from timer effect.',
          '📐 **Layout Lock**: Added fixed height to control buttons row to prevent player circle from shifting when controls appear.',
        ],
      },
    ],
  },
  {
    version: '0.9.25',
    date: '2026-01-15',
    title: 'The Mobile & Precision Update 📱',
    codename: 'Pocket Studio',
    description:
      'A comprehensive update focusing on mobile ergonomics and rigorous timing precision. We rebuilt the layout for small screens and locked the word intervals to the musical grid.',
    changes: [
      {
        category: 'System Updates',
        items: [
          '🔒 **Grid Lock Integrity**: Fixed a bug where changing bar frequency mid-session could freeze the timer. Timing is now reset instantly on change.',
          '📲 **Smart PWA Installer**: The app now detects iOS vs Android and teaches iOS users how to bypass microphone permission prompts.',
        ],
      },
      {
        category: 'Visual Overhaul',
        items: [
          '📏 **Dynamic Scaling**: The practice ring now caps its height at 45% of the screen, ensuring buttons are never cut off on smaller IPhones.',
          '🔄 **Split Layout**: Separated the Exit/Pause buttons into their own dedicated row to prevent overlap with the main player ring.',
          '🧭 **Viewport Stability**: Enforced `100dvh` (Dynamic Viewport Height) to respect the Safari bottom bar, preventing navigation issues.',
        ],
      },
    ],
  },
  {
    version: '0.9.20',
    date: '2026-01-15',
    title: 'The Precision Update 🎯',
    codename: 'Grid Lock',
    description:
      'A major stability update introducing the "Grid Lock" timing engine for perfect musical synchronization, plus a polished "Satellite Layout" for the player controls.',
    changes: [
      {
        category: 'System Updates',
        items: [
          '🔒 **Grid Lock Timing**: Word switching is now mathematically locked to the beat grid. No more drifting!',
        ],
      },
      {
        category: 'Visual Overhaul',
        items: [
          '🛰️ **Satellite UI**: Redesigned player controls to prevent button cropping and improve reachability.',
          '📱 **Layout Fixes**: Solved vertical scrolling issues on smaller screens across the app.',
        ],
      },
    ],
  },
  {
    version: '0.9.19',
    date: '2026-01-15',
    title: 'Polish & Precision',
    codename: 'Silent Loop',
    description:
      'A smoother practice experience with seamless audio looping, pixel-perfect button alignment, and a smarter TTS engine that knows when to be quiet.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'Seamless Looping: Fixed the 0.5s delay at the end of audio tracks. Beats now loop perfectly forever.',
          'Smart Silence: The voice coach now instantly stops talking when you leave a session or switch tabs.',
          'Visual Balance: Interactive buttons are now perfectly centered, and the Mode indicator takes center stage.',
        ],
      },
    ],
  },
  {
    version: '0.9.18',
    date: '2026-01-13',
    title: 'Streamlined Setup',
    codename: 'Focus Mode',
    description:
      'We removed the "Word Theme" selector to make starting a session faster and more intuitive. One bank, total focus.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'Feature Removal: Word Themes have been pruned for a simpler experience.',
        ],
      },
    ],
  },
  {
    version: '0.9.17',
    date: '2026-01-13',
    title: 'Visual Playhead',
    codename: 'Red Line',
    description:
      'Added a distinct red playback cursor to the audio waveform, so you always know exactly where you are in the track.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'Waveform: Now features a glowing red playhead indicating current position.',
        ],
      },
    ],
  },
  {
    version: '0.9.16',
    date: '2026-01-13',
    title: 'Smart Fallbacks & Sleek Reviews',
    codename: 'Safety Net',
    description:
      'We polished the Review page to look more pro and fixed a logic quirk where "Easy" mode could get tough if the internet blipped. Plus, dynamic difficulty switching!',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'Review Page: Title moved to app header, removing clutter and waste of space.',
          'Layout: Tighter spacing on top of review and practice screens.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          'Word Engine: "Easy" mode is now strictly easy, even offline.',
          'Dynamic Difficulty: Changing the difficulty slider mid-session now instantly updates the word vibe.',
        ],
      },
    ],
  },
  {
    version: '0.9.15',
    date: '2026-01-13',
    title: 'Mobile Experience',
    codename: 'One Screen',
    description:
      'Practice sessions now fit perfectly on your mobile screen. No scrolling, no distractions—just you and the booth.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'Viewport Lock: The "The Booth" now uses 100% of your screen height, eliminating annoying scrollbars.',
          'Responsive Ring: The record button scales down for smaller phones so you can reach every control.',
          'Smart Layout: Controls now distribute themselves evenly to fill available space.',
        ],
      },
    ],
  },
  {
    version: '0.9.15',
    date: '2026-01-13',
    title: 'Cypher Visual Alignment',
    codename: 'Prism',
    description:
      'Small but mighty visual tweak: The Cypher player selection buttons now match the actual in-game player colors.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'Cypher Setup: Player count buttons now sport their team colors (Orange, Gold, Green, Blue).',
        ],
      },
    ],
  },
  {
    version: '0.9.14',
    date: '2026-01-13',
    title: 'Session Safety & Layout',
    codename: 'Safe Mode',
    description:
      'Practice sessions are now safer! We added confirmation dialogues to prevent accidental exits and polished the studio controls layout.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Exit Safeguard: Use the Bottom Bar freely. We now ask for confirmation before discarding your session.',
          'Layout Polish: Resized the Record button and moved controls up for a cleaner look.',
          'Smart Controls: Pause/Discard buttons now hide automatically when recording is disabled.',
        ],
      },
    ],
  },
  {
    version: '0.9.13',
    date: '2026-01-13',
    title: 'Dark Mode Refined',
    codename: 'Obsidian',
    description:
      'We heard you! The track covers have been reimagined with a sleeker, darker, and more premium aesthetic.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Dark Premium Palettes: Replaced neon colors with deep blacks, blues, and charcoals.',
          'De-cluttered Interface: Removed the large "RAP" text overlay from track cards.',
          'Subtle Textures: Refined the noise and pattern overlays for a cleaner finish.',
        ],
      },
    ],
  },
  {
    version: '0.9.12',
    date: '2026-01-12',
    title: 'Visual Velocity',
    codename: 'Fresh Paint',
    description:
      'We have completely overhauled the track browser with a new Generative Art engine. Every beat now gets a unique, high-fidelity cover.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'Generative Covers: No more static gradients. Every track has unique, code-generated art.',
          'Streetwear Aesthetic: Added noise textures and bold typography overlays.',
          'Dynamic Patterns: Mesh gradients, neon shapes, and geometric grids.',
        ],
      },
    ],
  },
  {
    version: '0.9.11',
    date: '2026-01-12',
    title: 'UI Hotfix',
    codename: 'Clean Sweep',
    description:
      'Removed the redundant Daily Streak widget from the Difficulty Selection page. Tracking is now exclusively via the header icon.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'UI Cleanup: Removed the duplicate "Keep the Streak" widget from the center of the Skill Check page.',
        ],
      },
    ],
  },
  {
    version: '0.9.10',
    date: '2026-01-12',
    title: 'The Cypher Polish',
    codename: 'Neon Squad',
    description:
      'Refining the Cypher Mode experience with distinct player identities and cleaning up global header rendering.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'Cypher Player Roster: Implemented game-like avatars with unique colors (Purple, Orange, Gold, Green, Blue) for each player.',
          'Hover Streak Widget: Moved the Streak details into a tooltip to reduce header clutter.',
          'Header Cleanup: Resolved text duplication issues in the window title for a cleaner app presence.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          'Manifest Update: Shortened app name to "FreeStyla" to prevent title redundancy.',
          'Color Logic: Fixed "all blue" bug by correcting accent color definitions in the theme.',
        ],
      },
    ],
  },
  {
    version: '0.9.7',
    date: '2026-01-12',
    title: 'Precision Sync Update',
    codename: 'Grid Lock',
    description:
      'We fixed a critical timing bug where switching difficulties mid-session would cause words to drift off-beat. Now, everything snaps perfectly to the musical grid.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'Grid Alignment: Difficulty switches now "snap" to the next musical phrase.',
          'Visual Sync: Timer ring always starts fresh on new words, no matter when you switch.',
          'Cypher UI: Relocated player indicator to the bottom controls.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          'Playback: Fixed "Failed to play recording" error for new uploads.',
        ],
      },
    ],
  },
  {
    version: '0.9.5',
    date: '2026-01-11',
    title: 'Career Update',
    codename: 'Wave 2',
    description:
      'The "Career Update" is here! We added 27 new achievements to track your rise from rookie to legend, plus better timer visibility and stability fixes.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Added 27 new achievements (XP, Streaks, Skill, Volume)',
          'Enhanced database seeding for new achievements',
        ],
      },
      {
        category: 'Visual Overhaul',
        items: [
          'Increased session timer size for better readability in the Booth',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: ['Fixed build system type errors for smoother deployments'],
      },
    ],
  },
  {
    version: '0.9.4',
    date: '2026-01-11',
    title: 'High Contrast Update',
    codename: 'Visual Loyalty',
    description:
      'Improving accessibility with higher contrast settings menus and finalizing the Global Header rollout.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'High Contrast Settings: Darker backgrounds and brighter text for better readability.',
          'Global Headers Complete: Finalized AppHeader integration across Search and Admin pages.',
        ],
      },
    ],
  },
  {
    version: '0.9.3',
    date: '2026-01-11',
    title: 'Global Header Architecture',
    codename: 'Consolidated Identity',
    description:
      'Replacing inconsistent page headers with a unified, context-aware global header system that improves mobile visibility and branding.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'Global Header System: Unified AppHeader across all pages (Practice, Recordings, Admin, etc.).',
          'Dynamic Branding: Custom titles (e.g., "THE BOOTH") replace static "FreeStyla" logo.',
          'Mobile Visibility: Increased header height and enabled subtitles on mobile.',
        ],
      },
    ],
  },
  {
    version: '0.9.2',
    date: '2026-01-10',
    title: 'Practice Player Polish',
    codename: 'Studio Tune-Up',
    description:
      'A focused update refining the Practice Mode experience and squashing critical audio bugs.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Session Timer Restored: The countdown is back, displayed below the word.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          '10-Minute Sessions: Fixed premature session termination.',
          'Gapless Loop: Eliminated audio gap when beats loop.',
          'Gamification Logic: Fixed 0-streak bug. Real stats now track.',
          'Branding Polish: Finalized FreeStyla rename in all exports.',
        ],
      },
    ],
  },
  {
    version: '0.9.1',
    date: '2026-01-10',
    title: 'The Mobile Flow',
    codename: 'App Native',
    description:
      'A major layout update transforming FreeStyla into a true single-screen experience. The app now feels native, with locked viewports and smooth internal scrolling.',
    changes: [
      {
        category: 'System Updates',
        items: [
          'Single-Screen Layout: The app viewport is now locked. No more full-page scrolling.',
          'Internal Scrolling: Content lists now scroll independently while keeping headers/footers fixed.',
          'Adaptive Design: Optimized for all mobile notches and safe areas.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          'Layout Stability: Fixed layout jitter and double scrollbars on mobile.',
          'Practice Page: Resolved type errors and modal stability issues.',
        ],
      },
    ],
  },
  {
    version: '0.9.0',
    date: '2026-01-10',
    title: 'The Rebrand',
    codename: 'FreeStyla',
    description:
      'A new identity. "FlowForge" is now "FreeStyla". We have also renamed the "Vinyl Collection" to "Beat Vault" and polished the gamification system for a unified, premium experience.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'Identity Shift: "FlowForge" branding replaced with "FreeStyla" across the entire application.',
          'Beat Vault: Renamed "Vinyl Collection" to "Beat Vault" to better align with our premium "Unlock the Vault" messaging.',
          'Navigation: "Vinyl" tab renamed to "Beats" for clarity.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          'Critical Audio: Resolved playback failures on the Practice Page for reliable sessions.',
          'Record Button: Fixed icon rendering issues for a cleaner look.',
          'Profile Images: Google profile pictures now correctly display in the sidebar.',
          'Victory Screen: Enhanced animations and data connection for the post-session summary.',
        ],
      },
    ],
  },
  {
    version: '0.8.1',
    date: '2026-01-10',
    title: 'The Social Polish',
    codename: 'Embedded Share',
    description:
      'Refining the recording sharing UI to use an embedded, non-overlapping layout.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'Embedded Share Menu: The sharing dropdown now pushes content down instead of floating, preventing UI overlap.',
          'Solid Backgrounds: Removed transparency from the share menu for better readability.',
        ],
      },
    ],
  },
  {
    version: '0.8.0',
    date: '2026-01-10',
    title: 'The Gamification Core',
    codename: 'Level Up',
    description:
      'The gamification system is now fully operational with real backend persistence for XP and Levels. No more placeholders.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Real XP Persistence: User levels and XP are now saved to the database.',
          'Scoring Engine: Earn 5 XP/word, 2 XP/second, and 100 XP/achievement.',
          'Live Victory Screen: Session summary now displays your actual database progress.',
        ],
      },
    ],
  },
  {
    version: '0.7.7',
    date: '2026-01-10',
    title: 'The Seamless Selection',
    codename: 'Direct Access',
    description:
      'Removing friction from the difficulty selection flow. We removed the "Enable Local Tracks" slider and made local uploads directly accessible in the beat dropdown by default.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'Direct Access: Removed the "Enable Local Tracks" slider. Local tracks are now always available in the beat dropdown.',
          'UI Cleanup: Simplified the Difficulty Selection interface.',
        ],
      },
    ],
  },
  {
    version: '0.7.6',
    date: '2026-01-10',
    title: 'The Heartbeat Update',
    codename: 'Visual Rhythm',
    description:
      'Refining the visual language with a pro-level waveform for uploads and restoring the classic Heart icon for favorites.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'Heart Restoration: Replaced the checkmark with a proper Heart icon for favoriting beats.',
          'Static Waveform: New SoundCloud-style visualization for beat calibration.',
        ],
      },
      {
        category: 'New Features',
        items: [
          'Precision Cue Points: Click or drag anywhere on the new full-width waveform to set your start point instantly.',
        ],
      },
    ],
  },
  {
    version: '0.7.5',
    date: '2026-01-10',
    title: 'The Final Polish',
    codename: 'XP Tuner',
    description:
      'A critical quality-of-life update focusing on the "gamification feel" and eliminating session friction. We rebalanced the XP system and cleaned up the victory screen.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'XP Rebalance: Shifted to action-based XP (10 XP/word + 1 XP/sec).',
          'Upload Core: Fixed "Failed to create upload URL" error.',
          'Victory Screen: Removed redundant "VICTORY" header.',
          'Display Timing: Word prompt waits for countdown.',
          'Exit Safety: Added "Leave Session?" confirmation modal.',
          'Ghost Voices: Fixed TTS persisting after navigation.',
        ],
      },
    ],
  },
  {
    version: '0.7.4',
    date: '2026-01-10',
    title: 'The Safety Update',
    codename: 'Secure Flow',
    description:
      'Protecting session data with stricter recording safety checks and ensuring reliable playback for deep-dives.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Track Change Safety: Changing beats during a recording now asks for confirmation, preventing accidental session loss.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          'Recording Review: Fixed playback failures in the detailed review page by implementing signed secure URLs.',
          'Achievement Text: "Legacy Milestone" is now correctly labeled as "Achievement Unlocked!".',
        ],
      },
    ],
  },
  {
    version: '0.7.3',
    date: '2026-01-10',
    title: 'The Studio Perfected',
    codename: 'Studio Prime',
    description:
      'Refined the studio interaction with intelligent defaults and mixed audio downloads for a complete production workflow.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Mixed Audio Download: Downloading a recording now intelligently merges the voice and beat into a high-quality WAV file.',
          'Studio Defaults: "Studio FX" Reverb is now ON by default for instant professional sound.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          'Beat Volume Slider: Fixed a critical bug where adjusting the beat volume would stop playback.',
          'Recording Playback: Recordings now properly play both the voice track and the beat track in sync.',
          'Studio Tools Visibility: Specialized tools are now open by default for easier discovery.',
        ],
      },
    ],
  },
  {
    version: '0.7.2',
    date: '2026-01-10',
    title: 'The Video Studio',
    codename: 'Cinema Verité',
    description:
      'Introduced a dedicated Video Export Studio page and refined the gamification UI for clarity.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Video Export Studio: A dedicated page for creating high-fidelity video exports of your sessions.',
          'Random Difficulty: Level 4 is now fully live, mixing words from all difficulty tiers.',
        ],
      },
      {
        category: 'Visual Overhaul',
        items: [
          'UI Clarity: Renamed "Difficulty Selection" to "Freestyle Session" and removed cluttered widgets.',
          'Real-Time Streaks: Fixed gamification displays to show live user data instead of placeholders.',
        ],
      },
    ],
  },
  {
    version: '0.7.1',
    date: '2026-01-10',
    title: 'The Mobile Polish',
    codename: 'Liquid Metal',
    description:
      'Transformed the Settings menu for mobile, improved navigation flow, and fixed the "Double Beat" upload bug.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'Collapsible Studio Controls: Audio settings are now tucked into a sleek accordion to save screen space.',
          'Compact Support Grid: Support links rearranged into a touch-friendly grid layout.',
          'Universal Back Navigation: Added back buttons to Terms, Privacy, and Calibration pages.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          'Duplicate Prevention: Fixed a bug where uploading a beat would show it twice in the list.',
          'Admin Restoration: Superadmins can once again upload directly to the public library.',
          'User Beat Upload: Added a clear "X" close button to the upload modal.',
        ],
      },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-01-10',
    title: 'The Admin Update',
    codename: 'Master Control',
    description:
      'Empowering Super Admins with full control over the beat library: curation, editing, and monetization.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Admin Dashboard: New /admin/beats interface for managing the platform catalog.',
          'Beat Reordering: Curate the playlist order with simple Up/Down controls.',
          'Metadata Editing: Fix typos or update Beat details (BPM, Artist, Genre) on the fly.',
          'Monetization Toggle: Instantly switch tracks between FREE and PRO tiers.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          'Beat Dropdown UI: Moved the Favorite (Heart) icon to the right for a cleaner list view.',
          'Database Sync: Added sortOrder support for persistent custom playlists.',
        ],
      },
    ],
  },
  {
    version: '0.6.2',
    date: '2026-01-10',
    title: 'The Zero State',
    codename: 'Pure Flow',
    description:
      'Achieved a "Zero Problem" build state, perfected audio loop handling, and finalized admin tools.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'Concurrent Playback: Implemented "Single Source of Truth" audio logic. Only one track plays at a time.',
          'Gapless Looping: Eliminated the restart gap in SessionPlayer and RecordingCard loops.',
          'Build Stability: Resolved 100% of lint warnings and type errors for a pristine codebase.',
          'Admin Management: Fixed Beat Reordering and Upload tools.',
        ],
      },
    ],
  },
  {
    version: '0.6.1',
    date: '2026-01-10',
    title: 'The Waveform Update',
    codename: 'Visual Flow',
    description:
      'SoundCloud-style waveform overhaul with tap-to-seek functionality and integrated review visualization.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'SoundCloud-Style Waveform: Two-tone coloring system (Purple Played / White Unplayed) across the entire platform.',
          'Integrated Review Waveform: A high-fidelity waveform has replaced the basic progress bar in the Session Review Studio.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          'Global Tap-to-Seek: Jump to any timestamp instantly by tapping the waveform in both upload and review modes.',
          'Calibration Marker: Restored the red "START" bar visibility during beat upload playback.',
          'Cue Point Mastery: Playback now correctly honors and starts from the defined cue point in the upload window.',
          'UI Cleanup: Removed the redundant "Test Start Point" button for a more streamlined calibration experience.',
        ],
      },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-01-09',
    title: 'The Studio Update',
    codename: 'Platinum Record',
    description:
      'Major release consolidating our audio engine overhaul, visual intensity updates, and the highly requested Studio Quality Export.',
    changes: [
      {
        category: 'New Features',
        items: [
          'Production Export: Download sessions with "Studio FX" (Reverb & Polish) baked in.',
          'Visual Intensity: Dynamic "Cop Siren" and Shake effects warn you of upcoming word changes.',
          'Guest Restoration: Unsaved guest sessions are now automatically restored after login.',
        ],
      },
      {
        category: 'System Updates',
        items: [
          'Audio Engine 2.0: Complete rewrite aiming for zero-latency start times on all devices.',
          'Security Lock: Integrity checks now prevent beat ripping by enforcing vocal volume rules.',
          'Safari Support: "Mute-Prime-Play" strategy guarantees playback reliability on iOS.',
        ],
      },
      {
        category: 'Fixes & Improvements',
        items: [
          'XP System: Fixed issue where XP/Levels would sometimes display as 0 after a session.',
          'Navigation: Standardized "Back" gestures across Review and Recording pages.',
          'Safety Nets: Added exit confirmations to prevent accidental data loss during practice.',
        ],
      },
    ],
  },
  {
    version: '0.5.9',
    date: '2026-01-09',
    title: 'The Final Polish',
    codename: 'Final Polish',
    description:
      'Resolved user-reported friction points in the practice session, including upload errors, exit confirmation, and precise timing logic.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'Upload Error: Fixed "Failed to create upload URL" by correcting bucket reference.',
          'Exit Confirmation: Added modal to prevent accidental session loss.',
          'Word Randomization: Ensured sessions start with random words every time.',
          'Display Timing: Word prompt waits for "GO" before appearing.',
          'TTS Cleanup: Speech stops immediately on navigation.',
        ],
      },
    ],
  },
  {
    version: '0.5.8',
    date: '2026-01-09',
    title: 'Sirens & Intensity',
    codename: 'High Intensity',
    description: 'Added high-intensity visual warnings before word changes.',
    changes: [
      {
        category: 'Visual Overhaul',
        items: [
          'Implemented "cop siren" alternating red/blue ring effects',
          'Added background pulsing and word shake animations during warnings',
          'Configured sirens to trigger 4s before every other word change',
        ],
      },
    ],
  },
  {
    version: '0.5.7',
    title: 'The Direct Flow',
    codename: 'Direct Flow',
    date: 'January 09, 2026',
    description:
      'Refined session handoff logic and streamlined Victory screen for a more direct post-session experience.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          "Session Termination: Fixed loop bugs where beats wouldn't stop after session end.",
          'Auto-Summary: Guaranteed modal trigger on session completion.',
          'Victory UI: Removed "Menu" button and centered "Continue" for a streamlined flow.',
        ],
      },
    ],
  },
  {
    version: '0.5.6',
    title: 'The Stable Circle',
    codename: 'Back to Basics',
    date: 'January 09, 2026',
    description:
      'Restored core practice UI and hardened architecture against serialization errors.',
    changes: [
      {
        category: 'Fixes & Improvements',
        items: [
          'Props Sanitized: Resolved persistent Next.js warnings about non-serializable props.',
          'UI Restoration: Reverted Practice Studio to original circular design.',
          'BeatDropdown: Embedded and retracted by default in practice mode.',
        ],
      },
    ],
  },
  {
    version: '0.5.5',
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
    version: '0.5.4',
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
    version: '0.5.3',
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
    version: '0.4.0',
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
    version: '0.3.0',
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
    version: '0.2.1',
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
    version: '0.1.8',
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
    version: '0.1.7',
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
    version: '0.1.5',
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
    version: '0.1.4',
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
    version: '0.1.3',
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
    version: '0.1.1',
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
