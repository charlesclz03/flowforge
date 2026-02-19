# Task Log

## 2026-02-17 - Forever Fix: TTS fallback reliability
- [x] Audit and root-cause the TTS regression.
- [x] Implement fallback-safe utterance language contract in `useTTS`.
- [x] Add user-gesture TTS warmup during practice start.
- [x] Surface fallback/unsupported voice status in setup UI.
- [x] Add regression tests for fallback language behavior.
- [x] Run verification gates (`lint`, `tsc --noEmit`, `build`).

## 2026-02-19 - Forever Fix: TTS language runtime + prompt repeat walls
- [x] Re-audit TTS language runtime and word prompt randomization regressions.
- [x] Harden `useTTS` zero-voices fallback path and unify resolver usage in admin test voice flow.
- [x] Preserve word metadata (`difficultyLevel`, `syllableCount`) from server to practice engine.
- [x] Reorder generator pool priority to avoid early repeats before pool exhaustion.
- [x] Add normalized de-duplication in DB random word fetch path.
- [x] Add regression tests for utterance fallback and constrained anti-repeat behavior.
- [x] Run full verification gates (`lint`, `tsc --noEmit`, `build`) after implementation.

## 2026-02-19 - Forever Fix: SUPERADMIN public beat management scope
- [x] Re-audit `/admin/beats` public-track management and identify scope leak.
- [x] Enforce public-library mutation boundary (`uploaderId: null`) for update/delete actions.
- [x] Add strict field-whitelist validation for admin beat updates (reject unknown fields).
- [x] Harden reorder path to reject out-of-scope beat ids.
- [x] Add regression tests for admin action auth/scope/validation/reorder.
- [x] Run verification gates (`lint`, `tsc --noEmit`, scoped tests, `build`).
