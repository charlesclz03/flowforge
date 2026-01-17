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
    - **ACTION**: You MUST fix ALL errors reported by these commands before proceeding. Do not push code that fails the build.

4.  **Asset Verification**
    - Verify `public/favicon.ico`, `public/icon-192x192.png`, `public/icon-512x512.png`.

5.  **Documentation Synchronization**
    - Read `package.json` version.
    - **Update**: `lib/data/patch-notes.ts` (Ensure entry exists).
    - **Update**: `DOCS/project/PATCH_NOTES_MASTER.md`.
    - **Update**: `DOCS/project/PROJECT_STATUS.md` (Update "Last Updated" date).

6.  **Deploy (Push to Vercel)**
    - Run `git add .`
    - Run `git commit -m "chore(release): vX.X.X - <Codename>"` (Use the version and codename from patch notes).
    - Run `git push origin main`.
    - **Notify**: "Deployed vX.X.X to Vercel! 🚀"
