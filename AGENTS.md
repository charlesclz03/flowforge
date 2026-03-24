# FlowForge - Agent Instructions

## One-Minute Bootstrap
1. Read `.agent/workflows/load_context.md` and follow it in order.
2. Pick exactly one workflow from `.agent/workflows/` for the task (see index below) and follow it end-to-end.
3. Keep changes small, verify locally, then update the relevant docs (patch notes / matrices) required by the workflow.

## Documentation Start Here
- Canonical docs hub: `docs/README.md`
- Current handoff: `docs/summaries/QUICK_START_NEXT_SESSION.md`
- Current status: `docs/project/PROJECT_STATUS.md`
- Roadmap: `docs/project/ROADMAP.md`

## Project Facts
- Stack: Next.js (App Router), TypeScript, Tailwind CSS, Prisma, Supabase, NextAuth, Playwright, Vitest, TWA/PWA.
- Key dirs: `app/`, `components/`, `lib/`, `prisma/`, `public/`, `DOCS/`, `.agent/`.

## Commands (Windows-Safe)
This environment blocks PowerShell `.ps1` shims for npm/npx. Use the `.cmd` executables:

```powershell
& "C:/Program Files/nodejs/npm.cmd" install
& "C:/Program Files/nodejs/npm.cmd" run dev
& "C:/Program Files/nodejs/npm.cmd" run lint
& "C:/Program Files/nodejs/npx.cmd" tsc --noEmit
& "C:/Program Files/nodejs/npm.cmd" run test
& "C:/Program Files/nodejs/npm.cmd" run build
```

If PowerShell blocks running repo `.ps1` scripts, run them via:

```powershell
powershell.exe -ExecutionPolicy Bypass -File scripts/<script>.ps1
```

## Workflow Index
- `.agent/workflows/load_context.md`: start a new session, read key docs, and synthesize objectives.
- `.agent/workflows/bug_fix.md`: reproduce, fix root cause, verify (lint + tsc), and update patch notes.
- `.agent/workflows/deploy.md`: deploy checklist for Vercel (DB schema, lint/types/build, patch notes/version).
- `.agent/workflows/database_migration.md`: modify `prisma/schema.prisma` safely, generate client, push/migrate, fix types.
- `.agent/workflows/audit.md`: feature integrity audit using `scripts/audit-feature.ts`, update `DOCS/reference/FEATURE_MATRIX.md`.
- `.agent/workflows/layout_audit.md`: audit layout components for fragile CSS and apply the "forever fix" standard.
- `.agent/workflows/new_component.md`: create UI components with FlowForge's premium, TWA-ready aesthetic.
- `.agent/workflows/android_update.md`: update PWA/TWA manifests/assets and Android deployment docs.
- `.agent/workflows/MCP_audits.md`: audit MCP servers and update `DOCS/reference/MCP_MATRIX.md`.

## Documentation Pointers
- Start here: `DOCS/DOCUMENTATION_INDEX.md`
- Status/Roadmap: `DOCS/project/PROJECT_STATUS.md`, `DOCS/project/ROADMAP.md`
- Patch notes: `lib/data/patch-notes.ts`, `DOCS/reference/PATCH_NOTES_MASTER.md`

## MCP Expectations
When MCP tools are available, prefer them over ad-hoc scripts:
- Browser automation: `chrome-devtools`
- Supabase admin/SQL/migrations/docs: `supabase-mcp-server`

Canonical MCP references:
- Matrix/status: `DOCS/reference/MCP_MATRIX.md`
- Test baseline: `DOCS/testing/MCP_TEST_REPORT.md`

## Safety (Non-Negotiable)
- Never commit or paste secrets (tokens, keys, cookies).
- MCP config files (e.g. `mcp_config.json`) are local-only; do not add them to the repo.
- Redact secrets from logs, screenshots, bug reports, and PRs.
