---
description: Prepare the application for deployment to Vercel, ensuring all documentation and code checks pass.
---

1.  **Sync Check**
    - **Git History**: Ensure local is up to date with remote. `git fetch` and check status.

2.  **The "Clean Slate" Protocol (Fix Current Problems)**
    - **Linting**: Run `npm run lint`.
    - **Types**: Run `tsc --noEmit`.
    - **Build**: Run `npm run build`.
    - **ACTION**: You MUST fix ALL errors reported by these commands before proceeding. Do not push code that fails the build.

3.  **Asset Verification**
    - Verify `public/favicon.ico`, `public/icon-192x192.png`, `public/icon-512x512.png`.

4.  **Documentation Synchronization**
    - Read `package.json` version.
    - **Update**: `lib/data/patch-notes.ts` (Ensure entry exists).
    - **Update**: `DOCS/project/PATCH_NOTES_MASTER.md`.
    - **Update**: `DOCS/project/PROJECT_STATUS.md` (Update "Last Updated" date).

5.  **Final Confirmation**
    - Confirm with user: "All checks passed. Ready to push to Vercel?"
