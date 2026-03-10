import { afterEach, describe, expect, it, vi } from "vitest";

const { html2canvasMock } = vi.hoisted(() => ({
  html2canvasMock: vi.fn()
}));

vi.mock("html2canvas", () => ({
  default: html2canvasMock
}));

import { captureElementScreenshot } from "../src/index";

/**
 * Full-page screenshot capture tests (PER-67).
 *
 * The Peril SDK captures full-page screenshots by passing
 * document.documentElement to captureElementScreenshot().
 * These tests verify that path works correctly, including
 * edge cases like large pages and custom html2canvas options.
 */

interface FakeCanvas {
  toBlob?: (callback: (blob: Blob | null) => void, type?: string) => void;
  toDataURL: (type?: string) => string;
}

function createFakeCanvas(dataUrl = "data:image/png;base64,cGFnZQ=="): {
  canvas: HTMLCanvasElement;
  toDataURL: ReturnType<typeof vi.fn>;
} {
  const toDataURL = vi.fn((_type?: string) => dataUrl);
  const canvas: FakeCanvas = { toDataURL };
  return { canvas: canvas as unknown as HTMLCanvasElement, toDataURL };
}

function createFakeDocumentElement(): Element {
  return {
    tagName: "HTML",
    nodeType: 1,
    ownerDocument: null,
    parentElement: null
  } as unknown as Element;
}

describe("full-page screenshot capture (PER-67)", () => {
  afterEach(() => {
    html2canvasMock.mockReset();
  });

  it("captures document.documentElement as a PNG data URL", async () => {
    const docElement = createFakeDocumentElement();
    const { canvas } = createFakeCanvas("data:image/png;base64,ZnVsbHBhZ2U=");
    html2canvasMock.mockResolvedValue(canvas);

    const result = await captureElementScreenshot(docElement);

    expect(result).toBe("data:image/png;base64,ZnVsbHBhZ2U=");
    expect(html2canvasMock).toHaveBeenCalledWith(docElement, {
      backgroundColor: null,
      logging: false,
      useCORS: true
    });
  });

  it("captures document.documentElement as a blob", async () => {
    const docElement = createFakeDocumentElement();
    const expectedBlob = new Blob(["fullpage-png"], { type: "image/png" });
    const toBlob = vi.fn((callback: (blob: Blob | null) => void, _type?: string) => {
      callback(expectedBlob);
    });
    const canvas = {
      toBlob,
      toDataURL: vi.fn()
    } as unknown as HTMLCanvasElement;
    html2canvasMock.mockResolvedValue(canvas);

    const result = await captureElementScreenshot(docElement, { format: "blob" });

    expect(result).toBe(expectedBlob);
    expect(toBlob).toHaveBeenCalledTimes(1);
  });

  it("passes custom backgroundColor for full-page capture", async () => {
    const docElement = createFakeDocumentElement();
    const { canvas } = createFakeCanvas();
    html2canvasMock.mockResolvedValue(canvas);

    await captureElementScreenshot(docElement, {
      backgroundColor: "#ffffff"
    });

    expect(html2canvasMock).toHaveBeenCalledWith(docElement, {
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true
    });
  });

  it("forwards scrollWidth/scrollHeight overrides for large pages", async () => {
    const docElement = createFakeDocumentElement();
    const { canvas } = createFakeCanvas();
    html2canvasMock.mockResolvedValue(canvas);

    // Simulate capturing a page taller than the viewport
    await captureElementScreenshot(docElement, {
      html2canvasOptions: {
        height: 5000,
        width: 1440,
        windowHeight: 5000,
        windowWidth: 1440
      }
    });

    expect(html2canvasMock).toHaveBeenCalledWith(docElement, {
      backgroundColor: null,
      height: 5000,
      logging: false,
      useCORS: true,
      width: 1440,
      windowHeight: 5000,
      windowWidth: 1440
    });
  });

  it("forwards scale override for high-DPI full-page capture", async () => {
    const docElement = createFakeDocumentElement();
    const { canvas } = createFakeCanvas();
    html2canvasMock.mockResolvedValue(canvas);

    await captureElementScreenshot(docElement, {
      html2canvasOptions: {
        scale: 1 // Force 1x for performance on large pages
      }
    });

    expect(html2canvasMock).toHaveBeenCalledWith(docElement, {
      backgroundColor: null,
      logging: false,
      scale: 1,
      useCORS: true
    });
  });

  it("handles html2canvas rejection gracefully", async () => {
    const docElement = createFakeDocumentElement();
    html2canvasMock.mockRejectedValue(new Error("Canvas rendering failed"));

    await expect(captureElementScreenshot(docElement)).rejects.toThrow(
      "Failed to capture element screenshot."
    );
  });
});
