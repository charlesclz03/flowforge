# FreeStyla - Application Overview & Feature Guide

**Date**: December 19, 2025  
**Version**: 1.3.0 (Universal Gateway)

---

## 🚀 Application Overview

**FreeStyla** is a specialized web application designed to help rappers, poets, and vocalists practice their freestyle skills. It creates a focused, high-pressure environment by combining instrumental beats with timed word prompts, forcing users to improvise and improve their lyrical adaptability.

The app follows a "Practice-First" philosophy, allowing anyone (Guests or Authenticated) to enter the practice flow instantly without friction.

The app follows a simple but powerful "Hook Model" loop:

1.  **Trigger**: User wants to practice.
2.  **Action**: User acts on a prompt (Beat + Words).
3.  **Variable Reward**: The satisfaction of a good flow + recording playback + Badge progression.
4.  **Investment**: Saved sessions, word collection, and streak tracking.

---

## ✅ Implemented Features (Universal Gateway Phase)

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
  - **Dropdown Interface**: Streamlined dropdown menu for selecting beats.
  - **Beat Preview**: Play button to preview beats before selecting.
  - **Favorite Beats**: Heart icon to save favorite beats.
  - **Randomize Mode**: Dice icon to instantly pick a random setup.
- **Visual Feedback**:
  - **"Orb" Player Design**: Central interactive element with a glowing timer ring.
  - **Session Info Tags**: Real-time display of Difficulty, BPM, and Bar settings above the READY state.
  - **Frozen Visualizer**: Advanced visualization that "freezes" in place when music is paused, preserving the flow's visual momentum.
  - **Word Prompts**: Synchronized to the selected frequency (2, 4, or 8 bars).

### 2. Audio & Recording System

- **High-Fidelity Recording (Pro Only)**: Captures user vocals with selective audio routing for mobile.
- **Studio FX**: Toggleable real-time reverb and vocal mixing in the review stage.
- **Latency Calibration**: Manual nudge slider (+/- 100ms) for post-recording sync.

### 3. User Accounts & Profile

- **Authentication**: Google OAuth with guest session migration.
- **Profile Dashboard**:
  - **Performance Stats**: "Total Recordings", "Minutes Practiced", and "Battle Wins".
  - **Badge Showcase**: Visual recognition for practice milestones.

### 4. Social Ecosystem & Sharing

- **Stat Card Sharing**:
  - **Dynamic PNG Generation**: Shareable images with session scores and beat metadata.
  - **Session Recaps**: Substantial recap modal summarizing performance and configuration.
- **The Feed**: Community-driven stream with Likes and Comments.
- **Duel Mode**: Competitive challenges on the same seed.

---

## 🛠 Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **Auth**: NextAuth.js (Google Provider)
- **Styling**: Tailwind CSS + Lucide Icons + Framer Motion
- **Storage**: Supabase Storage (for .webm recordings)
- **Monitoring**: Sentry
- **Deployment**: Vercel

---

**End of Document**
