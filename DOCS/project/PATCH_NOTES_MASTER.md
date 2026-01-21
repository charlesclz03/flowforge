# PATCH NOTES MASTER FILE

## v0.9.53 - Time Lord (2026-01-21)
**"Duration Hotfix ⏱️"**

Fixed a bug where the total time would show as "INFINITY:NAN" while the audio was loading. We now properly use the saved session duration for instant display.

### Fixes & Improvements
- **Instant Duration**: Usage of saved session duration ensures the timer and progress bar are correct immediately on load.
- **Safety Net**: Added guards to prevent "NaN" or "Infinity" from ever appearing in the time display.

---

## v0.9.52 - Pixel Perfect (2026-01-21)
**"The Visual Perfection Update 🎨"**
