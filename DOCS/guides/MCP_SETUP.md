# MCP Setup (Codex + Antigravity)

This guide describes the recommended local setup for Model Context Protocol (MCP) servers used by FlowForge tooling:

- `chrome-devtools` (browser automation)
- `supabase-mcp-server` (Supabase admin / SQL / migrations / docs)

## Security First
- Never store raw tokens in repo-tracked files.
- Prefer environment variables for secrets.
- Redact secrets in logs, screenshots, and bug reports.

## Required Environment Variables
Set these as **User** environment variables on Windows (no values shown here):
- `SUPABASE_ACCESS_TOKEN`
- (Optional) `GITHUB_PERSONAL_ACCESS_TOKEN` (only if you later enable GitHub MCP with Docker)

## Codex CLI MCP Configuration
Codex MCP servers are configured in `~/.codex/config.toml` under `[mcp_servers.*]`.

### Supabase (stdio)
Codex must pass the token into the MCP server via env passthrough:
- Add `env_vars = ["SUPABASE_ACCESS_TOKEN"]` under `[mcp_servers.supabase-mcp-server]`.

### Chrome DevTools (stdio)
Recommended configuration for Codex is to let the MCP server manage an isolated browser instance.

If you prefer manual Chrome launch (remote debugging), see `DOCS/reference/MCP_MATRIX.md` for the current notes.

## Antigravity MCP Configuration (Local Only)
Antigravity uses a local config file (example location):
- `C:\\Users\\<user>\\.gemini\\antigravity\\mcp_config.json`

Recommendations:
- Do not include access tokens inline in `args` or `env` in that file.
- Prefer `SUPABASE_ACCESS_TOKEN` in the environment and restart Antigravity after updating env vars.
- If Docker is not installed, remove or disable the GitHub MCP entry to avoid broken servers.

## Verification
Run these to verify Codex has MCP servers configured:

```powershell
codex mcp list --json
codex mcp get supabase-mcp-server --json
codex mcp get chrome-devtools --json
```

Then perform a small smoke test in a Codex session:
- Supabase: `mcp_supabase-mcp-server_list_projects`
- Chrome: `mcp_chrome-devtools_navigate_page` + `mcp_chrome-devtools_take_snapshot`

Record any changes in:
- `DOCS/reference/MCP_MATRIX.md`

