# Peril -- Paid Acquisition Framework

**Date:** 2026-03-10
**Author:** CMO
**Issue:** PER-85

---

## 1. Paid Acquisition Philosophy

Peril is pre-revenue. We have no ad budget. This document prepares the framework so that when we do invest in paid channels, we do it with discipline, measurement, and lean experimentation.

**Lean startup principle:** Don't spend money acquiring users until you know (a) which users convert, (b) what they convert to, and (c) that the organic baseline exists to compare against.

**When to activate paid acquisition:**

- [ ] Analytics framework is instrumented (see `docs/analytics-framework.md`)
- [ ] Organic baseline traffic is stable for 30+ days
- [ ] At least one conversion event is defined and tracking (npm install, demo interaction, email signup)
- [ ] First paying customers exist (V3) -- don't pay to acquire free users unless the free-to-paid funnel is proven

---

## 2. Channel Framework

### 2.1 Platform Priorities

| Platform | Audience Match | Ad Type | When to Use | Priority |
|---|---|---|---|---|
| **Google Ads** | High-intent search | Search (text) | Users actively searching for solutions | P0 (first to test) |
| **Reddit Ads** | Niche developer communities | Promoted posts | Targeting specific subreddits | P1 |
| **Twitter/X Ads** | Developer conversation | Promoted tweets | Retargeting, amplifying organic hits | P2 |
| **LinkedIn Ads** | Engineering leads, B2B | Sponsored content | Enterprise leads (V3+) | P3 |
| **Meta (Facebook/Instagram)** | Low dev audience overlap | Retargeting | Retargeting only (if ever) | P4 |

### 2.2 Why This Order

**Google Ads first:** Captures existing intent. When someone searches "visual feedback tool for AI agents," they already have the problem. Google Ads is the lowest-risk first test because you pay only when someone with proven intent clicks.

**Reddit second:** Subreddit targeting is the killer feature for developer tools. r/ChatGPTCoding, r/ClaudeAI, r/webdev are precisely our ICP. Promoted posts that read like organic content (not corporate-speak) perform well.

**Twitter/X third:** Best for retargeting and amplifying organic content that's already performing. Don't use for cold acquisition -- too expensive for the conversion rate.

**LinkedIn last:** Engineering leads on LinkedIn respond to content-led ads (blog posts, case studies) not product ads. Save for enterprise motion (V3+) when the LTV justifies the CPL ($50-150).

---

## 3. Google Ads Plan

### 3.1 Campaign Structure

```
Account
├── Campaign: Brand (Search)
│   └── Ad Group: Brand Terms
│       ├── "peril dev tool"
│       ├── "peril mcp"
│       └── "peril visual feedback"
│
├── Campaign: High Intent (Search)
│   ├── Ad Group: Agent Feedback
│   │   ├── "visual feedback coding agent"
│   │   ├── "MCP bug reporting tool"
│   │   └── "AI code review visual feedback"
│   │
│   ├── Ad Group: MCP Tools
│   │   ├── "MCP tools for developers"
│   │   ├── "MCP server visual review"
│   │   └── "Claude Code MCP tools"
│   │
│   └── Ad Group: Alternative Seekers
│       ├── "Marker.io alternative"
│       ├── "BugHerd alternative"
│       └── "visual bug reporting tool open source"
│
└── Campaign: Competitor (Search) [Phase 2]
    └── Ad Group: Competitor Terms
        ├── "marker.io"
        ├── "bugherd"
        └── "jam.dev" (only if budget allows)
```

### 3.2 Keyword Research

**Exact match (highest priority):**

| Keyword | Estimated CPC | Monthly Volume | Intent |
|---|---|---|---|
| [visual feedback coding agent] | $2-5 | <100 | Very High |
| [MCP bug reporting] | $1-3 | <100 | Very High |
| [AI code review tool] | $5-10 | 500-1K | High |
| [visual bug reporting tool] | $3-7 | 200-500 | High |
| [marker.io alternative] | $5-12 | 100-200 | High |
| [MCP tools developers] | $2-5 | 100-200 | Medium-High |

**Phrase match (broader reach):**

| Keyword | Estimated CPC | Notes |
|---|---|---|
| "visual feedback for agents" | $2-5 | Our category term |
| "bug reporting AI" | $3-8 | Broader but relevant |
| "MCP server" | $1-3 | Educational intent, may not convert |

### 3.3 Negative Keywords

Critical for dev tools to avoid wasting spend:

```
peril definition, peril meaning, peril insurance, peril game,
yellow peril, mortal peril, grave peril,
free game, movie, book, jobs, salary, course,
bug spray, bug zapper, bug repellent,
visual basic, visual studio (unless targeting VS Code users)
```

### 3.4 Ad Copy Templates

