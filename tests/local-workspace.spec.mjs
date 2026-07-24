import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";
import {
  isActiveGitWorktree,
  readLocalWorkspacePackage,
} from "../scripts/local-workspace.mjs";

const execFileAsync = promisify(execFile);

test("local workspace detection distinguishes worktrees, bare repositories, and invalid paths", async () => {
  const root = await mkdtemp(join(tmpdir(), "kontour-local-workspace-"));
  const worktree = join(root, "worktree");
  const bare = join(root, "bare.git");

  try {
    await mkdir(worktree);
    await execFileAsync("git", ["init", "-q"], { cwd: worktree });
    await execFileAsync("git", ["init", "-q", "--bare", bare]);

    await expect(isActiveGitWorktree(worktree)).resolves.toBe(true);
    await expect(isActiveGitWorktree(bare)).resolves.toBe(false);
    await expect(isActiveGitWorktree(join(root, "missing"))).rejects.toThrow();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("workspace package loading never parses bare snapshots and fails closed in active worktrees", async () => {
  const root = await mkdtemp(join(tmpdir(), "kontour-workspace-package-"));
  const worktree = join(root, "worktree");
  const bare = join(root, "bare.git");

  try {
    await mkdir(worktree);
    await execFileAsync("git", ["init", "-q"], { cwd: worktree });
    await execFileAsync("git", ["init", "-q", "--bare", bare]);

    const activeManifest = join(worktree, "package.json");
    const bareManifest = join(bare, "package.json");
    await writeFile(activeManifest, JSON.stringify({ name: "active", version: "1.0.0" }));
    await writeFile(bareManifest, "{ malformed stale snapshot");

    await expect(readLocalWorkspacePackage(activeManifest)).resolves.toEqual({
      state: "active",
      packageJson: { name: "active", version: "1.0.0" },
    });
    await expect(readLocalWorkspacePackage(bareManifest)).resolves.toEqual({
      state: "inactive",
    });
    await expect(readLocalWorkspacePackage(join(root, "missing", "package.json"))).resolves.toEqual({
      state: "absent",
    });

    await writeFile(activeManifest, "{ malformed active checkout");
    await expect(readLocalWorkspacePackage(activeManifest)).rejects.toThrow();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
