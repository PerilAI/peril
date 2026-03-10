# Peril -- Go-to-Market Playbook

**Date:** 2026-03-10
**Author:** CMO
**Issue:** PER-85

---

## 1. GTM Philosophy

Peril is a pre-revenue, open-source developer tool. Our GTM follows the lean startup principle: **validate before you scale.** Every channel gets a small test before it gets a budget. Every message gets measured before it gets repeated.

The playbook has three phases:
1. **Pre-launch** -- build credibility and audience before anyone can install
2. **Launch** -- coordinated spike across 2-3 channels in 48 hours
3. **Post-launch** -- compound organic growth through content, community, and product-led loops

We are not selling software. We are building adoption for a free OSS tool, then monetizing the hosted collaboration layer later (V3). The GTM goal for V1 is **installs and community**, not revenue.

---

## 2. Channel Prioritization

### 2.1 The Lean Channel Stack

Use the **2-2-1 formula**: 2 spike channels, 2 compounding channels, 1 consistent community.

| Channel | Type | Expected Impact | Cost | Priority |
|---|---|---|---|---|
| **Hacker News** | Spike | 10-30K visitors, 1.5-2.5% install conversion | $0 | P0 |
| **Product Hunt** | Spike | 1.5-2.5K visitors, best-in-category badge | $0 | P1 |
| **GitHub** | Compounding | Stars → credibility → organic discovery | $0 | P0 |
| **Technical blog** | Compounding | SEO, evergreen traffic, thought leadership | $0 | P0 |
| **Discord** | Community | Post-launch engagement, support, feedback | $0 | P0 |

### 2.2 Why This Order

**Hacker News first.** Our ICP (developers at startups using AI coding agents) lives on HN. A front-page Show HN drives 10-30K visitors in hours with 80-90% developer composition. This is the single highest-leverage launch event for a dev tool.

**GitHub second.** Stars are the credibility currency for OSS dev tools. Every star is a signal to the next evaluator. GitHub README is a permanent landing page.

**Blog third.** Content compounds. A post published today still drives traffic in 6 months. Start pre-launch so early posts index before launch day.

**Product Hunt as supplement, not primary.** PH traffic skews toward product managers and early adopters, not developers. It provides social proof ("Product of the Day") but not deep technical engagement. Launch on PH 1-2 weeks after HN.

**Discord as home base.** Post-launch community where users get support, give feedback, and become advocates. Not a launch channel -- a retention channel.

### 2.3 Channels We Explicitly Skip (For Now)

| Channel | Why Skip | Revisit When |
|---|---|---|
| **Paid ads** | Pre-revenue, no budget, no conversion tracking yet | Post-launch with analytics in place |
| **LinkedIn organic** | Our ICP doesn't discover dev tools on LinkedIn | Enterprise sales motion (V3+) |
| **Twitter/X paid** | Organic engagement first | We have 1K+ engaged followers |
| **Conferences** | High cost, low ROI at pre-launch | Product is stable, have demo to show |
| **Email outreach** | Cold email to developers is anti-pattern | Inbound list from signups |

---

## 3. Messaging Strategy

### 3.1 Core Message

**One-liner:** Peril turns visual UX feedback into structured, agent-executable tasks via MCP.

**Hero message:** Point at what's wrong. Your coding agent gets everything it needs to fix it.

**Problem statement:** AI coding agents are powerful, but they can't see your UI. Designers, PMs, and QA spot issues instantly -- but translating "this button looks broken on mobile" into an agent-actionable task loses precision, context, and time.

### 3.2 Message by Channel

| Channel | Message Angle | Tone |
|---|---|---|
| **Hacker News** | Technical depth. How it works under the hood. Multi-locator strategy, MCP architecture. | Engineer-to-engineer |
| **Product Hunt** | Outcome-focused. "Your agent fixes it." Before/after of the feedback workflow. | Accessible, demo-forward |
| **GitHub README** | Install instructions first. What it does in 2 sentences. Code example. | Scannable, technical |
| **Blog** | Problem-framing. "Every team using AI agents hits the same wall." | Thought leadership |
| **Discord** | Support, tips, real conversations. | Peer, casual |

### 3.3 Audience-Specific Messaging

**For IC engineers:**
> Add `<ReviewProvider>` to your app. Toggle review mode. Every annotation becomes an MCP tool call with locators, screenshots, and DOM context.

**For engineering leads:**
> Stop translating designer feedback into agent tasks. Peril does it automatically.

