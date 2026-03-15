import { describe, expect, it, vi } from "vitest";

import {
  maxArtifactPayloadBytes,
  ReviewTransportError,
  submitReview,
  type Review,
  type SubmitReviewInput
} from "../src/index";

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
    id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FB0",
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

describe("@peril-ai/core transport", () => {
  it("posts serialized reviews as JSON when artifacts are already strings", async () => {
    const input = createSubmitReviewInput();
    const fetchMock = vi.fn<typeof fetch>(async (_input, init) =>
      createJsonResponse(JSON.parse(init?.body as string) as Review)
    );

    const review = await submitReview(input, {
      fetch: fetchMock,
      retryDelayMs: 0
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("/api/reviews");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("content-type")).toBe("application/json");

    const postedReview = JSON.parse(init?.body as string) as Review;

    expect(postedReview).toEqual(review);
    expect(postedReview.artifacts).toEqual(input.artifacts);
  });

  it("falls back from multipart uploads to JSON when the server only accepts review JSON", async () => {
    const input = createSubmitReviewInput();
    input.artifacts = {
      elementScreenshot: new Blob(["element"], {
        type: "image/png"
      }),
      pageScreenshot: new Blob(["page"], {
        type: "image/png"
      })
    };

    let multipartReview: Review | undefined;
    const fetchMock = vi.fn<typeof fetch>(async (_input, init) => {
      if (fetchMock.mock.calls.length === 1) {
        const body = init?.body as FormData;
        expect(body).toBeInstanceOf(FormData);
        expect(new Headers(init?.headers).get("content-type")).toBeNull();
        multipartReview = JSON.parse(body.get("review") as string) as Review;

        expect(multipartReview.artifacts).toEqual({
          elementScreenshot: "upload://element.png",
          pageScreenshot: "upload://page.png"
        });
        expect(body.get("elementScreenshot")).toBeInstanceOf(Blob);
        expect(body.get("pageScreenshot")).toBeInstanceOf(Blob);

        return createJsonResponse(
          {
            error: "invalid_review",
            message: "Expected request body to match the Review interface."
          },
          400
        );
      }

      const postedReview = JSON.parse(init?.body as string) as Review;

      expect(new Headers(init?.headers).get("content-type")).toBe("application/json");
      expect(postedReview.id).toBe(multipartReview?.id);
      expect(postedReview.timestamp).toBe(multipartReview?.timestamp);
      expect(postedReview.artifacts).toEqual({
        elementScreenshot: "data:image/png;base64,ZWxlbWVudA==",
        pageScreenshot: "data:image/png;base64,cGFnZQ=="
      });

      return createJsonResponse(postedReview);
    });

    const review = await submitReview(input, {
      fetch: fetchMock,
      retryDelayMs: 0
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(review.artifacts).toEqual({
      elementScreenshot: "data:image/png;base64,ZWxlbWVudA==",
      pageScreenshot: "data:image/png;base64,cGFnZQ=="
    });
  });

  it("retries transient server failures before succeeding", async () => {
    const input = createSubmitReviewInput();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            error: "unavailable",
            message: "Temporary outage."
          },
          503
        )
      )
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            error: "unavailable",
            message: "Temporary outage."
          },
          503
        )
      )
      .mockImplementation(async (_input, init) => createJsonResponse(JSON.parse(init?.body as string)));

    const review = await submitReview(input, {
      fetch: fetchMock,
      maxRetries: 2,
      retryDelayMs: 0
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(review.id).toBe(input.id);
  });

  it("does not retry permanent request failures", async () => {
    const input = createSubmitReviewInput();
    const fetchMock = vi.fn<typeof fetch>(async () =>
      createJsonResponse(
        {
          error: "invalid_review",
          message: "Expected request body to match the Review interface."
        },
        400
      )
    );

    await expect(
      submitReview(input, {
        fetch: fetchMock,
        maxRetries: 2,
        retryDelayMs: 0
      })
    ).rejects.toThrow("Expected request body to match the Review interface.");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("normalizes network TypeErrors into ReviewTransportError", async () => {
    const input = createSubmitReviewInput();
    const fetchMock = vi.fn<typeof fetch>(async () => {
      throw new TypeError("Failed to fetch");
    });

    await expect(
      submitReview(input, {
        fetch: fetchMock,
        maxRetries: 0,
        retryDelayMs: 0
      })
    ).rejects.toThrow(ReviewTransportError);
    await expect(
      submitReview(input, {
        fetch: fetchMock,
        maxRetries: 0,
        retryDelayMs: 0
      })
    ).rejects.toThrow("Could not reach the Peril server");
  });

  it("rejects oversized artifact payloads before sending", async () => {
    const input = createSubmitReviewInput();
    const oversizedBase64 = "A".repeat(Math.ceil((maxArtifactPayloadBytes + 1) * 4 / 3));
    input.artifacts.elementScreenshot = `data:image/png;base64,${oversizedBase64}`;
    const fetchMock = vi.fn<typeof fetch>();

    await expect(
      submitReview(input, {
        fetch: fetchMock,
        retryDelayMs: 0
      })
    ).rejects.toThrow(ReviewTransportError);
    await expect(
      submitReview(input, {
        fetch: fetchMock,
        retryDelayMs: 0
      })
    ).rejects.toThrow("size limit");

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
