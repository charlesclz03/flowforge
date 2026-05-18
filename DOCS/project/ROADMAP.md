# Product Roadmap

Purpose:

- define the forward-looking roadmap for the live product

Audience:

- maintainers
- coding agents

Status:

- active

Source of truth scope:

- current and planned roadmap sequencing only

Last updated:

- 2026-05-18

Related docs:

- `docs/README.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/reference/PATCH_NOTES_MASTER.md`

**Current Version**: `1.1.5`
**Last Updated**: 2026-05-18
**Owner**: Product + Engineering

This roadmap is forward-looking only. Historical phase logs were archived under `DOCS/ARCHIVE/`.

## Now (0-2 weeks)

1. Validate the v1.1.5 enterprise UI remediation release in production-like desktop/mobile conditions.
2. Stabilize multilingual practice loop quality (EN/FR/PT prompt quality + TTS fallback UX).
3. Harden recording lifecycle UX (processing state, stats-only clarity, retry visibility).
4. Keep release quality gates strict (`lint`, `tsc`, `build`, env checks, docs checks).

## Next (2-6 weeks)

1. Expand language-aware word dictionaries and per-language anti-rhyme quality.
2. Add structured observability for practice pipeline failures and upload/processing delays.
3. Improve review/studio workflow ergonomics (preset management, clearer save states).

## Research-Backed Next Steps

The following GitHub-backed candidates are the current priority shortlist:

1. Verify the newly guarded `easy-speech`, `wavesurfer.js`, and Uppy/Tus adapters in production-like mobile conditions.
2. `GoogleChromeLabs/bubblewrap` for Android/TWA packaging and validation discipline.
3. `words/cmu-pronouncing-dictionary` for stronger English phonetic anti-rhyme quality.

See `DOCS/reference/GITHUB_REPO_RESEARCH.md` for the full research write-up, search keywords, and secondary candidates.

## AutoResearch Fit

- `Medium` fit for one future subsystem, not for the whole product.
- first good pilot: optimize prompt timing, word suggestion ranking, difficulty calibration, or post-session scoring against stored practice outcomes.
- do not prioritize it ahead of multilingual quality, recording UX, and observability hardening.
- prerequisite: reliable session labels, clear offline metrics, and a tightly bounded experiment surface.

## Later (6+ weeks)

1. AI-assisted coaching and feedback layer (post-session analysis).
2. Deeper gamification evolution (seasonal systems and progression balancing).
3. Production scaling and mobile release optimization expansion.

## Planning Rules

1. `project/PROJECT_STATUS.md` is operational truth for current state.
2. `reference/PATCH_NOTES_MASTER.md` is release truth for completed work.
3. Any completed roadmap item must be reflected in patch notes and project status.
