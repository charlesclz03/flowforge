# 📜 FreeStyla - The Meta Manifest

_System logs, balance changes, and the constant evolution of the grind._

---

## 🚀 Update 1.5.6: The Stable Circle

**Release Date:** January 09, 2026
**Codename:** _Back to Basics_

This final stabilization patch restores the core practice UI while hardening the architecture against serialization errors.

### 🏗️ Architecture & Serialization
- **Props Sanitized**: Resolved persistent Next.js warnings about non-serializable props in the practice suite. The app is now fully compliant with Next.js 14 client component standards.
- **TypeScript Purity**: Achieved a truly clean build. No `@ts-expect-error` hacks remain where they aren't absolutely strictly necessary for serializability bypasses.

### 🎨 UI Restoration
- **The Circle is Back**: Reverted the Practice Studio to its original circular design. All the familiar feedback loops, timers, and animations are restored to their peak visual state.
-  **Prettier Perfection**: All remaining formatting nits, including extra whitespace and prop wrapping in `BeatDropdown.tsx`, have been squashed.

---

## 🚀 Update 1.5.5: The Zero Warning

**Release Date:** January 09, 2026
**Codename:** _Perfect Sync_

This patch resolves critical regressions in audio timing and synchronization, while also reaching a milestone of 0 build warnings for the entire project.

### 🔊 Audio & Sync Perfected
- **Reliable Drops**: We've removed the laggy polling logic during the countdown. The beat now starts with surgical precision the moment the clock hits "GO", bypassing browser timing inconsistencies.
- **Double Talk Fixed**: No more hearing the first word twice. We've refined the `SpeechSynthesis` transition logic to speak only when the beat truly drops.
- **Persistent Errors Patched**: If a beat failed once, it would sometimes show errors forever. Now, every new play attempt resets the state for a clean run.

### 🏆 Achievement Resurrection
- **Auto-Seeding**: If you found the achievements list empty, it's now fixed. The system now automatically detects an empty database and seeds the 18 baseline milestones so you can start the grind immediately.

### 🧹 Industrial Cleanup
- **Zero Build Warnings**: We've gone through every single remaining warning in the codebase—from Prettier formatting to hard-to-find type errors. The build is now perfectly clean.

---

## 🎛️ Update 1.5.4: The Polish

**Release Date:** January 09, 2026
**Codename:** _Smooth Operator_

Quality-of-life improvements that make the app feel more responsive and polished.

### 🎧 Beat Selection Overhaul
- **Collapsible Dropdown**: The Beat selector in difficulty selection is now fully **collapsible**. No more taking up 50% of the screen when you've already made your choice.
- **Smart Pre-Selection**: Coming from the Vinyl Collection? Your track is already locked in, dropdown collapsed, ready to hit "Practice".
- **Buttery Animation**: Smooth 300ms slide animation when expanding/collapsing. Feels premium.

### 🎤 Visual Fixes
- **Mic Icon Fixed**: The record button's microphone icon was rendering weirdly due to incorrect fill settings. Now crisp and clean as intended.
- **Profile Portraits**: Your Gmail profile picture now displays correctly in the Profile section. No more placeholder initials if you've signed in with Google.

---

## 🔧 Update 1.5.3: The Resurrection

**Release Date:** January 09, 2026
**Codename:** _Second Wind_

The app was critically broken. Users couldn't record, couldn't see their profiles, and the audio engine was fighting browser security policies. This patch brings it all back to life.

### 🔊 Audio Engine V2
- **Guaranteed Playback**: Implemented a robust "Mute-Play-Unmute" strategy. The moment you tap "Start", the audio begins playing (silently). When the countdown hits "GO", we seek to the correct position and restore volume. This bypasses all browser autoplay restrictions.
- **Deep Logging**: New debug mode in `AudioPlayer` class logs every lifecycle event (`load`, `play`, `pause`, `ended`, `error`). Easier to diagnose issues in production.
- **Grace Period**: Session won't auto-stop before 1.5 seconds have passed, preventing race conditions from ending your flow prematurely.

