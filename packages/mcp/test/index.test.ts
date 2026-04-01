import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import packageJson from "../package.json" with { type: "json" };

import { submitReview, type SubmitReviewInput } from "../../core/src/index";
import { startServer, type Review } from "../../server/src/index";
import {
  PerilMcpServer,
  createManifest,
  listToolNames,
  toolDefinitions
} from "../src/index";

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

function createSubmitReviewInput(overrides: Partial<SubmitReviewInput> = {}): SubmitReviewInput {
  return {
    id: overrides.id ?? "rev_01ARZ3NDEKTSV4RRFFQ69G5FBA",
    url: overrides.url ?? "http://localhost:3000/pricing",
    timestamp: overrides.timestamp ?? "2026-03-10T06:30:00.000Z",
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
  dataDir = resolve(await mkdtemp(resolve(tmpdir(), "peril-mcp-")), ".peril");
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

describe("@peril-ai/mcp", () => {
  it("exports the V1 review tool surface", () => {
    expect(listToolNames()).toEqual([
      "list_reviews",
      "get_review",
      "get_review_artifact",
      "mark_review_resolved",
      "update_review_status"
    ]);
  });

  it("builds a manifest with the expected server name", () => {
    expect(createManifest().serverName).toBe("@peril-ai/mcp");
  });

  it("includes a version string in the manifest", () => {
    const manifest = createManifest();
    expect(manifest.version).toBe(packageJson.version);
  });

  it("includes all tool definitions in the manifest", () => {
    const manifest = createManifest();
    expect(manifest.tools).toHaveLength(toolDefinitions.length);
    expect(manifest.tools.map((t) => t.name)).toEqual(listToolNames());
    expect(manifest.tools.every((tool) => tool.inputSchema.type === "object")).toBe(true);
  });

  it("returns a defensive copy of tools in the manifest", () => {
    const manifest1 = createManifest();
    const manifest2 = createManifest();
    expect(manifest1.tools).not.toBe(manifest2.tools);
    expect(manifest1.tools).toEqual(manifest2.tools);
  });

  it("ensures every tool has a non-empty name, description, and input schema", () => {
    for (const tool of toolDefinitions) {
      expect(tool.name.length).toBeGreaterThan(0);
      expect(tool.description.length).toBeGreaterThan(0);
      expect(tool.inputSchema.type).toBe("object");
    }
  });

  it("has exactly 5 tools matching the MCP spec", () => {
    expect(toolDefinitions).toHaveLength(5);
  });

  it("lists and retrieves reviews through the wrapped REST API", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAA"
    });
    await postReview(review);
    const server = new PerilMcpServer({ serverUrl: activeServer?.url });

    const reviews = (await server.callTool("list_reviews", {
      status: "open"
    })) as {
      reviews: Array<{ id: string }>;
      total: number;
    };
    const fullReview = (await server.callTool("get_review", {
      id: review.id
    })) as Review;

    expect(reviews.total).toBe(1);
    expect(reviews.reviews[0]?.id).toBe(review.id);
    expect(fullReview.id).toBe(review.id);
    expect(fullReview.selection.locators.testId).toBe("hero-cta");
  });

  it("runs the documented review workflow from SDK submission through MCP resolution", async () => {
    const input = createSubmitReviewInput({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FBB",
      comment: {
        category: "bug",
        severity: "high",
        text: "Primary CTA wraps awkwardly at laptop widths.",
        expected: "Keep the CTA on a single line."
      }
    });
    const submittedReview = await submitReview(input, {
      endpoint: `${activeServer?.url}/api/reviews`,
      retryDelayMs: 0
    });
    const server = new PerilMcpServer({
      serverUrl: activeServer?.url,
      resolvedBy: "backend-mcp-engineer"
    });

    const listedReviews = (await server.callTool("list_reviews", {
      status: ["open", "in_progress"]
    })) as {
      reviews: Array<{ id: string; status: string; commentPreview: string }>;
      total: number;
    };
    const fetchedReview = (await server.callTool("get_review", {
      id: submittedReview.id
    })) as Review;
    const artifact = (await server.callTool("get_review_artifact", {
      id: submittedReview.id,
      type: "elementScreenshot"
    })) as {
      contentType: string;
      base64: string;
      id: string;
      type: string;
    };
    const inProgressReview = (await server.callTool("update_review_status", {
      id: submittedReview.id,
      status: "in_progress",
      comment: "Investigating the layout regression."
    })) as Review & { statusComment?: string };
    const resolvedReview = (await server.callTool("mark_review_resolved", {
      id: submittedReview.id,
      comment: "Adjusted the CTA width and typography."
    })) as {
      id: string;
      status: string;
      resolution: {
        resolvedBy: string;
        comment?: string;
      };
    };
    const resolvedList = (await server.callTool("list_reviews", {
      status: "resolved"
    })) as {
      reviews: Array<{ id: string; status: string }>;
      total: number;
    };
    const openList = (await server.callTool("list_reviews", {
      status: ["open", "in_progress"]
    })) as {
      reviews: Array<{ id: string }>;
      total: number;
    };

    expect(submittedReview.artifacts).toEqual({
      elementScreenshot: `artifact://${input.id}/element.png`,
      pageScreenshot: `artifact://${input.id}/page.png`
    });
    expect(listedReviews.total).toBe(1);
    expect(listedReviews.reviews[0]).toMatchObject({
      id: submittedReview.id,
      status: "open",
      commentPreview: input.comment.text
    });
    expect(fetchedReview).toEqual(submittedReview);
    expect(artifact).toMatchObject({
      id: submittedReview.id,
      type: "elementScreenshot",
      contentType: "image/png"
    });
    expect(Buffer.from(artifact.base64, "base64")[0]).toBe(0x89);
    expect(inProgressReview.status).toBe("in_progress");
    expect(inProgressReview.resolution).toBeNull();
    expect(inProgressReview.statusComment).toBe("Investigating the layout regression.");
    expect(resolvedReview).toMatchObject({
      id: submittedReview.id,
      status: "resolved",
      resolution: {
        resolvedBy: "backend-mcp-engineer",
        comment: "Adjusted the CTA width and typography."
      }
    });
    expect(resolvedList.total).toBe(1);
    expect(resolvedList.reviews[0]).toMatchObject({
      id: submittedReview.id,
      status: "resolved"
    });
    expect(openList).toEqual({
      reviews: [],
      total: 0
    });
  });

  it("returns artifact payloads as base64-encoded structured content", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAB"
    });
    await postReview(review);
    const server = new PerilMcpServer({ serverUrl: activeServer?.url });

    const artifact = (await server.callTool("get_review_artifact", {
      id: review.id,
      type: "elementScreenshot"
    })) as {
      contentType: string;
      base64: string;
    };

    expect(artifact.contentType).toBe("image/png");
    expect(Buffer.from(artifact.base64, "base64")[0]).toBe(0x89);
  });

  it("resolves and reopens reviews through MCP tool calls", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAC"
    });
    await postReview(review);
    const server = new PerilMcpServer({
      serverUrl: activeServer?.url,
      resolvedBy: "backend-mcp-engineer"
    });

    const resolvedReview = (await server.callTool("mark_review_resolved", {
      id: review.id,
      comment: "Fixed via MCP."
    })) as {
      status: string;
      resolution: {
        resolvedBy: string;
        comment?: string;
      };
    };
    const reopenedReview = (await server.callTool("update_review_status", {
      id: review.id,
      status: "open",
      comment: "Reopened for verification."
    })) as Review & { statusComment?: string };

    expect(resolvedReview.status).toBe("resolved");
    expect(resolvedReview.resolution.resolvedBy).toBe("backend-mcp-engineer");
    expect(resolvedReview.resolution.comment).toBe("Fixed via MCP.");
    expect(reopenedReview.status).toBe("open");
    expect(reopenedReview.resolution).toBeNull();
    expect(reopenedReview.statusComment).toBe("Reopened for verification.");
  });

  it("handles JSON-RPC initialize, tools/list, and tool failures", async () => {
    const server = new PerilMcpServer({ serverUrl: activeServer?.url });

    const initializeResponse = await server.handleJsonRpc({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {}
    });
    const listResponse = await server.handleJsonRpc({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list"
    });
    const errorResponse = await server.handleJsonRpc({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_review",
        arguments: {
          id: "rev_missing"
        }
      }
    });

    expect(initializeResponse).toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: {
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "@peril-ai/mcp",
          version: packageJson.version
        }
      }
    });
    expect(listResponse).toMatchObject({
      jsonrpc: "2.0",
      id: 2,
      result: {
        tools: toolDefinitions
      }
    });
    expect(errorResponse).toMatchObject({
      jsonrpc: "2.0",
      id: 3,
      result: {
        isError: true
      }
    });
  });
});
