# Peril Docs

This folder materializes the first Peril documentation set referenced in [PER-2](/PER/issues/PER-2).

## Docs

- `PRD.md` -- product requirements, MVP scope, user stories, and acceptance criteria
- `DATA_MODEL.md` -- review schema, REST API, and MCP tool contracts
- `ROADMAP.md` -- phased implementation plan for the V1 MVP
- `HARNESS.md` -- agent-first repository harness and mechanical guardrails
- `product-spec.md` -- product scope, users, workflows, and v1 requirements
- `architecture.md` -- system shape, package boundaries, data model, and integration design
- `delivery-plan.md` -- phased implementation plan, milestones, and decision gates

## Product Summary

Peril is a visual UX review tool that turns human feedback on a live interface into structured, agent-executable tasks.

The product has three layers:

1. In-page review SDK for selecting elements, annotating issues, and capturing artifacts
2. Review backend for normalizing annotations into durable task records
3. Agent bridge for exposing reviews to Claude Code, Codex, and other MCP-compatible agents

## Guiding Decisions

- The capture layer is DOM-first and framework-agnostic
- Stable element identity matters more than any specific annotation widget
- MCP is the long-term primary bridge to coding agents
- Playwright is the authority for reproduction and verification
- Browser-side capture should optimize for speed, while backend capture optimizes for fidelity
- Repository documentation and tests should stay aligned so agents can trust local context
