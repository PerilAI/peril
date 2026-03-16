# Peril Troubleshooting Guide

## Common Issues

### Review mode doesn't activate

**Symptom**: Pressing `Ctrl+Shift+.` or clicking the toggle does nothing.

**Causes & fixes**:
1. **Missing `ReviewProvider`** — The `useReviewMode()` hook only works inside a `ReviewProvider`. Check that your root component wraps the app with it.
2. **Keyboard shortcut conflict** — Another extension or app may intercept `Ctrl+Shift+.`. Try setting a custom shortcut via the `keyboardShortcut` prop, or use the `useReviewMode()` hook with a button instead.
3. **SSR hydration mismatch** — In Next.js or Remix, the overlay mounts client-side via a portal after hydration. If you see hydration warnings, make sure `ReviewProvider` is inside a `"use client"` boundary (App Router) or wraps only client components.

### Agent can't see reviews / MCP tools not available

**Symptom**: The agent doesn't have Peril tools, or `list_reviews` returns nothing.

**Causes & fixes**:
1. **MCP server not running** — Run `npx peril-mcp` in a terminal. It should stay running while you work.
2. **Backend server not running** — The MCP server proxies to the REST API. Start it with `npx peril-server`.
3. **Wrong server URL** — If the backend runs on a non-default port, set `PERIL_SERVER_URL`:
   ```bash
   PERIL_SERVER_URL=http://localhost:3001 npx peril-mcp
   ```
4. **MCP config not picked up** — Restart your agent (Claude Code, Cursor, etc.) after adding the MCP config. Some agents only read config at startup.
5. **Config file in wrong location** — Double-check the config path:
   - Claude Code: `.mcp.json` in project root
   - Claude Desktop: `~/.claude/claude_desktop_config.json`
   - Cursor: `.cursor/mcp.json` in project root

### Screenshots are missing or blank

**Symptom**: Reviews save but `elementScreenshot` or `pageScreenshot` is null.

**Causes & fixes**:
1. **Not a secure context** — Screenshot capture requires `localhost` or HTTPS. If running on `http://192.168.x.x` or any non-localhost HTTP origin, screenshots will silently fail. Fix: access via `http://localhost:<port>`.
2. **Cross-origin images** — `html2canvas` can't capture images from different origins unless they have CORS headers. If the page has external images, they may appear blank in screenshots.
3. **`captureScreenshots` disabled** — Check that `<ReviewProvider captureScreenshots={true}>` is set (it's `true` by default, but may have been explicitly set to `false`).

### Server won't start / port in use

**Symptom**: `npx peril-server` fails with `EADDRINUSE`.

**Fix**: Another process is using port 4173. Either:
- Kill the existing process: `lsof -ti:4173 | xargs kill`
- Use a different port: `npx peril-server --port 3001`

Remember to update `serverUrl` in `ReviewProvider` and `PERIL_SERVER_URL` for the MCP server if you change the port.

### Reviews not persisting after restart

**Symptom**: Reviews disappear when the server restarts.

**Causes & fixes**:
1. **`.peril/` directory deleted** — Reviews are stored in `.peril/` relative to where the server was started. Make sure you start the server from the same directory each time.
2. **`.peril/` in `.gitignore` but also in `.dockerignore`** — If using Docker, the `.peril/` directory won't be in the container. Mount it as a volume or use a persistent storage path.

### Locators don't match after code changes

**Symptom**: Agent tries to find an element using the locators from a review, but the element can't be found.

**Context**: This is expected when code changes between annotation and fix. Peril generates multiple locator strategies ranked by resilience:

1. **`testId`** (`data-testid`) — Most resilient. Survives refactors unless the test ID itself changes.
2. **`role`** (ARIA role + accessible name) — Semantic. Survives visual changes.
3. **`css`** — Medium resilience. Breaks if class names or structure change.
4. **`xpath`** — Fragile. Breaks if DOM structure changes.
5. **`text`** — Least resilient. Breaks if text content changes.

**Advice for agents**: Try locators in order. If `testId` fails, try `role`, then `css`. The `domSnippet` field also contains the outer HTML of the element at capture time, which can help identify the element even when locators fail.

### TypeScript errors after install

**Symptom**: Type errors related to `@peril-ai/*` packages.

**Fixes**:
1. Ensure TypeScript 5.0+ is installed
2. Check `tsconfig.json` has `"moduleResolution": "bundler"` or `"node16"`
3. If using path aliases, make sure they don't shadow `@peril-ai/*`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PERIL_SERVER_URL` | `http://127.0.0.1:4173` | Backend API URL for the MCP server |

## Ports

| Service | Default Port | Flag |
|---------|-------------|------|
| Backend server | 4173 | `--port` |
| MCP server | stdio (no port) | N/A |

## File Storage Structure

```
.peril/
  reviews/
    rev_<ulid>/
      review.json       # Full annotation data
      element.png       # Cropped element screenshot
      page.png          # Full page screenshot
  index.json            # Fast-query index
```
