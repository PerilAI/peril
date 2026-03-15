# AGENTS.md

Peril turns visual UX feedback into structured, agent-executable tasks via MCP. A reviewer selects a UI element in a live app, adds a comment, and a coding agent receives locators, screenshots, and structured context to fix the issue without human re-description.

## Tech Stack

- TypeScript (strict mode)
- pnpm workspaces (monorepo)
- Vite for SDK bundling
- Vitest for tests
- React 18+ for the React adapter
- SQLite or file-based storage for V1

## Package Structure

```
packages/
  core/       # @peril-ai/core -- overlay, capture, locators, serialization (framework-agnostic)
  mcp/        # @peril-ai/mcp -- MCP server wrapping the REST API
  react/      # @peril-ai/react -- ReviewProvider, useReviewMode (thin wrapper over core)
  server/     # @peril-ai/server -- local dev server, REST API, storage, dashboard UI
  site/       # @peril-ai/site -- marketing site (Vite + React + Tailwind)
```

## Setup

```bash
pnpm install
pnpm build          # build all packages
pnpm dev            # start dev server + watch mode
```

## Testing

```bash
pnpm test           # run all tests (Vitest)
pnpm test:harness   # repo-level harness checks for docs and exported contracts
pnpm test:core      # core package only
pnpm test:server    # server package only
pnpm test:mcp       # MCP package only
```

Always run tests after making changes. Write tests for new functionality.

## Git Workflow

- Use a dedicated custom git worktree for each issue or feature branch. Create it in an agent-scoped path such as `$AGENT_HOME/worktrees/peril/<ticket-or-branch>` or a sibling `../peril-worktrees/<ticket-or-branch>` directory. Do not stack unrelated work in the same checkout.
- Do not make changes directly on `main` or `master`. Start from `main` in your custom worktree, then create or switch to a task-specific branch before editing files.
- Name branches with the ticket and intent when possible, for example `feature/per-39-agent-worktrees`, `fix/per-128-overlay-scroll`, or `chore/per-52-docs`.
- Keep commits small and focused. Use conventional commit messages such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, or `chore:`.
- Review your branch before merging: inspect the diff, verify only task-related files changed, and run the relevant test commands.
- Do not reuse another agent's worktree. Each agent should have its own custom worktree path for isolated changes and review.
- When a task is complete, merge the task branch back into `main` and remove its worktree. If the work cannot be merged yet, preserve it on a named recovery branch and say why. Never leave orphaned or abandoned worktrees.
- Hand off with a short summary, review notes, and test results after the merge or documented recovery handoff.

## Merge-Close Checklist

- Run `pnpm repo:audit -- --base main` before merging into `main` or marking a Paperclip issue `done`.
- Confirm every task worktree is either removed after merge, or explicitly preserved on a named recovery branch with a documented reason.
- Fix or remove nested worktrees inside the repository root. Agent worktrees belong under `$AGENT_HOME/worktrees/peril/<ticket-or-branch>` or `../peril-worktrees/<ticket-or-branch>`, not inside tracked directories.
- Review `git branch --no-merged main` and explain any intentional exceptions in your handoff comment.
- Run `pnpm test` after the audit passes or after documenting why a known exception remains open.

## Code Conventions

- Use named exports, not default exports
- Prefer `interface` over `type` for object shapes
- IDs are ULIDs prefixed with `rev_` (e.g., `rev_01HXYZ...`)
- Locator bundle order matters: testId > role > css > xpath > text (most to least resilient)
- Keep the core package framework-agnostic -- no React imports in `packages/core/`
- SDK bundle target: < 50 KB gzipped
- All timestamps are ISO 8601

## Key Reference Files

- `docs/PRD.md` -- product requirements, MVP scope, user stories, acceptance criteria
- `docs/DATA_MODEL.md` -- entity schemas, MCP tool specs, REST API, locator strategy
- `docs/ROADMAP.md` -- 3-phase dev plan, package structure, V2/V3 horizons
- `docs/HARNESS.md` -- repository harness, golden principles, and enforced invariants

Read these before making architectural decisions.

## Storage Layout (V1)

```
.peril/
  reviews/
    rev_<ulid>/
      review.json     # Full Review object
      element.png     # Element screenshot
      page.png        # Page screenshot
  index.json          # Denormalized review index for fast list queries
```

## MCP Tools

The MCP server exposes these tools to coding agents:

- `list_reviews` -- list open review tasks (filterable by status, category, severity, url)
- `get_review` -- get full annotation with locators, DOM snippet, comment, expected outcome
- `get_review_artifact` -- retrieve screenshot or snapshot binary
- `mark_review_resolved` -- close a review task
- `update_review_status` -- transition review status

## REST API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/reviews` | List reviews |
| `GET` | `/api/reviews/:id` | Get review details |
| `GET` | `/api/reviews/:id/artifacts/:type` | Get artifact binary |
| `POST` | `/api/reviews` | Create review (from SDK) |
| `PATCH` | `/api/reviews/:id` | Update review |
| `DELETE` | `/api/reviews/:id` | Delete review |
| `GET` | `/api/health` | Health check |

## Boundaries

**Always:**
- Run `pnpm test` before committing
- Keep `packages/core/` free of framework dependencies
- Use the locator priority order from docs/DATA_MODEL.md
- Validate annotation payloads against the Review interface

**Ask first:**
- Adding new dependencies to any package
- Changing the Review schema or MCP tool signatures
- Modifying storage format or file layout

**Never:**
- Import React (or any framework) in `packages/core/`
- Break the MCP tool contract -- agents depend on stable tool signatures
- Commit Paperclip-managed local state such as `agents/*/memory/`, `agents/*/life/`, `.claude/skills/`, or `.claude/worktrees/`
- Commit screenshots, binary artifacts, or `.peril/` data directories
- Add network calls to external services -- V1 is local-only
