# Deep SEO & Wording Audit Report

This report documents all user-facing text, phrases, headings, and interactive elements within the FlowForge - Freestyle application. It is structured by page and component to facilitate an SEO deep dive and wording audit.

## Table of Contents
1. [Global Layout](#global-layout)
2. [Home Page](#home-page)
3. [How It Works](#how-it-works)
4. [Difficulty Selection](#difficulty-selection)
5. [Practice Mode](#practice-mode)
6. [Duel Mode](#duel-mode)
7. [Cypher Mode](#cypher-mode)
8. [Tracks](#tracks)
9. [Recordings](#recordings)
10. [Profile](#profile)
11. [Legal](#legal)
12. [Misc Components](#misc-components)


## Global Layout
**File:** `app/layout.tsx`

### Metadata (SEO)
- **Title Template:** `%s | FreeStyla`
- **Default Title:** `FreeStyla - AI-Powered Freestyle Rap Practice`
- **Description:** `Your AI-powered freestyle rap practice partner. Master your flow, sharpen your skills, and unleash your creativity with FreeStyla.`
- **Keywords:**
  - freestyle rap
  - rap practice
  - hip hop practice
  - beats
  - freestyle beats
  - AI music
  - rap generator
  - freestyle partner
  - rap training
  - music practice
- **Open Graph (Social):**
  - **Site Name:** `FreeStyla`
  - **Title:** `FreeStyla - AI-Powered Freestyle Rap Practice`
  - **Description:** `Your AI-powered freestyle rap practice partner. Master your flow, sharpen your skills, and unleash your creativity.`
- **Twitter Card:**
  - **Title:** `FreeStyla - AI-Powered Freestyle Rap Practice`
  - **Description:** `Your AI-powered freestyle rap practice partner. Master your flow, sharpen your skills, and unleash your creativity.`

### Screen Reader / Accessibility
- **Skip Link:** "Skip to main content" (Hidden by default, visible on focus)

---

## Home Page
**File:** `app/page.tsx`

### Behavior
- Redirects to `/howitworks` by default.
- Redirects to `callbackUrl` if authenticated and present.

### Content (Loading State)
- **Alt Text:** "Loading FreeStyla..."

---

## How It Works
**File:** `app/howitworks/page.tsx`

### Content
- **Main Header:** "Master your freestyle flow with precision timing and intelligent word prompts."
- **Cards:**
  1. **Choose your beat:** "Select from a curated library of hip-hop instrumentals. Each beat is tagged with BPM and genre for the perfect vibe."
  2. **Configure session:** "Set your difficulty level and word frequency. Start easy with 2-3 syllable words, or challenge yourself with complex vocabulary."
  3. **Record & flow:** "Hit play and start freestyling. Words appear in sync with the beat. Your session is automatically recorded for review."
- **Features:**
  - **Precision timing:** "your session. Standard sessions run for 2 minutes, perfect for daily practice."
  - **Smart word bank:** "A curated bank of words designed for freestyling, filtered by syllable count to match your skill level."
  - **Beat synchronization:** "Words appear precisely timed to musical bars. Choose between 2, 4, or 8 bar intervals."
  - **Auto-recording:** "Every session is captured automatically. Review your performances and track your progress over time."
- **Stats:**
  - "10+ Curated beats"
  - "1,000+ Word vault"
  - "2 min+ Session time"
- **CTA:** "Start"

---

## Difficulty Selection
**File:** `app/difficultyselection/page.tsx`

### Content
- **Title:** "Setup your session"
- **Subtitle:** "Choose your difficulty, word frequency, and beat."
- **Buttons / Toggles:**
  - "Record Session": "Audio will be recorded" / "Practice mode only"
  - "Advanced Settings"
  - "Solo" / "Cypher"
  - "Enable Local Tracks": "Select files from your device"
  - "Practice" (or "Select a beat to continue")
- **Advanced Strings:**
  - "Session Mode"
  - "Number of Players"
  - "Players will take turns every {frequency} bars."

  - "Word Theme" (Options: All, Street, Political, Abstract, Nature, Ego Trip, Life)

---

## Practice Mode
**File:** `app/practice/page.tsx`

### Content
- **Header:** Dynamic (Beat Title or "Practice Session")
- **Loading State:** "Loading Beat..."
- **Notifications (Toasts):**
  - "Session Completed (Practice Mode)"
  - "Achievement Unlocked: {badge}!"
  - "Recording too small"
  - "Recording too short"
- **Save Message:** "Could not save temp recording. Please sign in."

---

## Tracks (Vinyl Collection)
**File:** `app/tracks/page.tsx`

### Content
- **Header:** "Vinyl Collection"
- **Description:** "Discover beats for your next session."
- **Tabs:** "Public Tracks", "My Tracks"
- **Buttons:** "New Beat"
- **Search Placeholder:** "Search beats, artists, vibes..."
- **Empty States:**
  - "No beats found looking for '{query}'"
  - "You haven't uploaded any beats yet."
- **Actions:** "Play", "Delete" (implied icons/logic)

---

## Recordings
**File:** `app/recordings/page.tsx`

### Content
- **Header:** "My Recordings"
- **Description:** "View, play, and download your practice sessions"

- **Premium Lock:** Users without a subscription see blurred content and a Premium Modal.

---

## Misc Components

### Practice Controls
**File:** `components/organisms/practice/PracticeControls.tsx`
- **Difficulty Labels:** Easy, Medium, Hard, Random
- **States:**
  - "Get Ready" (Countdown)
  - "Recording" / "Playing" / "Free Flow"
  - "Preparing Studio" (Loading)
  - "Tap to Stop"
- **Buttons:** "Restart", "REC"

### Session Summary Modal (Victory Screen)
**File:** `components/molecules/practice/SessionSummaryModal.tsx`
- **Title:** "VICTORY"
- **Subtitle:** "Session Cleared!"
- **Stats:** "Level X", "XP Gained", "Words", "Day Streak"
- **Achievements:** "Achievement Unlocked!"
- **Buttons:** "Menu", "Continue"

### Premium Modal (Upsell)
**File:** `components/molecules/monetization/PremiumModal.tsx`
- **Titles (Contextual):**
  - Recording: "Unlock Unlimited Recording"
  - Beat: "Access Pro Beats"
  - History: "View Full History"
  - Default: "Upgrade to FreeStyla Pro"
- **Descriptions:**
  - "Free users are limited to 2-minute sessions. Upgrade to record full studio-length tracks."
  - "This track is locked. ongoing subscriptions get access to our full library of premium beats."
  - "Save and review all your past sessions with FreeStyla Premium."
  - "Take your freestyle skills to the next level with professional tools."
- **Benefits:**
  - "Unlimited recording duration"
  - "Access to all premium beats"
  - "Advanced session analytics"
  - "Download studio-quality audio"
- **CTA:** "Get Pro - 3.99€/mo"
- **Disclaimer:** "Cancel anytime. 7-day free trial included."

### Guest Login Modal
**File:** `components/molecules/auth/GuestLoginModal.tsx`
- **Title:** "Don't Lose Your Flow"
- **Body:** "That was fire! Sign in now to save this recording to your profile forever."

- **Buttons:** "Sign In with Google", "Discard Recording"

---

## Profile
**File:** `app/profile/page.tsx`

### Content
- **Header:** "Profile"
- **Description:** "Your stats and settings."
- **Sections:**
  - Account Info
  - Subscription
  - Security
  - Stats (Recordings, Word Vault)
  - Quick Actions

### Notifications
- "Guest session restored to your account!"

---

## Legal Pages

### Privacy Policy
**File:** `app/legal/privacy/page.tsx`
- **Introduction:** "Last Updated: December 10, 2025"
- **Sections:**
  1. Data We Collect (Account Info, Usage Data, User Content)
  2. How We Use Data (Service, Payments, Performance). "We never sell your personal data..."
  3. Data Storage (Supabase, Stripe, Local Storage)
  4. Your Rights (Access, Deletion)
  5. Contact (support@flowforge.com)

### Terms of Service
**File:** `app/legal/terms/page.tsx`
- **Introduction:** "Last Updated: December 10, 2025"
- **Sections:**
  1. Acceptance of Terms
  2. User Content & Ownership ("You own your flows...")
  3. Premium Subscriptions (€4.99/mo or €49.99/yr)
  4. Acceptable Use (No illegal/hateful content)
  5. Disclaimer ("as is", no warranties)

---

## Audit Notes & Inconsistencies
During the compilation of this report, the following inconsistencies were observed and should be addressed for SEO and User Trust:

1. **Pricing Mismatch:**
   - `PremiumModal.tsx`: Displays "3.99€/mo"
   - `TermsPage` (`app/legal/terms/page.tsx`): States "€4.99/mo or €49.99/yr"
   - *Action Required:* Standardize pricing across the application.

2. **Terminology:**
   - "FreeStyla" is used as the brand name in `layout.tsx` metadata and headers.
   - "FlowForge" is used in `TermsPage` ("By accessing and using FlowForge...").
   - *Action Required:* Unify brand name usage (FreeStyla vs FlowForge).

3. **SEO Metadata:**
   - `PracticePage` and `RecordingsPage` do not appear to have specific `export const metadata` defined in the files read (they rely on `layout.tsx` or client-side rendering). Adding specific metadata for these routes could improve indexing (though they are app-internal).

