# Peril Setup Summary -- Vanilla JS + Vite (No React)

## Install Command

```bash
npm install
```

This will install `@peril-ai/core` (runtime dependency) and `@peril-ai/server` (dev dependency).

## Files Changed

### `package.json`
- Added `@peril-ai/core` to `dependencies` -- the framework-agnostic SDK that provides the review overlay, screenshot capture, locator generation, and review transport.
- Added `@peril-ai/server` to `devDependencies` -- the local backend that stores reviews on disk and serves a dashboard.
- Added `dev:peril` script (`peril-server`) to start the Peril server on port 4173.

### `vite.config.ts` (new)
- Created a Vite config that proxies `/api` requests to `http://127.0.0.1:4173`, so the browser-side SDK can reach the local `@peril-ai/server` without CORS issues.

### `src/peril.ts` (new)
- Created a Peril initialization module that:
  - Calls `createReviewOverlay()` to mount the interactive overlay (highlight-on-hover, click-to-select, built-in comment composer form).
  - Default keyboard shortcut: **Ctrl+Shift+.** toggles review mode.
  - On comment submission, captures an element screenshot and a full-page screenshot via `captureElementScreenshot()` / `capturePageScreenshot()`.
  - Generates a locator bundle (testId, role, CSS, XPath, text) via `generateLocatorBundle()`.
  - Submits the full review payload (selection, comment, artifacts, viewport, metadata) to the Peril server via `submitReview()`.

### `src/main.ts`
- Added `import { initPeril } from "./peril"` and a call to `initPeril()` at the bottom so the overlay is active as soon as the app loads.

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Peril review server (in one terminal):
   ```bash
   npm run dev:peril
   ```

3. Start the Vite dev server (in another terminal):
   ```bash
   npm run dev
   ```

4. Open the app in a browser. Press **Ctrl+Shift+.** to activate review mode. Hover over elements to see them highlighted, click to select, fill in the review form, and submit. Reviews are stored locally and visible at `http://127.0.0.1:4173/`.

## Architecture Notes

- **No React required.** `@peril-ai/core` is fully framework-agnostic. The overlay, form, and all DOM interactions are handled internally by `createReviewOverlay()`.
- **`@peril-ai/react` is not used.** The React bindings package is unnecessary for this vanilla JS setup.
- **Proxy pattern.** The Vite dev server proxies `/api/*` to the Peril server so `submitReview()` works with its default endpoint (`/api/reviews`) without any extra configuration.
- **MCP integration.** If you want agents to consume reviews, run `@peril-ai/mcp` alongside `@peril-ai/server`. The MCP server reads from the same `.peril` data directory.
