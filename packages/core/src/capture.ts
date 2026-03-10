import type { Options as Html2CanvasOptions } from "html2canvas";

export type ElementScreenshotFormat = "dataUrl" | "blob";

export interface ElementScreenshotHtml2CanvasOptions
  extends Omit<Partial<Html2CanvasOptions>, "backgroundColor"> {}

export interface CaptureElementScreenshotOptions {
  backgroundColor?: string | null;
  format?: ElementScreenshotFormat;
  html2canvasOptions?: ElementScreenshotHtml2CanvasOptions;
}

export interface CaptureElementScreenshotBlobOptions extends CaptureElementScreenshotOptions {
  format: "blob";
}

export interface CaptureElementScreenshotDataUrlOptions extends CaptureElementScreenshotOptions {
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
  const canvas = await renderElement(element, options);

  if (options.format === "blob") {
    return canvasToBlob(canvas);
  }

  return canvas.toDataURL("image/png");
}

async function renderElement(
  element: Element,
  options: CaptureElementScreenshotOptions
): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default;

  return html2canvas(element as HTMLElement, {
    backgroundColor: options.backgroundColor ?? null,
    logging: false,
    useCORS: true,
    ...options.html2canvasOptions
  });
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await tryCanvasToBlob(canvas);

  if (blob) {
    return blob;
  }

  return dataUrlToBlob(canvas.toDataURL("image/png"));
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
  const match = /^data:([^;,]+)?;base64,(.+)$/u.exec(dataUrl);

  if (!match) {
    throw new Error("Element screenshot canvas produced an invalid PNG data URL.");
  }

  const mimeType = match[1] ?? "image/png";
  const encodedData = match[2];

  if (!encodedData) {
    throw new Error("Element screenshot canvas produced an empty PNG payload.");
  }

  return new Blob([decodeBase64(encodedData)], {
    type: mimeType
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

  throw new Error("No base64 decoder is available for element screenshot conversion.");
}
