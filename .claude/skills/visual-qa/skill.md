---
name: visual-qa
description: >
  Visual QA testing skill for reviewing engineer worktree changes in Chrome.
  Use this skill whenever an engineer wants to merge a worktree, requests QA
  review of UI changes, asks you to test their branch, or when you need to
  visually verify that a feature works correctly in the browser. Also use when
  someone mentions "visual QA", "browser testing", "check my changes",
  "review my worktree", or "test this in Chrome". Triggers for any request
  involving running a local dev server and visually inspecting the result.
---

# Visual QA Testing Skill

You are the QA Engineer for Peril. This skill guides you through visually testing engineer changes in Chrome browser before they merge.

## When to Use

- An engineer asks you to review/test their worktree or branch
- A Paperclip issue is handed to you for QA validation
- You need to verify UI changes work correctly before merge
- Someone asks you to "check", "test", or "QA" their changes

## Prerequisites

You need access to the Chrome browser automation tools (`mcp__claude-in-chrome__*`). Load them via ToolSearch if not already available.

## Procedure

### Step 1 -- Identify the Changes

Determine what you're testing:

1. If given a worktree path or branch name, inspect the changes:
   ```bash
   # Check what branch/worktree we're testing
   git -C <worktree-path> log --oneline main..HEAD
   git -C <worktree-path> diff --stat main..HEAD
   ```

2. If given a Paperclip issue ID, fetch the issue details to understand the acceptance criteria.

3. Read any changed source files to understand what should have changed visually.

### Step 2 -- Build and Start the Dev Server

Run the engineer's code from their worktree:

```bash
# Install deps and build from the worktree
cd <worktree-path>
pnpm install
pnpm build

# Start the dev server (default: http://127.0.0.1:4173)
# Use a background process so we can continue testing
pnpm dev &
DEV_SERVER_PID=$!

# Wait for server to be ready
sleep 2
curl -s http://127.0.0.1:4173/api/health
```

If the project has a different dev command or port, adapt accordingly. Check `package.json` scripts.

If no dev server is applicable (e.g., the changes are purely to library code with no UI), skip to Step 5 (run tests only).

### Step 3 -- Visual Inspection in Chrome

1. **Get browser context:**
   ```
   mcp__claude-in-chrome__tabs_context_mcp (createIfEmpty: true)
   ```

2. **Create a new tab and navigate:**
   ```
   mcp__claude-in-chrome__tabs_create_mcp
   mcp__claude-in-chrome__navigate (url: "http://127.0.0.1:4173", tabId: <tab>)
   ```

3. **Start GIF recording** to capture the QA session:
   ```
   mcp__claude-in-chrome__gif_creator (action: "start_recording", tabId: <tab>)
   mcp__claude-in-chrome__computer (action: "screenshot", tabId: <tab>)
   ```

4. **Systematic visual checks:**

   a. **Layout & Structure**
   - Take a screenshot of the main page
   - Check that elements are properly aligned and spaced
   - Verify no overlapping or cut-off content
   - Check responsive behavior at different viewport sizes:
     ```
     mcp__claude-in-chrome__resize_window (width: 1280, height: 800, tabId: <tab>)
     mcp__claude-in-chrome__computer (action: "screenshot", tabId: <tab>)
     mcp__claude-in-chrome__resize_window (width: 768, height: 1024, tabId: <tab>)
     mcp__claude-in-chrome__computer (action: "screenshot", tabId: <tab>)
     mcp__claude-in-chrome__resize_window (width: 375, height: 812, tabId: <tab>)
     mcp__claude-in-chrome__computer (action: "screenshot", tabId: <tab>)
     ```

   b. **Interactive Elements**
   - Use `read_page` with `filter: "interactive"` to find all buttons, links, inputs
   - Click through interactive elements and verify they respond correctly
   - Check hover states, focus states, and transitions
   - Verify forms accept input and validate properly

   c. **Console Errors**
   - Check for JavaScript errors:
     ```
     mcp__claude-in-chrome__read_console_messages (tabId: <tab>, onlyErrors: true)
     ```
   - Check for failed network requests:
     ```
     mcp__claude-in-chrome__read_network_requests (tabId: <tab>)
     ```

   d. **Accessibility**
   - Use `read_page` to check the accessibility tree
   - Verify semantic HTML structure
   - Check for proper ARIA labels on interactive elements
   - Verify keyboard navigation works (Tab through elements)

   e. **Feature-Specific Testing**
   - Based on the ticket/PR description, test the specific feature that was built
   - Verify acceptance criteria are met
   - Test edge cases (empty states, error states, boundary values)

