# Deployment Guide

**Current Version**: `1.0.2`
**Last Updated**: 2026-02-13

This guide is the canonical deployment procedure.

## Pre-Deploy Contract

Run all commands before pushing a release commit:

```powershell
& "C:/Program Files/nodejs/npm.cmd" run lint
& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit
& "C:/Program Files/nodejs/npm.cmd" run build
& "C:/Program Files/nodejs/npm.cmd" run check:release-env:local
& "C:/Program Files/nodejs/npm.cmd" run check:release-env
& "C:/Program Files/nodejs/npm.cmd" run check:release-env:vercel
& "C:/Program Files/nodejs/npm.cmd" run docs:check
& "C:/Program Files/nodejs/npm.cmd" audit
```

## Database Safety

If `prisma/schema.prisma` changed:
1. Apply migration before deployment.
2. Confirm migration status is up to date.

```powershell
& "C:/Program Files/nodejs/npx.cmd" prisma migrate status --schema prisma/schema.prisma
```

## Required Asset Checks

- `public/favicon.ico`
- `public/icon-192x192.png`
- `public/icon-512x512.png`
- `public/.well-known/assetlinks.json`

## Release Documentation Sync

Before pushing release:
1. `lib/data/patch-notes.ts`
2. `DOCS/reference/PATCH_NOTES_MASTER.md`
3. `DOCS/project/PROJECT_STATUS.md`
4. `components/organisms/settings/SettingsList.tsx`

## Push Sequence

```powershell
git add .
git commit -m "chore(release): vX.X.X - <Codename>"
git push origin main
```

## Post-Push Validation

1. Confirm production deployment is healthy.
2. Smoke-check core routes: `/difficultyselection`, `/practice`, `/recordings`, `/settings/latency`.
3. Confirm no release blockers in logs.
