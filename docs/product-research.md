# Peril Product Research Report

*Compiled: 2026-03-09 | Research led by CEO, with contributions from CPO*

---

## Executive Summary

Peril occupies genuine whitespace: **no tool today converts visual human feedback into structured, agent-executable tasks via MCP.** Every existing feedback tool (Marker.io, BugHerd, Jam.dev, UserSnap) outputs human-readable tickets. Every existing MCP tool (Playwright, Chrome DevTools, Frontend Review MCP) lacks a human judgment input layer. Peril bridges both sides.

The market timing is right. 91% of engineering orgs have adopted AI coding tools. Gartner predicts 40% of enterprise apps will have task-specific AI agents by 2026. The shift from "developer writes code" to "developer directs agents" is accelerating, and the feedback bottleneck -- non-engineers can see UI problems but can't package them for agents -- is the first pain point every team hits.

Key research findings that should shape our V1:

1. **Visual bug reports resolve 70% faster** than text-only reports (industry data).
2. **Structured problem statements improve agent resolution by 20%** (CodeScout, arXiv:2603.05744).
3. **Context quality matters more than quantity** -- unfiltered context can hurt agent performance (SWE-ContextBench).
4. **97% of MCP tool descriptions have quality issues** -- we have a chance to be best-in-class here.
5. **Composite locator strategies with voting mechanisms** are the most resilient for element re-identification.
6. **Time-to-value under 5 minutes** is table stakes for developer tools (70%+ abandon beyond 20 min).
7. **Hacker News significantly outperforms Product Hunt** for dev tool launches (10-30K visitors vs 800-1K).

---

## 1. Competitive Landscape

### 1.1 Direct Competitors

#### Marker.io
| Dimension | Detail |
|---|---|
| **What it does** | Browser widget for annotating websites with screenshots; auto-captures browser info, console logs, network data. 2-way sync with PM tools (Jira, Trello, Linear, Asana, GitHub). |
| **Pricing** | Starter $39/mo (3 users), Team $149/mo (15 users, session replay + console/network), Business $499/mo (50 users). |
| **Scale** | ~$492K ARR, ~1,500 customers. Bootstrapped 13+ years. |
| **AI features** | AI Translation (200+ languages), AI Title Generation, AI Feedback Structuring. Beta, free for all. |
| **Agent integrations** | None. Output is human-readable PM tickets. No MCP, no agent handoff. |
| **Key gap** | No machine-readable output, no element locator bundles, no agent bridge. Built for human-to-human workflows. |

#### BugHerd
| Dimension | Detail |
|---|---|
| **What it does** | Pins comments to exact DOM elements via CSS selector. Auto-captures browser, OS, screen, console logs. Built-in Kanban. Integrations with GitHub, Jira, Trello, etc. |
| **Pricing** | $39-42/mo for up to 5 members. Unlimited projects/guests/integrations. |
| **Scale** | ~6 employees. Parent renamed to Splitrock Studio (mid-2025). Self-described "startup that refuses to die." |
| **Agent integrations** | None. |
| **Key gap** | Single-strategy selector pinning (no multi-locator bundles). No agent output. No MCP. Shallow capture vs. Peril's DOM snapshots + rrweb. |

#### Jam.dev
| Dimension | Detail |
|---|---|
| **What it does** | Browser extension for 1-click bug reporting. Screen recording + screenshots with auto-captured console, network, user actions, browser details, reproduction steps. |
| **Pricing** | Free tier (5-min recording limit), paid ~$14/user/month. |
| **Funding** | $8.9M Series A (Sep 2024) led by GGV Capital, with Figma and founders of Vercel and Mixpanel. |
| **AI features** | "Jam AI" auto-writes 27% of tickets. Featured at OpenAI DevDay 2025. |
| **Agent integrations** | No MCP. No structured agent output. Developer-to-developer positioning. |
| **Key gap** | Closest competitor in "developer-adjacent AI" but output is still human-readable. If Jam adds MCP output, they become direct competition. **Watch closely.** |

