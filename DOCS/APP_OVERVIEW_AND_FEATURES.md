# FlowForge - Application Overview & Feature Guide

**Date**: December 11, 2025  
**Version**: 1.0.0 (Gold Master)

---

## 🚀 Application Overview

**FlowForge** is a specialized web application designed to help rappers, poets, and vocalists practice their freestyle skills. It creates a focused, high-pressure environment by combining instrumental beats with timed word prompts, forcing users to improvise and improve their lyrical adaptability.

The app follows a simple but powerful "Hook Model" loop:

1.  **Trigger**: User wants to practice.
2.  **Action**: User acts on a prompt (Beat + Words).
3.  **Variable Reward**: The satisfaction of a good flow + recording playback.
4.  **Investment**: Saved sessions and streak tracking.

---

## ✅ Implemented Features (MVP)

All features listed here are currently live and functional in the production environment.

### 1. Core Practice Engine

The heart of the application, designed for zero-latency performance.

- **Beat Selection**:
  - **Dropdown Interface**: Streamlined dropdown menu for selecting beats without leaving the practice view.
  - **Detailed Metadata**: Real-time display of Title, Artist, BPM, and Genre.
  - **Audio Engine**: High-fidelity web audio playback with seamless looping.
- **Visual Feedback**:
  - **"Orb" Player Design**: Central interactive element with a glowing timer ring that visually counts down to the next word prompt.
  - **Word Prompts**: Large, legible words that appear on-beat, synchronized to the selected frequency (4, 8, or 16 bars).
  - **Recording Indicator**: Real-time feedback (pulsing red dot) when the microphone is active.

### 2. Audio & Recording System

- **High-Fidelity Recording**: Captures user vocals in `stereo` (where supported) using `audio/webm`.
- **Mobile Optimization**: Explicitly manages audio routing to ensure playback through main speakers rather than earpiece, preventing volume "ducking" during recording.
- **Session Management**:
  - **Auto-Stop**: Sessions automatically end at the limit (2 mins for Free, Unlimited for Pro).
  - **Cloud Storage**: Recordings are securely uploaded to Supabase Storage.
- **Guest Mode**:
  - Unauthenticated users can record a session which is saved locally to their device.
  - Upon signing in, the guest session is automatically uploaded and attached to their new account.

### 3. User Accounts & Profile

- **Authentication**:
  - Google OAuth integration for one-tap sign-in.
  - Secure session management via NextAuth.js.
- **Profile Dashboard**:
  - **Statistics**: Tracks "Total Recordings", "Minutes Practiced", and "Unique Beats Used".
  - **Recordings Library**: Chronological list of user's past sessions.
  - **Subscription Status**: Clear display of Free/Pro status with upgrade options.

### 4. Admin Dashboard

- **Restricted Access**: Only accessible to defined admin users.
- **Beat Management**:
  - **Upload**: Interface to upload new beat audio files and cover art.
  - **Metadata**: Set BPM, Genre, and Artist details.
  - **Gating**: Mark beats as "Premium" to lock them for Pro users only.

### 5. Monetization (Pro Tier)

- **Stripe Integration**: Secure checkout and subscription management.
- **Pro Features**:
  - **Unlimited Recording**: No 2-minute cap.
  - **Premium Beats**: Access to the full catalog of exclusive instrumentals.
  - **No Watermark**: Clean audio downloads without the "FlowForge" sonic branding.
  - **Priority support**: (Implied/Planned).

### 6. Social Ecosystem & Leaderboard

- **Leaderboard**:
  - **Global Rankings**: Tracks top users based on `Flow Points`.
  - **Sorting**: Filter by Weekly, Monthly, or All-Time high scores.
- **Public Profiles**:
  - `/u/[username]` pages showcasing user stats and session list.
  - Social media link integration (Instagram/TikTok).
- **The Feed**:
  - **Trending**: Curated feed of popular sessions.
  - **Following**: Activity feed from users you follow.
  - **Interactions**: Like and Comment on sessions.
- **Duel Mode**:
  - **Challenge Mechanic**: Any session can be "challenged", linking the new recording to the original as a response.

### 7. Gamification & Progression

- **Scoring System**:
  - **Flow Density**: Algorithmic analysis of vocal activity to generate a score.
  - **Vibe Check**: Categorizes delivery energy (e.g., "Hype", "Chill").
- **Word Vault**:
  - Tracks every unique word a user has successfully incorporated into their flows.
  - Stats display for "Total Words Collected".
- **First Time Overlay**: Interactive guide for new users on their first visit to the Practice page.

---

## 🚧 Planned Features (Roadmap)

### Phase 8: Mobile & AI (Future)

- **Mobile Native App**: React Native port for native-level audio latency.
- **Advanced AI**:
  - **Rhyme Highlighting**: Server-side transcription + rhyme scheme analysis.
  - **Flow Coach**: LLM-based feedback on vocabulary diversity.
- **Battles**: Real-time synchronous multiplayer battles.

---

## 🛠 Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Auth**: NextAuth.js (Google Provider)
- **Payments**: Stripe
- **Monitoring**: Sentry
- **Styling**: Tailwind CSS + Lucide Icons + Framer Motion
- **Deployment**: Vercel

---

**End of Document**
