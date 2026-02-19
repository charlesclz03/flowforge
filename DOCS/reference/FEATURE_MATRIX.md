# Feature Matrix

**Current Version**: `1.0.2`
**Last Updated**: 2026-02-19

## Core Practice

| Feature | Status | Notes | Tier |
| --- | --- | --- | --- |
| Solo Mode | PASS | Stable session loop with configurable prompts | All |
| Cypher Mode | PASS | Local pass-the-phone with player rotation | All |
| Beat Selection | PASS | Public + private beat selection and handoff | All |
| Prompt Engine | PASS | Difficulty + frequency with anti-rhyme guard | All |
| Language Runtime (TTS) | PASS [x] 2026-02-17 | Alias + handoff sync works and fallback voice/lang resolution now prevents silent prompts when matching voice packs are unavailable | All |

## Beats & Calibration

| Feature | Status | Notes | Tier |
| --- | --- | --- | --- |
| Upload Private Beats | PASS | User upload pipeline active | Pro |
| Cue Point Calibration | PASS | Saved offsets honored at runtime/restart | Pro |
| Difficulty Handoff | PASS | `/tracks` arrow preselect resolves private beats | Pro |
| Beat Deletion | PASS | User-managed cleanup supported | Pro |

## Recording & Review

| Feature | Status | Notes | Tier |
| --- | --- | --- | --- |
| Audio Capture Sessions | PASS | Standard recordings supported | Mixed |
| Stats-Only Sessions | PASS | No audio controls exposed when capture disabled | Mixed |
| Processing State | PASS | `PROCESSING` shown while audio URL is not ready | Mixed |
| Review Settings Persistence | PASS | Save Changes appears only when edited | Mixed |
| Shared Playback | PASS | Public links available for shareable sessions | Mixed |

## Platform & Governance

| Feature | Status | Notes |
| --- | --- | --- |
| Patch Notes Sync | PASS | `patch-notes.ts` and master notes aligned |
| Docs Canonical Governance | PASS | Canonical map + CI docs checks enforced |
| MCP Matrix Tracking | PASS | MCP health baseline documented |

## Audit History

| Date | Audit | Status | Outcome |
| --- | --- | --- | --- |
| 2026-02-19 | TTS Language Runtime Forever Fix | PASS | Added zero-voices fallback handling, unified utterance language resolution, and aligned admin test voice diagnostics with runtime logic |
| 2026-02-19 | Word Prompt Random Logic Forever Fix | PASS | Restored anti-repeat priority before recycling used words, preserved source difficulty metadata, and added dedupe on random word fetch |
| 2026-02-19 | TTS Language Runtime Re-Audit | FAIL | Reproduced remaining silent-prompt risk when `speechSynthesis` voices never resolve; fallback contract still depends on active voice state |
| 2026-02-19 | Word Prompt Random Logic Re-Audit | FAIL | Confirmed repeat-wall regression: anti-repeat is relaxed too early in rhyme-heavy pools, with frequent repeats in FR/PT |
| 2026-02-17 | TTS Prompt Output Forever Fix | PASS | Implemented fallback-safe utterance language contract, user-gesture warmup on session start, setup diagnostics, and regression tests for fallback behavior |
| 2026-02-17 | TTS Prompt Output Re-Audit | FAIL | Root cause isolated: forced `utterance.lang` + non-matching fallback `voice` can produce silent prompts on some engines; fix plan added in `brain/TTS_FIX_PLAN_2026-02-17.md` |
| 2026-02-13 | User Beat Calibration + Difficulty Handoff | PASS | Re-audited and validated private-beat handoff + runtime offset behavior |
| 2026-02-10 | Launch Matrix Audit | PASS | Guest/Free/Pro/SUPERADMIN coverage validated |

Legacy audit records are preserved under `DOCS/ARCHIVE/`.
