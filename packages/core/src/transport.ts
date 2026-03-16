import {
  createReview,
  maxArtifactPayloadBytes,
  type Artifacts,
  type CreateReviewInput,
  type Review
} from "./review";

export type ReviewArtifactValue = Blob | string;

export interface ReviewArtifactUploadInput {
  elementScreenshot: ReviewArtifactValue;
  pageScreenshot: ReviewArtifactValue;
  rrwebSession?: ReviewArtifactValue;
}

export interface SubmitReviewInput extends Omit<CreateReviewInput, "artifacts"> {
  artifacts: ReviewArtifactUploadInput;
}

export interface SubmitReviewOptions {
  endpoint?: string;
  fetch?: typeof fetch;
  headers?: HeadersInit;
  maxRetries?: number;
  retryDelayMs?: number;
  signal?: AbortSignal;
}

export class ReviewTransportError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "ReviewTransportError";
  }
}

class MultipartFallbackError extends ReviewTransportError {
  constructor(
    message: string,
    status?: number
  ) {
    super(message, status);
    this.name = "MultipartFallbackError";
  }
}

const defaultEndpoint = "/api/reviews";
const defaultMaxRetries = 2;
const defaultRetryDelayMs = 250;
const multipartFallbackStatuses = new Set([400, 415, 422]);
const transientStatuses = new Set([408, 425, 429, 500, 502, 503, 504]);
const networkFailureMessage =
  "Could not reach the Peril server. Verify the local dev server is running and reachable.";
const artifactLabels = {
  elementScreenshot: "Element screenshot",
  pageScreenshot: "Page screenshot",
  rrwebSession: "Replay artifact"
} as const satisfies Record<keyof ReviewArtifactUploadInput, string>;

export async function submitReview(
  input: SubmitReviewInput,
  options: SubmitReviewOptions = {}
): Promise<Review> {
  const transport = options.fetch ?? globalThis.fetch;

  if (typeof transport !== "function") {
    throw new Error("submitReview requires a fetch implementation.");
  }

  await validateArtifactPayloads(input.artifacts);

  const endpoint = options.endpoint ?? defaultEndpoint;
  console.debug("[peril] Submitting review to", endpoint);

  const reviewSkeleton = createReviewSkeleton(input);
  const jsonReview = await createJsonReview(reviewSkeleton, input.artifacts);

  if (hasBinaryArtifacts(input.artifacts)) {
    try {
      return await sendWithRetries(
        () =>
          sendMultipartReview(transport, reviewSkeleton, input.artifacts, {
            endpoint,
            ...withOptionalTransportOptions(options)
          }),
        options
      );
    } catch (error) {
      if (!(error instanceof MultipartFallbackError)) {
        throw error;
      }
      console.debug("[peril] Multipart upload failed, falling back to JSON encoding");
    }
  }

  return sendWithRetries(
    () =>
      sendJsonReview(transport, jsonReview, {
        endpoint,
        ...withOptionalTransportOptions(options)
      }),
    options
  );
}

async function sendWithRetries(
  send: () => Promise<Review>,
  options: SubmitReviewOptions
): Promise<Review> {
  const maxRetries = options.maxRetries ?? defaultMaxRetries;
  const retryDelayMs = options.retryDelayMs ?? defaultRetryDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await send();
    } catch (error) {
      const normalizedError = normalizeTransportError(error);

      if (attempt === maxRetries || !isTransientError(error)) {
        throw normalizedError;
      }

      const delayMs = retryDelayMs * 2 ** attempt;
      console.warn(`[peril] Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delayMs}ms:`, normalizedError instanceof Error ? normalizedError.message : normalizedError);
      await delay(delayMs, options.signal);
    }
  }

  throw new Error("submitReview exhausted all retry attempts.");
}

async function sendMultipartReview(
  transport: typeof fetch,
  reviewSkeleton: Omit<Review, "artifacts">,
  artifacts: ReviewArtifactUploadInput,
  options: Pick<SubmitReviewOptions, "endpoint" | "headers" | "signal">
): Promise<Review> {
  const response = await transport(
    options.endpoint ?? defaultEndpoint,
    createRequestInit({
      body: createMultipartBody(reviewSkeleton, artifacts),
      headers: createRequestHeaders(options.headers),
      method: "POST",
      signal: options.signal
    })
  );

  return parseReviewResponse(response, true);
}