### 🔒 Auth & Navigation
- **Redirect Loop Fix**: The Edge Middleware was clashing with client-side session checks, creating an infinite redirect. Removed `/profile` and `/recordings` from middleware; client handles auth.
- **Cypher Mode Unblocked**: Created a mock Room Creation API (`/api/cypher/create`) and a lobby page so users can actually proceed after hitting "Create Room".

### 🎨 UI & Visibility
- **Record Button Visibility**: The "REC" indicator was black-on-black. Now uses white borders and text with a red glow for the Pro state.
- **Layout Overlap**: Reduced the practice studio's `min-height` and padding so the player doesn't overlap with the bottom navigation on mobile.
- **Mobile Header Streak**: Adjusted icon size and padding for smaller screens.

### ✨ UX Polish (User Contributions)
- **Immersive Loading**: Loading screen now cycles through dynamic messages ("Syncing AI Word Bank...", "Dropping the Beat...").
- **Session Summary**: Updated copy for streaks ("Consistency Streak") and achievements ("Legacy Milestone Unlocked").
- **Difficulty Selection**: New hero title and improved "Capture the Audio" toggle text.

---

## 📱 Update 1.5.2: Studio Flow & Mobile Polish

### 🎧 Audio Engine Repair
- **Persistent FX**: Fixed a complex issue where Studio FX (Reverb, EQ) would drop out when toggling modes or replaying tracks. The audio graph now initializes robustly every time.
- **Seamless Playback**: Removing unstable dependencies ensures your beat doesn't stutter when you tweak settings.

### 📱 Mobile-First Redesign
- **Settings Gamification**: The settings menu has been reimagined (`SettingsList`). No more boring lists—enjoy a card-based, touch-optimized experience that feels like a game inventory.
- **Responsive Recordings**: Your "My Recordings" list (`RecordingCard`) now adapts intelligently to small screens, stacking information for maximum clarity.

### 🧹 UI Refinement
- **Focused Summary**: We've removed the "PNG Record" export and the confusing "Vibe Score". Your post-session summary is now clean and focused on your word count and flow.
- **Smart Record Button**: The main recording control now respects your "Pro" status and recording preferences without pestering you with upgrade popups when you're already in the zone.

---

## 🎛️ Update 1.5.1: The Focused Studio

**Release Date:** January 09, 2026
**Codename:** _Silent Mode_

We've refined the studio experience to cut out the noise. Users now have total control over recording behaviors, and we've stripped away experimental metrics to focus on what matters: the flow.

### ✨ Studio Controls
- **Recording Logic**: Added a dedicated **Record Session** toggle. Toggle it off for practice runs without saving to disk. The interface updates instantly to reflect your choice.
- **Vibe Check**: Removed the "Vibe Score" calculation. The post-session summary now highlights your raw **Word Count**—no arbitrary numbers attached.

### 🐛 Visual & Audio Fixes
- **Overlap Fix**: The Beat list on difficulty selection is now embedded, preventing it from floating over other controls.
- **Clean Transitions**: Changing the beat mid-session now properly halts the previous track before starting the new one for a seamless audio swap.

---

## 🛡️ Update 1.5.0: Pitch Perfect & Production Ready

**Release Date:** January 09, 2026
**Codename:** _Diamond State_

The "Deep Scan Audit" has concluded. We went line-by-line through the critical systems of FreeStyla (Session Engine, Data Integrity, Gamification, Auth, and UX) to verify enterprise-grade stability.

### 🔒 Ironclad Security
- **Route Protection**: Patched a critical hole in the middleware layer. Private routes (`/profile`, `/recordings`) are now strictly gated.
- **Fail-Safe Sessions**: Added crash guards to the session summary modal. Even if you close the modal early, your data is safe.

### 🎨 Refined Flow
- **Guest Recovery**: If you sign in after a guest session, we now redirect you straight back to the Practice studio—maximizing the chance to save your "lost" masterpiece.
- **Embedded Beats**: The Beat Selector has a new "Embedded Mode" for seamless integration into page layouts, removing visual clutter.
- **Social Props**: The "Session Complete" summary now highlights your **Word Count** prominently, making it easier to share your achievements with the crew.

