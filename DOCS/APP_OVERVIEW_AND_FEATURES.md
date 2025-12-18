# FlowForge - Application Overview & Feature Guide

**Date**: December 18, 2025  
**Version**: 1.1.3 (UI/UX Polish)

---

## 🚀 Application Overview

**FlowForge** is a specialized web application designed to help rappers, poets, and vocalists practice their freestyle skills. It creates a focused, high-pressure environment by combining instrumental beats with timed word prompts, forcing users to improvise and improve their lyrical adaptability.

The app follows a simple but powerful "Hook Model" loop:

1.  **Trigger**: User wants to practice.
2.  **Action**: User acts on a prompt (Beat + Words).
3.  **Variable Reward**: The satisfaction of a good flow + recording playback + Badge progression.
4.  **Investment**: Saved sessions, word collection, and streak tracking.

---

## ✅ Implemented Features (MVP + Perfection Phase)

All features listed here are currently live and functional in the production environment.

### 1. Core Practice Engine

The heart of the application, designed for zero-latency performance.

- **Beat Selection**:
  - **Dropdown Interface**: Streamlined dropdown menu for selecting beats without leaving the practice view.
  - **Beat Preview**: Play button to preview beats before selecting.
  - **Favorite Beats**: Heart icon to save favorite beats for quick access.
  - **Randomize Mode**: Dice icon to instantly pick a random combination of beat, frequency, and difficulty.
  - **Preloading Logic**: "Start" button dynamically updates to "Loading Audio..." and is disabled until the beat is ready, ensuring no buffering mid-flow.
- **Visual Feedback**:
  - **"Orb" Player Design**: Central interactive element with a glowing timer ring that visually counts down to the next word prompt.
  - **Word Prompts**: Large, legible words that appear on-beat, synchronized to the selected frequency (4, 8, or 16 bars).
  - **Word "Bag System"**: Advanced shuffle logic ensuring no word repeats within a 500-word cycle.
  - **Golden Prompts**: Rare, glowing words appearing every 50 words to reward persistence. (Scoring integration deferred to V2).

### 2. Audio & Recording System

- **High-Fidelity Recording**: Captures user vocals in `stereo` (where supported) using `audio/webm`.
- **Mobile Optimization**: Explicitly manages audio routing to ensure playback through main speakers rather than earpiece, preventing volume "ducking" during recording.
- **Studio FX**: Toggleable real-time reverb (ConvolverNode) and vocal volume mixing in the review stage.
- **Latency Calibration**: Manual nudge slider (+/- 100ms) to perfect vocal synchronization post-recording.

### 3. User Accounts & Profile

- **Authentication**: Google OAuth with auto-sync of guest sessions.
- **Profile Dashboard**:
  - **Performance Stats**: Real-time tracking of "Total Recordings", "Minutes Practiced", and "Battle Wins".
  - **Word Vault Card**: Visual breakdown of your vocabulary library ("X / 2000 Words Collected").
  - **Badge Showcase**: Apex-style badges earned through specific achievements.
  - **Settings Dropdown**: Quick access to user rank, streak status (with "Streak Freeze" indicator), and a "Report Bug" link.

### 4. Social Ecosystem & Dynamic Sharing

- **Public Profiles**: Custom URLs (`/u/[username]`) showcasing the "Rapper Card".
- **Stat Card Sharing**:
  - **Dynamic PNG Generation**: One-click button to generate a shareable image featuring your session score, vibe, and beat metadata.
- **The Feed**: Interactive stream with Likes, Comments, and Following.
- **Duel Mode**: Fairness-first challenges where users compete on the same beat and word seed.

### 5. Gamification & Apex Badge Suite

- **Session Leaderboard**:
  - **Engagement First**: Rankings are now based on total sessions completed entirely, prioritizing persistence and practice volume.
- **Badge System**: Eight unique achievements including:
  - **Machine Gun**: For high-speed flows on Hard Mode + 4 Bar Frequency.
  - **Perfectionist**: Awarded for persistent rehearsal (5+ restarts in one session).
  - **The Listener**: Awarded for self-review advocacy (10+ playbacks).

---

## 🚧 Planned Features (Roadmap)

### Phase 8: Mobile & AI (Future)

- **Mobile Native App**: React Native port for native-level audio latency.
- **Advanced AI**:
  - **Rhyme Highlighting**: Server-side transcription + rhyme scheme analysis.
  - **Flow Coach**: LLM-based feedback on vocabulary diversity.
  - **Flow Density & Vibe Check**: Technical analysis of vocal performance and energy.
  - **Panic Button**: Optional word skip mechanism for beginners.
- **Battles**: Real-time synchronous multiplayer battles.

---

## 🛠 Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Auth**: NextAuth.js (Google Provider)
- **Payments**: Stripe
- **Email**: Resend
- **Monitoring**: Sentry
- **Styling**: Tailwind CSS + Lucide Icons + Framer Motion
- **Deployment**: Vercel

---

**End of Document**
