# Peril Copywriting Guide

**Date:** 2026-03-10
**Author:** CEO
**Issue:** PER-74

Copywriting principles for Peril's marketing site, docs, and product surfaces. Tailored to a dev-tools SaaS selling to technical teams adopting AI coding agents.

---

## 1. Voice and Tone

### Who we sound like

A sharp senior engineer who also happens to be a great writer. Direct, confident, precise. We know our domain cold and don't need to prove it with jargon. We respect the reader's time and intelligence.

### Voice attributes

| Attribute | We are | We are not |
|---|---|---|
| Confident | State what we do clearly | Hedging, weasel words ("helps you potentially...") |
| Technical | Use precise terminology when it serves clarity | Dumbing down for a generic audience |
| Concise | Every word earns its place | Padding with filler or corporate warmth |
| Peer-level | Talk to developers as equals | Condescending, salesy, or performative |
| Specific | Concrete examples, real numbers | Vague claims ("blazing fast", "revolutionary") |
| Witty (sparingly) | A well-placed dry observation | Forced humor, puns, exclamation marks |

### Tone shifts by surface

| Surface | Tone | Example |
|---|---|---|
| Hero headline | Bold, declarative, outcome-first | "Point at the bug. Your agent fixes it." |
| Feature section | Technical, precise, benefit-framed | "Multi-strategy locators — testId, ARIA role, CSS, XPath — so agents find the element on the first try." |
| CTA | Direct, low-friction, specific | "Try the demo" / "Add to your project" |
| Docs | Clear, scannable, peer-level | "Import the provider, wrap your app, toggle review mode." |
| Error states | Honest, helpful, no blame | "Screenshot capture failed. The element may be cross-origin or hidden." |
| Blog / thought leadership | Opinionated, narrative-driven | "Every team using AI agents hits the same wall..." |

---

## 2. Messaging Hierarchy

### The core message

**Peril turns visual UX feedback into structured, agent-executable tasks via MCP.**

That's the one-liner. Everything else ladders up to it.

### Messaging tiers

**Tier 1 — What we do (hero, first 5 seconds)**
> Point at what's wrong. Your coding agent gets everything it needs to fix it.

**Tier 2 — Why it matters (problem framing)**
> AI coding agents are powerful, but they can't see your UI. Designers, PMs, and QA spot issues instantly — but translating "this button looks broken on mobile" into an agent-actionable task loses precision, context, and time.

**Tier 3 — How it works (mechanism)**
> Click any element. Add your comment. Peril captures the screenshot, DOM context, locators, and acceptance criteria, then exposes it as a structured MCP tool call. Your agent receives exactly what a senior engineer would hand them.

**Tier 4 — Why us (differentiation)**
> No other tool bridges visual human feedback to agent-structured tasks. Bug trackers output tickets for humans. Peril outputs tasks for agents.

---

## 3. Headline Formulas

### Primary patterns (use for hero, section heads)

**Outcome-first:**
> [Desired outcome] — without [pain they currently endure]
> "Ship UI fixes in minutes — without writing a single bug report."

**Action-verb opener:**
> [Verb] + [object] + [result]
> "Point at the bug. Your agent fixes it."

**Problem-flip:**
> [Old way] is [negative]. [New way with Peril].
> "Screenshots in Slack lose context. Peril gives agents structured tasks."

**How-it-works teaser:**
> [Simple action] → [surprising result]
> "One click → locators, screenshots, DOM context, and a task your agent can execute."

### Headline rules

1. **Under 8 words for hero headlines.** Max 44 characters. Research shows this is the sweet spot for dev-tools landing pages.
2. **Lead with the outcome, not the feature.** "Ship fixes faster" > "Multi-strategy locator generation".
3. **Use the reader's language.** Our audience says "bug", "broken", "fix it", "ship". Not "defect remediation" or "issue resolution workflow".
4. **One idea per headline.** If you need "and", split it.
5. **No superlatives without proof.** "Fastest" needs a benchmark. "Easiest" needs a comparison. Prefer specifics: "Under 50KB gzipped" beats "lightweight".

