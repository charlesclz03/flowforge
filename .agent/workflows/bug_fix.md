---
description: Systematically investigate, fix, and document bugs while keeping the repository in sync.
---

1.  **Sync & Reproduce**
    - **Git Sync**: Run `git fetch origin` and `git status`. Ensure we are not behind `main`. If behind, `git pull --rebase` before starting.
    - **Reproduction**: Identify the steps to reproduce the bug.
    - **Logging**: If the bug is obscure, add `console.log` or server-side logging to trace the data flow.

2.  **Analyze & Fix**
    - Create a plan to fix the root cause, not just the symptom.
    - **App-Like Integrity**: Ensure the fix doesn't break the "Native App" feel (e.g., causing layout shifts or scrollbars).

3.  **Verification (The "Current Problems" Check)**
    - Run `npm run lint`. FIX ALL ERRORS.
    - Run `tsc --noEmit`. FIX ALL TYPE ERRORS.
    - Verify the specific bug is fixed.
    - **Regression Test**: Quickly verify related features (e.g., if fixing playback, check stopping/pausing too).

4.  **Documentation**
    - **Patch Notes**: Update `lib/data/patch-notes.ts` with a bullet point for the fix.
    - **Master Doc**: Update `DOCS/reference/PATCH_NOTES_MASTER.md`.

5.  **Final Git Status**
    - Run `git status` to prepare for commit.
