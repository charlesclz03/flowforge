---
description: Perform a deep comprehensive audit on a specific feature to find regressions, duplicates, and plan a "forever fix".
---

# Feature Integrity Audit Workflow

This workflow is designed to perform a forensic analysis of a specific feature, tracing its history, identifying regression loops ("circular refactoring"), and establishing a definitive fix plan.

## 1. Feature Selection & Scope
1.  **Read Feature Matrix**:
    -   Run `view_file` on `DOCS/reference/FEATURE_MATRIX.md`.
    -   Parse the table to see which features are verified `[x]` and which are pending `[ ]`.
    -   Present the list of UNVERIFIED features to the User and ask which one to audit.
    -   **Constraint**: If the user selects an already audited feature, warn them but allow re-audit if requested.

## 2. Feature Scoping (Once Feature is Selected)
1.  **Determine Scope**:
    -   Once a feature is selected (e.g., "Cypher Mode"), identify ALL related files.
    -   Use `grep_search` or `find_by_name` to map the dependency tree.
    -   *Example*: For "Chat", find components, hooks, API routes, and database schema definitions.

### A. Automated Forensics (The Script)
Run the automated forensic tool to generate the initial report draft.

```bash
npx ts-node scripts/audit-feature.ts "[FeatureName]" [list_of_files]
```

*Example*: `npx ts-node scripts/audit-feature.ts "Player" "app/practice/**/*" "hooks/player/*.ts"`

The script will:
1.  Calculate Churn (Commits/Month).
2.  Detect Hotfix patterns.
3.  Identify "Circular Refactoring" suspects.
4.  Generate `audit_reports/[Feature]_AUDIT_REPORT.md`.

### B. Manual Deep Dive
Once the report draft is generated, read it (`view_file`). Then perform targeted deep dives using function tracing:

-   **Function Tracing**: Use `git log -L :[function_name]:[file_path]` on suspicious hotspots identified by the script.

### B. "Circular Refactoring" Detection
-   **Commit Pattern Search**: `git log --grep="fix\|bug\|sync\|latency" --oneline [file_paths]`
-   **Logic Reversal Check**: Compare the implementation of a specific function in the "Best" era vs the "Current" era. Did we delete a check that was added 2 years ago?
-   **Critical**: Identify if a specific bug (e.g., "Timer Drift") was claimed fixed > 2 times.

### C. Version Scoring (Hall of Fame)
-   Identify 5-10 key versions using `git tag` or hash checkpoints (the script lists candidates).
-   Score them (0-100) using this Weighted Model:
    -   **Stability (40%)**: Time elapsed before next "hotfix" commit.
    -   **Cleanliness (30%)**: Absence of `// ts-ignore`, `any` types, or TODOs.
    -   **Performance (30%)**: (Subjective) Algorithmic efficiency of core loops.
-   *Output*: Update the ranking table in the generated report.

## 3. Current State Verification
1.  **Static Analysis & Complexity**:
    -   Read the *current* head version.
    -   **Complexity Check**: Manually estimate Cyclomatic Complexity. Are there single functions > 50 lines with > 3 nested `if/for` blocks? Flag them.
    -   **Type Safety**: Run `grep -c ": any" [file_paths]` to quantify loose typing.
2.  **Lint Check**: Run `npm run lint` targeting the scoped files.
3.  **Gap Analysis**: 
    -   Compare the "Best" version (from Step 2C) against current `HEAD`. 
    -   *Question*: "Do we have any logic in `HEAD` that is structurally worse than `vBest`?" (e.g., we replaced a reducer with 10 `useRef`s).

## 4. Artifact Generation
Create the following files in the `brain` directory. Always include the Date/Feature in the filename.

### A. The Audit Report
**Filename**: `[FEATURE]_AUDIT_REPORT.md`
-   **Executive Summary**: Pass/Fail status.
-   **Hall of Fame**: The ranking table.
-   **The Crimes**: List of circular refactors and "lost" code.
-   **Verdict**: Is the current version the best version?

### B. The Fix Plan (If needed)
**Filename**: `[FEATURE]_FIX_PLAN.md`
-   **Objective**: "The Forever Fix".
-   **Steps**: Concrete engineering tasks (e.g., "Extract Hook", "Implement FSM").
-   **Validation**: How to prove it's fixed.

## 5. Execution (REQUIRED)
-   Ask the user: "Do you want to proceed with the 'Forever Fix' for [FEATURE]?"
-   If YES:
    -   Create a `task.md` entry specifically for this fix.
    -   Execute the plan using TDD (Test/Type Driven Development) where possible.
-   If NO fixes needed (feature passes audit): Note "No fixes required" in the audit history.

## 6. Feature Matrix Update (REQUIRED)
-   **Always** update `DOCS/reference/FEATURE_MATRIX.md` at the end of the audit.
-   Mark the audited feature with `[x] <date>` (e.g., `[x] 1/29`).
-   This confirms the feature has been audited and is verified.
-   *Example*:
    ```diff
    -| **Word Prompts**   |      | Synchronized words...
    +| **Word Prompts**   | [x] 1/29 | Synchronized words...
    ```

## 7. Audit History Log (REQUIRED)
-   **Always** add an entry to the **Audit History** section at the bottom of `FEATURE_MATRIX.md`.
-   Include: Date, Feature Name, Status (PASS/FAIL), and any fixes applied.
-   Format:
    ```markdown
    ## Audit History
    
    | Date       | Feature         | Status | Fixes Applied                                      |
    |:-----------|:----------------|:------:|:---------------------------------------------------|
    | 2026-01-29 | Word Prompts    | ✅ PASS | Added 8 unit tests, JSDoc, metrics logging         |
    | 2026-01-29 | Beat Library    | ✅ PASS | Fixed `: any` type escape with `as const`          |
    ```

## 8. Report Date Requirement (REQUIRED)
-   **All audit reports** must include the date in the report header.
-   Format: `**Date:** YYYY-MM-DD` (e.g., `**Date:** 2026-01-29`).
-   This provides log context for historical reference.
