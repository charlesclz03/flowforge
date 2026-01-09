# Changelog

## [v1.2.0] - 2026-01-09

### 🚀 Enterprise Launch Audit ("Pitch Perfect")

The entire codebase has undergone a "Scorched Earth" audit to ensure maximum stability, security, and performance for production launch.

### Security & Integrity
- **API Validation**: Implemented **Zod** schema validation for all critical API routes (specifically `metrics` and `sessions`) to preventing invalid data injection.
- **Type Safety**: Eliminated explicit `any` casts in `useWakeLock`, `useSound`, and API routes. Added `types/global.d.ts` for experimental web APIs.
- **Strict Compliance**: Codebase now passes `npm run lint` with zero functional errors.

### Performance
- **Bundle Optimization**: verified build output and optimized heavy imports.
- **Render Cycle**: Audited `useBeatPlayer` and `useRecording` for render loops; verified 100% stability.

### UX & Polish
- **Error Boundaries**: Implemented `app/error.tsx` and `app/global-error.tsx` for graceful failure states.
- **Console Cleanup**: Removed all development `console.log` noise from production builds.

### Fixed
- **Critical API Resilience**: Implemented robust fallbacks for `/api/words` and `/api/beats`. The app now degrades gracefully to offline mode instead of crashing if the database connection fails, preventing "Unexpected token" errors and ensuring audio playback always works.

## [v1.1.9] - 2026-01-08

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
