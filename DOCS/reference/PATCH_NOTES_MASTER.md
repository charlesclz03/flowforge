# PATCH NOTES MASTER FILE

## v0.9.993 - Type Safe (2026-02-03)
- **FIX**: Eliminated “paid but not Pro yet” race by having `/orderconfirmed` wait for confirmed activation.
- **FEAT**: Added `GET /api/subscription/status` for safe client polling.
- **FIX**: Hardened Stripe webhook handling (idempotent updates, no 500 on unknown customers/users).
- **FIX**: Checkout reuses existing Stripe customers to avoid duplicates.
- **TEST**: Added Vitest coverage for Stripe routes and excluded Playwright `e2e/` from unit tests.
- **FIX**: Practice session completion is hardened for metadata-only saves (no Prisma error leakage / 500s when no recording exists).
- **FIX**: Guests no longer trigger noisy 401s on `/tracks` by calling `/api/user/beats`.
- **FIX**: Audio debug logs are disabled in production and storage URLs are sanitized (opt-in via `NEXT_PUBLIC_AUDIO_DEBUG` in non-prod).
- **FIX**: Removed hardcoded superadmin emails; roles are enforced via DB role with optional bootstrap via `SUPERADMIN_EMAILS`.
- **FIX**: Added NextAuth type augmentation and removed `@ts-expect-error` suppressions in auth callbacks.
- **SEC**: Tightened CSP (removes `unsafe-eval` in production) and narrowed Supabase image host allowlist.
- **FIX**: `/practice` no longer gets stuck when opened directly (auto-selects a default beat).
- **TEST**: Updated Playwright smoke tests and added a `/practice` startability smoke test (with `webServer`).
- **FIX**: AudioPlayer `_sourceNode` tracking is now typed and cleaned up on destroy.
- **DOCS**: Standardized “Type Safe” version to `v0.9.993` and redacted deployment/database credentials.
- **FIX**: Removed stale “Stripe V2” placeholder messaging from premium upgrade UI.
- **DOCS**: Updated Feature Matrix, App Overview, Testing Plans, and Developer Setup to match production reality.
- **CHORE**: Normalized line endings to eliminate Prettier warnings in `npm run lint`.
- **SEC**: Upgraded Next.js and eslint-config-next to clear `npm audit --audit-level=high` (includes Next 15 async request API updates).

## v0.9.991 - Sonic Unbound (Hotfix) (2026-02-02)
- **FIX**: Resolved silent audio issue by enabling CORS in `player.ts`.
- **AUDIT**: Completed deep audit of AppHeader, BottomNav, and Practice Controls.
- **FIX**: Implemented "Live Volume Sync" in Practice Engine to fix potential silence.
- **FIX**: Expanded CSP to allow Google Analytics/Ads domains.
- **FIX**: Verified build integrity and type safety across the stack.

## v0.9.98 - Audio Shield (2026-02-01)
- **FIX**: Resolved 500 Global Error on Profile Page (Audio Player race condition).
- **FIX**: Added `blob:` to CSP to fix profile picture previews.
- **FIX**: Consolidated Audio Context for Practice Mode (Audio Sync).

## v0.9.95 - Dashboard Upgrade (2026-02-01)
- **FEAT**: Transformed Profile page into a 2-column desktop dashboard.
- **FIX**: Resolved AppHeader title overlap on mobile by relocating Help button.

## v0.9.94 - Studio Fix (2026-02-01)
- **FIX**: Resolved Play/Pause button state de-sync in Recordings Playback.
- **FIX**: Stabilized audio engine initialization.

## v0.9.93 - Infinity Loop (2026-02-01)
- **FIX**: Restored seamless track looping.

## v0.9.92 - Sync Guard (2026-02-01)
- **FIX**: Memoized AudioSync to fix stuck countdown loop.
- **FIX**: Guarded TTS to prevent premature word playback.

## v0.9.91 - The Master Clock (2026-01-31)
- **FEAT**: Standardized Monotonic Master Clock for all UI synchronization.
- **FIX**: Resolved frozen timer ring by unifying time units.
- **FIX**: Guaranteed countdown visibility during word pre-loading.

## v0.9.90 - Timekeeper's Redemption (2026-01-31)
- **FIX**: Resolved frozen timer and missing countdown.
- **FIX**: Restored Siren visual effect.

## v0.9.89 - Wordsmith's Return (2026-01-31)
- **FIX**: Restored word difficulty logic (Fixes missing words).
- **FIX**: Resolved TTS voice synthesis matching.

## v0.9.88 - Practice Perfected (2026-01-31)
**"Practice Perfected 💎"**

We completely rebuilt the Practice Engine core to eliminate infinite loops and ensure perfect timing. The countdown, word generation, and TTS are now glitch-free.

### Fixes & Improvements
- **Forever Fix**: Refactored `usePracticeEngine` to use the Command Pattern, permanently fixing the infinite loop regression.
- **Engine Stability**: Removed circular dependencies between the Audio Player and the Engine State.
- **Reliable Countdown**: The 3-2-1-GO sequence is now silky smooth and perfectly synced with the drop.

---

## v0.9.85 - Voice Upgrade (2026-01-31)
**"Voice & Verification 🎙️"**

We significantly upgraded the Text-to-Speech engine with smart voice selection and mobile hardening. We also performed a comprehensive audit of the audio player, certifying it as rock-solid.

### Fixes & Improvements
- **Smart Voice Selection**: The app now automatically picks the highest quality voice (Google US English, Samantha) instead of the robotic system default.
- **Player Audit**: Verified the stability of the Audio Player and Seamless Looping engine.
- **Mobile TTS**: Fixed issues where voice wouldn't play on iOS/Android without direct interaction.

---

## v0.9.87 - Core Stability Patch
**Date:** 2026-01-31
**Codename:** Iron Core

**Description**
Critical stability updates to the Recording Engine and Practice Mode to prevent infinite loops and ensure reliable session handling.

**Changes**
*   **Fixed**: Resolved a critical reference instability in `useRecording` causing repeated effect triggers.
*   **Fixed**: Fixed an issue where the Practice Engine could enter a play/pause loop.
*   **Improved**: Stabilized recorder dependencies to prevent unnecessary re-rendering.

---

## v0.9.86 - Engine Stabilization (2026-01-31)
**Hotfix for Practice Mode restart loop.**

### Fixes & Improvements
- **Crucial Fix**: Resolved circular dependency causing Practice Engine to loop/reset.
- **Audio**: Stabilized Word Scheduler logic.
- **Performance**: Optimized hook dependencies to reduce re-renders.

---

## v0.9.84 - Voice Restoration (2026-01-31)
**"Voice Restoration 🗣️"**

We restored the Practice Mode voice engine! Words are now spoken aloud again, and we hardened the word generator to ensure you never run out of rhymes.

### Fixes & Improvements
- **TTS Restoration**: The text-to-speech engine is back online. It now speaks every word prompt.
- **Word Generator Safety**: Added a double-layer failsafe (Client + Server) to ensure words always appear, even if the database is sleepy.

---

## v0.9.83 - Visual Polish (2026-01-30)
**"Visual Polish ✨"**

A visual enhancement update focusing on the Profile Card aesthetics and roadmap planning. We implemented a softer, more modern glow effect and outlined future features.

### Visual Overhaul
- **Profile Card**: Replaced the "Star" background with a premium soft glow effect for better readability and aesthetics.
- **Roadmap**: Updated `ROADMAP_v1.4.md` with upcoming Gamification and AI features.

### System Updates
- **MCP Audit**: Completed full audit of AI tools for 2026-01-30.
- **Fixes**: Resolved build warnings in ProfileStatsTab.

---

## v0.9.82 - Monetization Audit (2026-01-29)
**"Monetization Audit 💰"**

We performed a comprehensive audit of our monetization logic. The History Graph is now correctly gated for Pro users, preventing free access. We also confirmed the security of our Stripe webhooks and beat upload flows.

