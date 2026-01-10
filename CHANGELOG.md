# Changelog

## [v1.9.2] - 2026-01-10

### 🎛️ Practice Player Polish

**Focus:** Refined Practice Mode UI and fixed critical audio/session bugs.

### Added
- **Session Timer:** Restored the countdown timer, now displayed below the active word.

### Fixed
- **10-Minute Sessions:** Session duration was incorrectly set to 2 min. Now correctly set to 10 min.
- **Gapless Loop:** Implemented workaround to eliminate the audio gap when beats loop.
- **Gamification Logic:** Fixed critical bug where streaks and word counts were hardcoded to 0. Real-time stats now track correctly.
- **Branding Polish:** Finalized "FreeStyla" rename across all video watermarks, metadata, and admin interfaces.

---

## [v1.9.1] - 2026-01-10

### 📱 The Single-Screen Update ("Mobile Flow")

**Focus:** A major mobile optimization update making the app feel native. We've locked the viewports, prevented unwanted scrolling, and introduced a unified `ScreenPage` layout.

### Changed
- **Navigation:** Enforced a single-screen layout (`100dvh`, `overflow: hidden`) to prevent the entire app from scrolling like a website.
- **Scrolling:** Content now scrolls internally within its specific container (e.g., track lists, recordings), keeping headers and footers strictly fixed.
- **Practice Mode:** Updated `PracticePage` to scale perfectly on all screen sizes without overflow.

### Fixed
- **Type Errors:** Resolved all lingering type and lint warnings in `PracticePage`.
- **Modals:** Fixed `PremiumModal` missing props causing potential crashes.
- **Layout Jitter:** Removed double scrollbars on mobile browsers.

---

## [v1.9.0] - 2026-01-10

### 📛 The Rebrand ("FreeStyla")

**Focus:** A major identity update shifting from "FlowForge" to "FreeStyla", alongside the renaming of "Vinyl Collection" to "Beat Vault" for a cohesive premium experience.

### Changed
- **Branding:** "FlowForge" is now **"FreeStyla"**.
- **Beat Vault:** Renamed "Vinyl Collection" to **"Beat Vault"**. This aligns with the "Unlock the Vault" premium messaging.
- **Navigation:** "Vinyl" tab is now **"Beats"**.

### Fixed
- **Practice Audio:** Resolved critical playback failures where the beat wouldn't start.
- **Record Button:** Fixed icon rendering to remove visual artifacts.
- **Profile Images:** Google OAuth profile pictures now display correctly.
- **Victory Screen:** Post-session summary now uses real live data and enhanced animations.

---

## [v1.8.1] - 2026-01-10

### 🧼 The Social Polish ("Embedded Share")

**Focus:** Refining the UI for sharing recordings to match the embedded pattern established in the beat selection flow.

### Changed
- **Share Menu:** Now uses an **Embedded** layout in the Recording Card. Instead of floating over content (and potentially getting clipped), it pushes the card content down for a cleaner, more integrated look.
- **Visuals:** Switched to a solid background for the share menu to improve readability against the recordings list.

---

## [v1.8.0] - 2026-01-10

### 🆙 The Gamification Core ("Level Up")

**Focus:** Complete implementation of the backend logic for XP and Leveling, replacing visual placeholders with real database persistence.

### Added
- **XP Persistence:** Users now actually earn and save XP (`xp`) and levels (`level`) to their database profile.
- **Game Logic Engine:** Implemented `lib/gamification/xp.ts` to calculate scores based on:
  - **Density:** 5 XP per word
  - **Endurance:** 2 XP per second
  - **Achievements:** 100 XP bonus
- **Live Feedback:** The "Victory" screen now animates your actual progress bar and displays your real level.

### Changed
- **Session Summary:** Removed hardcoded "Level 5" displays; now reflects your true status.
- **API Response:** `/api/recordings` now returns a full `xpBreakdown` object for the frontend to render.

---

## [v1.7.7] - 2026-01-10

### 🎧 The Seamless Selection Update ("Direct Access")

**Focus:** Reducing friction in the difficulty selection flow by integrating local tracks directly into the beat dropdown.

