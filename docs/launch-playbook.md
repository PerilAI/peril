# Peril -- Launch Playbook

**Date:** 2026-03-10
**Author:** CMO
**Issue:** PER-85

Execution plan for Peril's public launch across Hacker News, Product Hunt, and supporting channels. This document is the tactical complement to `docs/gtm-playbook.md`.

---

## 1. Launch Strategy Overview

Two spike launches, staggered by 7-10 days:

1. **Primary: Hacker News Show HN** -- drives developer traffic, technical credibility, installs
2. **Secondary: Product Hunt** -- drives broader awareness, social proof, press pickup

Supporting channels (Twitter/X, Reddit, email, Discord) amplify both spikes.

### Why Stagger

- HN and PH audiences partially overlap. Staggering avoids fatigue.
- HN feedback shapes the PH pitch. Learn from HN comments before writing the PH maker comment.
- Staggering extends the total visibility window from 48 hours to 2+ weeks.

---

## 2. Pre-Launch Requirements

### 2.1 Product Readiness Gate

Do not launch until all of these are true:

- [ ] Core annotation flow works end-to-end (select element → comment → submit → agent receives via MCP)
- [ ] `npm install @peril/react` works with zero config issues
- [ ] Marketing site is live with hero, demo, and install instructions
- [ ] GitHub README is polished with screenshots, architecture diagram, and quick-start
- [ ] At least 3 people outside the team have tried the tool and successfully annotated an element

### 2.2 Launch Asset Checklist

| Asset | Status | Notes |
|---|---|---|
| Show HN title (3 variants tested) | [ ] | See Section 3.2 |
| Show HN self-comment (800-1200 words) | [ ] | See Section 3.3 |
| Product Hunt page (tagline, images, maker comment) | [ ] | See Section 4.2 |
| Twitter/X launch thread (5-7 tweets) | [ ] | See Section 5.1 |
| Reddit post for r/programming | [ ] | See Section 5.2 |
| Email announcement | [ ] | See Section 5.3 |
| Blog post: "Introducing Peril" | [ ] | On the blog, not HN |
| Demo GIF (15 seconds, annotation flow) | [ ] | Used across all channels |
| Screenshot: annotation overlay | [ ] | Product UI, not mockup |
| Screenshot: MCP output in Claude Code | [ ] | Shows the agent receiving the task |
| Screenshot: review dashboard | [ ] | Shows the queue |

---

## 3. Hacker News Launch

### 3.1 Timing

**Best day:** Tuesday or Wednesday
**Best time:** 8:00-9:00 AM ET (when US East Coast is starting work and Europe is still active)

Avoid: Mondays (busy), Fridays (low engagement), weekends, major tech news days (Apple events, Google I/O, etc.)

### 3.2 Title

The title is the single most important asset. Rules:

- Start with "Show HN: "
- Under 80 characters total
- Describe what it does, not what it is
- No buzzwords. No "AI-powered." No "revolutionary."
- Include the key differentiator

**Title candidates (test with 5+ developers before launch):**

| Candidate | Character Count | Notes |
|---|---|---|
| Show HN: Peril -- Visual feedback that coding agents can act on | 63 | Outcome-focused |
| Show HN: Peril -- Turn UI annotations into MCP tasks for coding agents | 72 | Mechanism + outcome |
| Show HN: Peril -- Point at a bug, your agent fixes it | 52 | Simple, direct |

**Selection process:** Share all 3 with 5+ developers. Ask "which would you click?" Go with the winner. If split, go with the shortest.

### 3.3 Self-Comment

Post a self-comment within 5 minutes of submission. This is your chance to provide context that doesn't fit in the title.

**Structure:**

