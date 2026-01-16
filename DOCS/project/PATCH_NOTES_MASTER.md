## v0.9.30 - The Visual Polish Update 💅 (2026-01-16)
**Codename:** Neon Ring

We gave the Cypher UI a major facelift with a new outer-ring layout and boosted the "Siren" intensity for maximum hype. Plus, a handy Help button in the header!

### Visual Overhaul
- 💍 **Cypher Outer Ring**: The player segments now hug the outer edge of the main control button for a cleaner, futuristic look.
- 🚨 **Siren Boost**: The "Police Siren" effect before word switches is now 200% more intense. You can't miss it!
- ℹ️ **Header Help**: Added a quick-access Help button (?) to the global header that takes you straight to the "How it Works" guide.
- 🟣 **Glass Record Ring**: The central record button is now a consistent transparent glass ring with a purple border, ensuring the logo always shines through.

---

## v0.9.29 - The Safe Resume & Admin Polish Update 💎 (2026-01-15)
**Codename:** Smooth Operator

We’ve ironed out the playback wrinkles in Practice Mode (resuming works perfectly now!) and gave the Admin Beat Upload experience a serious upgrade with better layouts and stricter data controls.

### Fixes & Improvements
- ⏯️ **Perfect Resume**: Fixed a bug where resuming a paused session wouldn't restart the beat. Now it picks up exactly where you left off.
- 🧼 **Safe Pausing**: Switching browser tabs now safely pauses your session instead of stopping it completely.
- 🎹 **Spacebar Safety**: Pressing Spacebar now gently pauses the session (with confirmation) instead of abruptly ending it.

### New Features
- 🎛️ **Admin Upload 2.0**: Completely redesigned the beat upload card. Added a sleek "Free/Premium" toggle switch and optimized the layout.
- 🏷️ **Smart Genre Filter**: The Beat Vault filter now dynamically updates to show only relevant genres for the tracks you are viewing.
- 🔒 **Data Integrity**: Producer Name and Genre are now mandatory fields for new uploads.

---

## v0.9.28 - Cypher Rings Restored 💍 (2026-01-15)
Fixed a critical bug where the session timer ran at 2x speed.
- **Root Cause:** React StrictMode was double-invoking effects, spawning duplicate animation loops.
- **Fix:** Added `animationFrameRef` guard and disabled StrictMode in production.
- **Result:** Timer now counts at exactly 1 second per real second.

### 🧹 Code Quality
- Added proper cleanup for all animation loop exit paths.
- All frame IDs now tracked via ref for reliable cancellation.

---

## v0.9.26 - Stability Fixes
**Released:** 2026-01-15
- Removed unstable object references from timer effect dependencies.
- Added fixed height to control buttons row to prevent layout shift.

---

## v0.9.25 - The Mobile & Precision Update 📱
**Released:** 2026-01-15

### 📲 Mobile First
We have completely refined the mobile experience to prevent any element overlapping.
- **Dynamic Sizing:** The main player ring now caps its height at 45% of the viewport.
- **Split Controls:** Button row separation ensures no accidental clicks.
- **Native Polish:** `100dvh` support means Safari bars no longer hide your buttons.

### 🔒 Core Precision
- **Grid Lock Fix:** Changing frequency mid-session now instantly resets the timer, preventing "stuck" words.
- **PWA Intelligence:** Added iOS-specific detection to guide users around the microphone permission issues.

---

## v0.9.20 - The Precision Update 🎯
**Released:** 2026-01-15

### 🔒 Grid Lock Timing
We've completely rewritten the engine that decides when to switch words. Instead of a running timer (which could drift), we now mathematically calculate the exact "Bar Number" you are on.
- **Result:** Words change EXACTLY on Bar 1, 5, 9, etc.
- **Fix:** Solved the issue where words would sometimes change every bar due to timing glitches.

### 🛰️ Satellite UI
The Player Controls have been reorganized.
- **New Layout:** Exit and Pause buttons now float at the **Top Corners**, separated from the main player.
- **Benefit:** No more cropped buttons on small screens, and the Main Player is now perfectly centered.

### 📱 Layout Polish
- Fixed an issue where the top of the "How It Works" page could get cut off on some screens.

---

## v0.9.19 - The Polish Update (Scalability & Audio)
**Released:** 2026-01-15

### 🎧 Zero-Gap Looping
Fixed the split-second delay when beats looped. The audio engine now uses native browser looping for seamless infinite playback.

### 🤐 Smart Silence (TTS Fix)
Fixed a bug where the AI voice would sometimes keep talking after you ended a session. We added a "Hard Stop" protocol to ensure silence when you say stop.

### 🎨 Visual Tuning
- **Glass Pills:** Mode and Difficulty indicators are now cleaner and easier to read.
- **Responsive Player:** The main recording button now scales intelligently to fit any screen size without overlapping.

---
(Older notes preserved in archive)