### Fixes & Improvements
- **History Graph Gating**: Fixed a permission issue where the activity graph was visible to free users. It is now properly locked.
- **Header Cleanup**: Removed unused import in `VideoCreator` to keep the codebase clean.

### System Updates
- **Monetization Audit**: Verified security for Stripe Webhooks, Video Export, and Cloud Storage.
- **Master MCP Audit**: Validated that our AI tools (`chrome-devtools`, `supabase-mcp`) are healthy and ready for autonomous testing.

---

## v0.9.81 - Section Audit (2026-01-29)
**"User Beat Management Audit 🥁"**

A deep dive into the User Beat Management system. We fixed a critical upload bug, added integration tests, and refactored the beat selector for better performance.

### Fixes & Improvements
- **Upload Beats**: Fixed a critical bug where beat metadata failed to save due to an incorrect API endpoint.
- **Beat Deletion**: Verified secure deletion flow for both cloud and database records.
- **Code Health**: Extracted complex dropdown logic into a reusable `useBeatDropdown` hook.

### System Updates
- **API Tests**: Added a new integration test suite for `/api/user/beats` to prevent future regressions.
- **Audit History**: Officially audited and verified: Upload Beats, Cloud Storage, Calibration, Beat Deletion, and "My Beats".

---

## v0.9.79 - Pass the Phone (2026-01-29)
**"Cypher Mode Activated 🎤"**

We activated the Cypher Mode! Gather your crew around a single device and trade bars. The ring now rotates automatically for up to 4 players.

### New Features
- **Local Multiplayer**: "Cypher Mode" is now live! Select 2-4 players and pass the phone.
- **Auto-Rotation**: The beat engine now tracks whose turn it is and switches players automatically every 4/8/16 bars.
- **Visual Feedback**: The Simon Ring visualizer now spins to match the active player.

---

## v0.9.78 - Dewey Decimal (2026-01-29)
**"The Library Update 📚"**

We completely overhauled our documentation to be world-class. Added "How-to-Code" guides (TSDoc), rigorous Architecture Records, and automated link checking.

### System Updates
- **Docs 2.0**: Reorganized all documentation into a clean, industry-standard structure (Architecture, Guides, Reference).
- **Code Integration**: Added detailed usage docs directly into the code for the Practice Engine.
- **Automated Validation**: The documentation now self-checks for broken links on every update.

---

## v0.9.77 - Visual Polish (2026-01-27)
**"Visual Polish 🎨"**

Minor layout improvements to ensure perfect alignment across all devices.

### Visual Overhaul
- **Step Alignment**: Fixed vertical alignment of step numbers in the "How It Works" section to handle multi-line titles gracefully.

---

## v0.9.76 - Ad Conversion Update 🚀
**Date:** 2026-01-27
**Codename:** Conversion Flow

We launched a dedicated download landing page and a celebration screen for new Pro members to optimize our ad campaigns.

### New Features
- **New /download Page**: A smart landing page that detects your device (Android/iOS/Desktop) and serves the perfect download link.
- **Order Confirmation**: A celebratory "You are now a Pro" page with confetti and feature recaps after successful payment.
- **Homepage CTA**: Added a "Get the App" button to the main hero section.

---

## v0.9.75 - Sonic Boost Update ⚡(2026-01-27)
**"Sonic Boost Update ⚡"**

A massive performance update! We rewrote the Practice engine to load instantly and hardened security with industry-standard CSP protection.

### System Updates
- **Server-Side Practice**: The practice page now loads instantly thanks to Next.js Server Components. No more waiting for beats to fetch!
- **Security Hardening**: Fixed Content Security Policy (CSP) to ensure Google Analytics and other integrations run safely and securely.

### Fixes & Improvements
- **LCP Optimization**: Reduced Largest Contentful Paint (LCP) to ~2.7s for a faster initial render.
- **Database Security**: Verified Row Level Security (RLS) is active on all sensitive user tables.

---

## v0.9.74 - Stripe Fix (2026-01-27)
**"Stripe Checkout Fix"**

Fixed Stripe integration to enable the subscription checkout flow.

### Fixes & Improvements
- **Stripe API Fix**: Corrected invalid API version that was blocking checkout.
- **Environment Cleanup**: Resolved trailing newline issues in Vercel env vars.
- **Error Logging**: Added detailed error messages for debugging.

---

## v0.9.73 - Feature Labels (2026-01-27)
**"Feature Labels Update"**

Corrected subscription feature labels to accurately reflect actual capabilities.

### Fixes & Improvements
- **Free Tier Honesty**: Removed misleading "Session history" claim - free users cannot save recordings.
- **Pro Tier Clarity**: Updated features to show uploads, 100+ beats, and save/download capabilities.
- **Landing Page Sync**: Aligned pricing page with accurate feature lists.

---

## v0.9.72 - Price Fix (2026-01-27)
**"Price Fix"**

Corrected pricing display across all components to match Stripe configuration.

### Fixes & Improvements
- **Price Sync**: Fixed €3.99 / €39 displaying instead of €4.99 / €49.
- **Currency Alignment**: Converted remaining USD ($) prices to EUR (€).
- **Affected Components**: SubscriptionSection, SubscriptionModal, LandingPricing.

---

## v0.9.71 - Euro Edition (2026-01-27)
**"EUR Currency Update"**

Aligned the application with our Euro-based Stripe setup for a seamless global launch.

### System Updates
- **EUR Primary Currency**: All pricing now displayed in Euros (€4.99/mo).
- **Stripe Sync**: Matched yearly plan price to the Stripe Dashboard (€49.00/yr).
- **Multi-Currency Ready**: UK and other international users see their local currency at checkout via Stripe Adaptive Pricing.

---

## v0.9.70 - Cleanup Edition (2026-01-27)
**"Cleanup & Sync"**

A foundational update focused on code health, monetization consistency, and centralized configuration for a smoother launch.

### System Updates
-  **Dynamic Pricing**: Premium modal now reflects real-time Stripe pricing without hardcoded limits.
-  **Centralized Config**: Unified session and storage limits into a single source of truth.
-  **Data Health**: Moved large fallback data sets to dedicated modules, cleaning up core API and UI code.

### Fixes & Improvements
-  **Monetization Sync**: Removed outdated "trial" claims to align with the current Stripe setup.
-  **Refactored Fallbacks**: Improved app reliability during network/database failure modes.

---

## v0.9.69 - Fort Knox (2026-01-27)
**"Security Hardening"**

Implemented industry-standard HTTP security headers, improved legal compliance, and enhanced mobile usability.

### System Updates
-  **Security Headers**: Added CSP, HSTS, X-Frame-Options, and Permissions-Policy.
-  **Legal Upgrade**: Terms now include Trademark and Copyright Monitoring clauses.
-  **Privacy Update**: Added App Permissions section for Play Store compliance.
-  **Monitoring**: Added Sentry tracking for playback errors.

### New Features
-  **Native Share**: Added a native share sheet for cleaner integration with Instagram, TikTok, and Messages.
-  **Android Prep**: Locked orientation to portrait and added maskable icons for a native app feel.

---

## v0.9.68 - Launch Ready (2026-01-27)
**"Launch Readiness"**

Final polish for the public launch. Includes a massive SEO overhaul, smoother loading animations, and enhanced offline support.

### System Updates
-  **SEO Overhaul**: Dynamic social cards, sitemaps, and structured data.
-  **PWA Upgrade**: Added "Rich Install" support and a custom Offline page.
-  **Performance**: New "Lifeline" loading animation and faster visualizer startup.

---

## v0.9.67 - Direct Support (2026-01-27)
**"Direct Support Update 🤝"**

We made it easier to get help. You can now contact support directly from the app without leaving to your email client.

### New Features
-  **In-App Support**: Send messages directly to our team from the Settings menu.
-  **Faster Routing**: Profile links are now instant (no more redirects).

---

## v0.9.66 - Direct Line (2026-01-27)
**"The Contact Update 📧"**

We updated our support channels to ensure your feedback always reaches us. Plus, more polish for the public profile experience.

