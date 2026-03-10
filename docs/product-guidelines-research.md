# Product Guidelines & Design Patterns Research

> Compiled 2026-03-09. Web-sourced research on developer tools, visual feedback UX, MCP ecosystem, and launch strategies.

---

## 1. Developer Tool Product Best Practices

### 1.1 What Makes Developer Tools Succeed

**Three Core DX Dimensions** (per [DX research](https://getdx.com/blog/developer-experience/)):
1. **Feedback loops** -- How quickly developers learn if something works. Real-time or near-real-time feedback mechanisms; instant previews and live updates.
2. **Cognitive load** -- Mental effort required for basic tasks. Reduce friction, remove boilerplate, make the "happy path" obvious.
3. **Flow state** -- Ability to work without interruption. Minimize context switching; keep developers in their existing tools (IDE, terminal, browser).

**Time-to-Value is Everything:**
- More than 70% of users abandon onboarding if it takes longer than 20 minutes ([GUIDEcx](https://www.guidecx.com/blog/customer-onboarding-accelerate-time-to-first-value/)).
- Value-first approach: get users to experience core benefit within minutes, not hours.
- Teams automating setup see new developers merge code by day 3-5 vs. week 2-3 for manual setup.
- One command that provisions the environment, installs dependencies, configures tools, and verifies success (e.g., `npx create-peril-app`).

**Key Patterns:**
- Documentation must be easy to navigate, accurate, aligned with latest versions, with practical examples ([Cortex](https://www.cortex.io/post/developer-onboarding-guide)).
- Role-based onboarding journeys: developers get API docs, designers get visual guides, PMs get dashboard overview.
- Each one-point gain in DXI score correlates to 13 minutes/week of developer time saved.
- Pre-configured environments (Stripe ships pre-configured laptops; GitLab creates onboarding issues before start date).

**Sources:**
- [GetDX: Developer Experience Guide](https://getdx.com/blog/developer-experience/)
- [Jellyfish: 14 Best DevEx Tools](https://jellyfish.co/blog/best-developer-experience-tools/)
- [Common Room: Ultimate Guide to DX](https://www.commonroom.io/resources/ultimate-guide-to-developer-experience/)
- [Cortex: Developer Onboarding Guide](https://www.cortex.io/post/developer-onboarding-guide)

---

### 1.2 SDK Design Best Practices

**Bundle Size & Tree-Shaking:**
- Use ESM (ES6 module) format -- easily tree-shaken by modern bundlers (Vite, Webpack). Non-ESM is very hard to tree-shake.
- Declare `"sideEffects": false` in package.json so bundlers can safely eliminate unused exports.
- Opt-in features: users must explicitly import and register features rather than getting everything by default (Sentry SDK pattern).
- Code splitting: break monolithic bundle into smaller chunks; load only what users need for the current page.
- Compression: gzip/brotli for production builds.

**Framework Adapter Pattern:**
```
@peril/core       -- framework-agnostic capture engine (smallest possible)
@peril/react      -- React bindings (hooks, components)
@peril/vue        -- Vue bindings (future)
@peril/vanilla    -- Vanilla JS adapter (future)
```

**Key SDK Design Rules:**
1. Core package must be zero-dependency or near-zero-dependency.
2. Framework adapters import from core; never the reverse.
3. Every public export must be individually importable (tree-shakeable).
4. Async loading for heavy features (screenshot capture, annotation UI).
5. TypeScript-first with full type definitions.

**Sources:**
- [DEV Community: Reduce JavaScript Bundle Size 2025](https://dev.to/frontendtoolstech/how-to-reduce-javascript-bundle-size-in-2025-2n77)
- [Sentry: Tree Shaking Guide](https://docs.sentry.io/platforms/javascript/configuration/tree-shaking/)
- [Smashing Magazine: Tree-Shaking Reference Guide](https://www.smashingmagazine.com/2021/05/tree-shaking-reference-guide/)
- [Sentry: Bundle Size Development Docs](https://develop.sentry.dev/sdk/platform-specifics/javascript-sdks/bundle-size/)

---

### 1.3 Local-First vs Cloud-First Strategies

| Dimension | Local-First | Cloud-First | Hybrid (Recommended for Peril) |
|-----------|-------------|-------------|-------------------------------|
| Performance | Immediate feedback, no network latency | Depends on connection quality | Local capture + cloud sync |
| Offline | Full functionality offline | Breaks without connection | Capture offline, sync when online |
| Data control | User owns all data | Vendor controls data | Local storage + opt-in cloud |
| Complexity | CRDTs, sync, conflict resolution | Standard client-server | Progressive: local first, cloud features layered |
| Privacy | Data stays on device | Data on vendor servers | User chooses |
| Cost | No server costs for basic use | Server costs from day 1 | Server costs only for cloud features |

**For Peril specifically:**
- Capture + annotation should work fully locally (zero network dependency).
- MCP server runs locally alongside the dev's existing tools.
- Cloud sync is an optional upgrade for team collaboration, dashboards, history.
- This matches the "local-first with cloud-optional" pattern from [Ink & Switch](https://www.inkandswitch.com/essay/local-first/).

**Sources:**
- [Heavybit: Local-First Development](https://www.heavybit.com/library/article/local-first-development)
- [Ink & Switch: Local-First Software](https://www.inkandswitch.com/essay/local-first/)
- [Connecter: Local-First vs Cloud-First 2025](https://blog.connecterapp.com/local-first-vs-cloud-first-2025-update-458f37718147)
- [The New Stack: Local or Cloud Dev Environments](https://thenewstack.io/local-or-cloud-choosing-the-right-dev-environment/)

---

### 1.4 Open Source vs Commercial Strategies

**Dominant Model: Open Core**
- Core SDK and capture engine = open source (MIT or Apache 2.0).
- Premium features (team dashboards, analytics, SSO, audit logs) = commercial.
- GitLab exemplifies: core repo management is OSS; enterprise security/governance is paid.

**Monetization Approaches Ranked by Fit for Peril:**

| Model | Description | Fit |
|-------|-------------|-----|
| Open Core | Free core SDK + paid cloud/team features | Best fit |
| Managed Service | Hosted version with ops handled | Good add-on |
| Usage-Based | Pay per capture/review volume | Good for scale |
| Support/SLA | Enterprise support tiers | Enterprise add-on |
| Dual License | OSS for individuals, commercial for enterprises | Moderate fit |

**Key Tensions:**
- Too much monetization alienates community; too little kills the business.
- For dev tools, user (developer) and buyer (manager) may differ -- monetization must target the buyer.
- Usage-based pricing is now the most common (2026), but 70% say AI delivery costs undermine profitability.

**Recommended for Peril:**
- Open source the core SDK (@peril/core, @peril/react) under MIT.
- Commercial: cloud dashboard, team features, MCP marketplace integrations.
- Free tier generous enough to build community; paid tier targets team leads/managers.

**Sources:**
- [Reo.dev: Monetize Open Source Software](https://www.reo.dev/blog/monetize-open-source-software)
- [Work-Bench: Open Source Monetization Playbook](https://www.work-bench.com/playbooks/open-source-playbook-proven-monetization-strategies)
- [Evil Martians: OSS to Profitable Business](https://evilmartians.com/chronicles/how-to-turn-an-open-source-project-into-a-profitable-business)
- [Revenera: Software Monetization 2026 Outlook](https://www.revenera.com/blog/software-monetization/software-monetization-models-strategies/)

---

## 2. Visual Feedback Tool UX Patterns

### 2.1 Common Patterns Across Marker.io, BugHerd, UserSnap

**What All Three Do Similarly:**
1. **Overlay widget** -- A floating element injected into the target website that serves as the entry point for feedback.
2. **Automatic screenshot capture** -- All three capture a screenshot of the current page state when feedback is initiated.
3. **Annotation tools** -- Drawing, highlighting, and commenting directly on the captured screenshot or live page.
4. **Automatic technical metadata** -- Browser, OS, screen size, URL, and console errors captured without user action.
5. **Project management integration** -- All send feedback to Jira, Trello, Asana, Linear, or similar tools.
6. **No-account guest access** -- Non-technical stakeholders can leave feedback without creating an account.

**Where They Differ:**

| Feature | Marker.io | BugHerd | UserSnap |
|---------|-----------|---------|----------|
| Primary activation | Floating widget button | Browser extension + JS embed | Floating widget button |
| Annotation approach | Screenshot + annotation tools | Pin comments on live DOM elements | Screenshot + 5 annotation tools |
| Element targeting | Screenshot-based | CSS selector pinning to DOM elements | Screenshot-based |
| Unique strength | 2-way sync with PM tools (resolved status flows back) | Kanban board built in; pins on exact DOM element | End-user feedback focus; NPS/surveys |
| Pricing | $39-79/mo, unlimited reporters | Per-project pricing | Tiered per feedback volume |
| Distribution | JS snippet or npm package | Browser extension or JS snippet | JS snippet |

**Sources:**
- [Marker.io: Usersnap vs BugHerd vs Marker.io](https://marker.io/blog/usersnap-vs-bugherd-vs-markerio)
- [Feedbucket: Tool Comparison](https://www.feedbucket.app/blog/usersnap-vs-bugherd-vs-marker-io/)
- [BugHerd: Marker Alternative](https://bugherd.com/cp/marker-alternative)
- [Marker.io: Features & Product Tour](https://marker.io/features)

---

### 2.2 Review Mode Activation Patterns

| Pattern | Description | Pros | Cons | Used By |
|---------|-------------|------|------|---------|
| **Floating button (FAB)** | Persistent circular button in corner | Always visible, discoverable, mobile-friendly | Can obstruct content; must handle z-index conflicts | Marker.io, UserSnap, Feedbackfun |
| **Keyboard shortcut** | e.g., Ctrl+Shift+C | Fast for power users; no visual clutter | Undiscoverable; conflicts with browser/OS shortcuts | Feedbackfun (Ctrl+Shift+C) |
| **Alt+double-click** | Modifier key + click on element | Contextual; targets specific element | Hard to discover; accessibility concerns | Feedbackfun |
| **Browser extension** | Chrome/Firefox extension icon | Full browser access; cross-site; no code changes | Requires installation; limits distribution | BugHerd |
| **URL parameter** | `?peril=review` activates review mode | Shareable; no install; environment-specific | URL visible to users; easy to accidentally activate | Marker.io (for guest access) |
| **SDK method call** | `peril.activate()` from console or code | Full programmatic control; testable | Requires developer intervention | Marker.io SDK |

**Recommended for Peril:** Multiple activation methods layered:
1. Floating button (default, configurable position/visibility).
2. Keyboard shortcut (configurable, default Ctrl+Shift+P or similar).
3. SDK programmatic activation for CI/CD and testing workflows.
4. URL parameter for shareable review links.

**Sources:**
- [UserSnap: Floating Action Buttons Guide](https://usersnap.com/blog/floating-action-button/)
- [UserSnap: Top 25 Feedback Widgets 2026](https://usersnap.com/blog/feedback-widget/)
- [Feedbackfun: Click-Anywhere Technology](https://feedbackfun.com/)
- [Marker.io: Widget JavaScript SDK](https://help.marker.io/en/articles/4621840-widget-javascript-sdk)

---

### 2.3 Annotation Composer Patterns

| Pattern | Description | Best For | Drawbacks |
|---------|-------------|----------|-----------|
| **Popover (anchored)** | Small overlay near clicked element | Quick, contextual, non-disruptive feedback | Limited space; hard with complex forms |
| **Sidebar/drawer** | Panel slides in from right or left | Persistent; good for longer feedback; shows thread | Gets in the way of page layout; "hard to implement without getting in the way" |
| **Modal (fullscreen or centered)** | Overlay blocks page interaction | Focused attention; good for detailed reports | Interrupts flow; loses page context |
| **Inline expansion** | Form expands below the targeted element | Most contextual; feels native | Complex DOM manipulation; layout shifts |
| **Floating panel** | Draggable, repositionable panel | User controls placement; doesn't block content | Can feel disconnected from context |

**Best Practices:**
- If content exceeds 4 columns width, use a modal instead of a popover (Carbon Design System guideline).
- Popovers should use "light dismiss" (click outside to close).
- Keyboard navigation (Tab, Escape) is essential for accessibility.
- Use `aria-haspopup` and `aria-expanded` attributes.
- Manage focus: move into composer on open, return on close.

**Recommended for Peril:** Popover as default for quick annotations, with option to expand to sidebar for threaded discussions. Avoid modals except for final submission review.

**Sources:**
- [UX Patterns Dev: Popover Pattern](https://uxpatterns.dev/patterns/content-management/popover)
- [LogRocket: Modal UX Design Patterns](https://blog.logrocket.com/ux-design/modal-ux-design-patterns-examples-best-practices/)
- [Carbon Design System: Popover Usage](https://carbondesignsystem.com/components/popover/usage/)
- [Tom Critchlow: UX of Web Annotations](https://tomcritchlow.com/2019/02/12/annotations/)

---

### 2.4 Screenshot Capture Methods

| Method | Technique | Speed | Accuracy | Bundle Size | Best For |
|--------|-----------|-------|----------|-------------|---------|
| **html2canvas** | Canvas API; re-renders DOM procedurally | Slow (21s for 10 widgets) | Moderate; misses pseudo-elements, shadow DOM, web fonts, CSS variables in gradients | ~40KB gzipped | Legacy support; widest browser compat |
| **SnapDOM** | SVG foreignObject; serialized DOM clone | Claims 148x faster (contested) | High; handles pseudo-elements, web fonts, shadow DOM | ~15KB | Modern browsers; pixel-perfect needs |
| **html-to-image** | SVG foreignObject (fork of dom-to-image) | Fast (~7s for 10 widgets) | Good | ~8KB | Lightweight alternative |
| **Native browser API** | `navigator.mediaDevices.getDisplayMedia()` + Canvas | Instant | Perfect (actual pixel capture) | 0KB (native) | When user grants permission; full-page captures |
| **Server-side** | Puppeteer/Playwright headless browser | N/A (server) | Perfect | 0KB (client) | Automated testing; CI/CD captures |

**Technical Notes:**
- html2canvas does NOT take a screenshot; it mimics browser rendering by reading computed styles of every DOM element, which is why it's slow and sometimes inaccurate.
- SnapDOM uses SVG with `<foreignObject>` to render a visual clone -- different approach, generally faster and more accurate for modern CSS.
- SnapDOM auto-waits for `document.fonts.ready` to ensure web fonts are loaded.
- Monday.com wrote about how [capturing DOM as image is harder than you think](https://engineering.monday.com/capturing-dom-as-image-is-harder-than-you-think-how-we-solved-it-at-monday-com/).
- Mixed real-world reports on SnapDOM: some users report it was slower and worse quality in their specific use cases.

**Recommended for Peril:**
- Primary: SnapDOM or html-to-image for in-browser DOM capture (modern, fast, lightweight).
- Fallback: html2canvas for edge cases with older browsers.
- Optional: Native `getDisplayMedia()` API for users who want pixel-perfect captures (requires permission grant).
- Server-side Puppeteer for automated/CI captures.

**Sources:**
- [DEV Community: SnapDOM vs html2canvas](https://dev.to/tinchox5/snapdom-a-modern-and-faster-alternative-to-html2canvas-1m9a)
- [Monday Engineering: DOM to Image Challenges](https://engineering.monday.com/capturing-dom-as-image-is-harder-than-you-think-how-we-solved-it-at-monday-com/)
- [SnapDOM Official Site](https://zumerlab.github.io/snapdom/)
- [npm Compare: SnapDOM vs html2canvas](https://npm-compare.com/@zumer/snapdom,html2canvas)
- [Hacker News: SnapDOM Benchmark Discussion](https://news.ycombinator.com/item?id=44307298)

---

## 3. MCP Ecosystem and Tool Design

### 3.1 MCP Server Best Practices

**Protocol Fundamentals (2025 Spec):**
- MCP is now governed by the [Agentic AI Foundation (AAIF)](https://en.wikipedia.org/wiki/Model_Context_Protocol) under the Linux Foundation, co-founded by Anthropic, Block, and OpenAI.
- November 2025 spec added: async operations, Streamable HTTP transport, OAuth 2.1, `.well-known` URL discovery, structured tool annotations.
- Streamable HTTP replaces SSE; supports chunked transfer encoding; works on AWS Lambda and behind enterprise proxies.

**15 Best Practices (per [The New Stack](https://thenewstack.io/15-best-practices-for-building-mcp-servers-in-production/) and [Phil Schmid](https://www.philschmid.de/mcp-best-practices)):**

1. **Limit tool surface area** -- Expose only operations you're comfortable automating.
2. **Scope credentials** -- Least-privilege service accounts per environment.
3. **Validate inputs** -- Especially where LLMs generate queries.
4. **Structured responses** -- Every tool handler returns content arrays with typed blocks (text, image, resource).
5. **Return `isError: true`** on failure rather than throwing exceptions.
6. **Use `outputSchema` and `structuredContent`** (June 2025 spec) for typed, validatable outputs.
7. **Tool annotations** -- Include `readOnlyHint`, `destructiveHint`, `idempotentHint` for safety metadata.
8. **Make calls idempotent** -- Accept client-generated request IDs; return deterministic results.
9. **Use pagination** -- Cursors and tokens for list operations to keep responses small.
10. **Errors should teach** -- "Rate limited, retry after 30s or reduce batch size to 50" not just "429 error".
11. **Prompts express intent, code enforces rules** -- Never trust the agent to enforce security.
12. **Short, machine-friendly names** -- `get_weather`, `create_review`, not sentences.
13. **Concise descriptions** -- 1-2 sentences; most important info first (agents may not read the full description).
14. **JSON Schema for all inputs and outputs** -- Clear documentation about required vs optional parameters.
15. **Workflow-based tools** -- Handle complete processes internally; return conversational updates instead of technical status codes.

**Sources:**
- [The New Stack: 15 Best Practices for MCP Servers](https://thenewstack.io/15-best-practices-for-building-mcp-servers-in-production/)
- [Phil Schmid: MCP Best Practices](https://www.philschmid.de/mcp-best-practices)
- [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
- [Anthropic: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)

---

### 3.2 How Successful MCP Tools Structure Their Interfaces

**The "54 Patterns" Framework (Arcade.dev):**
- [Arcade.dev cataloged 54 patterns](https://www.arcade.dev/blog/mcp-tool-patterns) across 10 categories.
- Key insight: **Tool definitions are menu items an LLM reads**, not function signatures. Design for LLM comprehension, not human comprehension.
- Full pattern catalog: [arcade.dev/patterns](https://www.arcade.dev/patterns/)

**Progressive Disclosure Pattern (Klavis.ai):**
1. Agent identifies user's high-level intent.
2. Shown relevant categories of tools (e.g., "reviews" for feedback tasks).
3. Explores actions within selected category.
4. Only when specific action chosen does full tool definition load into context.
- Dramatically reduces initial token load; scales to any number of tools.

**Naming Conventions:**
- Package names: kebab-case with "mcp" included (e.g., `peril-mcp`).
- Tool names: short, machine-friendly (`create_review`, `list_annotations`, `capture_screenshot`).
- Put most important info at the start of descriptions (agents may truncate).

**Tool vs API Distinction:**
- MCP tools are a **User Interface for Agents** -- different design principles than REST APIs.
- Workflow-based tools (handle complete processes internally) outperform API-mirror tools (raw CRUD).
- Example: `submit_visual_review` (workflow) vs `create_annotation` + `attach_screenshot` + `set_metadata` + `submit` (API mirror).

**Sources:**
- [Arcade.dev: 54 Patterns for Better MCP Tools](https://www.arcade.dev/blog/mcp-tool-patterns)
- [Klavis.ai: Less is More MCP Design Patterns](https://www.klavis.ai/blog/less-is-more-mcp-design-patterns-for-ai-agents)
- [Merge.dev: MCP Tool Descriptions](https://www.merge.dev/blog/mcp-tool-description)
- [Zazencodes: MCP Server Naming Conventions](https://zazencodes.com/blog/mcp-server-naming-conventions)

---

### 3.3 What Makes an MCP Tool Easy for Agents

**Design for the LLM, not the human:**
1. Clear, concise tool descriptions (1-2 sentences, most important info first).
2. Well-named parameters (`page_url` not `url`, `annotation_text` not `text`).
3. JSON Schema with descriptions on every parameter.
4. Structured output (not just plain text) with typed content blocks.
5. Actionable errors with recovery paths.

**Reduce Token Consumption:**
- Progressive disclosure (don't dump all tools upfront).
- Concise responses (structured JSON, not verbose prose).
- Pagination for lists.

**Safety and Predictability:**
- Tool annotations (readOnlyHint, destructiveHint, idempotentHint).
- Deterministic results for same inputs.
- Server-side security enforcement (never trust agent to enforce rules).

**For Peril's MCP Server:**

| Tool | Type | Description |
|------|------|-------------|
| `capture_screenshot` | read-only | Capture current page state as annotated screenshot |
| `create_review` | destructive | Create a new visual review with annotations and metadata |
| `list_reviews` | read-only | List open visual reviews, optionally filtered by status/page |
| `get_review` | read-only | Get full details of a specific review including annotations |
| `update_review_status` | destructive | Mark a review as resolved, in-progress, or dismissed |
| `get_page_context` | read-only | Get technical metadata for current page (URL, viewport, console errors) |

**Sources:**
- [MCP Specification: Tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
- [Glama.ai: Agent Workflows and Tool Design](https://glama.ai/blog/2025-08-22-agent-workflows-and-tool-design-for-edge-mcp-servers)
- [Nearform: MCP Tips, Tricks, Pitfalls](https://nearform.com/digital-community/implementing-model-context-protocol-mcp-tips-tricks-and-pitfalls/)

---

## 4. Successful Product Launches in Developer Tools (2024-2026)

### 4.1 Notable Launch Case Studies

| Tool | Launch Year | Growth Metric | Key Strategy |
|------|-------------|---------------|--------------|
| **Ollama** | 2023-2024 | 261% GitHub star growth to 136K+ stars | Local-first AI runtime; zero-config `ollama run llama3`; community-driven |
| **Cursor** | 2024-2025 | $29.3B valuation, $3.4B funding | AI-native code editor; viral dev word-of-mouth; exceptional DX |
| **Vercel** | Ongoing | $200M+ revenue, 100K+ monthly signups | Developer-first freemium; Next.js OSS ecosystem; zero-to-deployed in minutes |
| **OpenHands** | 2024 | Rapid GitHub growth | Open-source AI coding agent; community contributions |
| **Depot** | 2024 | $5.9M funding | Remote container builds; focused developer pain point |
| **Arcade AI** | 2025 | $12M seed | MCP tool platform; technical content on X/HN as fundraising accelerator |

### 4.2 What Channels and Strategies Worked

**Channel Effectiveness for Developer Tools:**

| Channel | Reach | Developer % | Conversion | Best For |
|---------|-------|-------------|------------|----------|
| **Hacker News** | 10K-30K visitors in hours | ~80-90% | 1.5-2.5% (90-200 users) | Technical credibility; early adopters |
| **Product Hunt** | 800-1K visitors | Mixed | 0.5-1.0% (4-10 users) | Broader visibility; design-focused tools |
| **GitHub** | Organic over time | ~100% | Stars -> contributors -> users | Long-term compounding; trust signal |
| **X (Twitter)** | Variable | High for dev tools | Variable | Smart technical content; fundraising accelerator |
| **Discord** | Community-building | High | Retention, not acquisition | Post-launch engagement; support |
| **Dev.to / technical blog** | Moderate | High | Backlinks + SEO | Evergreen content; reference material |

**Key Findings:**
- "Hacker News will always be more valuable for a dev tool" -- more active installs and more people asking for paid plans than Product Hunt.
- Multi-platform launches see 40% higher conversion rates and 60% better long-term engagement vs single-platform.
- Recommended formula: **2 spike channels + 2 compounding channels + 1 consistent community**.
- Smart technical content on X and Hacker News is proving to be a powerful fundraising accelerator.
- GitHub stars have become the critical validation metric for open source success.

**Sources:**
- [Medium: Lessons Launching on HN vs Product Hunt](https://medium.com/@baristaGeek/lessons-launching-a-developer-tool-on-hacker-news-vs-product-hunt-and-other-channels-27be8784338b)
- [Do What Matter: Product Hunt vs Hacker News](https://dowhatmatter.com/guides/product-hunt-vs-hacker-news)
- [Daily.dev: 2025 Developer Tool Trends](https://business.daily.dev/resources/2025-developer-tool-trends-what-marketers-need-to-know/)
- [Specter: DevTools Landscape 2025](https://insights.tryspecter.com/devtools-landscape-2025/)

---

### 4.3 Community-First vs Sales-First Approaches

**Three Growth Models Compared:**

| Model | Description | Example | Best For |
|-------|-------------|---------|---------|
| **Product-Led Growth (PLG)** | Self-serve signup to "aha moment" in minutes; no sales conversation | Stripe, Vercel | Individual developers; bottom-up adoption |
| **Community-Led Growth (CLG)** | Users shape product, teach others, create shared value | Supabase (GitHub + Discord + contributors) | Open source tools; ecosystem plays |
| **Sales-Led Growth (SLG)** | Enterprise sales team; demos; procurement process | Traditional enterprise tools | Large contracts; compliance-heavy buyers |

**Key Data Points:**
- PLG companies grow 30-40% faster than sales-led with 50-70% lower customer acquisition costs.
- 91% of companies plan to increase PLG investment (2025 survey).
- Developers have a reputation for wanting to explore products on their own -- PLG is natural fit.
- Vercel crossed $200M revenue with 100K+ monthly signups driven entirely by freemium self-serve.

**The Winning Sequence (not a choice, but a sequence):**
1. **Start PLG** -- Build self-serve product with exceptional DX. Free tier generous enough to build community.
2. **Layer CLG** -- Invest in community (Discord, GitHub discussions, technical blog). Let users become advocates.
3. **Add SLG when needed** -- When enterprise inbound starts, build sales motion triggered by real intent (not cold outreach).

**Postman example:** Started as a dev-first Chrome extension, then built one of the most engaged API communities, then layered enterprise sales.

**Recommended Sequence for Peril:**
1. Open source core SDK with excellent DX and documentation.
2. Build community around visual review workflows (Discord, GitHub, technical content).
3. Add cloud dashboard and team features as paid tier.
4. Enterprise sales only when inbound demand warrants it.

**Sources:**
- [Draft.dev: PLG for Developer Tools](https://draft.dev/learn/product-led-growth-for-developer-tools-companies)
- [StateShift: Developer-Led vs Community-Led Growth](https://www.stateshift.com/blog/developer-led-growth-vs-community-led-growth-which-model-works-best)
- [Reo.dev: How DX Powered Vercel's $200M+ Growth](https://www.reo.dev/blog/how-developer-experience-powered-vercels-200m-growth)
- [General Catalyst: Sales-Led vs Product-Led Growth](https://www.generalcatalyst.com/stories/sales-led-vs-product-led-growth)
- [Decibel: Developer Marketing Playbook](https://www.decibel.vc/articles/developer-marketing-and-community-an-early-stage-playbook-from-a-devtools-and-open-source-marketer)
- [OSE Network: The New Open Source Playbook](https://osenetwork.com/2025/12/29/the-new-open-source-playbook/)

---

## Summary: Key Takeaways for Peril

### Product Design
1. **Time-to-value under 5 minutes**: `npm install @peril/react` -> add `<PerilProvider>` -> see floating button -> click -> annotate -> done.
2. **Local-first architecture**: Capture and annotate without any server. MCP server runs locally. Cloud is optional.
3. **Multiple activation methods**: Floating button (default) + keyboard shortcut + SDK method + URL parameter.
4. **Popover-first annotation**: Quick annotations via anchored popover; expand to sidebar for threads.
5. **SnapDOM or html-to-image for capture**: Fast, accurate, lightweight. Fallback to html2canvas for edge cases.

### SDK Design
6. **Tree-shakeable ESM packages**: `@peril/core` (zero-dep engine) + `@peril/react` (framework adapter).
7. **Async-load heavy features**: Screenshot capture and annotation UI load on-demand, not at import time.
8. **TypeScript-first**: Full type definitions; great autocomplete experience.

### MCP Design
9. **Workflow-based tools**: `create_review` (not 4 separate API calls).
10. **Progressive disclosure**: Don't dump all tools upfront; categorize and reveal on demand.
11. **Structured output with JSON schemas**: Use `outputSchema` and `structuredContent`.
12. **Safety annotations**: `readOnlyHint`, `destructiveHint`, `idempotentHint` on every tool.
13. **Actionable errors**: Tell the agent what to do next, not just what went wrong.

### Go-to-Market
14. **Open source core SDK** under MIT license.
15. **PLG-first**: Self-serve, generous free tier, exceptional docs.
16. **Launch on Hacker News** (primary) + GitHub (compounding) + Discord (community) + Dev.to (content).
17. **Community before sales**: Let developers discover, adopt, and advocate before building enterprise sales.
18. **Monetize team/cloud features**: Dashboard, collaboration, analytics, SSO = paid tier.