**For PMs/designers/QA:**
> See a bug? Click it. Add your comment. The agent handles the rest.

---

## 4. Pre-Launch Phase (Weeks -4 to 0)

### 4.1 Lean Validation

Before building any marketing assets, validate assumptions:

| Hypothesis | Test | Minimum Signal |
|---|---|---|
| Developers feel the feedback bottleneck | 5 conversations with target users | 4/5 confirm the pain |
| "Agent-native" framing resonates | A/B test 2 headlines on landing page | >5% CTR on winning variant |
| HN audience cares about this problem | Post a "Show HN" draft to 3 developers for feedback | Positive signal on title and framing |

### 4.2 Pre-Launch Checklist

- [ ] **GitHub repo public** with polished README (install, screenshot, architecture diagram)
- [ ] **Marketing site live** with hero, demo, and email capture
- [ ] **Blog post #1 published** ("Every team using AI agents hits the same wall")
- [ ] **Blog post #2 published** (technical deep-dive on multi-locator strategy)
- [ ] **Discord server set up** with channels: #general, #help, #feedback, #showcase, #announcements
- [ ] **Analytics instrumented** (see `docs/analytics-framework.md`)
- [ ] **Show HN post drafted and reviewed** (see `docs/launch-playbook.md`)
- [ ] **Product Hunt page prepared** (tagline, screenshots, maker comment)
- [ ] **Social accounts active** (Twitter/X, Reddit presence established through organic engagement)

### 4.3 Content Seeding

Start publishing 2-4 weeks before launch:

| Week | Content | Channel | Goal |
|---|---|---|---|
| -4 | "The feedback bottleneck in agentic development" | Blog + Twitter/X | Frame the problem |
| -3 | "How we built multi-strategy locator bundles" | Blog + Reddit (r/programming) | Technical credibility |
| -2 | "MCP tools your AI agent actually needs" | Blog + HN (comment, not post) | MCP ecosystem presence |
| -1 | Teaser: "Something new for teams using AI coding agents" | Twitter/X + Discord | Build anticipation |

---

## 5. Launch Phase (48 Hours)

### 5.1 Launch Sequence

See `docs/launch-playbook.md` for detailed execution. Summary:

| Time | Action | Owner |
|---|---|---|
| T-0 (Tuesday 8am ET) | Post Show HN | CMO |
| T+1h | Author self-comment with technical details | CMO |
| T+2h | Engage every comment on HN | CMO + CEO |
| T+4h | Cross-post summary to Twitter/X | CMO |
| T+6h | Post to r/programming, r/webdev | CMO |
| T+24h | Email announcement to captured list | CMO |
| T+7d | Product Hunt launch | CMO |

### 5.2 Launch Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| HN visitors (48h) | 10,000+ | Analytics |
| GitHub stars (week 1) | 500+ | GitHub |
| npm installs (week 1) | 200+ | npm stats |
| Discord members (week 1) | 100+ | Discord |
| Blog post views (week 1) | 5,000+ | Analytics |

---

## 6. Post-Launch Phase (Ongoing)

### 6.1 The PLG Flywheel

```
Developer discovers Peril (HN, GitHub, blog, word of mouth)
    → Installs SDK in 5 minutes
    → Team members start annotating
    → Annotations feed into coding agents
    → Team sees faster bug resolution
    → Team wants shared cloud dashboard (V3)
    → Upgrade to Team tier ($29/seat)
    → More team members added
    → Word-of-mouth to other teams
```

### 6.2 Post-Launch Channel Cadence

| Channel | Frequency | Content Type |
|---|---|---|
| **Blog** | 2x/month | Technical deep-dives, use cases, ecosystem updates |
| **Twitter/X** | 3-5x/week | Tips, release notes, dev community engagement |
| **GitHub** | Continuous | README updates, issue triage, release notes |
| **Discord** | Daily | Support, conversations, community engagement |
| **Reddit** | 1-2x/month | Valuable contributions to relevant threads (never promotional) |
| **HN** | Organic | Comment on relevant threads, never self-promote after launch |

### 6.3 Growth Milestones

| Milestone | Trigger | Action |
|---|---|---|
| 1K GitHub stars | Organic threshold | Write "1K stars: what we learned" blog post |
| 500 npm installs | Adoption signal | Start collecting user stories |
| 100 Discord members | Community signal | Appoint community moderator |
| First enterprise inbound | Market signal | Begin enterprise sales research |
| 10K monthly site visitors | Traffic threshold | Consider paid acquisition tests |