### Visual Overhaul
-  **Contact Update**: Updated all support and legal contact emails to `contact@freestyla.app`.
-  **Profile Polish**: Verified public profile stability.

---

## v0.9.65 - Instant Access (2026-01-27)
**"Instant Access Update ⚡"**

Navigation is now blazing fast. Accessing your profile is instant, and we fixed some deployment stability issues.

### Fixes & Improvements
-  **Instant Profile**: Clicking "Profile" now takes you there instantly without redirects.
-  **Smart Login**: Signing in now correctly returns you to your profile.
-  **Stability**: Fixed build errors ensuring a rock-solid experience.

---

## v0.9.64 - Crash Fix (2026-01-27)
**"The Profile Hotfix 🔥"**

We quickly squashed a bug that caused Public Profiles to crash. Visiting a user profile is now safe and smooth again!

### Fixes & Improvements
-  **Crash Fix**: Resolved a Server Component error on the profile page caused by an illegal function prop. Simple fix, big impact.

---

## v0.9.63 - Identity Restored (2026-01-27)
**"The Public Profile Polish 👤"**

We fixed a critical issue where public profiles were failing to load for guests, and ensured our Superadmins always have the correct identity.

### Fixes & Improvements
-  **Profile Fix**: Resolved the "Something went wrong" error on public profiles. Your stats are visible to the world again!
-  **Admin Identity**: Superadmins are now automatically assigned their correct handles (Admin1/Admin2) upon login.

---

## v0.9.62 - Accessibility Polish (2026-01-22)
**"The Accessibility Polish Update 🏆"**

We achieved a perfect 100/100 Accessibility score! This update brings crystal clear text contrast, massive performance gains by deferring audio engine startup, and a snappier feel thanks to lazy-loading.

### Fixes & Improvements
-  **100% Accessibility**: Fixed color contrast on beat metadata text to ensure it is readable for everyone.
-  **Performance Boost**: Deferred the audio engine warmup to when you actually start a session, eliminating page load lag.
-  **Lazy Loading**: Heavy menus like the Session Summary and Guest Login now load only when needed, speeding up the app.

---

## v0.9.58 - Gold Plated (2026-01-22)
**"The Golden Polish Update 🏆"**

We fixed the "Word Smith" achievement logic and updated the Premium Beat count to show the real number of tracks available.

### Fixes & Improvements
-  **Achievement Fix**: "Word Smith" now unlocks correctly when you view your achievements.
-  **Dynamic Counts**: The "Get Pro" modal now shows the actual number of premium beats available (140+) instead of a static "100+".

---

## v0.9.57 - Identity Fix (2026-01-22)
**"Identity & Access"**

Critical fixes for user profiles, guest access, and authentication security.

### Fixes & Improvements
-  **Profile Page**: Fixed Server Error on `/u/Admin` (UUID Logic).
-  **Guest Access**: Audio previews now play correctly (Storage Policy Update).
-  **Auth**: Enforced unique usernames and Admin handles.

---

## v0.9.56 - Clear Skies (2026-01-21)
**"Storage Clarity Update"**

Switched storage tracking from file size to duration (1-hour limit) and improved usage visualization for all users.

### Visual Overhaul
-  **Storage Bar**: Now displays usage based on recording duration (1h Cap).
-  **Visualization**: Removed "Unlimited" text; shows exact % used for everyone.

---

## v0.9.55 - Third Time Charm (2026-01-21)
**"Hotfix for the Hotfix (Again) 🙈"**

Fixed the build error by properly destructuring the sessionDuration prop. We manually verified the file this time!

### Fixes & Improvements
-  **Build Fix**: Officially exposed sessionDuration to the player scope.

---

## v0.9.54 - Patch Perfect (2026-01-21)
**"Hotfix for the Hotfix 🛠️"**

Fixed a build error introduced in the previous hotfix. The duration display is now truly fixed and stable.

### Fixes & Improvements
-  **Build Fix**: Resolved a variable scope issue in the player component.

---

## v0.9.53 - Time Lord (2026-01-21)
**"Duration Hotfix ⏱️"**

Fixed a bug where the total time would show as "INFINITY:NAN" while the audio was loading. We now properly use the saved session duration for instant display.

### Fixes & Improvements
-  **Instant Duration**: Usage of saved session duration ensures the timer and progress bar are correct immediately on load.
-  **Safety Net**: Added guards to prevent "NaN" or "Infinity" from ever appearing in the time display.

---

## v0.9.52 - Pixel Perfect (2026-01-21)
**"The Visual Perfection Update 🎨"**

We polished the audio player with a pro-grade progress bar and stabilized the playback engine to ensure your sessions never skip a beat.

### Visual Overhaul
-  **Audio Progress Bar**: Added a "SoundCloud-style" progress indicator. The waveform now fills with color as it plays!
-  **Header Harmony**: Enforced single-line titles to prevent text wrapping from breaking the layout on small screens.

### Fixes & Improvements
-  **Playback Reliability**: Fixed the "Empty src" error by rewriting the audio player lifecycle. Playback is now rock solid.

---

## v0.9.51 - Duplicate Removed (2026-01-21)
**"Pure Harmony ☯️"**

We found a ghost in the machine! The navigation bar was being rendered twice, causing layout shifts and clipping. We removed the double-print and restored pure symmetrical balancing.

### Visual Overhaul
-  **De-Duplication**: Removed the duplicate Bottom Nav that was squeezing the layout.
-  **Pure Centering**: Removed all manual offsets. The player now floats perfectly in the flex container.

---

## v0.9.50 - Visual Balance (2026-01-21)
**"Gravity Center 🎨"**

We removed the complex math and simply pushed the player down to visually balance it against the header. Sometimes simpler is better.

### Visual Overhaul
-  **True Centering**: Added top padding to push the player down, fixing the high bias.
-  **No Clipping**: Ensured the glow effects are fully visible.

---

## v0.9.49 - Relative Flow (2026-01-21)
**"Universal Center 🌐"**

We unlocked the physics of the layout. The player now adapts to any device notch or header size for true responsive centering.

### Visual Overhaul
-  **Fluid Layout**: Calculated dynamic padding to counterbalance the header and safe-areas on iOS/Android.
-  **Breathing Room**: Fixed an issue where the recording glow was getting clipped.

### Visual Overhaul
-  **Header Fix**: Prevented the "FreeStyla" title from overlapping with the new Help button.

---

## v0.9.48 - Euclidean (2026-01-21)
**"Geometric Center 📐"**

Mathematically perfect centering accounting for global UI chrome.

### Visual Overhaul
-  **Euclidean Center**: Fixed a subtle 28px vertical offset on mobile. The player is now geometrically centered.

### Visual Overhaul
-  **Grouped Controls**: Info pills are now grouped with the top controls for better visual hierarchy.

---

## v0.9.47 - True Center (2026-01-21)
**"Hotfix 🔧"**

Layout corrections for true mathematical centering.

### Visual Overhaul
-  **True Center**: Adjusted top spacing to perfectly balance the player against the bottom navigation.

---

## v0.9.46 - Perfect Center (2026-01-21)
**"The Balance Update ⚖️"**

We fine-tuned the practice experience with focused layout improvements and expanded frequency options for veteran rappers.

### New Features
-  **16-Bar Option**: You can now select "Every 16 Bars" for word switches. Perfect for long-form storytelling and endurance practice.

### Visual Overhaul
-  **Refined Layout**: The Practice Player now floats perfectly in the center of your screen, with balanced spacing from top to bottom.
-  **UI Cleanup**: Removed redundant "Upload" prompts in the beat selector for a cleaner look.

---

## v0.9.45 - Cloud Control (2026-01-20)
**"Cloud Control ☁️"**

We are introducing smart storage limits to keep the platform sustainable while ensuring Pro users get the premium experience.

### New Features
-  **Storage Limits**: Free users are now "Read-Only". You must be Pro to save new recordings. Pro users remain unlimited.
-  **Legacy Estimation**: Old recordings are automatically estimated to ensure fair usage calculations.

