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
const agentInstructionPaths = [
  "agents/ceo/AGENTS.md",
  "agents/cpo/AGENTS.md",
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

  it("keeps custom worktree guidance present in repo and agent instructions", () => {
    expect(agentsDocument).toContain("dedicated custom git worktree");
    expect(agentsDocument).toContain("$AGENT_HOME/worktrees/peril/<ticket-or-branch>");

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
    }
  });
});
