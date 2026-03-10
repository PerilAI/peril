export interface RoleLocator {
  type: string;
  name: string;
}

export interface LocatorBundle {
  testId?: string;
  role?: RoleLocator;
  css: string;
  xpath: string;
  text?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

export interface ReviewListItem {
  id: string;
  url: string;
  timestamp: string;
  status: ReviewStatus;
  category: ReviewCategory;
  severity: Severity;
  commentPreview: string;
  locatorSummary: string;
}

export interface ListReviewsResponse {
  reviews: ReviewListItem[];
  total: number;
}

export interface ListReviewsFilters {
  status?: ReviewStatus[];
  category?: ReviewCategory;
  severity?: Severity;
  url?: string;
  limit: number;
}

export interface UpdateReviewInput {
  status?: ReviewStatus;
  resolution?: Resolution | null;
}

export interface StoredArtifact {
  contentType: string;
  filePath: string;
}