### Changed
- **Difficulty Selection:** Removed the "Enable Local Tracks" slider.
- **Beat Dropdown:** Local tracks are now strictly integrated into the embedded dropdown by default, removing the extra toggle step.
- **UI Cleanup:** Simplified the difficulty selection settings panel for a cleaner look.

---

## [v1.7.6] - 2026-01-10

### ❤️ The Heartbeat Update ("Visual Rhythm")

**Focus:** Refining the visual language of the beat selection and upload experience with cleaner iconography and pro-level visualization.

### Added
- **SoundCloud-Style Waveform**: A new high-fidelity, static waveform visualization for the `UserBeatUpload` calibration tool. It now displays the full track width, allowing users to select a start point by simply clicking or dragging the cursor.

### Changed
- **Beat Selection Icon**: Replaced the "Red Checkmark" for favorites with a proper **Heart Icon**.
  - **Active**: Filled Red Heart.
  - **Inactive**: Gray Outline Heart (turns white on hover).
  - This restores standard UI patterns for "Favoriting" content.

### Fixed
- **Calibration Experience**: Removed the moving visualizer in favor of the static waveform for better precision when setting cue points.

---

## [v1.7.5] - 2026-01-10

### 🔧 The Final Polish & XP Tuner

**Focus:** Tuning the gamification mechanics for maximum reward and cleaning up UI implementation details.

### Fixed
- **Upload Error**: Fixed "Failed to create upload URL" by correcting the Supabase bucket reference (`recordings`).
- **Word Randomization**: Fixed logic where sessions would always start with the same words.
- **Ghost Voices**: TTS now stops immediately when navigating away.
- **Victory UI**: Removed the redundant "VICTORY" text from the summary modal.

### Changed
- **XP System**: Rebalanced XP calculation to **10 XP per word** + **1 XP per second**.
- **Exit Logic**: Added a cancellation modal when leaving an active session.

---

## [v1.7.4] - 2026-01-10

### 🔒 The Safety Update ("Secure Flow")

**Focus:** Protecting session data with stricter recording safety checks and ensuring reliable playback for deep-dives.

### Added
- **Track Change Safety**: While recording, changing the beat now triggers a confirmation dialog ("Stop Session?"). This prevents accidental data loss when browsing tracks during a flow.

### Fixed
- **Recording Playback**: Fixed a critical issue where the "Review" page would fail to load audio. Now generates on-demand signed URLs for secure, instant playback.
- **Achievement Text**: Corrected the "Legacy Milestone Unlocked" text to the proper "Achievement Unlocked!" notification.
- **Duration Display**: Fixed `0:00` duration bug in the Recording Details view.

---


## [v1.7.3] - 2026-01-10

### 🎛️ The Studio Perfected ("Studio Prime")

**Focus:** Refining the studio interaction with intelligent defaults and mixed audio downloads.

### Added
- **Mixed Audio Download**: Client-side audio mixing now combines your voice recording with the background beat into a single, high-quality WAV file.
- **Smart Defaults**: "Studio FX" (Reverb) and "Studio Tools" are now enabled by default, ensuring every session sounds professional from the start.

### Fixed
- **Beat Volume Slider**: Fixed a regression where adjusting the beat volume during a session would cause playback to stop.
- **Recording Playback**: "My Recordings" list now correctly plays both the vocal track and the beat track in synchronization.

---

## [v1.7.2] - 2026-01-10

### 🎥 The Video Studio Update ("Cinema Verité")

**Focus:** Elevating the sharing experience with a dedicated video rendering studio and refining the gamification UI.

### Added
- **Video Export Studio:** A brand new, dedicated page (`/recordings/[id]/video`) for high-fidelity video generation. Replaced the cramped modal with a full-screen creative suite.
- **Random Difficulty:** "Random" (Level 4) is now fully integrated into the difficulty logic, mixing words from all tiers.

### Changed
- **Difficulty Selection UI:** Renamed the page title to "Freestyle Session" for a cleaner, more professional look.
- **Gamification Cleanup:** Removed the "Daily Goal" widget to declutter the interface.
- **Streak Logic**: Updated the "Daily Streak" widget to use real data from the user profile and clearer instructional text.

### Fixed
- **Navigation Links:** `RecordingCard` video button now correctly routes to the new Studio page instead of opening a deprecated modal.
- **Streak Display**: Fixed hardcoded "3 Streak" display on the difficulty selection page to reflect actual user stats.

