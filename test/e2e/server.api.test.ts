import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import type { Server } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const pngDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s6XwLQAAAAASUVORK5CYII=";

function buildReview(overrides: Record<string, unknown> = {}) {
  const id = (overrides.id as string) ?? "rev_01ARZ3NDEKTSV4RRFFQ69G5FAV";
  return {
    id,
    url: "http://localhost:3000/pricing",
    timestamp: "2026-03-10T05:00:00.000Z",
    viewport: { width: 1440, height: 900 },
    status: "open",
    selection: {
      boundingBox: { x: 218, y: 164, width: 412, height: 56 },
      locators: {
        testId: "hero-cta",
        role: { type: "button", name: "Start free trial" },
        css: "[data-testid='hero-cta']",
        xpath: "//*[@data-testid='hero-cta']",
        text: "Start free trial",
      },
      domSnippet: "<button data-testid='hero-cta'>Start free trial</button>",
    },
    comment: {
      category: "ux",
      severity: "medium",
      text: "Button wraps awkwardly at laptop widths.",
      expected: "Single line, aligned with hero copy baseline.",
    },
    artifacts: {
      elementScreenshot: pngDataUrl,
      pageScreenshot: pngDataUrl,
    },
    resolution: null,
    metadata: {
      userAgent: "Mozilla/5.0",
      scrollPosition: { x: 0, y: 420 },
      devicePixelRatio: 2,
      reviewerName: "QA",
    },
    ...overrides,
  };
}

let baseUrl: string;
let server: Server;
let dataDir: string;

test.beforeAll(async () => {
  // Dynamic import to load the built server module
  const { startServer } = await import("../../packages/server/src/index.ts");
  dataDir = resolve(
    await mkdtemp(resolve(tmpdir(), "peril-e2e-")),
    ".peril"
  );
  const result = await startServer({ dataDir, host: "127.0.0.1", port: 0 });
  server = result.server;
  baseUrl = result.url;
});

test.afterAll(async () => {
  await new Promise<void>((res, rej) =>
    server.close((err) => (err ? rej(err) : res()))
  );
  if (dataDir) {
    await rm(resolve(dataDir, ".."), { force: true, recursive: true });
  }
});

test.describe("Health endpoint", () => {
  test("GET /api/health returns ok", async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ status: "ok", service: "@peril-ai/server" });
    expect(body.timestamp).toBeTruthy();
  });
});

