import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { startServer, type Resolution, type Review } from "../src/index";

const pngDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s6XwLQAAAAASUVORK5CYII=";

let activeServer:
  | {
      close: (callback: (error?: Error | null) => void) => void;
      url: string;
    }
  | undefined;
let dataDir: string | undefined;

function createReview(overrides: Partial<Review> = {}): Review {
  const identifierSuffix = overrides.id?.slice("rev_".length) ?? "01ARZ3NDEKTSV4RRFFQ69G5FAV";

  return {
    id: overrides.id ?? `rev_${identifierSuffix}`,
    url: overrides.url ?? "http://localhost:3000/pricing",
    timestamp: overrides.timestamp ?? "2026-03-10T05:00:00.000Z",
    viewport: {
      width: 1440,
      height: 900,
      ...overrides.viewport
    },
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
        role: {
          type: "button",
          name: "Start free trial"
        },
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
      elementScreenshot: pngDataUrl,
      pageScreenshot: pngDataUrl,
      ...overrides.artifacts
    },
    resolution: overrides.resolution ?? null,
    metadata: {
      userAgent: "Mozilla/5.0",
      scrollPosition: {
        x: 0,
        y: 420
      },
      devicePixelRatio: 2,
      reviewerName: "QA",
      ...overrides.metadata
    }
  };
}

async function createServerFixture(): Promise<void> {
  dataDir = resolve(await mkdtemp(resolve(tmpdir(), "peril-server-")), ".peril");
  const { server, url } = await startServer({
    dataDir,
    host: "127.0.0.1",
    port: 0
  });

  activeServer = {
    close: server.close.bind(server),
    url
  };
}

async function closeServerFixture(): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    if (!activeServer) {
      resolvePromise();
      return;
    }

    activeServer.close((error) => {
      activeServer = undefined;

      if (error) {
        reject(error);
        return;
      }

      resolvePromise();
    });
  });

  if (dataDir) {
    await rm(resolve(dataDir, ".."), { force: true, recursive: true });
    dataDir = undefined;
  }
}

async function postReview(review: Review): Promise<Response> {
  return fetch(`${activeServer?.url}/api/reviews`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(review)
  });
}

beforeEach(async () => {
  await createServerFixture();
});

afterEach(async () => {
  await closeServerFixture();
});

