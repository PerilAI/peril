# Peril -- Battlecards & Positioning

## What Peril Is

Peril turns visual UX feedback into structured, machine-readable tasks that coding agents can understand and fix autonomously. It is the bridge between "I see a problem" and "the agent ships a patch."

Three layers:
1. **In-page review SDK** -- hover, select, annotate any DOM element in the live app
2. **Review backend** -- stores annotations as structured tasks with locators, screenshots, replay artifacts, and acceptance criteria
3. **Agent bridge (MCP)** -- exposes tasks as tools to Claude Code, Codex, and any MCP-compatible agent

Works across React, Remix, Angular, and plain HTML via framework-agnostic core with thin adapters.

---

## One-Liner

> Peril makes human judgment a first-class input to agentic development -- point at what's wrong, and the agent fixes it.

---

## ICP (Ideal Customer Profile)

| Dimension | Detail |
|---|---|
| **Company size** | Seed to Series B startups shipping with AI coding agents |
| **Team shape** | Small eng teams (2-15) using Claude Code, Codex, or Cursor in daily workflow |
| **Pain** | Non-engineers (design, PM, QA) can see UI bugs but can't describe them in a way agents can act on |
| **Trigger event** | Team adopts an AI coding agent and immediately hits the "feedback bottleneck" -- humans still type text descriptions of visual problems |
| **Buyer** | Engineering lead or Head of Product |
| **User** | Anyone reviewing a UI -- designers, PMs, QA, founders |

---

## Key Differentiators

1. **Agent-native from day one.** Every annotation is structured for machine consumption: ranked locator bundles, DOM snapshots, element screenshots, rrweb replay segments. No human-to-human ticket reformatting.

2. **MCP-first architecture.** Peril is a first-class tool provider to agents via the Model Context Protocol. Claude Code and Codex connect directly. No middleware, no webhook plumbing.

3. **Stable element identity.** Annotations carry 5 locator strategies ranked by resilience (test ID > ARIA role > CSS > XPath > text). Agents can relocate the target element even after code changes.

4. **Full interaction context.** rrweb recordings capture the sequence of actions that produced the bug state -- not just a static screenshot. Agents see what happened, not just what it looks like.

5. **Framework-agnostic core.** One DOM-level engine works everywhere. Framework adapters are thin wrappers, not separate products.

6. **Verification loop.** Agents can use Playwright to reproduce, patch, and verify the fix against the original annotation -- closing the loop without human re-inspection.

---

## Competitive Battlecards

### vs. Marker.io

| | Peril | Marker.io |
|---|---|---|
| **Output** | Structured agent task (MCP) | Jira/Trello/Asana ticket |
| **Locators** | 5-strategy ranked bundle | Screenshot + CSS selector |
| **Replay** | rrweb session segment | Video recording |
| **Agent integration** | Native MCP server | None -- manual ticket triage |
| **Verification** | Playwright-based automated re-check | Human re-test |

**When they bring up Marker.io:** "Marker.io is great at getting screenshots into Jira. But you're using coding agents now -- who reads that Jira ticket? Peril skips the ticket and gives the agent everything it needs to find the element, understand the context, and ship the fix."

**Key objection:** "We already use Marker.io and it works fine."
**Response:** "It works fine for human developers reading tickets. The moment an agent enters the loop, you're paying someone to re-describe the bug in agent-friendly terms. Peril eliminates that translation layer."

---

### vs. BugHerd

| | Peril | BugHerd |
|---|---|---|
| **Output** | Structured agent task | Kanban card with screenshot |
| **Element targeting** | Multi-locator bundle | Pin on page (coordinates) |
| **Context depth** | DOM snippet + rrweb + locators + screenshot | Screenshot + browser info |
| **Agent integration** | MCP server | None |
| **Framework support** | React, Angular, plain HTML, SSR-safe | Any website (shallow capture) |

**When they bring up BugHerd:** "BugHerd pins a note on the page. Peril captures what the agent needs to find and fix it. Pins are for humans. Locator bundles are for machines."

---

### vs. Jam.dev

| | Peril | Jam.dev |
|---|---|---|
| **Output** | Agent-ready task via MCP | Bug report with auto-captured console/network logs |
| **Target user** | Anyone reviewing UI + coding agents | Developers reporting bugs to developers |
| **Unique value** | Closes the loop: feedback → agent → fix → verify | Rich dev context for human triage |
| **Agent integration** | Native MCP | None |
| **Verification** | Automated Playwright re-check | Manual |

