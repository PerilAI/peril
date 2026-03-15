# Peril -- Metrics & Analytics Framework

**Date:** 2026-03-10
**Author:** CMO
**Issue:** PER-85

---

## 1. Analytics Philosophy

Measure what matters. Don't build a dashboard nobody checks. Don't track 50 metrics when 5 tell you everything.

**Lean startup principle:** Start with the minimum instrumentation needed to answer one question: "Is the thing working?" Add metrics only when you need to answer a new question.

**Privacy commitment:** Our audience is developers. They care about privacy more than most. No invasive tracking. No third-party data sales. Cookie-free analytics. Transparent about what we collect.

---

## 2. Tool Selection

### 2.1 Recommendation: Plausible + PostHog

| Tool | Purpose | Cost | Privacy |
|---|---|---|---|
| **Plausible** | Website analytics (traffic, referrers, pages) | $9/mo (10K pageviews) | Cookie-free, GDPR-compliant, no consent banner needed |
| **PostHog** | Product analytics (funnels, events, feature flags) | Free (1M events/mo) | Self-hostable, cookie-free mode available |

**Why two tools:**
- Plausible gives a clean, simple dashboard for website traffic. It's what you check every morning.
- PostHog gives deep product analytics (funnels, retention, event sequences). It's what you dig into when optimizing conversion.

### 2.2 Why Not Google Analytics

- GA4 requires cookie consent banners (developers hate them)
- Complex setup, steep learning curve for basic insights
- Data sent to Google's servers (trust issue with dev audience)
- Overkill for pre-revenue stage

### 2.3 Alternatives Considered

| Tool | Verdict | Reason |
|---|---|---|
| **Fathom** | Good alternative to Plausible | Slightly more expensive, similar privacy stance |
| **Umami** | Good self-hosted option | More setup overhead |
| **Mixpanel** | Too complex for current stage | Revisit at scale |
| **Amplitude** | Enterprise-grade | Way too much for a pre-revenue startup |

---

## 3. Funnel Definition

### 3.1 The Peril Funnel

```
Visitor (lands on site)
  ↓ [site_visit]
Engaged Visitor (interacts with demo or scrolls to features)
  ↓ [demo_interaction]
Intent Signal (copies install command, clicks docs, stars repo)
  ↓ [install_intent]
Installer (runs npm install @peril-ai/react)
  ↓ [npm_install] (measured via npm stats, not on-site)
Active User (creates first annotation)
  ↓ [first_annotation] (measured via opt-in telemetry or server-side)
Retained User (uses Peril in week 2+)
  ↓ [retained_use]
Team User (multiple people annotating on same project)
  ↓ [team_adoption]
Paid User (upgrades to Team tier)
  ↓ [upgrade] (V3)
```

### 3.2 Funnel Targets

| Stage | Metric | Target | Benchmark |
|---|---|---|---|
| Visitor → Engaged | Engagement rate | >50% | SaaS avg: 40-60% |
| Engaged → Intent | Demo/docs CTR | >10% | Dev tools: 5-15% |
| Intent → Install | Install conversion | >5% | Dev tools: 2-8% |
| Install → Active | Activation rate | >40% | PLG target: 20-40% |
| Active → Retained | Week 2 retention | >30% | Dev tools: 20-40% |

---

## 4. Event Taxonomy

### 4.1 Website Events (Plausible + PostHog)

Track these events on the marketing site:

| Event Name | Trigger | Properties |
|---|---|---|
| `page_view` | Page load | path, referrer, utm_source, utm_medium |
| `demo_interaction` | User clicks an element in the embedded demo | element_type, action |
| `install_copy` | User clicks/copies npm install command | source_section |
| `docs_click` | User clicks link to documentation | docs_page |
| `github_click` | User clicks GitHub link | location_on_page |
| `discord_click` | User clicks Discord invite link | location_on_page |
| `email_signup` | User submits email capture form | referrer, utm_source |
| `cta_click` | User clicks any CTA button | cta_text, cta_location |
| `scroll_depth` | User scrolls past 25%, 50%, 75%, 100% | depth_percentage |

### 4.2 Product Events (PostHog, opt-in only)

If we add opt-in anonymous telemetry to the SDK:

| Event Name | Trigger | Properties |
|---|---|---|
| `sdk_initialized` | ReviewProvider mounts | framework, sdk_version |
| `review_mode_activated` | User toggles review mode | activation_method |
| `element_selected` | User clicks an element in review mode | locator_types_generated |
| `annotation_submitted` | User submits a review | category, severity |
| `annotation_count` | Number of annotations in session | count |

