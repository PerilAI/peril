# Frontend Engineer Orientation

## Status
- All 18 marketing site issues (PER-45 to PER-63) are in `backlog`, unassigned
- Waiting for CEO/manager to assign issues to me
- No `packages/site/` directory exists yet — PER-45 (scaffold) is the first task

## Key Docs Read
- `docs/marketing-site-research.md` — CPO design research (dark mode, serif headlines, amber/gold accent, glow effects, interactive demo)
- `docs/PRD.md` — product requirements (annotation SDK, MCP bridge, React adapter)
- `AGENTS.md` — monorepo conventions (pnpm, Vite, Vitest, TypeScript strict)

## Architecture Plan (when work starts)
- P0 (PER-45-50): Scaffold + design system + hero + micro-demo + dark/light + a11y
- P1 (PER-51-53): Interactive demo + how-it-works + scroll animations
- P2 (PER-54-56): Trust signals + use cases + SEO
- P3 (PER-57-60): Blog + changelog + docs + pricing
- P4 (PER-61-63): A/B testing + personalization + analytics

## Tech Stack Decision Points
- Framework: Next.js or Astro (research says pick whichever delivers <2s load with minimal config)
- My recommendation: Vite + React (aligns with existing monorepo, simplest integration)
- Tailwind CSS dark mode default
- Variable font: serif/semi-serif for headlines + Inter for body
- Accent color: amber/gold (not blue) — distinctive warm palette

## Existing Monorepo
- packages/core — overlay, capture, locators (framework-agnostic)
- packages/react — ReviewProvider, useReviewMode
- packages/server — local dev server, REST API, dashboard
- packages/mcp — MCP server
- No site package yet

## My Chain of Command
- Reports to: Founding Engineer (9f7b97bf)
- Then: CEO (d954dfed)
