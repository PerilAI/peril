import { describe, expect, it } from "vitest";

import {
  renderDashboardDetailPage,
  renderDashboardListPage,
  renderDashboardNotFoundPage
} from "../src/dashboard";
import type {
  ListReviewsResponse,
  Review,
  ReviewListItem
} from "../src/models";

function createListItem(overrides: Partial<ReviewListItem> = {}): ReviewListItem {
  return {
    id: overrides.id ?? "rev_01ARZ3NDEKTSV4RRFFQ69G5FAV",
    url: overrides.url ?? "http://localhost:3000/pricing",
    timestamp: overrides.timestamp ?? "2026-03-10T05:00:00.000Z",
    status: overrides.status ?? "open",
    category: overrides.category ?? "ux",
    severity: overrides.severity ?? "medium",
    commentPreview: overrides.commentPreview ?? "Button wraps awkwardly at laptop widths.",
    locatorSummary: overrides.locatorSummary ?? "hero-cta"
  };
}

function createReview(overrides: Partial<Review> = {}): Review {
  return {
    id: overrides.id ?? "rev_01ARZ3NDEKTSV4RRFFQ69G5FAV",
    url: overrides.url ?? "http://localhost:3000/pricing",
    timestamp: overrides.timestamp ?? "2026-03-10T05:00:00.000Z",
    viewport: { width: 1440, height: 900, ...overrides.viewport },
    status: overrides.status ?? "open",
    selection: {
      boundingBox: {
        x: 218,
        y: 164,
        width: 412,
        height: 56,
        ...overrides.selection?.boundingBox
      },
      locators: {
        testId: "hero-cta",
        role: { type: "button", name: "Start free trial" },
        css: "[data-testid='hero-cta']",
        xpath: "//*[@data-testid='hero-cta']",
        text: "Start free trial",
        ...overrides.selection?.locators
      },
      domSnippet:
        overrides.selection?.domSnippet ??
        "<button data-testid='hero-cta'>Start free trial</button>",
      computedStyles: overrides.selection?.computedStyles
    },
    comment: {
      category: "ux",
      severity: "medium",
      text: "Button wraps awkwardly at laptop widths.",
      expected: "Single line, aligned with hero copy baseline.",
      ...overrides.comment
    },
    artifacts: {
      elementScreenshot: "artifact://rev_01ARZ3NDEKTSV4RRFFQ69G5FAV/element.png",
      pageScreenshot: "artifact://rev_01ARZ3NDEKTSV4RRFFQ69G5FAV/page.png",
      ...overrides.artifacts
    },
    resolution: overrides.resolution ?? null,
    metadata: {
      userAgent: "Mozilla/5.0",
      scrollPosition: { x: 0, y: 420 },
      devicePixelRatio: 2,
      reviewerName: "QA",
      ...overrides.metadata
    }
  };
}

