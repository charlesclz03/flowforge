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

## 2026-03-24 - Forever Fix: Prompt engine session uniqueness + profile completion
- [x] Re-audit prompt generation regressions and confirm why repeated words still surfaced in 10-minute sessions.
- [x] Replace recycle-on-exhaustion prompt generation with a prebuilt no-repeat session queue.
- [x] Expand French and Portuguese fallback/seed pools, then backfill the database so same-language uniqueness is feasible.
- [x] Add exclusion-aware word loading, iPhone/iPad text-only spoken-prompt fallback, and required post-Google profile completion.
- [x] Add targeted Vitest coverage for queues, guarded auth/profile helpers, username/profile APIs, and iPad-class device detection.
- [x] Run final verification gates (`lint`, `tsc --noEmit`, scoped tests, `build`, `docs:check`) after docs and audit artifacts are updated.

## 2026-03-24 - GitHub research and deployment handoff
- [x] Research GitHub repositories relevant to FlowForge's current beta-polish priorities.
- [x] Document the findings in `DOCS/reference/GITHUB_REPO_RESEARCH.md`.
- [x] Add the top-5 shortlist to the roadmap and next-session handoff docs.
- [x] Run deployment verification gates for the current `v1.0.8` working tree.
- [ ] Deploy/push the release state after verification and any required migration steps.
