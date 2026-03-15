# Peril -- Business Model

**Date:** 2026-03-10
**Author:** CEO
**Issue:** PER-84

---

## 1. Lean Canvas

| Block | Peril |
|---|---|
| **Problem** | Non-engineers can see UI bugs but can't describe them in a way coding agents can act on. Teams waste cycles translating visual feedback into agent-friendly tasks. |
| **Customer Segments** | Seed-to-Series B startups using AI coding agents (Claude Code, Codex, Cursor). Small eng teams (2-15). Buyer: eng lead or Head of Product. Users: designers, PMs, QA, founders. |
| **Unique Value Prop** | Point at what's wrong. Your agent fixes it. The only tool where the output consumer is a coding agent, not a human reading a ticket. |
| **Solution** | In-page review SDK (annotate any element) + structured backend (locators, screenshots, DOM context) + MCP bridge (agents consume tasks natively). |
| **Channels** | Hacker News (spike), GitHub (compounding), Discord (community), dev blog (SEO), word-of-mouth from OSS users. |
| **Revenue Streams** | Open Core: free OSS local tool, paid cloud/team/enterprise tiers. |
| **Cost Structure** | Engineering (primary), cloud infrastructure (later), community/support, marketing. |
| **Key Metrics** | SDK installs, annotations created, MCP tool calls, free-to-paid conversion, team expansion rate, NRR. |
| **Unfair Advantage** | First-mover in agent-native UI review. Multi-strategy locator bundles (no competitor has this). MCP-first architecture. Category creator, not a follower. |

---

## 2. Pricing Strategy

### 2.1 Core Principle: Free Where It Matters

Peril's V1 is **100% free and open source (MIT license)**. This is not a teaser -- it is the full local development workflow: SDK, server, MCP bridge, React adapter, dashboard.

**Why MIT and not a restrictive license (BSL, AGPL, SSPL):**

- Our ICP is developers at startups using AI agents. They evaluate tools by reading source code and running them locally. Restrictive licenses create friction at exactly the wrong moment.
- MIT maximizes adoption velocity. Community contributions, forks, and integrations all accelerate Peril's network effects.
- The features worth paying for (cloud hosting, team collaboration, analytics, SSO) are orthogonal to the core OSS tool. They require infrastructure, not license restrictions, to gate.
- Successful precedents: Supabase (MIT/Apache), PostHog (MIT), Sentry (BSL but was MIT for years), Playwright (Apache). The most-adopted dev tools are permissively licensed.

### 2.2 Pricing Tiers

| Tier | Price | Target | What's Included |
|---|---|---|---|
| **Community** | Free forever | Individual devs, small teams evaluating | Full OSS: SDK, local server, MCP bridge, React adapter, dashboard. Self-hosted. Unlimited annotations. |
| **Team** | $29/mo per seat (5 seat minimum) | Startups with 3-15 engineers | Cloud-hosted backend, shared review queue, team workspaces, cross-project annotations, Slack/Discord notifications, 90-day history, email support. |
| **Pro** | $59/mo per seat | Growing teams (10-50) scaling agent workflows | Everything in Team + unlimited history, SSO (Google/GitHub), custom categories/severity, annotation analytics dashboard, priority support, API access, webhook integrations. |
| **Enterprise** | Custom (starting ~$15K/yr) | Companies with 50+ engineers, compliance requirements | Everything in Pro + SAML SSO, SCIM provisioning, audit logs, data residency, custom SLAs, dedicated support, on-prem deployment option, SOC 2 compliance artifacts. |

### 2.3 Pricing Rationale

**Why per-seat, not usage-based:**

- Annotations are cheap to store and serve. Usage-based pricing on annotation volume would punish the behavior we want to encourage (more feedback, not less).
- Per-seat pricing is predictable for budget holders. Engineering leads can forecast costs without tracking annotation counts.
- Seat-based aligns with how our ICP buys: "add the team to Peril" is a natural expansion motion.
- Competitor reference: Marker.io ($39-499/mo by tier), Jam ($14/user), BugHerd ($39-42/mo flat). Our $29/seat entry is competitive and anchored below Marker.io's starter.

**Why $29/seat as the entry point:**

- Low enough to expense on a corporate card without procurement approval (most startups have a $50-100/mo threshold).
- High enough to signal professional-grade tooling, not a toy.
- 5-seat minimum ($145/mo) creates a meaningful first contract while keeping the ask small.

