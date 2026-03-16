# Summary of Changes

## Task

Configure the Peril MCP server for Cursor so the coding agent can see and act on visual reviews.

## Pre-existing State (no changes needed)

The project already had:

- All four `@peril-ai/*` packages installed in `package.json` (`@peril-ai/core`, `@peril-ai/react`, `@peril-ai/server`, `@peril-ai/mcp`)
- `ReviewProvider` wrapping the app in `src/App.tsx` with `serverUrl="http://localhost:4173/api"` and `captureScreenshots={true}`
- A `ReviewButton` component using the `useReviewMode` hook
- `.peril/` in `.gitignore`
- A `"peril": "peril-server"` script in `package.json`

## Changes Made

### 1. Created `.cursor/mcp.json`

**File:** `.cursor/mcp.json` (new file)

Created the Cursor MCP configuration file at the project root. This tells Cursor to launch the Peril MCP server (`@peril-ai/mcp`) via `npx` using stdio transport. Once Cursor reads this config, it gains access to five MCP tools:

| Tool | Purpose |
|------|---------|
| `list_reviews` | List open annotations (filter by status, category, severity, URL) |
| `get_review` | Fetch full annotation with locators, screenshots, and metadata |
| `get_review_artifact` | Retrieve screenshot as base64 |
| `mark_review_resolved` | Close an annotation after fixing the issue |
| `update_review_status` | Change status (open, in_progress, resolved) |

## Verification Steps

To confirm the setup works:

1. Start the Peril server: `npx peril-server`
2. Start the app dev server: `npm run dev`
3. Open the app in a browser and press `Ctrl+Shift+.` (or click the Review Mode button) to activate review mode
4. Click an element, describe an issue, submit
5. Open Cursor in this project directory -- it should detect `.cursor/mcp.json` and connect to the Peril MCP server
6. Ask Cursor to list open reviews -- it should see the annotation
