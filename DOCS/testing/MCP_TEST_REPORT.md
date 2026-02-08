# MCP + Browser-Control Test Report
**Date:** 2026-02-08  
**Environment:** Local (`http://localhost:3000`)  
**Scope:** MCP server availability + automated browser-control regression checks

## 1) MCP Server Health

| Server | Status | Validation |
|---|---|---|
| `chrome-devtools` | PASS | Tooling available and callable in current workspace session. |
| `supabase-mcp-server` | PASS | Tooling available and callable in current workspace session. |

## 2) Browser-Control Regression (Playwright)

Command:

```bash
npx playwright test
```

Result:
- **18 passed**
- **2 skipped** (project-scoped skips by design)
- **0 failed**

Covered areas:
- Guest navigation and route access (`/`, `/tracks`, protected redirects)
- Practice startability (no stuck loader)
- Practice timeout auto-finish and return-to-ready behavior
- Guest completion path (no unauthorized save API calls)
- Mobile project smoke (`Pixel 5`) for navigation and practice startability

## 3) API/Auth Smoke (Local)

Validated via automated tests and browser assertions:
- Guest access to protected data endpoints remains unauthorized by design
- Tracks and words APIs are reachable in local dev runtime
- Practice completion no longer relies on auth-only save endpoints for guest flow

## 4) Release-Relevant Observations

- `public/.well-known/assetlinks.json` is present in the repo (no longer missing).
- NextAuth debug noise is now controllable through `NEXTAUTH_DEBUG`.
- No MCP toolchain outages were observed during this pass.

## 5) Verdict

**PASS (tooling + browser-control baseline).**  
MCP infrastructure and browser automation are healthy for release-hardening workflows.
