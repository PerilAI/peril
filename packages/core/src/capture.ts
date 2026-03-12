import type { Options as Html2CanvasOptions } from "html2canvas";

import { maxArtifactPayloadBytes } from "./limits";

export type ScreenshotFormat = "dataUrl" | "blob";
export type ElementScreenshotFormat = ScreenshotFormat;
export type PageScreenshotFormat = ScreenshotFormat;
export type PageScreenshotScope = "document" | "viewport";

export class CaptureElementScreenshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaptureElementScreenshotError";
  }
}

export interface ElementScreenshotHtml2CanvasOptions
  extends Omit<Partial<Html2CanvasOptions>, "backgroundColor"> {}

export interface PageScreenshotHtml2CanvasOptions
  extends Omit<
    Partial<Html2CanvasOptions>,
    "backgroundColor" | "height" | "scrollX" | "scrollY" | "width" | "windowHeight" | "windowWidth" | "x" | "y"
  > {}

export interface CaptureElementScreenshotOptions {
  backgroundColor?: string | null;
  format?: ElementScreenshotFormat;
  html2canvasOptions?: ElementScreenshotHtml2CanvasOptions;
}

export interface CapturePageScreenshotOptions extends CaptureElementScreenshotOptions {
  document?: Document;
  scope?: PageScreenshotScope;
  window?: Window;
}

export interface CaptureElementScreenshotBlobOptions extends CaptureElementScreenshotOptions {
  format: "blob";
}

export interface CaptureElementScreenshotDataUrlOptions extends CaptureElementScreenshotOptions {
  format?: "dataUrl";
}

export interface CapturePageScreenshotBlobOptions extends CapturePageScreenshotOptions {
  format: "blob";
}

export interface CapturePageScreenshotDataUrlOptions extends CapturePageScreenshotOptions {
  format?: "dataUrl";
}

export function captureElementScreenshot(
  element: Element,
  options?: CaptureElementScreenshotDataUrlOptions
): Promise<string>;
export function captureElementScreenshot(
  element: Element,
  options: CaptureElementScreenshotBlobOptions
): Promise<Blob>;
export async function captureElementScreenshot(
  element: Element,
  options: CaptureElementScreenshotOptions = {}
): Promise<Blob | string> {
  try {
    const renderOptions: {
      backgroundColor?: string | null;
      html2canvasOptions?: Partial<Html2CanvasOptions>;
    } = {};

    if (options.backgroundColor !== undefined) {
      renderOptions.backgroundColor = options.backgroundColor;
    }

    if (options.html2canvasOptions !== undefined) {
      renderOptions.html2canvasOptions = options.html2canvasOptions;
    }

    const canvas = await renderElement(element as HTMLElement, renderOptions);

    if (options.format === "blob") {
      return canvasToBlob(canvas);
    }

    return validateDataUrl(canvas.toDataURL("image/png"));
  } catch (error) {
    if (error instanceof CaptureElementScreenshotError) {
      throw error;
    }

    throw new CaptureElementScreenshotError("Failed to capture element screenshot.");
  }
}

export function capturePageScreenshot(
  options?: CapturePageScreenshotDataUrlOptions
): Promise<string>;
export function capturePageScreenshot(
  options: CapturePageScreenshotBlobOptions
): Promise<Blob>;
export async function capturePageScreenshot(
  options: CapturePageScreenshotOptions = {}
): Promise<Blob | string> {
  const canvas = await renderPage(options);

  if (options.format === "blob") {
    return canvasToBlob(canvas);
  }

  return canvas.toDataURL("image/png");
}

async function renderElement(
  element: HTMLElement,
  options: { backgroundColor?: string | null; html2canvasOptions?: Partial<Html2CanvasOptions> }
): Promise<HTMLCanvasElement> {
  return renderCanvas(element, {
    backgroundColor: options.backgroundColor ?? null,
    logging: false,
    useCORS: true,
    ...options.html2canvasOptions
  });
}

