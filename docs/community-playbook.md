# Peril -- Community Engagement Playbook

**Date:** 2026-03-10
**Author:** CMO
**Issue:** PER-85

---

## 1. Community Philosophy

Developer tools live or die on community trust. One promotional post on Reddit gets you banned. One defensive response on HN poisons the thread. One ignored question on Discord loses a potential advocate.

**Lean startup principle:** Community is a feedback channel first, a growth channel second. Every community interaction is a chance to learn what developers need, not just a chance to promote Peril.

**Core rule:** Presence over promotion. Show up, be helpful, share genuine insights. Let the product speak.

---

## 2. Platform Strategy

### 2.1 Platform Priorities

| Platform | Role | Investment | Phase |
|---|---|---|---|
| **Discord** | Home base, support, feedback | High (daily) | Pre-launch |
| **Hacker News** | Credibility, technical discussion | Medium (selective) | Launch + ongoing |
| **Reddit** | Niche audience engagement | Medium (2-3x/week) | Pre-launch |
| **Twitter/X** | Broadcasting, conversation, ecosystem | Medium (daily) | Pre-launch |
| **GitHub** | Issue triage, contributor community | Ongoing (reactive) | Pre-launch |
| **Bluesky** | Growing developer audience | Low (mirror Twitter) | Post-launch |

### 2.2 What We Don't Do

- **LinkedIn organic:** Our ICP doesn't discover dev tools on LinkedIn. Skip until enterprise sales.
- **Facebook groups:** Wrong audience demographics entirely.
- **Slack communities:** Too fragmented, high maintenance. Discord is the standard for dev tool communities.
- **YouTube:** High production cost, low ROI at pre-launch. Revisit when we have demo content worth filming.

---

## 3. Discord Server

### 3.1 Server Setup

**Channel structure:**

```
PERIL
├── #welcome           → Auto-greeting, rules, quickstart link
├── #announcements     → Releases, blog posts, milestones (read-only)
├── #general           → Open discussion
├── #help              → Support questions, troubleshooting
├── #feedback          → Feature requests, suggestions
├── #showcase          → Users sharing what they built with Peril
├── #mcp-agents        → Discussion about MCP, agent integrations
└── #off-topic         → Casual chat, keep it human
```

**Roles:**
- `@team` -- Peril team members (badge, not special permissions beyond moderation)
- `@contributor` -- Open-source contributors (awarded after first merged PR)
- `@early-adopter` -- First 100 members

### 3.2 Community Guidelines

Post in #welcome:

```
Welcome to the Peril community.

Rules:
1. Be helpful. If someone asks a question, try to help.
2. Be respectful. Disagree on ideas, not people.
3. No self-promotion without context. Sharing your work using Peril is great. Dropping links to unrelated products is not.
4. Bugs go to #help or GitHub Issues. Both are fine.
5. Feature requests go to #feedback.

We're a small team building in the open. Your feedback shapes the product.
```

### 3.3 Engagement Cadence

| Activity | Frequency | Owner |
|---|---|---|
| Respond to #help questions | Within 4 hours during business hours | CMO / Engineering |
| Post in #announcements | Every release, blog post, milestone | CMO |
| Engage in #general | Daily | CMO |
| Review #feedback | Weekly summary to team | CMO |
| Community health check (member count, active members, message volume) | Weekly | CMO |

### 3.4 Growth Targets

| Milestone | Timeframe | Signal |
|---|---|---|
| 50 members | Launch week | Launch worked |
| 100 members | Month 1 | Organic growth starting |
| 250 members | Month 3 | Community taking shape |
| 500 members | Month 6 | Self-sustaining conversations |

### 3.5 When to Consider a Moderator

Hire a community moderator (volunteer or paid) when:
- Daily message volume exceeds 50 messages consistently
- Support questions take longer than 4 hours to answer
- Time zones create coverage gaps
- Spam/moderation issues appear weekly

---

## 4. Hacker News

### 4.1 Rules of Engagement

HN has unwritten rules that are strictly enforced by the community and moderators:

**Do:**
- Comment on relevant threads with genuine technical insight
- Share Peril only when directly relevant to the discussion
- Answer questions about your technology with depth
- Acknowledge limitations honestly
- Upvote thoughtful comments (including critical ones)

**Never:**
- Post Peril links more than once per quarter (outside Show HN)
- Ask anyone to upvote your posts
- Create multiple accounts to engage
- Get defensive about criticism
- Use marketing language

### 4.2 Engagement Strategy