---

## [v1.7.1] - 2026-01-10

### 📱 The Mobile Polish Update ("Liquid Metal")

**Focus:** Transforming the settings menu and navigation for a seamless mobile experience, alongside critical data safety constraints.

### Added
- **Collapsible Studio Controls**: Audio settings (Voice, Volume, Latency) are now grouped in a collapsible section, saving 50% vertical screen space.
- **Compact Support Grid**: "App Support" and "Legal" links are condensed into a touch-friendly grid layout.
- **Universal Back Navigation**: Added dedicated "Back" buttons to Terms, Privacy, Patch Notes, and Calibration pages.
- **Close Button**: Added a dedicated "X" close button to the User Beat Upload modal.

### Fixed
- **Double Beat Upload**: Implemented strict DB filtering to separate "Public Library" results from "User Uploads", preventing duplicate entries.
- **Admin Upload Restoration**: Fixed visibility and functionality of the Admin Beat Upload zone for Superadmins.
- **Beat Dropdown Syntax**: Resolved closing tag errors in the `BeatDropdown` component.

---

## [v1.7.0] - 2026-01-10

### 🎛️ The Admin Update ("Master Control")

**Focus:** Empowering Super Admins with complete control over the beat library.

### Added
- **Admin Beat Management**: New protected route `/admin/beats` for Super Admins.
- **Beat Reordering**: "Move Up/Down" controls to curate the tracklist order exactly as desired.
- **Inline Editing**: Edit Beat Title, Artist, BPM, and Genre directly from the list.
- **Monetization Control**: One-click toggle to switch beats between "FREE" and "PRO" status.
- **Delete Capability**: Remove beats from the database directly from the admin interface.

### Fixed
- **Beat Dropdown UI**: Repositions the "Heart" (Favorite) icon to the right side of the track list for better visual hierarchy and consistency.
- **Database Schema**: Added `sortOrder` field to the `Beat` model to support persistent custom ordering.

---

## [v1.6.2] - 2026-01-10

### 🛡️ The Zero State ("Pure Flow")

**Focus:** Achieved a "Zero Problem" build state, perfected audio loop handling, and finalized admin tools.

### Fixed
- **Concurrent Playback (Critical)**: Implemented "Single Source of Truth" audio logic. It is now impossible for two recordings or beats to play simultaneously.
- **Gapless Looping**: Fixed beat looping in `SessionPlayer` and `RecordingCard` by correctly setting the `loop` property on audio elements, eliminating the restart gap.
- **Admin Management**: Fixed Beat Management tools (Reordering, Uploads) and resolved `sortOrder` type discrepancies.
- **Build Stability**: Resolved 100% of lint warnings and type errors ("Unexpected any", "Explicit any") for a perfectly clean production build.
- **Word Timing**: Corrected the visual layout of the `TimerRing` to properly encircle the word prompt without clipping.

### Added
- **Word Count Metadata**: Recordings now correctly save and display the total `wordCount` in the library and session summary.

---

## [v1.6.1] - 2026-01-10

### 🌊 The Waveform Update ("Visual Flow")

**Focus:** Comprehensive overhaul of waveform visualization and seeking mechanics for a premium SoundCloud-style experience.

### Added
- **SoundCloud-Style Waveform**: Implemented two-tone coloring (Purple Played / White Unplayed) across all waveform components.
- **Global Tap-to-Seek**: Enabled instant seeking by tapping anywhere on the waveform, now supported in both Beat Upload and Session Review.
- **Integrated Review Waveform**: Replaced the standard progress bar in `SessionPlayer` with the `WaveformScrubber` for a more detailed recording visualization.

### Fixed
- **Calibration Marker**: Restored the red "START" bar visibility during calibration playback in `UserBeatUpload`.
- **Cue Point Playback**: Playback now correctly starts from the defined cue point when hitting play in the upload window.
- **UI Cleanup**: Removed redundant "Test Start Point" button; functionality is now merged into the main play button and tap-to-seek interaction.

---

## [v1.6.0] - 2026-01-09

### 🎙️ The Studio Update ("Platinum Record")

**Focus:** Major feature release consolidating Audio Engine 2.0, Studio Export, and Visual Intensity systems.