#### UserSnap
| Dimension | Detail |
|---|---|
| **What it does** | Screenshot/screen recording widgets, annotation tools, voice recording. AI categorization, project summaries, feedback replies. |
| **Pricing** | Free plan. Micro $29/mo, Startup $79/mo, Company $249/mo. Per-seat pricing scales steeply at enterprise. |
| **Enterprise customers** | Red Hat, Lego, Erste Bank, Harvard. |
| **Agent integrations** | None. 50+ integrations focused on PM/support tools. |
| **Key gap** | Enterprise-heavy, expensive. Positioned for product feedback (NPS, CSAT), not agent-native development. |

#### Zipy
| Dimension | Detail |
|---|---|
| **What it does** | Session replay, error monitoring, performance monitoring, product analytics. "Oopsie AI" watches sessions and detects frustration/errors in real-time. |
| **Pricing** | Free plan (1,000 sessions). Claims 80% savings vs. Datadog. |
| **Agent integrations** | None. Positioned as observability/analytics. |
| **Key gap** | More Datadog/LogRocket than feedback tool. Different category, some overlap in "seeing what went wrong." |

#### Bird Eats Bug
| Dimension | Detail |
|---|---|
| **What it does** | Browser extension for screen recording with auto-captured console, click events, network logs, URL changes. |
| **Pricing** | ~$8-15/user/month. |
| **Agent integrations** | None. Standard PM tool integrations. |
| **Key gap** | Small player, undifferentiated. No AI features, no agent integration. |

#### Gleap (emerging)
| Dimension | Detail |
|---|---|
| **What it does** | All-in-one: visual bug reporting, session replay, AI-powered support (Kai bot on GPT-4 Turbo), product roadmaps, marketing automation. |
| **Agent integrations** | None, but AI integration suggests awareness of AI-first direction. |
| **Key gap** | Moving toward "AI customer support" not "AI coding agent feedback." Different vector. |

### 1.2 Adjacent Tools Becoming Competitors

#### Playwright MCP
- Microsoft's MCP server for LLM-controlled browser automation. Uses accessibility tree (not screenshots) for deterministic control.
- **Threat level: Low (complementary).** Playwright is the "hands" -- it interacts with browsers. Peril is the "eyes and judgment" -- it tells agents what to fix and why. Peril's verification loop already uses Playwright.

#### Figma MCP Server
- GA since 2025. Transforms Figma designs into machine-readable infrastructure for AI coding assistants.
- **Threat level: Low (complementary).** Figma MCP addresses "does the build match the design?" (design intent). Peril addresses "does the live build match what I expect?" (implementation reality). Figma for intent, Peril for verification.

#### Frontend Review MCP (zue.ai)
- MCP server that compares before/after screenshots of agent UI edits using vision models.
- **Threat level: Medium.** Validates the market wants MCP-native visual review. But it only does agent self-review, not human-sourced feedback. Peril does both. This is our verification loop's competition.

#### Chrome DevTools MCP (Google)
- Full Chrome DevTools access for agents -- network, console, screenshots, performance traces.
- **Threat level: Low (infrastructure).** Raw browser context, no structured feedback. Infrastructure Peril could leverage.

#### Cursor Visual Editor (Cursor 2.2)
- Unified workspace with live preview, drag-and-drop DOM manipulation, design sidebar.
- **Threat level: Low.** Developer-only tool. Does not solve the cross-role feedback problem (PM/designer/QA to agent). Peril's value proposition holds.

#### Webvizio
- Captures DOM, screenshots, console logs, network requests for AI agent consumption. MCP integration with Cursor.
- **Threat level: Medium-High.** Most AI-forward existing competitor. Bundles technical data into agent prompts. Worth monitoring as they expand agent integrations.

#### Agentation
- Annotation tool generating frontend UI context for AI assistants. Click-to-annotate with structured Markdown output for Claude Code, Cursor, Windsurf.
- **Threat level: Medium.** Direct overlap with Peril's annotation-to-agent pipeline. Narrower scope (no review queue, no backend, no MCP server), but validates the core concept.

### 1.3 How AI Coding Agents Handle Visual Input Today

