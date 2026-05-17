# Quick Start - Next Session

Purpose:

- tell the next session how to bootstrap the repo and where current truth lives

Audience:

- coding agents
- maintainers

Status:

- active

Source of truth scope:

- immediate next-session bootstrap

Last updated:

- 2026-05-17

Related docs:

- `docs/README.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/ROADMAP.md`

**Current Version**: `1.1.4`
**Last Updated**: 2026-05-17

## Bootstrap (Windows-safe)

```powershell
cd "c:\Projects\FlowForge - Freestyle"
git pull --rebase
& "C:/Program Files/nodejs/npm.cmd" install
& "C:/Program Files/nodejs/npx.cmd" prisma generate
& "C:/Program Files/nodejs/npm.cmd" run dev
```

Open: `http://localhost:3000`

## Mandatory Pre-Release Checks

```powershell
& "C:/Program Files/nodejs/npm.cmd" run lint
& "C:/Program Files/nodejs/npm.cmd" run build
& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit
& "C:/Program Files/nodejs/npm.cmd" run check:release-env:local
& "C:/Program Files/nodejs/npm.cmd" run check:release-env
& "C:/Program Files/nodejs/npm.cmd" run check:release-env:vercel
& "C:/Program Files/nodejs/npm.cmd" run docs:check
```

## Canonical Docs to Read First

- `DOCS/project/PROJECT_STATUS.md`
- `DOCS/project/ROADMAP.md`
- `DOCS/reference/PATCH_NOTES_MASTER.md`
- `DOCS/testing/TESTING_PLAN_V3.md`
- `DOCS/guides/DEPLOYMENT.md`

## Current Focus

1. Production-smoke v1.1.4 UX recovery surfaces: review deep links, Beat Vault, feedback, setup, practice, recordings, settings, and install guidance.
2. Verify the TTS, review waveform, and private beat upload adapters on real mobile browsers.
3. Monitor multilingual prompt quality and TTS fallback behavior.
4. Continue recording pipeline reliability hardening.

## GitHub Research Handoff

- Full report: `DOCS/reference/GITHUB_REPO_RESEARCH.md`
- Top remaining priority repos for the next implementation spikes:
  1. `GoogleChromeLabs/bubblewrap`
  2. `words/cmu-pronouncing-dictionary`
  3. Follow-up production validation for `leaonline/easy-speech`, `katspaugh/wavesurfer.js`, and `transloadit/uppy`