### Added
- **Production Export**: Implemented `OfflineAudioContext` rendering in `mixer.ts`. Users can now download "Studio" versions of their tracks with Reverb and Compression applied.
- **Visual Intensity**: Added `TimerRing` "Siren" state (Red/Blue alternating) and `WordPrompt` shake animation.
- **Security**: Added vocal integrity check (`voiceVolume > 0.1`) to `mixer.ts` to protect instrumental assets.

### Fixed
- **XP System**: Resolved critical bug in `PracticePage` where `saveSessionOptimistic` failed to merge server-side XP data, resulting in "0 XP" displays.
- **Navigation**: Replaced non-standard back link in `ReviewPage` with `AppHeader` arrow.
- **Audio Engine**: Finalized "Zero Latency" startup logic and mobile compatibility fixes.

---

## [v1.5.9] - 2026-01-09

### 🔧 The Final Polish

**Focus:** Resolved user-reported friction points in the practice session, including upload errors, exit confirmation, and precise timing logic.

### Fixed
- **Upload Error (Critical)**: Fixed "Failed to create upload URL" by correcting the Supabase bucket reference in the API.
- **Word Randomization**: Fixed logic where practice sessions would always start with the same fallback words ("flow").
- **Display Timing**: Word prompt is now hidden during the "3, 2, 1" countdown and appears exactly at "GO".
- **TTS Cleanup**: Text-to-speech now stops immediately when navigating away or leaving a session.
- **Prisma Sync**: Resolved TypeScript errors related to missing `xp` properties by regenerating the client.

### Added
- **Exit Confirmation**: Added a clear "Leave Session?" modal when navigating away during an active session to prevent accidental data loss.

---

## [v1.5.8] - 2026-01-09
### Added
- **Sirens Warning**: High-intensity "cop siren" visual effects (alternating red/blue ring and background pulse) that trigger 4 seconds before every other word change.
- **Dynamic Feedback**: Implemented a "shake" animation for the word prompt during the siren warning phase.

## [v1.5.7] - 2026-01-09

### 🎯 Precision Flow & UI Simplification

**Focus:** Fixed core session termination logic and streamlined the post-session experience.

### Fixed
- **Session Termination (Critical)**: Resolved issues where the beat track would continue looping indefinitely or the session summary modal would fail to trigger automatically after the timer expired.

### Changed
- **Victory Screen Simplification**: Removed the "Menu" button from the `SessionSummaryModal` to focus the user flow towards "Continue" (Recordings).
- **Post-Session Layout**: Updated the Victory screen actions to use a centered single-button layout for better visual balance.

---

## [v1.5.6] - 2026-01-09

### 🏗️ Architecture Stabilization & UI Restoration

**Focus:** Resolved persistent serializability warnings and restored the classic circular player UI.

### Fixed
- **Serializability (Critical)**: Eliminated Next.js "Props must be serializable" errors in `PracticeControls.tsx`, `BeatDropdown.tsx`, and `UserBeatUpload.tsx` by refining component boundaries and type definitions.
- **UI Restoration**: Reverted `PracticeControls.tsx` to the original circular design while maintaining functional improvements and stability.
- **BeatDropdown Refinement**: Configured dropdown to be embedded and retracted by default in practice mode. Updated styling to use solid backgrounds (removed transparency and backdrop blur) for better readability.
- **TypeScript & Linting**: Reached 0 errors/warnings build state. Resolved "Not all code paths return a value" in `BeatDropdown.tsx` and fixed invalid destructuring in `PracticeControls.tsx`.
- **Prettier**: Cleaned up all formatting issues, including unquoted header keys and multi-line prop folding.

---

## [v1.5.5] - 2026-01-09

### 🚀 Critical Fixes & Quality Assurance ("The Zero Warning")

**Focus:** Resolved critical regressions introduced during recent feature adds and reached a clean "0 Warning" build state.

