# FreeStyla Roadmap v1.4 - "The Habit Update"

**Status**: Partially Complete
**Focus**: Retention & Gamification

This document outlines features deferred from v1.3.1 to maintain production stability, as well as new planned enhancements.

##  Implemented Features ✅

### 1. Daily Streak System ✅

- **Status**: ✅ IMPLEMENTED
- **Implementation**:
  - `StreakSystem` class in `lib/gamification/streak.ts`
  - `DailyStreakWidget` component with fire icon
  - `currentStreak`, `longestStreak`, `lastPracticeDate` in User model
  - Header display when streak > 0

##  Deferred Features (v1.4+)

### 2. "Panic Button" (Skip Word)

- **Missing**: A button to skip the current word prompt during a session.
- **Requirements**:
  - UI: Button in `PracticePage`.
  - Logic: -500 XP penalty for usage.

### 3. PNG Stat Cards

- **Status**: Partially replaced by Video Export.
- **Requirement**: Lightweight social sharing image (Open Graph style) for users who don't want to share a full video.

##  New Objectives (v1.4)

### AI Voice Coaching (V2 Prep)

- Investigate VTT (Voice-to-Text) for real-time rhyme density scoring.
- "Smart Prompts": Context-aware words based on previous rhymes.


### Native Mobile Wrappers

- Capacitor/Ionic wrapper for iOS App Store release.

### Native Internationalization (Phase 2)

- **Goal**: European market penetration (France/Spain).
- **Requirements**:
  - `next-intl` integration.
  - Dynamic metadata based on `Accept-Language` headers.
  - Translated content for "Drill" (FR) and "Trap" (ES) sub-genres.