async function sendJsonReview(
  transport: typeof fetch,
  review: Review,
  options: Pick<SubmitReviewOptions, "endpoint" | "headers" | "signal">
): Promise<Review> {
  const headers = createRequestHeaders(options.headers);
  headers.set("content-type", "application/json");

  const response = await transport(
    options.endpoint ?? defaultEndpoint,
    createRequestInit({
      body: JSON.stringify(review),
      headers,
      method: "POST",
      signal: options.signal
    })
  );

  return parseReviewResponse(response, false);
}

function createReviewSkeleton(input: SubmitReviewInput): Omit<Review, "artifacts"> {
  const review = createReview({
    ...input,
    artifacts: createPlaceholderArtifacts(input.artifacts, "")
  });
  const { artifacts: _artifacts, ...reviewSkeleton } = review;

  return reviewSkeleton;
}

async function createJsonReview(
  reviewSkeleton: Omit<Review, "artifacts">,
  artifacts: ReviewArtifactUploadInput
): Promise<Review> {
  return {
    ...reviewSkeleton,
    artifacts: await encodeArtifactsAsStrings(artifacts)
  };
}

function createMultipartBody(
  reviewSkeleton: Omit<Review, "artifacts">,
  artifacts: ReviewArtifactUploadInput
): FormData {
  const formData = new FormData();
  const review = {
    ...reviewSkeleton,
    artifacts: createPlaceholderArtifacts(artifacts, "upload://")
  };

  formData.append("review", JSON.stringify(review));
  appendMultipartArtifact(formData, "elementScreenshot", artifacts.elementScreenshot, "element.png");
  appendMultipartArtifact(formData, "pageScreenshot", artifacts.pageScreenshot, "page.png");

  if (artifacts.rrwebSession !== undefined) {
    appendMultipartArtifact(formData, "rrwebSession", artifacts.rrwebSession, "replay.json");
  }

  return formData;
}

function appendMultipartArtifact(
  formData: FormData,
  fieldName: keyof Artifacts,
  value: ReviewArtifactValue,
  fileName: string
): void {
  if (typeof value === "string") {
    return;
  }

  formData.append(fieldName, value, fileName);
}

function createPlaceholderArtifacts(
  artifacts: ReviewArtifactUploadInput,
  prefix: string
): Artifacts {
  const nextArtifacts: Artifacts = {
    elementScreenshot:
      typeof artifacts.elementScreenshot === "string"
        ? artifacts.elementScreenshot
        : `${prefix}element.png`,
    pageScreenshot:
      typeof artifacts.pageScreenshot === "string" ? artifacts.pageScreenshot : `${prefix}page.png`
  };

  if (artifacts.rrwebSession !== undefined) {
    nextArtifacts.rrwebSession =
      typeof artifacts.rrwebSession === "string" ? artifacts.rrwebSession : `${prefix}replay.json`;
  }

  return nextArtifacts;
}

async function encodeArtifactsAsStrings(artifacts: ReviewArtifactUploadInput): Promise<Artifacts> {
  const nextArtifacts: Artifacts = {
    elementScreenshot: await encodeArtifactValue(artifacts.elementScreenshot),
    pageScreenshot: await encodeArtifactValue(artifacts.pageScreenshot)
  };

  if (artifacts.rrwebSession !== undefined) {
    nextArtifacts.rrwebSession = await encodeArtifactValue(artifacts.rrwebSession);
  }

  return nextArtifacts;
}

async function encodeArtifactValue(value: ReviewArtifactValue): Promise<string> {
  if (typeof value === "string") {
    return value;
  }

  return blobToDataUrl(value);
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const mimeType = blob.type || "application/octet-stream";
  const bytes = new Uint8Array(await blob.arrayBuffer());

  return `data:${mimeType};base64,${encodeBase64(bytes)}`;
}

function encodeBase64(bytes: Uint8Array): string {
  const globalWithBuffer = globalThis as typeof globalThis & {
    Buffer?: {
      from(input: Uint8Array): {
        toString(encoding: string): string;
      };
    };
  };

  if (globalWithBuffer.Buffer) {
    return globalWithBuffer.Buffer.from(bytes).toString("base64");
  }

  if (typeof globalThis.btoa === "function") {
    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return globalThis.btoa(binary);
  }

  throw new Error("No base64 encoder is available for review transport.");
}

