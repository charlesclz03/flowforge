# Project Status

**Current Version**: `1.0.2`
**Phase**: Beta Polish
**Last Updated**: 2026-02-17

## Quick Status

- Latest release: `v1.0.2` (Practice Full Height Fix + calibration/runtime integrity updates).
- Deployment branch state should remain green on lint/types/build/env/docs checks.

## Recent Completed Work

- Practice bottom-nav seam/background continuity fixes.
- Private beat calibration runtime fix (practice starts at saved cue offset).
- Difficulty handoff fix for private beats (`/tracks` -> `/difficultyselection?beatId=`).
- Language-aware phonetic anti-rhyme runtime for EN/FR/PT.
- Recording processing label improvements (`PROCESSING` vs misleading stats-only label).
- Review settings save-state/persistence improvements.
- Advanced latency calibration profile workflow and `/calibration` canonical redirect.

## Immediate Focus

1. Monitor multilingual prompt quality and TTS fallback behavior.
2. Continue recording pipeline reliability hardening.
3. Preserve release discipline and docs governance consistency.

## Recent Version History

| Version | Codename | Date | Summary |
| --- | --- | --- | --- |
| v1.0.2 | Practice Full Height Fix | 2026-02-12 | Practice layout seam + calibration/runtime + security/perf/docs hardening |
| v1.0.1 | Practice Overlay Fix | 2026-02-12 | Opaque dropdown overlay + premium badge visibility + stage fill |
| v1.0.0 | 1.0 | 2026-02-11 | Data control/privacy clarity and release baseline |

For full release history, use `DOCS/reference/PATCH_NOTES_MASTER.md`.