describe("renderDashboardListPage", () => {
  it("renders the empty state when no reviews exist", () => {
    const response: ListReviewsResponse = { reviews: [], total: 0 };
    const html = renderDashboardListPage(response);

    expect(html).toContain("No reviews yet");
    expect(html).toContain("Submit a review from the SDK and it will appear here.");
    expect(html).toContain("empty-state");
  });

  it("renders stat counts correctly for mixed statuses", () => {
    const reviews: ReviewListItem[] = [
      createListItem({ id: "rev_A1", status: "open" }),
      createListItem({ id: "rev_A2", status: "open" }),
      createListItem({ id: "rev_A3", status: "in_progress" }),
      createListItem({ id: "rev_A4", status: "resolved" }),
      createListItem({ id: "rev_A5", status: "resolved" }),
      createListItem({ id: "rev_A6", status: "resolved" }),
      createListItem({ id: "rev_A7", status: "wont_fix" })
    ];
    const html = renderDashboardListPage({ reviews, total: 7 });

    // Stat cards: Visible reviews = 7, Open = 2, In progress = 1, Resolved = 3
    expect(html).toContain("<strong>7</strong>");
    expect(html).toContain("<strong>2</strong>");
    expect(html).toContain("<strong>1</strong>");
    expect(html).toContain("<strong>3</strong>");
    expect(html).toContain("Visible reviews");
    expect(html).toContain("Open");
    expect(html).toContain("In progress");
    expect(html).toContain("Resolved");
  });

  it("renders status badge CSS classes for each status", () => {
    const statuses = ["open", "in_progress", "resolved", "wont_fix"] as const;
    const reviews = statuses.map((status, i) =>
      createListItem({ id: `rev_B${i}`, status })
    );
    const html = renderDashboardListPage({ reviews, total: 4 });

    for (const status of statuses) {
      expect(html).toContain(`status-${status}`);
    }
  });

  it("renders severity badge CSS classes", () => {
    const reviews = [
      createListItem({ id: "rev_C1", severity: "critical" }),
      createListItem({ id: "rev_C2", severity: "high" }),
      createListItem({ id: "rev_C3", severity: "low" })
    ];
    const html = renderDashboardListPage({ reviews, total: 3 });

    expect(html).toContain("severity-critical");
    expect(html).toContain("severity-high");
    expect(html).toContain("severity-low");
  });

  it("renders review card links with correct hrefs", () => {
    const reviews = [createListItem({ id: "rev_D1" })];
    const html = renderDashboardListPage({ reviews, total: 1 });

    expect(html).toContain('href="/reviews/rev_D1"');
    expect(html).toContain("/api/reviews/rev_D1/artifacts/elementScreenshot");
  });

  it("renders the locator summary in review cards", () => {
    const reviews = [createListItem({ locatorSummary: "pricing-card" })];
    const html = renderDashboardListPage({ reviews, total: 1 });

    expect(html).toContain("pricing-card");
  });

  it("falls back to 'No locator summary' when locatorSummary is empty", () => {
    const reviews = [createListItem({ locatorSummary: "" })];
    const html = renderDashboardListPage({ reviews, total: 1 });

    expect(html).toContain("No locator summary");
  });

  it("renders 'Untitled review' for reviews without a comment preview", () => {
    const reviews = [createListItem({ commentPreview: "" })];
    const html = renderDashboardListPage({ reviews, total: 1 });

    expect(html).toContain("Untitled review");
  });

  it("escapes HTML in user content to prevent XSS", () => {
    const reviews = [
      createListItem({
        commentPreview: '<script>alert("xss")</script>',
        locatorSummary: "<b>bold</b>"
      })
    ];
    const html = renderDashboardListPage({ reviews, total: 1 });

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("renders the page title as 'Peril Review Dashboard'", () => {
    const html = renderDashboardListPage({ reviews: [], total: 0 });

    expect(html).toContain("<title>Peril Review Dashboard</title>");
  });

  it("renders the hero heading", () => {
    const html = renderDashboardListPage({ reviews: [], total: 0 });

    expect(html).toContain("Review queue for humans and agents.");
  });
});

describe("renderDashboardDetailPage", () => {
  it("renders the review comment as the main heading", () => {
    const review = createReview({
      comment: {
        category: "bug",
        severity: "high",
        text: "Hero CTA clips the edge of the card.",
        expected: "Keep CTA within card boundary."
      }
    });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("<h1>Hero CTA clips the edge of the card.</h1>");
  });

  it("renders status, severity, and category badges", () => {
    const review = createReview({
      status: "in_progress",
      comment: {
        category: "accessibility",
        severity: "critical",
        text: "Missing alt text.",
        expected: "Add descriptive alt text."
      }
    });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("status-in_progress");
    expect(html).toContain("severity-critical");
    expect(html).toContain("accessibility");
  });

  it("renders the review summary section with expected behavior, URL, and viewport", () => {
    const review = createReview({
      url: "http://localhost:3000/checkout",
      viewport: { width: 768, height: 1024 }
    });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("Review summary");
    expect(html).toContain("Single line, aligned with hero copy baseline.");
    expect(html).toContain("http://localhost:3000/checkout");
    expect(html).toContain("768 x 1024");
  });

  it("renders artifact image src attributes for both element and page screenshots", () => {
    const review = createReview({ id: "rev_ART1" });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("/api/reviews/rev_ART1/artifacts/elementScreenshot");
    expect(html).toContain("/api/reviews/rev_ART1/artifacts/pageScreenshot");
    expect(html).toContain("Element screenshot");
    expect(html).toContain("Page screenshot");
  });

  it("renders bounding box coordinates", () => {
    const review = createReview({
      selection: {
        boundingBox: { x: 100, y: 200, width: 300, height: 50 },
        locators: {
          css: ".cta",
          xpath: "//button[@class='cta']"
        },
        domSnippet: "<button class='cta'>Click</button>"
      }
    });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("100, 200, 300, 50");
  });

  it("renders all locator types when present", () => {
    const review = createReview();
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("testId");
    expect(html).toContain("hero-cta");
    expect(html).toContain("role");
    expect(html).toContain("button (Start free trial)");
    expect(html).toContain("css");
    expect(html).toContain("xpath");
    expect(html).toContain("text");
  });

  it("omits optional locators when not present", () => {
    const review: Review = {
      ...createReview(),
      selection: {
        boundingBox: { x: 0, y: 0, width: 100, height: 50 },
        locators: {
          css: ".plain-selector",
          xpath: "//div[@class='plain-selector']"
        },
        domSnippet: "<div class='plain-selector'>Hello</div>"
      }
    };
    const html = renderDashboardDetailPage(review);

    expect(html).toContain(".plain-selector");
    expect(html).not.toContain(">testId<");
    expect(html).not.toContain(">text<");
  });

  it("renders the DOM snippet in a pre tag", () => {
    const review = createReview({
      selection: {
        boundingBox: { x: 0, y: 0, width: 100, height: 50 },
        locators: { css: ".x", xpath: "//x" },
        domSnippet: "<div class=\"special\">Content</div>"
      }
    });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("DOM snippet");
    expect(html).toContain("&lt;div class=&quot;special&quot;&gt;Content&lt;/div&gt;");
  });

  it("renders reviewer name from metadata", () => {
    const review = createReview({
      metadata: {
        userAgent: "Mozilla/5.0",
        scrollPosition: { x: 0, y: 0 },
        devicePixelRatio: 1,
        reviewerName: "Jane Designer"
      }
    });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("Jane Designer");
  });

  it("renders 'Anonymous' when reviewerName is not set", () => {
    const review: Review = {
      ...createReview(),
      metadata: {
        userAgent: "Mozilla/5.0",
        scrollPosition: { x: 0, y: 0 },
        devicePixelRatio: 1
      }
    };
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("Anonymous");
  });

  it("renders resolution details when present", () => {
    const review = createReview({
      status: "resolved",
      resolution: {
        resolvedAt: "2026-03-10T06:00:00.000Z",
        resolvedBy: "agent_backend",
        comment: "Fixed the wrapping issue."
      }
    });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("Resolved at");
    expect(html).toContain("agent_backend");
    expect(html).toContain("Fixed the wrapping issue.");
  });

  it("renders 'No resolution recorded.' when resolution is null", () => {
    const review = createReview({ resolution: null });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("No resolution recorded.");
  });

  it("renders resolution with 'No comment' when resolution comment is undefined", () => {
    const review = createReview({
      status: "resolved",
      resolution: {
        resolvedAt: "2026-03-10T06:00:00.000Z",
        resolvedBy: "agent"
      }
    });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("No comment");
  });

  it("renders computed styles as JSON when present", () => {
    const review = createReview({
      selection: {
        boundingBox: { x: 0, y: 0, width: 100, height: 50 },
        locators: { css: ".x", xpath: "//x" },
        domSnippet: "<div>test</div>",
        computedStyles: { display: "flex", gap: "16px" }
      }
    });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("Computed styles");
    expect(html).toContain("&quot;display&quot;: &quot;flex&quot;");
    expect(html).toContain("&quot;gap&quot;: &quot;16px&quot;");
  });

  it("renders 'No computed styles captured.' when computedStyles is undefined", () => {
    const review = createReview();
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("No computed styles captured.");
  });

  it("renders 'No computed styles captured.' when computedStyles is empty", () => {
    const review = createReview({
      selection: {
        boundingBox: { x: 0, y: 0, width: 100, height: 50 },
        locators: { css: ".x", xpath: "//x" },
        domSnippet: "<div>test</div>",
        computedStyles: {}
      }
    });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("No computed styles captured.");
  });

  it("renders the back link to dashboard", () => {
    const review = createReview();
    const html = renderDashboardDetailPage(review);

    expect(html).toContain('href="/"');
    expect(html).toContain("Back to dashboard");
  });

  it("renders scroll position and device pixel ratio", () => {
    const review = createReview({
      metadata: {
        userAgent: "Mozilla/5.0",
        scrollPosition: { x: 100, y: 500 },
        devicePixelRatio: 3
      }
    });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("100, 500");
    expect(html).toContain("3");
  });

  it("escapes HTML in review content", () => {
    const review = createReview({
      comment: {
        category: "bug",
        severity: "high",
        text: '<script>steal()</script>',
        expected: "No XSS."
      }
    });
    const html = renderDashboardDetailPage(review);

    expect(html).not.toContain("<script>steal");
    expect(html).toContain("&lt;script&gt;steal()&lt;/script&gt;");
  });

  it("sets the page title to include the review ID", () => {
    const review = createReview({ id: "rev_TITLETEST" });
    const html = renderDashboardDetailPage(review);

    expect(html).toContain("<title>Peril Review rev_TITLETEST</title>");
  });
});

describe("renderDashboardNotFoundPage", () => {
  it("renders the 404 page with the review ID", () => {
    const html = renderDashboardNotFoundPage("rev_NOTFOUND123");

    expect(html).toContain("rev_NOTFOUND123");
    expect(html).toContain("This review does not exist in local storage.");
    expect(html).toContain("Missing review");
  });

  it("renders a back link to the dashboard", () => {
    const html = renderDashboardNotFoundPage("rev_BACK");

    expect(html).toContain('href="/"');
    expect(html).toContain("Back to dashboard");
  });

  it("sets the page title to 'Review not found'", () => {
    const html = renderDashboardNotFoundPage("rev_TITLE404");

    expect(html).toContain("<title>Review not found</title>");
  });

  it("escapes HTML in the review ID", () => {
    const html = renderDashboardNotFoundPage('<script>alert("xss")</script>');

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renders the empty-state panel", () => {
    const html = renderDashboardNotFoundPage("rev_EMPTY");

    expect(html).toContain("empty-state");
  });
});