**When they bring up Jam:** "Jam gives developers richer bug reports for other developers. Peril gives anyone the ability to point at a problem and have an agent fix it. Different audience, different output, different outcome."

---

### vs. "Just paste a screenshot into Claude/Codex"

This is the real competitor -- the manual workflow.

| | Peril | Manual screenshot + prompt |
|---|---|---|
| **Annotation precision** | Exact element with locator bundle | "The button in the top right" |
| **Reproducibility** | rrweb replay + Playwright | "Try clicking the pricing page" |
| **Batching** | Review queue with prioritization | One-at-a-time paste |
| **Non-engineer access** | Purpose-built overlay, no IDE needed | Requires prompt engineering skill |
| **Verification** | Automated | Human checks if it looks right |

**When they say "we just paste screenshots":** "That works for one bug. What about 15 from a design review? What about feedback from someone who doesn't have Claude Code open? Peril turns a review session into a structured queue that agents process without you sitting there prompting each one."

---

### vs. Figma Comments / Design Tools

| | Peril | Figma Comments |
|---|---|---|
| **Surface** | Live running app | Static design file |
| **Fidelity** | Real DOM, real state, real data | Intended design, not reality |
| **Agent handoff** | Direct via MCP | None -- comments stay in Figma |
| **Gap it addresses** | "The build doesn't match what I expected" | "The design should change" |

**When they say "we use Figma for feedback":** "Figma comments are about what the design should be. Peril comments are about what the build actually is. They're complementary -- Figma for intent, Peril for implementation reality."

---

## Positioning Table

| Dimension | Peril | Traditional Feedback Tools (Marker.io, BugHerd, UserSnap) | Dev Bug Reporters (Jam, Zipy) | Manual Agent Prompting |
|---|---|---|---|---|
| **Primary output** | Agent-executable task | Human-readable ticket | Developer-readable report | Ad hoc prompt |
| **Target consumer** | Coding agent (Claude Code, Codex) | Human developer | Human developer | Coding agent |
| **Element identification** | Multi-strategy locator bundle | Screenshot + pin | Console logs + screenshot | Natural language description |
| **Interaction capture** | rrweb recording segment | Video/GIF | Session replay | None |
| **Agent integration** | Native MCP server | Webhook to PM tool | API/webhook | Copy-paste |
| **Verification** | Automated Playwright loop | Manual re-test | Manual re-test | Manual re-test |
| **Who can give feedback** | Anyone with a browser | Anyone with the widget | Developers | People with agent access |
| **Batch workflow** | Review queue → agent processes all | Ticket backlog | Bug list | One at a time |
| **Framework awareness** | Yes (adapters for React, Angular, etc.) | No (page-level only) | No | No |
| **Category** | Agent-native UI review | Visual bug tracking | Developer experience | Workflow |

---

## Objection Handling

**"We don't use coding agents yet."**
You will. When you do, the feedback bottleneck will be your first pain point. Peril works as a standalone visual review tool today and becomes agent-native the day you plug in MCP.

**"MCP is too new / not stable."**
MCP is backed by Anthropic, adopted by Claude Code, Codex, Cursor, and Windsurf. It's the emerging standard. Peril also supports a simpler file-queue mode for teams not ready for MCP.

**"Our designers just use Slack screenshots."**
And someone has to translate that screenshot into a task an agent can act on. That translation is the bottleneck Peril eliminates.

**"We need enterprise integrations (Jira, Linear, etc.)."**
Peril's structured tasks can be exported to any PM tool. But the primary consumer is the agent, not the ticket system. If you want the agent to fix it, skip the ticket.

**"How is this different from Playwright MCP alone?"**
Playwright MCP lets agents interact with browsers. Peril tells agents which elements to look at and why. Playwright is the hand; Peril is the eye and the judgment.

---

## Elevator Pitch (30 seconds)

"Your team sees UI bugs faster than they can describe them to coding agents. Peril lets anyone point at what's wrong in the live app and turns that into a structured task the agent can find, fix, and verify -- no prompt engineering, no ticket reformatting. It's the missing link between human eyes and agent hands."
