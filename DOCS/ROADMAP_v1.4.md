# FreeStyla Roadmap v1.4 - "The Habit Update"

**Status**: Planned
**Focus**: Retention & Gamification

This document outlines features deferred from v1.3.1 to maintain production stability, as well as new planned enhancements.

## 📅 Deferred Features (From v1.0 Spec)

These items were in the original "Bible" but not implemented in the v1.3.1 Universal Gateway release.

### 1. Daily Streak System

- **Missing**: Backend logic to track consecutive practice days.
- **Requirements**:
  - Add `currentStreak`, `longestStreak`, `lastPracticeDate` to `User` model.
  - UI: "Fire" icon with counter in Header.
  - Logic: Reset streak if `lastPracticeDate` < yesterday.

### 2. "Panic Button" (Skip Word)

- **Missing**: A button to skip the current word prompt during a session.
- **Requirements**:
  - UI: Button in `PracticePage`.
  - Logic: -500 XP penalty for usage.

### 3. PNG Stat Cards

- **Status**: Partially replaced by Video Export.
- **Requirement**: Lightweight social sharing image (Open Graph style) for users who don't want to share a full video.

## 🚀 New Objectives (v1.4)

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