### Visual Overhaul
-  **Perfect Center**: The practice player is now perfectly centered on all devices, ensuring a consistent experience.
-  **Storage Bar**: A new visual indicator helping you track your cloud usage at a glance.

---

## v0.9.44 - Smart Flow (2026-01-20)
**"The Smart Flow Update 🧠"**

We made the practice engine smarter! No more repeated words, and we now prevent simple rhymes from appearing back-to-back to force you to think harder.

### System Updates
-  **Smart Anti-Repeat**: Words will now cycle through the ENTIRE library before repeating. No more seeing the same word twice in one session!
-  **Anti-Rhyme Logic**: The engine now prevents consecutive words that rhyme too easily (like "Nation" -> "Station"), ensuring a more diverse flow.

### Fixes & Improvements
-  **Navbar Scroll Fix**: The bottom navigation bar now reserves its own space in the layout, ensuring that content lists can never scroll behind it or be obscured.
-  **Smart Frequency Switch**: Changing the word frequency (e.g., 4 to 8 bars) now waits for the current word to finish before applying. No more jarring jumps or broken flows!

---

## v0.9.43 - Native Feel (2026-01-20)
**"Natural Flow"**

UI polish to make the app feel cleaner and more native.

### Visual Overhaul
- Fixed Navigation: Bottom bar is now locked to the bottom of the screen (no more scrolling away)
- Natural Scrolling: Removed forced 100vh locks for a smoother native scroll feel
- Settings Upgrade: Added visible Level badge and XP progress bar to your settings profile card

---

## v0.9.42 - Unified Profile (2026-01-20)
**"Unified Identity"**

Merging private profiles with public pages for a cohesive experience.

### New Features
- Refactored Profile System: Private dashboard merged into public /u/[username] page
- Unified Header: Standardized navigation bar across App, Profile, and Record pages
- Owner Controls: Added edit/settings tools directly to your public profile page
- Smart Redirects: /profile now auto-redirects to your unique user handle

---

## v0.9.41 - Full Roster (2026-01-19)
**"The Admin Visibility Update"**

We introduced a comprehensive User List in the Admin panel, giving admins full visibility into the community. Track growth, subscription status, and engagement all in one place.

### New Features
-  **Admin User List**: A powerful new dashboard to view all registered users with real-time stats (Level, XP, Streaks) and subscription status.
-  **Smart Badges**: Instantly spot PRO users and Superadmins with distinct visual badges in the user table.

---

## v0.9.40.5 - Cloud Native (2026-01-19)
**"The Storage & Polish Update"**

We introduced a sleek new Cloud Storage bar to tracking your recording capacity, opened up the Recordings page for everyone to preview, and performed a massive system-wide emoji cleanup for a cleaner professional look.

### New Features
- **Cloud Storage Bar**: Added an iCloud-style storage visualization on the Recordings page. Pro users can now see exactly how much studio time they have engaged.
- **Open Access**: The Recordings page is now accessible to all users! Free users can browse the interface (with storage features locked behind Pro).

### Visual Overhaul
- **Emoji Clean-up**: rigorously removed all emojis from the application UI and documentation for a more polished, app-native aesthetic.

### Fixes & Improvements
- **Performance**: Optimized component rendering on the Recordings page.

---

## v0.9.40 - Polish & Progression (2026-01-19)
**"The Master Bug Fix Update "**

We addressed the highest priority issues from our Master Bug Report, restoring your XP bars, fixing broken achievements, and finally adding that Random Beat button!

### New Features
-  **Random Beat**: Added a "Random Beat" option to the beat selector. Perfect for when you want the vibe to choose you.

### Fixes & Improvements
-  **Profile Stats Restored**: Fixed a bug where your XP Bar and Level indicator were invisible on the profile page. Your grind is visible again!
-  **Achievement Unlocked**: Fixed the "Word Smith" achievement logic. If you earned it, it should now unlock automatically.
-  **Premium Fix**: Verified that locked beats correctly trigger the upgrade modal.

---

## v0.9.39 - Unblocked (2026-01-17)
**"The Pro Save Fix "**

We fixed a critical bug where Pro users were blocked from saving their sessions by an incorrect "Get Pro" modal. Your flow is now unblocked!

### Fixes & Improvements
-  **Pro Save Unblocked**: Fixed a bug where the "REC" button would trigger the "Get Pro" modal even for subscribed users. Pro users can now toggle recording and save sessions freely.

---

## v0.9.38 - Open Mic (2026-01-17)
**"The Guest Pass Hotfix ️"**

We fixed a critical bug preventing guest users from starting a recording session. The "The Booth" is now open to everyone again!

### Fixes & Improvements
-  **Guest Recording Enabled**: Removed an incorrect check that blocked unauthenticated users from hitting record. Rap first, sign up later.
-  **Upgrade Trigger**: Fixed the "Get Pro" modal not appearing when requested.

---

## v0.9.37 - Fair Game (2026-01-17)
**"The True Shuffle Update "**

We fixed the word randomization logic to ensure you actually get new words in every session, and now your stats will finally track "Words Unlocked" correctly.

### Fixes & Improvements
-  **True Randomness**: Fixed a caching issue that caused the same words to appear repeatedly. Every session now pulls a fresh batch.
-  **Stats Sync**: "Words Unlocked" stats now correctly track unique words encountered, fixing the discrepancy with "Total Words Generated".

---

## v0.9.36 - Direct Line (2026-01-16)
**"The Feedback Fix "**

We fixed the "Report Bug" link in the settings menu to correctly redirect to the dedicated feedback page, and cleaned up the Patch Notes UI.

### Fixes & Improvements
-  **Report Bug Redirect**: The "Report Bug" button in Settings now correctly takes you to the Feedback page instead of the Patch Notes.
-  **UI Cleanup**: Removed the redundant "Feedback" form from the bottom of the Patch Notes page.

---

## v0.9.35 - Seamless Upload (2026-01-16)
**"The Flow State Update "**

We smoothed out the "My Tracks" experience. You can now upload beats directly from the difficulty menu and managing your library is easier than ever.

### New Features
-  **Instant Upload**: Added a smart "Upload your first beat" prompt and a permanent "Upload new track" button right in the My Tracks dropdown.
-  **Seamless Flow**: Uploading from the difficulty menu now auto-redirects you to the upload vault.

### Fixes & Improvements
- ️ **Delete Fixed**: Resolved an issue where deleting server-side tracks from the dropdown wasn't working. Clean up your library with confidence!

---

## v0.9.34 - Five Stars (2026-01-16)
**"The Social Proof Update "**

We enabled a seamless rating experience, polished beat card visuals, and finally solved audio looping for infinite flow.

### New Features
-  **Rate Us**: Added a sleek rating modal that appears after your 3rd session. Love the app? Let us know!
- ⭐ **Star Power**: You can now drop a star rating directly in the feedback form.

### Fixes & Improvements
- ️ **Perfect Loops**: Rewrote the audio engine to use Web Audio scheduling. Beats now loop seamlessly with zero gaps.
-  **Clean Cards**: Combined Artist and Producer names on beat cards for a cleaner look.

---

## v0.9.33 - Go Time (2026-01-16)
**"The Green Light Update "**

We made sure your recordings always playback perfectly and gave the Practice Mode a clearer, punchier "START" button so you know exactly when to drop your bars.

### Fixes & Improvements
-  **Playback Rescued**: Fixed a "Failed to Play" bug caused by some beats having spaces in their cloud filenames. Your history is safe!
-  **Clearer Start**: Swapped the ambiguous mic icon for a big, bold, pulsing "START" button. Less guessing, more rapping.

---

## v0.9.32 - Liquid Flow (2026-01-16)
**"The Responsive Polish Update "**

We smoothed out the Admin experience and fine-tuned the mobile layout to feel even more native. Plus, difficulty settings now stick instantly!

