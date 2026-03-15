---
name: peril-setup
description: "Set up and configure the Peril visual review system in a project. Peril turns human visual feedback (annotations on a live UI) into structured, agent-executable tasks via MCP. Use this skill whenever the user asks to install Peril, set up visual review or annotation tooling, configure MCP for UI feedback, connect Peril to their agent, add a review overlay to their React app, or troubleshoot Peril configuration issues. Also trigger when the user mentions @peril packages, ReviewProvider, peril-server, or peril-mcp."
---

# Peril Setup

You are helping a developer set up Peril — a visual UX review tool that turns human feedback into structured agent tasks via MCP (Model Context Protocol). The system has four packages that work together:

| Package | Purpose |
|---------|---------|
| `@peril-ai/core` | Framework-agnostic capture SDK (screenshots, element locators, overlay UI) |
| `@peril-ai/react` | React bindings (`ReviewProvider`, hooks) |
| `@peril-ai/server` | Local dev server with REST API, file storage, and web dashboard |
| `@peril-ai/mcp` | MCP server that exposes review tasks as tools to coding agents |

The flow: a human opens the app in a browser → activates review mode → clicks an element → describes the issue → Peril captures a screenshot, generates resilient element locators, and stores the annotation → an MCP-compatible agent (Claude Code, Cursor, Claude Desktop) reads the annotation and makes the fix.

## Setup Workflow

Walk the user through these steps in order. Skip steps that are already done (check for existing packages in `package.json`, existing `ReviewProvider` in the source, existing MCP config, etc.).

### Step 1: Detect the Project

Before installing anything, understand the project:

1. Read `package.json` to check for existing Peril packages, the framework (React, Next.js, Remix, Vue, etc.), and the package manager (npm, pnpm, yarn, bun)
2. Look for the app's entry point or root component (e.g., `src/App.tsx`, `src/main.tsx`, `app/layout.tsx`)
3. Check `.gitignore` for `.peril/`
4. Check for existing MCP config files (`~/.claude/claude_desktop_config.json`, `.cursor/mcp.json`, `.claude/settings.json`)

This detection step matters because Peril's React adapter requires React 18+, and the install command varies by package manager. Don't assume — check first.

### Step 2: Install Packages

Install the packages the project needs. Most React apps want all four:

```bash
# npm
npm install @peril-ai/core @peril-ai/react @peril-ai/server @peril-ai/mcp

# pnpm
pnpm add @peril-ai/core @peril-ai/react @peril-ai/server @peril-ai/mcp

# yarn
yarn add @peril-ai/core @peril-ai/react @peril-ai/server @peril-ai/mcp

# bun
bun add @peril-ai/core @peril-ai/react @peril-ai/server @peril-ai/mcp
```

If the project is **not** a React app, skip `@peril-ai/react` — the user can use `@peril-ai/core` directly with `createReviewOverlay()`. See `references/core-only-setup.md` for the vanilla JS approach.

### Step 3: Wrap the App with ReviewProvider

Find the app's root component and wrap it with `ReviewProvider`. The provider must be near the top of the component tree so the overlay can render over everything.

```tsx
import { ReviewProvider } from "@peril-ai/react";

function App() {
  return (
    <ReviewProvider
      serverUrl="http://localhost:4173/api"
      captureScreenshots={true}
    >
      {/* existing app content */}
    </ReviewProvider>
  );
}
```

**Key props:**
- `serverUrl` (required) — where the Peril backend is running. Default port is 4173.
- `captureScreenshots` — enables element + page screenshots. Needs localhost or HTTPS.
- `reviewerName` — optional, tags annotations with the reviewer's name.
- `keyboardShortcut` — defaults to `Ctrl+Shift+R` / `Cmd+Shift+R`. Set to `false` to disable.

**Framework-specific placement:**
- **Vite/CRA**: wrap in `src/App.tsx` or `src/main.tsx`
- **Next.js App Router**: wrap in `app/layout.tsx` inside the `<body>`, with `"use client"` directive
- **Next.js Pages Router**: wrap in `pages/_app.tsx`
- **Remix**: wrap in `app/root.tsx`

### Step 4: Add a Review Mode Toggle (Optional)

