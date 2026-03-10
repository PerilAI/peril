import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createReview, submitReview, type Review } from "../packages/core/src/index";
import { PerilMcpServer, type Review as McpReview } from "../packages/mcp/src/index";
import { startServer } from "../packages/server/src/index";

/**
 * Full-flow integration test (PER-66).
 *
 * Exercises the complete lifecycle:
 *   @peril/core createReview() -> submitReview() transport
 *   -> @peril/server receives and stores
 *   -> @peril/mcp retrieves via list_reviews, get_review, get_review_artifact
 *   -> @peril/mcp mark_review_resolved, update_review_status
 */

const pngDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s6XwLQAAAAASUVORK5CYII=";

let activeServer:
  | {
      close: (callback: (error?: Error | null) => void) => void;
      url: string;
    }
  | undefined;
let dataDir: string | undefined;

async function createServerFixture(): Promise<void> {
  dataDir = resolve(await mkdtemp(resolve(tmpdir(), "peril-integration-")), ".peril");
  const { server, url } = await startServer({
    dataDir,
    host: "127.0.0.1",
    port: 0,
  });

  activeServer = {
    close: server.close.bind(server),
    url,
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

function buildReviewInput() {
  return {
    url: "http://localhost:3000/pricing",
    viewport: { width: 1440, height: 900 },
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
      category: "ux" as const,
      severity: "medium" as const,
      text: "Button wraps awkwardly at laptop widths.",
      expected: "Single line, aligned with hero copy baseline.",
    },
    artifacts: {
      elementScreenshot: pngDataUrl,
      pageScreenshot: pngDataUrl,
    },
    metadata: {
      userAgent: "Mozilla/5.0",
      scrollPosition: { x: 0, y: 420 },
      devicePixelRatio: 2,
      reviewerName: "QA",
    },
  };
}

beforeEach(async () => {
  await createServerFixture();
});

afterEach(async () => {
  await closeServerFixture();
});

describe("full-flow integration: core -> server -> mcp", () => {
  it("creates a review via core SDK and submits it to the server via transport", async () => {
    const input = buildReviewInput();
    const review = createReview(input);

    expect(review.id).toMatch(/^rev_/);
    expect(review.status).toBe("open");
    expect(review.comment.text).toBe(input.comment.text);

    const submitted = await submitReview(input, {
      endpoint: `${activeServer!.url}/api/reviews`,
      maxRetries: 0,
    });

    expect(submitted.id).toMatch(/^rev_/);
    expect(submitted.status).toBe("open");
    // Server converts data URLs to artifact:// URIs
    expect(submitted.artifacts.elementScreenshot).toMatch(/^artifact:\/\//);
    expect(submitted.artifacts.pageScreenshot).toMatch(/^artifact:\/\//);
  });

  it("retrieves the submitted review via MCP list_reviews and get_review", async () => {
    const input = buildReviewInput();
    const submitted = await submitReview(input, {
      endpoint: `${activeServer!.url}/api/reviews`,
      maxRetries: 0,
    });

    const mcp = new PerilMcpServer({ serverUrl: activeServer!.url });

    // list_reviews should find the open review
    const listResult = (await mcp.callTool("list_reviews", { status: "open" })) as {
      reviews: Array<{ id: string; commentPreview: string; locatorSummary: string }>;
      total: number;
    };

    expect(listResult.total).toBe(1);
    expect(listResult.reviews[0]!.id).toBe(submitted.id);
    expect(listResult.reviews[0]!.commentPreview).toBe("Button wraps awkwardly at laptop widths.");
    expect(listResult.reviews[0]!.locatorSummary).toBe("hero-cta");

    // get_review should return the full review
    const fullReview = (await mcp.callTool("get_review", { id: submitted.id })) as McpReview;

    expect(fullReview.id).toBe(submitted.id);
    expect(fullReview.url).toBe("http://localhost:3000/pricing");
    expect(fullReview.status).toBe("open");
    expect(fullReview.selection.locators.testId).toBe("hero-cta");
    expect(fullReview.selection.locators.role).toEqual({ type: "button", name: "Start free trial" });
    expect(fullReview.comment.category).toBe("ux");
    expect(fullReview.comment.severity).toBe("medium");
    expect(fullReview.artifacts.elementScreenshot).toMatch(/^artifact:\/\//);
    expect(fullReview.resolution).toBeNull();
  });

  it("round-trips artifact data: data URL -> server storage -> MCP base64 retrieval", async () => {
    const input = buildReviewInput();
    const submitted = await submitReview(input, {
      endpoint: `${activeServer!.url}/api/reviews`,
      maxRetries: 0,
    });

    const mcp = new PerilMcpServer({ serverUrl: activeServer!.url });

    const artifact = (await mcp.callTool("get_review_artifact", {
      id: submitted.id,
      type: "elementScreenshot",
    })) as {
      id: string;
      type: string;
      contentType: string;
      base64: string;
    };

    expect(artifact.id).toBe(submitted.id);
    expect(artifact.type).toBe("elementScreenshot");
    expect(artifact.contentType).toBe("image/png");

    // Verify the artifact content matches the original PNG data
    const originalBase64 = pngDataUrl.split(",")[1]!;
    expect(artifact.base64).toBe(originalBase64);

    // Verify it's a valid PNG (magic bytes: 0x89 0x50 0x4E 0x47)
    const pngBytes = Buffer.from(artifact.base64, "base64");
    expect(pngBytes[0]).toBe(0x89);
    expect(pngBytes[1]).toBe(0x50); // P
    expect(pngBytes[2]).toBe(0x4e); // N
    expect(pngBytes[3]).toBe(0x47); // G
  });

  it("resolves a review via MCP mark_review_resolved and verifies status", async () => {
    const input = buildReviewInput();
    const submitted = await submitReview(input, {
      endpoint: `${activeServer!.url}/api/reviews`,
      maxRetries: 0,
    });

    const mcp = new PerilMcpServer({
      serverUrl: activeServer!.url,
      resolvedBy: "qa-engineer",
    });

    const resolved = (await mcp.callTool("mark_review_resolved", {
      id: submitted.id,
      comment: "Fixed the wrapping issue by adjusting flex layout.",
    })) as {
      id: string;
      status: string;
      resolution: {
        resolvedAt: string;
        resolvedBy: string;
        comment?: string;
      };
    };

    expect(resolved.id).toBe(submitted.id);
    expect(resolved.status).toBe("resolved");
    expect(resolved.resolution.resolvedBy).toBe("qa-engineer");
    expect(resolved.resolution.comment).toBe("Fixed the wrapping issue by adjusting flex layout.");
    expect(resolved.resolution.resolvedAt).toBeTruthy();

    // Verify the status persisted by retrieving the review again
    const retrieved = (await mcp.callTool("get_review", { id: submitted.id })) as McpReview;
    expect(retrieved.status).toBe("resolved");
    expect(retrieved.resolution).not.toBeNull();
    expect(retrieved.resolution!.resolvedBy).toBe("qa-engineer");
  });

  it("cycles through full lifecycle: open -> in_progress -> resolved -> reopened", async () => {
    const input = buildReviewInput();
    const submitted = await submitReview(input, {
      endpoint: `${activeServer!.url}/api/reviews`,
      maxRetries: 0,
    });

    const mcp = new PerilMcpServer({
      serverUrl: activeServer!.url,
      resolvedBy: "integration-test",
    });

    // open -> in_progress
    const inProgress = (await mcp.callTool("update_review_status", {
      id: submitted.id,
      status: "in_progress",
      comment: "Agent picked up this review.",
    })) as McpReview & { statusComment?: string };

    expect(inProgress.status).toBe("in_progress");
    expect(inProgress.statusComment).toBe("Agent picked up this review.");
    expect(inProgress.resolution).toBeNull();

    // in_progress -> resolved
    const resolved = (await mcp.callTool("mark_review_resolved", {
      id: submitted.id,
      comment: "CSS flex fix applied.",
    })) as {
      id: string;
      status: string;
      resolution: { resolvedBy: string; comment?: string };
    };

    expect(resolved.status).toBe("resolved");
    expect(resolved.resolution.resolvedBy).toBe("integration-test");

    // resolved -> open (reopen)
    const reopened = (await mcp.callTool("update_review_status", {
      id: submitted.id,
      status: "open",
      comment: "Fix didn't hold; reopening.",
    })) as McpReview & { statusComment?: string };

    expect(reopened.status).toBe("open");
    expect(reopened.resolution).toBeNull();
    expect(reopened.statusComment).toBe("Fix didn't hold; reopening.");

    // Verify the final state via list_reviews
    const openList = (await mcp.callTool("list_reviews", { status: "open" })) as {
      reviews: Array<{ id: string }>;
      total: number;
    };
    expect(openList.total).toBe(1);
    expect(openList.reviews[0]!.id).toBe(submitted.id);
  });

  it("filters reviews correctly across MCP list_reviews parameters", async () => {
    // Submit two reviews with different properties
    const input1 = buildReviewInput();
    input1.comment = {
      category: "bug",
      severity: "high",
      text: "Critical layout regression on pricing page.",
      expected: "Restore previous layout.",
    };
    const submitted1 = await submitReview(input1, {
      endpoint: `${activeServer!.url}/api/reviews`,
      maxRetries: 0,
    });

    const input2 = buildReviewInput();
    input2.url = "http://localhost:3000/settings";
    input2.comment = {
      category: "copy",
      severity: "low",
      text: "Minor copy typo in settings.",
      expected: "Fix typo.",
    };
    await submitReview(input2, {
      endpoint: `${activeServer!.url}/api/reviews`,
      maxRetries: 0,
    });

    const mcp = new PerilMcpServer({ serverUrl: activeServer!.url });

    // Filter by category
    const bugOnly = (await mcp.callTool("list_reviews", { category: "bug" })) as {
      reviews: Array<{ id: string }>;
      total: number;
    };
    expect(bugOnly.total).toBe(1);
    expect(bugOnly.reviews[0]!.id).toBe(submitted1.id);

    // Filter by severity (minimum)
    const highSeverity = (await mcp.callTool("list_reviews", { severity: "high" })) as {
      reviews: Array<{ id: string }>;
      total: number;
    };
    expect(highSeverity.total).toBe(1);

    // Filter by URL prefix
    const pricingOnly = (await mcp.callTool("list_reviews", {
      url: "http://localhost:3000/pricing",
    })) as {
      reviews: Array<{ id: string }>;
      total: number;
    };
    expect(pricingOnly.total).toBe(1);

    // Filter by limit
    const limited = (await mcp.callTool("list_reviews", { limit: 1 })) as {
      reviews: Array<{ id: string }>;
      total: number;
    };
    expect(limited.reviews).toHaveLength(1);
  });
});