async function parseReviewResponse(response: Response, allowMultipartFallback: boolean): Promise<Review> {
  if (response.ok) {
    return (await response.json()) as Review;
  }

  const message = await readErrorMessage(response);

  if (allowMultipartFallback && multipartFallbackStatuses.has(response.status)) {
    throw new MultipartFallbackError(message, response.status);
  }

  throw new ReviewTransportError(message, response.status);
}

async function readErrorMessage(response: Response): Promise<string> {
  const responseText = await response.text();

  if (!responseText) {
    return `Review submission failed with status ${response.status}.`;
  }

  try {
    const parsed = JSON.parse(responseText) as {
      error?: string;
      message?: string;
    };

    if (parsed.message) {
      return parsed.message;
    }

    if (parsed.error) {
      return parsed.error;
    }
  } catch {
    return responseText;
  }

  return responseText;
}

function createRequestHeaders(headers: HeadersInit | undefined): Headers {
  return new Headers(headers);
}

function withOptionalTransportOptions(
  options: SubmitReviewOptions
): Pick<SubmitReviewOptions, "headers" | "signal"> {
  const transportOptions: Pick<SubmitReviewOptions, "headers" | "signal"> = {};

  if (options.headers !== undefined) {
    transportOptions.headers = options.headers;
  }

  if (options.signal !== undefined) {
    transportOptions.signal = options.signal;
  }

  return transportOptions;
}

function createRequestInit(
  init: {
    body: BodyInit;
    headers: Headers;
    method: string;
    signal: AbortSignal | undefined;
  }
): RequestInit {
  const requestInit: RequestInit = {
    body: init.body,
    headers: init.headers,
    method: init.method
  };

  if (init.signal !== undefined) {
    requestInit.signal = init.signal;
  }

  return requestInit;
}

function hasBinaryArtifacts(artifacts: ReviewArtifactUploadInput): boolean {
  return [artifacts.elementScreenshot, artifacts.pageScreenshot, artifacts.rrwebSession].some(
    (value) => value instanceof Blob
  );
}

async function validateArtifactPayloads(artifacts: ReviewArtifactUploadInput): Promise<void> {
  for (const [artifactType, value] of Object.entries(artifacts) as Array<
    [keyof ReviewArtifactUploadInput, ReviewArtifactUploadInput[keyof ReviewArtifactUploadInput]]
  >) {
    if (value === undefined) {
      continue;
    }

    const payloadSize =
      typeof value === "string"
        ? getDataUrlPayloadSize(value)
        : value.size;

    if (payloadSize === null || payloadSize <= maxArtifactPayloadBytes) {
      continue;
    }

    throw new ReviewTransportError(
      `${artifactLabels[artifactType]} exceeds the ${formatMegabytes(maxArtifactPayloadBytes)} MB size limit.`
    );
  }
}

function isTransientError(error: unknown): boolean {
  if (error instanceof MultipartFallbackError) {
    return false;
  }

  if (error instanceof ReviewTransportError && error.status !== undefined) {
    return transientStatuses.has(error.status);
  }

  return error instanceof TypeError;
}

function delay(durationMs: number, signal: AbortSignal | undefined): Promise<void> {
  if (durationMs <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timeout = globalThis.setTimeout(() => {
      cleanup();
      resolve();
    }, durationMs);

    const handleAbort = () => {
      cleanup();
      reject(signal?.reason ?? new Error("Review submission was aborted."));
    };

    const cleanup = () => {
      globalThis.clearTimeout(timeout);
      signal?.removeEventListener("abort", handleAbort);
    };

    if (signal) {
      if (signal.aborted) {
        handleAbort();
        return;
      }

      signal.addEventListener("abort", handleAbort, { once: true });
    }
  });
}

function normalizeTransportError(error: unknown): unknown {
  if (error instanceof ReviewTransportError) {
    return error;
  }

  if (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  ) {
    return error;
  }

  if (error instanceof TypeError) {
    return new ReviewTransportError(networkFailureMessage);
  }

  return error;
}

function getDataUrlPayloadSize(value: string): number | null {
  const match = /^data:[^;,]+(?:;charset=[^;,]+)?;base64,(.*)$/u.exec(value);

  if (!match) {
    return null;
  }

  const encodedPayload = (match[1] ?? "").replace(/\s+/gu, "");
  const paddingLength = encodedPayload.endsWith("==") ? 2 : encodedPayload.endsWith("=") ? 1 : 0;

  return Math.max(0, Math.floor((encodedPayload.length * 3) / 4) - paddingLength);
}

function formatMegabytes(value: number): number {
  return value / (1024 * 1024);
}