**Privacy rules:**
- All SDK telemetry is **opt-in** (disabled by default)
- No PII collected (no user IDs, no email, no IP)
- No content collected (no comment text, no screenshots)
- Only counts and categorical data
- Users can disable with `<ReviewProvider telemetry={false}>`

### 4.3 Naming Conventions

- Use `snake_case` for all event names
- Prefix with domain: `site_` for website, `sdk_` for product
- Properties use `snake_case`
- Boolean properties use `is_` prefix: `is_mobile`, `is_dark_mode`

---

## 5. UTM Convention

### 5.1 Standard Parameters

All inbound links use these UTM parameters:

| Parameter | Values | Example |
|---|---|---|
| `utm_source` | Platform name | `hackernews`, `reddit`, `twitter`, `google`, `producthunt`, `blog`, `email`, `discord` |
| `utm_medium` | Channel type | `organic`, `paid`, `referral`, `email`, `social` |
| `utm_campaign` | Campaign name | `launch-hn`, `blog-locators-post`, `retargeting-q1` |
| `utm_content` | Content variant | `ad-variant-a`, `thread-tweet-1`, `sidebar-cta` |
| `utm_term` | Search term / keyword | `visual-feedback-coding-agent` |

### 5.2 UTM Templates

| Channel | URL Template |
|---|---|
| **HN post** | `?utm_source=hackernews&utm_medium=organic&utm_campaign=launch-hn` |
| **Reddit post** | `?utm_source=reddit&utm_medium=organic&utm_campaign=show-rprogramming` |
| **Twitter thread** | `?utm_source=twitter&utm_medium=social&utm_campaign=launch-thread` |
| **Blog internal** | `?utm_source=blog&utm_medium=referral&utm_campaign={post-slug}` |
| **Email** | `?utm_source=email&utm_medium=email&utm_campaign={email-name}` |
| **Google Ads** | `?utm_source=google&utm_medium=paid&utm_campaign={campaign}&utm_term={keyword}` |
| **Reddit Ads** | `?utm_source=reddit&utm_medium=paid&utm_campaign={campaign}` |

### 5.3 UTM Rules

1. **Always lowercase.** `utm_source=Reddit` ≠ `utm_source=reddit`. Be consistent.
2. **Hyphens, not spaces.** `launch-day-hn`, not `launch day hn`.
3. **utm_medium is the channel type,** not the platform. Reddit organic = `social`. Reddit paid = `paid`.
4. **Document every campaign.** Keep a running log of UTM parameters in a shared spreadsheet.
5. **Never use UTMs on internal links** (links within the site). They overwrite referrer data.

---

## 6. Attribution Model

### 6.1 First-Touch Attribution (V1)

For a pre-revenue startup, first-touch attribution is sufficient. It answers: "What channel brought this person to us?"

```
User clicks HN link → utm_source=hackernews → visits site → installs later
→ Attribution: Hacker News
```

### 6.2 Why Not Multi-Touch

Multi-touch attribution (last-touch, linear, time-decay) is valuable at scale but unnecessary before we have:
- Thousands of monthly visitors from multiple channels
- A paid-to-free-to-paid conversion funnel
- Enough data to make the model statistically meaningful

**Revisit at V3** when we have paid channels and revenue to attribute.

### 6.3 Attribution Limitations

Be honest about what we can't track:

| Gap | Why | Mitigation |
|---|---|---|
| npm installs can't be attributed to a visit | npm is a separate system | Track "install intent" (copy button clicks) as proxy |
| Word-of-mouth is invisible | No UTM for conversations | Ask in onboarding: "How did you hear about Peril?" |
| GitHub star ≠ install | Different action, different intent | Track separately, don't conflate |
| Dark social (DMs, Slack shares) | No referrer | Monitor direct traffic spikes |

---

## 7. Dashboards

### 7.1 Daily Dashboard (Plausible)

Check every morning. 2-minute review.

| Metric | Source |
|---|---|
| Unique visitors (today, 7d, 30d) | Plausible |
| Top pages | Plausible |
| Top referrers | Plausible |
| UTM source breakdown | Plausible |
| Country distribution | Plausible |

### 7.2 Weekly Dashboard (PostHog + Plausible)

Review every Monday. 15-minute deep dive.

| Metric | Source | What It Tells You |
|---|---|---|
| Funnel conversion rates | PostHog | Is the demo converting? Are people clicking install? |
| Top-performing content | Plausible | Which blog posts drive traffic? |
| Event counts (demo, install, docs) | PostHog | Are engagement metrics growing? |
| Channel mix | Plausible | Where is traffic coming from? |
| Scroll depth distribution | PostHog | Are people reading the full page? |

### 7.3 Monthly Dashboard (All Sources)

