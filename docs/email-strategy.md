# Peril -- Email & Changelog Strategy

**Date:** 2026-03-10
**Author:** CMO
**Issue:** PER-85

---

## 1. Email Philosophy

Email is the highest-LTV owned channel. No algorithm changes, no platform risk, no pay-to-play. But developers have zero tolerance for spam. Every email must justify the interruption.

**Lean startup principle:** Don't build an email marketing machine before you have something worth emailing about. Start with one email type (changelog), prove value, then expand.

**Core rules:**
- Low frequency, high value
- Never buy lists
- Every email has a reason to exist
- Unsubscribe is one click, no guilt

---

## 2. Email Types

### 2.1 The Peril Email Stack

| Email Type | Frequency | Purpose | Phase |
|---|---|---|---|
| **Changelog** | Per release (1-2x/month) | What's new, what changed | V1 (launch) |
| **Launch announcement** | Once | "Peril is live, here's how to try it" | Launch day |
| **Welcome sequence** | Triggered on signup | Onboarding, first value | V2 |
| **Monthly digest** | Monthly | Community highlights, top content | V3 |
| **Product updates** | Ad hoc | Major features, milestones | As needed |

### 2.2 What We Never Send

- Sales emails to people who haven't opted in
- Weekly newsletters (too frequent for a dev tool)
- "We miss you" re-engagement emails (cringe for developer audience)
- Partner/sponsor emails (never sell your list)
- Multi-email drip sequences longer than 3 emails

---

## 3. Email Capture

### 3.1 Capture Points

| Location | Offer | Expected Conversion |
|---|---|---|
| **Marketing site footer** | "Get release updates. No spam, unsubscribe anytime." | 1-2% of visitors |
| **Blog post footer** | "Subscribe for more technical deep-dives." | 2-4% of readers |
| **GitHub README** | Link to changelog subscription | 0.5-1% of repo visitors |
| **Discord welcome** | Pin link to email signup | 5-10% of members |

### 3.2 Capture Form Design

- **One field:** email address only. No name, no company, no role.
- **Clear value prop:** "Release notes and technical updates. 1-2 emails per month."
- **No popup modals.** Developers hate them. Inline form or footer only.
- **No gating.** Never require email to view docs, blog posts, or the demo.
- **Privacy statement:** "We don't share your email. Ever."

### 3.3 Tool Selection

| Tool | Cost | Fit | Recommendation |
|---|---|---|---|
| **Buttondown** | Free (100 subs), $9/mo (1K) | Markdown-native, developer-friendly, simple | P0 pick |
| **Resend** | Free (100 emails/day) | API-first, developer-focused | Good alternative |
| **ConvertKit** | $29/mo (1K subs) | Creator-focused, good automation | Overkill for now |
| **Mailchimp** | Free (500 subs) | Too complex, too corporate | Skip |

**Recommendation:** Buttondown. It's built for developers, supports Markdown emails, has a clean subscriber management UI, and the free tier covers our first 100 subscribers.

---

## 4. Changelog Emails

### 4.1 Format

Every release gets a changelog email. This is our primary email type.

**Template:**

```
Subject: Peril v{version}: {one-line summary}

---

## What's New in v{version}

### {Feature/Fix 1 heading}

{2-3 sentences explaining what changed and why it matters.
Include a code snippet if relevant.}

### {Feature/Fix 2 heading}

{Same format.}

---

**Full changelog:** [link to /changelog]
**Try it:** `npm update @peril-ai/react`
**Questions?** [Discord link]

---
You're receiving this because you signed up for Peril release updates.
[Unsubscribe]
```

### 4.2 Changelog Rules

1. **Lead with the user benefit,** not the technical change. "Agents now receive computed styles for selected elements" > "Added computedStyles field to locator bundle."
2. **Include code** when the change affects how developers use the tool.
3. **Keep it under 300 words.** If there's more to say, link to the blog post.
4. **Send within 24 hours of release.** Changelog emails are time-sensitive.
5. **Plain text or Markdown rendering.** No fancy HTML templates. Developers prefer readable emails.

### 4.3 Subject Line Patterns

| Pattern | Example |
|---|---|
| `Peril v{version}: {feature}` | "Peril v0.3.0: Full-page screenshot capture" |
| `Peril v{version}: {benefit}` | "Peril v0.4.0: Agents find elements 2x faster" |
| `Peril v{version}: {N} improvements` | "Peril v0.5.0: 4 improvements to the annotation flow" |

**Never use:**
- "You won't believe..."
- Emoji in subject lines
- ALL CAPS
- "Breaking changes" (unless there actually are breaking changes)

---

## 5. Launch Announcement Email

### 5.1 Send To

Everyone who signed up via the marketing site pre-launch email capture.

### 5.2 Template

```
Subject: Peril is live -- visual feedback for AI coding agents

---

Peril is now available.

It turns visual UX feedback into structured, agent-executable tasks
via MCP. Point at what's wrong in your app, and your coding agent
gets locators, screenshots, and DOM context to fix it.

**Try it:**

    npm install @peril-ai/react

**See the demo:** [link]

**Read the docs:** [link]

We launched on Hacker News today: [link]

Free, open source, MIT licensed. Works with Claude Code, Codex,
and any MCP-compatible agent.

Questions? Join us on Discord: [link]

---
[Unsubscribe]
```

