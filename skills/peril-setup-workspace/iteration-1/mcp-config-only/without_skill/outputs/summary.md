# MCP Configuration Summary

## What was done

Created `.cursor/mcp.json` in the project root to register the Peril MCP server with Cursor.

## File created

**`.cursor/mcp.json`** -- Cursor MCP server configuration that:

- Runs the `peril-mcp` binary (from `@peril-ai/mcp`, already in `package.json` dependencies) via `npx`
- Uses stdio transport (Cursor's default for `command`-based servers)
- Sets `PERIL_SERVER_URL` to `http://localhost:4173` to match the `serverUrl` already configured in the app's `ReviewProvider`

## Tools now available in Cursor

Once the Peril server is running (`npm run peril`), Cursor will have access to these MCP tools:

| Tool | Description |
|------|-------------|
| `list_reviews` | List open review tasks with optional filtering by status, category, severity, URL, or limit |
| `get_review` | Fetch full review annotation, metadata, locators, and computed styles |
| `get_review_artifact` | Retrieve element/page screenshots or rrweb session recordings |
| `mark_review_resolved` | Mark a review as resolved with optional comment |
| `update_review_status` | Change review status (open, in_progress, resolved, wont_fix) |

## How to use

1. Start the Peril server: `npm run peril`
2. Open the project in Cursor
3. Cursor will auto-detect `.cursor/mcp.json` and start the MCP server
4. The Peril review tools will appear in Cursor's agent/tool list
