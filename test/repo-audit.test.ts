import { describe, expect, it } from "vitest";

import {
  auditRepo,
  findDirtyWorktrees,
  findNestedWorktrees,
  normalizeBranchList,
  parseWorktreePorcelain,
  type WorktreeEntry
} from "../scripts/repo-audit";

describe("repo audit helpers", () => {
  it("parses git worktree porcelain output", () => {
    const output = [
      "worktree /repo",
      "HEAD a83ae90",
      "branch refs/heads/main",
      "",
      "worktree /repo-worktrees/per-86",
      "HEAD 1234567",
      "branch refs/heads/chore/per-86-integration",
      ""
    ].join("\n");

    expect(parseWorktreePorcelain(output)).toEqual<WorktreeEntry[]>([
      {
        branch: "main",
        head: "a83ae90",
        path: "/repo"
      },
      {
        branch: "chore/per-86-integration",
        head: "1234567",
        path: "/repo-worktrees/per-86"
      }
    ]);
  });

  it("flags nested worktrees under the repository root", () => {
    const worktrees: WorktreeEntry[] = [
      {
        branch: "main",
        head: "a83ae90",
        path: "/repo"
      },
      {
        branch: "feature/per-85-marketing-strategy-docs",
        head: "996def0",
        path: "/repo/agents/cmo/worktrees/peril/per-85-marketing-docs"
      },
      {
        branch: "chore/per-86-integration",
        head: "1234567",
        path: "/repo-worktrees/per-86"
      }
    ];

    expect(findNestedWorktrees(worktrees)).toEqual([worktrees[1]]);
  });

  it("flags dirty worktrees from collected status output", () => {
    const worktrees: WorktreeEntry[] = [
      {
        branch: "main",
        head: "a83ae90",
        path: "/repo"
      },
      {
        branch: "feature/per-24-comment-composer",
        head: "e81c8fc",
        path: "/repo-worktrees/per-24"
      }
    ];
    const statuses = new Map<string, string>([
      ["/repo", ""],
      ["/repo-worktrees/per-24", " M packages/core/src/overlay.ts"]
    ]);

    expect(findDirtyWorktrees(worktrees, statuses)).toEqual([worktrees[1]]);
  });

  it("normalizes unmerged branch output", () => {
    expect(normalizeBranchList("feature/per-45-scaffold-site\n\nworktree-per-50-a11y-baseline\n"))
      .toEqual(["feature/per-45-scaffold-site", "worktree-per-50-a11y-baseline"]);
  });

  it("builds an aggregate repo audit result", () => {
    const worktrees: WorktreeEntry[] = [
      {
        branch: "main",
        head: "a83ae90",
        path: "/repo"
      },
      {
        branch: "feature/per-24-comment-composer",
        head: "e81c8fc",
        path: "/repo-worktrees/per-24"
      },
      {
        branch: "feature/per-85-marketing-strategy-docs",
        head: "996def0",
        path: "/repo/agents/cmo/worktrees/peril/per-85-marketing-docs"
      }
    ];
    const statuses = new Map<string, string>([
      ["/repo", ""],
      ["/repo-worktrees/per-24", " M packages/core/src/overlay.ts"],
      ["/repo/agents/cmo/worktrees/peril/per-85-marketing-docs", ""]
    ]);

    expect(
      auditRepo(worktrees, statuses, ["feature/per-24-comment-composer"], "/repo")
    ).toEqual({
      dirtyWorktrees: [worktrees[1]],
      nestedWorktrees: [worktrees[2]],
      unmergedBranches: ["feature/per-24-comment-composer"]
    });
  });
});
