---
description: Perform a comprehensive audit on MCP server integrations to verify connectivity, optimize usage, and document capabilities.
---

# MCP Server Audit Workflow

This workflow audits Model Context Protocol (MCP) server integrations to ensure they are properly configured, documented, and optimally used.

## 1. MCP Server Inventory
1.  **List Available Servers**:
    -   Check the active MCP servers in the current session.
    -   Document each server name and its primary purpose.
    -   *Current Servers*: `chrome-devtools`, `supabase-mcp-server`

## 2. Server Capability Assessment
For each MCP server:

### A. Tool Discovery
-   List all available tools using the MCP protocol.
-   Categorize tools by function (read, write, navigate, etc.).
-   Note any deprecated or unused tools.

### B. Usage Analysis
-   Search codebase for MCP tool invocations.
-   Count frequency of each tool usage.
-   Identify underutilized capabilities.
-   *Command*: `grep_search` for `mcp_[server-name]_` patterns.

### C. Connection Health
-   Test basic connectivity to each server.
-   Verify authentication/permissions are correct.
-   Note any connection errors or timeouts.

## 3. Optimization Opportunities
1.  **Redundancy Check**:
    -   Are there native tools that duplicate MCP functionality?
    -   Should MCP be preferred over native for certain operations?

2.  **Performance Analysis**:
    -   Note response times for common operations.
    -   Identify slow or resource-intensive tools.

3.  **Best Practices**:
    -   Document recommended usage patterns.
    -   Note any anti-patterns to avoid.

## 4. Documentation Generation
Create the following in the `brain` directory:

### A. MCP Audit Report
**Filename**: `MCP_[SERVER]_AUDIT_REPORT.md`
-   **Date**: YYYY-MM-DD (REQUIRED)
-   **Server**: Name and version if available
-   **Status**: Healthy/Degraded/Unavailable
-   **Tool Inventory**: Table of all tools with descriptions
-   **Usage Stats**: Frequency of tool usage
-   **Recommendations**: Optimization suggestions

### B. MCP Reference Card (Optional)
**Filename**: `MCP_[SERVER]_REFERENCE.md`
-   Quick reference for common operations.
-   Code snippets for frequent patterns.

## 5. Execution (REQUIRED)
-   Implement any recommended optimizations.
-   Update workflows that use MCP tools if needed.
-   If no changes needed: Note "No optimizations required".

## 6. MCP Matrix Update (REQUIRED)
-   Update `DOCS/reference/MCP_MATRIX.md` (create if doesn't exist).
-   Mark the audited server with verification date.
-   Format:
    ```markdown
    ## MCP Servers
    
    | Server              | Status | Last Audit | Tools | Notes |
    |:--------------------|:------:|:-----------|------:|:------|
    | chrome-devtools     | ✅     | 2026-01-29 | 25    | Browser automation |
    | supabase-mcp-server | ✅     | 2026-01-29 | 30    | Database & Edge Functions |
    ```

## 7. Audit History Log (REQUIRED)
-   Add entry to the audit history section of `MCP_MATRIX.md`.
-   Format:
    ```markdown
    ## MCP Audit History
    
    | Date       | Server              | Status | Changes Applied |
    |:-----------|:--------------------|:------:|:----------------|
    | 2026-01-29 | supabase-mcp-server | ✅ OK  | Documented all tools |
    ```

## 8. Report Date Requirement (REQUIRED)
-   All MCP audit reports must include the date in the header.
-   Format: `**Date:** YYYY-MM-DD`

---

## Quick Reference: Available MCP Servers

### chrome-devtools
Browser automation for testing and screenshots.
-   `mcp_chrome-devtools_take_screenshot` - Capture page/element
-   `mcp_chrome-devtools_click` - Click elements
-   `mcp_chrome-devtools_fill` - Type into inputs
-   `mcp_chrome-devtools_navigate_page` - URL navigation
-   `mcp_chrome-devtools_take_snapshot` - A11y tree snapshot

### supabase-mcp-server
Database and Edge Function management.
-   `mcp_supabase-mcp-server_execute_sql` - Run SQL queries
-   `mcp_supabase-mcp-server_apply_migration` - DDL operations
-   `mcp_supabase-mcp-server_deploy_edge_function` - Deploy functions
-   `mcp_supabase-mcp-server_get_logs` - Fetch service logs
-   `mcp_supabase-mcp-server_search_docs` - Search Supabase docs