### Fixes & Improvements
- ️ **Admin Focus Fix**: Resolved an annoying bug where editing track details would lose focus after every character. Smooth typing is back!
- ️ **Instant Difficulty**: Changing difficulty mid-session now instantly updates the word vibe for the rest of your session.

### Visual Overhaul
-  **Compact Mobile Layout**: Optimized padding and scaling for small iPhones (SE, Mini) to ensure all controls fit on a single screen without scrolling.
-  **Responsive Practice controls**: The REC indicator and main buttons now scale aggressively to respect the viewport on smaller devices.

---

## v0.9.31 - Safe Zone (2026-01-16)
**"The Quality of Life Update ️"**

A massive polish update ensuring content never covers navigation, fixing audio glitches during review, and professionalizing the experience with better legal pages and feedback tools.

### Visual Overhaul
-  **Bottom Nav Safety**: Implemented global padding logic so content is never hidden behind the bottom bar on any device.
-  **Header Harmony**: Constrained header titles to prevent text overlapping with buttons on smaller screens.
-  **Professional Polish**: Refined the look of legal pages and feedback forms with cleaner iconography.

### Fixes & Improvements
-  **Audio Glitch Eradicated**: Fixed stuttering and popping during recording review playback.
-  **Smooth Waveform**: The playback indicator now smoothly glides across the track without jitter.
- ️ **Feedback Center**: Launched a dedicated /feedback page for easier bug reporting.

---

## v0.9.30 - Neon Ring (2026-01-16)
**"The Visual Polish Update "**

We gave the Cypher UI a major facelift with a new outer-ring layout and boosted the "Siren" intensity for maximum hype. Plus, a handy Help button in the header!

### Visual Overhaul
-  **Cypher Outer Ring**: The player segments now hug the outer edge of the main control button for a cleaner, futuristic look.
-  **Siren Boost**: The "Police Siren" effect before word switches is now 200% more intense. You can't miss it!
- ℹ️ **Header Help**: Added a quick-access Help button (?) to the global header that takes you straight to the "How it Works" guide.
-  **Glass Record Ring**: The central record button is now a consistent transparent glass ring with a purple border, ensuring the logo always shines through.

---

## v0.9.29 - Smooth Operator (2026-01-15)
**"The Safe Resume & Admin Polish Update "**

We’ve ironed out the playback wrinkles in Practice Mode (resuming works perfectly now!) and gave the Admin Beat Upload experience a serious upgrade with better layouts and stricter data controls.

### Fixes & Improvements
- ⏯️ **Perfect Resume**: Fixed a bug where resuming a paused session wouldn't restart the beat. Now it picks up exactly where you left off.
-  **Safe Pausing**: Switching browser tabs now safely pauses your session instead of stopping it completely.
-  **Spacebar Safety**: Pressing Spacebar now gently pauses the session (with confirmation) instead of abruptly ending it.

### New Features
- ️ **Admin Upload 2.0**: Completely redesigned the beat upload card. Added a sleek "Free/Premium" toggle switch and optimized the layout.
- ️ **Smart Genre Filter**: The Beat Vault filter now dynamically updates to show only relevant genres for the tracks you are viewing.
-  **Data Integrity**: Producer Name and Genre are now mandatory fields for new uploads.

---

## v0.9.28 - The One Ring (2026-01-15)
**"Cypher Rings Restored "**

Fixed a regression where the player turn indicators in Cypher Mode were missing. The visual rings are back!

### Fixes & Improvements
-  **Cypher Mode**: Restored missing player turn rings.
-  **Visual Fix**: Corrected SVG rendering for player segments.

---

## v0.9.27 - StrictMode Safe (2026-01-15)
**"The True Timer Fix ⏱️"**

The session timer now runs at the correct speed! We discovered React StrictMode was causing the timer to run 2x faster by spawning duplicate animation loops.

### Fixes & Improvements
- ⏰ **Accurate Timer**: Timer now counts at exactly 1 second per real second.
- ️ **StrictMode Guard**: Added animation ref guard to prevent duplicate timing loops.
-  **Clean Exit Paths**: All animation loop exit points now properly clean up the frame reference.
-  **Silence on Save**: Fixed "Leave site?" warning appearing after successful session save.

---

## v0.9.26 - True Time (2026-01-15)
**"The Metronome Fix ⏱️"**

Minor timer stability improvements and layout polish.

### Fixes & Improvements
-  **Stable Dependencies**: Removed unstable object references from timer effect.
-  **Layout Lock**: Added fixed height to control buttons row to prevent player circle from shifting when controls appear.

---

## v0.9.25 - Pocket Studio (2026-01-15)
**"The Mobile & Precision Update "**

A comprehensive update focusing on mobile ergonomics and rigorous timing precision. We rebuilt the layout for small screens and locked the word intervals to the musical grid.

### System Updates
-  **Grid Lock Integrity**: Fixed a bug where changing bar frequency mid-session could freeze the timer. Timing is now reset instantly on change.
-  **Smart PWA Installer**: The app now detects iOS vs Android and teaches iOS users how to bypass microphone permission prompts.

### Visual Overhaul
-  **Dynamic Scaling**: The practice ring now caps its height at 45% of the screen, ensuring buttons are never cut off on smaller IPhones.
-  **Split Layout**: Separated the Exit/Pause buttons into their own dedicated row to prevent overlap with the main player ring.
-  **Viewport Stability**: Enforced `100dvh` (Dynamic Viewport Height) to respect the Safari bottom bar, preventing navigation issues.

---

## v0.9.20 - Grid Lock (2026-01-15)
**"The Precision Update "**

A major stability update introducing the "Grid Lock" timing engine for perfect musical synchronization, plus a polished "Satellite Layout" for the player controls.

### System Updates
-  **Grid Lock Timing**: Word switching is now mathematically locked to the beat grid. No more drifting!

### Visual Overhaul
- ️ **Satellite UI**: Redesigned player controls to prevent button cropping and improve reachability.
-  **Layout Fixes**: Solved vertical scrolling issues on smaller screens across the app.

---

## v0.9.19 - Silent Loop (2026-01-15)
**"Polish & Precision"**

A smoother practice experience with seamless audio looping, pixel-perfect button alignment, and a smarter TTS engine that knows when to be quiet.

### Fixes & Improvements
- Seamless Looping: Fixed the 0.5s delay at the end of audio tracks. Beats now loop perfectly forever.
- Smart Silence: The voice coach now instantly stops talking when you leave a session or switch tabs.
- Visual Balance: Interactive buttons are now perfectly centered, and the Mode indicator takes center stage.

---

## v0.9.18 - Focus Mode (2026-01-13)
**"Streamlined Setup"**

We removed the "Word Theme" selector to make starting a session faster and more intuitive. One bank, total focus.

### Fixes & Improvements
- Feature Removal: Word Themes have been pruned for a simpler experience.

---

## v0.9.17 - Red Line (2026-01-13)
**"Visual Playhead"**

Added a distinct red playback cursor to the audio waveform, so you always know exactly where you are in the track.

### Visual Overhaul
- Waveform: Now features a glowing red playhead indicating current position.

---

## v0.9.16 - Safety Net (2026-01-13)
**"Smart Fallbacks & Sleek Reviews"**

We polished the Review page to look more pro and fixed a logic quirk where "Easy" mode could get tough if the internet blipped. Plus, dynamic difficulty switching!

### Visual Overhaul
- Review Page: Title moved to app header, removing clutter and waste of space.
- Layout: Tighter spacing on top of review and practice screens.

### Fixes & Improvements
- Word Engine: "Easy" mode is now strictly easy, even offline.
- Dynamic Difficulty: Changing the difficulty slider mid-session now instantly updates the word vibe.

---

## v0.9.15 - One Screen (2026-01-13)
**"Mobile Experience"**

Practice sessions now fit perfectly on your mobile screen. No scrolling, no distractions—just you and the booth.

### Fixes & Improvements
- Viewport Lock: The "The Booth" now uses 100% of your screen height, eliminating annoying scrollbars.
- Responsive Ring: The record button scales down for smaller phones so you can reach every control.
- Smart Layout: Controls now distribute themselves evenly to fill available space.

