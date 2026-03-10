import { execFileSync } from "node:child_process";
import { relative, resolve, sep } from "node:path";

export interface WorktreeEntry {
  branch: string | null;
  head: string;
  path: string;
}

export interface RepoAuditResult {
  dirtyWorktrees: WorktreeEntry[];
  nestedWorktrees: WorktreeEntry[];
  unmergedBranches: string[];
}

interface AuditOptions {
  baseBranch: string;
  repoRoot: string;
}

interface ParsedArgs {
  baseBranch: string;
  repoRoot: string;
}

export function parseWorktreePorcelain(output: string): WorktreeEntry[] {
  const entries: WorktreeEntry[] = [];
  let current: Partial<WorktreeEntry> = {};

  for (const line of output.split("\n")) {
    if (!line.trim()) {
      if (current.path && current.head) {
        entries.push({
          branch: current.branch ?? null,
          head: current.head,
          path: current.path
        });
      }

      current = {};
      continue;
    }

    if (line.startsWith("worktree ")) {
      current.path = line.slice("worktree ".length);
      continue;
    }

    if (line.startsWith("HEAD ")) {
      current.head = line.slice("HEAD ".length);
      continue;
    }

    if (line.startsWith("branch ")) {
      current.branch = line.slice("branch refs/heads/".length);
    }
  }

  if (current.path && current.head) {
    entries.push({
      branch: current.branch ?? null,
      head: current.head,
      path: current.path
    });
  }

  return entries;
}

export function findNestedWorktrees(
  worktrees: WorktreeEntry[]
): WorktreeEntry[] {
  const normalizedPaths = worktrees.map((worktree) => resolve(worktree.path));

  return worktrees.filter((worktree, index) => {
    const normalizedPath = normalizedPaths[index];

    return normalizedPaths.some((candidateParentPath, candidateParentIndex) => {
      if (candidateParentIndex === index) {
        return false;
      }

      return isNestedPath(candidateParentPath, normalizedPath);
    });
  });
}

export function findDirtyWorktrees(
  worktrees: WorktreeEntry[],
  statuses: Map<string, string>
): WorktreeEntry[] {
  return worktrees.filter((worktree) => {
    const status = statuses.get(resolve(worktree.path));

    return Boolean(status && status.trim());
  });
}

export function normalizeBranchList(output: string): string[] {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .sort();
}

export function auditRepo(
  worktrees: WorktreeEntry[],
  statuses: Map<string, string>,
  unmergedBranches: string[],
  _repoRoot: string
): RepoAuditResult {
  return {
    dirtyWorktrees: findDirtyWorktrees(worktrees, statuses),
    nestedWorktrees: findNestedWorktrees(worktrees),
    unmergedBranches: [...unmergedBranches].sort()
  };
}

function parseArgs(argv: string[]): ParsedArgs {
  let baseBranch = "main";
  let repoRoot = process.cwd();

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const nextArgument = argv[index + 1];

    if ((argument === "--base" || argument === "-b") && nextArgument) {
      baseBranch = nextArgument;
      index += 1;
      continue;
    }

    if ((argument === "--repo" || argument === "-r") && nextArgument) {
      repoRoot = nextArgument;
      index += 1;
    }
  }

  return {
    baseBranch,
    repoRoot: resolve(repoRoot)
  };
}

function collectStatuses(worktrees: WorktreeEntry[]): Map<string, string> {
  const statuses = new Map<string, string>();

  for (const worktree of worktrees) {
    const normalizedPath = resolve(worktree.path);
    const output = execGit(["-C", normalizedPath, "status", "--short"], normalizedPath);
    statuses.set(normalizedPath, output);
  }

  return statuses;
}

function execGit(args: string[], cwd: string): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8"
  }).trimEnd();
}

function formatResult(result: RepoAuditResult, options: AuditOptions): string {
  const lines = [
    `Repo audit against \`${options.baseBranch}\` in \`${options.repoRoot}\``
  ];

  if (
    result.dirtyWorktrees.length === 0 &&
    result.nestedWorktrees.length === 0 &&
    result.unmergedBranches.length === 0
  ) {
    lines.push("");
    lines.push("No worktree hygiene issues found.");
    return lines.join("\n");
  }

  if (result.dirtyWorktrees.length > 0) {
    lines.push("");
    lines.push("Dirty worktrees:");

    for (const worktree of result.dirtyWorktrees) {
      lines.push(`- ${worktree.path}${worktree.branch ? ` (${worktree.branch})` : ""}`);
    }
  }

  if (result.nestedWorktrees.length > 0) {
    lines.push("");
    lines.push("Nested worktrees inside the repository root:");

    for (const worktree of result.nestedWorktrees) {
      lines.push(`- ${worktree.path}${worktree.branch ? ` (${worktree.branch})` : ""}`);
    }
  }

  if (result.unmergedBranches.length > 0) {
    lines.push("");
    lines.push(`Branches not merged into \`${options.baseBranch}\`:`);

    for (const branch of result.unmergedBranches) {
      lines.push(`- ${branch}`);
    }
  }

  return lines.join("\n");
}

function isNestedPath(parentPath: string, candidatePath: string): boolean {
  const relativePath = relative(parentPath, candidatePath);

  return relativePath.length > 0 && relativePath !== ".." && !relativePath.startsWith(`..${sep}`);
}

function main(): void {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const worktrees = parseWorktreePorcelain(
    execGit(["worktree", "list", "--porcelain"], parsedArgs.repoRoot)
  );
  const statuses = collectStatuses(worktrees);
  const unmergedBranches = normalizeBranchList(
    execGit(
      ["branch", "--format=%(refname:short)", "--no-merged", parsedArgs.baseBranch],
      parsedArgs.repoRoot
    )
  );
  const result = auditRepo(worktrees, statuses, unmergedBranches, parsedArgs.repoRoot);

  console.log(
    formatResult(result, {
      baseBranch: parsedArgs.baseBranch,
      repoRoot: parsedArgs.repoRoot
    })
  );

  if (
    result.dirtyWorktrees.length > 0 ||
    result.nestedWorktrees.length > 0 ||
    result.unmergedBranches.length > 0
  ) {
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
