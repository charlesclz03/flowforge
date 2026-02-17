# Task Log

## 2026-02-17 - Forever Fix: TTS fallback reliability
- [x] Audit and root-cause the TTS regression.
- [x] Implement fallback-safe utterance language contract in `useTTS`.
- [x] Add user-gesture TTS warmup during practice start.
- [x] Surface fallback/unsupported voice status in setup UI.
- [x] Add regression tests for fallback language behavior.
- [x] Run verification gates (`lint`, `tsc --noEmit`, `build`).
