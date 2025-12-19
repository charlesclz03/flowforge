# 📜 Freestyla - The Meta Manifest

_System logs, balance changes, and the constant evolution of the grind._

---

## 🎭 Update 1.2.0: The Guest Experience

**Release Date:** December 19, 2025
**Codename:** _Open Doors_

The practice gym is now truly open to everyone. Guest users can now experience the full app without friction, and the navigation flows like silk.

### ✨ Guest Experience Overhaul

- **Universal Bottom Nav**: Navigation dock now visible for ALL users—guests included.
- **Smart Profile Tab**: Guests clicking Profile see a login modal instead of 401 errors.
- **Sign-Out Visibility**: Sign out button hidden when not logged in (no more confusion).
- **My Uploads Premium Gate**: Tab visible to all, premium modal for non-Pro users.

### 🎨 UI Fixes & Polish

- **Cypher Rename**: "Pass Mic (2P)" renamed to "Cypher" for clarity.
- **Duplicate Modal Fix**: Removed duplicate SessionSummaryModal from practice page.
- **Pro Tip Toast**: Converted inline Pro Tip to toast notification.
- **Mode Toggle Cleanup**: Removed duplicate Session Mode toggle from settings dropdown.
- **TabsTrigger Enhancement**: Added onClick prop support for custom tab behavior.

### 🔧 Technical Fixes

- **Tracks Page**: Fixed beats array extraction from API response.
- **Badge System Removal**: Cleaned up obsolete gamification code.

---

## 🎨 Update 1.1.3: The Flow Refinement

**Release Date:** December 18, 2025
**Codename:** _Silk Touch_

The interface has been refined to a mirror shine. Navigation now flows like a seasoned freestyle—smooth, intuitive, and never jarring.

### ✨ UX Improvements

- **Logo Home Navigation**: Freestyla logo now takes you to `/howitworks` (the true home for freestylers).
- **Instagram-Style Bottom Nav**: Repositioned and properly spaced—content never overlaps.
- **Beat Preview**: Preview beats before selecting with the new Play button in dropdown.
- **Favorite Beats**: Heart icon to save your go-to instrumentals.

### 🧹 Code Cleanup

- **Component Consolidation**: Merged BeatSelector and BeatCard into BeatDropdown.
- **Removed Duplicates**: Clean UI toggle now only in header (no more double buttons).
- **Layout Fixes**: Proper padding ensures content respects the bottom navigation.

---

## 🚀 Update 1.1.1: The Production Forge

**Release Date:** December 18, 2025
**Codename:** _Titan's Grip_

The final chains holding back production have been shattered. The deployment pipeline is fully operational, verifying the integrity of the "Bible" requirements.

### 🛠️ Deployment & Stability

- **Pipeline Restored**: Fixed critical build failures on Vercel (`prisma`, `resend`, `dynamic-server-usage`).
- **Schema Synced**: `restarts` and `playbacks` metrics now correctly tracking for Badge logic.
- **Dependencies Secured**: Added `resend` and `react-intersection-observer` to the core manifest.
- **Dynamic Routing**: Forced dynamic rendering for Feed and Votes API to ensure real-time data accuracy.

### 📜 Documentation

- **The Bible**: Updated with Section 7 (Technical Stack).
- **Changelog**: Initialized v1.1.1 history.
- **Deployment Guide**: Troubleshooting protocols established.

---

## 🐲 Update 0.8.0: The Social Awakening

**Release Date:** December 14, 2025
**Codename:** _Arena of Voices_

The silence has been broken. The barriers between emcees have fallen. The **Social Awakening** brings the community to life with the introduction of public profiles, feeds, and the ultimate test of skill: Duels.

### ✨ New Features

- **The Global Feed**: A live stream of the latest fire dropped by the community. Witness the rise of new legends.
- **Duels System**: Challenge another emcee to a asynchronous rap battle. Let the community decide the winner through the new Voting System.
- **Public Profiles**: Your legacy is now visible. Showcase your best tracks, your stats, and your duel history to the world.
- **Follow System**: Build your crew. Follow your favorite artists and never miss a drop.

### ⚔️ System Updates

