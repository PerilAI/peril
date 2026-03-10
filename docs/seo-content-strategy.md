# Peril -- SEO & Content Strategy

**Date:** 2026-03-10
**Author:** CMO
**Issue:** PER-85

---

## 1. Content Philosophy

Content is Peril's compounding growth channel. Unlike spike channels (HN, PH) that deliver traffic once, content drives organic traffic that grows month over month.

**Lean startup principle:** Publish the minimum content needed to validate demand, then double down on what ranks and converts. Don't build a content machine before you know what your audience searches for.

**Peril's content advantage:** We're creating a new category (agent-native UI review). That means low keyword competition and an opportunity to own the narrative before competitors arrive.

---

## 2. SEO Foundations

### 2.1 Technical SEO Checklist

These must be in place before publishing content. Coordinate with Backend/MCP Engineer (PER-56).

- [ ] **Clean URL structure:** `/blog/[slug]`, `/docs/[section]/[page]`
- [ ] **Sitemap.xml** generated and submitted to Google Search Console
- [ ] **robots.txt** configured (allow all content pages, disallow admin/API routes)
- [ ] **Meta tags** on every page: title (50-60 chars), description (150-160 chars), og:image
- [ ] **Page speed:** < 2 second load time (Lighthouse score 90+)
- [ ] **Mobile responsive:** All content pages render correctly on mobile
- [ ] **Structured data:** Article schema on blog posts, SoftwareApplication schema on homepage
- [ ] **Canonical URLs** set to prevent duplicate content
- [ ] **Internal linking:** Every blog post links to at least 2 other pages on the site
- [ ] **HTTPS** everywhere

### 2.2 Domain and Site Structure

```
peril.dev (or whatever the domain is)
├── /                    → Homepage (hero + demo + trust)
├── /docs/               → SDK documentation
│   ├── /docs/quickstart
│   ├── /docs/react
│   ├── /docs/mcp
│   └── /docs/api
├── /blog/               → Content marketing
│   ├── /blog/[slug]     → Individual posts
│   └── /blog/tags/[tag] → Tag archives
├── /changelog/          → Release notes
└── /pricing/            → Pricing page (when applicable)
```

---

## 3. Keyword Strategy

### 3.1 Keyword Clusters

Peril targets three keyword clusters, ordered by intent and competition:

#### Cluster 1: Agent Feedback (Low Competition, High Intent)

These are our primary targets. Low search volume today, but growing fast as AI coding agent adoption increases.

| Keyword | Search Intent | Competition | Priority |
|---|---|---|---|
| visual feedback coding agent | Problem-seeking | Very Low | P0 |
| MCP bug reporting tool | Solution-seeking | Very Low | P0 |
| AI code review visual feedback | Problem-seeking | Low | P0 |
| agent-native feedback tool | Category-defining | Very Low | P0 |
| MCP tool for UI review | Solution-seeking | Very Low | P0 |
| visual annotation for AI agents | Problem-seeking | Very Low | P1 |
| structured feedback for coding agents | Problem-seeking | Very Low | P1 |

#### Cluster 2: AI Developer Tools (Medium Competition, High Volume)

These attract developers already using AI coding tools who haven't yet hit the feedback bottleneck.

| Keyword | Search Intent | Competition | Priority |
|---|---|---|---|
| AI code review tool | Solution-seeking | Medium | P1 |
| MCP tools for developers | Educational | Medium | P1 |
| Claude Code MCP setup | Tutorial | Low-Medium | P1 |
| Codex visual feedback | Problem-seeking | Low | P1 |
| visual bug reporting developer | Problem-seeking | Medium | P2 |

#### Cluster 3: Visual Feedback Tools (High Competition, Comparison)

These attract developers evaluating existing tools who may be ready for an agent-native alternative.

| Keyword | Search Intent | Competition | Priority |
|---|---|---|---|
| Marker.io alternative | Comparison | Medium-High | P2 |
| visual bug reporting tool | Solution-seeking | High | P2 |
| website annotation tool | Solution-seeking | High | P2 |
| BugHerd alternative | Comparison | Medium | P2 |
| Jam.dev vs [tool] | Comparison | Medium | P2 |

### 3.2 Long-Tail Keywords

Long-tail keywords are where lean startups win. Lower volume, but higher intent and lower competition.

