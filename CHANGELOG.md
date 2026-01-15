# Changelog

## v0.9.20 - The Precision Update (UI & Timing)
- **Feature (UI)**: "Satellite Layout" for Practice Controls. Moved Exit/Pause buttons to absolute top corners to prevent cropping and width overflow on mobile.
- **Fix (Core)**: Implemented "Grid Lock" timing engine. Word switching is now calculated via Bar Index (`floor(bars / frequency)`) rather than time accumulation, solving the "every bar" drift bug.
- **Fix (Layout)**: Removed dangerous `justify-center` from `OnboardingLayout`, fixing top-content clipping on scrollable pages (How It Works, Profile, etc.).

## v0.9.19 - The Polish Update (Scalability & Audio)
- **Fix (Audio)**: Solved 0.5s audio loop delay by removing manual seek hacks and relying on native browser looping.
- **Fix (TTS)**: Implemented centralized `stopTTS` protocol and ref-based guards to prevent "Ghost Speaking" after session end.
- **UI**: Added "Glass Pills" for Mode/Difficulty display and improved responsive constraints for the main player button.
- **Fix**: Resolved compilation errors with `sessionTime` variable.

## v0.9.18 - UI Scale & Mobile Optimization
- **UI**: Implemented `min(70vmin, 320px)` scaling for the main player to prevent overflow on small screens.
- **UI**: Standardized "Glass Panel" aesthetic across Settings and Info modals.
- **Fix**: Resolved text overlapping in Patch Notes timeline.

(Previous versions omitted for brevity)
