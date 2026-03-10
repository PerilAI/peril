# Peril -- Developer Relations Playbook

**Date:** 2026-03-10
**Author:** CMO
**Issue:** PER-85

---

## 1. DevRel Philosophy

Developer relations for Peril is about earning trust in the ecosystems we depend on, not about promotional outreach. We build credibility by contributing to the MCP ecosystem, writing integration guides, and helping developers solve real problems.

**Lean startup principle:** DevRel at this stage means the founding team being visible and helpful in the right places. No dedicated DevRel hire until the community is self-sustaining and we can't keep up with demand.

---

## 2. Ecosystem Positioning

### 2.1 Where Peril Lives

Peril sits at the intersection of three ecosystems:

```
MCP Ecosystem (Anthropic, tool providers)
    ↕
Peril
    ↕
AI Coding Agents (Claude Code, Codex, Cursor)
    ↕
Frontend Development (React, web platform)
```

Our DevRel strategy engages all three, but the MCP ecosystem is our primary home.

### 2.2 Ecosystem Contribution Priorities

| Ecosystem | Contribution Type | Priority | Why |
|---|---|---|---|
| **MCP** | Tool design best practices, integration guides, spec feedback | P0 | Our differentiation is MCP-native. Be known as an MCP tool leader. |
| **AI Coding Agents** | Integration guides, use case demos | P0 | Our users run Claude Code, Codex, Cursor. |
| **React** | Open-source component patterns, overlay techniques | P1 | Our SDK is React-first. Contributing back builds credibility. |
| **Testing/QA** | Locator strategy research, visual testing patterns | P2 | Adjacent community that shares our locator expertise. |

---

## 3. Integration Guides

### 3.1 Priority Integration Guides

Write and maintain integration guides for each major agent:

| Agent | Priority | Guide Title | Target Publish |
|---|---|---|---|
| **Claude Code** | P0 | "Using Peril with Claude Code: Visual Feedback → MCP Tasks" | Launch week |
| **Codex (OpenAI)** | P0 | "Peril + Codex: Agent-Ready UI Annotations" | Launch +2 weeks |
| **Cursor** | P1 | "Adding Peril to Your Cursor Workflow" | Launch +4 weeks |
| **Windsurf** | P2 | "Peril with Windsurf: MCP Visual Review Setup" | Post-launch |
| **Generic MCP** | P1 | "Connecting Any MCP-Compatible Agent to Peril" | Launch week |

### 3.2 Guide Structure

Each integration guide follows the same template:

1. **Prerequisites** (agent installed, React app available)
2. **Install Peril** (3 lines of code)
3. **Configure the agent** (MCP server connection)
4. **First annotation** (step-by-step with screenshots)
5. **What the agent receives** (show the MCP tool output)
6. **Advanced: batch processing** (multiple annotations at once)
7. **Troubleshooting** (common issues)

### 3.3 Guide Quality Standards

- Every guide must be tested end-to-end by someone following the steps from scratch
- Include actual terminal output and screenshots, not mockups
- Time-to-complete target: under 10 minutes
- Update within 48 hours of any breaking change in Peril or the agent

---

## 4. MCP Ecosystem Participation

### 4.1 Contribution Opportunities

| Activity | Effort | Impact | Timeline |
|---|---|---|---|
| List Peril on MCP tool directories | Low | Discovery | Launch week |
| Write blog post on MCP tool design best practices | Medium | Credibility | Month 1 |
| Contribute to MCP spec discussions (if open) | Low | Influence | Ongoing |
| Build example MCP client/server patterns | Medium | Ecosystem value | Month 2 |
| Present at MCP community events (if they exist) | Medium | Visibility | When invited |

### 4.2 MCP Directories and Registries

Register Peril on:
- Anthropic's MCP tool directory (if one exists)
- awesome-mcp-servers GitHub list
- mcptools.com (if applicable)
- Smithery or similar MCP registries

### 4.3 Thought Leadership: MCP Tool Design

Our research shows 97% of MCP tool descriptions have quality issues. We've invested heavily in best-in-class MCP tool design (structured output, safety annotations, actionable errors). Share this expertise:

**Blog post:** "Designing MCP Tools Agents Actually Want to Use"
- Common mistakes in tool descriptions
- Why `outputSchema` matters for agent reliability
- Safety annotations (`readOnlyHint`, `destructiveHint`) and when to use them
- How Peril structures its 5 MCP tools

This positions us as MCP tool design experts, not just another MCP tool provider.

---

## 5. Open Source Engagement

### 5.1 Contribution Strategy

Being a good open-source citizen builds credibility faster than any marketing campaign.

| Activity | Frequency | Example |
|---|---|---|
| **Upstream contributions** | When we hit bugs or gaps | PR to React, MCP SDK, Playwright |
| **Issue triage on our repo** | < 24 hours | Acknowledge, label, prioritize |
| **Good-first-issue tags** | Keep 3-5 open | Simple tasks for new contributors |
| **Contributor recognition** | Every release | Credits in changelog |
| **License clarity** | Always | MIT, no contributor license agreement needed |

### 5.2 Contribution Guidelines

Maintain a clear CONTRIBUTING.md:
- How to set up the development environment
- How to run tests
- Code style and conventions
- PR review process and expectations
- Response time commitment (we aim for < 48 hours on PRs)

### 5.3 What We Don't Accept

