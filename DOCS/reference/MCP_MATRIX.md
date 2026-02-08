# MCP Server Matrix

**Last Update:** 2026-02-08

## Server Status

| Server | Status | Last Audit | Notes |
|---|---|---|---|
| `chrome-devtools` | OK | 2026-02-08 | Used for browser-control workflows and UI verification. |
| `supabase-mcp-server` | OK | 2026-02-08 | Used for database/admin/doc workflows. |

## Recent Audit History

| Date | Server | Status | Notes |
|---|---|---|---|
| 2026-02-08 | `chrome-devtools` | PASS | Confirmed availability during local release-hardening pass. |
| 2026-02-08 | `supabase-mcp-server` | PASS | Confirmed availability during local release-hardening pass. |
| 2026-02-03 | `chrome-devtools` | PASS | Verified Codex MCP setup and tool calls. |
| 2026-02-03 | `supabase-mcp-server` | PASS | Verified env-token setup and project listing. |

## Primary Tools

### Chrome DevTools MCP
- `mcp__chrome-devtools__navigate_page`
- `mcp__chrome-devtools__take_snapshot`
- `mcp__chrome-devtools__take_screenshot`

### Supabase MCP
- `mcp__supabase-mcp-server__list_projects`
- `mcp__supabase-mcp-server__execute_sql`
- `mcp__supabase-mcp-server__search_docs`