---

## v0.9.15 - Prism (2026-01-13)
**"Cypher Visual Alignment"**

Small but mighty visual tweak: The Cypher player selection buttons now match the actual in-game player colors.

### Fixes & Improvements
- Cypher Setup: Player count buttons now sport their team colors (Orange, Gold, Green, Blue).

---

## v0.9.14 - Safe Mode (2026-01-13)
**"Session Safety & Layout"**

Practice sessions are now safer! We added confirmation dialogues to prevent accidental exits and polished the studio controls layout.

### New Features
- Exit Safeguard: Use the Bottom Bar freely. We now ask for confirmation before discarding your session.
- Layout Polish: Resized the Record button and moved controls up for a cleaner look.
- Smart Controls: Pause/Discard buttons now hide automatically when recording is disabled.

---

## v0.9.13 - Obsidian (2026-01-13)
**"Dark Mode Refined"**

We heard you! The track covers have been reimagined with a sleeker, darker, and more premium aesthetic.

### New Features
- Dark Premium Palettes: Replaced neon colors with deep blacks, blues, and charcoals.
- De-cluttered Interface: Removed the large "RAP" text overlay from track cards.
- Subtle Textures: Refined the noise and pattern overlays for a cleaner finish.

---

## v0.9.12 - Fresh Paint (2026-01-12)
**"Visual Velocity"**

We have completely overhauled the track browser with a new Generative Art engine. Every beat now gets a unique, high-fidelity cover.

### Visual Overhaul
- Generative Covers: No more static gradients. Every track has unique, code-generated art.
- Streetwear Aesthetic: Added noise textures and bold typography overlays.
- Dynamic Patterns: Mesh gradients, neon shapes, and geometric grids.

---

## v0.9.11 - Clean Sweep (2026-01-12)
**"UI Hotfix"**

Removed the redundant Daily Streak widget from the Difficulty Selection page. Tracking is now exclusively via the header icon.

### Visual Overhaul
- UI Cleanup: Removed the duplicate "Keep the Streak" widget from the center of the Skill Check page.

---

## v0.9.10 - Neon Squad (2026-01-12)
**"The Cypher Polish"**

Refining the Cypher Mode experience with distinct player identities and cleaning up global header rendering.

### Visual Overhaul
- Cypher Player Roster: Implemented game-like avatars with unique colors (Purple, Orange, Gold, Green, Blue) for each player.
- Hover Streak Widget: Moved the Streak details into a tooltip to reduce header clutter.
- Header Cleanup: Resolved text duplication issues in the window title for a cleaner app presence.

### Fixes & Improvements
- Manifest Update: Shortened app name to "FreeStyla" to prevent title redundancy.
- Color Logic: Fixed "all blue" bug by correcting accent color definitions in the theme.

---

## v0.9.7 - Grid Lock (2026-01-12)
**"Precision Sync Update"**

We fixed a critical timing bug where switching difficulties mid-session would cause words to drift off-beat. Now, everything snaps perfectly to the musical grid.

### Fixes & Improvements
- Grid Alignment: Difficulty switches now "snap" to the next musical phrase.
- Visual Sync: Timer ring always starts fresh on new words, no matter when you switch.
- Cypher UI: Relocated player indicator to the bottom controls.

### Fixes & Improvements
- Playback: Fixed "Failed to play recording" error for new uploads.

---

## v0.9.5 - Wave 2 (2026-01-11)
**"Career Update"**

The "Career Update" is here! We added 27 new achievements to track your rise from rookie to legend, plus better timer visibility and stability fixes.

### New Features
- Added 27 new achievements (XP, Streaks, Skill, Volume)
- Enhanced database seeding for new achievements

### Visual Overhaul
- Increased session timer size for better readability in the Booth

### Fixes & Improvements
- Fixed build system type errors for smoother deployments

---

## v0.9.4 - Visual Loyalty (2026-01-11)
**"High Contrast Update"**

Improving accessibility with higher contrast settings menus and finalizing the Global Header rollout.

### Visual Overhaul
- High Contrast Settings: Darker backgrounds and brighter text for better readability.
- Global Headers Complete: Finalized AppHeader integration across Search and Admin pages.

---

## v0.9.3 - Consolidated Identity (2026-01-11)
**"Global Header Architecture"**

Replacing inconsistent page headers with a unified, context-aware global header system that improves mobile visibility and branding.

### Visual Overhaul
- Global Header System: Unified AppHeader across all pages (Practice, Recordings, Admin, etc.).
- Dynamic Branding: Custom titles (e.g., "THE BOOTH") replace static "FreeStyla" logo.
- Mobile Visibility: Increased header height and enabled subtitles on mobile.

---

## v0.9.2 - Studio Tune-Up (2026-01-10)
**"Practice Player Polish"**

A focused update refining the Practice Mode experience and squashing critical audio bugs.

### New Features
- Session Timer Restored: The countdown is back, displayed below the word.

### Fixes & Improvements
- 10-Minute Sessions: Fixed premature session termination.
- Gapless Loop: Eliminated audio gap when beats loop.
- Gamification Logic: Fixed 0-streak bug. Real stats now track.
- Branding Polish: Finalized FreeStyla rename in all exports.

---

## v0.9.1 - App Native (2026-01-10)
**"The Mobile Flow"**

A major layout update transforming FreeStyla into a true single-screen experience. The app now feels native, with locked viewports and smooth internal scrolling.

### System Updates
- Single-Screen Layout: The app viewport is now locked. No more full-page scrolling.
- Internal Scrolling: Content lists now scroll independently while keeping headers/footers fixed.
- Adaptive Design: Optimized for all mobile notches and safe areas.

### Fixes & Improvements
- Layout Stability: Fixed layout jitter and double scrollbars on mobile.
- Practice Page: Resolved type errors and modal stability issues.

---

## v0.9.0 - FreeStyla (2026-01-10)
**"The Rebrand"**

A new identity. "FlowForge" is now "FreeStyla". We have also renamed the "Vinyl Collection" to "Beat Vault" and polished the gamification system for a unified, premium experience.

### Visual Overhaul
- Identity Shift: "FlowForge" branding replaced with "FreeStyla" across the entire application.
- Beat Vault: Renamed "Vinyl Collection" to "Beat Vault" to better align with our premium "Unlock the Vault" messaging.
- Navigation: "Vinyl" tab renamed to "Beats" for clarity.

### Fixes & Improvements
- Critical Audio: Resolved playback failures on the Practice Page for reliable sessions.
- Record Button: Fixed icon rendering issues for a cleaner look.
- Profile Images: Google profile pictures now correctly display in the sidebar.
- Victory Screen: Enhanced animations and data connection for the post-session summary.

---

## v0.8.1 - Embedded Share (2026-01-10)
**"The Social Polish"**

Refining the recording sharing UI to use an embedded, non-overlapping layout.

### Visual Overhaul
- Embedded Share Menu: The sharing dropdown now pushes content down instead of floating, preventing UI overlap.
- Solid Backgrounds: Removed transparency from the share menu for better readability.

---

## v0.8.0 - Level Up (2026-01-10)
**"The Gamification Core"**

The gamification system is now fully operational with real backend persistence for XP and Levels. No more placeholders.

### New Features
- Real XP Persistence: User levels and XP are now saved to the database.
- Scoring Engine: Earn 5 XP/word, 2 XP/second, and 100 XP/achievement.
- Live Victory Screen: Session summary now displays your actual database progress.

---

## v0.7.7 - Direct Access (2026-01-10)
**"The Seamless Selection"**

Removing friction from the difficulty selection flow. We removed the "Enable Local Tracks" slider and made local uploads directly accessible in the beat dropdown by default.

### Visual Overhaul
- Direct Access: Removed the "Enable Local Tracks" slider. Local tracks are now always available in the beat dropdown.
- UI Cleanup: Simplified the Difficulty Selection interface.

---

## v0.7.6 - Visual Rhythm (2026-01-10)
**"The Heartbeat Update"**