---

## 4. CTA Best Practices

### Primary CTA (above fold)

- **Action-specific verbs.** "Try the demo", "Add to your project", "See it work". Not "Get started", "Learn more", or "Sign up".
- **Lower the commitment.** "Try" > "Start". "See" > "Sign up". Reduce perceived friction.
- **Match the stage.** If they're cold, offer a demo. If they're warm, offer install instructions.

### Secondary CTA (escape hatch)

- Always pair a high-commitment CTA with a low-commitment one: "Try the demo" + "Read the docs".
- This captures both ready-to-try and still-evaluating visitors.

### CTA copy patterns

| Intent | Good | Bad |
|---|---|---|
| Trial | "Try the demo" | "Get started free" |
| Install | "npm install @peril-ai/react" (literal code) | "Download now" |
| Learn | "See how it works" | "Learn more" |
| Compare | "See why teams switch" | "View pricing" |

### Dev-tools CTA insight

Developers respond to literal code in CTAs. Showing `npm install @peril-ai/react` as a clickable/copyable element is more effective than any marketing button. It signals "this is real and ready to use."

---

## 5. Writing for Developer Audiences

### What works

- **Show, don't tell.** A code snippet or live demo is worth more than a paragraph of benefits. Our embedded annotation demo is our most powerful conversion tool.
- **Be specific.** "Generates 5 locator strategies per element" beats "comprehensive locator support". Numbers build trust.
- **Use their stack language.** "npm install", "import", "React provider", "MCP tool". Developers recognize their own ecosystem vocabulary instantly.
- **Respect the scan.** Developers skim. Use clear section heads, bullet points, and code blocks. Walls of text get skipped.
- **Framework/language fit matters.** 50% of dev-tool PMF is stack compatibility. Feature React, TypeScript, and MCP prominently — with logos, not just words.
- **Technical credibility signals.** Bundle size ("< 50KB gzipped"), zero external dependencies, TypeScript-first, open architecture. These matter more than testimonials to a developer audience.

### What fails

- **Buzzword soup.** "AI-powered next-generation developer experience platform." Say what it does.
- **Hiding technical details.** Developers want to know how it works before they trust it. Don't gate specs behind sales calls.
- **Condescending simplification.** Don't explain what MCP is to an audience that uses it daily. Do explain what *your* MCP tools expose.
- **Feature-only copy.** Features without context ("multi-strategy locators") mean nothing. Frame them: "Multi-strategy locators — so agents find the element even when the DOM changes."
- **Forced enthusiasm.** No exclamation marks. No "game-changer". No "revolutionary". Developers tune this out instantly.
- **Stock photos of people coding.** Use real product screenshots, architecture diagrams, or nothing.

---

## 6. Key Messaging by Audience

### For developers (IC engineers)

**Care about:** Does it work with my stack? Is it lightweight? Will it slow my app? How do I install it?

**Lead with:**
- Stack compatibility (React, TypeScript, MCP)
- Bundle size and performance
- Code examples showing how little setup is needed
- The locator strategy (testId > ARIA > CSS > XPath > text)

**Example copy:**
> Add `<ReviewProvider>` to your app. Toggle review mode. Every annotation your team creates becomes an MCP tool call your agent can act on — with locators, screenshots, and DOM context.

### For engineering leads / CTOs

**Care about:** Will this reduce my team's feedback-to-fix cycle? Does it integrate with our agent workflow? What's the maintenance burden?

**Lead with:**
- Cycle time reduction (visual feedback → agent task in seconds, not hours)
- Zero-config for existing React + MCP setups
- Local-first architecture (no data leaves your machine in V1)
- Open, inspectable storage format

**Example copy:**
> Your design team spots bugs faster than your engineers can triage them. Peril closes the loop: visual feedback becomes agent-structured tasks with zero re-description.

### For PMs, designers, QA (non-technical reviewers)

**Care about:** Is it easy to use? Do I need to learn anything? Will the engineer actually see my feedback?

