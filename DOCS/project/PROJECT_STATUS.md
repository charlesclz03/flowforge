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

- 2026-05-17

Related docs:

- `docs/README.md`
- `docs/project/ROADMAP.md`
- `docs/reference/PATCH_NOTES_MASTER.md`

**Current Version**: `1.1.4`
**Phase**: Beta Polish
**Last Updated**: 2026-05-17

## Quick Status

- Latest release: `v1.1.4` (Enterprise UX Recovery).
- Deployment branch state should remain green on lint/types/build/env/docs checks.

## Recent Completed Work

- Cleared the remaining release debt: `next lint` is clean, `npm audit` is at `0`, and docs/env gates are part of the deploy contract.
- Replaced the last browser-native `confirm()` and `alert()` flows with in-app dialogs and toast feedback.
- Added conversion instrumentation for `/howitworks`, `/download`, checkout CTA launches, and subscription activation.
- Added the audit funnel polish set: `/pricing`, `/login`, `/signup`, tier-aware header CTA, truthful platform install copy, premium upgrade paths, and mobile accessibility/layout cleanup.
- Closed the remaining post-v1.0.9 visual audit follow-up with shared icon styling, START halo balancing, and measured landing-card readability evidence.
- Promoted the patch-note audit cleanup to `v1.1.1`, including release-entry drift checks and a guarded prompt for the 18 remaining `Not done` audit findings.
- Restored the `/pricing` header back control and right-side app actions before the v1.1.1 deploy handoff.
- Shipped the v1.1.2 SSS Enterprise UI polish pass: shared UI primitives, token cleanup, shell variables, Skill Check setup console, practice stage containment, public proof panels, Beat Vault toolbar, recordings refresh framing, and review studio metadata.
- Shipped the v1.1.3 adapter reliability pass: Easy Speech-aware TTS boundary, review-only wavesurfer.js fallback wrapper, and signed PUT-first private beat upload adapter with opt-in Uppy/Tus support.
- Shipped the v1.1.4 enterprise UX recovery wave: dated UX audit artifacts, safe review deep-link handling, updated E2E expectations, feedback accessibility fixes, mobile control target hardening, lifecycle status messaging, and clearer install/conversion copy.
- Added Playwright UI-polish smoke coverage across desktop/mobile public funnel, Beat Vault, and Skill Check setup controls.
- Unified session-save progress handling across recordings and metadata-only completions.
- Replaced live practice beat looping with Web Audio gapless scheduling and preserved calibrated cue offsets through track-end loops.
- Restored browser zoom/text selection defaults and kept public onboarding routes focused.
- Re-enabled React Strict Mode and fixed the `/api/beats` request-driven build contract.

## Immediate Focus

1. Production-smoke v1.1.4 review deep links, Beat Vault, feedback, setup, practice, recordings, settings, and install guidance on desktop/mobile.
2. Monitor multilingual prompt quality and TTS fallback behavior.
3. Continue recording pipeline reliability hardening.
4. Preserve release discipline and docs governance consistency.

## Recent Version History

| Version | Codename                    | Date       | Summary                                                                                                                                                                                                               |
| ------- | --------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.1.4  | Enterprise UX Recovery      | 2026-05-17 | Added dated enterprise UX audit artifacts and fixed the first remediation wave across review deep links, Playwright expectations, accessibility, mobile touch targets, lifecycle states, and install/conversion copy |
| v1.1.3  | Adapter Reliability         | 2026-05-17 | Added guarded Easy Speech, wavesurfer.js, and Uppy/Tus adapter boundaries for TTS reliability, review waveform fallback, and private beat upload progress while preserving existing fallbacks                         |
| v1.1.2  | Enterprise Polish           | 2026-05-17 | Added enterprise UI primitives, centralized tokens/shell variables, upgraded Skill Check, tightened Practice stage containment, and polished funnel/workflow surfaces with new UI smoke coverage                      |
| v1.1.1  | Patch Note Governance       | 2026-05-17 | Bumped the release baseline, kept patch-note sources synchronized, clarified historical audit caveats, and restored the `/pricing` header controls for the deploy handoff                                             |
| v1.1.0  | Audit Visual Closure        | 2026-05-15 | Standardized high-traffic icon treatments, balanced the Practice START halo, and re-verified landing feature-card readability on mobile                                                                               |
| v1.0.9  | Funnel Polish               | 2026-05-15 | Added pricing/auth entry routes, improved premium upgrade paths, corrected install messaging, restored readable/accessibility states, and added a tier-aware `Get Pro` header CTA                                     |
| v1.0.8  | Unique Flow                 | 2026-05-15 | Added strict no-repeat session queues, required Google profile completion, expanded FR/PT prompt packs, forced iPhone/iPad practice to text-only prompts, and moved live practice beats to calibrated gapless looping |
| v1.0.7  | Residual Cleanup            | 2026-03-06 | Cleared remaining lint debt, replaced final native dialogs, added conversion instrumentation, and aligned SEO metadata                                                                                                |
| v1.0.6  | Integrity & Funnel Fix      | 2026-03-06 | Session-save unification, sanitized errors, accessibility defaults restored, and release audit fully cleared                                                                                                          |
| v1.0.5  | Whole App Audit Forever Fix | 2026-03-05 | Security overrides, practice refactor, and performance hardening                                                                                                                                                      |
| v1.0.2  | Practice Full Height Fix    | 2026-02-12 | Practice layout seam + calibration/runtime + security/perf/docs hardening                                                                                                                                             |
| v1.0.1  | Practice Overlay Fix        | 2026-02-12 | Opaque dropdown overlay + premium badge visibility + stage fill                                                                                                                                                       |
| v1.0.0  | 1.0                         | 2026-02-11 | Data control/privacy clarity and release baseline                                                                                                                                                                     |

For full release history, use `DOCS/reference/PATCH_NOTES_MASTER.md`.