| Agent | Visual Input | Limitations |
|---|---|---|
| **Claude Code** | Paste images, drag-drop files, reference paths. Screenshot MCP servers available. | No structured feedback intake from non-engineers. Screenshots are ad hoc, unstructured. |
| **OpenAI Codex** | Attach images in CLI. Cloud Codex screenshots its own work, attaches to PRs. | Self-review only. No external feedback capture. |
| **Cursor** | Visual editor with live preview. Compare to design files. | Developer-only tool. No non-engineer feedback path. |

**Gap:** All agents can receive visual input, but none have a structured pipeline for non-engineers to provide visual feedback that agents can systematically process. This is precisely Peril's opportunity.

### 1.4 Market Data

**Adoption:**
- 91% of engineering organizations have adopted at least one AI coding tool.
- Gartner: 40% of enterprise apps will have task-specific AI agents by 2026 (up from <5% in 2025).
- Anthropic's 2026 Agentic Coding Trends Report: engineering roles shifting from "hands-on implementation" to "agent direction and review."

**Market Size:**

| Segment | 2025 Value | Projected Growth |
|---|---|---|
| Software Dev Tools | $6.4-7.5B | $7.4-8.8B in 2026 |
| AI Developer Tools | $4.5B | $10B by 2030 (17.3% CAGR) |
| Software Testing | $55-60B | $112.5B by 2034 (7.2% CAGR) |
| AI Design Tools | $5.6B (2024) | $19.5B by 2032 (16.8% CAGR) |

**Recent Funding/M&A:**

| Event | Details |
|---|---|
| Jam.dev Series A | $8.9M from GGV Capital + Figma (Sep 2024) |
| Miro acquires Uizard | AI design tool, ~$3.5M ARR, 3M+ users (May 2024) |
| Google acqui-hires Windsurf | $2.4B licensing deal (2025) |
| Arcade AI seed | $12M for MCP tool platform |
| Traditional feedback tools | Marker.io bootstrapped (~$492K ARR), BugHerd indie (~6 people). Stagnant market disrupted by AI wave. |

---

## 2. UX Research & Best Practices

### 2.1 The Feedback Bottleneck (Validated)

The core problem Peril solves is well-documented in research:

- **Bugs reported visually resolve up to 70% faster** than text-only reports. Screenshots with environment details cut investigation time by 50-70%.
- Non-technical users report bugs chaotically. Support teams act as expensive intermediaries translating complaints into actionable reports.
- Eye-tracking research confirms annotated screenshots reduce errors compared to text-only instructions.
- Vague feedback ("it looks wrong") creates back-and-forth cycles. Point-and-click tools eliminate this.

**Implication for Peril:** Our value proposition is empirically supported. The key is making the "point and annotate" workflow as frictionless as possible.

### 2.2 Element Selection UX

Best practice: **mirror Chrome DevTools Inspect Mode.**

- Hover to highlight with subtle semi-transparent overlay
- Click to select, showing element bounding box and info tooltip
- Show DOM ancestry breadcrumb on hover
- Synchronize hover across related elements

**Accessibility:** Hover states are always ancillary; focus states are essential. The review overlay must be keyboard-navigable and inert to assistive technology (`aria-hidden="true"` on overlay, `inert` on underlying content).

### 2.3 Overlay Architecture

- **React Portals** at end of `<body>` with `position: fixed`
- `isolation: isolate` on app root for z-index management
- ESC dismisses overlays; focus transfers to overlay on open
- Disable keyboard shortcuts during text input in annotation composer
- Events bubble through React tree (not DOM tree) -- important for click-away behavior

### 2.4 Complex DOM Challenges

| Challenge | Solution |
|---|---|
| **Shadow DOM** | `event.composedPath()` for selection; Playwright-style piercing selectors for identification. Closed shadow DOM remains unsolvable for external tools. |
| **Iframes** | Own execution context; require explicit frame switching. Playwright `page.frameLocator()` pattern. |
| **Canvas** | No accessible DOM subtree; requires screenshot-based approach or OCR. |

### 2.5 Locator Strategy (Critical Differentiator)

