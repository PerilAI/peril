import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { locatorPriority } from "../packages/core/src/index";
import { listToolNames } from "../packages/mcp/src/index";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const agentsDocument = readFileSync(resolve(repoRoot, "AGENTS.md"), "utf8");
const dataModelDocument = readFileSync(resolve(repoRoot, "docs/DATA_MODEL.md"), "utf8");
const harnessDocument = readFileSync(resolve(repoRoot, "docs/HARNESS.md"), "utf8");
const reactSetupDocument = readFileSync(
  resolve(repoRoot, "packages/site/src/docs/content/react/setup.mdx"),
  "utf8"
);
const reactHooksDocument = readFileSync(
  resolve(repoRoot, "packages/site/src/docs/content/react/hooks.mdx"),
  "utf8"
);
const reactComponentsDocument = readFileSync(
  resolve(repoRoot, "packages/site/src/docs/content/react/components.mdx"),
  "utf8"
);
const installationDocument = readFileSync(
  resolve(repoRoot, "packages/site/src/docs/content/installation.mdx"),
  "utf8"
);
const introductionDocument = readFileSync(
  resolve(repoRoot, "packages/site/src/docs/content/introduction.mdx"),
  "utf8"
);
const quickStartDocument = readFileSync(
  resolve(repoRoot, "packages/site/src/docs/content/quick-start.mdx"),
  "utf8"
);
const troubleshootingDocument = readFileSync(
  resolve(repoRoot, "packages/site/src/docs/content/troubleshooting.mdx"),
  "utf8"
);
const mcpConfigurationDocument = readFileSync(
  resolve(repoRoot, "packages/site/src/docs/content/mcp/configuration.mdx"),
  "utf8"
);
const mcpToolsDocument = readFileSync(
  resolve(repoRoot, "packages/site/src/docs/content/mcp/tools.mdx"),
  "utf8"
);
const restApiDocument = readFileSync(
  resolve(repoRoot, "packages/site/src/docs/content/api/rest.mdx"),
  "utf8"
);
const apiModelsDocument = readFileSync(
  resolve(repoRoot, "packages/site/src/docs/content/api/models.mdx"),
  "utf8"
);
const footerComponentSource = readFileSync(
  resolve(repoRoot, "packages/site/src/components/Footer.tsx"),
  "utf8"
);
const repoMcpConfig = JSON.parse(readFileSync(resolve(repoRoot, ".mcp.json"), "utf8")) as {
  mcpServers?: Record<string, { command?: string; args?: string[] }>;
};
const agentInstructionPaths = [
  "agents/ceo/AGENTS.md",
  "agents/cpo/AGENTS.md",
  "agents/frontend-engineer/AGENTS.md",
  "agents/qa-engineer/AGENTS.md"
];

function getSection(document: string, heading: string): string {
  const lines = document.split("\n");
  const startIndex = lines.findIndex((line) => line.trim() === `## ${heading}`);

  if (startIndex === -1) {
    throw new Error(`Expected section "## ${heading}" to exist.`);
  }

  const sectionLines: string[] = [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith("## ")) {
      break;
    }

    sectionLines.push(lines[index]);
  }

  return sectionLines.join("\n").trim();
}