| Long-Tail Keyword | Content Type |
|---|---|
| how to give visual feedback to AI coding agent | Tutorial |
| MCP server for visual bug reports | Technical guide |
| multi-strategy locator bundles for web testing | Technical deep-dive |
| React annotation overlay component | Tutorial |
| visual feedback tool that works with Claude Code | Comparison |
| how to structure bug reports for AI agents | Guide |
| element locator strategies for DOM changes | Technical |

### 3.3 Negative Keywords (For Future Paid)

When we eventually run paid search, exclude these to avoid irrelevant traffic:

- "peril definition" / "peril meaning" (dictionary searches)
- "peril game" / "peril board game"
- "peril insurance" / "peril coverage"
- "yellow peril" (historical term)
- "grave peril" / "mortal peril" (literary/general searches)

---

## 4. Content Calendar

### 4.1 Pre-Launch Content (Weeks -4 to 0)

Publish these before launch to create indexable pages and establish thought leadership.

| Week | Title | Cluster | Type | Target Keyword |
|---|---|---|---|---|
| -4 | "The Feedback Bottleneck in Agentic Development" | 1 | Thought leadership | visual feedback coding agent |
| -3 | "How We Built Multi-Strategy Locator Bundles" | 1 | Technical deep-dive | multi-strategy locator bundles |
| -2 | "MCP Tools Your AI Agent Actually Needs" | 2 | Educational | MCP tools for developers |
| -1 | "Why Bug Trackers Don't Work for AI Agents" | 3 | Comparison | visual bug reporting tool alternative |

### 4.2 Post-Launch Monthly Cadence

Publish 2 posts per month minimum. One technical, one problem/use-case focused.

**Month 1:**
| Title | Cluster | Type |
|---|---|---|
| "Introducing Peril: Visual Feedback for Coding Agents" | 1 | Launch announcement |
| "Setting Up Peril with React and Claude Code" | 2 | Tutorial |

**Month 2:**
| Title | Cluster | Type |
|---|---|---|
| "How Structured Feedback Improves AI Agent Resolution by 20%" | 1 | Research-backed |
| "Peril vs. Manual Screenshots: A Side-by-Side Comparison" | 3 | Comparison |

**Month 3:**
| Title | Cluster | Type |
|---|---|---|
| "Building an MCP Server for Visual Review" | 2 | Technical deep-dive |
| "5 Things AI Agents Need to Fix a UI Bug" | 1 | Listicle/educational |

**Month 4:**
| Title | Cluster | Type |
|---|---|---|
| "Design Review Workflows with AI Coding Agents" | 1 | Use case |
| "Element Locator Strategies: testId vs. ARIA vs. CSS" | 2 | Technical comparison |

### 4.3 Evergreen Content (Build Once, Rank Forever)

| Content | URL | Purpose |
|---|---|---|
| Quickstart guide | /docs/quickstart | First-time user onboarding |
| MCP integration guide | /docs/mcp | Agent setup |
| Locator strategy reference | /docs/locators | Technical reference |
| FAQ | /docs/faq | Long-tail keyword capture |
| Changelog | /changelog | Freshness signal + retention |

---

## 5. Content Production Process

### 5.1 Lean Content Workflow

Each blog post follows a build-measure-learn cycle:

1. **Hypothesis:** "Developers searching for [keyword] will find this post useful and visit our site"
2. **Write:** 1,000-2,000 words. One clear topic. One target keyword.
3. **Publish:** On the blog with proper meta tags, internal links, og:image
4. **Distribute:** Share on Twitter/X, relevant Reddit threads (only if genuinely valuable), Discord
5. **Measure:** Track rankings, traffic, time-on-page, scroll depth at 30/60/90 days
6. **Iterate:** Update top-performing posts. Drop topics that don't rank after 90 days.

### 5.2 Content Quality Standards

Every post must pass these checks before publishing:

- [ ] Does it teach the reader something they didn't know?
- [ ] Is there a code example or concrete demonstration within the first 500 words?
- [ ] Would a developer share this with a colleague?
- [ ] Is the target keyword in the title, first paragraph, and at least one H2?
- [ ] Are there at least 2 internal links to other pages on our site?
- [ ] Is it under 2,000 words? (Longer only if the topic demands it)
- [ ] Does it follow the voice guidelines in `docs/copywriting-guide.md`?

### 5.3 Content Types and Templates

**Technical Deep-Dive** (1,500-2,000 words)
- Problem statement (2-3 paragraphs)
- Technical explanation with code examples
- Architecture or flow diagram
- Benchmarks or data if available
- CTA: Try it yourself with Peril