**High-Intent Search Ad:**
```
Headline 1: Visual Feedback for AI Agents
Headline 2: Open Source, MCP-Native
Headline 3: npm install @peril/react
Description 1: Point at a UI bug. Your coding agent gets locators, screenshots,
               and DOM context via MCP. Free and open source.
Description 2: Multi-strategy locators. Agent-ready output. Works with Claude Code,
               Codex, Cursor. Try the demo.
```

**Alternative-Seeker Ad:**
```
Headline 1: Beyond Bug Trackers
Headline 2: Built for AI Coding Agents
Headline 3: Free Open Source Tool
Description 1: Bug trackers create tickets for humans. Peril creates structured
               tasks for coding agents. MCP-native, MIT licensed.
Description 2: Multi-strategy locators, element screenshots, DOM context.
               Everything an agent needs to fix UI bugs.
```

### 3.5 Landing Pages

Each campaign should point to a specific landing page, not the homepage:

| Campaign | Landing Page | Key Element |
|---|---|---|
| High Intent | /from/search | Demo + install command + MCP explanation |
| Alternative Seekers | /compare | Comparison table vs. Marker.io/BugHerd |
| Brand | / (homepage) | Standard hero + demo |

### 3.6 Budget and Testing

**Initial test budget:** $500-1,000 over 2 weeks
**Daily budget:** $25-50/day
**Goal:** Determine CPA (cost per npm install) and CTR by keyword group

| Phase | Duration | Budget | Goal |
|---|---|---|---|
| Test | 2 weeks | $500-1,000 | Validate CPC, CTR, and conversion by keyword |
| Optimize | 2 weeks | $500-1,000 | Pause losers, scale winners |
| Scale (if ROI positive) | Ongoing | $1,000-3,000/mo | Maintain CPA below target |

**Kill criteria:** If CPA exceeds $50 for npm installs after 2 weeks of testing, pause and reassess messaging/landing page before reinvesting.

---

## 4. Reddit Ads Plan

### 4.1 Targeting

| Subreddit | Audience Size | Relevance | Estimated CPM |
|---|---|---|---|
| r/ChatGPTCoding | 200K+ | Very High | $5-15 |
| r/ClaudeAI | 100K+ | Very High | $5-15 |
| r/programming | 6M+ | High | $8-20 |
| r/webdev | 2M+ | High | $8-20 |
| r/SideProject | 100K+ | Medium | $5-10 |

### 4.2 Ad Format

**Promoted posts only.** Banner ads are ignored by developers. Promoted posts that look like organic content perform 3-5x better.

**Format rules:**
- Write like a Reddit user, not a marketer
- Lead with a problem or insight, not a product pitch
- Include a demo GIF or screenshot
- Disclose clearly that it's sponsored (Reddit does this automatically)
- Don't use corporate language (no "leverage," "synergy," "disrupt")

**Template:**
```
Title: Built an open-source tool that turns visual UI annotations into
       structured MCP tasks for AI coding agents

Body: Been working on Peril — an annotation overlay for React apps that
captures element locators, screenshots, and DOM context, then serves them
to your coding agent via MCP.

The problem it solves: if you're using Claude Code or Codex, someone on
your team spots a UI bug and pastes a screenshot in chat. The agent can't
reliably act on that. Peril lets anyone click the element, add a comment,
and the agent gets structured, actionable data.

Free, MIT licensed. [Demo GIF]

npm install @peril/react

Would love feedback from anyone using MCP with their agents.
```

### 4.3 Budget

**Initial test:** $300-500 over 2 weeks, split across 2-3 subreddits
**Goal:** CPC < $3, CTR > 0.5%

---

## 5. Twitter/X Ads Plan

### 5.1 Strategy

Use Twitter/X ads for two purposes only:

1. **Amplifying organic hits.** When a tweet gets organic traction (>500 impressions, >5% engagement), promote it for $50-100 to extend reach.
2. **Retargeting.** Show ads to users who visited the site but didn't install.

### 5.2 Audience Targeting

- **Follower lookalikes:** @AnthropicAI, @OpenAI, @veraborovets (MCP), @cursor_ai, @lineaborgs
- **Interest targeting:** Software development, AI, developer tools
- **Retargeting:** Site visitors who viewed the demo page

### 5.3 Budget

**Amplification:** $100-200/month (only for tweets that are already performing)
**Retargeting:** $100-200/month (only when site traffic exceeds 5K/month)

---

## 6. LinkedIn Ads Plan (V3+ Only)

Not activated until enterprise sales motion begins. Framework for when it's ready:

### 6.1 Targeting

| Criteria | Value |
|---|---|
| Job titles | Engineering Lead, VP Engineering, Head of Product, CTO |
| Company size | 50-500 employees |
| Industry | Software, Technology, SaaS |
| Seniority | Manager, Director, VP |

