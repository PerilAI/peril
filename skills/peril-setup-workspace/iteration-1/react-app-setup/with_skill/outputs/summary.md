# Peril Setup Summary

## Project Detection

- **Framework**: React 18.3.1 with Vite and TypeScript
- **Package manager**: npm
- **Entry point**: `src/main.tsx`
- **Root component**: `src/App.tsx`
- **Existing Peril setup**: None

## Files Modified

### `package.json`
- Added `"peril"` and `"peril:dev"` scripts for running the Peril backend server.

### `src/App.tsx`
- Imported `ReviewProvider` from `@peril-ai/react` and `ReviewButton` from `./ReviewButton`.
- Wrapped the existing app content with `<ReviewProvider serverUrl="http://localhost:4173/api" captureScreenshots={true}>`.
- Added `<ReviewButton />` inside the app for a visible review mode toggle.

### `.gitignore`
- Added `.peril/` entry to exclude Peril review data (screenshots, JSON) from version control.

## Files Created

### `src/ReviewButton.tsx`
- New component using the `useReviewMode()` hook from `@peril-ai/react`.
- Renders a button that toggles review mode on/off.

### `.mcp.json`
- MCP configuration for Claude Code, pointing to `@peril-ai/mcp` via npx.

## Commands That Would Be Run

### Install Peril packages
```bash
npm install @peril-ai/core @peril-ai/react @peril-ai/server @peril-ai/mcp
```

### Start the Peril backend server
```bash
npx peril-server
```

### Start the app dev server (existing)
```bash
npm run dev
```

## Verification Steps

1. Start the Peril server: `npx peril-server` (runs on port 4173)
2. Start the app: `npm run dev`
3. Open the app in the browser
4. Press `Ctrl+Shift+.` or click the "Review Mode" button to activate review mode
5. Hover over any element to see the selection overlay
6. Click an element, describe an issue, and submit
7. Check the dashboard at `http://localhost:4173` to see the annotation
8. In Claude Code, ask the agent to list open reviews -- it should see the annotation via MCP
