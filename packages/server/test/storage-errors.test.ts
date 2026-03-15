import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { startServer, type Review } from "../src/index";

const pngDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s6XwLQAAAAASUVORK5CYII=";

let activeServer:
  | {
      close: (callback: (error?: Error | null) => void) => void;
      url: string;
    }
  | undefined;
let dataDir: string | undefined;
let tmpRoot: string | undefined;

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
  tmpRoot = await mkdtemp(resolve(tmpdir(), "peril-storage-err-"));
  dataDir = resolve(tmpRoot, ".peril");
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

  if (tmpRoot) {
    await rm(tmpRoot, { force: true, recursive: true });
    tmpRoot = undefined;
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

describe("@peril-ai/server storage errors", () => {
  it("returns 400 when artifact references a non-existent source file", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FER1",
      artifacts: {
        elementScreenshot: "/tmp/does-not-exist-peril-test.png",
        pageScreenshot: pngDataUrl
      }
    });
    const response = await postReview(review);
    const body = (await response.json()) as { error: string; message: string };

    expect(response.status).toBe(400);
    expect(body.message).toContain("Artifact source not found");
  });

  it("returns 409 when creating a review that already exists", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FER2"
    });
    const firstResponse = await postReview(review);
    expect(firstResponse.status).toBe(201);

    const secondResponse = await postReview(review);
    const body = (await secondResponse.json()) as { error: string; message: string };

    expect(secondResponse.status).toBe(409);
    expect(body.message).toContain("already exists");
  });

  it("recovers when index.json is missing by recreating it on next read", async () => {
    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FER3"
    });
    await postReview(review);

    const indexPath = resolve(dataDir ?? "", "index.json");
    await rm(indexPath);

    const listResponse = await fetch(`${activeServer?.url}/api/reviews`);
    const listBody = (await listResponse.json()) as {
      reviews: Array<{ id: string }>;
      total: number;
    };

    expect(listResponse.status).toBe(200);
    expect(listBody.total).toBe(0);
    expect(listBody.reviews).toEqual([]);

    const indexExists = await readFile(indexPath, "utf8").then(
      () => true,
      () => false
    );
    expect(indexExists).toBe(true);
  });

  it("returns 500 when index.json contains corrupted data", async () => {
    const indexPath = resolve(dataDir ?? "", "index.json");
    await mkdir(resolve(dataDir ?? ""), { recursive: true });
    await writeFile(indexPath, "this is not valid json {{{");

    const listResponse = await fetch(`${activeServer?.url}/api/reviews`);

    expect(listResponse.status).toBe(500);
    const body = (await listResponse.json()) as { error: string };
    expect(body.error).toBe("internal_error");
  });

  it("handles creating a review after a corrupted index by re-initializing", async () => {
    const indexPath = resolve(dataDir ?? "", "index.json");
    await mkdir(resolve(dataDir ?? ""), { recursive: true });
    await writeFile(indexPath, "corrupted{{{");

    await writeFile(indexPath, "[]\n");

    const review = createReview({
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FER5"
    });
    const response = await postReview(review);

    expect(response.status).toBe(201);

    const index = JSON.parse(await readFile(indexPath, "utf8")) as Array<{ id: string }>;
    expect(index).toEqual([
      expect.objectContaining({ id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FER5" })
    ]);
  });
});
