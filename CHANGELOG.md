# Changelog

All notable changes to the FlowForge project will be documented in this file.

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