- **Voting Mechanics**: A secure, context-aware voting system ensures fair play in the Arena.
- **Notification Infrastructure**: The foundation for future alerts has been laid.

---

## 🔮 Update 0.7.0: The Polish & The Pragmatic

**Release Date:** December 14, 2025
**Codename:** _Crystal Clarity_

Before the gates opened, the world had to be perfected. This update focused on squashing the bugs that hid in the shadows and refining the experience to a mirror shine.

### 🛠️ Fixes & Improvements

- **Mobile responsiveness** overhauled for seamless flow on all devices.
- **Navigation** refined for intuitive movement through the app.
- **Performance** optimizations to ensure the beat never skips.

---

## 👑 Update 0.5.0: The Purple Void

**Release Date:** December 11, 2025
**Codename:** _Royal Ascension_

A shift in the visual spectrum. The old Orange has faded, replaced by the regal **Freestyla Purple (#7D7AFF)**. This massive design overhaul redefined the aesthetic of the entire platform.

### 🎨 Visual Overhaul

- **New Color System**: All UI elements migrated to the new Purple Design System.
- **Premium Indicators**: Gold badges now mark the elite features.
- **Dark Mode Perfection**: Contrast and shadows tuned for late-night studio sessions.

### 💎 Premium Features

- **Subscription Foundations**: The groundwork for Pro accounts has been laid.
- **Exclusive Beats**: 8 new high-fidelity beats added to the vault, locked for the worthy.

---

## 📼 Update 0.4.0: The Vault

**Release Date:** November 11, 2025
**Codename:** _Memory Keepers_

The ability to capture time. Emcees can now save their sessions to the cloud, building a library of their lyrical evolution.

### ✨ New Features

- **Cloud Storage**: Secure uploads to Supabase Storage.
- **Recording Library**: A dedicated space to manage, rename, and download your tracks.
- **Auto-Save**: Never lose a freestyle again. Sessions save automatically upon completion.
- **Delete Policy**: Automated cleanup ensures the storage eco-system remains healthy.

---

## 🔊 Update 0.3.0: Echoes of the Beat

**Release Date:** November 11, 2025
**Codename:** _Sonic Boom_

The core engine roars to life. The audio system was finalized, bringing low-latency playback, perfectly synchronized word prompts, and the visual feedback of the Timer Ring.

### ✨ New Features

- **The Practice Studio**: The heart of Freestyla. A fully immersive freestyle environment.
- **Timer Ring**: A visual representation of time, looping perfectly with the beat.
- **Word Prompts**: dynamic words that challenge your flow in real-time.
- **Audio Recorder**: Browser-based recording with waveform visualization.

---

## 🏗️ Update 0.1.0: Genesis

**Release Date:** November 10, 2025
**Codename:** _The Foundation_

In the beginning, there was code. The infrastructure was forged from the void.

### ⚙️ Systems Online

- **Next.js 14** initialized.
- **Database** connected (Supabase & Prisma).
- **Authentication** secured (Google OAuth).
- **Design System** established (Tailwind CSS).

---

## 🎮 Update 1.2.0: The Gamification Pivot

**Release Date:** December 19, 2025
**Codename:** _Level Up_

We have pivoted! Freestyla is no longer about social noise; it's about **you vs. the beat**. The platform has been reimagined as a personal practice gym with deep gamification.

### 🏆 Achievements
- **Unlockable Badges**: Earn recognition for streaks, session milestones, and exploring new genres.
- **Points System**: Every achievement contributes to your global Flow Score.
- **Instant Feedback**: Get notified immediately when you level up your skills.

### 📊 Leaderboard 2.0
- **Skill-Based Ranking**: The leaderboard now ranks by **Achievement Points**, not just activity.
- **Weekly Cycles**: Ranks reset every Wednesday. Can you claim the crown this week?

### 🧭 Navigation & Core Experience
- **Vinyl Home**: The new home screen is a dedicated **Beat Catalog**. Find your sound faster with search and filters.
- **Simplified Nav**: Removed Feed and Messages to focus purely on **Practice** and **Progress**.
- **Recorder Library**: A dedicated tab for your personal recordings.

### 🧹 Deprecated Features
- **Social Feed**: Removed to reduce distraction.
- **Direct Messaging**: Removed to focus on solo practice.

