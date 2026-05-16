# Next Prompt - Patch-Note Not Done Audit Items

Use this prompt in a fresh Codex session when you are ready to plan the 18 patch-note audit items classified as `Not done`.

```md
We are in `C:\Projects\FlowForge - Freestyle`.

Follow `AGENTS.md` exactly:
1. Read `.agent/workflows/load_context.md` and follow it in order.
2. Use exactly one workflow from `.agent/workflows/`.
3. This is a planning-only task. Do not edit files, run migrations, deploy, or implement fixes.

Task:
Create a decision-complete plan for all 18 patch-note verification audit items classified as `Not done`.

Important:
- The 18-item `Not done` list is required source material. If it is not already in the session context, ask me for it before writing the plan.
- Do not infer or invent missing `Not done` findings from nearby audit reports.
- Explore the repo first before asking questions that can be answered from current code/docs.
- Use the current implementation as the source of truth.
- Do not touch unrelated untracked `.agent`, `artifacts`, or `loops` files.
- Do not inspect or paste local-only MCP config/secrets.

Planning goals:
- For each of the 18 `Not done` items, decide whether the right action is:
  - Code fix.
  - Test fix.
  - Patch-note wording correction.
  - Documentation synchronization.
  - Historical caveat/supersession note.
  - No change, with rationale.
- Identify exact affected files.
- Define acceptance criteria and verification commands.
- Group related items when they share the same root cause, but keep traceability back to all 18 findings.
- Keep the plan scoped only to `Not done` findings unless a related `Partial` item or release blocker must be mentioned as a dependency.

Before writing the plan:
1. Read the relevant current files for each finding.
2. Confirm current status from code/docs, not from patch-note wording alone.
3. Ask any product/documentation intent questions needed to choose between preserving historical wording and correcting current-facing claims.
4. Only after those questions are answered, produce the final plan.

Suggested final plan format:
- Summary.
- Source audit items covered.
- Decisions needed / answered assumptions.
- Planned changes by Not done item.
- Files likely affected.
- Verification plan.
- Out-of-scope items.
```