5. **Stop recording and export GIF:**
   ```
   mcp__claude-in-chrome__computer (action: "screenshot", tabId: <tab>)
   mcp__claude-in-chrome__gif_creator (action: "stop_recording", tabId: <tab>)
   mcp__claude-in-chrome__gif_creator (action: "export", download: true, filename: "qa-review-<ticket>.gif", tabId: <tab>)
   ```

### Step 4 -- API Testing (if applicable)

If the changes involve REST API endpoints:

1. Use JavaScript tool to make fetch requests from the browser:
   ```
   mcp__claude-in-chrome__javascript_tool (
     tabId: <tab>,
     action: "javascript_exec",
     text: "fetch('/api/health').then(r => r.json()).then(d => JSON.stringify(d, null, 2))"
   )
   ```

2. Test each modified endpoint:
   - Verify correct response status codes
   - Validate response body schema matches DATA_MODEL.md
   - Test error cases (404, 400, etc.)

### Step 5 -- Run Automated Tests

Run the project's test suite from the worktree:

```bash
cd <worktree-path>

# Run all tests
pnpm test

# Run specific package tests if only certain packages changed
pnpm test:core      # if core changed
pnpm test:server    # if server changed
pnpm test:mcp       # if mcp changed
pnpm test:harness   # always run harness to check doc alignment
```

Capture and report test results.

### Step 6 -- Clean Up

```bash
# Kill the dev server if we started one
kill $DEV_SERVER_PID 2>/dev/null

# Close the browser tab (optional)
```

### Step 7 -- Report Findings

Compile a QA report with:

1. **Summary**: Pass/fail verdict with one-line rationale
2. **Visual findings**: Screenshots or GIF of the testing session
3. **Test results**: Output from automated test suite
4. **Issues found** (if any):
   - Severity (critical / high / medium / low)
   - Description of the issue
   - Steps to reproduce
   - Screenshot evidence
5. **Acceptance criteria check**: For each criterion from the ticket, state pass/fail

If testing for a Paperclip issue, post the report as a comment on the issue:

```
POST /api/issues/{issueId}/comments
{
  "body": "## QA Report\n\n**Verdict:** [PASS/FAIL]\n\n### Visual Inspection\n- [findings...]\n\n### Automated Tests\n- [results...]\n\n### Issues Found\n- [issues or 'None']\n\n### Acceptance Criteria\n- [x] Criterion 1\n- [ ] Criterion 2 (failed: reason)"
}
```

## Peril-Specific Checks

When testing Peril features, always verify these domain-specific concerns:

- **Locator priority**: testId > role > css > xpath > text (per DATA_MODEL.md)
- **Review schema**: Annotations must match the Review interface
- **MCP tool contract**: Tool signatures must remain stable
- **Core package purity**: No React/framework imports in `packages/core/`
- **Bundle size**: SDK should be < 50 KB gzipped
- **Timestamps**: Must be ISO 8601 format
- **IDs**: Must be ULIDs with `rev_` prefix

## Checklist Template

Use this checklist for every QA review:

```markdown
## QA Checklist

### Build
- [ ] `pnpm install` succeeds
- [ ] `pnpm build` succeeds without errors
- [ ] No TypeScript errors

### Tests
- [ ] `pnpm test` passes
- [ ] `pnpm test:harness` passes
- [ ] New tests written for new functionality

### Visual (if UI changes)
- [ ] Layout correct at desktop (1280px)
- [ ] Layout correct at tablet (768px)
- [ ] Layout correct at mobile (375px)
- [ ] No console errors
- [ ] No failed network requests
- [ ] Interactive elements work
- [ ] Accessibility tree looks correct

### API (if endpoint changes)
- [ ] Correct status codes
- [ ] Response matches DATA_MODEL.md schema
- [ ] Error cases handled

### Code Quality
- [ ] No framework imports in packages/core/
- [ ] Named exports used
- [ ] Conventional commit messages
- [ ] Only task-related files changed
```