---

## 3. Revenue Model

### 3.1 Revenue Streams

| Stream | Timeline | Description |
|---|---|---|
| **SaaS subscriptions** | V3+ (primary) | Team, Pro, and Enterprise tiers. Recurring monthly/annual revenue. |
| **Enterprise contracts** | V3+ (secondary) | Annual contracts with custom terms, SLAs, on-prem deployment. |
| **Managed hosting** | V3+ (tertiary) | For teams that want Peril without running infrastructure. Margin on cloud compute. |

**Not in the plan:**

- Marketplace/app store fees (too early, fragments focus)
- Data monetization (kills trust with dev audience)
- Advertising (misaligned with product experience)
- Per-annotation usage fees (penalizes desired behavior)
- Professional services/consulting (doesn't scale, distracts from product)

### 3.2 Revenue Timeline

| Phase | Timeline | Revenue | Focus |
|---|---|---|---|
| **V1 (MVP)** | Now | $0 | Ship the OSS tool. Build adoption, community, GitHub stars. Validate the core loop works. |
| **V2 (Post-MVP)** | +3-6 months | $0 | Add rrweb replay, Playwright verification, batch processing. Deepen the product moat. Still free. |
| **V3 (Cloud)** | +6-12 months | First revenue | Launch cloud-hosted backend with team features. Team tier ($29/seat). Target: 50-100 paying teams. |
| **Scale** | +12-24 months | Growth | Pro and Enterprise tiers. Sales motion for larger teams. Target: $500K-1M ARR. |

### 3.3 Why Delay Revenue

Charging before product-market fit burns credibility with developers. The pattern from successful OSS dev tools:

1. **Supabase**: 2 years of free/OSS growth before paid tiers. Now $80M+ ARR.
2. **PostHog**: 18 months free/self-hosted before cloud launch. Now $50M+ ARR.
3. **Sentry**: Years of OSS adoption before introducing paid plans. Now $100M+ ARR.
4. **GitLab**: Started as OSS project, introduced paid tiers after mass adoption. Now $600M+ ARR.

The playbook: achieve ubiquity first, then monetize the convenience and collaboration layer. We are not selling software -- we are selling the hosted, managed, team-ready version of software they already depend on.

---

## 4. Growth Strategy

### 4.1 Growth Model: Product-Led Growth (PLG)

Peril grows bottom-up. A single developer adds `@peril-ai/react` to their project. Their designer uses it to annotate bugs. The team sees value. They want shared history and cross-project queues. They upgrade to Team.

**The PLG flywheel:**

```
Developer discovers Peril (HN, GitHub, blog)
    → Installs SDK in 5 minutes
    → Team members start annotating
    → Annotations feed into coding agents
    → Team sees 70% faster bug resolution
    → Team wants shared cloud dashboard
    → Upgrade to Team ($29/seat)
    → More team members added
    → Word-of-mouth to other teams
```

**Key PLG metrics to track:**

| Metric | Target | Benchmark |
|---|---|---|
| Time-to-first-annotation | < 5 minutes | Industry: < 20 min for dev tools |
| Activation rate | > 40% (install → first annotation) | PLG average: 20-40% |
| Free-to-paid conversion | 3-5% of teams | OSS dev tool benchmark: 1-3% typical, 3-5% strong (PostHog: 90%+ stay free) |
| Net Revenue Retention | > 120% | Best-in-class PLG: 120-150% |
| Seat expansion rate | > 30% annually | Healthy PLG: 20-40% |

### 4.2 Acquisition Channels

| Channel | Type | Expected Impact | Cost |
|---|---|---|---|
| **Hacker News** | Spike | 10-30K visitors, 1.5-2.5% conversion to install | $0 (time) |
| **GitHub** | Compounding | Stars → credibility → organic discovery | $0 (time) |
| **Technical blog** | Compounding | SEO, thought leadership, evergreen traffic | $0 (time) |
| **Discord community** | Retention | Support, feedback, advocacy | $0 (time) |
| **Developer conferences** | Spike | Demo opportunities, enterprise leads | Travel costs |
| **Paid ads (later)** | Scalable | LinkedIn/Reddit targeting eng leads | $50-200 CAC |

### 4.3 Expansion Motion

The natural expansion path for Peril:

1. **Individual → Team**: Developer adds SDK, shares with team. Upgrade trigger: wanting shared cloud review queue.
2. **Team → Department**: One team's success spreads to adjacent teams. Upgrade trigger: cross-project annotations, SSO.
3. **Department → Enterprise**: Multiple teams need governance, compliance, on-prem. Upgrade trigger: security review, SOC 2 requirement.

---

## 5. Enterprise Strategy

### 5.1 Enterprise Features Worth Paying For

Enterprise buyers care about three things: **security, compliance, and control**. They don't pay more for "better annotations" -- they pay for the operational wrapper around the tool.

| Feature | Why Enterprise Pays | Implementation Complexity |
|---|---|---|
| **SAML/OIDC SSO** | IT policy requires centralized auth | Medium (integrate with IdP) |
| **SCIM provisioning** | Auto-manage users from directory | Medium |
| **Audit logs** | Compliance requires activity trail | Low (log mutations) |
| **Data residency** | GDPR/sovereignty requires regional hosting | High (multi-region infra) |
| **On-prem deployment** | Security policy prohibits cloud SaaS | High (packaging, support) |
| **Custom SLAs** | Operations need guaranteed uptime | Low (process, not code) |
| **SOC 2 Type II** | Procurement requires certification | High (audit process) |
| **Role-based access** | Separate reviewer, admin, agent roles | Medium |
| **IP allow-listing** | Network security requirements | Low |

### 5.2 Enterprise Sales Motion

Enterprise is not the V1 priority. The sequence:

1. **Inbound only** (V3): Enterprise teams that adopted the OSS tool reach out when they need SSO/compliance. No outbound sales team.
2. **Solutions engineering** (Scale): Hire first SE when enterprise pipeline exceeds 5 qualified opportunities per quarter.
3. **Enterprise sales** (Scale+): Hire first AE when ARR from enterprise exceeds $500K and deal cycle is proven.

**Enterprise pricing principle**: Price on value delivered, not on cost to serve. A 200-person eng team using Peril to eliminate the feedback bottleneck across 20 projects gets 10x the value of a 10-person team. Price should reflect that.

### 5.3 Enterprise Competitive Positioning

Traditional tools (Marker.io, BugHerd, UserSnap) have a head start on enterprise features (SSO, integrations, compliance). But they output human-readable tickets. As enterprise teams adopt AI coding agents, the output format becomes the wedge:

> "You're paying $499/month for Marker.io to create Jira tickets that a human developer reads. Your agents can't use those tickets. Peril creates tasks your agents consume directly. The enterprise wrapper (SSO, audit, compliance) is the same -- the output is completely different."

---

## 6. Unit Economics

### 6.1 Target Unit Economics (at Scale)

| Metric | Target | Notes |
|---|---|---|
| **CAC (blended)** | < $200 | PLG-driven; most acquisition is organic |
| **CAC (paid channels)** | < $500 | LinkedIn/Reddit ads for eng leads |
| **LTV (Team tier)** | $3,500 | ~5 seats x $29/mo x 24 months avg retention |
| **LTV (Pro tier)** | $14,000 | ~10 seats x $59/mo x 24 months avg retention |
| **LTV (Enterprise)** | $50,000+ | Custom contracts, 36+ month retention |
| **LTV:CAC ratio** | > 5:1 | PLG benchmark: 3-5:1 is healthy |
| **Payback period** | < 6 months | PLG target: 3-9 months |
| **Gross margin** | > 80% | SaaS benchmark; infrastructure costs are low for annotation storage |
| **Net Revenue Retention** | > 120% | Seat expansion + tier upgrades |

### 6.2 Cost Structure

| Cost Category | V1 (now) | V3 (cloud launch) | Scale |
|---|---|---|---|
| **Engineering** | Primary (founding team) | Primary | 60% of spend |
| **Infrastructure** | $0 (local-only) | $2-5K/mo | Scales with customers |
| **Marketing** | $0 (organic) | $1-3K/mo (content, community) | 15-20% of revenue |
| **Support** | Community (Discord/GitHub) | Community + email | 5-10% of revenue |
| **Sales** | None | None | First AE at $500K enterprise ARR |
| **G&A** | Minimal | Minimal | 10-15% of revenue |

### 6.3 Path to $1M ARR

| Scenario | Team Seats | Pro Seats | Enterprise Contracts | Monthly Revenue | ARR |
|---|---|---|---|---|---|
| Conservative | 200 @ $29 | 100 @ $59 | 2 @ $2K/mo | $15,700 | $188K |
| Base case | 500 @ $29 | 300 @ $59 | 5 @ $3K/mo | $47,200 | $566K |
| Aggressive | 800 @ $29 | 600 @ $59 | 10 @ $4K/mo | $98,600 | $1.18M |

At the base case, $1M ARR requires roughly 800 paid seats and 5 enterprise contracts. With 3% free-to-paid conversion, that implies ~27,000 free teams using the OSS tool. Reference: PostHog reached $9.5M ARR with 90%+ of companies on the free tier; GitLab reached $759M ARR with 50M+ registered users. Strong Hacker News launches, GitHub traction, and community growth over 18-24 months from cloud launch can reach this scale.

---

## 7. Competitive Pricing Landscape

| Tool | Pricing Model | Entry Price | Enterprise |
|---|---|---|---|
| **Marker.io** | Tiered (users) | $39/mo (3 users) | $499/mo (50 users) |
| **BugHerd** | Flat + seats | $39-42/mo (5 members) | Not listed |
| **Jam.dev** | Per-user | $14/user/mo | Not listed |
| **UserSnap** | Tiered | $29/mo (Micro) | $249/mo+ |
| **Peril** | Open Core + seats | Free (OSS) / $29/seat (Team) | Custom (~$15K/yr+) |

**Peril's pricing advantage**: Free OSS tier is a genuine differentiator. No competitor offers a fully functional free tool. Our paid tiers are competitive with the market while offering a fundamentally different output (agent-executable tasks vs human-readable tickets).

---

## 8. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Jam.dev adds MCP output** | Medium | High | Move fast. Category-defining positioning and community lock-in before they pivot. |
| **Free tier is "good enough" forever** | Medium | High | Gate team/collaboration features, not core functionality. Cloud convenience must be compelling. |
| **AI agents don't need structured input** | Low | Critical | Research shows structured input improves agent resolution by 20%. Bet on this holding. |
| **MCP standard loses momentum** | Low | Medium | Peril's REST API works independently of MCP. MCP is a distribution channel, not a dependency. |
| **Enterprise sales cycle too long** | Medium | Medium | Stay PLG-first. Enterprise is gravy, not the foundation. |
| **OSS community doesn't materialize** | Medium | Medium | Invest in docs, examples, and community from day one. Low-effort contributions (bug reports, annotations) build engagement. |

---

## 9. Key Decisions and Open Questions

### Decided

1. **MIT license** -- maximizes adoption, no restrictive license friction.
2. **Free V1** -- no revenue until cloud launch (V3). Investment phase.
3. **Per-seat pricing** -- predictable for buyers, doesn't penalize annotation volume.
4. **PLG-first** -- no sales team until enterprise demand is proven.
5. **Cloud is the monetization layer** -- not the core tool.

### Open Questions (revisit at V3)

1. **Annual discount**: 20% discount for annual billing? Standard practice, but reduces early cash collection.
2. **Seat minimums**: 5-seat minimum for Team tier? Prevents $29/mo single-seat accounts that cost more to support than they generate.
3. **Usage caps on free tier**: Should the free OSS tool have any soft limits (e.g., 1,000 annotations/project) to nudge toward cloud? Risky -- developers resent artificial limits.
4. **Open-source cloud components**: Should the cloud backend also be OSS (self-hostable) or proprietary? Supabase/PostHog went OSS; GitLab went open core. Both work. Decision depends on whether self-hosting the cloud layer cannibalizes paid revenue or builds trust.
5. **Partner/reseller channel**: Should we partner with AI agent companies (Anthropic, OpenAI) for distribution? Only worth exploring once product-market fit is proven.

---

## 10. Summary

Peril's business model is **Open Core with PLG distribution**:

- **Free forever**: Full local development tool (SDK, server, MCP, React adapter). MIT licensed. No restrictions.
- **Paid cloud**: Team collaboration, shared dashboards, SSO, compliance. Per-seat pricing starting at $29/mo.
- **Enterprise**: Custom contracts for large organizations needing security, compliance, and on-prem options.

The growth sequence is: **OSS adoption → community → cloud convenience → team expansion → enterprise inbound**. Revenue comes from the hosted collaboration layer, not from restricting the core tool.

The bet: every team using AI coding agents will hit the visual feedback bottleneck. Peril is the first tool purpose-built for the agent era. The free OSS tool creates the wedge. The cloud platform captures the value.