**Tutorial** (1,000-1,500 words)
- Prerequisites (what you need)
- Step-by-step with code blocks
- Expected output at each step
- Troubleshooting section
- CTA: Full docs at /docs

**Comparison/Alternative** (1,000-1,500 words)
- Clear criteria for comparison
- Honest assessment of both tools
- Specific use cases where each wins
- CTA: Try Peril for the agent-native use case

**Thought Leadership** (800-1,200 words)
- Observation about a trend
- Data or research to support the thesis
- Implication for the reader's work
- How Peril fits (brief, at the end)

---

## 6. Distribution Strategy

### 6.1 Organic Distribution

Every blog post gets distributed to:

| Channel | How | When |
|---|---|---|
| **Twitter/X** | Thread summarizing key points with link | Day of publish |
| **Reddit** | Post to relevant subreddit if genuinely useful (not promotional) | Day of publish |
| **Discord** | Share in #announcements channel | Day of publish |
| **HN** | Only if the post is exceptionally good and technical. Don't over-post. | Selectively |
| **Dev.to** | Cross-post with canonical URL pointing to our blog | 3-5 days after publish |

### 6.2 SEO Distribution Checklist

- [ ] Submit URL to Google Search Console for indexing
- [ ] Verify page appears in sitemap
- [ ] Check meta title/description render correctly in search preview
- [ ] Add internal links from 2-3 existing pages to the new post
- [ ] Share on Twitter/X with target keyword in tweet text

---

## 7. Measurement

### 7.1 Content Metrics

| Metric | Tool | Target | Cadence |
|---|---|---|---|
| Organic search traffic | Analytics (Plausible/PostHog) | Growing month-over-month | Monthly |
| Keyword rankings | Google Search Console | Top 10 for P0 keywords within 90 days | Monthly |
| Blog post page views | Analytics | 500+ per post within 30 days | Per post |
| Time on page | Analytics | >3 minutes for technical posts | Per post |
| Click-through to docs/demo | Analytics | >5% of blog visitors | Monthly |
| Backlinks | Google Search Console / Ahrefs | 5+ per quarter | Quarterly |

### 7.2 Content ROI Framework

For a lean startup, content ROI is simple:

```
Content ROI = (Organic visitors from content × Install conversion rate) / Hours invested
```

If a blog post takes 4 hours to write and drives 200 visitors/month at 2% install rate = 4 installs/month. Over 12 months = 48 installs from one post. That's a strong return on 4 hours.

### 7.3 Kill Criteria

Drop content topics that fail these thresholds after 90 days:

| Signal | Threshold | Action |
|---|---|---|
| Zero impressions in Search Console | No search demand | Stop writing about this topic |
| <100 page views in 90 days | Low distribution or relevance | Try different angle or promote differently |
| <1 minute avg time on page | Content doesn't engage | Rewrite or consolidate |
| Zero click-throughs to demo/docs | Content doesn't convert | Add better CTAs or reposition |

---

## 8. Competitive Content Gaps

Based on competitive research, these content opportunities are uncontested:

| Topic | Why It's Open | Peril's Angle |
|---|---|---|
| MCP tools for visual feedback | No one writes about this yet | We define the category |
| Structured feedback for AI agents | Research exists but no tool-specific content | Link CodeScout research to Peril |
| Multi-strategy locator bundles | Testing tools cover locators but not for feedback | Unique technical differentiator |
| Non-engineer feedback for AI agents | No content bridges this gap | Core use case |
| Design review with coding agents | Adjacent to design tools but agent-focused | Use case content |

---

## 9. Lean Startup Content Principles

1. **Write for one person.** Before every post, identify one specific reader. "A React developer at a Series A startup who just started using Claude Code." Write for them.

2. **Ship fast, iterate later.** A good post published today beats a perfect post published next month. Publish, measure, update.

3. **Content is product.** Treat blog posts like features. They solve a problem (finding information) and should be tested against user behavior.

4. **Don't create content for content's sake.** Every post must map to a keyword cluster or a distribution channel. If you can't say "this post targets [keyword] for [audience]," don't write it.

5. **Compound, don't spike.** One excellent post per month that ranks for 12 months beats 4 mediocre posts that get shared once and forgotten.

6. **Repurpose ruthlessly.** One blog post becomes: a Twitter thread, a Reddit comment, a Discord resource, a docs page section, and a launch day asset.

7. **Measure at 30/60/90 days.** Content takes time to rank. Don't judge a post's SEO performance in the first week.