test.describe("Dashboard UI", () => {
  const reviewId = "rev_01ARZ3NDEKTSV4RRFFQ69G5FZZ";

  test.beforeAll(async ({ request }) => {
    await request.post(`${baseUrl}/api/reviews`, {
      data: buildReview({
        id: reviewId,
        comment: {
          category: "polish",
          severity: "medium",
          text: "Dashboard hero spacing is too tight around the summary block.",
          expected: "Add more breathing room between cards.",
        },
      }),
    });
  });

  test("GET / renders the review dashboard", async ({ request }) => {
    const response = await request.get(`${baseUrl}/`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("text/html; charset=utf-8");

    const html = await response.text();
    expect(html).toContain("Peril Dashboard");
    expect(html).toContain(reviewId);
    expect(html).toContain("Dashboard hero spacing is too tight around the summary block.");
    expect(html).toContain(`/reviews/${reviewId}`);
  });

  test("GET /reviews/:id renders the full review detail page", async ({ request }) => {
    const response = await request.get(`${baseUrl}/reviews/${reviewId}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("text/html; charset=utf-8");

    const html = await response.text();
    expect(html).toContain("Back to dashboard");
    expect(html).toContain("Review summary");
    expect(html).toContain("Artifacts");
    expect(html).toContain("Selection");
    expect(html).toContain("Dashboard hero spacing is too tight around the summary block.");
    expect(html).toContain("/api/reviews/rev_01ARZ3NDEKTSV4RRFFQ69G5FZZ/artifacts/pageScreenshot");
  });
});

test.describe("Review CRUD lifecycle", () => {
  const reviewId = "rev_01ARZ3NDEKTSV4RRFFQ69G5FA1";

  test("POST /api/reviews creates a review", async ({ request }) => {
    const review = buildReview({ id: reviewId });
    const response = await request.post(`${baseUrl}/api/reviews`, {
      data: review,
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBe(reviewId);
    expect(body.status).toBe("open");
    // Artifacts should be rewritten to artifact:// URIs
    expect(body.artifacts.elementScreenshot).toContain("artifact://");
    expect(body.artifacts.pageScreenshot).toContain("artifact://");
  });

  test("GET /api/reviews/:id retrieves the created review", async ({
    request,
  }) => {
    const response = await request.get(`${baseUrl}/api/reviews/${reviewId}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(reviewId);
    expect(body.selection.locators.testId).toBe("hero-cta");
  });

  test("GET /api/reviews lists reviews", async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/reviews`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.reviews.length).toBeGreaterThanOrEqual(1);
    expect(body.total).toBeGreaterThanOrEqual(1);
    const item = body.reviews.find(
      (r: { id: string }) => r.id === reviewId
    );
    expect(item).toBeTruthy();
    expect(item.locatorSummary).toBe("hero-cta");
  });

  test("PATCH /api/reviews/:id updates status", async ({ request }) => {
    const response = await request.patch(`${baseUrl}/api/reviews/${reviewId}`, {
      data: {
        status: "in_progress",
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("in_progress");
  });

  test("PATCH /api/reviews/:id resolves review", async ({ request }) => {
    const resolution = {
      resolvedAt: "2026-03-10T06:00:00.000Z",
      resolvedBy: "qa-agent",
      comment: "Fixed the wrapping issue.",
    };
    const response = await request.patch(`${baseUrl}/api/reviews/${reviewId}`, {
      data: { status: "resolved", resolution },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("resolved");
    expect(body.resolution).toEqual(resolution);
  });

  test("GET /api/reviews/:id/artifacts/elementScreenshot serves binary", async ({
    request,
  }) => {
    const response = await request.get(
      `${baseUrl}/api/reviews/${reviewId}/artifacts/elementScreenshot`
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    const buffer = await response.body();
    // PNG magic bytes
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
    expect(buffer[2]).toBe(0x4e);
    expect(buffer[3]).toBe(0x47);
  });

  test("DELETE /api/reviews/:id removes the review", async ({ request }) => {
    const response = await request.delete(
      `${baseUrl}/api/reviews/${reviewId}`
    );
    expect(response.status()).toBe(204);

    const getResponse = await request.get(
      `${baseUrl}/api/reviews/${reviewId}`
    );
    expect(getResponse.status()).toBe(404);
  });
});

test.describe("Review filtering", () => {
  test.beforeAll(async ({ request }) => {
    // Seed two reviews with different attributes
    await request.post(`${baseUrl}/api/reviews`, {
      data: buildReview({
        id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FB1",
        url: "http://localhost:3000/pricing",
        status: "open",
        comment: {
          category: "bug",
          severity: "high",
          text: "Pricing card overflow on mobile.",
          expected: "Cards stack vertically.",
        },
      }),
    });
    await request.post(`${baseUrl}/api/reviews`, {
      data: buildReview({
        id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FB2",
        url: "http://localhost:3000/settings",
        status: "resolved",
        comment: {
          category: "copy",
          severity: "low",
          text: "Typo in settings label.",
          expected: "Correct spelling.",
        },
        resolution: {
          resolvedAt: "2026-03-10T05:30:00.000Z",
          resolvedBy: "agent",
        },
      }),
    });
  });

  test("filters by status", async ({ request }) => {
    const response = await request.get(
      `${baseUrl}/api/reviews?status=open`
    );
    const body = await response.json();
    expect(body.reviews.every((r: { status: string }) => r.status === "open")).toBe(true);
  });

  test("filters by category", async ({ request }) => {
    const response = await request.get(
      `${baseUrl}/api/reviews?category=bug`
    );
    const body = await response.json();
    expect(body.reviews.every((r: { category: string }) => r.category === "bug")).toBe(true);
  });

  test("filters by severity (minimum threshold)", async ({ request }) => {
    const response = await request.get(
      `${baseUrl}/api/reviews?severity=high`
    );
    const body = await response.json();
    for (const review of body.reviews) {
      expect(["high", "critical"]).toContain(review.severity);
    }
  });

  test("filters by url prefix", async ({ request }) => {
    const response = await request.get(
      `${baseUrl}/api/reviews?url=http://localhost:3000/settings`
    );
    const body = await response.json();
    expect(body.reviews.every((r: { url: string }) =>
      r.url.startsWith("http://localhost:3000/settings")
    )).toBe(true);
  });

  test("respects limit parameter", async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/reviews?limit=1`);
    const body = await response.json();
    expect(body.reviews).toHaveLength(1);
    expect(body.total).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Error handling", () => {
  test("POST /api/reviews rejects invalid payload", async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/reviews`, {
      data: { id: "bad-id", url: "http://example.com" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("GET /api/reviews/:id returns 404 for missing review", async ({
    request,
  }) => {
    const response = await request.get(
      `${baseUrl}/api/reviews/rev_01NONEXISTENT0000000000000`
    );
    expect(response.status()).toBe(404);
  });

  test("PATCH /api/reviews/:id returns 404 for missing review", async ({
    request,
  }) => {
    const response = await request.patch(
      `${baseUrl}/api/reviews/rev_01NONEXISTENT0000000000000`,
      { data: { status: "resolved" } }
    );
    expect(response.status()).toBe(404);
  });

  test("DELETE /api/reviews/:id returns 404 for missing review", async ({
    request,
  }) => {
    const response = await request.delete(
      `${baseUrl}/api/reviews/rev_01NONEXISTENT0000000000000`
    );
    expect(response.status()).toBe(404);
  });

  test("POST /api/reviews rejects duplicate review IDs", async ({
    request,
  }) => {
    const review = buildReview({ id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FDU" });
    await request.post(`${baseUrl}/api/reviews`, { data: review });
    const response = await request.post(`${baseUrl}/api/reviews`, {
      data: review,
    });
    // Server maps "already exists" errors to 400 or 409
    expect([400, 409]).toContain(response.status());
    expect(response.ok()).toBe(false);
  });

  test("unknown routes return 404", async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/nonexistent`);
    expect(response.status()).toBe(404);
  });

  test("PATCH with empty body returns 400", async ({ request }) => {
    const review = buildReview({ id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FEM" });
    await request.post(`${baseUrl}/api/reviews`, { data: review });
    const response = await request.patch(
      `${baseUrl}/api/reviews/${review.id}`,
      { data: {} }
    );
    expect(response.status()).toBe(400);
  });
});

test.describe("Artifact serving", () => {
  const artifactReviewId = "rev_01ARZ3NDEKTSV4RRFFQ69G5FAR";

  test.beforeAll(async ({ request }) => {
    await request.post(`${baseUrl}/api/reviews`, {
      data: buildReview({ id: artifactReviewId }),
    });
  });

  test("serves element screenshot as PNG", async ({ request }) => {
    const response = await request.get(
      `${baseUrl}/api/reviews/${artifactReviewId}/artifacts/elementScreenshot`
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("serves page screenshot as PNG", async ({ request }) => {
    const response = await request.get(
      `${baseUrl}/api/reviews/${artifactReviewId}/artifacts/pageScreenshot`
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("returns 404 for unknown artifact type path", async ({ request }) => {
    const response = await request.get(
      `${baseUrl}/api/reviews/${artifactReviewId}/artifacts/unknownType`
    );
    expect(response.status()).toBe(404);
  });

  test("returns 404 for artifact on nonexistent review", async ({
    request,
  }) => {
    const response = await request.get(
      `${baseUrl}/api/reviews/rev_01NONEXISTENT0000000000000/artifacts/elementScreenshot`
    );
    expect(response.status()).toBe(404);
  });
});
