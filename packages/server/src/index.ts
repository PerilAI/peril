import { createServer as createNodeServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  Artifacts,
  ListReviewsFilters,
  Resolution,
  Review,
  ReviewCategory,
  ReviewStatus,
  Severity,
  UpdateReviewInput
} from "./models.js";
import {
  renderDashboardDetailPage,
  renderDashboardListPage,
  renderDashboardNotFoundPage
} from "./dashboard.js";
import { maxDomSnippetLength, maxLocatorTextLength } from "./limits.js";
import { ReviewStorage, ReviewStorageError } from "./storage.js";

export interface HealthResponse {
  status: "ok";
  service: "@peril/server";
  timestamp: string;
}

export interface PerilServerOptions {
  host?: string;
  port?: number;
  dataDir?: string;
}

function writeJsonResponse(
  response: ServerResponse,
  statusCode: number,
  body: object
): void {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

function writeTextResponse(
  response: ServerResponse,
  statusCode: number,
  contentType: string,
  body: string | Buffer
): void {
  response.statusCode = statusCode;
  response.setHeader("content-type", contentType);
  response.end(body);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isIsoTimestamp(value: unknown): value is string {
  return isString(value) && !Number.isNaN(Date.parse(value));
}

function isReviewStatus(value: unknown): value is ReviewStatus {
  return value === "open" || value === "in_progress" || value === "resolved" || value === "wont_fix";
}

function isReviewCategory(value: unknown): value is ReviewCategory {
  return value === "bug" || value === "polish" || value === "accessibility" || value === "copy" || value === "ux";
}

function isSeverity(value: unknown): value is Severity {
  return value === "low" || value === "medium" || value === "high" || value === "critical";
}

function isResolution(value: unknown): value is Resolution {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isIsoTimestamp(value.resolvedAt) &&
    isString(value.resolvedBy) &&
    (value.comment === undefined || isString(value.comment))
  );
}

function isArtifacts(value: unknown): value is Artifacts {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.elementScreenshot) &&
    isString(value.pageScreenshot) &&
    (value.rrwebSession === undefined || isString(value.rrwebSession))
  );
}

function isReview(value: unknown): value is Review {
  if (!isRecord(value)) {
    return false;
  }

  if (
    !isString(value.id) ||
    !/^rev_[0-9A-HJKMNP-TV-Z]{10,}$/i.test(value.id) ||
    !isString(value.url) ||
    !isIsoTimestamp(value.timestamp) ||
    !isReviewStatus(value.status) ||
    !isArtifacts(value.artifacts) ||
    !(value.resolution === null || isResolution(value.resolution))
  ) {
    return false;
  }

  if (!isRecord(value.viewport) || !isNumber(value.viewport.width) || !isNumber(value.viewport.height)) {
    return false;
  }

  if (!isRecord(value.selection) || !isString(value.selection.domSnippet)) {
    return false;
  }

  if (
    !isRecord(value.selection.boundingBox) ||
    !isNumber(value.selection.boundingBox.x) ||
    !isNumber(value.selection.boundingBox.y) ||
    !isNumber(value.selection.boundingBox.width) ||
    !isNumber(value.selection.boundingBox.height)
  ) {
    return false;
  }

  if (
    !isRecord(value.selection.locators) ||
    !isString(value.selection.locators.css) ||
    !isString(value.selection.locators.xpath) ||
    (value.selection.locators.testId !== undefined && !isString(value.selection.locators.testId)) ||
    (value.selection.locators.text !== undefined && !isString(value.selection.locators.text))
  ) {
    return false;
  }

  if (
    value.selection.locators.role !== undefined &&
    (!isRecord(value.selection.locators.role) ||
      !isString(value.selection.locators.role.type) ||
      !isString(value.selection.locators.role.name))
  ) {
    return false;
  }

  if (
    value.selection.computedStyles !== undefined &&
    (!isRecord(value.selection.computedStyles) ||
      Object.values(value.selection.computedStyles).some((entry) => !isString(entry)))
  ) {
    return false;
  }

  if (
    !isRecord(value.comment) ||
    !isReviewCategory(value.comment.category) ||
    !isSeverity(value.comment.severity) ||
    !isString(value.comment.text) ||
    !isString(value.comment.expected)
  ) {
    return false;
  }

  if (
    !isRecord(value.metadata) ||
    !isString(value.metadata.userAgent) ||
    !isNumber(value.metadata.devicePixelRatio) ||
    !isRecord(value.metadata.scrollPosition) ||
    !isNumber(value.metadata.scrollPosition.x) ||
    !isNumber(value.metadata.scrollPosition.y) ||
    (value.metadata.reviewerName !== undefined && !isString(value.metadata.reviewerName))
  ) {
    return false;
  }

  return true;
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return null;
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new Error("Expected request body to be valid JSON.");
  }
}