### 6.2 Ad Format

**Sponsored content only.** Lead with blog posts or case studies, not product ads.

**Template:**
```
Every team using AI coding agents hits the same wall: someone sees a UI bug
but can't describe it in a way the agent can act on.

We wrote about how structured visual feedback improves AI agent resolution
rates by 20%.

[Link to blog post]
```

### 6.3 Budget

**Not before V3.** When activated: $2,000-5,000/month minimum to reach statistical significance with LinkedIn's CPMs ($30-80).

---

## 7. Attribution and Tracking

### 7.1 UTM Convention

All paid links use consistent UTM parameters:

```
utm_source={platform}     → google, reddit, twitter, linkedin
utm_medium=paid           → always "paid" for paid channels
utm_campaign={campaign}   → high-intent, alternative-seekers, retargeting
utm_content={variant}     → ad-a, ad-b (for A/B testing)
utm_term={keyword}        → keyword or audience targeted
```

**Example:**
```
https://peril.dev/?utm_source=google&utm_medium=paid&utm_campaign=high-intent&utm_term=visual-feedback-coding-agent
```

### 7.2 Conversion Events

| Event | Priority | Description |
|---|---|---|
| Site visit | Leading | Visitor lands on site |
| Demo interaction | Leading | Visitor interacts with embedded demo |
| npm install intent | Primary | Visitor clicks/copies install command |
| Email signup | Secondary | Visitor subscribes to updates |
| GitHub star | Secondary | Visitor stars the repo |

### 7.3 Reporting

Weekly report during active campaigns:

| Metric | Target |
|---|---|
| CPC (cost per click) | < $5 (Google), < $3 (Reddit) |
| CTR (click-through rate) | > 2% (Google), > 0.5% (Reddit) |
| CPA (cost per install) | < $50 |
| ROAS | Positive at V3 pricing |

---

## 8. A/B Testing Framework

### 8.1 What to Test

| Element | Test | Minimum Sample |
|---|---|---|
| **Headlines** | Outcome-first vs. mechanism-first | 500 impressions each |
| **CTAs** | "Try the demo" vs. "npm install" | 500 impressions each |
| **Landing pages** | Demo-first vs. feature-first | 200 visitors each |
| **Ad copy** | Problem-framing vs. solution-framing | 500 impressions each |

### 8.2 Testing Discipline

1. **Test one variable at a time.** Changing headline and CTA simultaneously invalidates the test.
2. **Minimum 500 impressions per variant** before drawing conclusions.
3. **95% confidence minimum** before declaring a winner.
4. **Document every test.** Results, learnings, and decisions in a shared log.
5. **Kill losers fast.** Don't run a losing variant for "more data" when the signal is clear.

---

## 9. Budget Allocation Model

### 9.1 The 70-20-10 Rule

When paid acquisition is activated:

| Allocation | Description | Example |
|---|---|---|
| **70%** | Proven channels that are delivering ROI | Google Ads high-intent keywords |
| **20%** | Promising channels being tested and optimized | Reddit Ads to specific subreddits |
| **10%** | Experimental channels with unproven ROI | Twitter amplification, new keyword groups |

### 9.2 Monthly Budget by Phase

| Phase | Monthly Budget | Allocation |
|---|---|---|
| **Pre-revenue (V1-V2)** | $0 | Organic only |
| **First revenue (V3 early)** | $500-1,000 | 100% Google Ads testing |
| **Product-market fit** | $2,000-5,000 | 60% Google, 25% Reddit, 15% experiment |
| **Growth** | $5,000-15,000 | 50% Google, 20% Reddit, 15% LinkedIn, 15% experiment |

---

## 10. Lean Startup Paid Acquisition Principles

1. **Organic first, always.** Paid amplifies what organic proves works. Never lead with paid.

2. **$500 tests save $50,000 mistakes.** Every new channel, keyword, or creative gets a small test before real budget.

3. **If you can't measure it, don't spend on it.** Attribution must be in place before the first dollar is spent.

4. **CAC must make sense at the unit economics level.** At $29/seat Team tier with 24-month avg retention: LTV = ~$3,500. Target CAC < $200 for a healthy 17:1 LTV:CAC. Anything above $500 CAC is a red flag.

5. **Paid is a tax on not having product-market fit.** If organic channels aren't growing, paid won't fix it. Fix the product or messaging first.

6. **Never compete on budget.** Established players (Marker.io, Jam.dev) can outspend us on broad keywords. Win on specificity: target narrow, high-intent queries where competition is low and relevance is high.

7. **Weekly review, monthly decisions.** Check performance weekly, but make budget reallocation decisions monthly. Short-term noise is not signal.
