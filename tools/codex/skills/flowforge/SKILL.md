---
name: flowforge
description: FlowForge repository workflow assistant for the Next.js (App Router) TWA/PWA app using Prisma + Supabase. Use for FlowForge tasks that should follow `.agent/workflows/*` (load_context, bug_fix, deploy, database_migration, audit, layout_audit, new_component, android_update, MCP_audits), and for enforcing required verification + patch notes discipline.
---

# FlowForge

## Session Start (Required)
1. Open `.agent/workflows/load_context.md` and follow it in order.
2. Do not start coding until the context load steps are complete.

## Workflow Router
Use exactly one workflow (and follow it end-to-end):

| If the user wants to... | Follow this workflow |
| --- | --- |
| Start a fresh session / get full context | `.agent/workflows/load_context.md` |
| Fix a bug / regression | `.agent/workflows/bug_fix.md` |
| Prepare a release / deploy to Vercel | `.agent/workflows/deploy.md` |
| Change DB schema / migrations / Prisma client | `.agent/workflows/database_migration.md` |
| Do a deep forensic audit of a feature | `.agent/workflows/audit.md` |
| Audit or harden layout components | `.agent/workflows/layout_audit.md` |
| Build a new UI component | `.agent/workflows/new_component.md` |
| Update Android TWA/PWA assets/config | `.agent/workflows/android_update.md` |
| Audit MCP integrations | `.agent/workflows/MCP_audits.md` |

## Quality Bars (Always Enforce)
- TWA / mobile-first:
  - Touch targets >= 44x44px.
  - Avoid "website feel" (browser scrollbars, selectable UI, jittery layout shifts).
  - Respect safe areas (notches, home indicator).
- Layout stability:
  - Prefer Grid/Flex. Avoid `absolute` for structural layout (badges/overlays are okay).
  - Avoid magic-number `calc()` layouts for critical nav/header/footer.
- Verification:
  - Run `lint`, `tsc --noEmit`, and `build` for any non-trivial change (especially before deploy).
- Patch notes discipline:
  - When a user-visible change happens, update `lib/data/patch-notes.ts` and `DOCS/reference/PATCH_NOTES_MASTER.md`.
- Windows command reliability:
  - Use `npm.cmd` / `npx.cmd` (PowerShell execution policy may block `.ps1` shims).

## MCP Usage Policy
- If MCP servers are available, prefer them:
  - `chrome-devtools` for browser automation, screenshots, and UI verification.
  - `supabase-mcp-server` for Supabase operations (SQL, migrations, logs, docs).
- If MCP is unavailable, fall back to:
  - Playwright for browser verification (`e2e/`, `playwright.config.ts`).
  - Prisma CLI + repo scripts for DB work.

## Redaction Rules (Strict)
- Never print or commit secrets (tokens/keys/cookies).
- Treat local MCP configs as sensitive (example: `C:\\Users\\<user>\\.gemini\\antigravity\\mcp_config.json`).
- Prefer environment variables for secrets (e.g., `SUPABASE_ACCESS_TOKEN`), and use placeholders in docs/output.