### ⚡ Performance
- **Visualizer Optimization**: The audio visualizer is now smarter—it doesn't waste CPU cycles re-rendering when the beat isn't changing.

---

## 🛡️ Update 1.4.0: The Enterprise Standard



---

## 🌊 Update 1.3.0: Universal Gateway

**Release Date:** December 19, 2024
**Codename:** _Flow Without Borders_

The barriers have come down. FreeStyla is now open to everyone from the first click. Practice instantly as a guest, master the new Cypher mode, and enjoy a more fluid, interactive experience.

### 🛡️ Patch 1.1.9: The Guardian Update (Jan 08, 2026)

**Focus:** Critical Stability & Navigation

- **Practice Stability**: Fixed the infinite TTS loop and stabilized the audio engine. Interaction during sessions (changing beats) is now fully unlocked.
- **Audio Repair**: Fixed seeded beats failing to play (404s) by restoring URL sanitization.
- **Navigation**: Added global navigation header to the Tracks page to match the rest of the application.
- **Code Health**: Enforced strict linting and formatting standards across critical files.

### 🩹 Patch 1.3.1: The Sonic Fix (Jan 07, 2026)

**Focus:** Audio Stability & Practice Regressions

- **Practice Page**: The countdown is back! "3... 2... 1... GO" now correctly syncs with audio start.
- **Beat Previews**: Fixed silent start issues in the Dropdown and Tracks page (CORS/Ref updates).
- **Favorites**: Restored the missing beat selection dropdown in the Practice studio.
- **Cleanup**: Deleted legacy audio components to prevent conflicts.

### 🐛 QA Audit Log (Dec 19, 2025)

A comprehensive "Pro" audit of v1.3.0 revealed critical areas for the next patch:

- **CRITICAL**: Stripe Portal (`/api/stripe/portal`) is returning 404.
- **CRITICAL**: Cypher/Duel modes (`/cypher`) are inaccessible (404).
- **Major**: Missing "Share" functionality for viral loops.
- **Minor**: "Pro" users show "Free Tier" badge in UI.
- **Minor**: Toast notifications missing on settings save.

### ✨ The Universal Gateway

- **Zero-Friction Practice**: Guests can now reach the practice floor without a login wall. Redirects from `/` now lead straight to the gym.
- **Strategic Auth**: Login prompts are now focused only where they matter—on **Recordings**, **Profile**, and the **Record** button for guests.
- **Universal Bottom Nav**: A refined, consistent docking experience for every visitor.

### 👥 Cypher Mode Expansion

- **Blue Indicator UI**: A high-visibility blue highlight for the mode selector.
- **Dynamic Player Selection**: Choose between 2, 3, or 4 players instantly when entering Cypher mode.
- **Practice Recap**: Your session settings (Difficulty, BPM, Bars) are now visible at all times above the "READY" state.

### 🎨 Visual & Technical Polish

- **Frozen Visualizer**: The visualizer now maintains its state when the beat stops—no more flat lines.
- **Session Recaps**: Complete summary of your session parameters (Difficulty, BPM, Frequency) in the final recap modal.
- **Lint Cleanup**: Fixed persistent serialization warnings by optimizing component boundaries.

---

## 🎤 Update 1.2.1: The Rebrand

**Release Date:** December 19, 2025
**Codename:** _Identity_

FreeStyla gets its official branding treatment. New transparent icon, proper capitalization, and optimized image loading.

### 🎨 Branding Updates

- **FreeStyla**: Proper capitalization applied everywhere (manifest, metadata, components).
- **Transparent Icon**: New app icon with no background—looks clean on any device.
- **Icon Files Updated**: logo.png, icon.png, icon-192x192.png, icon-512x512.png, apple-touch-icon.png, og-image.png.

### 🔧 Technical Improvements

- **next/image Optimization**: AppHeader now uses Next.js Image component for better LCP.
- **CRLF Fixes**: BeatGridCard line endings normalized.
- **Mic Logic Fix**: Non-Pro users see gray mic (opens premium modal), Pro users see red mic.
- **Navigation Fix**: Record button redirects to difficulty selection page.
- **Footer Overlap Fix**: Removed "free beats • premium beats" text overlapping bottom nav.

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
