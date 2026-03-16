import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  rename,
  stat,
  writeFile
} from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { maxArtifactPayloadBytes } from "./limits.js";
import type {
  Artifacts,
  ListReviewsFilters,
  ListReviewsResponse,
  Review,
  ReviewListItem,
  Severity,
  StoredArtifact,
  UpdateReviewInput
} from "./models.js";

export interface ReviewStorageOptions {
  dataDir: string;
}

interface ArtifactConfig {
  contentType: string;
  fileName: string;
}

export class ReviewStorageError extends Error {
  constructor(
    message: string,
    readonly code: "artifact_payload_too_large" | "artifact_source_not_found"
  ) {
    super(message);
    this.name = "ReviewStorageError";
  }
}

const severityOrder: Severity[] = ["low", "medium", "high", "critical"];
const artifactConfigs = {
  elementScreenshot: {
    contentType: "image/png",
    fileName: "element.png"
  },
  pageScreenshot: {
    contentType: "image/png",
    fileName: "page.png"
  },
  rrwebSession: {
    contentType: "application/json; charset=utf-8",
    fileName: "replay.json"
  }
} satisfies Record<keyof Artifacts, ArtifactConfig>;

function getCommentPreview(text: string): string {
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function getLocatorSummary(review: Review): string {
  const { locators } = review.selection;

  if (locators.testId) {
    return locators.testId;
  }

  if (locators.role) {
    return `${locators.role.type}[name="${locators.role.name}"]`;
  }

  return locators.css || locators.xpath || locators.text || "";
}

function createIndexEntry(review: Review): ReviewListItem {
  return {
    id: review.id,
    url: review.url,
    timestamp: review.timestamp,
    status: review.status,
    category: review.comment.category,
    severity: review.comment.severity,
    commentPreview: getCommentPreview(review.comment.text),
    locatorSummary: getLocatorSummary(review)
  };
}

function matchesSeverity(minimumSeverity: Severity | undefined, actualSeverity: Severity): boolean {
  if (!minimumSeverity) {
    return true;
  }

  return severityOrder.indexOf(actualSeverity) >= severityOrder.indexOf(minimumSeverity);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseDataUrl(value: string): { contentType: string; payload: Buffer } | null {
  const match = value.match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/);

  if (!match) {
    return null;
  }

  const [, contentType, encodedPayload] = match;

  if (!encodedPayload) {
    return null;
  }

  return {
    contentType: contentType ?? "application/octet-stream",
    payload: Buffer.from(encodedPayload, "base64")
  };
}

async function writeAtomic(filePath: string, contents: string | Buffer): Promise<void> {
  const tempFilePath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(tempFilePath, contents);
  await rename(tempFilePath, filePath);
}

export class ReviewStorage {
  readonly #dataDir: string;
  readonly #reviewsDir: string;
  readonly #indexPath: string;

  constructor(options: ReviewStorageOptions) {
    this.#dataDir = options.dataDir;
    this.#reviewsDir = resolve(options.dataDir, "reviews");
    this.#indexPath = resolve(options.dataDir, "index.json");
  }

  async ensureReady(): Promise<void> {
    await mkdir(this.#reviewsDir, { recursive: true });

    if (!(await fileExists(this.#indexPath))) {
      await writeAtomic(this.#indexPath, "[]\n");
    }
  }

  async listReviews(filters: ListReviewsFilters): Promise<ListReviewsResponse> {
    const entries = await this.readIndex();
    const filteredEntries = entries.filter((entry) => {
      if (filters.status && !filters.status.includes(entry.status)) {
        return false;
      }

      if (filters.category && entry.category !== filters.category) {
        return false;
      }

      if (!matchesSeverity(filters.severity, entry.severity)) {
        return false;
      }

      if (filters.url && !entry.url.startsWith(filters.url)) {
        return false;
      }

      return true;
    });

    return {
      reviews: filteredEntries.slice(0, filters.limit),
      total: filteredEntries.length
    };
  }

  async getReview(reviewId: string): Promise<Review | null> {
    const reviewPath = this.getReviewFilePath(reviewId);

    if (!(await fileExists(reviewPath))) {
      return null;
    }

    const contents = await readFile(reviewPath, "utf8");
    return JSON.parse(contents) as Review;
  }

  async createReview(review: Review): Promise<Review> {
    const reviewDirectory = this.getReviewDirectory(review.id);

    if (await fileExists(reviewDirectory)) {
      throw new Error(`Review ${review.id} already exists.`);
    }

    await mkdir(reviewDirectory, { recursive: true });

    const storedReview: Review = {
      ...review,
      artifacts: await this.persistArtifacts(review.id, review.artifacts)
    };

    await writeAtomic(this.getReviewFilePath(review.id), `${JSON.stringify(storedReview, null, 2)}\n`);
    await this.upsertIndexEntry(storedReview);

    return storedReview;
  }

  async updateReview(reviewId: string, update: UpdateReviewInput): Promise<Review | null> {
    const currentReview = await this.getReview(reviewId);

    if (!currentReview) {
      return null;
    }

    const nextStatus = update.status ?? currentReview.status;
    const nextResolution =
      update.resolution !== undefined
        ? update.resolution
        : nextStatus === "resolved"
          ? currentReview.resolution
          : null;

    const updatedReview: Review = {
      ...currentReview,
      status: nextStatus,
      resolution: nextResolution
    };

    await writeAtomic(
      this.getReviewFilePath(reviewId),
      `${JSON.stringify(updatedReview, null, 2)}\n`
    );
    await this.upsertIndexEntry(updatedReview);

    return updatedReview;
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    const reviewDirectory = this.getReviewDirectory(reviewId);

    if (!(await fileExists(reviewDirectory))) {
      return false;
    }

    await rm(reviewDirectory, { force: true, recursive: true });
    await this.removeIndexEntry(reviewId);

    return true;
  }

  async getArtifact(reviewId: string, artifactType: keyof Artifacts): Promise<StoredArtifact | null> {
    const review = await this.getReview(reviewId);

    if (!review) {
      return null;
    }

    const artifactValue = review.artifacts[artifactType];

    if (!artifactValue) {
      return null;
    }

    const config = artifactConfigs[artifactType];
    const filePath = resolve(this.getReviewDirectory(reviewId), config.fileName);

    if (!(await fileExists(filePath))) {
      return null;
    }

    return {
      contentType: config.contentType,
      filePath
    };
  }

  private async persistArtifacts(reviewId: string, artifacts: Artifacts): Promise<Artifacts> {
    const nextArtifacts: Artifacts = {
      elementScreenshot: await this.persistArtifactValue(
        reviewId,
        "elementScreenshot",
        artifacts.elementScreenshot
      ),
      pageScreenshot: await this.persistArtifactValue(
        reviewId,
        "pageScreenshot",
        artifacts.pageScreenshot
      )
    };

    if (artifacts.rrwebSession) {
      nextArtifacts.rrwebSession = await this.persistArtifactValue(
        reviewId,
        "rrwebSession",
        artifacts.rrwebSession
      );
    }

    return nextArtifacts;
  }

  private async persistArtifactValue(
    reviewId: string,
    artifactType: keyof Artifacts,
    value: string
  ): Promise<string> {
    if (!value) {
      return "";
    }

    const config = artifactConfigs[artifactType];
    const destinationPath = resolve(this.getReviewDirectory(reviewId), config.fileName);
    const dataUrl = parseDataUrl(value);

    if (dataUrl) {
      assertArtifactSizeWithinLimit(dataUrl.payload.byteLength, artifactType);
      await writeAtomic(destinationPath, dataUrl.payload);
      return `artifact://${reviewId}/${config.fileName}`;
    }

    if (artifactType === "rrwebSession" && (value.trim().startsWith("{") || value.trim().startsWith("["))) {
      assertArtifactSizeWithinLimit(Buffer.byteLength(value, "utf8"), artifactType);
      await writeAtomic(destinationPath, value);
      return `artifact://${reviewId}/${config.fileName}`;
    }

    const sourcePath = resolve(value);

    if (!(await fileExists(sourcePath))) {
      throw new ReviewStorageError(
        `Artifact source not found for ${artifactType}.`,
        "artifact_source_not_found"
      );
    }

    const sourceStats = await stat(sourcePath);
    assertArtifactSizeWithinLimit(sourceStats.size, artifactType);
    await copyFile(sourcePath, destinationPath);
    return `artifact://${reviewId}/${config.fileName}`;
  }

  private async readIndex(): Promise<ReviewListItem[]> {
    await this.ensureReady();
    const contents = await readFile(this.#indexPath, "utf8");
    return JSON.parse(contents) as ReviewListItem[];
  }

  private async writeIndex(entries: ReviewListItem[]): Promise<void> {
    const sortedEntries = [...entries].sort((left, right) =>
      right.timestamp.localeCompare(left.timestamp)
    );
    await writeAtomic(this.#indexPath, `${JSON.stringify(sortedEntries, null, 2)}\n`);
  }

  private async upsertIndexEntry(review: Review): Promise<void> {
    const entries = await this.readIndex();
    const nextEntries = entries.filter((entry) => entry.id !== review.id);
    nextEntries.push(createIndexEntry(review));
    await this.writeIndex(nextEntries);
  }

  private async removeIndexEntry(reviewId: string): Promise<void> {
    const entries = await this.readIndex();
    await this.writeIndex(entries.filter((entry) => entry.id !== reviewId));
  }

  private getReviewDirectory(reviewId: string): string {
    return resolve(this.#reviewsDir, reviewId);
  }

  private getReviewFilePath(reviewId: string): string {
    return resolve(this.getReviewDirectory(reviewId), "review.json");
  }
}

function assertArtifactSizeWithinLimit(
  sizeInBytes: number,
  artifactType: keyof Artifacts
): void {
  if (sizeInBytes <= maxArtifactPayloadBytes) {
    return;
  }

  throw new ReviewStorageError(
    `Artifact payload too large for ${artifactType}.`,
    "artifact_payload_too_large"
  );
}