describe("@peril/server", () => {
  it("serves the health endpoint", async () => {
    const response = await fetch(`${activeServer?.url}/api/health`);
    const body = (await response.json()) as { status: string; service: string };

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      service: "@peril/server"
    });
  });

  it("creates reviews, persists artifacts, and records the index entry", async () => {
    const review = createReview();
    const response = await postReview(review);
    const body = (await response.json()) as Review;

    expect(response.status).toBe(201);
    expect(body.artifacts).toEqual({
      elementScreenshot: `artifact://${review.id}/element.png`,
      pageScreenshot: `artifact://${review.id}/page.png`
    });

    const storedReview = JSON.parse(
      await readFile(resolve(dataDir ?? "", "reviews", review.id, "review.json"), "utf8")
    ) as Review;
    const storedIndex = JSON.parse(await readFile(resolve(dataDir ?? "", "index.json"), "utf8")) as Array<{
      id: string;
      commentPreview: string;
      locatorSummary: string;
    }>;

    expect(storedReview.artifacts).toEqual(body.artifacts);
    expect(storedIndex).toEqual([
      expect.objectContaining({
        id: review.id,
        commentPreview: "Button wraps awkwardly at laptop widths.",
        locatorSummary: "hero-cta"
      })
    ]);
  });

  it("lists reviews with documented filters", async () => {
    await postReview(
      createReview({
        id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAA",
        url: "http://localhost:3000/pricing",
        comment: {
          category: "bug",
          severity: "high",
          text: "Critical spacing regression in the pricing hero that should be filtered in.",
          expected: "Restore previous spacing."
        }
      })
    );
    await postReview(
      createReview({
        id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAB",
        url: "http://localhost:3000/settings",
        status: "resolved",
        comment: {
          category: "copy",
          severity: "low",
          text: "Minor copy issue outside the filter.",
          expected: "Update the label."
        },
        resolution: {
          resolvedAt: "2026-03-10T05:05:00.000Z",
          resolvedBy: "agent"
        }
      })
    );

    const response = await fetch(
      `${activeServer?.url}/api/reviews?status=open&category=bug&severity=medium&url=http://localhost:3000/pricing&limit=1`
    );
    const body = (await response.json()) as {
      reviews: Array<{ id: string }>;
      total: number;
    };

    expect(response.status).toBe(200);
    expect(body.total).toBe(1);
    expect(body.reviews).toHaveLength(1);
    expect(body.reviews[0]?.id).toBe("rev_01ARZ3NDEKTSV4RRFFQ69G5FAA");
  });

  it("renders the dashboard list page with review cards", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAF",
      comment: {
        category: "bug",
        severity: "high",
        text: "Primary CTA overlaps the price card on tablet.",
        expected: "Keep the CTA outside the card boundary."
      }
    });
    await postReview(review);

    const response = await fetch(`${activeServer?.url}/`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(html).toContain("Peril Dashboard");
    expect(html).toContain(review.id);
    expect(html).toContain("Primary CTA overlaps the price card on tablet.");
    expect(html).toContain(`/reviews/${review.id}`);
    expect(html).toContain(`/api/reviews/${review.id}/artifacts/elementScreenshot`);
  });

  it("renders the dashboard detail page with full review context", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAG",
      selection: {
        boundingBox: {
          x: 48,
          y: 96,
          width: 320,
          height: 120
        },
        locators: {
          testId: "pricing-card",
          role: {
            type: "region",
            name: "Pricing card"
          },
          css: "[data-testid='pricing-card']",
          xpath: "//*[@data-testid='pricing-card']",
          text: "Growth plan"
        },
        domSnippet: "<section data-testid='pricing-card'>Growth plan</section>",
        computedStyles: {
          display: "grid",
          gap: "24px"
        }
      }
    });
    await postReview(review);

    const response = await fetch(`${activeServer?.url}/reviews/${review.id}`);
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(html).toContain(review.comment.text);
    expect(html).toContain(review.comment.expected);
    expect(html).toContain("pricing-card");
    expect(html).toContain("Growth plan");
    expect(html).toContain("Computed styles");
    expect(html).toContain("/api/reviews/rev_01ARZ3NDEKTSV4RRFFQ69G5FAG/artifacts/pageScreenshot");
  });

  it("updates reviews and serves stored artifacts", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAC"
    });
    await postReview(review);

    const resolution: Resolution = {
      resolvedAt: "2026-03-10T05:06:00.000Z",
      resolvedBy: "agent_backend",
      comment: "Fixed the wrapping issue."
    };
    const patchResponse = await fetch(`${activeServer?.url}/api/reviews/${review.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        status: "resolved",
        resolution
      })
    });
    const patchedReview = (await patchResponse.json()) as Review;
    const artifactResponse = await fetch(
      `${activeServer?.url}/api/reviews/${review.id}/artifacts/elementScreenshot`
    );

    expect(patchResponse.status).toBe(200);
    expect(patchedReview.status).toBe("resolved");
    expect(patchedReview.resolution).toEqual(resolution);
    expect(artifactResponse.status).toBe(200);
    expect(artifactResponse.headers.get("content-type")).toBe("image/png");
    expect(Buffer.from(await artifactResponse.arrayBuffer())).toEqual(
      Buffer.from(
        "89504e470d0a1a0a0000000d4948445200000001000000010804000000b51c0c020000000b4944415478da63fcff1f0002eb01f6ce97c0b40000000049454e44ae426082",
        "hex"
      )
    );
  });

  it("clears resolution metadata when a review leaves the resolved state", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAE",
      status: "resolved",
      resolution: {
        resolvedAt: "2026-03-10T05:07:00.000Z",
        resolvedBy: "agent_backend",
        comment: "Already fixed."
      }
    });
    await postReview(review);

    const patchResponse = await fetch(`${activeServer?.url}/api/reviews/${review.id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        status: "open"
      })
    });
    const patchedReview = (await patchResponse.json()) as Review;

    expect(patchResponse.status).toBe(200);
    expect(patchedReview.status).toBe("open");
    expect(patchedReview.resolution).toBeNull();
  });

  it("deletes reviews and removes them from storage", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAD"
    });
    await postReview(review);

    const deleteResponse = await fetch(`${activeServer?.url}/api/reviews/${review.id}`, {
      method: "DELETE"
    });
    const getResponse = await fetch(`${activeServer?.url}/api/reviews/${review.id}`);
    const indexEntries = JSON.parse(await readFile(resolve(dataDir ?? "", "index.json"), "utf8")) as Array<{
      id: string;
    }>;

    expect(deleteResponse.status).toBe(204);
    expect(getResponse.status).toBe(404);
    expect(indexEntries).toEqual([]);
  });

  it("truncates oversized DOM snippets and locator text on review creation", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAH",
      selection: {
        boundingBox: { x: 0, y: 0, width: 100, height: 50 },
        domSnippet: "x".repeat(4096),
        locators: {
          css: ".test",
          xpath: "//test",
          text: "A".repeat(400)
        }
      }
    });
    const response = await postReview(review);
    const body = (await response.json()) as Review;

    expect(response.status).toBe(201);
    expect(body.selection.domSnippet).toHaveLength(2048);
    expect(body.selection.locators.text).toHaveLength(200);
  });

  it("returns 400 for invalid JSON request bodies", async () => {
    const response = await fetch(`${activeServer?.url}/api/reviews`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{ invalid json }"
    });
    const body = (await response.json()) as { error: string; message: string };

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_json");
    expect(body.message).toContain("valid JSON");
  });

  it("returns 413 for oversized screenshot payloads", async () => {
    const oversizedBase64 = "A".repeat(Math.ceil((5 * 1024 * 1024 + 1) * 4 / 3));
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAJ",
      artifacts: {
        elementScreenshot: `data:image/png;base64,${oversizedBase64}`,
        pageScreenshot: pngDataUrl
      }
    });
    const response = await postReview(review);
    const body = (await response.json()) as { error: string; message: string };

    expect(response.status).toBe(413);
    expect(body.error).toBe("payload_too_large");
  });

  it("returns structured error responses for storage permission errors", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAK",
      artifacts: {
        elementScreenshot: "/nonexistent/path/element.png",
        pageScreenshot: pngDataUrl
      }
    });
    const response = await postReview(review);
    const body = (await response.json()) as { error: string; message: string };

    expect(response.status).toBe(400);
    expect(body.error).toBe("bad_request");
    expect(body.message).toContain("Artifact source not found");
  });
});
