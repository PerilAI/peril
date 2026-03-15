import { Buffer } from "node:buffer";
import process from "node:process";

export interface JsonSchema {
  type?: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  enum?: string[];
  items?: JsonSchema;
  anyOf?: JsonSchema[];
  minimum?: number;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

export interface McpManifest {
  serverName: string;
  version: string;
  tools: McpToolDefinition[];
}

export interface ReviewListItem {
  id: string;
  url: string;
  timestamp: string;
  status: "open" | "in_progress" | "resolved" | "wont_fix";
  category: "bug" | "polish" | "accessibility" | "copy" | "ux";
  severity: "low" | "medium" | "high" | "critical";
  commentPreview: string;
  locatorSummary: string;
}

export interface ListReviewsResponse {
  reviews: ReviewListItem[];
  total: number;
}

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

export interface Review {
  id: string;
  url: string;
  timestamp: string;
  viewport: {
    width: number;
    height: number;
  };
  status: "open" | "in_progress" | "resolved" | "wont_fix";
  selection: {
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    locators: LocatorBundle;
    domSnippet: string;
    computedStyles?: Record<string, string>;
  };
  comment: {
    category: "bug" | "polish" | "accessibility" | "copy" | "ux";
    severity: "low" | "medium" | "high" | "critical";
    text: string;
    expected: string;
  };
  artifacts: {
    elementScreenshot: string;
    pageScreenshot: string;
    rrwebSession?: string;
  };
  resolution: {
    resolvedAt: string;
    resolvedBy: string;
    comment?: string;
  } | null;
  metadata: {
    userAgent: string;
    scrollPosition: {
      x: number;
      y: number;
    };
    devicePixelRatio: number;
    reviewerName?: string;
  };
}

export interface PerilMcpServerOptions {
  serverUrl?: string;
  resolvedBy?: string;
}

interface JsonRpcErrorShape {
  code: number;
  message: string;
}

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: unknown;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: JsonRpcErrorShape;
}

interface ToolCallParams {
  name?: unknown;
  arguments?: unknown;
}

interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: unknown;
  isError?: boolean;
}

type ToolName =
  | "list_reviews"
  | "get_review"
  | "get_review_artifact"
  | "mark_review_resolved"
  | "update_review_status";

const packageVersion = "0.0.0";
const defaultServerUrl = "http://127.0.0.1:4173";
const reviewStatuses = ["open", "in_progress", "resolved", "wont_fix"] as const;
const reviewCategories = ["bug", "polish", "accessibility", "copy", "ux"] as const;
const severities = ["low", "medium", "high", "critical"] as const;
const artifactTypes = ["elementScreenshot", "pageScreenshot", "rrwebSession"] as const;

const listReviewsInputSchema: JsonSchema = {
  type: "object",
  description: "Optional filters for listing review tasks.",
  properties: {
    status: {
      description: "Review status or statuses to include. Defaults to open and in_progress.",
      anyOf: [
        {
          type: "string",
          enum: [...reviewStatuses]
        },
        {
          type: "array",
          items: {
            type: "string",
            enum: [...reviewStatuses]
          }
        }
      ]
    },
    category: {
      type: "string",
      enum: [...reviewCategories],
      description: "Restrict results to a single review category."
    },
    severity: {
      type: "string",
      enum: [...severities],
      description: "Minimum review severity to include."
    },
    url: {
      type: "string",
      description: "Only include reviews whose page URL starts with this value."
    },
    limit: {
      type: "number",
      minimum: 1,
      description: "Maximum number of reviews to return."
    }
  }
};

const reviewIdSchema: JsonSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "Review identifier, such as rev_01HXYZ..."
    }
  },
  required: ["id"]
};

