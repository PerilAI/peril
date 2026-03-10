# Peril -- Data Model & MCP Tool Specification

## Core Entities

### Review

The central entity. One review = one annotated UI issue.

```typescript
interface Review {
  id: string;               // ULID, prefixed "rev_"
  url: string;              // Page URL where annotation was created
  timestamp: string;        // ISO 8601
  viewport: Viewport;
  status: ReviewStatus;
  selection: Selection;
  comment: Comment;
  artifacts: Artifacts;
  resolution: Resolution | null;
  metadata: ReviewMetadata;
}

type ReviewStatus = "open" | "in_progress" | "resolved" | "wont_fix";

interface Viewport {
  width: number;
  height: number;
}
```

### Selection

Captures what element was selected and how to find it again.

```typescript
interface Selection {
  boundingBox: BoundingBox;
  locators: LocatorBundle;
  domSnippet: string;        // Outer HTML of selected element (truncated to 2KB)
  computedStyles?: Record<string, string>;  // Key styles for context
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Ranked by resilience. Agents should try in order.
interface LocatorBundle {
  testId?: string;           // data-testid value
  role?: RoleLocator;        // ARIA role + accessible name
  css: string;               // CSS selector
  xpath: string;             // XPath selector
  text?: string;             // Visible text content (truncated to 200 chars)
}

interface RoleLocator {
  type: string;              // ARIA role (button, link, heading, etc.)
  name: string;              // Accessible name
}
```

### Comment

The reviewer's description of the issue.

```typescript
interface Comment {
  category: ReviewCategory;
  severity: Severity;
  text: string;              // Free-form description
  expected: string;          // What the reviewer expects instead
}

type ReviewCategory = "bug" | "polish" | "accessibility" | "copy" | "ux";
type Severity = "low" | "medium" | "high" | "critical";
```

### Artifacts

Binary and structured captures associated with a review.

```typescript
interface Artifacts {
  elementScreenshot: string;  // Path or URI to element screenshot (PNG)
  pageScreenshot: string;     // Path or URI to full-page screenshot (PNG)
  rrwebSession?: string;      // V2: Path to rrweb recording segment (JSON)
}
```

### Resolution

Populated when a review is resolved.

```typescript
interface Resolution {
  resolvedAt: string;        // ISO 8601
  resolvedBy: string;        // Agent ID or "manual"
  comment?: string;          // What was done
}
```

### ReviewMetadata

Additional context for the annotation.

```typescript
interface ReviewMetadata {
  userAgent: string;
  scrollPosition: { x: number; y: number };
  devicePixelRatio: number;
  reviewerName?: string;     // Optional display name
}
```

---

## Storage (V1)

V1 uses local file storage:

```
.peril/
  reviews/
    rev_01HXYZ.../
      review.json          # Full Review object
      element.png          # Element screenshot
      page.png             # Page screenshot
  index.json               # Review index (id, status, category, severity, timestamp, url, comment.text preview)
```

`index.json` is a denormalized list for fast `list_reviews` responses. Kept in sync on write.

SQLite is an alternative if file-per-review becomes unwieldy, but file storage is simpler for V1 and works well with git.

---

## MCP Tool Specification

### `list_reviews`

List all reviews, optionally filtered.

**Input:**
```typescript
{
  status?: ReviewStatus | ReviewStatus[];  // Filter by status. Default: ["open", "in_progress"]
  category?: ReviewCategory;               // Filter by category
  severity?: Severity;                     // Filter by minimum severity
  url?: string;                            // Filter by page URL (prefix match)
  limit?: number;                          // Max results. Default: 50
}
```

**Output:**
```typescript
{
  reviews: Array<{
    id: string;
    url: string;
    timestamp: string;
    status: ReviewStatus;
    category: ReviewCategory;
    severity: Severity;
    commentPreview: string;    // First 120 chars of comment.text
    locatorSummary: string;    // Best available locator as human-readable string
  }>;
  total: number;
}
```

### `get_review`

Get full review details including all structured data.

**Input:**
```typescript
{
  id: string;   // Review ID
}
```

**Output:** Full `Review` object (see schema above).

### `get_review_artifact`

Retrieve a binary artifact (screenshot, snapshot).

**Input:**
```typescript
{
  id: string;                              // Review ID
  type: "elementScreenshot" | "pageScreenshot" | "rrwebSession";
}
```

**Output:** Binary content (image/png or application/json) with appropriate MIME type.

### `mark_review_resolved`

Close a review as resolved.

**Input:**
```typescript
{
  id: string;             // Review ID
  comment?: string;       // What was done to resolve it
  resolvedBy?: string;    // Agent identifier
}
```

**Output:**
```typescript
{
  id: string;
  status: "resolved";
  resolution: Resolution;
}
```

### `update_review_status`

Change review status (e.g., open -> in_progress when agent starts working).

**Input:**
```typescript
{
  id: string;
  status: ReviewStatus;
  comment?: string;
}
```

**Output:** Updated `Review` object.

---

## REST API (Review Backend)

The local dev server exposes a REST API that the MCP server wraps.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/reviews` | List reviews (query params: status, category, severity, url, limit) |
| `GET` | `/api/reviews/:id` | Get review details |
| `GET` | `/api/reviews/:id/artifacts/:type` | Get artifact binary |
| `POST` | `/api/reviews` | Create review (from SDK) |
| `PATCH` | `/api/reviews/:id` | Update review (status, resolution) |
| `DELETE` | `/api/reviews/:id` | Delete review |
| `GET` | `/api/health` | Health check |

All JSON except artifact endpoints which return binary.

---

## Locator Strategy Priority

Agents should attempt locators in this order (most resilient first):

1. `testId`
2. `role`
3. `css`
4. `xpath`
5. `text`

1. **testId** -- `[data-testid="value"]` -- Explicit contract, survives refactors
2. **role** -- `getByRole('button', { name: 'Submit' })` -- Semantic, accessibility-aligned
3. **css** -- CSS selector path -- Reasonably stable but breaks on restructuring
4. **xpath** -- XPath expression -- Fragile but precise fallback
5. **text** -- Visible text content -- Last resort, breaks on copy changes

The SDK generates all available strategies at annotation time. The MCP server returns them ranked so agents can try in order and fall back gracefully.
