# Project Status

Purpose:

- state the current release truth and operational focus

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- current product status and near-term release focus

Last updated:

- 2026-05-15

Related docs:

- `docs/README.md`
- `docs/project/ROADMAP.md`
- `docs/reference/PATCH_NOTES_MASTER.md`

**Current Version**: `1.0.9`
**Phase**: Beta Polish
**Last Updated**: 2026-05-15

## Quick Status

- Latest release: `v1.0.9` (Funnel Polish).
- Deployment branch state should remain green on lint/types/build/env/docs checks.

## Recent Completed Work

- Cleared the remaining release debt: `next lint` is clean, `npm audit` is at `0`, and docs/env gates are part of the deploy contract.
- Replaced the last browser-native `confirm()` and `alert()` flows with in-app dialogs and toast feedback.
- Added conversion instrumentation for `/howitworks`, `/download`, checkout CTA launches, and subscription activation.
- Added the audit funnel polish set: `/pricing`, `/login`, `/signup`, tier-aware header CTA, truthful platform install copy, premium upgrade paths, and mobile accessibility/layout cleanup.
- Unified session-save progress handling across recordings and metadata-only completions.
- Replaced live practice beat looping with Web Audio gapless scheduling and preserved calibrated cue offsets through track-end loops.
- Restored browser zoom/text selection defaults and kept public onboarding routes focused.
- Re-enabled React Strict Mode and fixed the `/api/beats` request-driven build contract.

## Immediate Focus

1. Monitor multilingual prompt quality and TTS fallback behavior.
2. Continue recording pipeline reliability hardening.
3. Preserve release discipline and docs governance consistency.
4. Use `DOCS/reference/GITHUB_REPO_RESEARCH.md` to drive the next TTS, waveform, Android/TWA, upload, and phonetic-quality spikes.

## Recent Version History

| Version | Codename                    | Date       | Summary                                                                                                                                                                                                               |
| ------- | --------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.9  | Funnel Polish               | 2026-05-15 | Added pricing/auth entry routes, improved premium upgrade paths, corrected install messaging, restored readable/accessibility states, and added a tier-aware `Get Pro` header CTA                                     |
| v1.0.8  | Unique Flow                 | 2026-05-15 | Added strict no-repeat session queues, required Google profile completion, expanded FR/PT prompt packs, forced iPhone/iPad practice to text-only prompts, and moved live practice beats to calibrated gapless looping |
| v1.0.7  | Residual Cleanup            | 2026-03-06 | Cleared remaining lint debt, replaced final native dialogs, added conversion instrumentation, and aligned SEO metadata                                                                                                |
| v1.0.6  | Integrity & Funnel Fix      | 2026-03-06 | Session-save unification, sanitized errors, accessibility defaults restored, and release audit fully cleared                                                                                                          |
| v1.0.5  | Whole App Audit Forever Fix | 2026-03-05 | Security overrides, practice refactor, and performance hardening                                                                                                                                                      |
| v1.0.2  | Practice Full Height Fix    | 2026-02-12 | Practice layout seam + calibration/runtime + security/perf/docs hardening                                                                                                                                             |
| v1.0.1  | Practice Overlay Fix        | 2026-02-12 | Opaque dropdown overlay + premium badge visibility + stage fill                                                                                                                                                       |
| v1.0.0  | 1.0                         | 2026-02-11 | Data control/privacy clarity and release baseline                                                                                                                                                                     |

For full release history, use `DOCS/reference/PATCH_NOTES_MASTER.md`.