async function renderPage(
  options: CapturePageScreenshotOptions
): Promise<HTMLCanvasElement> {
  const targetDocument = options.document ?? globalThis.document;
  const targetWindow = options.window ?? globalThis.window;
  const rootElement = targetDocument?.documentElement ?? targetDocument?.body;

  if (!targetDocument || !rootElement) {
    throw new Error("capturePageScreenshot requires a document with a root element.");
  }

  if (!targetWindow) {
    throw new Error("capturePageScreenshot requires a window.");
  }

  const viewportWidth = targetWindow.innerWidth || rootElement.clientWidth || 0;
  const viewportHeight = targetWindow.innerHeight || rootElement.clientHeight || 0;
  const scrollX = targetWindow.scrollX ?? targetWindow.pageXOffset ?? 0;
  const scrollY = targetWindow.scrollY ?? targetWindow.pageYOffset ?? 0;
  const scope = options.scope ?? "document";

  if (scope === "viewport") {
    return renderCanvas(rootElement as HTMLElement, {
      backgroundColor: options.backgroundColor ?? null,
      height: viewportHeight,
      logging: false,
      scrollX,
      scrollY,
      useCORS: true,
      width: viewportWidth,
      windowHeight: viewportHeight,
      windowWidth: viewportWidth,
      x: scrollX,
      y: scrollY,
      ...options.html2canvasOptions
    });
  }

  const pageWidth = getDocumentDimension(
    targetWindow.innerWidth,
    rootElement.clientWidth,
    rootElement.scrollWidth,
    targetDocument.body?.clientWidth,
    targetDocument.body?.scrollWidth
  );
  const pageHeight = getDocumentDimension(
    targetWindow.innerHeight,
    rootElement.clientHeight,
    rootElement.scrollHeight,
    targetDocument.body?.clientHeight,
    targetDocument.body?.scrollHeight
  );

  return renderCanvas(rootElement as HTMLElement, {
    backgroundColor: options.backgroundColor ?? null,
    height: pageHeight,
    logging: false,
    scrollX: 0,
    scrollY: 0,
    useCORS: true,
    width: pageWidth,
    windowHeight: pageHeight,
    windowWidth: pageWidth,
    x: 0,
    y: 0,
    ...options.html2canvasOptions
  });
}

async function renderCanvas(
  element: HTMLElement,
  options: Partial<Html2CanvasOptions>
): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default;

  return html2canvas(element, options);
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await tryCanvasToBlob(canvas);

  if (blob) {
    return validateBlob(blob);
  }

  return dataUrlToBlob(validateDataUrl(canvas.toDataURL("image/png")));
}

function tryCanvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  if (typeof canvas.toBlob !== "function") {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/png");
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parsedDataUrl = parseDataUrl(dataUrl);

  if (!parsedDataUrl) {
    throw new CaptureElementScreenshotError(
      "Element screenshot canvas produced an invalid PNG data URL."
    );
  }

  if (!parsedDataUrl.encodedData) {
    throw new CaptureElementScreenshotError(
      "Element screenshot canvas produced an empty PNG payload."
    );
  }

  return new Blob([decodeBase64(parsedDataUrl.encodedData)], {
    type: parsedDataUrl.mimeType
  });
}

function decodeBase64(value: string): ArrayBuffer {
  if (typeof globalThis.atob === "function") {
    const decoded = globalThis.atob(value);
    const bytes = new Uint8Array(decoded.length);

    for (let index = 0; index < decoded.length; index += 1) {
      bytes[index] = decoded.charCodeAt(index);
    }

    return bytes.buffer;
  }

  const globalWithBuffer = globalThis as typeof globalThis & {
    Buffer?: {
      from(input: string, encoding: string): Uint8Array;
    };
  };

  if (globalWithBuffer.Buffer) {
    const decoded = globalWithBuffer.Buffer.from(value, "base64");
    const bytes = new Uint8Array(decoded.length);
    bytes.set(decoded);
    return bytes.buffer;
  }

  throw new CaptureElementScreenshotError(
    "No base64 decoder is available for element screenshot conversion."
  );
}

function validateBlob(blob: Blob): Blob {
  if (blob.size > maxArtifactPayloadBytes) {
    throw new CaptureElementScreenshotError(
      `Element screenshot exceeds the ${formatMegabytes(maxArtifactPayloadBytes)} MB size limit.`
    );
  }

  return blob;
}

function validateDataUrl(dataUrl: string): string {
  const parsedDataUrl = parseDataUrl(dataUrl);

  if (!parsedDataUrl) {
    throw new CaptureElementScreenshotError(
      "Element screenshot canvas produced an invalid PNG data URL."
    );
  }

  if (!parsedDataUrl.encodedData) {
    throw new CaptureElementScreenshotError(
      "Element screenshot canvas produced an empty PNG payload."
    );
  }

  if (parsedDataUrl.payloadByteLength > maxArtifactPayloadBytes) {
    throw new CaptureElementScreenshotError(
      `Element screenshot exceeds the ${formatMegabytes(maxArtifactPayloadBytes)} MB size limit.`
    );
  }

  return dataUrl;
}

function parseDataUrl(
  value: string
): { encodedData: string; mimeType: string; payloadByteLength: number } | null {
  const match = /^data:([^;,]+)?;base64,(.*)$/u.exec(value);

  if (!match) {
    return null;
  }

  const encodedData = match[2] ?? "";

  return {
    encodedData,
    mimeType: match[1] ?? "image/png",
    payloadByteLength: getBase64ByteLength(encodedData)
  };
}

function getBase64ByteLength(value: string): number {
  const normalizedValue = value.replace(/\s+/gu, "");
  const paddingLength = normalizedValue.endsWith("==")
    ? 2
    : normalizedValue.endsWith("=")
      ? 1
      : 0;

  return Math.max(0, Math.floor((normalizedValue.length * 3) / 4) - paddingLength);
}

function getDocumentDimension(...values: Array<number | undefined>): number {
  return values.reduce<number>((largestValue, value) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return largestValue;
    }

    return Math.max(largestValue, value);
  }, 0);
}

function formatMegabytes(value: number): number {
  return value / (1024 * 1024);
}
