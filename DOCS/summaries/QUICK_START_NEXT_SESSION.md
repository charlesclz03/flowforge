# Quick Start - Next Session

**Current Version**: `1.0.2`
**Last Updated**: 2026-02-19

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
& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit
& "C:/Program Files/nodejs/npm.cmd" run build
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

1. Stability and polish of practice/recording pipeline.
2. Language-aware prompt and TTS consistency.
3. Release discipline with enforced docs governance.
