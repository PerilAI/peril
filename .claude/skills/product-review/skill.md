---
name: product-review
description: >
  Request a product review from the Chief of Product after completing engineering
  work. Use when you finish a ticket, issue, or PR and need product/UX validation.
  Triggers a CPO review to check whether the output aligns with the product vision
  and is the optimal implementation from a UX perspective.
---

# Product Review Skill

Use this skill after completing engineering work to request a product review from the Chief of Product (CPO).

## When to Use

Invoke `/product-review` when:

- You finish implementing a feature or user-facing change
- You complete a ticket that affects UX, workflows, or user-visible behavior
- You want product sign-off before marking work as done
- You're unsure if your implementation matches the product intent

You do NOT need a product review for:

- Pure infrastructure or CI/CD changes
- Test-only changes
- Internal refactors with no user-facing impact
- Bug fixes that restore existing behavior (no UX change)

## How It Works

When invoked, you will create a Paperclip issue assigned to the CPO that includes the context they need to review your work. The CPO will be woken by a heartbeat to perform the review.

## Arguments

Pass the issue identifier of the completed work as an argument. If omitted, the skill uses `$PAPERCLIP_TASK_ID` from your current heartbeat context.

Examples:

- `/product-review PER-25` -- review a specific issue
- `/product-review` -- review the current task (uses `$PAPERCLIP_TASK_ID`)

## Procedure

Follow these steps exactly:

### Step 1 -- Gather Context

1. Determine the source issue ID:
   - If an argument was provided (e.g., `PER-25`), search for it: `GET /api/companies/{companyId}/issues?q=PER-25`
   - Otherwise, use `$PAPERCLIP_TASK_ID`
   - If neither is available, ask the user which issue to review.

2. Fetch the source issue: `GET /api/issues/{issueId}`

3. Fetch comments on the source issue: `GET /api/issues/{issueId}/comments`

4. Summarize what was done:
   - What changed (files, features, UI elements)
   - Which product requirements or user stories this addresses
   - Any trade-offs or deviations from the original spec

### Step 2 -- Create the Review Issue

Create a new Paperclip issue assigned to the CPO:

```
POST /api/companies/{companyId}/issues
Headers: Authorization: Bearer $PAPERCLIP_API_KEY, X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID
{
  "title": "Product review: {short description of what was built}",
  "description": "## Product Review Request\n\n**Source issue:** [{sourceIdentifier}](/{prefix}/issues/{sourceIdentifier})\n**Completed by:** {your agent name}\n\n### What was built\n{summary of the implementation}\n\n### What to review\n- Does this align with the product requirements in the source issue?\n- Is this the right UX for the feature?\n- Are there product concerns with the implementation approach?\n\n### Files changed\n{list key files or areas changed}\n\n### Relevant specs\n{link to PRD sections, user stories, or acceptance criteria if applicable}",
  "status": "todo",
  "priority": "medium",
  "parentId": "{sourceIssueId}",
  "assigneeAgentId": "1b6eb13a-bd59-4c3c-8c52-ad81a01c04ac"
}
```

Key fields:

- `assigneeAgentId`: Always `1b6eb13a-bd59-4c3c-8c52-ad81a01c04ac` (Chief of Product)
- `parentId`: The source issue ID (links the review to the original work)
- `goalId`: Copy from the source issue if it has one
- `priority`: Match the source issue's priority

### Step 3 -- Comment on the Source Issue

Post a comment on the original issue noting the review was requested:

```
POST /api/issues/{sourceIssueId}/comments
Headers: Authorization: Bearer $PAPERCLIP_API_KEY, X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID
{
  "body": "## Product Review Requested\n\nCreated [{reviewIdentifier}](/{prefix}/issues/{reviewIdentifier}) for @Chief of Product to review this work from a product perspective."
}
```

### Step 4 -- Confirm

Output a short confirmation to the user:

```
Product review requested: {reviewIdentifier} assigned to Chief of Product.
```

## Notes

- The CPO reviews for product alignment, UX quality, and whether the implementation is optimal from the user's perspective. This is not a code review.
- If the CPO finds issues, they will comment on the review issue with feedback. You may receive a follow-up task.
- Do not mark the source issue as `done` until the product review passes. Set it to `in_review` if it was `in_progress`.
