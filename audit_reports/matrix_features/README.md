# Matrix Feature Audits
**Date**: 2026-02-19

This folder contains one `audit.md` per feature listed in `DOCS/reference/FEATURE_MATRIX.md`.

## Files
- `solo_mode/audit.md`
- `cypher_mode/audit.md`
- `beat_selection/audit.md`
- `prompt_engine/audit.md`
- `language_runtime_tts/audit.md`
- `upload_private_beats/audit.md`
- `cue_point_calibration/audit.md`
- `difficulty_handoff/audit.md`
- `beat_deletion/audit.md`
- `audio_capture_sessions/audit.md`
- `stats_only_sessions/audit.md`
- `processing_state/audit.md`
- `review_settings_persistence/audit.md`
- `shared_playback/audit.md`
- `patch_notes_sync/audit.md`
- `docs_canonical_governance/audit.md`
- `mcp_matrix_tracking/audit.md`

## Cross-Cutting Issues
1. Prettier/line-ending warning volume in recording/review/practice/API files.
2. Build-time Prisma datasource noise (`P6001`) in static generation fallback path.
3. `npm audit` high/moderate vulnerability backlog requiring breaking dependency changes.
4. `scripts/audit-feature.ts` emits `MODULE_TYPELESS_PACKAGE_JSON` warning.
