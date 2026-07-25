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
    label: "private evaluation repository link",
    pattern: /github\.com\/kontourai\/evals/i,
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

const primaryProductMarketingPages = new Set([
  "src/pages/builder-kit.astro",
  "src/pages/console.astro",
  "src/pages/fieldwork.astro",
  "src/pages/flow-agents.astro",
  "src/pages/flow.astro",
  "src/pages/knowledge-kit.astro",
  "src/pages/memory.astro",
  "src/pages/surface.astro",
  "src/pages/survey.astro",
]);

const marketingSelfReminderPatterns = [
  {
    label: "product marketing section is organized as an internal boundary memo",
    pattern: /<!--\s*Boundary\s*-->/i,
  },
  {
    label: "product marketing data is organized around internal boundary ownership",
    pattern: /const\s+(?:boundary|boundaries|notReplace)\b/,
  },
  {
    label: "product marketing heading leads with what the product does not do",
    pattern: /<Eyebrow[^>]*>\s*What\s+[^<]+\s+does\s+not\b/i,
  },
  {
    label: "product marketing includes an architecture disclaimer",
    pattern: /\b(?:does not|doesn't|do not|don't)\s+(?:own|replace|index)\b|\b(?:does not|doesn't)\s+become\s+(?:the\s+)?(?:authority|source of truth)\b/i,
  },
  {
    label: "product marketing includes an ownership reminder",
    pattern: /\bstays?\s+the\s+(?:authority|source of truth)\b/i,
  },
  {
    label: "product marketing includes an internal engine-boundary reminder",
    pattern: /\bengine\s+stays\s+neutral\b/i,
  },
  {
    label: "product marketing leads with architecture history",
    pattern: /\bcontracts?\s+first\b/i,
  },
  {
    label: "product marketing defines value by architecture negation",
    pattern: /\b(?:is|are)\s+an?\s+[^.\n]{0,40},\s+not\s+an?\s+/i,
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

function gitFiles(args) {
  const output = execFileSync("git", ["-c", `safe.directory=${REPO_ROOT}`, ...args, "-z"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  return output.split("\0").filter(Boolean);
}

const trackedPaths = new Set(gitFiles(["ls-files"]));
const repositoryFiles = [
  ...new Set([
    ...trackedPaths,
    ...gitFiles(["ls-files", "--others", "--exclude-standard"]),
  ]),
];

function isIgnoredPath(filePath) {
  return filePath === SELF || ignoredPathPatterns.some((pattern) => pattern.test(filePath));
}

function lineNumberFor(content, index) {
  return content.slice(0, index).split("\n").length;
}

const findings = [];

for (const filePath of repositoryFiles) {
  if (filePath.startsWith("context/")) {
    if (trackedPaths.has(filePath)) {
      findings.push({
        filePath,
        line: 1,
        label: "private runtime context must not be tracked in this public repo",
      });
    }
    continue;
  }

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

  if (primaryProductMarketingPages.has(filePath)) {
    for (const term of marketingSelfReminderPatterns) {
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
}

if (findings.length > 0) {
  console.error("Content boundary check failed:");
  for (const finding of findings) {
    console.error(`- ${finding.filePath}:${finding.line} ${finding.label}`);
  }
  process.exit(1);
}

console.log("Content boundary check passed.");
