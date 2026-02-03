# MCP Server Matrix

**Last Update:** 2026-02-03

## MCP Servers

| Server              | Status | Last Audit | Tools | Notes |
|:--------------------|:------:|:-----------|------:|:------|
| chrome-devtools     | ✅     | 2026-01-30 | 9     | Connected via Manual Launch. |
| supabase-mcp-server | ✅     | 2026-01-30 | 6+    | Connected to `FlowForge`. |

## Audit History

| Date       | Server              | Status | Changes Applied |
|:-----------|:--------------------|:------:|:----------------|
| 2026-02-03 | chrome-devtools     | OK     | Configured Codex MCP (isolated Chrome) and verified tool calls. |
| 2026-02-03 | supabase-mcp-server | OK     | Moved token to env var; configured Codex env passthrough; verified project listing. |
| 2026-01-30 | chrome-devtools     | ✅ OK  | Verified connectivity (Manual Launch required). |
| 2026-01-30 | supabase-mcp-server | ✅ OK  | Confirmed project list and documentation access. |
| 2026-01-29 | chrome-devtools     | ✅ OK  | Fixed connection via `Start-Process chrome`. |
| 2026-01-29 | supabase-mcp-server | ✅ OK  | Validated connection, project listing, and doc search. |

## Tool Reference

### Supabase
- **Query**: `mcp_supabase-mcp-server_execute_sql`
- **Docs**: `mcp_supabase-mcp-server_search_docs`
- **Projects**: `mcp_supabase-mcp-server_list_projects`

### Chrome
- **Screenshot**: `mcp_chrome-devtools_take_screenshot`
- **Navigate**: `mcp_chrome-devtools_navigate_page`
- **Inspect**: `mcp_chrome-devtools_take_snapshot`
