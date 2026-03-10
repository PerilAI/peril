# Peril Delivery Plan

## Objective

Ship a first working path from live UI annotation to agent-consumable task, then harden reproduction and verification in follow-on phases.

## Phase 0: Foundation Decisions

Lock the contracts that shape all later work:

- Finalize review JSON schema
- Choose first demo surface and host app
- Decide initial backend stack and artifact storage approach
- Decide whether v1 ships MCP-first or file-queue-first with MCP immediately after
- Standardize element identity conventions such as `data-testid` and `data-review-id`

## Phase 1: Capture MVP

Deliver:

- Review mode overlay
- Hover highlight and click-to-select interaction
- Comment form with category, severity, and expected behavior
- Route, bounds, viewport, and locator capture
- Element and page screenshots
- Persisted review JSON records

Exit criteria:

- A reviewer can create a valid review in a running app
- The stored record contains enough data to relocate the target element later

## Phase 2: Backend and Triage

Deliver:

- Review API and persistence layer
- Artifact reference model
- Open review list for triage
- Basic status transitions for open, in progress, resolved

Exit criteria:

- Multiple reviews can be stored, retrieved, and tracked as a queue
- Artifacts are addressable from the review record

## Phase 3: Agent Bridge

Deliver:

- MCP server with review listing and fetch tools
- Artifact fetch path for screenshots and replay data
- Resolve workflow for closing a review from an agent run

Exit criteria:

- Claude Code or Codex can retrieve a real review without manual copy-paste
- The agent can mark the review resolved after a successful workflow

## Phase 4: Reproduction and Verification

Deliver:

- Playwright-backed reproduction helper
- Review-target relocalization logic
- Before-and-after verification screenshots
- Optional automated post-patch checks

Exit criteria:

- An agent can reproduce a stored review in a browser
- The system can verify the fix against the review context

## Phase 5: Context Depth

Deliver:

- rrweb capture and replay artifact support
- Dev-only source-component metadata
- Better clustering of related review items

Exit criteria:

- Review records preserve enough interaction history to explain complex UI states
- Engineers can optionally trace a review closer to its implementation source

## Recommended First Demo

Use a small but realistic web app with:

- Multiple routes
- A few form and layout states
- Stable test ids on key elements

The point is to demonstrate review capture, agent handoff, and verification, not broad framework coverage on day one.

## Open Decisions

- Whether to prioritize MCP before a triage UI
- Which storage model best fits early artifact management
- How much source metadata to inject in development builds
- Which adapters to ship first after the framework-agnostic core

## Near-Term Priority Order

1. Freeze schema and locator contract
2. Build capture overlay
3. Persist review records
4. Expose reviews to agents
5. Add reproduction and verification
