# Testing Plan V3

**Target Release**: `1.1.3`
**Last Updated**: 2026-05-17

This is the canonical testing strategy for current releases.

## Test Environments

1. Local validation for implementation checks.
2. Production smoke verification before/after release.

## Required Pre-Release Gates

```powershell
& "C:/Program Files/nodejs/npm.cmd" run lint
& "C:/Program Files/nodejs/npm.cmd" run build
& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit
& "C:/Program Files/nodejs/npm.cmd" run docs:check
```

## Core Functional Smoke Matrix

| Area       | Required Checks                                                                  |
| ---------- | -------------------------------------------------------------------------------- |
| Auth       | Guest flow, user login, protected route behavior                                 |
| Practice   | Start/pause/resume/end, prompt cadence, difficulty/frequency changes             |
| Beats      | Public beat selection, private beat handoff from `/tracks`, cue offset playback  |
| Recordings | Processing label behavior, stats-only behavior, playback/download/share controls |
| Review     | Load session, adjust settings, save changes visibility/persistence               |
| Settings   | Latency profiles, save/discard/reset paths                                       |
| Admin      | SUPERADMIN-only privileged routes and actions                                    |

## Regression Priorities

1. Private beat calibration offset applied at runtime and replay.
2. Difficultyselection handoff for user-uploaded beats.
3. Language runtime synchronization (EN/FR/PT) for prompts and TTS handoff.
4. Stats-only sessions must not expose audio action controls.

## Release Acceptance Criteria

1. No failing lint/type/build/docs checks.
2. Core functional smoke matrix passes.
3. No release-blocking errors in server logs.
4. Release notes/docs are synchronized.

## Legacy Test Plans

Older testing plans/reports are preserved in `DOCS/ARCHIVE/testing/`.
