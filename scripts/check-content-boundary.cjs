#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

const SELF = "scripts/check-content-boundary.cjs";
const REPO_ROOT = resolve(__dirname, "..");

const bannedTerms = [
  {
    label: "private vertical product name",
    pattern: new RegExp(["c", "a", "m", "p", "f", "i", "t"].join(""), "i"),
  },
  {
    // Owner decision 2026-07-12 (#74): the bare domain words are allowed —
    // they made the reference story unwritable. What stays private is the
    // repo identity itself (owner/name slug), banned in any spelling that
    // would leak it.
    label: "private regulated vertical repository slug",
    pattern: new RegExp(["brian", "anderson", "1222"].join("") + "/" + ["t", "a", "x", "e", "s"].join(""), "i"),
  },
  {
    label: "internal preview route copy",
    pattern: /internal review/i,
  },
  {
    label: "unshipped public route copy",
    pattern: /unshipped features/i,
  },
  {
    label: "non-public timeline copy",
    pattern: /timeline estimates/i,
  },
];

const ignoredPathPatterns = [
  /^node_modules\//,
  /^dist\//,
  /^build\//,
  /^\.git\//,
  /^\.astro\//,
  /^test-results\//,
  /^\.omx\//,
];

const trackedSecretPathPatterns = [
  /(?:^|\/)\.env(?:$|[.\w-])/,
  /\.(?:pem|key|p12|pfx)$/,
  /(?:^|\/)id_(?:rsa|dsa|ecdsa|ed25519)$/,
  /(?:^|\/)(?:secrets?|credentials?)(?:\.|\/|$)/i,
];

function trackedFiles() {
  const output = execFileSync("git", ["-c", `safe.directory=${REPO_ROOT}`, "ls-files", "-z"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return output.split("\0").filter(Boolean);
}

function isIgnoredPath(filePath) {
  return filePath === SELF || ignoredPathPatterns.some((pattern) => pattern.test(filePath));
}

function lineNumberFor(content, index) {
  return content.slice(0, index).split("\n").length;
}

const findings = [];

for (const filePath of trackedFiles()) {
  if (filePath.startsWith(".flow-agents/")) {
    findings.push({
      filePath,
      line: 1,
      label: "Flow Agents runtime artifact must not be tracked in this repo",
    });
    continue;
  }

  if (filePath !== ".env.example" && trackedSecretPathPatterns.some((pattern) => pattern.test(filePath))) {
    findings.push({
      filePath,
      line: 1,
      label: "secret-prone file must not be tracked in this public repo",
    });
    continue;
  }

  if (isIgnoredPath(filePath)) {
    continue;
  }

  let content;
  try {
    content = readFileSync(resolve(REPO_ROOT, filePath), "utf8");
  } catch {
    continue;
  }

  if (content.includes("\0")) {
    continue;
  }

  for (const term of bannedTerms) {
    const match = term.pattern.exec(content);
    if (match) {
      findings.push({
        filePath,
        line: lineNumberFor(content, match.index),
        label: term.label,
      });
    }
  }
}

if (findings.length > 0) {
  console.error("Content boundary check failed:");
  for (const finding of findings) {
    console.error(`- ${finding.filePath}:${finding.line} ${finding.label}`);
  }
  process.exit(1);
}

console.log("Content boundary check passed.");