function parseListReviewsFilters(requestUrl: URL): ListReviewsFilters {
  const rawStatuses = requestUrl.searchParams
    .getAll("status")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const category = requestUrl.searchParams.get("category");
  const severity = requestUrl.searchParams.get("severity");
  const url = requestUrl.searchParams.get("url");
  const rawLimit = requestUrl.searchParams.get("limit");
  const limit = rawLimit ? Number.parseInt(rawLimit, 10) : 50;

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("Expected limit to be a positive integer.");
  }

  if (category && !isReviewCategory(category)) {
    throw new Error("Expected category to be one of the documented review categories.");
  }

  if (severity && !isSeverity(severity)) {
    throw new Error("Expected severity to be one of the documented severity values.");
  }

  if (rawStatuses.some((status) => !isReviewStatus(status))) {
    throw new Error("Expected status to be one of the documented review statuses.");
  }

  const statuses = rawStatuses as ReviewStatus[];
  const normalizedCategory = category as ReviewCategory | null;
  const normalizedSeverity = severity as Severity | null;
  const filters: ListReviewsFilters = {
    limit
  };

  if (statuses.length > 0) {
    filters.status = statuses;
  }

  if (normalizedCategory) {
    filters.category = normalizedCategory;
  }

  if (normalizedSeverity) {
    filters.severity = normalizedSeverity;
  }

  if (url) {
    filters.url = url;
  }

  return filters;
}

function parseUpdateReviewInput(value: unknown): UpdateReviewInput {
  if (!isRecord(value)) {
    throw new Error("Expected a JSON object.");
  }

  const nextStatus = value.status;
  const nextResolution = value.resolution;

  if (nextStatus !== undefined && !isReviewStatus(nextStatus)) {
    throw new Error("Expected status to be one of the documented review statuses.");
  }

  if (
    nextResolution !== undefined &&
    nextResolution !== null &&
    !isResolution(nextResolution)
  ) {
    throw new Error("Expected resolution to be null or a valid Resolution object.");
  }

  if (nextStatus === undefined && nextResolution === undefined) {
    throw new Error("Expected at least one mutable review field.");
  }

  const update: UpdateReviewInput = {};

  if (nextStatus !== undefined) {
    update.status = nextStatus;
  }

  if (nextResolution !== undefined) {
    update.resolution = nextResolution;
  }

  return update;
}

