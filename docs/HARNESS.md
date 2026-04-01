# Peril Harness

## Purpose

Peril now ships working `core`, `react`, `server`, `mcp`, and marketing/docs
packages, so the harness should focus on keeping the public contract aligned
with the code that actually ships. This document is the repository-level
contract for how agents should reason about the codebase and what must stay
mechanically enforced.

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
4. Public docs examples must name real exported APIs, real bin entrypoints, and real package names.
5. Treat documentation as executable design. If behavior or contracts change, update docs and tests in the same change.
6. Prefer local, deterministic checks over human memory. If a rule matters repeatedly, promote it into code.

## Mechanical Checks

`pnpm test:harness` currently enforces:

- key reference files listed in `AGENTS.md` exist
- documented package structure matches the workspace packages
- locator priority in docs matches `@peril-ai/core`
- MCP tool names in docs match `@peril-ai/mcp`
- public React, MCP, and REST/API docs reference the APIs and binaries that
  actually exist today
- repo-root MCP configuration exists for local agent workflows
- marketing site install snippets reference the real `@peril-ai/*` package
  namespace
- Paperclip-managed local state stays ignored and untracked (`agents/*/memory/`, `agents/*/life/`, `.claude/skills/`, `.claude/worktrees/`) while agent instruction files stay tracked
- merge-close guidance keeps the custom worktree policy, merge-back-to-`main` requirement, and `pnpm repo:audit` documented

These checks are intentionally narrow. They focus on the contracts agents need to trust while the product is still taking shape.

## Working Loop

For any substantial change:

1. Update the relevant source-of-truth doc first or in the same patch.
2. Implement the code change inside the documented package boundary.
3. Add or update automated checks.
4. Run `pnpm repo:audit -- --base main` before merging or closing a task when the change affects branch/worktree hygiene.
5. Run `pnpm test`.

## Next Harness Expansions

As the repo grows, add checks for:

- Review schema validation against the documented `Review` interface
- runtime checks that the illustrative site demo stays labeled as illustrative
- REST route coverage for the documented server API
- MCP integration tests against stored review fixtures
- Architectural boundary checks between packages
