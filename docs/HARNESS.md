# Peril Harness

## Purpose

Peril is still early and mostly scaffolded, so the harness should optimize for legibility and drift control rather than heavyweight automation. This document is the repository-level contract for how agents should reason about the codebase and what must stay mechanically enforced.

The goal is simple: make repository knowledge the system of record, then back the highest-value rules with tests.

## Source Of Truth

Read these first before making architectural changes:

1. `AGENTS.md`
2. `docs/PRD.md`
3. `docs/DATA_MODEL.md`
4. `docs/ROADMAP.md`

These files define the current product boundary, package split, and agent-facing contracts.

## Golden Principles

1. Keep `packages/core/` framework-agnostic. React belongs only in `packages/react/`.
2. Preserve the V1 MCP tool contract: `list_reviews`, `get_review`, `get_review_artifact`, `mark_review_resolved`, `update_review_status`.
3. Preserve locator priority in this exact order: `testId`, `role`, `css`, `xpath`, `text` (`testId > role > css > xpath > text`).
4. Treat documentation as executable design. If behavior or contracts change, update docs and tests in the same change.
5. Prefer local, deterministic checks over human memory. If a rule matters repeatedly, promote it into code.

## Mechanical Checks

`pnpm test:harness` currently enforces:

- key reference files listed in `AGENTS.md` exist
- documented package structure matches the workspace packages
- locator priority in docs matches `@peril/core`
- MCP tool names in docs match `@peril/mcp`
- merge-close guidance keeps the custom worktree policy and `pnpm repo:audit` documented

These checks are intentionally narrow. They focus on the contracts agents need to trust while the product is still taking shape.

## Working Loop

For any substantial change:

1. Update the relevant source-of-truth doc first or in the same patch.
2. Implement the code change inside the documented package boundary.
3. Add or update automated checks.
4. Run `pnpm repo:audit -- --base main` when the change affects branch/worktree hygiene.
5. Run `pnpm test`.

## Next Harness Expansions

As the repo grows, add checks for:

- Review schema validation against the documented `Review` interface
- REST route coverage for the documented server API
- MCP integration tests against stored review fixtures
- Architectural boundary checks between packages
