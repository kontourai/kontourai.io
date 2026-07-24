import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function isActiveGitWorktree(directory) {
  const { stdout } = await execFileAsync(
    "git",
    ["-C", directory, "rev-parse", "--is-inside-work-tree"],
    { encoding: "utf8" },
  );
  return stdout.trim() === "true";
}

export async function readLocalWorkspacePackage(packageJsonPath) {
  try {
    await access(packageJsonPath);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { state: "absent" };
    }
    throw error;
  }

  const directory = path.dirname(packageJsonPath);
  if (!(await isActiveGitWorktree(directory))) {
    return { state: "inactive" };
  }

  const source = await readFile(packageJsonPath, "utf8");
  return {
    state: "active",
    packageJson: JSON.parse(source),
  };
}
