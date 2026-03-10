# Peril -- Marketing Strategy Summary

**Date:** 2026-03-10
**Author:** CMO

Executive summary of Peril's 9 marketing strategy documents, organized by priority tier.

---

## What Peril Is

Peril turns visual UX feedback into structured, agent-executable tasks via MCP. No direct competitor bridges human visual feedback to agent-executable tasks. We're creating the "agent-native UI review" category.

**Primary audience:** Developers and engineering teams using AI coding agents (Claude Code, Codex, Cursor, Windsurf).

**V1 goal:** Installs and community, not revenue. Monetization begins at V3 (cloud dashboard, $29/seat Team tier).

---

## P0 -- Required Before Launch

### 1. Go-to-Market Playbook (`docs/gtm-playbook.md`)

**The 2-2-1 formula:** 2 spike channels, 2 compounding channels, 1 community.

| Channel | Type | Expected Impact |
|---|---|---|
| Hacker News (Show HN) | Spike | 10-30K visitors, 1.5-2.5% install conversion |
| Product Hunt | Spike | 1.5-2.5K visitors, badge social proof |
| GitHub + Blog | Compounding | Stars, SEO, evergreen traffic |
| Discord | Community | Support, feedback, retention |

**Three phases:**
1. **Pre-launch (weeks -4 to 0):** Content seeding, Discord setup, analytics, Show HN draft
2. **Launch (48 hours):** HN first, Twitter/X +4h, Reddit +6h, email +24h, Product Hunt +7d
3. **Post-launch:** Content cadence (2x/month blog), community engagement, PLG flywheel

**Budget:** $0. Time-cost only. Paid acquisition activates only after analytics baseline + first revenue.

**Category creation, not category entry.** We define "agent-native UI review" rather than competing in "visual bug tracking."

### 2. Launch Playbook (`docs/launch-playbook.md`)

**HN is the primary launch event.** Tuesday/Wednesday, 8-9 AM ET.

| Asset | Purpose |
|---|---|
| Show HN title (3 variants tested) | First impression -- under 80 chars, no buzzwords |
| Self-comment (800-1200 words) | Technical depth: what, why, how, stack, links, ask |
| Demo GIF (15 seconds) | Used across all channels |
| Product screenshots (3-4) | Annotation overlay, MCP output, dashboard |

**Critical rules:**
- Respond to every HN comment within 30 minutes for 4 hours
- Be honest about limitations ("That's V2")
- Never ask for upvotes
- Product Hunt launches 7-10 days after HN

**Launch success targets:** 10K+ HN visitors, 500+ GitHub stars, 200+ npm installs, 100+ Discord members (week 1).

**Crisis protocol:** If HN post gets killed, wait 1 week. If product is broken, fix immediately and post acknowledgment. Never get defensive.

### 3. SEO & Content Strategy (`docs/seo-content-strategy.md`)

**Three keyword clusters:**

| Cluster | Competition | Example Keywords |
|---|---|---|
| Agent Feedback | Very Low | "visual feedback coding agent," "MCP bug reporting tool" |
| AI Developer Tools | Medium | "AI code review tool," "MCP tools for developers" |
| Visual Feedback Tools | High | "Marker.io alternative," "visual bug reporting tool" |

**Content cadence:** 4 pre-launch posts (weeks -4 to -1), then 2/month post-launch.

**Content types:** Technical deep-dives (1,500-2,000 words), tutorials (1,000-1,500), comparisons (1,000-1,500), thought leadership (800-1,200).

**Quality bar:** Every post must teach something, include code within 500 words, and be shareable. Distribute to Twitter/X, Reddit, Discord, Dev.to (with canonical URL).

**Kill criteria:** Drop topics with zero Search Console impressions or <100 page views after 90 days.

---

## P1 -- Within 30 Days of Launch

### 4. Community Playbook (`docs/community-playbook.md`)

**Core rule:** Presence over promotion.