Playwright's recommended hierarchy, from most to least resilient:

| Priority | Strategy | Resilience | Notes |
|---|---|---|---|
| 1 | `getByRole()` (ARIA) | High | Survives layout shifts and class changes |
| 2 | `getByLabel()` | High | User-facing, tied to form semantics |
| 3 | `getByText()` | Medium-High | Breaks with copy changes |
| 4 | `getByTestId()` | Very High (stability) | Requires developer support to add |
| 5 | CSS selector | Low | Breaks with styling changes |
| 6 | XPath | Very Low | Breaks with any DOM restructuring |

**Academic research supports composite strategies:** Multi-Locator (LML) uses results from several locators with a voting procedure, improving accuracy across website evolution (ACM TOSEM).

**Recommended for Peril:** Combine all strategies and use voting-based re-identification. This is a genuine differentiator -- no competitor does multi-locator bundles.

### 2.6 Agent-Friendly Task Formats

Research shows AI agents need **comprehensive but focused** context:

| Context Type | What to Include |
|---|---|
| **Visual** | Annotated screenshot, element bounding box, expected vs actual |
| **DOM** | Selector bundle, tag/attributes/text, computed styles, parent chain |
| **Runtime** | Console errors, network issues |
| **Environment** | Browser, OS, viewport, URL |
| **Source** | File path, component name, line number (when available) |
| **Reproduction** | Steps to reproduce, user action breadcrumb |

**Key insight from CodeScout (arXiv:2603.05744):** Structured pre-analysis of problem statements improves agent resolution by 20%. This directly validates Peril's approach of converting visual feedback into structured tasks.

**Key insight from SWE-ContextBench (arXiv:2602.08316):** Context quality > quantity. Unfiltered context can hurt performance. Peril should summarize and focus context per issue, not dump raw data.

### 2.7 User Journey Analysis (CPO)

The ideal reviewer journey has five stages. Peril must nail the first three in V1.

| Stage | Action | Time Target | Friction Risk |
|---|---|---|---|
| **Activation** | Toggle review mode | < 1 sec | Discoverability -- reviewer must know the shortcut or see the button |
| **Selection** | Hover, highlight, click element | < 3 sec | Precision -- small elements, nested containers, overlapping layers |
| **Annotation** | Write comment, pick category/severity | < 30 sec | Cognitive load -- too many fields kills speed |
| **Submission** | Hit submit, see confirmation | < 1 sec | Trust -- reviewer needs to know it "went somewhere" |
| **Closure** | See resolved status in queue | Async | Feedback loop -- reviewer needs visibility that their input mattered |

**Competing tool friction points:**
- **Marker.io:** Clients must log into a separate platform to view/track feedback. Breaks the "stay in the app" promise.
- **BugHerd:** Pin-based targeting uses coordinates, not element identity. Pins drift when layouts change.
- **Jam.dev:** Optimized for developer-to-developer. Non-engineers find console/network log emphasis intimidating.
- **Manual screenshot + prompt:** Works for one bug. Falls apart at batch scale (10+ issues from a design review session).

**Critical insight:** The highest-value moment is the 30-second window between "I see a problem" and "I've reported it." Every extra click, field, or decision in that window loses annotations. Marker.io and BugHerd sacrifice speed for completeness. Peril should do the opposite -- capture fast, enrich automatically.

### 2.8 UX Pattern Recommendations (CPO)

**Adopt:**
1. **Chrome DevTools-style inspect mode.** Hover highlighting with element bounds + tooltip showing tag/class/testId. Universally understood interaction pattern.
2. **Minimal composer with smart defaults.** Three required inputs: comment text, category (5 options), severity (4 options). "Expected outcome" optional but encouraged with placeholder text.
3. **Inline confirmation toast.** After submission, brief toast anchored to selected element for 2 seconds. No modal, no page navigation. Reviewer stays in flow.
4. **Persistent floating badge.** When review mode is active, show annotation count in session. Acts as running tally and "exit review mode" affordance.
5. **Keyboard-first shortcuts.** `Cmd/Ctrl+Shift+R` toggle, `Escape` deselect, `Tab` through fields, `Cmd/Ctrl+Enter` submit.

