# Peril -- Development Roadmap

## Package Structure

Monorepo with the following packages:

```
packages/
  core/                    # @peril-ai/core -- framework-agnostic overlay, capture, locators, serialization
  react/                   # @peril-ai/react -- React adapter (ReviewProvider, useReviewMode)
  server/                  # @peril-ai/server -- local dev server (REST API, storage, dashboard UI)
  mcp/                     # @peril-ai/mcp -- MCP server wrapping the REST API
```

Tooling: TypeScript, pnpm workspaces, Vite for SDK bundling, Vitest for tests.

---

## Phase 1: Foundation

**Goal:** Monorepo scaffold, core capture engine, local server with storage.

| # | Task | Package | Dependencies |
|---|---|---|---|
| 1.1 | Monorepo setup (pnpm, tsconfig, Vite, Vitest) | root | -- |
| 1.2 | Core overlay engine: review mode toggle, hover highlight, click-to-select | core | 1.1 |
| 1.3 | Locator generator: testId, ARIA role, CSS, XPath, text | core | 1.1 |
| 1.4 | Element screenshot capture (html2canvas) | core | 1.1 |
| 1.5 | Annotation serializer (JSON schema from DATA_MODEL.md) | core | 1.3, 1.4 |
| 1.6 | Local dev server: REST API, file-based storage | server | 1.1 |
| 1.7 | SDK transport: POST annotations to server | core | 1.5, 1.6 |

**Exit criteria:** Can select an element in a browser, capture locators + screenshot, serialize, and POST to local server. Server persists and returns reviews via REST.

---

## Phase 2: MCP + React

**Goal:** Agents can consume reviews. React apps can embed the SDK.

| # | Task | Package | Dependencies |
|---|---|---|---|
| 2.1 | MCP server: list_reviews, get_review, get_review_artifact | mcp | 1.6 |
| 2.2 | MCP server: mark_review_resolved, update_review_status | mcp | 2.1 |
| 2.3 | React adapter: ReviewProvider, useReviewMode, portal overlay | react | 1.2, 1.7 |
| 2.4 | SSR safety: client-only mount, hydration-safe | react | 2.3 |
| 2.5 | Comment composer UI: text, category, severity, expected outcome | core | 1.2 |
| 2.6 | Full-page screenshot capture | core | 1.4 |

**Exit criteria:** Agent connects via MCP, lists reviews, retrieves full annotation + artifacts, resolves reviews. React app wraps in `<ReviewProvider>` and reviewers can annotate.

---

## Phase 3: Polish + Dashboard

**Goal:** Usable end-to-end workflow with review queue UI.

| # | Task | Package | Dependencies |
|---|---|---|---|
| 3.1 | Review queue dashboard (web UI served by local server) | server | 2.1 |
| 3.2 | Dashboard: list view with thumbnails, filters, status badges | server | 3.1 |
| 3.3 | Dashboard: detail view with full annotation, screenshots, locators | server | 3.1 |
| 3.4 | Keyboard shortcuts for review mode (Ctrl+Shift+. or configurable) | core | 2.5 |
| 3.5 | Review mode visual polish: smooth highlight transitions, z-index handling | core | 1.2 |
| 3.6 | Error handling: network failures, storage errors, large DOM trees | core, server | -- |
| 3.7 | Integration tests: full flow from annotation to MCP retrieval | all | 3.1 |

**Exit criteria:** Complete V1 feature set from PRD. Reviewer annotates, agent retrieves via MCP, dashboard shows queue. All user stories pass acceptance criteria.

---

## V2 (Post-MVP)

- rrweb session replay capture and playback
- Playwright reproduction: agent can reproduce the bug in a headless browser
- Playwright verification: agent runs before/after comparison
- Angular adapter
- Plain HTML adapter (vanilla JS, no framework)
- Auto-generated acceptance criteria from annotation
- Batch processing: agent processes entire review queue

## V3 (Future)

- Source-file mapping via Babel/Vite plugin (dev-only metadata injection)
- Cloud/hosted backend with team accounts
- Design token awareness (detect spacing, color, typography deviations)
- Automatic grouping of related annotations
- "Re-run all open reviews after patch" workflow
- CI integration: block merge if open reviews exist

---

## Development Principles

1. **Ship the loop first.** The core value is annotation -> structured task -> agent retrieval. Get that working before polishing any layer.
2. **Framework-agnostic core.** The overlay, capture, and serialization must not depend on React. React adapter is a thin wrapper.
3. **Local-first.** V1 runs entirely on localhost. No cloud dependency, no auth, no accounts.
4. **Agent-first schema.** Every design decision in the annotation schema should optimize for machine consumption, not human readability.
5. **Test at boundaries.** Integration tests covering the full annotation-to-MCP flow matter more than unit tests on individual utilities.
