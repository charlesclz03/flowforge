# Changelog

## v0.9.30 - The Visual Polish Update
- **UI (Cypher)**: Relocated player segments to the outer edge of the control ring.
- **UI (Header)**: Added a "Help" button linked to /howitworks.
- **FX**: Boosted "Police Siren" intensity by 200%.
- **UI (Polish)**: Central record button is now a consistent glass ring.

## v0.9.29 - The Safe Resume & Admin Polish Update
- **Fix (Regression)**: Restored missing SVG turn rings in Cypher Mode (previously accidentally removed during cleanup).

## v0.9.27 - The True Timer Fix
- **Fix (Critical)**: Timer was running at 2x speed due to React StrictMode double-invoking effects. Fixed by adding `animationFrameRef` guard and disabling StrictMode.
- **Fix (Core)**: All animation loop exit paths now properly cleanup frame references.

## v0.9.26 - Stability Fixes
- **Fix (Core)**: Removed unstable `beatPlayer` object reference from effect dependencies.
- **Fix (UI)**: Added `min-h-14` to control buttons row to prevent layout shift when buttons appear.

## v0.9.25 - The Mobile & Precision Update
- **Fix (Mobile)**: Practice ring now caps at 45% viewport height.
- **Fix (UI)**: Split Exit/Pause buttons into dedicated row.
- **Fix (Core)**: Grid Lock frequency change no longer freezes timer.

## v0.9.20 - The Precision Update (UI & Timing)

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
