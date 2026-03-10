# Peril Architecture

## System Shape

Peril is designed as three cooperating layers:

1. In-page review SDK
2. Review backend and artifact pipeline
3. Agent bridge

The system should be framework-agnostic at the core and use thin framework adapters only where mounting and lifecycle differences require them.

## Package Layout

Recommended initial package split:

- `@peril/review-core`
- `@peril/review-react`
- `@peril/review-angular`
- `@peril/review-html`
- `@peril/review-server`
- `@peril/review-mcp`

## Layer Responsibilities

### In-page review SDK

Owns:

- Review mode toggle
- Hover highlighting
- Click-to-select targeting
- Comment composer
- Bounding box capture
- DOM snippet extraction
- Locator generation
- Browser-side artifact capture
- Transport to backend or local storage

The core should talk to the DOM rather than framework internals.

### Review backend

Owns:

- Review persistence
- Artifact storage references
- Annotation normalization
- Acceptance criteria storage
- Search and queueing for open reviews
- Review state transitions

### Agent bridge

Owns:

- MCP tool surface
- Resource access for review payloads and artifacts
- Status updates from agent workflows
- Reproduction helpers backed by Playwright or adjacent browser automation

## Cross-Framework Strategy

### Shared core

These features should remain shared across all adapters:

- Element targeting logic
- Locator generation
- Review schema
- Screenshot orchestration
- rrweb integration
- Backend transport

### Adapter-specific responsibilities

Framework adapters exist only to handle:

- Client-only mounting
- SSR and hydration safety
- Router integration
- Optional framework-specific metadata hooks

## Data Model

### Review entity

Each review record should capture:

- Review id and timestamps
- Route and viewport context
- Scroll position
- Selected element bounds
- Locator bundle
- DOM snippet
- Reviewer comment and expected outcome
- Artifact references
- Optional source-component hints
- Resolution status

### Locator bundle

Locators should be ranked by resilience:

1. `data-review-id`
2. `data-testid`
3. ARIA role plus accessible name
4. CSS selector
5. XPath
6. Text snippet when useful as supplemental context

This ordering aligns with the goal of giving agents stable, user-facing ways to relocate the element.

## Artifact Strategy

Per review, support:

- Element screenshot
- Full-page screenshot
- Optional rrweb replay segment
- Optional authoritative Playwright screenshot generated during reproduction

Use browser-side capture for immediate UX and backend capture for trustworthy verification.

## Agent Integration

### MCP-first mode

Expose tools such as:

- `list_reviews`
- `get_review`
- `get_review_artifacts`
- `reproduce_review_in_browser`
- `mark_review_resolved`

This is the preferred long-term integration path because it lets Peril operate as a first-class tool provider to agents.

### File-queue fallback

For a faster early version, store open review records under a local queue directory and let automation scripts or agent hooks consume them. This is less elegant than MCP but shortens time to first demo.

## Reproduction Layer

Playwright is the system of record for reproduction and verification because it provides:

- Robust locators
- Screenshot APIs
- Accessibility-aware selectors
- Browser automation suitable for post-patch checks

Peril should use Playwright after capture, not replace it.

## Known Technical Risks

### Screenshot fidelity

Browser-side libraries can reconstruct screenshots from the DOM rather than capture exact rendered pixels. That is useful for speed but not enough for final verification.

### Element identity drift

Pure CSS selectors are brittle. The system depends on explicit locator contracts and multiple fallbacks.

### Shadow DOM and portals

Encapsulation helps reduce style collisions for the overlay, but event handling and hit-testing across boundaries need deliberate design.

### Iframes

Same-origin iframe support is feasible. Cross-origin iframe support is a major limitation and should remain out of v1 scope.

### Source-file mapping

Mapping DOM elements back to source files is optional and should rely on dev-only metadata such as:

- `data-source-file`
- `data-component`
- build-time hints injected by tooling

## Recommended Implementation Defaults

- Overlay implementation: standards-based DOM layer, ideally Web Component friendly
- Browser replay capture: `rrweb`
- Authoritative reproduction and verification: `Playwright`
- Initial review transport: backend API, with file-queue mode as a fallback
- Agent bridge: custom MCP server
