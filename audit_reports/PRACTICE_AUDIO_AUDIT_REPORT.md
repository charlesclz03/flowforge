# Practice Audio - Forensic Audit Report
**Date:** 2026-02-01
**Scope:** `app/practice/**/*`, `hooks/player/**/*`, `lib/audio/**/*`

## 1. Executive Summary
- **Total Commits (Recent)**: ~20 significant commits in last sprint.
- **Hotfix Ratio**: High. 8 out of last 20 commits are "fix" or "restore".
- **Verdict**: 🔴 **FAIL**. The feature suffers from architectural fragmentation and circular refactoring.

## 2. Forensic Analysis

### A. The "Three-Body" Problem (Fragmentation)
Use of three separate, uncoordinated audio systems leads to race conditions and "silent failures" (like the user reported):
1.  **Timing**: `useAudioSync` uses `AudioContext` (Web Audio API).
2.  **Playback**: `useBeatPlayer` -> `AudioPlayer` uses `new Audio()` (HTML5 Element).
3.  **Voice**: `useTTS` uses `window.speechSynthesis` (Speech API).

**Impact**:
-   `AudioContext` might be `running`, but `AudioElement` might be blocked or waiting for data.
-   `useAudioSync` drives the visualizer/timer, so the APP *thinks* it is playing (Timer moves, events fire), but the valid `AudioElement` is silent or not started.

### B. "Circular Refactoring" Suspects
The git log reveals a pattern of fixing the same issues repeatedly:
-   `v0.9.93 - Infinity Loop`
-   `v0.9.92 - Sync Guard`
-   `v0.9.91 - The Master Clock`
-   `v0.9.84 - restore TTS`

We are caught in a loop of patching the *symptoms* (timing drift, infinite loops) rather than the *root cause* (split audio sources).

### C. The "Silent Track" Bug
**Root Cause**: `beatPlayer.play()` is called in `completeCountdown` (a callback), which might lose the "User Interaction" blessing required by some browsers, or simply fails to load the beat in time. Since `isLoading` is not blocking the *start* of the timer (driven by `AudioContext`), the visualizer starts without the music.

## 3. Top Risk Files
1.  `hooks/player/usePracticeEngine.ts`: **Critical**. 450+ lines. Too many responsibilities (State + Audio + Recording + TTS).
2.  `lib/audio/player.ts`: **High**. Isolated from the app's main AudioContext.
3.  `hooks/useBeatPlayer.ts`: **Medium**. Wraps the player but masks state.

## 4. Recommendations ("The Forever Fix")

We must **UNIFY** the audio pipeline.

1.  **Single Source of Truth**: The `AudioContext` in `useAudioSync` must own the output.
2.  **Bridge**: Connect `AudioPlayer`'s `<audio>` element to the `AudioContext` using `createMediaElementSource`. This ensures:
    -   If Context works, Track works.
    -   Visualizers use real audio data, not simulated timing.
3.  **Atomic Start**: All systems (Context, Element, TTS) must be "primed" in the same User Interaction event handler.

## 5. Hall of Fame (Version History)
| Hash | Date | Message | Status |
|------|------|---------|--------|
| `39a39a3` | 2026-02-01 | v0.9.94 - Studio Fix | 🩹 Patch |
| `0d4de10` | 2026-01-31 | v0.9.88 - Practice Perfected | ⭐ Feature |
| `5773e2b` | 2026-01-30 | fix(audio): restore TTS | 🩹 Patch |
