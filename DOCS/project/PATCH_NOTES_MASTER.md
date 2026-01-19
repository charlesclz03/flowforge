## v0.9.41 - The Admin Visibility Update
**Date**: 2026-01-19 | **Codename**: Full Roster

We introduced a comprehensive User List in the Admin panel, giving admins full visibility into the community. Track growth, subscription status, and engagement all in one place.

### New Features
*   **Admin User List**: A powerful new dashboard to view all registered users with real-time stats.
*   **Smart Badges**: Instantly spot PRO users and Superadmins.

---

## v0.9.40.5 - The Storage & Polish Update
**Date**: 2026-01-19 | **Codename**: Cloud Native

We introduced a sleek new Cloud Storage bar to tracking your recording capacity, opened up the Recordings page for everyone to preview, and performed a massive system-wide emoji cleanup for a cleaner professional look.

### New Features
*   **Cloud Storage Bar**: iCloud-style storage visualization on the Recordings page.
*   **Open Access**: Recordings page is now accessible to all users (storage usage locked to Pro).

### Visual Overhaul
*   **Emoji Clean-up**: Removed all emojis from UI and Docs for a cleaner look.

---

## v0.9.40 - The Master Bug Fix Update 
**Date**: 2026-01-19 | **Codename**: Polish & Progression

We addressed the highest priority issues from our Master Bug Report, restoring your XP bars, fixing broken achievements, and finally adding that Random Beat button!

### Fixes & Improvements
*    **Random Beat**: Added a "Random Beat" option to the beat selector.
*    **Profile Stats Restored**: XP Bar/Level indicator now visible on profile.
*    **Achievement Unlocked**: Fixed "Word Smith" achievement logic.
*    **Premium Fix**: Verified locked beats trigger upgrade modal.

---

## v0.9.39 - The Pro Save Fix 
**Date**: 2026-01-17 | **Codename**: Unblocked

We fixed a critical bug where Pro users were blocked from saving their sessions by an incorrect "Get Pro" modal. Your flow is now unblocked!

### Fixes & Improvements
*    **Pro Save Unblocked**: Fixed a bug where the "REC" button would trigger the "Get Pro" modal even for subscribed users. Pro users can now toggle recording and save sessions freely.

## v0.9.38 - The Guest Pass Hotfix ️ (2026-01-17)
**Codename:** Open Mic

We fixed a critical bug preventing guest users from starting a recording session. The "The Booth" is now open to everyone again!

### Fixes & Improvements
-  **Guest Recording Enabled**: Removed an incorrect check that blocked unauthenticated users from hitting record. Rap first, sign up later.
-  **Upgrade Trigger**: Fixed the "Get Pro" modal not appearing when requested.

---

## v0.9.37 - The True Shuffle Update  (2026-01-17)
**Codename:** Fair Game

We fixed the word randomization logic to ensure you actually get new words in every session, and now your stats will finally track "Words Unlocked" correctly.

### Fixes & Improvements
-  **True Randomness**: Fixed a caching issue that caused the same words to appear repeatedly. Every session now pulls a fresh batch.
-  **Stats Sync**: "Words Unlocked" stats now correctly track unique words encountered, fixing the discrepancy with "Total Words Generated".

---

## v0.9.36 - The Feedback Fix  (2026-01-16)
**Codename:** Direct Line

We fixed the "Report Bug" link in the settings menu to correctly redirect to the dedicated feedback page, and cleaned up the Patch Notes UI.

### Fixes & Improvements
-  **Report Bug Redirect**: The "Report Bug" button in Settings now correctly takes you to the Feedback page instead of the Patch Notes.
-  **UI Cleanup**: Removed the redundant "Feedback" form from the bottom of the Patch Notes page.

---

## v0.9.35 - The Flow State Update  (2026-01-16)
**Codename:** Seamless Upload

We smoothed out the "My Tracks" experience. You can now upload beats directly from the difficulty menu and managing your library is easier than ever.

### New Features
-  **Instant Upload**: Added a smart "Upload your first beat" prompt and a permanent "Upload new track" button right in the My Tracks dropdown.
-  **Seamless Flow**: Uploading from the difficulty menu now auto-redirects you to the upload vault.

### Fixes & Improvements
- ️ **Delete Fixed**: Resolved an issue where deleting server-side tracks from the dropdown wasn't working. Clean up your library with confidence!

---

## v0.9.34 - The Social Proof Update  (2026-01-16)
**Codename:** Five Stars

We enabled a seamless rating experience, polished beat card visuals, and finally solved audio looping for infinite flow.

### New Features
-  **Rate Us**: Added a sleek rating modal that appears after your 3rd session. Love the app? Let us know!
- ⭐ **Star Power**: You can now drop a star rating directly in the feedback form.

### Fixes & Improvements
- ️ **Perfect Loops**: Rewrote the audio engine to use Web Audio scheduling. Beats now loop seamlessly with zero gaps.
-  **Clean Cards**: Combined Artist and Producer names on beat cards for a cleaner look.

---

## v0.9.33 - The Green Light Update  (2026-01-16)
**Codename:** Go Time

We made sure your recordings always playback perfectly and gave the Practice Mode a clearer, punchier "START" button so you know exactly when to drop your bars.

### Fixes & Improvements
-  **Playback Rescued**: Fixed a "Failed to Play" bug caused by some beats having spaces in their cloud filenames. Your history is safe!
-  **Clearer Start**: Swapped the ambiguous mic icon for a big, bold, pulsing "START" button. Less guessing, more rapping.