**Avoid:**
1. **Sidebar panels.** BugHerd and Marker.io sidebars eat 300+ pixels of viewport width, distorting the layout being reviewed. Use overlay/modal approach.
2. **Drag-to-highlight regions.** Coordinate-based annotations break on responsive layouts and are useless to agents. Stick with element-level selection.
3. **Multi-step wizards.** One screen, one submit. Single panel on element click, dismiss on submit or escape.
4. **Forced authentication.** V1 is local-first. No login, no accounts. `reviewerName` auto-filled from localStorage preference.

### 2.9 Non-Engineer Usability Principles (CPO)

1. **Zero-jargon UI.** No "DOM," "locators," or "selectors" in user-facing surfaces. Structured data captured silently.
2. **Progressive disclosure.** Default: comment, category, severity. Advanced fields behind "More details" toggle.
3. **Visual-first feedback.** Element screenshot appears in composer as selection confirmation. Critical for non-technical reviewers unsure they "clicked the right thing."
4. **No installation for reviewers.** SDK embedded by developer. No extension, no app, no account.
5. **Error prevention over error messages.** Click on whitespace? Expand to nearest container. Server unreachable? Queue locally. Never lose reviewer work.
6. **Plain language categories.** UI shows "Something is broken" / "This doesn't look right" / "Hard to use or read" / "The text needs changing" / "This is confusing." Schema stores technical values.
7. **One-action onboarding.** First review mode activation: 3-second overlay "Click any element to report an issue." Auto-dismisses.

---

## 3. Product Guidelines

### 3.1 Developer Experience

**Time-to-value target: under 5 minutes.**

```
npm install @peril-ai/react
```
```jsx
// Add to app root
import { ReviewProvider } from '@peril-ai/react';

<ReviewProvider serverUrl="http://localhost:4400">
  <App />
</ReviewProvider>
```

That's it. Floating button appears. Click to annotate. Done.

**Three DX dimensions to optimize:**
1. **Feedback loops** -- instant visual confirmation when annotation is captured
2. **Cognitive load** -- no config, no accounts, no setup beyond the import
3. **Flow state** -- works in the browser where reviewers already are

### 3.2 SDK Architecture

```
@peril-ai/core       -- framework-agnostic capture engine (zero-dep, <15KB gzipped)
@peril-ai/react      -- React bindings (hooks, components, portal overlay)
@peril-ai/server     -- local dev server (stores annotations, serves artifacts)
@peril-ai/mcp        -- MCP server (exposes reviews to agents)
```

**Design rules:**
- ESM-first, tree-shakeable, `"sideEffects": false`
- Core is zero-dependency
- Framework adapters import from core, never the reverse
- Async-load heavy features (screenshot capture, annotation UI) on demand
- TypeScript-first with full type definitions

### 3.3 Review Mode Activation (Multiple Methods)

| Method | Default | Use Case |
|---|---|---|
| **Floating button** | Yes (configurable position/visibility) | Always visible, discoverable |
| **Keyboard shortcut** | Ctrl+Shift+P (configurable) | Power users, no visual clutter |
| **SDK method** | `peril.activate()` | Programmatic control, CI/CD |
| **URL parameter** | `?peril=review` | Shareable review links |

### 3.4 Annotation Composer

**Popover-first** for quick annotations near the selected element. Option to expand to sidebar for threaded discussions. Avoid modals except for final submission review.

Best practices:
- Light dismiss (click outside to close)
- Keyboard navigation (Tab, Escape)
- `aria-haspopup` and `aria-expanded` attributes
- Focus management: move into composer on open, return on close

### 3.5 Screenshot Capture

| Method | Speed | Accuracy | Size | Recommended Use |
|---|---|---|---|---|
| **SnapDOM / html-to-image** | Fast | High | ~8-15KB | Primary: in-browser DOM capture |
| **html2canvas** | Slow | Moderate | ~40KB | Fallback: older browsers |
| **Native getDisplayMedia** | Instant | Perfect | 0KB | Optional: pixel-perfect with permission |
| **Puppeteer/Playwright** | Server | Perfect | 0KB client | Automated/CI captures |

