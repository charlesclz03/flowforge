---
description: Run a whole-app audit (no code changes) across tests, routes, docs drift, and MCP smoke. Produces a long-form report and a P0/P1/P2 fix plan.
---

# Whole-App Audit Workflow (Master)

**Primary artifact:** `audit_reports/WHOLE_APP_AUDIT_MASTER.md`

**Default rule:** Do not change any repo files during the audit run. Report in-chat. Only write/update audit files if explicitly requested.

## 0) Start Session Context (Required)
1. Follow `.agent/workflows/load_context.md` end-to-end.
2. Read `audit_reports/WHOLE_APP_AUDIT_MASTER.md` (this file’s template + last report).

## 1) Preflight (Required)
1. `git status -sb` must be clean (or explicitly note what is dirty and why).
2. Record current `HEAD` hash and branch.
3. Confirm you will not paste secrets; redact identifiers as needed.

## 2) Automated Local Health (Required)
Run and record PASS/FAIL + warnings:

```powershell
& "C:/Program Files/nodejs/npm.cmd" run lint
& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit
& "C:/Program Files/nodejs/npm.cmd" run test -- --run
& "C:/Program Files/nodejs/npm.cmd" run build
```

Also run:

```powershell
& "C:/Program Files/nodejs/npm.cmd" audit --audit-level=high
```

## 3) Route Inventory (Required)
Collect:
- Total pages (`app/**/page.tsx`)
- Total API routes (`app/api/**/route.ts`)
- Top 5 largest pages + API routes by LOC

Use PowerShell commands (preferred) or a small one-off script, but do not commit new scripts during audit.

## 4) Type-Safety + Complexity Sweep (Required)
Collect:
- Type escape hatch count (exclude tests/docs)
- Largest files (practice/audio/auth)
- Identify the single highest regression-risk zone and explain why (based on churn + complexity + history)

## 5) Forensics (Recommended)
Run `scripts/audit-feature.ts` for:
- Practice/Audio
- Auth/Roles
- Stripe

Summarize churn and circular-refactor suspects.

Optional (audit.md “Hall of Fame”):
- Identify 5–10 checkpoint versions/hashes for the top risk zone.
- Score them using Stability/Cleanliness/Performance and include a small ranking table.
- Use `git log -L :<fn>:<path>` on at least one suspicious function to find “lost fixes”.

## 6) MCP Audit + Live Smoke (Required if tools available)
### A) MCP inventory
- List MCP servers available in-session.
- If a server is not available, mark it unavailable and note how to restore it.

### B) chrome-devtools smoke harness (production)
Minimum checks:
- `/` redirect final URL
- Retired social discovery route remains removed (expect 404)
- `/tracks` (guest): no unauth 401 noise
- `/practice` (guest): audio plays on Start; no CSP/CORS; no privacy-leaking logs

### C) supabase-mcp-server (if available)
- List projects (read-only)
- Run one read-only query (e.g., list tables or select 1 row) without exposing secrets

## 7) Report Output (Required)
1. Produce a long-form report matching the headings in `audit_reports/WHOLE_APP_AUDIT_MASTER.md` (Sections 1–9).
2. Provide a P0/P1/P2 “Forever Fix” backlog.
3. Provide a decision-complete remediation plan (files, steps, tests, acceptance criteria).

## 8) Optional persistence
Only if requested:
- Write the report into `audit_reports/WHOLE_APP_AUDIT_MASTER.md` under a new “Latest Report” dated heading, or create a dated file in `audit_reports/`.
- Do not commit unless the user explicitly requests a commit/push.
