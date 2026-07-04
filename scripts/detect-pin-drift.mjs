#!/usr/bin/env node

// Pin-drift detector for the automated product-status refresh (issue #87).
//
// Compares a BASE copy of src/data/product-status.json (default: the committed
// git HEAD version) against the CURRENT working copy — which the refresh script
// has just regenerated from npm — and reports whether any product VERSION pin
// actually drifted. It deliberately ignores `checkedAt`, because the refresh
// script bumps that date on every run; without this the automation would open a
// pull request every day for a no-op date change.
//
// It also enforces the hard invariant from issue #87: the automation must NEVER
// touch the human-owned `marketingReviewed` markers. If any marketingReviewed
// block differs between base and current, this script fails loudly so the
// workflow aborts rather than publishing an unreviewed claims change.
//
// Outputs (for GitHub Actions, written to $GITHUB_OUTPUT when set):
//   drift = true | false      any version pin changed
//   major = true | false      at least one change crossed a semver major
// It also writes a human-readable summary markdown used as the auto-PR body.
//
// Usage:
//   node scripts/detect-pin-drift.mjs            # base = git HEAD
//   node scripts/detect-pin-drift.mjs --base <git-ref>
//   node scripts/detect-pin-drift.mjs --base-file <path>   # base from a file (tests)

import { execFileSync } from "node:child_process";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const statusRelPath = "src/data/product-status.json";
const statusPath = path.join(rootDir, statusRelPath);
const summaryPath = path.join(rootDir, ".flow-agents/product-audits/pin-drift-summary.md");

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const baseRef = argValue("--base") ?? "HEAD";
const baseFile = argValue("--base-file");

async function loadCurrent() {
  return JSON.parse(await readFile(statusPath, "utf8"));
}

async function loadBase() {
  if (baseFile) {
    return JSON.parse(await readFile(path.resolve(baseFile), "utf8"));
  }
  try {
    const raw = execFileSync("git", ["show", `${baseRef}:${statusRelPath}`], {
      cwd: rootDir,
      encoding: "utf8",
    });
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Could not read base ${statusRelPath} from git ref '${baseRef}': ${err.message}`);
  }
}

function majorOf(version) {
  if (!version) return null;
  const major = String(version).split(".")[0];
  return Number.isNaN(Number(major)) ? null : Number(major);
}

function stableStringify(value) {
  return JSON.stringify(value ?? null);
}

const base = await loadBase();
const current = await loadCurrent();

const baseProducts = base.products ?? {};
const currentProducts = current.products ?? {};

// Hard invariant: marketingReviewed markers must be byte-identical. The refresh
// automation only ever touches version strings; any marketingReviewed change
// means something other than the mechanical refresh edited the file, so we abort.
const marketingViolations = [];
for (const key of Object.keys(currentProducts)) {
  const before = baseProducts[key]?.marketingReviewed;
  const after = currentProducts[key]?.marketingReviewed;
  if (before !== undefined && stableStringify(before) !== stableStringify(after)) {
    marketingViolations.push(key);
  }
}
if (marketingViolations.length > 0) {
  console.error(
    `ERROR marketingReviewed markers changed for [${marketingViolations.join(", ")}]. ` +
      "The automated refresh must never touch marketingReviewed — aborting.",
  );
  process.exit(2);
}

// Collect actual version drifts.
const changes = [];
for (const key of Object.keys(currentProducts)) {
  const before = baseProducts[key]?.version ?? null;
  const after = currentProducts[key]?.version ?? null;
  if (before !== after) {
    const beforeMajor = majorOf(before);
    const afterMajor = majorOf(after);
    const isMajor = beforeMajor !== null && afterMajor !== null && afterMajor !== beforeMajor;
    changes.push({
      key,
      label: currentProducts[key]?.label ?? key,
      packageName: currentProducts[key]?.packageName ?? "n/a",
      before,
      after,
      isMajor,
    });
  }
}

const drift = changes.length > 0;
const major = changes.some((c) => c.isMajor);

// Build the PR-body / summary markdown.
const lines = [];
lines.push("## Automated product-status pin refresh");
lines.push("");
if (!drift) {
  lines.push("No version drift detected against the committed pins. No pull request needed.");
} else {
  if (major) {
    lines.push("> [!WARNING]");
    lines.push("> **MAJOR CROSSED — claims re-check needed.** One or more pins crossed a");
    lines.push("> semantic-version major boundary. `marketingReviewed` markers were left");
    lines.push("> UNTOUCHED on purpose: a human must re-review the product page copy/claims");
    lines.push("> before this ships, then update `marketingReviewed` in a separate, reviewed edit.");
    lines.push("");
  }
  lines.push("| Product | Package | Pinned | Published (npm) | Bump |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const c of changes) {
    const bump = c.isMajor ? "**MAJOR**" : "minor/patch";
    lines.push(`| ${c.label} | \`${c.packageName}\` | ${c.before ?? "—"} | ${c.after ?? "—"} | ${bump} |`);
  }
  lines.push("");
  lines.push("Regenerated from the public npm registry by `npm run refresh:product-status`.");
  lines.push("`validate.mjs` expectations are derived from this same file (one source), so");
  lines.push("there is no separate lockstep bump to make.");
}
lines.push("");
const summaryMarkdown = lines.join("\n");

await mkdir(path.dirname(summaryPath), { recursive: true });
await writeFile(summaryPath, `${summaryMarkdown}\n`);

// Emit GitHub Actions outputs when running in CI.
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `drift=${drift}\nmajor=${major}\n`);
}

console.log(`drift=${drift} major=${major} changes=${changes.length}`);
console.log(`Wrote ${path.relative(rootDir, summaryPath)}`);
for (const c of changes) {
  console.log(`  ${c.key}: ${c.before ?? "—"} -> ${c.after ?? "—"}${c.isMajor ? " (MAJOR)" : ""}`);
}