### 3.6 MCP Server Design

**Principles:**
- **Workflow-based tools** over API mirrors: `create_review` (not 4 separate calls)
- **Progressive disclosure**: categorize tools, reveal on demand
- **Structured output**: `outputSchema` + `structuredContent` (June 2025 spec)
- **Safety annotations**: `readOnlyHint`, `destructiveHint`, `idempotentHint` on every tool
- **Actionable errors**: "No reviews found for URL /pricing. Try list_reviews without URL filter." not "404"
- **Short names**: `list_reviews`, `get_review`, `mark_resolved`
- **Pagination**: cursor-based for list operations

**Tool surface:**

| Tool | Type | Description |
|---|---|---|
| `list_reviews` | read-only | List open visual reviews, optionally filtered by status/page |
| `get_review` | read-only | Full review details including locator bundle, DOM, screenshots |
| `get_review_artifact` | read-only | Retrieve a specific artifact (screenshot, DOM snapshot) |
| `mark_review_resolved` | destructive | Close a review with optional resolution comment |
| `get_page_context` | read-only | Technical metadata for current page |

### 3.7 Monetization Strategy

**Open Core model:**
- **Free/OSS (MIT):** `@peril-ai/core`, `@peril-ai/react`, `@peril-ai/server`, `@peril-ai/mcp`
- **Paid:** Cloud dashboard, team collaboration, analytics, SSO, audit logs

**Growth sequence:**
1. **PLG first** -- self-serve, generous free tier, exceptional docs
2. **Community-led** -- Discord, GitHub, technical content, let users become advocates
3. **Sales-led (later)** -- only when enterprise inbound demand warrants it

PLG companies grow 30-40% faster with 50-70% lower CAC than sales-led.

### 3.8 Launch Strategy

**Primary channels:**
- **Hacker News** (spike): 10-30K visitors, 80-90% developers, 1.5-2.5% conversion
- **GitHub** (compounding): stars as validation metric, contributor flywheel
- **Discord** (community): post-launch engagement, support, feedback loop
- **Dev.to / technical blog** (content): evergreen reference material, SEO

**Formula:** 2 spike channels (HN + Product Hunt) + 2 compounding channels (GitHub + blog) + 1 consistent community (Discord).

GitHub stars are the critical validation metric for open source developer tools.

---

## 4. Strategic Recommendations

### 4.1 Where to Double Down (Differentiators)

1. **Multi-strategy locator bundles.** No competitor does this. Composite locators with voting-based re-identification is a genuine technical moat.

2. **Agent-native task format.** Every competitor outputs human-readable tickets. Peril outputs machine-executable tasks. This is the category-defining difference.

3. **MCP-first architecture.** Being MCP-native is now expected, but being *best-in-class* at MCP tool design (structured output, safety annotations, actionable errors) is rare.

4. **Non-engineer accessibility.** Point-and-click feedback from anyone with a browser. No IDE, no prompt engineering, no technical skill required.

### 4.2 What to Watch

1. **Jam.dev.** $8.9M funded, Figma as investor, OpenAI DevDay presence. If they add MCP output or structured agent tasks, they become direct competition.

2. **Webvizio.** Already bundling technical data for AI agents. Already has Cursor MCP integration. Could expand to full review workflow.

3. **Chrome DevTools MCP ecosystem.** Google's MCP server + Playwright MCP + Figma MCP create a "standard toolchain" that Peril needs to integrate with, not compete against.

### 4.3 What Not to Build (V1)

- Enterprise PM integrations (Jira, Linear) as primary workflow -- the agent is the consumer, not the ticket system
- Cloud dashboard before the local experience is excellent
- Angular/Vue adapters before React is rock-solid
- Session replay (rrweb) before the core capture + annotate + MCP loop works end-to-end

### 4.4 Feature Prioritization (CPO)