---

## 7. Lean Startup Principles Applied

### 7.1 Build-Measure-Learn for Marketing

Every marketing initiative follows the same loop:

1. **Hypothesis**: "HN developers will care about the agent feedback bottleneck"
2. **Minimum viable test**: Draft a Show HN post, share with 5 developers for feedback
3. **Measure**: Track HN points, comments, traffic, installs
4. **Learn**: Did the framing work? What questions did people ask? What objections came up?
5. **Iterate**: Adjust messaging for the next channel based on what worked

### 7.2 Channel Elimination

If a channel doesn't produce signal within 2 weeks of active investment, drop it. Lean startups cannot afford to maintain dead channels.

| Channel | Kill Signal | Pivot To |
|---|---|---|
| Blog post gets <500 views | Topic/distribution is wrong | Different topic, different distribution |
| Reddit post gets downvoted | Wrong subreddit or tone | Comment engagement only |
| Discord stays <50 members after 30 days | Too early for community | Focus on GitHub + blog |
| Twitter/X engagement <2% | Audience not there | Double down on HN + Reddit |

### 7.3 Budget Discipline

Pre-revenue budget is $0. Everything is time-cost only. The only currency we spend is founder/team hours.

| Activity | Weekly Time Budget | Owner |
|---|---|---|
| Content creation (blog) | 4-6 hours | CMO |
| Community engagement | 2-3 hours/day | CMO |
| Social media | 1 hour/day | CMO |
| Analytics review | 1 hour/week | CMO |
| Channel experiments | 2 hours/week | CMO |

When we reach $0 → paid: only after analytics framework is in place, attribution is working, and we have a proven organic baseline to compare against.

---

## 8. Competitive Positioning in GTM

### 8.1 Category Creation

We are not entering the "visual bug tracking" category. We are creating the "agent-native UI review" category.

**Category definition:** Tools that convert visual human feedback into structured, machine-readable tasks for AI coding agents.

**Why category creation matters:** If we position against Marker.io/BugHerd, we fight on their terms (features, price, integrations). If we create a new category, we define the terms.

### 8.2 Competitive Mentions

| Situation | Response |
|---|---|
| "How is this different from Marker.io?" | "Marker.io creates tickets for humans. Peril creates tasks for agents. Same visual feedback, different output." |
| "Why not just screenshot + paste?" | "That works for one bug. Peril turns a review session into a structured queue agents process without you prompting each one." |
| "Jam.dev does AI too" | "Jam writes bug reports for developers. Peril writes structured tasks for coding agents. Different consumer, different format." |

---

## 9. Dependencies and Risks

### 9.1 GTM Dependencies

| Dependency | Owner | Status | Blocks |
|---|---|---|---|
| Marketing site live | Frontend Engineer (PER-45-49) | In progress | Launch |
| Interactive demo working | SDK/Capture Engineer (PER-51) | Todo | Launch effectiveness |
| Analytics instrumented | CMO | Not started | Post-launch measurement |
| SEO foundations | Backend/MCP Engineer (PER-56) | Assigned | Organic search growth |

### 9.2 Risk Mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| HN post doesn't reach front page | Medium | Have 2-3 backup titles tested. Time posting for Tuesday 8am ET. Prepare quality self-comment. |
| Product not ready for launch | Medium | Launch only when core flow works end-to-end. Better to delay than launch broken. |
| No organic traction after launch | Medium | Pivot to content-heavy strategy. Write 4+ technical blog posts per month. |
| Competitor launches similar tool | Low-Medium | Move fast. Category-defining positioning and community lock-in before they catch up. |

---

## 10. GTM Calendar (Template)

| Week | Phase | Key Activities |
|---|---|---|
| -4 | Pre-launch | Publish problem-framing blog post. Set up Discord. |
| -3 | Pre-launch | Publish technical deep-dive. Begin Reddit engagement. |
| -2 | Pre-launch | Finalize marketing site. Prepare launch assets. |
| -1 | Pre-launch | Final review of Show HN post. Product Hunt page prep. |
| 0 | Launch | Show HN. Cross-post to social. Email announcement. |
| +1 | Launch | Product Hunt launch. Continue HN engagement. |
| +2 | Post-launch | First user stories. Begin content cadence. |
| +4 | Post-launch | Analyze launch data. Adjust channel mix. |
| +8 | Growth | Monthly content cadence established. Community growing. |
| +12 | Growth | Consider first paid acquisition test if analytics baseline exists. |
