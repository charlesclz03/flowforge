# Patch Notes Master List

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
