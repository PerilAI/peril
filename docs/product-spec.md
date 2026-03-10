# Peril Product Spec

## Overview

Peril lets a human reviewer point at a problem in a running app and convert that observation into a task a coding agent can actually execute. The goal is to remove the translation step between visual feedback and implementation work.

## Problem

Teams using coding agents still depend on humans to describe UI bugs in text. That translation is slow, lossy, and often inaccurate.

Common failure modes:

- The reviewer cannot precisely identify the target element
- The prompt omits the interaction that produced the bug
- The agent gets a screenshot but not enough structured context to reproduce the issue
- Non-engineers can see the bug but cannot package it in agent-friendly form

## Product Goal

Make human judgment a first-class input to agentic development by turning review feedback into structured tasks with enough context for an agent to reproduce, patch, and verify a fix.

## Primary Users

- Designers reviewing fidelity and polish
- PMs validating flows and copy
- QA reviewers catching regressions
- Founders or operators giving ad hoc UI feedback
- Engineers consuming the resulting review queue through agents

## Core Use Cases

### 1. Live UI review

A reviewer enables review mode, hovers an element, selects it, and attaches feedback about what is wrong and what should happen instead.

### 2. Agent task handoff

Peril stores the review as a structured record with locators, screenshots, route context, and optional replay artifacts, then exposes it to an agent through MCP or a local file queue.

### 3. Reproduction and verification

An agent opens the task, relocates the element, reproduces the problem in a browser, edits code, and verifies the change against the original review context.

## Functional Requirements

### Review capture

- Enter and exit review mode inside a running app
- Highlight hovered elements and select a target element
- Attach comment, category, severity, and expected behavior
- Capture route, viewport, scroll position, and element bounds
- Capture element screenshot and full-page screenshot
- Optionally attach rrweb session data for interaction context

### Stable element identity

Each review must store a ranked locator bundle:

1. `data-review-id`
2. `data-testid`
3. ARIA role plus accessible name
4. Semantic CSS selector
5. XPath fallback

### Structured review record

Each annotation should produce a durable JSON record containing:

- Review metadata
- Page and viewport context
- Selected element metadata
- Locator bundle
- Reviewer feedback
- Artifact references
- Acceptance criteria

### Agent access

The system must support:

- Listing open reviews
- Fetching a review and its artifacts
- Marking reviews resolved after verification
- Reproducing reviews in a browser-backed workflow

## Non-Goals for V1

- Deep framework-internal inspection
- Enterprise PM integrations as the primary workflow
- Cross-origin iframe support
- Perfect source-file mapping
- Automatic patch generation in the browser SDK

## UX Constraints

- The overlay must not permanently interfere with host app interaction
- It should work across React, Remix, Angular, and plain HTML
- SSR and hydration concerns must be handled in adapters, not the core
- The primary interaction model should be simple enough for non-engineers

## V1 Output Schema

```json
{
  "id": "rev_123",
  "url": "http://localhost:3000/pricing",
  "timestamp": "2026-03-09T21:10:00Z",
  "viewport": { "width": 1440, "height": 900 },
  "selection": {
    "boundingBox": { "x": 218, "y": 164, "width": 412, "height": 56 },
    "locators": {
      "reviewId": "hero-cta",
      "testId": "hero-cta",
      "role": { "type": "button", "name": "Start free trial" },
      "css": "[data-testid='hero-cta']",
      "xpath": "//*[@data-testid='hero-cta']"
    },
    "domSnippet": "<button data-testid='hero-cta'>Start free trial</button>"
  },
  "comment": {
    "type": "ux-polish",
    "severity": "medium",
    "text": "This wraps awkwardly at laptop widths.",
    "expected": "Single line, aligned with hero copy baseline"
  },
  "artifacts": {
    "elementScreenshot": "artifact://rev_123/element.png",
    "pageScreenshot": "artifact://rev_123/page.png",
    "rrwebSession": "artifact://rev_123/replay.json"
  }
}
```

## Success Criteria

- A non-engineer can create a review without touching an IDE
- An agent can resolve the target element from stored metadata
- The system preserves enough context to reproduce common UI issues
- Reviews can be processed in batches rather than one screenshot at a time
