---
description: Audit and harden layout components (Headers, Footers, Navs) to prevent visual regressions.
---

# Layout Component Audit Workflow

Use this workflow to audit critical UI structural components. The goal is to identify fragile CSS (Absolute Positioning, Magic Numbers) and replace them with robust layouts (CSS Grid/Flex).

## 1. Safety Check (The "Magic Number" Test)
1.  **Scan for Fragility**:
    -   Search for `absolute` positioning combined with `calc()`.
    -   Search for "magic numbers" (pixel values that assume a specific screen width, e.g., `calc(100% - 340px)`).
    -   *Command*: `grep_search "calc" [file_path]`
2.  **Visual Stress Test**:
    -   What happens if a child element doubles in size? (e.g., Translation, Long Username).
    -   Does the layout overlap or break?

## 2. Forensic Analysis
1.  **Check History**:
    -   Has this component been "fixed" more than 3 times?
    -   Look for commit messages like "fix mobile", "overlap", "z-index".
    -   *Command*: `git log --oneline [file_path]` | grep -E "fix|mobile|layout"`

## 3. Code Quality Verification
1.  **Complexity**: Is the render logic linear, or are there complex ternary nests?
2.  **Types**: Ensure no `: any`.
3.  **Lint**: Run `npm run lint` on the file.

## 4. The "Forever Fix" Standard
If the component fails the Safety Check:
-   **Mandatory Refactor**: Migrate to **CSS Grid**.
-   **Pattern**: `grid-cols-[1fr_auto_1fr]` (for centered headers) or `grid-cols-X` (for nav bars).
-   **Ban**: `absolute` positioning for structural layout (overlay badges/icons are okay).

## 5. Deliverables
Create the following in the `brain` directory:
1.  `[COMPONENT]_AUDIT_REPORT.md` (Verdict: PASS/FAIL).
2.  `[COMPONENT]_FIX_PLAN.md` (If FAIL).
3.  Update `FEATURE_MATRIX.md` with the audit result.