### 5.3 Timing

Send 4-6 hours after the HN post goes live. By then you'll have:
- An HN link to include (social proof)
- Confidence that the product is working (no launch-day bugs)
- Early feedback to reference

---

## 6. Welcome Sequence (V2)

Activate only after launch, once we have 100+ subscribers and the product is stable.

### 6.1 Sequence Design

**3 emails over 7 days.** No more. Developers don't want a 12-email drip sequence.

**Email 1: Welcome (immediate)**
```
Subject: Welcome to Peril

You're in. Here's the quickest path to your first annotation:

1. npm install @peril-ai/react
2. Wrap your app in <ReviewProvider>
3. Press Ctrl+Shift+. to toggle review mode
4. Click any element and add a comment

Full quickstart: [link]
```

**Email 2: MCP Setup (Day 3)**
```
Subject: Connect Peril to your coding agent

Your annotations are more useful when an agent consumes them.

Here's how to connect Peril to:
- Claude Code: [link]
- Codex: [link]
- Any MCP agent: [link]

Once connected, your agent receives structured tasks with
locators, screenshots, and DOM context.
```

**Email 3: Community (Day 7)**
```
Subject: Join the Peril community

500+ developers are using Peril to bridge visual feedback and
AI coding agents.

- Discord: [link] (support, feedback, showcase)
- GitHub: [link] (star, contribute, file issues)
- Blog: [link] (technical deep-dives, use cases)

That's the last onboarding email. You'll only hear from us
for release notes going forward.
```

### 6.2 Sequence Rules

- Each email must provide standalone value (don't require reading previous emails)
- Include unsubscribe link in every email
- No upsell or pricing mentions in the welcome sequence (V1 is free)
- Measure open rate and click rate per email. Drop any email below 20% open rate.

---

## 7. Monthly Digest (V3)

Activate when the community is large enough (500+ subscribers) to justify the effort.

### 7.1 Format

```
Subject: Peril Monthly: {month} {year}

---

## This Month

- **Released:** v{version} with {key feature}
- **Community:** {N} new Discord members, {N} new GitHub stars
- **Top blog post:** "{title}" [link]
- **From the community:** {user story or showcase}

## Coming Next

- {Feature in progress}
- {Content coming soon}

---
[Read more on the blog] [Unsubscribe]
```

### 7.2 Rules

- Under 200 words
- One edition per month maximum
- Include community content (not just our own announcements)
- Send on the first Tuesday of each month

---

## 8. Segmentation (V3+)

At scale, segment the email list for targeted content:

| Segment | Criteria | Content Adjustment |
|---|---|---|
| **Active users** | Have installed and created annotations | Feature tips, advanced guides |
| **Interested but not installed** | Signed up but no install signal | Use case content, demo links |
| **Enterprise-interest** | Work at companies with 50+ engineers | Team features, case studies |

### 8.1 Lean Segmentation Rules

- Don't segment until you have 500+ subscribers. Below that, everyone gets the same email.
- Maximum 3 segments. More creates maintenance burden without proportional value.
- Segment based on behavior (what they did), not demographics (who they are).

---

## 9. Metrics

| Metric | Target | Benchmark |
|---|---|---|
| **Open rate** | >40% | Dev tool newsletters: 35-50% |
| **Click rate** | >8% | Dev tool newsletters: 5-12% |
| **Unsubscribe rate** | <0.5% per email | Industry: 0.2-0.5% |
| **List growth** | 50+ new subscribers/month post-launch | Depends on traffic |
| **Spam complaints** | 0 | Zero tolerance |

### 9.1 When to Worry

| Signal | Meaning | Action |
|---|---|---|
| Open rate drops below 30% | Subject lines or frequency wrong | A/B test subject lines, reduce frequency |
| Unsubscribe rate exceeds 1% | Content not valuable enough | Survey departing subscribers |
| Click rate below 3% | Content doesn't drive action | Better CTAs, more relevant links |
| Spam complaints > 0.1% | Permission or frequency issue | Review signup flow, reduce sends |

---

## 10. Lean Startup Email Principles

1. **One email type first.** Changelog. Prove it's valuable before adding more types.

2. **Earn every email.** Before hitting send, ask: "Would I want to receive this?" If no, don't send it.

3. **Developers judge email quality harshly.** One bad email (too salesy, too long, too frequent) and they unsubscribe. The bar is higher than other audiences.

4. **Plain text > HTML templates.** Developers trust emails that look like they came from a person, not a marketing platform. Markdown-rendered emails are the sweet spot.

5. **Frequency: less is more.** 1-2 emails per month maximum. Your audience will forget you exist? Good. When they get your email, it'll be worth reading.

6. **Never gate content behind email signup.** Docs, blog posts, and demos must be freely accessible. Email is for people who actively want updates, not for people you've forced to trade their address.

7. **The unsubscribe link is a feature, not a problem.** Make it prominent, one-click, no "are you sure?" gauntlet. Respect the developer's time.
