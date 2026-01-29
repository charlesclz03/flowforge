# FreeStyla - Application Overview & Feature Guide

**Date**: January 10, 2026  
**Version**: 0.9.68 (Launch Ready)

---

##  Application Overview

**FreeStyla** is a specialized web application designed to help rappers, poets, and vocalists practice their freestyle skills. It creates a focused, high-pressure environment by combining instrumental beats with timed word prompts, forcing users to improvise and improve their lyrical adaptability.

The app follows a "Practice-First" philosophy, allowing anyone (Guests or Authenticated) to enter the practice flow instantly without friction.

The app follows a simple but powerful "Hook Model" loop:

1.  **Trigger**: User wants to practice.
2.  **Action**: User acts on a prompt (Beat + Words).
3.  **Variable Reward**: The satisfaction of a good flow + recording playback + Badge progression.
4.  **Investment**: Saved sessions, word collection, and streak tracking.

---

##  Implemented Features (Universal Gateway Phase)

All features listed here are currently live and functional in the production environment.

### 1. Core Practice Engine

The heart of the application, designed for zero-latency performance and maximum accessibility.

- **Universal Access**:
  - **Guest Flow**: Practice is unlocked for all users. No login required to select beats or enter the practice room.
  - **Instant Redirects**: Root URL `/` directs users straight to onboarding for a seamless start.
- **Session Modes**:
  - **Solo Mode**: Traditional practice with consistent word prompts.
  - **Cypher Mode**: Multi-player practice mode with a dedicated player selector (2, 3, or 4 players) and visual mode indicator.
- **Beat Selection**:
  - **Dropdown Interface**: Streamlined dropdown menu for selecting beats (Embeds directly in "Single-Screen" layouts).
  - **Beat Preview**: Play button to preview beats before selecting.
  - **Favorite Beats**: Heart icon to save favorite beats.
  - **Randomize Mode**: Dice icon to instantly pick a random setup.
- **Visual Feedback**:
  - **"Orb" Player Design**: Central interactive element with a glowing timer ring.
  - **Session Info Tags**: Real-time display of Difficulty, BPM, and Bar settings above the READY state.
  - **Waveform Visualization & Navigation**:
    - **SoundCloud-Style Waveform**: Two-tone coloring system (Purple Played / White Unplayed) for clear progress tracking.
    - **Integrated Review Waveform**: Session Review studio now features a high-fidelity waveform visualization of the recording.
    - **Global Tap-to-Seek**: Instantly jump to any position by tapping on the waveform in both calibration and review modes.
  - **Frozen Visualizer**: Advanced visualization that "freezes" in place when music is paused, preserving the flow's visual momentum.
  - **Word Prompts**: Synchronized to the selected frequency (2, 4, or 8 bars).

### 2. Audio & Recording System

- **High-Fidelity Recording (Pro Only)**: Captures user vocals with selective audio routing for mobile.
- **Mixed Audio Download**: Automatically merges voice and beat into a single high-quality WAV file.
- **Studio FX**: Toggleable real-time reverb and vocal mixing in the review stage (One-click "Studio Magic").
- **Latency Calibration**: Manual nudge slider (+/- 100ms) for post-recording sync.

### 3. User Accounts & Profile

- **Authentication**: Google OAuth with guest session migration.
- **Profile Dashboard**:
  - **Performance Stats**: "Total Recordings", "Minutes Practiced", and "Battle Wins".
  - **Badge Showcase**: Visual recognition for practice milestones.

### 3. User Beat Management (Beat Vault)

- **Upload System**: Direct MP3/WAV uploads to secure private cloud storage.
- **Calibration Tools**: Set custom "Start Points" and offsets to ensure uploaded beats loop perfectly with prompts.
- **Beat Deletion**: Full control to remove uploaded tracks from the library.
- **"My Beats" Tab**: Dedicated section in the Beat Dropdown for personal uploads.

### 4. Progression & Gamification

- **XP Battle Pass Bar**: Dynamic progress bar in the Leaderboard header visualizing level progression (1 sec flow = 1 XP).
- **Badges**: Unlockable achievements (e.g., "Night Shift", "Consistency", "Machine Gun").
- **Flow Density**: Proprietary metric calculating rhyme density and syllable usage.
- **History Graph**: Visual representation of practice habits over time (Pro).

### 5. Social Ecosystem & Sharing

- **Share Functionality**: Native share sheet integration for recordings (Mobile/Desktop).
- **Cypher Mode**: Multiplayer lobbies with real-time turn-based visuals.
- **Duel Mode**: Competitive challenges on the same seed.
- **Feed**: Community-driven stream with Likes and Comments.

### 6. Monetization (Stripe)

- **Pro Subscription**: $4.99/mo tier unlocking Uploads, Unlimited Recording, and Advanced Stats.
- **Calculated Limitations**: Free tier capped at 60s recordings with ads; Pro is unlimited and ad-free.

---

##  Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Auth**: NextAuth.js (Google Provider)
- **Styling**: Tailwind CSS + Lucide Icons + Framer Motion
- **Storage**: Supabase Storage (for .webm recordings)
- **Monitoring**: Sentry
- **Deployment**: Vercel

---

**End of Document**