**Pre-launch (4 weeks before):**
- Comment on threads about AI coding agents, MCP, visual feedback, bug tracking
- Share genuine insights, not Peril pitches
- Build a comment history that establishes technical credibility

**Launch:**
- One Show HN post (see `docs/launch-playbook.md`)
- Respond to every comment within 30 minutes for the first 4 hours

**Post-launch:**
- Comment on relevant threads 1-2x per week
- Never link to Peril unless directly relevant
- Share blog posts only if they're exceptionally technical and useful

### 4.3 Thread Topics to Engage With

| Topic | Engagement Approach |
|---|---|
| "AI coding agents can't handle visual bugs" | Share the problem framing, mention Peril only if directly asked |
| "Best MCP tools for development" | Add Peril to the list with honest description |
| "Visual feedback for web development" | Discuss locator strategies, mention Peril as context |
| "Show HN: [competitor tool]" | Engage genuinely, never trash-talk, mention how approaches differ if asked |
| "Problems with AI code review" | Share insights from building Peril |

---

## 5. Reddit

### 5.1 Subreddit Targeting

| Subreddit | Members | Relevance | Engagement Style |
|---|---|---|---|
| **r/programming** | 6M+ | High | Technical posts, code discussion |
| **r/webdev** | 2M+ | High | Practical dev tools, tutorials |
| **r/ChatGPTCoding** | 200K+ | Very High | AI coding agent users, our core ICP |
| **r/ClaudeAI** | 100K+ | Very High | Claude Code users |
| **r/SideProject** | 100K+ | Medium | Maker community, Show HN equivalent |
| **r/reactjs** | 400K+ | Medium | React-specific discussion |

### 5.2 Reddit Rules

**Each subreddit has its own rules.** Read them before posting. Common patterns:

- **r/programming:** No self-promotion posts. Share useful technical content. Comment often before posting.
- **r/webdev:** Self-promotion allowed in weekly threads only. Helpful tools appreciated if demonstrated genuinely.
- **r/ChatGPTCoding:** Very receptive to tools that improve agent workflows. Show real usage.
- **r/ClaudeAI:** Active MCP discussion. Tool recommendations welcomed. Be honest about what works and doesn't.

### 5.3 Reddit Posting Guidelines

1. **Comment first, post later.** Build karma and credibility in each subreddit for 2+ weeks before posting.
2. **Always disclose.** "I built this" or "I'm the maker" -- Reddit respects transparency.
3. **Lead with value.** "Here's how we solved locator resilience across DOM changes" > "Check out our new tool"
4. **Don't cross-post.** Each subreddit gets unique content tailored to its norms.
5. **Respond to every comment.** If someone takes time to comment, respond substantively.
6. **Never use corporate-speak.** Reddit detects and destroys marketing language.

### 5.4 Content Templates

**For r/programming (technical):**
```
Title: Multi-strategy locator bundles: how we built element identification that survives DOM changes

Body: [Technical explanation of the problem and approach, with code examples.
Mention Peril at the end: "We built this as part of Peril, an open-source
visual feedback tool for AI coding agents. Happy to answer questions about
the approach."]
```

**For r/ChatGPTCoding (use case):**
```
Title: Built an annotation tool that outputs structured MCP tasks for Claude Code

Body: [Demo GIF. 3-sentence description of what it does.
"npm install @peril/react" and quick setup.
"It's free and open source. Would love feedback on what else agents need
to fix visual bugs."]
```

---

## 6. Twitter/X

### 6.1 Account Strategy

**Approach:** Build presence through engagement, not broadcasting. Developers follow people who say interesting things, not brands that announce features.

**Posting cadence:**
- 3-5 tweets per week (not counting replies)
- Engage with 5-10 relevant tweets daily (replies, quotes)
- Thread format for technical content (5-7 tweets max)

### 6.2 Content Mix

| Content Type | Frequency | Example |
|---|---|---|
| **Technical insight** | 2x/week | "Five locator strategies, ranked by resilience: testId > ARIA > CSS > XPath > text. Here's why order matters for agent code review..." |
| **Problem observation** | 1x/week | "Every team using AI agents eventually asks: 'How do I show the agent what's wrong on screen?' This is the feedback bottleneck." |
| **Release/update** | As needed | "Peril v0.2.0: Full-page screenshot capture. 23KB gzipped. Changelog: [link]" |
| **Community engagement** | Daily | Reply to threads about MCP, AI coding, visual feedback, dev tools |
| **Behind-the-scenes** | 1x/week | "We tried 3 different screenshot capture methods. SnapDOM won for speed. Here's the tradeoff matrix..." |

### 6.3 Engagement Rules

