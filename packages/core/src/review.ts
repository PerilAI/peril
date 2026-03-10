import { maxArtifactPayloadBytes, maxDomSnippetLength, maxLocatorTextLength } from "./limits";
import type { LocatorBundle } from "./locators";
import type { BoundingBox } from "./overlay";

export interface Selection {
  boundingBox: BoundingBox;
  locators: LocatorBundle;
  domSnippet: string;
  computedStyles?: Record<string, string>;
}

export interface Viewport {
  width: number;
  height: number;
}

export type ReviewStatus = "open" | "in_progress" | "resolved" | "wont_fix";
export type ReviewCategory = "bug" | "polish" | "accessibility" | "copy" | "ux";
export type Severity = "low" | "medium" | "high" | "critical";

export interface ReviewComment {
  category: ReviewCategory;
  severity: Severity;
  text: string;
  expected: string;
}

export interface Artifacts {
  elementScreenshot: string;
  pageScreenshot: string;
  rrwebSession?: string;
}

export interface Resolution {
  resolvedAt: string;
  resolvedBy: string;
  comment?: string;
}

export interface ReviewMetadata {
  userAgent: string;
  scrollPosition: {
    x: number;
    y: number;
  };
  devicePixelRatio: number;
  reviewerName?: string;
}

export interface Review {
  id: string;
  url: string;
  timestamp: string;
  viewport: Viewport;
  status: ReviewStatus;
  selection: Selection;
  comment: ReviewComment;
  artifacts: Artifacts;
  resolution: Resolution | null;
  metadata: ReviewMetadata;
}

export interface CreateReviewInput {
  artifacts: Artifacts;
  comment: ReviewComment;
  id?: string;
  metadata: ReviewMetadata;
  resolution?: Resolution | null;
  selection: Selection;
  status?: ReviewStatus;
  timestamp?: string;
  url: string;
  viewport: Viewport;
}

export interface CreateReviewIdOptions {
  now?: Date | number;
  randomValues?: Uint8Array;
}

const reviewIdPrefix = "rev_";
const ulidAlphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const timeLength = 10;
const randomLength = 16;

export function createReviewId(options: CreateReviewIdOptions = {}): string {
  const now = options.now instanceof Date ? options.now.getTime() : options.now ?? Date.now();

  return `${reviewIdPrefix}${encodeTime(now)}${encodeRandom(options.randomValues)}`;
}

export function createReview(input: CreateReviewInput): Review {
  const locators = normalizeLocators(input.selection.locators);
  const selection: Selection = {
    boundingBox: {
      ...input.selection.boundingBox
    },
    domSnippet: truncate(input.selection.domSnippet, maxDomSnippetLength),
    locators
  };

  if (input.selection.computedStyles) {
    selection.computedStyles = {
      ...input.selection.computedStyles
    };
  }

  const artifacts: Artifacts = {
    elementScreenshot: input.artifacts.elementScreenshot,
    pageScreenshot: input.artifacts.pageScreenshot
  };

  if (input.artifacts.rrwebSession) {
    artifacts.rrwebSession = input.artifacts.rrwebSession;
  }

  const metadata: ReviewMetadata = {
    devicePixelRatio: input.metadata.devicePixelRatio,
    scrollPosition: {
      ...input.metadata.scrollPosition
    },
    userAgent: input.metadata.userAgent
  };

  if (input.metadata.reviewerName !== undefined) {
    metadata.reviewerName = input.metadata.reviewerName;
  }

  return {
    artifacts,
    comment: {
      ...input.comment
    },
    id: input.id ?? createReviewId(),
    metadata,
    resolution: input.resolution ?? null,
    selection,
    status: input.status ?? "open",
    timestamp: input.timestamp ?? new Date().toISOString(),
    url: input.url,
    viewport: {
      ...input.viewport
    }
  };
}

export function serializeReview(input: CreateReviewInput): string {
  return JSON.stringify(createReview(input), null, 2);
}

export { maxArtifactPayloadBytes, maxDomSnippetLength, maxLocatorTextLength };

function encodeRandom(providedRandomValues: Uint8Array | undefined): string {
  const randomValues = getRandomValues(providedRandomValues);
  let encoded = "";

  for (let index = 0; index < randomValues.length; index += 1) {
    const randomValue = randomValues[index] ?? 0;
    encoded += ulidAlphabet.charAt(randomValue % ulidAlphabet.length);
  }

  return encoded;
}

function encodeTime(value: number): string {
  let remaining = Math.floor(value);
  let encoded = "";

  for (let index = 0; index < timeLength; index += 1) {
    encoded = `${ulidAlphabet.charAt(remaining % ulidAlphabet.length)}${encoded}`;
    remaining = Math.floor(remaining / ulidAlphabet.length);
  }

  return encoded;
}

function getRandomValues(providedRandomValues: Uint8Array | undefined): Uint8Array {
  const values = new Uint8Array(randomLength);

  if (providedRandomValues) {
    values.set(providedRandomValues.slice(0, randomLength));

    if (providedRandomValues.length >= randomLength) {
      return values;
    }
  }

  if (globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(values);
  }

  for (let index = 0; index < values.length; index += 1) {
    values[index] = Math.floor(Math.random() * 256);
  }

  return values;
}

function normalizeLocators(locators: LocatorBundle): LocatorBundle {
  const normalizedLocators = {} as LocatorBundle;

  if (locators.testId !== undefined) {
    normalizedLocators.testId = locators.testId;
  }

  if (locators.role !== undefined) {
    normalizedLocators.role = {
      ...locators.role
    };
  }

  normalizedLocators.css = locators.css;
  normalizedLocators.xpath = locators.xpath;

  if (locators.text !== undefined) {
    normalizedLocators.text = truncate(locators.text, maxLocatorTextLength);
  }

  return normalizedLocators;
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}