**Table stakes (must ship V1):** Hover highlight + click select, comment with category/severity, element + page screenshots, local server REST API, basic review list dashboard, MCP server with list/get/resolve.

**Differentiators (why choose Peril):** Multi-strategy locator bundle (no competitor does this), DOM snippet capture, agent-native MCP bridge (first-mover), batch review queue to agent processing, zero-config for reviewers.

**Nice-to-have (cut without guilt):** Keyboard shortcuts, smooth highlight animations, dashboard filters/search, configurable severity levels, full-page screenshot.

**Explicit V1 cuts:** rrweb replay, Playwright verification loop, Angular/plain HTML adapters, source-file mapping, cloud/hosted features.

### 4.5 Positioning

**Category:** Agent-native UI review

**One-liner:** Peril makes human judgment a first-class input to agentic development -- point at what's wrong, and the agent fixes it.

**Key differentiator vs. every competitor:** Peril is the only tool where the output consumer is a coding agent, not a human developer reading a ticket. Every other tool in this space was built for the pre-agent world.

**ICP-specific messaging (CPO):**
- **Engineering leads:** "Stop translating designer feedback into agent tasks. Peril does it automatically."
- **PMs/designers:** "See a bug? Point at it. The agent handles the rest."
- **Founders:** "Your design review sessions now produce agent-executable task queues, not Slack threads."

**Cut from positioning:** De-emphasize rrweb in V1 messaging (V2 feature, muddies simplicity). Don't lead with "framework-agnostic" (users care about "works with my React app"). Don't compete on "richer bug reports" (Jam.dev owns that).

### 4.6 V1 Success Criteria (CPO)

Peril's V1 success depends on three things:
1. **Annotation speed** -- 10+ issues captured in a session without fatigue
2. **Structured richness** -- agents need zero human clarification
3. **Timing** -- first agent-native review tool as MCP hits mainstream

Cut everything that doesn't serve these three goals.

---

## Sources

### Academic Papers
- CodeScout: Contextual Problem Statement Enhancement (arXiv:2603.05744)
- SWE-ContextBench: Context Learning in Coding (arXiv:2602.08316)
- Codified Context: Infrastructure for AI Agents (arXiv:2602.20478)
- MCP Tool Description Quality (arXiv:2602.14878)
- Multi-Locator / LML (ACM TOSEM, doi:10.1145/3571855)
- Robula+: Robust XPath Locators (ResearchGate)
- Visual Signaling in Screenshots: Eye Tracking Study (ResearchGate)

### Industry Research
- Anthropic: 2026 Agentic Coding Trends Report
- Gartner: AI Agent Predictions 2026
- Nielsen Norman Group: 10 Usability Heuristics
- Baymard Institute: Hover UX and Hit-Areas
- Forrester: Test Script Fragility Economics
- Ink & Switch: Local-First Software
- Scale AI: SWE-Bench Pro Findings

### Technical References
- Playwright Docs: Locators and Best Practices
- Cypress: Best Practices
- MCP Specification (2025-11-25)
- Chrome DevTools MCP
- Arcade.dev: 54 MCP Tool Patterns
- Phil Schmid: MCP Best Practices
- The New Stack: 15 Best Practices for MCP Servers

### Competitive Intelligence
- Marker.io (marker.io), BugHerd (bugherd.com), Jam.dev (jam.dev), UserSnap (usersnap.com)
- Zipy (zipy.ai), Bird Eats Bug (birdeatsbug.com), Gleap (gleap.io)
- Webvizio (webvizio.com), Agentation (agentation.com)
- Frontend Review MCP (github.com/zueai/frontend-review-mcp)

### Go-to-Market References
- Draft.dev: PLG for Developer Tools
- Reo.dev: How DX Powered Vercel's $200M+ Growth
- Medium: Lessons Launching on HN vs Product Hunt
- Decibel VC: Developer Marketing Playbook

---

*Detailed supporting research available in:*
- `docs/ux-research.md` -- full UX research with citations
- `docs/product-guidelines-research.md` -- full product guidelines with citations
- CPO contribution (PER-37) -- integrated into sections 2.7-2.9, 4.4-4.6