Refining the visual language with a pro-level waveform for uploads and restoring the classic Heart icon for favorites.

### Visual Overhaul
- Heart Restoration: Replaced the checkmark with a proper Heart icon for favoriting beats.
- Static Waveform: New SoundCloud-style visualization for beat calibration.

### New Features
- Precision Cue Points: Click or drag anywhere on the new full-width waveform to set your start point instantly.

---

## v0.7.5 - XP Tuner (2026-01-10)
**"The Final Polish"**

A critical quality-of-life update focusing on the "gamification feel" and eliminating session friction. We rebalanced the XP system and cleaned up the victory screen.

### Fixes & Improvements
- XP Rebalance: Shifted to action-based XP (10 XP/word + 1 XP/sec).
- Upload Core: Fixed "Failed to create upload URL" error.
- Victory Screen: Removed redundant "VICTORY" header.
- Display Timing: Word prompt waits for countdown.
- Exit Safety: Added "Leave Session?" confirmation modal.
- Ghost Voices: Fixed TTS persisting after navigation.

---

## v0.7.4 - Secure Flow (2026-01-10)
**"The Safety Update"**

Protecting session data with stricter recording safety checks and ensuring reliable playback for deep-dives.

### New Features
- Track Change Safety: Changing beats during a recording now asks for confirmation, preventing accidental session loss.

### Fixes & Improvements
- Recording Review: Fixed playback failures in the detailed review page by implementing signed secure URLs.
- Achievement Text: "Legacy Milestone" is now correctly labeled as "Achievement Unlocked!".

---

## v0.7.3 - Studio Prime (2026-01-10)
**"The Studio Perfected"**

Refined the studio interaction with intelligent defaults and mixed audio downloads for a complete production workflow.

### New Features
- Mixed Audio Download: Downloading a recording now intelligently merges the voice and beat into a high-quality WAV file.
- Studio Defaults: "Studio FX" Reverb is now ON by default for instant professional sound.

### Fixes & Improvements
- Beat Volume Slider: Fixed a critical bug where adjusting the beat volume would stop playback.
- Recording Playback: Recordings now properly play both the voice track and the beat track in sync.
- Studio Tools Visibility: Specialized tools are now open by default for easier discovery.

---

## v0.7.2 - Cinema Verité (2026-01-10)
**"The Video Studio"**

Introduced a dedicated Video Export Studio page and refined the gamification UI for clarity.

### New Features
- Video Export Studio: A dedicated page for creating high-fidelity video exports of your sessions.
- Random Difficulty: Level 4 is now fully live, mixing words from all difficulty tiers.

### Visual Overhaul
- UI Clarity: Renamed "Difficulty Selection" to "Freestyle Session" and removed cluttered widgets.
- Real-Time Streaks: Fixed gamification displays to show live user data instead of placeholders.

---

## v0.7.1 - Liquid Metal (2026-01-10)
**"The Mobile Polish"**

Transformed the Settings menu for mobile, improved navigation flow, and fixed the "Double Beat" upload bug.

### Visual Overhaul
- Collapsible Studio Controls: Audio settings are now tucked into a sleek accordion to save screen space.
- Compact Support Grid: Support links rearranged into a touch-friendly grid layout.
- Universal Back Navigation: Added back buttons to Terms, Privacy, and Calibration pages.

### Fixes & Improvements
- Duplicate Prevention: Fixed a bug where uploading a beat would show it twice in the list.
- Admin Restoration: Superadmins can once again upload directly to the public library.
- User Beat Upload: Added a clear "X" close button to the upload modal.

---

## v0.7.0 - Master Control (2026-01-10)
**"The Admin Update"**

Empowering Super Admins with full control over the beat library: curation, editing, and monetization.

### New Features
- Admin Dashboard: New /admin/beats interface for managing the platform catalog.
- Beat Reordering: Curate the playlist order with simple Up/Down controls.
- Metadata Editing: Fix typos or update Beat details (BPM, Artist, Genre) on the fly.
- Monetization Toggle: Instantly switch tracks between FREE and PRO tiers.

### Fixes & Improvements
- Beat Dropdown UI: Moved the Favorite (Heart) icon to the right for a cleaner list view.
- Database Sync: Added sortOrder support for persistent custom playlists.

---

## v0.6.2 - Pure Flow (2026-01-10)
**"The Zero State"**

Achieved a "Zero Problem" build state, perfected audio loop handling, and finalized admin tools.

### Fixes & Improvements
- Concurrent Playback: Implemented "Single Source of Truth" audio logic. Only one track plays at a time.
- Gapless Looping: Eliminated the restart gap in SessionPlayer and RecordingCard loops.
- Build Stability: Resolved 100% of lint warnings and type errors for a pristine codebase.
- Admin Management: Fixed Beat Reordering and Upload tools.

---

## v0.6.1 - Visual Flow (2026-01-10)
**"The Waveform Update"**

SoundCloud-style waveform overhaul with tap-to-seek functionality and integrated review visualization.

### Visual Overhaul
- SoundCloud-Style Waveform: Two-tone coloring system (Purple Played / White Unplayed) across the entire platform.
- Integrated Review Waveform: A high-fidelity waveform has replaced the basic progress bar in the Session Review Studio.

### Fixes & Improvements
- Global Tap-to-Seek: Jump to any timestamp instantly by tapping the waveform in both upload and review modes.
- Calibration Marker: Restored the red "START" bar visibility during beat upload playback.
- Cue Point Mastery: Playback now correctly honors and starts from the defined cue point in the upload window.
- UI Cleanup: Removed the redundant "Test Start Point" button for a more streamlined calibration experience.

---

## v0.6.0 - Platinum Record (2026-01-09)
**"The Studio Update"**

Major release consolidating our audio engine overhaul, visual intensity updates, and the highly requested Studio Quality Export.

### New Features
- Production Export: Download sessions with "Studio FX" (Reverb & Polish) baked in.
- Visual Intensity: Dynamic "Cop Siren" and Shake effects warn you of upcoming word changes.
- Guest Restoration: Unsaved guest sessions are now automatically restored after login.

### System Updates
- Audio Engine 2.0: Complete rewrite aiming for zero-latency start times on all devices.
- Security Lock: Integrity checks now prevent beat ripping by enforcing vocal volume rules.
- Safari Support: "Mute-Prime-Play" strategy guarantees playback reliability on iOS.

### Fixes & Improvements
- XP System: Fixed issue where XP/Levels would sometimes display as 0 after a session.
- Navigation: Standardized "Back" gestures across Review and Recording pages.
- Safety Nets: Added exit confirmations to prevent accidental data loss during practice.

---

## v0.5.9 - Final Polish (2026-01-09)
**"The Final Polish"**

Resolved user-reported friction points in the practice session, including upload errors, exit confirmation, and precise timing logic.

### Fixes & Improvements
- Upload Error: Fixed "Failed to create upload URL" by correcting bucket reference.
- Exit Confirmation: Added modal to prevent accidental session loss.
- Word Randomization: Ensured sessions start with random words every time.
- Display Timing: Word prompt waits for "GO" before appearing.
- TTS Cleanup: Speech stops immediately on navigation.

---

## v0.5.8 - High Intensity (2026-01-09)
**"Sirens & Intensity"**

Added high-intensity visual warnings before word changes.

### Visual Overhaul
- Implemented "cop siren" alternating red/blue ring effects
- Added background pulsing and word shake animations during warnings
- Configured sirens to trigger 4s before every other word change

---

## v0.5.7 - Direct Flow (January 09, 2026)
**"The Direct Flow"**

Refined session handoff logic and streamlined Victory screen for a more direct post-session experience.

### Fixes & Improvements
- Session Termination: Fixed loop bugs where beats wouldn't stop after session end.
- Auto-Summary: Guaranteed modal trigger on session completion.
- Victory UI: Removed "Menu" button and centered "Continue" for a streamlined flow.

---

## v0.5.6 - Back to Basics (January 09, 2026)
**"The Stable Circle"**

