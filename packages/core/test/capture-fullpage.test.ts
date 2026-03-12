import { afterEach, describe, expect, it, vi } from "vitest";

const { html2canvasMock } = vi.hoisted(() => ({
  html2canvasMock: vi.fn()
}));

vi.mock("html2canvas", () => ({
  default: html2canvasMock
}));

import { capturePageScreenshot } from "../src/index";

interface FakeCanvas {
  toBlob?: (callback: (blob: Blob | null) => void, type?: string) => void;
  toDataURL: (type?: string) => string;
}

interface FakeElement {
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollWidth: number;
}

function createFakeCanvas(dataUrl = "data:image/png;base64,cGFnZQ=="): {
  canvas: HTMLCanvasElement;
  toDataURL: ReturnType<typeof vi.fn>;
} {
  const toDataURL = vi.fn((_type?: string) => dataUrl);
  const canvas: FakeCanvas = { toDataURL };
  return { canvas: canvas as unknown as HTMLCanvasElement, toDataURL };
}

function createFakeDocument(dimensions: {
  bodyClientHeight?: number;
  bodyClientWidth?: number;
  bodyScrollHeight?: number;
  bodyScrollWidth?: number;
  documentClientHeight?: number;
  documentClientWidth?: number;
  documentScrollHeight?: number;
  documentScrollWidth?: number;
}): Document {
  return {
    body: {
      clientHeight: dimensions.bodyClientHeight ?? 0,
      clientWidth: dimensions.bodyClientWidth ?? 0,
      scrollHeight: dimensions.bodyScrollHeight ?? 0,
      scrollWidth: dimensions.bodyScrollWidth ?? 0
    } as FakeElement as HTMLElement,
    documentElement: {
      clientHeight: dimensions.documentClientHeight ?? 0,
      clientWidth: dimensions.documentClientWidth ?? 0,
      scrollHeight: dimensions.documentScrollHeight ?? 0,
      scrollWidth: dimensions.documentScrollWidth ?? 0
    } as FakeElement as HTMLElement
  } as Document;
}

function createFakeWindow(dimensions: {
  innerHeight: number;
  innerWidth: number;
  scrollX?: number;
  scrollY?: number;
}): Window {
  return {
    innerHeight: dimensions.innerHeight,
    innerWidth: dimensions.innerWidth,
    scrollX: dimensions.scrollX ?? 0,
    scrollY: dimensions.scrollY ?? 0
  } as Window;
}

describe("full-page screenshot capture (PER-67)", () => {
  afterEach(() => {
    html2canvasMock.mockReset();
  });

  it("captures the full document bounds by default", async () => {
    const document = createFakeDocument({
      bodyClientHeight: 1500,
      bodyClientWidth: 1400,
      bodyScrollHeight: 2200,
      bodyScrollWidth: 1600,
      documentClientHeight: 900,
      documentClientWidth: 1280,
      documentScrollHeight: 2400,
      documentScrollWidth: 1680
    });
    const window = createFakeWindow({
      innerHeight: 900,
      innerWidth: 1440,
      scrollX: 24,
      scrollY: 64
    });
    const { canvas, toDataURL } = createFakeCanvas("data:image/png;base64,ZnVsbHBhZ2U=");
    html2canvasMock.mockResolvedValue(canvas);

    const result = await capturePageScreenshot({
      document,
      window
    });

    expect(result).toBe("data:image/png;base64,ZnVsbHBhZ2U=");
    expect(html2canvasMock).toHaveBeenCalledWith(document.documentElement, {
      backgroundColor: null,
      height: 2400,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      width: 1680,
      windowHeight: 2400,
      windowWidth: 1680,
      x: 0,
      y: 0
    });
    expect(toDataURL).toHaveBeenCalledTimes(1);
  });

  it("captures the current viewport when viewport scope is requested", async () => {
    const document = createFakeDocument({
      documentClientHeight: 900,
      documentClientWidth: 1280,
      documentScrollHeight: 2400,
      documentScrollWidth: 1680
    });
    const window = createFakeWindow({
      innerHeight: 900,
      innerWidth: 1440,
      scrollX: 24,
      scrollY: 64
    });
    const { canvas } = createFakeCanvas();
    html2canvasMock.mockResolvedValue(canvas);

    await capturePageScreenshot({
      document,
      scope: "viewport",
      window
    });

    expect(html2canvasMock).toHaveBeenCalledWith(document.documentElement, {
      backgroundColor: null,
      height: 900,
      logging: false,
      scrollX: 24,
      scrollY: 64,
      useCORS: true,
      width: 1440,
      windowHeight: 900,
      windowWidth: 1440,
      x: 24,
      y: 64
    });
  });

  it("captures the full document as a blob", async () => {
    const document = createFakeDocument({
      documentScrollHeight: 2400,
      documentScrollWidth: 1680
    });
    const window = createFakeWindow({
      innerHeight: 900,
      innerWidth: 1440
    });
    const expectedBlob = new Blob(["fullpage-png"], { type: "image/png" });
    const toBlob = vi.fn((callback: (blob: Blob | null) => void, _type?: string) => {
      callback(expectedBlob);
    });
    const canvas = {
      toBlob,
      toDataURL: vi.fn()
    } as unknown as HTMLCanvasElement;
    html2canvasMock.mockResolvedValue(canvas);

    const result = await capturePageScreenshot({
      document,
      format: "blob",
      window
    });

    expect(result).toBe(expectedBlob);
    expect(toBlob).toHaveBeenCalledTimes(1);
  });

  it("passes custom backgroundColor for full-page capture", async () => {
    const document = createFakeDocument({
      documentScrollHeight: 2400,
      documentScrollWidth: 1680
    });
    const window = createFakeWindow({
      innerHeight: 900,
      innerWidth: 1440
    });
    const { canvas } = createFakeCanvas();
    html2canvasMock.mockResolvedValue(canvas);

    await capturePageScreenshot({
      backgroundColor: "#ffffff",
      document,
      window
    });

    expect(html2canvasMock).toHaveBeenCalledWith(document.documentElement, {
      backgroundColor: "#ffffff",
      height: 2400,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      width: 1680,
      windowHeight: 2400,
      windowWidth: 1680,
      x: 0,
      y: 0
    });
  });

  it("forwards scale override for high-DPI full-page capture", async () => {
    const document = createFakeDocument({
      documentScrollHeight: 2400,
      documentScrollWidth: 1680
    });
    const window = createFakeWindow({
      innerHeight: 900,
      innerWidth: 1440
    });
    const { canvas } = createFakeCanvas();
    html2canvasMock.mockResolvedValue(canvas);

    await capturePageScreenshot({
      document,
      html2canvasOptions: {
        scale: 1
      },
      window
    });

    expect(html2canvasMock).toHaveBeenCalledWith(document.documentElement, {
      backgroundColor: null,
      height: 2400,
      logging: false,
      scale: 1,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      width: 1680,
      windowHeight: 2400,
      windowWidth: 1680,
      x: 0,
      y: 0
    });
  });

  it("handles html2canvas rejection gracefully", async () => {
    const document = createFakeDocument({
      documentScrollHeight: 2400,
      documentScrollWidth: 1680
    });
    const window = createFakeWindow({
      innerHeight: 900,
      innerWidth: 1440
    });
    html2canvasMock.mockRejectedValue(new Error("Canvas rendering failed"));

    await expect(
      capturePageScreenshot({
        document,
        window
      })
    ).rejects.toThrow("Canvas rendering failed");
  });
});
