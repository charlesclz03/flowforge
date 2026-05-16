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

- 2026-05-16

Related docs:

- `docs/README.md`
- `docs/project/PROJECT_STATUS.md`
- `docs/project/ROADMAP.md`

**Current Version**: `1.1.1`
**Last Updated**: 2026-05-16

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

1. Monitor multilingual prompt quality and TTS fallback behavior.
2. Continue recording pipeline reliability hardening.
3. Preserve release discipline and docs governance consistency.
4. Use `DOCS/summaries/NEXT_PROMPT_PATCH_NOTE_NOT_DONE_AUDIT.md` when planning the 18 patch-note audit `Not done` findings.

## GitHub Research Handoff

- Full report: `DOCS/reference/GITHUB_REPO_RESEARCH.md`
- Top 5 priority repos for the next implementation spikes:
  1. `leaonline/easy-speech`
  2. `katspaugh/wavesurfer.js`
  3. `GoogleChromeLabs/bubblewrap`
  4. `transloadit/uppy`
  5. `words/cmu-pronouncing-dictionary`