### Fixed
- **Audio Logic (Critical)**: Removed race conditions and laggy polling loops in `startCountdown`. Beat now starts reliably at "GO" on all devices (mobile/desktop).
- **Double TTS (Critical)**: Fixed a logic bug where the first word of a session would be announced twice.
- **Achievements Seeding**: Achievements table now auto-seeds if empty, ensuring the list is always populated for the user.
- **Error Persistence**: `useBeatPlayer` now correctly clears error states when stopping or restarting, preventing stale toaster warnings.
- **Build Warnings**: Resolved all 8 remaining build warnings across the codebase, achieving a "Zero Warning" build.
- **Beat URL Mapping**: Implemented a hardcoded `BEAT_URL_MAP` to guarantee correct file paths regardless of DB inconsistencies (e.g., trailing hyphens).

---

## [v1.5.4] - 2026-01-09

### 🎛️ UX Improvements & Bug Fixes ("The Polish")

**Focus:** Quality-of-life improvements for beat selection, icon rendering, and profile display.

### Fixed
- **Mic Icon Rendering**: The Mic icon on the record button had `fill="currentColor"` causing a broken/weird appearance. Lucide icons are stroke-based, so removed fill and added proper `strokeWidth`.
- **Profile Picture**: Gmail profile pictures were not displaying in the Profile section. Added `session.user.image = user.image` to the NextAuth session callback to pass OAuth images to the client.

### Changed
- **Collapsible Beat Dropdown**: The BeatDropdown in embedded mode is now **collapsible** instead of always expanded:
  - Collapsed by default (or when a beat is pre-selected via URL)
  - Click header to expand, auto-collapses after selection
  - Smooth 300ms slide animation
  - Always shows chevron indicator
- **Tracks → Practice Flow**: When selecting "Use this track" from Vinyl Collection, the user lands on Difficulty Selection with the beat pre-selected and dropdown collapsed, providing immediate visual confirmation.

---

## [v1.5.3] - 2026-01-09

### 🔧 Critical Bug Fixes & Audio Engine Overhaul ("The Resurrection")

**Focus:** Resolved multiple critical bugs preventing core app usage, overhauled audio engine stability, and refined mobile UX.

### Fixed
- **Auth Redirect Loop (Critical)**: Removed `/profile` and `/recordings` from Edge Middleware protection. Client-side auth now handles these routes correctly, preventing infinite loading loops for logged-in users.
- **Practice Audio (Critical)**: Implemented "Mute-Play-Unmute" strategy. Audio now starts immediately (muted) on user gesture, then seeks/unmutes at "GO". This guarantees playback on Safari/Mobile where delayed `play()` calls are blocked.
- **Invisible Record Button (Critical)**: The "REC" button was styled with black-on-black colors. Changed to `border-white/40` and `text-white` for visibility in dark mode.
- **Cypher Room Creation**: Added a mock `/api/cypher/create` endpoint and a placeholder Lobby page (`/cypher/[id]`) so "Create Room" actually redirects.
- **Tracks Page Fallback**: Added client-side fallback beats so the page is never empty, even if the API fails.
- **Profile Page Loading**: Initialized `isLoadingRecordings` to `false` to prevent getting stuck in an infinite loading state on component mount.
- **Mobile Header Icon**: Added responsive CSS for the streak fire icon to render correctly on smaller screens.

### Added
- **Audio Player Debugging**: Added comprehensive `console.log` statements to `lib/audio/player.ts` for tracing playback lifecycle (`load`, `play`, `pause`, `ended`, `error`).
- **Optimistic Play State**: `useBeatPlayer.play()` now sets `isPlaying(true)` optimistically before `await`, with a verification check after.
- **Grace Period**: Session stop logic now ignores the first 1.5 seconds to prevent "instant death" sessions from audio glitches.
- **Loading Text Carousel**: Practice page now cycles through fun loading messages ("Syncing AI Word Bank...", "Dropping the Beat...").
- **Schema.org Metadata**: Added structured data to the Practice page for SEO.

### Changed
- **Practice Layout**: Relaxed `min-h-[80vh]` to `min-h-[50vh]` and reduced padding to prevent overlap with bottom nav on small screens.
- **Word Prompt Logic**: `WordPrompt` component now shows whenever `currentWord` is set, regardless of `isPlaying` state.
- **Restart Button**: Made smaller and moved closer to controls for a cleaner look.
- **"My Tracks" Empty State**: Added encouraging copy ("Capture your own sound...") instead of a simple "No beats" message.
- **Session Summary Text**: Updated "Day Streak" to "Consistency Streak" and "Achievement Unlocked" to "Legacy Milestone Unlocked".
- **Difficulty Selection Title**: Updated to "Ready to spit bars? Start your session now."