---

## v0.9.32 - The Responsive Polish Update  (2026-01-16)
**Codename:** Liquid Flow

We smoothed out the Admin experience and fine-tuned the mobile layout to feel even more native. Plus, difficulty settings now stick instantly!

### Fixes & Improvements
- ️ **Admin Focus Fix**: Resolved an annoying bug where editing track details would lose focus after every character. Smooth typing is back!
- ️ **Instant Difficulty**: Changing difficulty mid-session now instantly updates the word vibe for the rest of your session.

### Visual Overhaul
-  **Compact Mobile Layout**: Optimized padding and scaling for small iPhones (SE, Mini) to ensure all controls fit on a single screen without scrolling.
-  **Responsive Practice controls**: The REC indicator and main buttons now scale aggressively to respect the viewport on smaller devices.

---

## v0.9.31 - The Quality of Life Update ️ (2026-01-16)
**Codename:** Safe Zone

A massive polish update ensuring content never covers navigation, fixing audio glitches during review, and professionalizing the experience with better legal pages and feedback tools.

### Visual Overhaul
-  **Bottom Nav Safety**: Implemented global padding logic so content is never hidden behind the bottom bar on any device.
-  **Header Harmony**: Constrained header titles to prevent text overlapping with buttons on smaller screens.
-  **Professional Polish**: Refined the look of legal pages and feedback forms with cleaner iconography.

### Fixes & Improvements
-  **Audio Glitch Eradicated**: Fixed stuttering and popping during recording review playback.
-  **Smooth Waveform**: The playback indicator now smoothly glides across the track without jitter.
- ️ **Feedback Center**: Launched a dedicated `/feedback` page for easier bug reporting.

---

## v0.9.30 - The Visual Polish Update  (2026-01-16)
**Codename:** Neon Ring

We gave the Cypher UI a major facelift with a new outer-ring layout and boosted the "Siren" intensity for maximum hype. Plus, a handy Help button in the header!

### Visual Overhaul
-  **Cypher Outer Ring**: The player segments now hug the outer edge of the main control button for a cleaner, futuristic look.
-  **Siren Boost**: The "Police Siren" effect before word switches is now 200% more intense. You can't miss it!
- ℹ️ **Header Help**: Added a quick-access Help button (?) to the global header that takes you straight to the "How it Works" guide.
-  **Glass Record Ring**: The central record button is now a consistent transparent glass ring with a purple border, ensuring the logo always shines through.

---

## v0.9.29 - The Safe Resume & Admin Polish Update  (2026-01-15)
**Codename:** Smooth Operator

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

## v0.9.28 - Cypher Rings Restored  (2026-01-15)
Fixed a critical bug where the session timer ran at 2x speed.
- **Root Cause:** React StrictMode was double-invoking effects, spawning duplicate animation loops.
- **Fix:** Added `animationFrameRef` guard and disabled StrictMode in production.
- **Result:** Timer now counts at exactly 1 second per real second.

###  Code Quality
- Added proper cleanup for all animation loop exit paths.
- All frame IDs now tracked via ref for reliable cancellation.

---

## v0.9.26 - Stability Fixes
**Released:** 2026-01-15
- Removed unstable object references from timer effect dependencies.
- Added fixed height to control buttons row to prevent layout shift.

---

## v0.9.25 - The Mobile & Precision Update 
**Released:** 2026-01-15

###  Mobile First
We have completely refined the mobile experience to prevent any element overlapping.
- **Dynamic Sizing:** The main player ring now caps its height at 45% of the viewport.
- **Split Controls:** Button row separation ensures no accidental clicks.
- **Native Polish:** `100dvh` support means Safari bars no longer hide your buttons.

###  Core Precision
- **Grid Lock Fix:** Changing frequency mid-session now instantly resets the timer, preventing "stuck" words.
- **PWA Intelligence:** Added iOS-specific detection to guide users around the microphone permission issues.

---

## v0.9.20 - The Precision Update 
**Released:** 2026-01-15

###  Grid Lock Timing
We've completely rewritten the engine that decides when to switch words. Instead of a running timer (which could drift), we now mathematically calculate the exact "Bar Number" you are on.
- **Result:** Words change EXACTLY on Bar 1, 5, 9, etc.
- **Fix:** Solved the issue where words would sometimes change every bar due to timing glitches.

### ️ Satellite UI
The Player Controls have been reorganized.
- **New Layout:** Exit and Pause buttons now float at the **Top Corners**, separated from the main player.
- **Benefit:** No more cropped buttons on small screens, and the Main Player is now perfectly centered.

###  Layout Polish
- Fixed an issue where the top of the "How It Works" page could get cut off on some screens.

---

## v0.9.19 - The Polish Update (Scalability & Audio)
**Released:** 2026-01-15

###  Zero-Gap Looping
Fixed the split-second delay when beats looped. The audio engine now uses native browser looping for seamless infinite playback.

###  Smart Silence (TTS Fix)
Fixed a bug where the AI voice would sometimes keep talking after you ended a session. We added a "Hard Stop" protocol to ensure silence when you say stop.

###  Visual Tuning
- **Glass Pills:** Mode and Difficulty indicators are now cleaner and easier to read.
- **Responsive Player:** The main recording button now scales intelligently to fit any screen size without overlapping.

---
(Older notes preserved in archive)
