# Peril Setup Summary -- Vanilla JS + Vite

## Project Detection

- **Framework**: Vanilla TypeScript (no React)
- **Bundler**: Vite 6
- **Package manager**: npm
- **Entry point**: `src/main.ts`
- **Existing Peril packages**: None

Because the project does not use React, the skill directed us to skip `@peril-ai/react` and use `@peril-ai/core` directly with `createReviewOverlay()` (per `references/core-only-setup.md`).

## Changes Made

### 1. `package.json` -- Added Peril dependencies and scripts

- Added `@peril-ai/core`, `@peril-ai/server`, and `@peril-ai/mcp` as dependencies (not `@peril-ai/react`, since this is not a React project).
- Added `"peril"` and `"peril:dev"` scripts to start the Peril backend server.

### 2. `src/main.ts` -- Integrated Peril review overlay

- Imported `createReviewOverlay` from `@peril-ai/core`.
- Called `createReviewOverlay()` with full configuration: `document`/`window` refs, comment composer with categories and severities, element selection callback, keyboard shortcut (`Ctrl+Shift+.`), and high z-index.
- Added a "Review Mode" toggle button to the DOM and wired it to `overlay.setEnabled()` / `overlay.isEnabled()` so users can activate review mode without the keyboard shortcut.

### 3. `.gitignore` -- Added `.peril/`

- Appended `.peril/` to prevent review data (screenshots, JSON) from being committed.

### 4. `.mcp.json` -- Created MCP config for Claude Code

- Created `.mcp.json` at the project root with the `peril` MCP server configured via `npx @peril-ai/mcp`.

## Files Changed

| File | Action |
|------|--------|
| `package.json` | Modified -- added 3 dependencies, 2 scripts |
| `src/main.ts` | Modified -- added Peril overlay initialization and toggle button |
| `.gitignore` | Modified -- added `.peril/` entry |
| `.mcp.json` | Created -- Claude Code MCP configuration |

## Verification Steps

1. Install dependencies: `npm install`
2. Start the Peril server: `npm run peril`
3. Start the app dev server: `npm run dev`
4. Open the app in a browser
5. Press `Ctrl+Shift+.` or click the "Review Mode" button to activate review mode
6. Hover over elements to see selection highlights; click to annotate
7. Check the dashboard at `http://localhost:4173` for submitted reviews
8. In Claude Code, use `list_reviews` to confirm the MCP integration works
