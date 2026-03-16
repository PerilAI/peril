# Peril Setup Summary

## Install Command

```bash
npm install @peril-ai/core @peril-ai/react @peril-ai/server @peril-ai/mcp
```

## Changes Made

### 1. `package.json` — added Peril dependencies and scripts

- Added `@peril-ai/core` and `@peril-ai/react` as production dependencies (needed at runtime for the overlay and screenshot capture).
- Added `@peril-ai/server` and `@peril-ai/mcp` as dev dependencies (local review server and MCP bridge for agents).
- Added two convenience scripts:
  - `peril:server` — starts the Peril review server on `http://127.0.0.1:4173`.
  - `peril:mcp` — starts the MCP stdio server so agents can consume reviews.

### 2. `src/App.tsx` — wrapped app in ReviewProvider

- Imported `ReviewProvider` and `useReviewMode` from `@peril-ai/react`.
- Wrapped the existing app content with `<ReviewProvider>`, configured with:
  - `serverUrl="http://127.0.0.1:4173"` — points to the local Peril server.
  - `reviewerName="Team Reviewer"` — identifies who submitted the review.
- Added a `<ReviewToggle>` floating button (fixed bottom-right) that lets any team member enter/exit review mode. When review mode is active, hovering highlights elements and clicking opens the built-in comment composer (category, severity, description, expected behavior). Submitting captures an element screenshot, a full-page screenshot, DOM locators, and posts the review to the server.
- The default keyboard shortcut `Ctrl+Shift+.` also toggles review mode.

### 3. `.mcp.json` — MCP server configuration for agents

- Created a `.mcp.json` at the project root so MCP-aware agents (Claude, Cursor, etc.) automatically discover the Peril tools.
- Configured to run `npx peril-mcp` with `PERIL_SERVER_URL` set to the local server.
- Exposes five tools to the agent: `list_reviews`, `get_review`, `get_review_artifact`, `mark_review_resolved`, `update_review_status`.

### 4. `.gitignore` — exclude review data

- Added `.peril` directory (where the server stores review JSON and screenshot artifacts) to `.gitignore` alongside `node_modules` and `dist`.

## How to Use

1. Install dependencies: `npm install`
2. Start the Peril review server: `npm run peril:server`
3. Start your app in a separate terminal: `npm run dev`
4. Open the app in the browser. Click the "Review UI" button (or press `Ctrl+Shift+.`) to enter review mode.
5. Hover over any element to highlight it, click to select, then fill out the comment form and hit "Save review".
6. Your agent picks up reviews via MCP — it can list open reviews, read details and screenshots, and mark them resolved.
