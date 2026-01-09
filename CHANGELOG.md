# Changelog

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