Be transparent about boundaries:
- Feature PRs without a linked issue (discussion first)
- Large refactors without prior agreement
- Dependencies that increase bundle size beyond 50KB gzipped
- Framework-specific code in `packages/core/`

---

## 6. Conference and Event Strategy

### 6.1 Lean Startup Approach to Events

**Pre-revenue rule:** Attend and speak. Don't sponsor. Sponsorship ROI is negative until you have a sales funnel that converts conference leads.

| Event Type | Priority | Approach |
|---|---|---|
| **MCP/AI agent meetups** | P0 | Attend all local, submit talks to virtual |
| **React/frontend conferences** | P1 | Submit CFPs with technical talks (locator strategies, overlay architecture) |
| **Developer tool conferences** | P1 | Attend, network, demo at hallway track |
| **General AI conferences** | P2 | Attend only if MCP/agent track exists |
| **Enterprise conferences** | Skip | Not our stage yet |

### 6.2 Talk Topics

Talks should teach something, not pitch Peril. The product is context, not content.

| Talk Title | Conference Type | Peril Mention |
|---|---|---|
| "Multi-Strategy Locator Bundles: Beyond CSS Selectors" | Testing/QA conferences | "We built this for Peril" (30 seconds) |
| "Designing MCP Tools Agents Want to Use" | AI/MCP meetups | Peril as case study |
| "The Feedback Bottleneck in Agentic Development" | Dev tool conferences | Problem framing, Peril as one solution |
| "React Overlays Done Right: Portals, Z-Index, and Focus Management" | React conferences | "We solved this for Peril's review overlay" |

### 6.3 Event Calendar (2026)

Research and target these events:

| Event | Approx Date | Type | Action |
|---|---|---|---|
| MCP Community Day (if exists) | TBD | MCP ecosystem | Submit talk |
| React Summit | June 2026 | React conference | Submit CFP |
| Node Congress | Q2 2026 | Node/JS conference | Submit CFP |
| AI Engineer Summit | Q3 2026 | AI engineering | Attend |
| Local meetups | Monthly | Varied | Attend, present when invited |

---

## 7. Developer Advocacy Activities

### 7.1 Content Contributions

| Activity | Cadence | Channel |
|---|---|---|
| Write for Dev.to | 1x/month | Cross-post from blog with canonical URL |
| Participate in Reddit AMAs | When relevant | r/programming, r/ChatGPTCoding |
| GitHub discussions | Continuous | Our repo + related repos |
| Technical Twitter threads | 1-2x/week | Insights from building Peril |
| Stack Overflow answers | When relevant | Tag: MCP, visual-testing, locators |

### 7.2 Demo and Workshop Content

| Asset | Purpose | Timeline |
|---|---|---|
| 3-minute demo video | Quick product overview for conferences/links | Month 1 |
| "Build with Peril" workshop | 30-minute hands-on tutorial | Month 3 |
| Live coding stream | Building Peril features in public | Month 2 (1x/month) |

---

## 8. Partnerships

### 8.1 Integration Partnerships

| Partner | Type | Value | Priority |
|---|---|---|---|
| **Anthropic (Claude Code)** | Integration | Listed as MCP tool partner | P0 |
| **OpenAI (Codex)** | Integration | Codex MCP integration guide | P0 |
| **Cursor** | Integration | Listed in Cursor marketplace/tools | P1 |
| **Vercel** | Ecosystem | Integration with Vercel deployment workflow | P2 |
| **Playwright** | Technical | Peril's verification loop uses Playwright | P2 |

### 8.2 Partnership Approach

At our stage, "partnership" means:
1. Write a great integration guide for their tool
2. Make sure it works flawlessly
3. Share the guide with their developer relations team
4. Ask to be listed in their ecosystem/tools page
5. Offer to co-author a blog post showing the integration

**Don't** approach with: "Let's do a partnership." **Do** approach with: "We built a great integration with your tool. Here's the guide. Can you review it?"

---

## 9. Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|---|---|---|
| Integration guide page views | 1,000/month | 3,000/month |
| MCP directory listings | 3+ | 5+ |
| Community blog posts (Dev.to, etc.) | 3+ | 8+ |
| Conference talks submitted | 2+ | 5+ |
| Conference talks accepted | 0-1 | 1-2 |
| Upstream contributions (PRs) | 2+ | 5+ |
| External mentions (blogs, tweets) | 10+ | 50+ |

---

## 10. Lean Startup DevRel Principles

1. **Contribute before you promote.** Help the MCP ecosystem succeed. Help developers solve problems. Let Peril be the natural context, not the forced pitch.

2. **Write guides, not press releases.** Integration guides that work perfectly are the highest-ROI DevRel activity. They solve a real problem and drive qualified traffic.

3. **Speak at meetups before conferences.** Meetups have lower bars, more intimate audiences, and faster feedback. Refine your talk at 3 meetups before submitting to a conference CFP.

4. **No DevRel hire before product-market fit.** The founding team does DevRel until community demand exceeds available time. Hiring early creates overhead without signal.

5. **Be genuinely helpful on other people's projects.** File good bug reports on tools we use. Answer questions about MCP. Contribute to docs. This builds reciprocal goodwill.

6. **Open source is marketing.** Every line of MIT-licensed code is a trust signal. Every merged contribution is a relationship. Treat the repo as a community space, not just a code repository.