function normalizeReviewPayload(review: Review): Review {
  const locators = { ...review.selection.locators };

  if (locators.text !== undefined) {
    locators.text = truncate(locators.text, maxLocatorTextLength);
  }

  return {
    ...review,
    selection: {
      ...review.selection,
      domSnippet: truncate(review.selection.domSnippet, maxDomSnippetLength),
      locators
    }
  };
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function createErrorResponse(error: unknown): {
  body: {
    error: string;
    message: string;
  };
  statusCode: number;
} {
  if (error instanceof ReviewStorageError) {
    if (error.code === "artifact_payload_too_large") {
      return {
        statusCode: 413,
        body: {
          error: "payload_too_large",
          message: error.message
        }
      };
    }

    return {
      statusCode: 400,
      body: {
        error: "bad_request",
        message: error.message
      }
    };
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";

  if (hasErrorCode(error, "ENOSPC")) {
    return {
      statusCode: 507,
      body: {
        error: "storage_full",
        message: "Local review storage is full. Free disk space and retry."
      }
    };
  }

  if (hasErrorCode(error, "EACCES") || hasErrorCode(error, "EPERM") || hasErrorCode(error, "EROFS")) {
    return {
      statusCode: 500,
      body: {
        error: "storage_unavailable",
        message: "Local review storage is not writable. Check directory permissions and retry."
      }
    };
  }

  if (message.startsWith("Expected ")) {
    return {
      statusCode: 400,
      body: {
        error: message.includes("valid JSON") ? "invalid_json" : "bad_request",
        message
      }
    };
  }

  if (message.includes("already exists")) {
    return {
      statusCode: 409,
      body: {
        error: "conflict",
        message
      }
    };
  }

  return {
    statusCode: 500,
    body: {
      error: "internal_error",
      message
    }
  };
}

function hasErrorCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  storage: ReviewStorage
): Promise<void> {
  const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
  const pathSegments = requestUrl.pathname.split("/").filter(Boolean);

  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    const healthResponse: HealthResponse = {
      status: "ok",
      service: "@peril/server",
      timestamp: new Date().toISOString()
    };

    writeJsonResponse(response, 200, healthResponse);
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/reviews") {
    const filters = parseListReviewsFilters(requestUrl);
    const result = await storage.listReviews(filters);
    writeJsonResponse(response, 200, result);
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/") {
    const dashboard = await storage.listReviews({ limit: 100 });
    writeTextResponse(response, 200, "text/html; charset=utf-8", renderDashboardListPage(dashboard));
    return;
  }

  if (
    request.method === "GET" &&
    pathSegments.length === 2 &&
    pathSegments[0] === "reviews"
  ) {
    const reviewId = pathSegments[1] ?? "";
    const review = await storage.getReview(reviewId);

    if (!review) {
      writeTextResponse(
        response,
        404,
        "text/html; charset=utf-8",
        renderDashboardNotFoundPage(reviewId)
      );
      return;
    }

    writeTextResponse(
      response,
      200,
      "text/html; charset=utf-8",
      renderDashboardDetailPage(review)
    );
    return;
  }

  if (pathSegments.length === 3 && pathSegments[0] === "api" && pathSegments[1] === "reviews") {
    const reviewId = pathSegments[2] ?? "";

    if (request.method === "GET") {
      const review = await storage.getReview(reviewId);

      if (!review) {
        writeJsonResponse(response, 404, { error: "not_found" });
        return;
      }

      writeJsonResponse(response, 200, review);
      return;
    }

    if (request.method === "PATCH") {
      const update = parseUpdateReviewInput(await readJsonBody(request));
      const review = await storage.updateReview(reviewId, update);

      if (!review) {
        writeJsonResponse(response, 404, { error: "not_found" });
        return;
      }

      writeJsonResponse(response, 200, review);
      return;
    }

    if (request.method === "DELETE") {
      const deleted = await storage.deleteReview(reviewId);
      response.statusCode = deleted ? 204 : 404;

      if (!deleted) {
        writeJsonResponse(response, 404, { error: "not_found" });
        return;
      }

      response.end();
      return;
    }
  }

  if (
    pathSegments.length === 5 &&
    pathSegments[0] === "api" &&
    pathSegments[1] === "reviews" &&
    pathSegments[3] === "artifacts"
  ) {
    const reviewId = pathSegments[2] ?? "";
    const artifactType = pathSegments[4];

    if (
      request.method === "GET" &&
      (artifactType === "elementScreenshot" ||
        artifactType === "pageScreenshot" ||
        artifactType === "rrwebSession")
    ) {
      const artifact = await storage.getArtifact(reviewId, artifactType);

      if (!artifact) {
        writeJsonResponse(response, 404, { error: "not_found" });
        return;
      }

      const contents = await readFile(artifact.filePath);
      writeTextResponse(response, 200, artifact.contentType, contents);
      return;
    }
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/reviews") {
    const payload = await readJsonBody(request);

    if (!isReview(payload)) {
      writeJsonResponse(response, 400, {
        error: "invalid_review",
        message: "Expected request body to match the Review interface."
      });
      return;
    }

    const review = await storage.createReview(normalizeReviewPayload(payload));
    writeJsonResponse(response, 201, review);
    return;
  }

  writeJsonResponse(response, 404, {
    error: "not_found"
  });
}

export function createServer(options: PerilServerOptions = {}): Server {
  const dataDir = resolve(options.dataDir ?? resolve(process.cwd(), ".peril"));
  const storage = new ReviewStorage({ dataDir });

  return createNodeServer((request, response) => {
    void storage
      .ensureReady()
      .then(() => handleRequest(request, response, storage))
      .catch((error: unknown) => {
        const { body, statusCode } = createErrorResponse(error);
        writeJsonResponse(response, statusCode, body);
      });
  });
}

export async function startServer(
  options: PerilServerOptions = {}
): Promise<{ server: Server; url: string }> {
  const server = createServer(options);
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 4173;

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Expected the server to bind to a network address.");
  }

  return {
    server,
    url: `http://${host}:${address.port}`
  };
}

const isEntrypoint = process.argv[1] === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  startServer().then(({ url }) => {
    console.log(`@peril/server listening on ${url}`);
  });
}

export type {
  Artifacts,
  ListReviewsFilters,
  ListReviewsResponse,
  LocatorBundle,
  Resolution,
  Review,
  ReviewCategory,
  ReviewListItem,
  ReviewMetadata,
  ReviewStatus,
  RoleLocator,
  Selection,
  Severity,
  UpdateReviewInput,
  Viewport
} from "./models.js";
