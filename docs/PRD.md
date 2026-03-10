# Peril -- Product Requirements Document

## Overview

Peril turns visual UX feedback into structured, agent-executable tasks via MCP. Anyone with a browser can point at what's wrong in a live app, and a coding agent receives everything it needs to find, fix, and verify the issue.

**Target release:** V1 (MVP)

---

## Problem

Teams using AI coding agents (Claude Code, Codex, Cursor) hit a feedback bottleneck: non-engineers (design, PM, QA, founders) can see UI problems but can't describe them in a way agents can act on. The current workaround -- pasting screenshots into a chat window with a text description -- loses precision, context, and doesn't scale past one bug at a time.

## Solution

A three-layer system:
1. **In-page review SDK** -- browser overlay for selecting elements and annotating issues
2. **Review backend** -- stores annotations as structured tasks with locators, screenshots, replay artifacts, and acceptance criteria
3. **Agent bridge (MCP server)** -- exposes tasks as tools to any MCP-compatible coding agent

---

## ICP

| Dimension | Detail |
|---|---|
| Company size | Seed to Series B startups shipping with AI coding agents |
| Team shape | Small eng teams (2-15) using Claude Code, Codex, or Cursor |
| Pain | Non-engineers see UI bugs but can't describe them for agents |
| Trigger event | Team adopts AI coding agent, immediately hits feedback bottleneck |
| Buyer | Engineering lead or Head of Product |
| User | Anyone reviewing a UI -- designers, PMs, QA, founders |

---

## V1 Scope (MVP)

### In scope

1. **Review overlay SDK** (browser package)
   - Toggle review mode on/off
   - Hover highlight on any DOM element
   - Click to select element
   - Comment composer (text + category + severity)
   - Capture element screenshot (SnapDOM/html2canvas)
   - Capture full-page screenshot
   - Generate multi-strategy locator bundle (testId, ARIA, CSS, XPath, text)
   - Capture DOM snippet of selected element
   - Serialize annotation as structured JSON
   - Send to local dev server

2. **Review backend** (local dev server)
   - Receive and store annotations
   - Serve annotation list and details
   - Serve artifacts (screenshots)
   - SQLite or file-based storage for V1

3. **MCP server**
   - `list_reviews` -- list open review tasks
   - `get_review` -- get full annotation with locators and metadata
   - `get_review_artifact` -- retrieve screenshot or DOM snapshot
   - `mark_review_resolved` -- close a review task
   - Connect to Claude Code and Codex via MCP

4. **React adapter**
   - Client-side only mount (SSR-safe)
   - Portal-based overlay
   - `useReviewMode()` hook
   - `<ReviewProvider>` component

### Out of scope for V1

- rrweb session replay (V2)
- Playwright reproduction/verification loop (V2)
- Angular and plain HTML adapters (V2)
- Source-file mapping via build plugins (V3)
- Cloud/hosted backend (V3)
- Team collaboration features (V3)
- Design token awareness (V3)

---

## User Stories

### US-1: Annotate a UI element
**As a** reviewer (designer, PM, QA),
**I want to** select any element on the live app and attach a comment,
**so that** coding agents receive a precise, structured description of the issue.

**Acceptance criteria:**
- Reviewer can toggle review mode via keyboard shortcut or button
- Hovering highlights the element under the cursor with a visible outline
- Clicking selects the element and opens a comment composer
- Comment composer accepts: text, category (bug/polish/accessibility/copy/UX), severity (low/medium/high/critical), expected outcome
- On submit, annotation includes: locator bundle, DOM snippet, element screenshot, page screenshot, URL, viewport, timestamp
- Annotation is sent to the review backend and persisted

### US-2: List and inspect reviews via MCP
**As a** coding agent (Claude Code, Codex),
**I want to** list open reviews and retrieve full annotation details,
**so that** I can understand exactly what to fix without human re-description.

**Acceptance criteria:**
- Agent calls `list_reviews` and receives a list of open annotations with id, title/comment summary, category, severity, URL
- Agent calls `get_review(id)` and receives the full annotation including locator bundle, DOM snippet, comment, expected outcome
- Agent calls `get_review_artifact(id, type)` and receives the screenshot or snapshot
- Locator bundle contains at least 3 strategies ranked by resilience

### US-3: Resolve a review
**As a** coding agent,
**I want to** mark a review as resolved after fixing the issue,
**so that** the review queue reflects current status.

**Acceptance criteria:**
- Agent calls `mark_review_resolved(id)` with an optional resolution comment
- Review status changes from "open" to "resolved"
- Resolution is visible in the review list

### US-4: Review queue dashboard
**As a** reviewer,
**I want to** see all open annotations in a simple list,
**so that** I can track what's been reported and what's been fixed.

**Acceptance criteria:**
- Local dev server serves a web UI listing all annotations
- Each entry shows: element screenshot thumbnail, comment preview, category, severity, status
- Clicking an entry shows full annotation details
- Resolved items are visually distinguished

### US-5: React integration
**As a** developer,
**I want to** add Peril to my React/Remix app with minimal setup,
**so that** reviewers can start annotating immediately.

**Acceptance criteria:**
- Install one package (`@peril/react`)
- Wrap app in `<ReviewProvider serverUrl="...">`
- Review mode activates via `useReviewMode()` hook or keyboard shortcut
- Overlay mounts client-side only, does not interfere with SSR/hydration
- Works with React 18+ and Remix

---

## Annotation Schema (V1)

```json
{
  "id": "rev_<ulid>",
  "url": "http://localhost:3000/pricing",
  "timestamp": "2026-03-09T21:10:00Z",
  "viewport": { "width": 1440, "height": 900 },
  "status": "open",
  "selection": {
    "boundingBox": { "x": 218, "y": 164, "width": 412, "height": 56 },
    "locators": {
      "testId": "hero-cta",
      "role": { "type": "button", "name": "Start free trial" },
      "css": "[data-testid='hero-cta']",
      "xpath": "//*[@data-testid='hero-cta']",
      "text": "Start free trial"
    },
    "domSnippet": "<button data-testid='hero-cta' class='btn-primary'>Start free trial</button>"
  },
  "comment": {
    "category": "ux-polish",
    "severity": "medium",
    "text": "Button wraps awkwardly at laptop widths.",
    "expected": "Single line, aligned with hero copy baseline"
  },
  "artifacts": {
    "elementScreenshot": "artifact://rev_<ulid>/element.png",
    "pageScreenshot": "artifact://rev_<ulid>/page.png"
  },
  "resolution": null
}
```

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| SDK bundle size | < 50 KB gzipped |
| Overlay render latency | < 16ms (60fps hover highlighting) |
| Annotation capture time | < 500ms from click to persisted |
| MCP response time | < 200ms for list/get operations |
| Framework support (V1) | React 18+, Remix |
| Browser support (V1) | Chrome, Edge, Firefox (latest 2 versions) |
| Storage (V1) | Local file system or SQLite |
| No external dependencies at runtime | SDK must not require network calls beyond the local dev server |

---

## Success Metrics (V1)

1. A reviewer can annotate 10 UI issues in under 5 minutes
2. A coding agent can retrieve and understand all 10 issues without human clarification
3. Zero manual translation step between "human sees problem" and "agent has structured task"
4. Setup takes under 5 minutes for a React app