- Reply to everyone who mentions Peril or tags you
- Quote-tweet interesting takes about agent development with your perspective
- Never dunk on competitors
- Use code snippets in tweets (they get higher engagement from dev audience)
- GIFs/videos of the product working > static screenshots

### 6.4 Hashtags

Sparingly. Developers are suspicious of hashtag-heavy posts.

Acceptable: `#MCP`, `#opensource`, `#buildinpublic`
Avoid: `#AI`, `#developer`, `#startup`, `#innovation`

---

## 7. GitHub

### 7.1 GitHub as Community

GitHub is more than a code host. It's a discovery platform (trending repos), a credibility signal (stars), and a community space (issues, discussions).

### 7.2 README Optimization

The README is a permanent landing page. Structure:

1. **One-liner:** What Peril does (1 sentence)
2. **Demo GIF:** 15-second annotation flow
3. **Install:** `npm install @peril/react` (copyable)
4. **Quick start:** 5-line code example
5. **Features:** Bullet list, outcome-focused
6. **Architecture:** Simple diagram
7. **Links:** Docs, Discord, blog
8. **Contributing:** How to help
9. **License:** MIT

### 7.3 Issue Triage

| Label | Response Time | Action |
|---|---|---|
| `bug` | < 24 hours | Acknowledge, reproduce, prioritize |
| `feature-request` | < 48 hours | Thank, discuss feasibility, label appropriately |
| `question` | < 24 hours | Answer or point to docs |
| `good-first-issue` | Keep 3-5 open | Tag simple tasks for new contributors |

### 7.4 Star Growth

Stars are vanity metrics, but they're the currency developers use to evaluate OSS tools.

**What drives stars:**
- HN front page (biggest single spike)
- Quality README with demo GIF
- Trending on GitHub (algorithmic, based on star velocity)
- Being mentioned in popular blog posts/tweets

**What doesn't drive stars:**
- Asking for stars (never do this)
- Star-for-star exchanges (fake, detectable)
- Badges that say "Star this repo!" (cringe)

---

## 8. Community Content Calendar

### 8.1 Weekly Rhythm

| Day | Platform | Activity |
|---|---|---|
| Monday | Discord | Weekly check-in: what are you building? |
| Tuesday | Twitter/X | Technical insight tweet |
| Wednesday | Reddit | Engage in relevant threads |
| Thursday | Twitter/X | Problem observation or behind-the-scenes |
| Friday | Discord + GitHub | Review feedback, triage issues |

### 8.2 Monthly Activities

| Activity | Purpose |
|---|---|
| Community spotlight | Highlight a user's work using Peril |
| Monthly recap | Blog post summarizing releases, community growth |
| Feature request review | Public discussion of top-voted feature requests |
| AMA in Discord | Open Q&A with the team |

---

## 9. Metrics

| Metric | Target (Month 1) | Target (Month 3) | Target (Month 6) |
|---|---|---|---|
| Discord members | 100 | 250 | 500 |
| Discord weekly active | 30 | 75 | 150 |
| Twitter/X followers | 200 | 500 | 1,500 |
| GitHub stars | 500 | 1,500 | 3,000 |
| Reddit karma in target subs | 500 | 1,500 | 3,000 |
| Monthly community-sourced bug reports | 10 | 30 | 50 |

---

## 10. Anti-Patterns

| Mistake | Why It Fails | What to Do Instead |
|---|---|---|
| Posting the same content everywhere | Each platform has different norms | Tailor content per platform |
| Only posting announcements | Community feels like a broadcast channel | Engage in conversations |
| Ignoring negative feedback | Erodes trust, perceived as arrogant | Respond, acknowledge, explain |
| Automated posting/replies | Developers detect and resent automation | Write every post yourself |
| Over-moderating | Kills organic conversation | Only moderate spam and personal attacks |
| Abandoning the community | Nothing worse than a dead Discord | If you start it, maintain it |

---

## 11. Lean Startup Community Principles

1. **Community is a learning channel.** Every question reveals a documentation gap. Every feature request is a data point. Track them.

2. **Start small.** It's better to have 20 active members who love the product than 1,000 silent ones. Quality > quantity.

3. **Be present, not perfect.** Respond quickly with honest answers. "I don't know, but I'll find out" beats silence.

4. **Let the community shape the product.** The feedback from your first 50 users is more valuable than any market research. Listen actively.

5. **Don't scale community before product-market fit.** Growing a community around a product that's still finding its fit creates noise, not signal.

6. **Organic first, always.** Paid community growth is an anti-pattern for dev tools. Every member should arrive because the tool is useful, not because an ad told them to join.