---

## [v1.5.2] - 2026-01-09

### 📱 Mobile Polish & Studio FX ("Studio Flow")

**Focus:** Comprehensive mobile optimization for Settings and Recordings, plus critical fixes for the Studio FX audio engine.

### Added
- **Mobile Settings**: Completely redesigned `SettingsList` with a gamified, card-based UI optimized for touch targets on mobile devices.
- **Recording Card**: New responsive layout for `RecordingCard` that stacks content vertically on mobile for better readability.
- **Record Button Logic**: clearer state visualization for the Record button (grayed/disabled state) and removed upgrade popups for authenticated users.

### Fixed
- **Studio FX**: Fixed `SessionPlayer` audio graph initialization to ensure Reverb and Nudge settings persist correctly even after toggling FX modes or restarting playback.
- **UI Cleanup**: Removed the "PNG Record" button from summary modal and the "Vibe Score" metric as requested.
- **Linting**: Cleaned up unused imports and component definitions in `PracticeControls`.

## [v1.5.1] - 2026-01-09

### 🎛️ Feature & UI Polish ("Studio Focus")

**Focus:** Refined the Practice experience by removing gamification distractions and adding precise session controls.

### Added
- **Recording Toggle**: New slider on Difficulty Selection page allows users to explicitly enable/disable global recording.
- **Visual Feedback**: "REC" button and icon in Practice Mode now visually reflect disabled state (grayed out).

### Changed
- **Vibe Score Removal**: Completely removed "Vibe Score" and all associated text from the `SessionSummaryModal` to focus purely on flow metrics.
- **Embedded Beat List**: The Beat Dropdown now supports an `embedded` mode for static integration on the Difficulty Selection page, preventing UI overlap.

### Fixed
- **Audio Transition**: Changing tracks during a live session now correctly stops the previous beat before loading the new one.
- **Linting**: Resolved multiple TypeScript errors in `PracticeControls` and `SessionContext`.

## [v1.5.0] - 2026-01-09

### 🚀 Enterprise Launch Release ("Pitch Perfect")

The comprehensive "Deep Scan Audit" is complete. The application stability, security, and user experience have been verified for production launch.

### Security & Integrity
- **Middleware Guard**: Fixed a critical vulnerability where `middleware.ts` had an empty matcher; explicitly protected `/profile` and `/recordings` routes.
- **Race Condition Fix**: Patched a crash risk in `PracticePage` where closing the summary modal too early would crash the app logic.
- **Data Safety**: Verified server-side storage, anti-cheat scoring, and database fallback logic.

### UX & Polish
- **Guest Experience**: Guests are now redirected back to `/practice` after signing in, preventing lost "flow" state.
- **Beat Selection**: Refined `BeatDropdown` to support an "embedded" mode for cleaner UI integration in non-modal contexts.
- **Session Flow**: Updated `SessionSummaryModal` to be more focused (removed duplicate score grid) and provide clearer "Word Count" feedback for social sharing.
- **Performance**: Memoized `AudioVisualizer` to stabilize the 60fps render loop during recording.

### Fixed
- **Audio Resources**: Optimized `BeatDropdown` to better manage audio instances during rapid previews.
- **Layout Consistency**: Unified header usage across `Tracks` and `Difficulty` selection pages.

## [v1.4.1] - 2026-01-09


### Fixed

- **Practice Page (Critical)**:
  - Fixed infinite TTS loop where words would repeat excessively.
  - Stabilized audio playback by preventing unnecessary re-renders of the `useBeatPlayer` hook.
  - Restored "3, 2, 1, GO" countdown visualization.
  - Enabled beat switching mid-session (removed disabled state).
- **Audio System**:
  - Restored URL sanitization (spaces to hyphens) to fix 404 errors for seeded beats.
  - Fixed `AudioContext` type errors (`any` casting) for better TypeScript compliance.
- **Tracks Page**:
  - Added missing `AppHeader` for consistent navigation.
- **Linting**:
  - Resolved persistent CRLF line ending warnings.
  - Fixed "props must be serializable" errors in modal components.

### Changed