function extractBacktickItems(section: string): string[] {
  return [...section.matchAll(/^- `([^`]+)`/gm)].map((match) => match[1]);
}

describe("repository harness", () => {
  it("keeps key reference files in AGENTS.md present on disk", () => {
    const keyReferencePaths = extractBacktickItems(
      getSection(agentsDocument, "Key Reference Files")
    ).filter((item) => item.endsWith(".md"));

    expect(keyReferencePaths.length).toBeGreaterThan(0);

    for (const relativePath of keyReferencePaths) {
      expect(
        existsSync(resolve(repoRoot, relativePath)),
        `${relativePath} should exist`
      ).toBe(true);
    }
  });

  it("keeps the documented package structure aligned with the workspace", () => {
    const workspacePackages = readdirSync(resolve(repoRoot, "packages"))
      .filter((entry) => existsSync(resolve(repoRoot, "packages", entry, "package.json")))
      .sort();
    const documentedPackages = [
      ...getSection(agentsDocument, "Package Structure").matchAll(/^\s+([a-z]+)\/\s+#/gm)
    ]
      .map((match) => match[1])
      .sort();

    expect(documentedPackages).toEqual(workspacePackages);
  });

  it("keeps locator priority aligned across code and docs", () => {
    const locatorOrderText = locatorPriority.join(" > ");
    const agentsMatch = agentsDocument.match(/Locator bundle order matters:\s*([^\n]+)/);
    const documentedLocatorOrder = [
      ...getSection(dataModelDocument, "Locator Strategy Priority").matchAll(
        /\d+\.\s+`([^`]+)`/g
      )
    ].map((match) => match[1]);
    const normalizedAgentsLocatorOrder = agentsMatch?.[1]
      .replace(/\s*\([^)]*\)\s*$/, "")
      .trim();

    expect(normalizedAgentsLocatorOrder).toBe(locatorOrderText);
    expect(documentedLocatorOrder).toEqual([...locatorPriority]);
    expect(harnessDocument).toContain(locatorOrderText);
  });

  it("keeps MCP tool names aligned across code and docs", () => {
    const toolNames = listToolNames();
    const agentsToolNames = extractBacktickItems(getSection(agentsDocument, "MCP Tools"));
    const documentedToolNames = [
      ...dataModelDocument.matchAll(/^### `([^`]+)`$/gm)
    ].map((match) => match[1]);

    expect(agentsToolNames).toEqual(toolNames);
    expect(documentedToolNames).toEqual(toolNames);
  });

  it("keeps public React docs aligned with the shipped React API", () => {
    const reactDocs = [
      installationDocument,
      introductionDocument,
      quickStartDocument,
      troubleshootingDocument,
      reactSetupDocument,
      reactHooksDocument,
      reactComponentsDocument
    ].join("\n");

    expect(reactDocs).toContain("serverUrl=");
    expect(reactDocs).not.toContain("endpoint=");
    expect(reactDocs).not.toContain("captureScreenshots");
    expect(reactDocs).not.toContain("locatorStrategy");
    expect(reactDocs).not.toContain("useReviews");
    expect(reactDocs).not.toContain("ReviewOverlay");
    expect(reactDocs).not.toContain("CommentComposer");
    expect(reactHooksDocument).toContain("enabled");
    expect(reactHooksDocument).toContain("setEnabled");
    expect(reactHooksDocument).toContain("serverUrl");
    expect(reactComponentsDocument).toContain("useReviewMode()");
  });

  it("keeps public MCP and API docs aligned with the shipped server contracts", () => {
    const mcpDocs = [mcpConfigurationDocument, mcpToolsDocument].join("\n");
    const apiDocs = [restApiDocument, apiModelsDocument].join("\n");

    expect(mcpDocs).toContain("startStdioServer");
    expect(mcpDocs).toContain("PerilMcpServer");
    expect(mcpDocs).toContain("PERIL_SERVER_URL");
    expect(mcpDocs).not.toContain("createMCPServer");
    expect(mcpDocs).not.toContain("perilEndpoint");
    expect(mcpDocs).not.toContain("peril-mcp --port");
    expect(mcpDocs).not.toContain("peril-server --port");
    expect(restApiDocument).toContain("Type is `elementScreenshot`");
    expect(apiDocs).toContain('@peril-ai/server');
    expect(apiDocs).toContain('type ReviewStatus = "open" | "in_progress" | "resolved" | "wont_fix"');
    expect(apiDocs).toContain("elementScreenshot");
    expect(apiDocs).toContain("pageScreenshot");
    expect(apiDocs).not.toContain("dismissed");
    expect(apiDocs).not.toContain("createdAt");
    expect(apiDocs).not.toContain("updatedAt");
  });

  it("keeps local MCP wiring and install snippets aligned with the current repo setup", () => {
    expect(repoMcpConfig).toEqual({
      mcpServers: {
        peril: {
          command: "pnpm",
          args: ["exec", "tsx", "packages/mcp/src/bin.ts"]
        }
      }
    });
    expect(footerComponentSource).not.toContain("@anthropic/peril");
    expect(footerComponentSource).toContain("@peril-ai/react");
    expect(footerComponentSource).toContain("@peril-ai/server");
    expect(footerComponentSource).toContain("@peril-ai/mcp");
    expect(harnessDocument).toContain("public React, MCP, and REST/API docs reference");
    expect(harnessDocument).toContain("repo-root MCP configuration exists");
    expect(harnessDocument).toContain("real `@peril-ai/*` package");
  });

  it("keeps custom worktree guidance present in repo and agent instructions", () => {
    expect(agentsDocument).toContain("dedicated custom git worktree");
    expect(agentsDocument).toContain("$AGENT_HOME/worktrees/peril/<ticket-or-branch>");
    expect(agentsDocument).toContain("## Merge-Close Checklist");
    expect(agentsDocument).toContain("merge the task branch back into `main`");
    expect(agentsDocument).toContain("Never leave orphaned or abandoned worktrees.");
    expect(agentsDocument).toContain("pnpm repo:audit -- --base main");
    expect(harnessDocument).toContain("merge-back-to-`main` requirement");
    expect(harnessDocument).toContain("pnpm repo:audit -- --base main");

    for (const relativePath of agentInstructionPaths) {
      const document = readFileSync(resolve(repoRoot, relativePath), "utf8");

      expect(
        document,
        `${relativePath} should require a custom git worktree path`
      ).toContain("custom git worktree");
      expect(
        document,
        `${relativePath} should show the agent-scoped worktree convention`
      ).toContain("$AGENT_HOME/worktrees/peril/<ticket-or-branch>");
      expect(
        document,
        `${relativePath} should require completed worktrees to merge back into main`
      ).toContain("Merge each completed task branch back into `main`");
      expect(
        document,
        `${relativePath} should document recovery branches when work cannot merge`
      ).toContain("named recovery branch");
    }
  });
});