export const toolDefinitions: McpToolDefinition[] = [
  {
    name: "list_reviews",
    description: "List open review tasks with optional filtering.",
    inputSchema: listReviewsInputSchema
  },
  {
    name: "get_review",
    description: "Fetch the full review annotation and metadata.",
    inputSchema: reviewIdSchema
  },
  {
    name: "get_review_artifact",
    description: "Retrieve screenshot or snapshot artifacts for a review.",
    inputSchema: {
      type: "object",
      properties: {
        ...reviewIdSchema.properties,
        type: {
          type: "string",
          enum: [...artifactTypes],
          description: "Artifact type to retrieve."
        }
      },
      required: ["id", "type"]
    }
  },
  {
    name: "mark_review_resolved",
    description: "Mark a review task as resolved.",
    inputSchema: {
      type: "object",
      properties: {
        ...reviewIdSchema.properties,
        comment: {
          type: "string",
          description: "Optional resolution note describing what was fixed."
        },
        resolvedBy: {
          type: "string",
          description: "Identifier recorded in the resolution metadata."
        }
      },
      required: ["id"]
    }
  },
  {
    name: "update_review_status",
    description: "Update a review status without resolving it.",
    inputSchema: {
      type: "object",
      properties: {
        ...reviewIdSchema.properties,
        status: {
          type: "string",
          enum: [...reviewStatuses],
          description: "New status for the review."
        },
        comment: {
          type: "string",
          description: "Optional operator note. Returned to the caller but not stored in V1."
        }
      },
      required: ["id", "status"]
    }
  }
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function toJsonRpcId(value: unknown): string | number | null {
  return typeof value === "string" || typeof value === "number" || value === null ? value : null;
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error.";
}

function parseBaseUrl(serverUrl?: string): URL {
  return new URL(serverUrl ?? process.env.PERIL_SERVER_URL ?? defaultServerUrl);
}

function createApiUrl(baseUrl: URL, pathname: string): URL {
  return new URL(pathname, baseUrl);
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function expectOk(response: Response, fallbackMessage: string): Promise<Response> {
  if (response.ok) {
    return response;
  }

  let errorMessage = fallbackMessage;

  try {
    const body = (await response.json()) as { message?: string; error?: string };
    errorMessage = body.message ?? body.error ?? fallbackMessage;
  } catch {
    errorMessage = fallbackMessage;
  }

  throw new Error(errorMessage);
}

function ensureToolArguments(value: unknown): Record<string, unknown> {
  if (value === undefined) {
    return {};
  }

  if (!isRecord(value)) {
    throw new Error("Expected tool arguments to be a JSON object.");
  }

  return value;
}

function ensureReviewId(value: unknown): string {
  if (!isString(value) || value.length === 0) {
    throw new Error("Expected id to be a non-empty string.");
  }

  return value;
}

function ensureArtifactType(
  value: unknown
): "elementScreenshot" | "pageScreenshot" | "rrwebSession" {
  if (
    value !== "elementScreenshot" &&
    value !== "pageScreenshot" &&
    value !== "rrwebSession"
  ) {
    throw new Error("Expected type to be one of elementScreenshot, pageScreenshot, or rrwebSession.");
  }

  return value;
}

function ensureReviewStatus(
  value: unknown
): "open" | "in_progress" | "resolved" | "wont_fix" {
  if (
    value !== "open" &&
    value !== "in_progress" &&
    value !== "resolved" &&
    value !== "wont_fix"
  ) {
    throw new Error("Expected status to be one of open, in_progress, resolved, or wont_fix.");
  }

  return value;
}

function encodeListReviewsQuery(argumentsObject: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  const statuses = argumentsObject.status;

  if (typeof statuses === "string") {
    searchParams.append("status", statuses);
  }

  if (Array.isArray(statuses)) {
    for (const status of statuses) {
      searchParams.append("status", ensureReviewStatus(status));
    }
  }

  if (argumentsObject.category !== undefined) {
    if (
      argumentsObject.category !== "bug" &&
      argumentsObject.category !== "polish" &&
      argumentsObject.category !== "accessibility" &&
      argumentsObject.category !== "copy" &&
      argumentsObject.category !== "ux"
    ) {
      throw new Error("Expected category to be one of bug, polish, accessibility, copy, or ux.");
    }

    searchParams.set("category", argumentsObject.category);
  }

  if (argumentsObject.severity !== undefined) {
    if (
      argumentsObject.severity !== "low" &&
      argumentsObject.severity !== "medium" &&
      argumentsObject.severity !== "high" &&
      argumentsObject.severity !== "critical"
    ) {
      throw new Error("Expected severity to be one of low, medium, high, or critical.");
    }

    searchParams.set("severity", argumentsObject.severity);
  }

  if (argumentsObject.url !== undefined) {
    if (!isString(argumentsObject.url)) {
      throw new Error("Expected url to be a string.");
    }

    searchParams.set("url", argumentsObject.url);
  }

  if (argumentsObject.limit !== undefined) {
    if (typeof argumentsObject.limit !== "number" || !Number.isInteger(argumentsObject.limit) || argumentsObject.limit <= 0) {
      throw new Error("Expected limit to be a positive integer.");
    }

    searchParams.set("limit", String(argumentsObject.limit));
  }

  return searchParams.toString();
}

export function createManifest(): McpManifest {
  return {
    serverName: "@peril-ai/mcp",
    version: packageVersion,
    tools: [...toolDefinitions]
  };
}

export function listToolNames(): string[] {
  return toolDefinitions.map((tool) => tool.name);
}

export class PerilMcpServer {
  readonly #baseUrl: URL;
  readonly #resolvedBy: string;

  constructor(options: PerilMcpServerOptions = {}) {
    this.#baseUrl = parseBaseUrl(options.serverUrl);
    this.#resolvedBy = options.resolvedBy ?? "@peril-ai/mcp";
  }

  async callTool(name: ToolName, rawArguments: unknown = {}): Promise<unknown> {
    const args = ensureToolArguments(rawArguments);

    if (name === "list_reviews") {
      return this.listReviews(args);
    }

    if (name === "get_review") {
      return this.getReview(args);
    }

    if (name === "get_review_artifact") {
      return this.getReviewArtifact(args);
    }

    if (name === "mark_review_resolved") {
      return this.markReviewResolved(args);
    }

    if (name === "update_review_status") {
      return this.updateReviewStatus(args);
    }

    throw new Error(`Unknown tool: ${name}`);
  }

  async handleJsonRpc(message: unknown): Promise<JsonRpcResponse | null> {
    if (!isRecord(message) || message.jsonrpc !== "2.0" || !isString(message.method)) {
      return {
        jsonrpc: "2.0",
        id: isRecord(message) && "id" in message ? toJsonRpcId(message.id) : null,
        error: {
          code: -32600,
          message: "Invalid JSON-RPC request."
        }
      };
    }

    if (message.method === "notifications/initialized") {
      return null;
    }

    if (message.method === "initialize") {
      return {
        jsonrpc: "2.0",
        id: toJsonRpcId(message.id),
        result: {
          protocolVersion: "2025-06-18",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "@peril-ai/mcp",
            version: packageVersion
          }
        }
      };
    }

    if (message.method === "ping") {
      return {
        jsonrpc: "2.0",
        id: toJsonRpcId(message.id),
        result: {}
      };
    }

    if (message.method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id: toJsonRpcId(message.id),
        result: {
          tools: toolDefinitions
        }
      };
    }

    if (message.method === "tools/call") {
      const params = message.params as ToolCallParams | undefined;

      if (!params || !isString(params.name) || !listToolNames().includes(params.name)) {
        return {
          jsonrpc: "2.0",
          id: toJsonRpcId(message.id),
          error: {
            code: -32602,
            message: "Expected a valid MCP tool name."
          }
        };
      }

      try {
        const structuredContent = await this.callTool(params.name as ToolName, params.arguments);
        const result: ToolResult = {
          content: [
            {
              type: "text",
              text: JSON.stringify(structuredContent, null, 2)
            }
          ],
          structuredContent
        };

        return {
          jsonrpc: "2.0",
          id: toJsonRpcId(message.id),
          result
        };
      } catch (error) {
        const result: ToolResult = {
          content: [
            {
              type: "text",
              text: toErrorMessage(error)
            }
          ],
          isError: true
        };

        return {
          jsonrpc: "2.0",
          id: toJsonRpcId(message.id),
          result
        };
      }
    }

    if (message.id === undefined) {
      return null;
    }

    return {
      jsonrpc: "2.0",
      id: toJsonRpcId(message.id),
      error: {
        code: -32601,
        message: `Method not found: ${message.method}`
      }
    };
  }

  private async listReviews(args: Record<string, unknown>): Promise<ListReviewsResponse> {
    const requestUrl = createApiUrl(this.#baseUrl, "/api/reviews");
    const queryString = encodeListReviewsQuery(args);

    if (queryString.length > 0) {
      requestUrl.search = queryString;
    }

    const response = await fetch(requestUrl);
    await expectOk(response, "Failed to list reviews.");
    return readJsonResponse<ListReviewsResponse>(response);
  }

  private async getReview(args: Record<string, unknown>): Promise<Review> {
    const reviewId = ensureReviewId(args.id);
    const response = await fetch(createApiUrl(this.#baseUrl, `/api/reviews/${reviewId}`));
    await expectOk(response, `Review ${reviewId} was not found.`);
    return readJsonResponse<Review>(response);
  }

  private async getReviewArtifact(args: Record<string, unknown>): Promise<{
    id: string;
    type: "elementScreenshot" | "pageScreenshot" | "rrwebSession";
    contentType: string;
    base64: string;
  }> {
    const reviewId = ensureReviewId(args.id);
    const artifactType = ensureArtifactType(args.type);
    const response = await fetch(
      createApiUrl(this.#baseUrl, `/api/reviews/${reviewId}/artifacts/${artifactType}`)
    );
    await expectOk(response, `Artifact ${artifactType} for review ${reviewId} was not found.`);

    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    const payload = Buffer.from(await response.arrayBuffer()).toString("base64");

    return {
      id: reviewId,
      type: artifactType,
      contentType,
      base64: payload
    };
  }

  private async markReviewResolved(args: Record<string, unknown>): Promise<{
    id: string;
    status: "resolved";
    resolution: NonNullable<Review["resolution"]>;
  }> {
    const reviewId = ensureReviewId(args.id);

    if (args.comment !== undefined && !isString(args.comment)) {
      throw new Error("Expected comment to be a string.");
    }

    if (args.resolvedBy !== undefined && !isString(args.resolvedBy)) {
      throw new Error("Expected resolvedBy to be a string.");
    }

    const resolution = {
      resolvedAt: new Date().toISOString(),
      resolvedBy: args.resolvedBy ?? this.#resolvedBy,
      ...(args.comment ? { comment: args.comment } : {})
    };
    const response = await fetch(createApiUrl(this.#baseUrl, `/api/reviews/${reviewId}`), {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        status: "resolved",
        resolution
      })
    });
    await expectOk(response, `Failed to resolve review ${reviewId}.`);
    const review = await readJsonResponse<Review>(response);

    if (!review.resolution) {
      throw new Error(`Review ${reviewId} did not return resolution metadata.`);
    }

    return {
      id: review.id,
      status: "resolved",
      resolution: review.resolution
    };
  }

  private async updateReviewStatus(args: Record<string, unknown>): Promise<Review & { statusComment?: string }> {
    const reviewId = ensureReviewId(args.id);
    const status = ensureReviewStatus(args.status);

    if (args.comment !== undefined && !isString(args.comment)) {
      throw new Error("Expected comment to be a string.");
    }

    const payload =
      status === "resolved"
        ? {
            status,
            resolution: {
              resolvedAt: new Date().toISOString(),
              resolvedBy: this.#resolvedBy,
              ...(isString(args.comment) && args.comment.length > 0 ? { comment: args.comment } : {})
            }
          }
        : {
            status,
            resolution: null
          };
    const response = await fetch(createApiUrl(this.#baseUrl, `/api/reviews/${reviewId}`), {
      method: "PATCH",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    await expectOk(response, `Failed to update review ${reviewId}.`);
    const review = await readJsonResponse<Review>(response);

    return isString(args.comment) && args.comment.length > 0
      ? {
          ...review,
          statusComment: args.comment
        }
      : review;
  }
}

function writeMessage(message: JsonRpcResponse): void {
  const serialized = JSON.stringify(message);
  const byteLength = Buffer.byteLength(serialized, "utf8");
  process.stdout.write(`Content-Length: ${byteLength}\r\n\r\n${serialized}`);
}

function createInvalidRequestResponse(id: string | number | null, message: string): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: -32700,
      message
    }
  };
}

export function startStdioServer(options: PerilMcpServerOptions = {}): void {
  const server = new PerilMcpServer(options);
  let buffer = Buffer.alloc(0);

  process.stdin.on("data", (chunk: Buffer | string) => {
    buffer = Buffer.concat([buffer, typeof chunk === "string" ? Buffer.from(chunk) : chunk]);

    while (true) {
      const separatorIndex = buffer.indexOf("\r\n\r\n");

      if (separatorIndex === -1) {
        return;
      }

      const headerBlock = buffer.slice(0, separatorIndex).toString("utf8");
      const contentLengthHeader = headerBlock
        .split("\r\n")
        .find((line) => line.toLowerCase().startsWith("content-length:"));

      if (!contentLengthHeader) {
        buffer = buffer.slice(separatorIndex + 4);
        writeMessage(createInvalidRequestResponse(null, "Missing Content-Length header."));
        continue;
      }

      const contentLength = Number.parseInt(contentLengthHeader.split(":")[1]?.trim() ?? "", 10);

      if (!Number.isFinite(contentLength) || contentLength < 0) {
        buffer = buffer.slice(separatorIndex + 4);
        writeMessage(createInvalidRequestResponse(null, "Invalid Content-Length header."));
        continue;
      }

      const messageStart = separatorIndex + 4;
      const messageEnd = messageStart + contentLength;

      if (buffer.length < messageEnd) {
        return;
      }

      const payload = buffer.slice(messageStart, messageEnd).toString("utf8");
      buffer = buffer.slice(messageEnd);

      let parsedPayload: unknown;

      try {
        parsedPayload = JSON.parse(payload) as unknown;
      } catch (error) {
        writeMessage(createInvalidRequestResponse(null, toErrorMessage(error)));
        continue;
      }

      void server.handleJsonRpc(parsedPayload).then((response) => {
        if (response) {
          writeMessage(response);
        }
      });
    }
  });

  process.stdin.resume();
}

const isEntrypoint = process.argv[1]?.endsWith("/index.js") || process.argv[1]?.endsWith("/index.ts");

if (isEntrypoint) {
  startStdioServer();
}