Full review with the team. 30-minute analysis.

| Metric | Target | Source |
|---|---|---|
| Total unique visitors | Growing MoM | Plausible |
| Organic search traffic | Growing MoM | Google Search Console |
| npm installs (monthly) | Growing MoM | npm stats |
| GitHub stars (cumulative) | Growing MoM | GitHub |
| Discord members | Growing MoM | Discord |
| Email subscribers | Growing MoM | Email tool |
| Demo interaction rate | >10% of visitors | PostHog |
| Install intent rate | >5% of visitors | PostHog |
| Top 5 search queries | New queries appearing | Google Search Console |
| Content performance | Top 3 posts by traffic | Plausible |

---

## 8. Reporting Cadence

| Report | Frequency | Audience | Format |
|---|---|---|---|
| Traffic snapshot | Daily | CMO (internal) | Plausible dashboard glance |
| Weekly metrics | Weekly (Monday) | CMO + CEO | 5-bullet summary in Paperclip |
| Monthly analysis | Monthly (1st of month) | Full team | Written report with trends and actions |
| Channel experiment results | Ad hoc | CMO | Document per experiment |
| Quarterly review | Quarterly | CEO + CMO | Trends, channel ROI, budget decisions |

### 8.1 Weekly Report Template

```
## Week of [date]

**Traffic:** X visitors (+Y% WoW)
**Top referrer:** [source]
**Demo interactions:** X (+Y% WoW)
**Install intent clicks:** X
**New GitHub stars:** X (total: Y)

**Insight:** [One observation worth acting on]
**Action:** [One thing we're doing differently this week]
```

---

## 9. Google Search Console Setup

### 9.1 Why It Matters

Google Search Console (GSC) is free and provides data no other tool can:
- What search queries bring people to your site
- Click-through rates per query
- Which pages rank and for what
- Technical issues (indexing errors, mobile usability)

### 9.2 Setup Checklist

- [ ] Verify domain ownership in GSC
- [ ] Submit sitemap.xml
- [ ] Verify all key pages are indexed
- [ ] Set up email alerts for indexing issues
- [ ] Review search performance weekly

### 9.3 Key GSC Metrics

| Metric | What It Tells You |
|---|---|
| **Impressions** | How often your pages appear in search results |
| **Clicks** | How many people click through from search |
| **CTR** | Click-through rate (clicks / impressions) |
| **Average position** | Where you rank on average for each query |
| **Top queries** | What people search to find you |

---

## 10. Implementation Plan

### 10.1 Phase 1: Pre-Launch (Week -2)

- [ ] Create Plausible account, add tracking script to marketing site
- [ ] Create PostHog account (free tier), add to marketing site
- [ ] Define and implement website events (Section 4.1)
- [ ] Set up Google Search Console
- [ ] Create UTM templates document (Section 5.2)
- [ ] Build Plausible daily dashboard

### 10.2 Phase 2: Launch Week

- [ ] Ensure all launch links have correct UTM parameters
- [ ] Monitor real-time traffic during HN launch
- [ ] Verify all events are firing correctly
- [ ] Take screenshots of Day 1 metrics as baseline

### 10.3 Phase 3: Post-Launch (Month 1)

- [ ] Set up PostHog funnels (Section 3.1)
- [ ] Establish weekly reporting cadence
- [ ] Review and adjust event taxonomy based on actual data
- [ ] First monthly analysis report

### 10.4 Phase 4: Optimization (Month 2+)

- [ ] A/B test CTAs using PostHog feature flags
- [ ] Set up conversion goals in Plausible
- [ ] Build monthly dashboard template
- [ ] Begin content performance tracking

---

## 11. Lean Startup Analytics Principles

1. **One metric that matters.** At any given time, focus on one metric. Pre-launch: email signups. Launch week: npm installs. Post-launch: weekly active users.

2. **Vanity metrics are not actionable metrics.** Page views, GitHub stars, and Twitter followers are nice. Activation rate (install → first annotation) tells you if the product works.

3. **Cohort over aggregate.** "1,000 visitors this month" is less useful than "visitors from HN convert at 3%, visitors from blog convert at 1.5%." Cohort analysis reveals what's actually working.

4. **Don't optimize without a baseline.** Collect 30 days of data before making changes. You need a baseline to know if your optimization worked.

5. **Instrument incrementally.** Don't try to track everything on day 1. Start with page views and 3-4 key events. Add more as questions arise.

6. **Data informs, humans decide.** Analytics tells you what happened, not why. When numbers look off, talk to users before changing the product.

7. **Respect user privacy.** No tracking without consent. No PII in analytics. Cookie-free by default. Our audience will judge us on this.