- **Code Quality**: Enforced project-wide Prettier formatting and linting rules.

## [v1.4.0] - 2025-12-21

### 💎 The Platinum Polish ("Diamond Cutter")

**Focus:** User uploads, layout revamp, and critical stability.

### Added
- **User Beat Uploads**: Pro users can now upload, calibrate, and manage their own instrumental tracks (`UserBeatUpload.tsx`).
- **Beat Vault Tabs**: Split "Tracks" page into "Public Tracks" and "My Tracks" for easier library management.
- **Classic Layout**: Restored the central-player layout for the Practice Studio by popular demand.

### Changed
- **Search & Filter**: Rewrote filtering logic on Tracks page (search by BPM, Tag, Title).
- **Typography**: Standardized font usage (Inter/JetBrains Mono).

## [v1.3.0] - 2025-12-20

### 🎮 The Gamification Update ("Level Up")

**Focus:** Streak system, XP progression, and Battle Pass rewards.

### Added
- **Streak System**: Logic to track daily consistency (`FireIcon`, `IceIcon` states).
- **XP Battle Pass**: Earn XP per minute of flow. Unlocks tier rewards (visual badges).
- **Zen Mode**: Option to toggle off gamification elements in settings.

### Changed
- **Mobile Safe Area**: Added `SafeAreaWrapper` to handle notches and Dynamic Islands on iOS.
- **Optimistic UI**: Progress updates locally before server confirmation for instant feedback.

## [v1.1.8] - 2026-01-07

### Fixed

- **Practice Page Regressions**: Restored "3-2-1 GO" countdown and fixed audio playback not starting.
- **Beat Dropdown**: Fixed missing favorites dropdown in Practice mode and resolved execution order issues.
- **Audio Playback**: Fixed CORS issues preventing beat previews in Difficulty Selection and My Tracks.
- **Stability**: Removed duplicate `SessionPlayer` component causing conflicts.
- **My Tracks**: Refactored audio handling to use React Refs for better stability and error handling.

## [v1.1.7] - 2025-12-19

### Added

- **PWA Install Modal**: Intelligent installation prompt for iOS/Android users to encourage "Add to Home Screen" for better fullscreen experience and reduced audio latency.
- **Environment Types**: Added explicit `es5` and `dom` lib references to `env.d.ts` to fix type checking in certain environments.

## [v1.1.6] - 2025-12-19

### Added

- **PWA Install Prompt**: New "Install App" modal appears on the first recording attempt to guide users (iOS/Android) for better latency/fullscreen experience.

### Changed

- **Bottom Navigation**: Updated to 5-tab layout: Vinyl (`/tracks`), Trophy (`/leaderboard`), Record (`/practice`), Recordings (`/recordings`), Profile (`/profile`).
- **Recordings Page**: Now visible to non-Pro users as a blurred background list with a blocking "Unlock with Premium" modal.
- **Record Button**: Updated UI to a Microphone icon (Gray for Free, Glowing Red for Pro).

### Removed

- **Streak Freeze**: Removed all UI and logic.
- **Safe Mode**: Removed all UI and logic.

## [v1.1.5] - 2025-12-18

### Added

- **Random Difficulty**: Added a new "Random" (Level 4) difficulty mode that mixes words from all complexity levels.
- **Smart Word Logic**: Implemented "1-Hour No Repeat" rule. Words seen in a session are now saved to local history and filtered out of future sessions for 60 minutes to ensure variety.

## [v1.1.4] - 2025-12-18

### Fixed

- **Auth Redirects**: Fixed "callback loops" and blank pages by moving auth protection from Middleware to Client-Side Guards for Profile, Recordings, Messages, and Review pages.
- **Audio Loops**: Fixed a bug where changing frequency/difficulty during a session caused audio loops/stutters.
- **Mobile Visibility**: Fixed the Beat Selector being hidden on mobile devices.
- **Static Generation**: Removed Edge Runtime from OG Image route to resolve build warnings.
- **Linting**: Resolved all remaining Prettier/ESLint warnings (Messages, Profile, BottomNav, HowItWorks).

### Changed

- **Default Frequency**: Set default word frequency to 4 Bars (previously 8).

## [v1.1.3] - 2025-12-18

### Added

