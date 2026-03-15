import { describe, expect, it, vi } from "vitest";

import { submitReview, type SubmitReviewInput } from "../src/index";

function createSubmitReviewInput(): SubmitReviewInput {
  return {
    artifacts: {
      elementScreenshot: "data:image/png;base64,ZWxlbWVudA==",
      pageScreenshot: "data:image/png;base64,cGFnZQ=="
    },
    comment: {
      category: "ux",
      expected: "Keep the CTA on one line.",
      severity: "medium",
      text: "Button wraps awkwardly at laptop widths."
    },
    id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FE0",
    metadata: {
      devicePixelRatio: 2,
      reviewerName: "QA",
      scrollPosition: {
        x: 12,
        y: 48
      },
      userAgent: "Vitest"
    },
    selection: {
      boundingBox: {
        height: 56,
        width: 412,
        x: 218,
        y: 164
      },
      computedStyles: {
        color: "rgb(255, 255, 255)"
      },
      domSnippet: "<button data-testid='hero-cta'>Start free trial</button>",
      locators: {
        testId: "hero-cta",
        role: {
          name: "Start free trial",
          type: "button"
        },
        css: "[data-testid='hero-cta']",
        xpath: "//*[@data-testid='hero-cta']",
        text: "Start free trial"
      }
    },
    status: "open",
    timestamp: "2026-03-10T06:30:00.000Z",
    url: "http://localhost:3000/pricing",
    viewport: {
      height: 900,
      width: 1440
    }
  };
}

function createJsonResponse(body: unknown, status = 201): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json"
    },
    status
  });
}

describe("@peril-ai/core transport error handling", () => {
  it("throws after exhausting all retry attempts on transient 503 errors", async () => {
    const input = createSubmitReviewInput();
    const fetchMock = vi.fn<typeof fetch>(async () =>
      createJsonResponse(
        {
          error: "unavailable",
          message: "Service temporarily unavailable."
        },
        503
      )
    );

    await expect(
      submitReview(input, {
        fetch: fetchMock,
        maxRetries: 2,
        retryDelayMs: 0
      })
    ).rejects.toThrow("Service temporarily unavailable.");

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("throws after exhausting all retry attempts on network errors (TypeError)", async () => {
    const input = createSubmitReviewInput();
    const fetchMock = vi.fn<typeof fetch>(async () => {
      throw new TypeError("Failed to fetch");
    });

    await expect(
      submitReview(input, {
        fetch: fetchMock,
        maxRetries: 2,
        retryDelayMs: 0
      })
    ).rejects.toThrow("Could not reach the Peril server");

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("retries across mixed transient status codes before failing", async () => {
    const input = createSubmitReviewInput();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        createJsonResponse({ message: "Rate limited." }, 429)
      )
      .mockResolvedValueOnce(
        createJsonResponse({ message: "Bad gateway." }, 502)
      )
      .mockResolvedValueOnce(
        createJsonResponse({ message: "Timeout." }, 504)
      );

    await expect(
      submitReview(input, {
        fetch: fetchMock,
        maxRetries: 2,
        retryDelayMs: 0
      })
    ).rejects.toThrow("Timeout.");

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not retry on 408 (transient) beyond max retries", async () => {
    const input = createSubmitReviewInput();
    const fetchMock = vi.fn<typeof fetch>(async () =>
      createJsonResponse({ message: "Request timeout." }, 408)
    );

    await expect(
      submitReview(input, {
        fetch: fetchMock,
        maxRetries: 1,
        retryDelayMs: 0
      })
    ).rejects.toThrow("Request timeout.");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws immediately when no fetch implementation is available", async () => {
    const input = createSubmitReviewInput();

    await expect(
      submitReview(input, {
        fetch: "not-a-function" as unknown as typeof fetch
      })
    ).rejects.toThrow("submitReview requires a fetch implementation.");
  });

  it("extracts error message from response JSON error field", async () => {
    const input = createSubmitReviewInput();
    const fetchMock = vi.fn<typeof fetch>(async () =>
      createJsonResponse(
        { error: "invalid_review" },
        400
      )
    );

    await expect(
      submitReview(input, {
        fetch: fetchMock,
        retryDelayMs: 0
      })
    ).rejects.toThrow("invalid_review");
  });

  it("falls back to status text when response body is empty", async () => {
    const input = createSubmitReviewInput();
    const fetchMock = vi.fn<typeof fetch>(async () =>
      new Response("", { status: 500 })
    );

    await expect(
      submitReview(input, {
        fetch: fetchMock,
        maxRetries: 0,
        retryDelayMs: 0
      })
    ).rejects.toThrow("Review submission failed with status 500.");
  });

  it("falls back to raw response text when body is not valid JSON", async () => {
    const input = createSubmitReviewInput();
    const fetchMock = vi.fn<typeof fetch>(async () =>
      new Response("Gateway Timeout", { status: 504 })
    );

    await expect(
      submitReview(input, {
        fetch: fetchMock,
        maxRetries: 0,
        retryDelayMs: 0
      })
    ).rejects.toThrow("Gateway Timeout");
  });

  it("aborts during retry delay when signal is triggered", async () => {
    const input = createSubmitReviewInput();
    const controller = new AbortController();
    const fetchMock = vi.fn<typeof fetch>(async () => {
      controller.abort(new Error("User cancelled."));
      return createJsonResponse({ message: "Temporary." }, 503);
    });

    await expect(
      submitReview(input, {
        fetch: fetchMock,
        maxRetries: 2,
        retryDelayMs: 10_000,
        signal: controller.signal
      })
    ).rejects.toThrow("User cancelled.");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