Restored core practice UI and hardened architecture against serialization errors.

### Fixes & Improvements
- Props Sanitized: Resolved persistent Next.js warnings about non-serializable props.
- UI Restoration: Reverted Practice Studio to original circular design.
- BeatDropdown: Embedded and retracted by default in practice mode.

---

## v0.5.5 - Perfect Sync (January 09, 2026)
**"The Zero Warning"**

Critical regressions in audio timing and synchronization resolved. Achieved a perfectly clean build with 0 warnings.

### Fixes & Improvements
- Audio Logic: Removed race conditions and laggy polling loops for absolute precision on start.
- Double TTS: Fixed logic bug causing the first word to repeat twice.
- Error Persistence: useBeatPlayer now clears errors on stop/restart.
- Achievements: Implemented auto-seeding to ensure milestones are always populated.
- Industrial Cleanup: Fixed all remaining 8 build warnings across the codebase.

---

## v0.5.4 - Smooth Operator (January 09, 2026)
**"The Polish"**

Quality-of-life improvements that make the app feel more responsive and polished.

### Fixes & Improvements
- Collapsible Dropdown: Practice beat selector is now collapsible with smooth animations.
- Mic Icon Fix: Resolved rendering issues with the record button microphone icon.
- Profile Pictures: Fixed Google profile images not displaying in the sidebar/profile.
- Navigation: Improved transition flow from Vinyl Collection to Practice Studio.

---

## v0.5.3 - Second Wind (January 09, 2026)
**"The Resurrection"**

Critical fixes for audio playback, authentication loops, and UI visibility. The app was broken; now it works.

### Fixes & Improvements
- Audio Engine: Implemented "Mute-Play-Unmute" strategy for guaranteed playback on Safari/Mobile.
- Auth Redirect Loop: Removed edge middleware protection for Profile/Recordings routes.
- Record Button: Fixed invisible "REC" button by changing black-on-black styling to white.
- Layout Overlap: Reduced min-height on Practice page to prevent bottom nav overlap.
- Cypher Mode: Created mock room creation API and lobby page.
- Tracks Fallback: Added client-side fallback beats if API fails.

### System Updates
- Audio Player Debugging: Added comprehensive lifecycle logging.
- Grace Period: Session won't stop before 1.5s to prevent instant-death glitches.
- Optimistic UI: Play state updates immediately for faster feedback.

---

## v0.4.0 - Diamond Cutter (December 21, 2025)
**"The Platinum Polish"**

The final layer of sheen. We heard your feedback and have refined the core experience. This update brings user beat uploads, a completely revamped layout, and critical stability fixes.

### New Features
- User Beat Uploads: Pro users can now upload, calibrate, and manage their own instrumental tracks directly from the Tracks page.
- Beat Vault: Added tabs for "Public Tracks" and "My Tracks" for easier library management.
- Achievements System: The "Leaderboard" is now "Achievements", featuring 100+ Overwatch 2 style medals.
- Classic Mode: Restored the beloved central-player layout for the Practice Studio.

### Fixes & Improvements
- Windows Support: Resolved all file-system encoding issues for a smoother dev experience.
- Search & Filters: Fixed all filtering logic on the Tracks page.
- Performance: Optimized asset loading for instant playback.
- Visuals: Standardized font usage (Inter/JetBrains Mono) and removed visual clutter.

---

## v0.3.0 - Level Up (December 20, 2025)
**"The Gamification Update"**

Turn your practice into a game. We have introduced a robust streak system, XP progression, and a battle-pass style rewards track to keep you motivated.

### New Features
- Streak System: Track your daily consistency with fire and ice visual indicators.
- XP Battle Pass: Earn XP for every minute you flow and unlock tier rewards.
- Zen Mode: Toggle off all gamification elements when you just need to focus.

### System Updates
- Offline Support: Optimistic UI updates ensure your progress counts even if the connection drops.
- Safe Area Wrapper: Optimized layout for modern mobile devices (Notches/Dynamic Islands).

---

## v0.2.1 - Infinite Loop (December 18, 2025)
**"The Perfectionist"**

Reaching for the peak. This update completes the "Bible" requirements with a focus on deep practice mechanics, better progression tracking, and dynamic social sharing.

### New Features
- Word "Bag System": New shuffle algorithm ensures no word repeats until the entire 500-word set is exhausted.
- Stat Card Sharing: Export your sessions as custom PNG images shaped for social media stories.
- Random Mode: A new "Dice" button to instantly shake up your practice setup.
- Bug Reporting: Direct feedback link integrated into the settings dropdown.

### System Updates
- Advanced Badge Logic: "Perfectionist", "The Listener", and "Machine Gun" badges are now fully automated.
- Beat Preloading: Start buttons now wait for audio assets to be fully ready before allowing entry.
- Panic Penalty: Skips now correctly impact your Flow Density score.

---

## v0.1.8 - Arena of Voices (December 14, 2025)
**"The Social Awakening"**

The silence has been broken. The barriers between emcees have fallen. The Social Awakening brings the community to life with the introduction of public profiles, feeds, and the ultimate test of skill: Duels.

### New Features
- The Global Feed: A live stream of the latest fire dropped by the community.
- Duels System: Challenge another emcee to a asynchronous rap battle.
- Public Profiles: Showcase your best tracks, stats, and duel history.
- Follow System: Build your crew and never miss a drop.

### System Updates
- Voting Mechanics: Secure, context-aware voting system ensuring fair play.
- Notification Infrastructure: The foundation for future alerts has been laid.

---

## v0.1.7 - Crystal Clarity (December 14, 2025)
**"The Polish & The Pragmatic"**

Before the gates opened, the world had to be perfected. This update focused on squashing the bugs that hid in the shadows and refining the experience to a mirror shine.

### Fixes & Improvements
- Mobile responsiveness overhauled for seamless flow on all devices.
- Navigation refined for intuitive movement through the app.
- Performance optimizations to ensure the beat never skips.

---

## v0.1.5 - Royal Ascension (December 11, 2025)
**"The Purple Void"**

A shift in the visual spectrum. The old Orange has faded, replaced by the regal FreeStyla Purple (#7D7AFF). This massive design overhaul redefined the aesthetic of the entire platform.

### Visual Overhaul
- New Color System: All UI elements migrated to the new Purple Design System.
- Premium Indicators: Gold badges now mark the elite features.
- Dark Mode Perfection: Contrast and shadows tuned for late-night studio sessions.

### Premium Features
- Subscription Foundations: The groundwork for Pro accounts has been laid.
- Exclusive Beats: 8 new high-fidelity beats added to the vault.

---

## v0.1.4 - Memory Keepers (November 11, 2025)
**"The Vault"**

The ability to capture time. Emcees can now save their sessions to the cloud, building a library of their lyrical evolution.

### New Features
- Cloud Storage: Secure uploads to Supabase Storage.
- Recording Library: A dedicated space to manage, rename, and download tracks.
- Auto-Save: Sessions save automatically upon completion.
- Delete Policy: Automated cleanup ensures the storage eco-system remains healthy.

---

## v0.1.3 - Sonic Boom (November 11, 2025)
**"Echoes of the Beat"**

The core engine roars to life. The audio system was finalized, bringing low-latency playback, perfectly synchronized word prompts, and the visual feedback of the Timer Ring.

### New Features
- The Practice Studio: The heart of FreeStyla. A fully immersive freestyle environment.
- Timer Ring: A visual representation of time, looping perfectly with the beat.
- Word Prompts: Dynamic words that challenge your flow in real-time.
- Audio Recorder: Browser-based recording with waveform visualization.

---

## v0.1.1 - The Foundation (November 10, 2025)
**"Genesis"**

In the beginning, there was code. The infrastructure was forged from the void.

### System Updates
- Next.js 14 initialized.
- Database connected (Supabase & Prisma).
- Authentication secured (Google OAuth).
- Design System established (Tailwind CSS).

---

*Generated automatically from lib/data/patch-notes.ts*