**Lead with:**
- Simplicity of the review flow (click, comment, done)
- Their feedback goes directly to the agent — no lossy handoff
- Categories and severity levels they're familiar with

**Example copy:**
> See something wrong? Click it. Add your comment. The agent receives your feedback with pixel-perfect context — no Jira ticket required.

---

## 7. Competitive Positioning Copy

### Against traditional bug trackers (Marker.io, BugHerd, UserSnap)

**Their frame:** Visual bug reporting for human developers.
**Our reframe:** Visual feedback for AI coding agents.

> Bug trackers create tickets for humans to read. Peril creates tasks for agents to execute. Same visual feedback, different output — structured locators, DOM context, and MCP tool calls instead of a screenshot and a paragraph.

### Against Jam.dev

**Their frame:** Fastest bug reporting with AI.
**Our reframe:** We're not a bug reporter. We're the bridge between human eyes and agent hands.

> Jam captures great context. Peril goes further — it outputs structured, agent-executable tasks via MCP. No human triage step between feedback and fix.

### Against no solution (status quo)

**Their frame:** "We just paste screenshots in Slack."
**Our reframe:** That works for humans. It doesn't work for agents.

> Agents can't parse a screenshot with an arrow drawn on it. They need element locators, DOM context, and structured acceptance criteria. Peril generates all of that from a single click.

---

## 8. Copywriting Frameworks Reference

### PAS (Problem → Agitate → Solution)

Use for longer-form sections, blog posts, and landing page body copy.

1. **Problem:** "Your team spots UI bugs instantly. Your AI agent can't see any of them."
2. **Agitate:** "So you screenshot, describe, paste into chat, re-describe, add context, and hope the agent interprets it right. It usually doesn't."
3. **Solution:** "Peril lets anyone click the problem. The agent gets structured locators, screenshots, and context — ready to fix."

### JTBD (Jobs to Be Done)

Use for feature copy and positioning.

> "When I'm reviewing a UI and spot a visual bug, help me report it in a way my AI coding agent can act on immediately, so I can get it fixed without writing a detailed bug report or waiting for an engineer to triage it."

### Before/After/Bridge

Use for comparison sections and case studies.

- **Before:** "Designers screenshot bugs, write descriptions in Slack, engineers re-interpret for their AI agent, agent gets it wrong, cycle repeats."
- **After:** "Designer clicks the element, adds a comment. Agent receives locators, screenshot, DOM context, and acceptance criteria. Fix ships."
- **Bridge:** "Peril."

---

## 9. Microcopy and In-Product Writing

### Principles

- **Be invisible when things work.** No congratulatory messages, no unnecessary confirmations.
- **Be helpful when things break.** State what happened, why, and what to do next.
- **Use consistent terminology.** "Review" (not "annotation", "feedback", or "comment" — those are parts of a review). "Review mode" (not "feedback mode" or "annotate mode").

### Terminology glossary

| Term | Use | Don't use |
|---|---|---|
| Review | The full feedback unit (locators + screenshot + comment) | Annotation, feedback item, bug report |
| Review mode | The overlay interaction state | Feedback mode, annotate mode |
| Locator | A strategy for finding an element | Selector (too CSS-specific) |
| Comment | The reviewer's text input | Note, description, feedback |
| Severity | critical, major, minor, suggestion | Priority (that's the agent's job) |

---

## 10. Checklist Before Publishing

- [ ] Does the headline lead with an outcome, not a feature?
- [ ] Is every claim specific? (Replace "fast" with a number, "easy" with a step count)
- [ ] Would a developer read this and think "they get it" or "they're selling to me"?
- [ ] Is there a code example or demo within the first two scrolls?
- [ ] Does the CTA tell them exactly what happens when they click?
- [ ] Is it under the word count it needs to be? (Cut 20% on first edit)
- [ ] Have you read it aloud? If it sounds like a press release, rewrite it.
- [ ] Does it pass the "so what?" test? After every sentence, ask "so what?" — if you can't answer, cut or reframe.