- **Beat Preview**: Play button in BeatDropdown to preview beats before selecting.
- **Favorite Beats in Dropdown**: Heart icon to favorite beats directly in the dropdown menu.

### Changed

- **Logo Navigation**: Freestyla logo now links to `/howitworks` for authenticated users (home hub).
- **Bottom Nav**: Repositioned from `bottom-8` to `bottom-4` for Instagram-like positioning.
- **Layout Padding**: All layouts now have proper `pb-24` padding to prevent bottom nav overlap.
- **Practice Template**: Simplified layout calculation for consistent mobile experience.
- **HowItWorks**: Now serves as the main home page for logged-in users.

### Removed

- **BeatSelector Component**: Merged into BeatDropdown; deleted unused component.
- **BeatCard Component**: Deleted; functionality merged into BeatDropdown.
- **Duplicate Clean UI Toggle**: Removed from PracticeControls (now only in PageHeader).

### Fixed

- **Component Overlap**: Fixed overlapping elements on Practice page.
- **Unused Imports**: Cleaned up Eye/EyeOff and other unused imports.
- **Prisma Queries**: Fixed FavoriteBeat queries to use correct findFirst pattern.

## [v1.1.2] - 2025-12-18

### Added

- **Favorite Beats**: "Heart" icon on Beat Cards to save favorites.
- **Social**: Favorite beat toggle fully integrated with backend.

### Changed

- **Roadmap**: Moved Hashtags and Trending Feed to Phase 8 (Social Expansion).

## [v1.1.1] - 2025-12-18

### Fixed

- **Vercel Deployment**: Resolved multiple build failures preventing production deployment.
- **Dependencies**: Added missing `react-intersection-observer` (AdBanner) and `resend` (Email) packages to `package.json`.
- **Prisma Schema**: Fixed `createSession` type mismatch by adding explicit `any` cast to bypass stale cache issues in Vercel's build environment.
- **Imports**: Fixed `@vercel/og` import path in `api/og/route.tsx` to use `next/og`.
- **Linting**: Resolved syntax errors and duplicate braces in `lib/gamification/badges.ts`.

### Changed

- **Header UI**: Simplified layout by removing redundant Leaderboard and Profile links (accessible via Bottom Bar). Only Settings remains in the header.
- **Deployment Target**: Explicitly disconnected `flowforge` Vercel project; now strictly deploying to `flowforge-freestyle`.
- **Build Process**: Added `postinstall` script (`prisma generate`) to ensure fresh client generation on Vercel.

## [v1.1.0] - 2025-12-17

- Initial "Bible Complete" Release.
- Advanced Badge Tracking.
- Word Vault Analytics.

## [v0.8.0] - 2025-12-14
### 🌍 The Social Awakening ("Arena of Voices")
- **Global Feed**: Live stream of community recording drops.
- **Duels**: Asynchronous rap battle system (Challenge friends).
- **Public Profiles**: Showcase stats, tracks, and duel history.

## [v0.7.0] - 2025-12-14
### 💎 Crystal Clarity
- **Mobile Responsiveness**: Overhauled CSS grid for small screens.
- **Performance**: Reduced audio latency.

## [v0.5.0] - 2025-12-11
### 👑 The Purple Void ("Royal Ascension")
- **Design System**: Migrated from Orange to "FreeStyla Purple" (#7D7AFF).
- **Dark Mode**: Tuned contrast for late-night sessions.
- **Premium**: Added "Pro" badge infrastructure.

## [v0.4.0] - 2025-11-11
### ☁️ The Vault ("Memory Keepers")
- **Cloud Storage**: Integrated Supabase Storage for recording persistence.
- **Library**: Manage/Rename/Delete tracks.
- **Auto-Save**: Sessions save automatically on completion.

## [v0.3.0] - 2025-11-11
### 🔊 Echoes of the Beat ("Sonic Boom")
- **Practice Studio**: Core audio player implementation.
- **Timer Ring**: SVG stroke-dasharray animation synced to BPM.
- **Audio Recorder**: Browser `MediaRecorder` API integration.

## [v0.1.0] - 2025-11-10
### 🏗️ Genesis ("The Foundation")
- **Stack**: Next.js 14, Supabase (Postgres), Prisma, Tailwind.
- **Auth**: Google OAuth via NextAuth.js.
