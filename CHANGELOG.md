# Changelog

All notable changes to the Freestyla project will be documented in this file.

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