1. **What it does** (2-3 sentences)
2. **Why I built it** (the problem, personal experience)
3. **How it works** (technical overview: SDK → server → MCP, locator strategy, screenshots)
4. **What makes it different** (multi-locator bundles, agent-native output, not another bug tracker)
5. **Current state** (V1, what works, what's planned)
6. **Tech stack** (TypeScript, React, MCP, Vitest -- HN cares about this)
7. **Links** (GitHub, docs, demo)
8. **Ask** (feedback request: "What would make this useful for your team?")

**Tone:** Engineer sharing their work. Not a pitch. Not humble-brag. Genuinely interested in feedback.

**Length:** 800-1200 words. Long enough to be substantive, short enough to read.

### 3.4 Comment Engagement

The first 4-6 hours are critical. Rules:

- **Respond to every comment** within 30 minutes for the first 4 hours
- **Be honest about limitations.** "That's a V2 feature" is better than overselling.
- **Answer technical questions with depth.** HN rewards substance.
- **Never get defensive.** If someone criticizes, acknowledge and explain your reasoning.
- **Upvote thoughtful comments** (even critical ones).
- **Never ask for upvotes.** HN detects and penalizes vote manipulation.

### 3.5 What Kills a Show HN

| Mistake | Why It Kills | Prevention |
|---|---|---|
| Marketing-speak in title | HN audience reflexively downvotes | Use plain language |
| Product doesn't work | "I tried it and got an error" comments poison the thread | Thorough testing pre-launch |
| Defensive responses | Kills goodwill instantly | Acknowledge, don't argue |
| Vote manipulation | HN algorithms detect and penalize | Never coordinate upvotes |
| No self-comment | Thread lacks context, dies quickly | Post within 5 minutes |
| Launching on a bad day | Buried by major news | Check HN front page morning of launch |

---

## 4. Product Hunt Launch

### 4.1 Timing

Launch on Product Hunt **7-10 days after Show HN.** This gives time to:
- Incorporate HN feedback into the product
- Refine messaging based on what resonated on HN
- Avoid audience fatigue from simultaneous launches

**Best day:** Tuesday, Wednesday, or Thursday
**Best time:** 12:01 AM PT (PH resets at midnight Pacific)

### 4.2 Product Hunt Page

**Tagline (60 chars max):** "Visual feedback your coding agents understand"

**Description (260 chars max):**
> Click any element in your live app. Add a comment. Peril captures locators, screenshots, and DOM context, then serves it to your coding agent via MCP. No more translating screenshots into agent tasks.

**Images (5-6):**
1. Hero: annotation overlay on a real UI
2. Comment composer with category/severity
3. MCP output in Claude Code terminal
4. Review dashboard showing queue
5. Before/after: manual screenshot workflow vs. Peril
6. Architecture diagram (SDK → Server → MCP → Agent)

**Topics:** Developer Tools, Artificial Intelligence, Open Source

### 4.3 Maker Comment

Post immediately when the page goes live. Structure:

1. **Personal story** -- why you built this (the frustration of translating visual feedback for agents)
2. **Quick demo** -- link to the interactive demo
3. **What's free** -- everything (OSS, MIT)
4. **What we'd love feedback on** -- specific question for the PH community

### 4.4 Hunter Strategy

For lean startups, **self-hunting is fine.** The "famous hunter" strategy is overrated for dev tools. If you have a genuine connection to a well-known maker, ask them. Otherwise, self-hunt and invest that energy in a great maker comment.

### 4.5 PH Success Criteria

| Metric | Target |
|---|---|
| Upvotes (24h) | 200+ |
| Top 5 for the day | Yes |
| Comments | 20+ |
| Traffic to site (24h) | 1,500+ visitors |

---

## 5. Supporting Channel Launches

### 5.1 Twitter/X Launch Thread

Post 2-4 hours after HN (when the HN post has traction). Structure:

**Tweet 1 (hook):**
> We just launched Peril on Hacker News.
>
> It turns visual UX feedback into structured tasks your coding agent can act on.
>
> Open source, MIT licensed. Thread on what it does and why we built it 👇

**Tweet 2 (problem):**
> Every team using AI coding agents hits the same wall: someone spots a UI bug, screenshots it, pastes it in Slack, and someone else re-describes it for the agent.
>
> That translation step loses precision, context, and time.

**Tweet 3 (solution):**
> Peril lets anyone click an element in the live app, add a comment, and the agent receives:
> - Multi-strategy locator bundle
> - Element + page screenshots
> - DOM context
> - Structured acceptance criteria
>
> Via MCP. No re-description needed.

**Tweet 4 (demo):**
> Here's what it looks like:
> [15-second GIF of annotation flow]

**Tweet 5 (technical):**
> Under the hood:
> - 5 locator strategies (testId, ARIA, CSS, XPath, text) with voting
> - <50KB gzipped SDK
> - Works with React 18+, Remix
> - Local-first: nothing leaves your machine
> - TypeScript-first, zero runtime deps in core

**Tweet 6 (CTA):**
> Try it:
> ```
> npm install @peril/react
> ```
> GitHub: [link]
> Show HN: [link]
> Docs: [link]

### 5.2 Reddit Posts

**r/programming** -- Post 6-8 hours after HN. Title should be descriptive, not promotional:
> "Show: Visual feedback tool that outputs structured tasks for AI coding agents via MCP"

**r/webdev** -- Post 24 hours later with a different angle:
> "Built an annotation overlay that captures multi-strategy locators for AI coding agents"

**r/ChatGPTCoding and r/ClaudeAI** -- Comment on relevant threads rather than creating promotional posts. Share when someone asks about feedback workflows or MCP tools.

**Rules for Reddit:**
- Never use marketing language
- Always disclose you're the maker
- Provide genuine technical value in the post
- Respond to every comment substantively
- Do not cross-post the same content to multiple subreddits

### 5.3 Email Announcement

Send to anyone who signed up via the marketing site's email capture.

**Subject line:** "Peril is live -- visual feedback for AI coding agents"

**Body structure:**
1. One sentence: what it does
2. Link to demo
3. Install command: `npm install @peril/react`
4. Link to Show HN (social proof)
5. What's coming next (roadmap teaser)

**Length:** Under 200 words. Developers don't read long emails.

---

## 6. Launch Day Operations

### 6.1 War Room Protocol

On launch day, CMO + CEO are on call for 12 hours minimum.

| Hour | Activity | Owner |
|---|---|---|
| 0-1 | Post Show HN + self-comment. Monitor for immediate issues. | CMO |
| 1-4 | Respond to every HN comment. Fix any reported bugs immediately. | CMO + CEO + Engineering |
| 4-8 | Post Twitter/X thread. Post to r/programming. | CMO |
| 8-12 | Continue HN engagement. Monitor traffic and installs. | CMO |
| 12-24 | Reduced monitoring. Respond to new comments. | CMO |
| 24-48 | Send email announcement. Post retrospective notes. | CMO |

### 6.2 Crisis Scenarios

| Scenario | Response |
|---|---|
| Product is broken for users | Fix immediately. Post HN comment acknowledging + ETA. |
| HN post gets flagged/killed | Do not retry for at least 1 week. Analyze why. |
| Negative top comment | Respond with grace and substance. Never delete. |
| Competitor shows up in thread | Acknowledge their work. Clearly state what's different. Don't trash-talk. |
| Zero traction after 2 hours | Don't panic. Some posts take time. Do not ask friends to upvote. |

---

## 7. Post-Launch Analysis

### 7.1 Metrics to Track

| Metric | Source | When to Measure |
|---|---|---|
| HN points | HN | 24h, 48h |
| HN comments | HN | 24h, 48h |
| Site visitors | Analytics | 24h, 48h, 7d |
| GitHub stars | GitHub | 24h, 7d, 30d |
| npm installs | npm | 7d, 30d |
| Discord members | Discord | 7d, 30d |
| Email signups | Email tool | 7d, 30d |
| PH upvotes | Product Hunt | 24h |
| PH ranking | Product Hunt | 24h |

### 7.2 Post-Launch Retrospective

Within 72 hours of launch, document:

1. **What worked:** Which channel, message, or asset drove the most engagement?
2. **What didn't:** Which channel fell flat? Why?
3. **Surprise learnings:** What questions did people ask that we didn't expect?
4. **Product gaps:** What feature requests came up most?
5. **Messaging refinements:** What framing resonated? What fell flat?
6. **Next launch:** What would we do differently for the PH launch?

### 7.3 Content Follow-Up

Within 2 weeks of launch, publish:

| Content | Purpose | Channel |
|---|---|---|
| "Launching Peril: What we learned" | Transparency + SEO | Blog |
| Technical deep-dive on most-asked question | Address top HN question | Blog + Reddit |
| First user story (if available) | Social proof | Blog + Twitter/X |

---

## 8. Lean Startup Launch Principles

1. **Launch when it works, not when it's perfect.** V1 doesn't need every feature. It needs the core annotation → MCP loop to work flawlessly.

2. **Small batch, fast feedback.** Don't launch everywhere at once. HN first, learn, then PH.

3. **Treat launch as an experiment, not an event.** The goal is learning, not vanity metrics. 500 GitHub stars with clear feature request themes is better than 2,000 stars with no signal.

4. **Budget: $0.** The only resource we spend is time. Every hour should be traceable to a learning or a measurable outcome.

5. **One metric that matters.** For launch week, the metric is **npm installs.** Everything else (stars, upvotes, traffic) is a leading indicator. Installs mean someone tried it.

6. **Don't optimize what you haven't validated.** Don't A/B test landing page button colors before you know if the core message resonates.

7. **Kill fast.** If a channel produces zero signal in 48 hours, stop investing in it and redirect energy to what's working.