**Discord server:** 7 channels (#welcome, #announcements, #general, #help, #feedback, #showcase, #mcp-agents, #off-topic). Respond to #help within 4 hours.

**Platform engagement:**

| Platform | Approach |
|---|---|
| HN | Comment on relevant threads with genuine insight. Never link Peril unless asked. |
| Reddit | Build karma 2+ weeks before posting. Always disclose as maker. Tailor per subreddit. |
| Twitter/X | 3-5 tweets/week, engage 5-10 relevant tweets daily. Technical insights, not announcements. |
| GitHub | <24h issue response. Keep 3-5 `good-first-issue` tags open. |

**Growth targets:** 100 Discord members (month 1) → 250 (month 3) → 500 (month 6).

**Anti-patterns:** Same content everywhere, only posting announcements, ignoring negative feedback, automated replies, abandoning the community.

### 5. Paid Acquisition Framework (`docs/paid-acquisition-plan.md`)

**Not activated until:** Analytics instrumented, organic baseline stable 30+ days, conversion events tracking, first paying customers exist (V3).

**Platform priority:** Google Ads (P0) → Reddit Ads (P1) → Twitter/X Ads (P2) → LinkedIn (P3, V3+ only).

**Google Ads structure:** Brand campaign + High-Intent campaign (agent feedback, MCP tools, alternative seekers) + Competitor campaign (phase 2).

**Initial test:** $500-1,000 over 2 weeks. Kill if CPA exceeds $50/install after 2 weeks.

**Budget model (70-20-10):** 70% proven channels, 20% promising tests, 10% experiments.

**Target unit economics:** At $29/seat, 24-month retention → LTV ~$3,500. Target CAC < $200 (17:1 LTV:CAC).

**UTM convention:** `utm_source={platform}&utm_medium={paid|organic}&utm_campaign={name}&utm_content={variant}&utm_term={keyword}`.

### 6. Analytics Framework (`docs/analytics-framework.md`)

**Tool stack:** Plausible (website traffic, $9/mo) + PostHog (product analytics, free 1M events). No Google Analytics -- cookie consent banners repel developers.

**The funnel:**
```
Visitor → Engaged (>50%) → Intent signal (>10%) → Install (>5%) → Active (>40%) → Retained (>30%) → Team → Paid
```

**Key events:** `page_view`, `demo_interaction`, `install_copy`, `docs_click`, `github_click`, `email_signup`, `scroll_depth`.

**Attribution:** First-touch only for V1. Multi-touch at V3 when paid channels + revenue exist.

**Reporting cadence:** Daily dashboard glance (Plausible, 2 min), weekly deep dive (PostHog + Plausible, 15 min), monthly full analysis (30 min).

**One metric that matters:** Pre-launch = email signups. Launch week = npm installs. Post-launch = weekly active users.

**Privacy:** Cookie-free analytics. SDK telemetry opt-in only. No PII collected. `<ReviewProvider telemetry={false}>` to disable.

---

## P2 -- Within 90 Days of Launch

### 7. Developer Relations Playbook (`docs/devrel-playbook.md`)

**Strategy:** Earn trust by contributing to ecosystems, not promotional outreach.

**Integration guides (priority order):**
1. Claude Code (P0, launch week)
2. Codex (P0, launch +2 weeks)
3. Generic MCP (P1, launch week)
4. Cursor (P1, launch +4 weeks)
5. Windsurf (P2, post-launch)

**MCP ecosystem:** List on MCP directories, write "Designing MCP Tools Agents Want to Use" blog post, contribute to spec discussions.

**Events:** Attend and speak, don't sponsor. Meetups first, conferences second. Talks teach something -- Peril is context, not content.

**Partnerships:** Write great integration guides → share with partner DevRel teams → ask to be listed. Approach with value, not "let's partner."

**No DevRel hire before product-market fit.**

### 8. Email & Changelog Strategy (`docs/email-strategy.md`)

**Tool:** Buttondown (free to 100 subs, $9/mo to 1K). Markdown-native, developer-friendly.

**Email types (phased):**

| Phase | Email Type | Frequency |
|---|---|---|
| V1 | Changelog | Per release (1-2x/month) |
| V1 | Launch announcement | Once |
| V2 | Welcome sequence (3 emails / 7 days) | Triggered on signup |
| V3 | Monthly digest | Monthly |

**Capture points:** Site footer, blog footer, GitHub README, Discord welcome. One field (email only), no popups, no gating.

**Rules:** Plain text/Markdown emails. Under 300 words for changelogs. Lead with user benefit, not technical change. One-click unsubscribe. Never buy lists, never send "we miss you" emails.

**Targets:** >40% open rate, >8% click rate, <0.5% unsubscribe rate.

### 9. Brand Identity Guide (`docs/brand-guide.md`)

**Brand attributes:** Precise, technical, confident, trustworthy, developer-first.

**Colors:**
- Dark backgrounds: `#0a0a0f` (page), `#12121a` (cards), `#1e1e2e` (borders)
- Accent: TBD (warm amber/gold or distinctive violet -- avoid blue)
- Text: `#f0f0f5` (primary), `#8888a0` (secondary), `#55556a` (muted)

**Typography:** Serif/semi-serif for headlines, Inter for body, JetBrains Mono for code. Max 3 typefaces.

**Imagery:** Real product screenshots only (dark mode, 1440x900). No stock photos, no AI-generated decorative images, no 3D renders.

**Social assets:** og:image at 1200x630px per page. Twitter banner at 1500x500px. GitHub social preview at 1280x640px.

**Co-branding:** Use official partner logos unmodified. "Works with" label, never "Powered by."

**Banned words:** "revolutionary," "game-changer," "blazing fast," "leverage," "synergy," "disrupt," "next-generation," "cutting-edge," "best-in-class."

---

## Cross-Cutting Themes

### Lean Startup Discipline

Every document applies the same principles:
- **Validate before scaling.** Small tests ($500, 2 weeks) before real budget.
- **One metric that matters.** Focus changes by phase, but there's always one number.
- **Kill fast.** If a channel/topic/email produces no signal in 2-4 weeks, stop.
- **Organic first, always.** Paid amplifies what organic proves works.
- **Budget: $0 until revenue.** Everything is time-cost only.

### Dependencies on Other Teams

| Dependency | Owner | Blocks |
|---|---|---|
| Marketing site live | Frontend Engineer (PER-45-49) | Launch |
| Interactive demo working | SDK/Capture Engineer (PER-51) | Launch effectiveness |
| Analytics instrumented | CMO + Backend/MCP Engineer | Post-launch measurement |
| SEO foundations (sitemap, meta, speed) | Backend/MCP Engineer (PER-56) | Organic search |
| Design system tokens | Frontend Engineer | Brand guide finalization |
| Blog infrastructure | SDK/Capture Engineer (PER-57) | Content strategy execution |

### What We Explicitly Skip

- Enterprise sales playbook (too early, PLG first)
- Analyst relations (no budget, no scale)
- Event sponsorship (attend/speak, don't sponsor)
- Influencer marketing (organic community over paid influencer)
- LinkedIn organic (wrong audience for dev tool discovery)
- YouTube (high cost, low ROI pre-launch)
- Internationalization (English-only for V1)

---

## Execution Timeline

| Period | Focus | Key Deliverables |
|---|---|---|
| Weeks -4 to -1 | Pre-launch | 4 blog posts seeded, Discord live, analytics instrumented, Show HN drafted, PH page prepared |
| Week 0 | Launch | Show HN (T+0), Twitter thread (T+4h), Reddit (T+6h), email (T+24h) |
| Week +1 | Launch | Product Hunt launch, continue HN engagement |
| Weeks +2 to +4 | Post-launch | First user stories, content cadence begins, community growing |
| Month 2-3 | Growth | Integration guides published, content compounding, channel mix adjusted |
| Month 3-6 | Scale | Community self-sustaining, consider paid acquisition tests, DevRel activities |

---

## Document Index

| # | Document | Path | Priority | Scope |
|---|---|---|---|---|
| 1 | Go-to-Market Playbook | `docs/gtm-playbook.md` | P0 | Channel strategy, messaging, phases, PLG flywheel |
| 2 | Launch Playbook | `docs/launch-playbook.md` | P0 | HN/PH execution, crisis protocol, post-launch analysis |
| 3 | SEO & Content Strategy | `docs/seo-content-strategy.md` | P0 | Keywords, content calendar, production process, kill criteria |
| 4 | Community Playbook | `docs/community-playbook.md` | P1 | Discord, HN, Reddit, Twitter/X, GitHub engagement rules |
| 5 | Paid Acquisition Framework | `docs/paid-acquisition-plan.md` | P1 | Google/Reddit/Twitter/LinkedIn ads, budget model, A/B testing |
| 6 | Analytics Framework | `docs/analytics-framework.md` | P1 | Plausible + PostHog, funnel, events, UTMs, dashboards |
| 7 | Developer Relations Playbook | `docs/devrel-playbook.md` | P2 | Integration guides, MCP ecosystem, events, partnerships |
| 8 | Email & Changelog Strategy | `docs/email-strategy.md` | P2 | Buttondown, changelog format, welcome sequence, capture |
| 9 | Brand Identity Guide | `docs/brand-guide.md` | P2 | Colors, typography, imagery, social assets, co-branding |
