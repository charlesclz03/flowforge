---
description: Prepare the application for deployment to Vercel, ensuring all documentation and code checks pass.
---

1.  **Sync Check**
    - **Git History**: Ensure local is up to date with remote. `git fetch` and check status.

2.  **Database Check (CRITICAL)**
    - **Schema Changed?**: Did you modify `prisma/schema.prisma` since the last deploy?
    - **Action**: If YES, you **MUST** run the `database_migration` workflow or `npx prisma db push` (on production DB) BEFORE deploying.
    - **Why?**: Authentication and data fetching will CRASH if the database is missing columns that the new code expects.
    - **Verify**: Check `prisma studio` or run a quick query to ensure new columns exist.

3.  **The "Clean Slate" Protocol (Fix Current Problems)**
    - **Linting**: Run `npm run lint`.
    - **Types**: Run `tsc --noEmit`.
    - **Build**: Run `npm run build`.
    - **Env Contract**:
      - Run `npm run check:release-env:local` (local contract).
      - Run `npm run check:release-env` (strict production contract).
      - Run `npm run check:release-env:vercel` (remote Vercel variable presence).
    - **Docs Contract**:
      - Run `npm run docs:check` (links + canonical drift + stub integrity).
    - **ACTION**: You MUST fix ALL errors reported by these commands before proceeding. Do not push code that fails the build.

4.  **Asset Verification**
    - Verify `public/favicon.ico`, `public/icon-192x192.png`, `public/icon-512x512.png`.
    - **TWA Check**: Verify `public/.well-known/assetlinks.json` exists and is valid for Android App Links.

5.  **Security Audit**
    - Run `npm audit` to check for known vulnerabilities.
    - **ACTION**: If critical or high severity vulnerabilities are found, run `npm audit fix` or manually update affected packages before proceeding.

6.  **Documentation Synchronization**
    - Read `package.json` version.
    - Ensure canonical docs remain aligned with current release:
      - `DOCS/DOCUMENTATION_INDEX.md`
      - `DOCS/project/PROJECT_STATUS.md`
      - `DOCS/project/ROADMAP.md`
      - `DOCS/summaries/QUICK_START_NEXT_SESSION.md`
      - `DOCS/reference/FEATURE_MATRIX.md`
      - `DOCS/reference/MCP_MATRIX.md`
      - `DOCS/testing/TESTING_PLAN_V3.md`
      - `DOCS/guides/DEVELOPER_SETUP.md`
      - `DOCS/guides/DEPLOYMENT.md`
      - `DOCS/guides/ANDROID_DEPLOYMENT.md`
    - **Update**: `lib/data/patch-notes.ts` (Ensure entry exists).
    - **Update**: `DOCS/reference/PATCH_NOTES_MASTER.md`.
    - **Update**: `DOCS/project/PROJECT_STATUS.md` (Update "Last Updated" date).
    - **Update**: `components/organisms/settings/SettingsList.tsx` (Update displayed version).

7.  **Deploy (Push to Vercel)**
    - Run `git add .`
    - Run `git commit -m "chore(release): vX.X.X - <Codename>"` (Use the version and codename from patch notes).
    - Run `git push origin main`.
    - **Notify**: "Deployed vX.X.X to Vercel! 🚀"