Give users a way to activate review mode from the UI. This is optional because the keyboard shortcut (`Ctrl+Shift+R`) works without any UI, but a visible button helps discoverability.

```tsx
import { useReviewMode } from "@peril-ai/react";

function ReviewButton() {
  const { active, toggle } = useReviewMode();

  return (
    <button onClick={toggle}>
      {active ? "Exit Review" : "Review Mode"}
    </button>
  );
}
```

Place this in a toolbar, header, or dev-tools panel — wherever makes sense for the app.

### Step 5: Configure .gitignore

Add `.peril/` to `.gitignore` — this directory stores review data (screenshots, JSON) and should not be committed.

```
# Peril review data
.peril/
```

### Step 6: Start the Backend Server

The Peril server stores annotations and serves the review dashboard:

```bash
npx peril-server
```

This starts on port 4173 by default. Use `--port <number>` to change it. The dashboard is available at `http://localhost:4173`.

For convenience, add a script to `package.json`:

```json
{
  "scripts": {
    "peril": "peril-server",
    "peril:dev": "peril-server --port 3001"
  }
}
```

### Step 7: Configure MCP for the User's Agent

This is the step that connects Peril to the user's coding agent. The configuration depends on which agent they use.

#### Claude Code

Add to the project's `.mcp.json` (create if it doesn't exist):

```json
{
  "mcpServers": {
    "peril": {
      "command": "npx",
      "args": ["@peril-ai/mcp"]
    }
  }
}
```

#### Claude Desktop

Add to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "peril": {
      "command": "npx",
      "args": ["@peril-ai/mcp"]
    }
  }
}
```

#### Cursor

Add to `.cursor/mcp.json` in the project root:

```json
{
  "mcpServers": {
    "peril": {
      "command": "npx",
      "args": ["@peril-ai/mcp"]
    }
  }
}
```

#### Custom / Other Agents

The MCP server uses stdio transport by default. Any MCP-compatible agent can connect:

```bash
npx peril-mcp
```

Set `PERIL_SERVER_URL` if the backend runs on a non-default port:

```bash
PERIL_SERVER_URL=http://localhost:3001 npx peril-mcp
```

### Step 8: Verify the Setup

Walk the user through a quick smoke test:

1. Start the Peril server: `npx peril-server`
2. Start the app's dev server (e.g., `npm run dev`)
3. Open the app in the browser
4. Press `Ctrl+Shift+R` (or click the review button) to activate review mode
5. Hover over any element — it should highlight with a selection overlay
6. Click an element, describe an issue, and submit
7. Check the dashboard at `http://localhost:4173` — the review should appear
8. In the agent, ask it to list open reviews — it should see the annotation with locators and screenshots

If any step fails, read `references/troubleshooting.md` for common issues and fixes.

## MCP Tools Available After Setup

Once configured, the agent has these tools:

| Tool | What it does |
|------|-------------|
| `list_reviews` | List open annotations (filter by status, category, severity, URL) |
| `get_review` | Fetch full annotation with locators, screenshots, and metadata |
| `get_review_artifact` | Retrieve screenshot as base64 |
| `mark_review_resolved` | Close an annotation after fixing the issue |
| `update_review_status` | Change status (open → in_progress → resolved) |

The agent workflow is: `list_reviews` → pick a task → `get_review` for details → read the locators to find the element in code → make the fix → `mark_review_resolved`.

## Important Details

- **React 18+ required** for `@peril-ai/react`. Check `package.json` before installing.
- **Screenshots require secure context** — the app must run on `localhost` or HTTPS. Screenshots silently fail on plain HTTP non-localhost origins.
- **Locators are multi-strategy** — Peril generates `testId`, `role`, `css`, `xpath`, and `text` locators ranked by resilience. Agents should try them in that order.
- **The server is local-only in V1** — it binds to `127.0.0.1` by default. Use `--host 0.0.0.0` only if you need network access (e.g., testing from a phone).
- **Storage is file-based** — reviews live in `.peril/reviews/` as JSON + PNG files. No database needed.

For the full API reference, configuration options, and React hooks documentation, read the reference files in the `references/` directory.
