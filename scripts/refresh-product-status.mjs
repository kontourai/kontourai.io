#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const statusPath = path.join(rootDir, "src/data/product-status.json");
const registryBaseUrl = "https://registry.npmjs.org";
const dryRun = process.argv.includes("--dry-run") || process.argv.includes("--check");

const allowlistedPackages = new Map([
  ["surface", "@kontourai/surface"],
  ["survey", "@kontourai/survey"],
  ["flow", "@kontourai/flow"],
  ["veritas", "@kontourai/veritas"],
  ["flow-agents", "@kontourai/flow-agents"],
]);

const versionedPackageKeys = new Set(["surface", "survey", "flow", "veritas"]);

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchNpmLatest(packageName) {
  const url = `${registryBaseUrl}/${encodeURIComponent(packageName)}`;
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 404) {
    return { published: false };
  }
  if (!response.ok) {
    return { error: `registry returned HTTP ${response.status}` };
  }

  const metadata = await response.json();
  const latest = metadata?.["dist-tags"]?.latest;
  if (!latest) {
    return { error: "registry metadata did not include dist-tags.latest" };
  }
  return { published: true, latest };
}

function auditLine(status, result) {
  const source = result.source ? ` from ${result.source}` : "";
  const version = result.version ? `v${result.version}` : "no public package version";
  return `| ${status.label} | ${status.packageName ?? "n/a"} | ${version}${source} | ${result.note} |`;
}

const statusData = JSON.parse(await readFile(statusPath, "utf8"));
const auditRows = [];
const warnings = [];

const originalStatusData = JSON.stringify(statusData, null, 2);

if (!dryRun) {
  statusData.checkedAt = today();
}

for (const [key, packageName] of allowlistedPackages.entries()) {
  const status = statusData.products[key];
  if (!status) {
    warnings.push(`Allowlisted product ${key} is missing from product-status.json.`);
    continue;
  }

  if (status.packageName !== packageName) {
    warnings.push(`${key} package mismatch: expected ${packageName}, found ${status.packageName ?? "null"}.`);
    continue;
  }

  if (!versionedPackageKeys.has(key)) {
    auditRows.push(auditLine(status, { version: null, source: "manual public status", note: "Kept manual status; local package versions are not public release evidence for this product." }));
    continue;
  }

  try {
    const npmResult = await fetchNpmLatest(packageName);
    if (npmResult.error) {
      warnings.push(`${packageName}: ${npmResult.error}`);
      auditRows.push(auditLine(status, { version: status.version, note: "Kept existing metadata; npm lookup was inconclusive." }));
      continue;
    }

    if (npmResult.published) {
      if (!dryRun) {
        status.version = npmResult.latest;
      }
      auditRows.push(auditLine(status, { version: npmResult.latest, source: "npm dist-tags.latest", note: "Metadata updated from public npm registry." }));
      continue;
    }

    if (!dryRun) {
      status.version = null;
    }
    auditRows.push(auditLine(status, { version: null, source: "npm 404", note: "Package is not public on npm; public notes should describe reviewed distribution path." }));
  } catch (err) {
    warnings.push(`${packageName}: registry lookup failed (${err.message})`);
    auditRows.push(auditLine(status, { version: status.version, note: "Kept existing metadata; registry lookup failed." }));
  }
}

if (!dryRun) {
  await writeFile(statusPath, `${JSON.stringify(statusData, null, 2)}\n`);
}

const auditDir = path.join(rootDir, ".flow-agents/product-audits");
await mkdir(auditDir, { recursive: true });

const auditDate = dryRun ? today() : statusData.checkedAt;
const proposedStatusData = JSON.stringify(statusData, null, 2);
const metadataChanged = originalStatusData !== proposedStatusData;

const audit = `# Product Status Refresh

- Date: ${auditDate}
- Mode: ${dryRun ? "dry-run" : "write"}
- Public metadata: \`src/data/product-status.json\`
- Scope: public package/repo allowlist only
- Metadata changed: ${metadataChanged ? "yes" : "no"}

This audit intentionally stays under \`.flow-agents/\` so unclear, missing, or private follow-up notes do not become public site copy by accident.

| Product | Package | Observed public state | Action |
| --- | --- | --- | --- |
${auditRows.join("\n")}

## Warnings

${warnings.length > 0 ? warnings.map((warning) => `- ${warning}`).join("\n") : "- None."}

## Manual Follow-Up Checklist

- Confirm each product page still has a concrete public example.
- Confirm public notes do not mention private customer, prototype, or unreleased repository names.
- Promote only reviewed, public-safe facts into the marketing site.
`;

const auditPath = path.join(auditDir, `${auditDate}-product-status${dryRun ? "-dry-run" : ""}.md`);
await writeFile(auditPath, audit);

console.log(dryRun ? `Checked ${path.relative(rootDir, statusPath)} without writing metadata` : `Updated ${path.relative(rootDir, statusPath)}`);
console.log(`Wrote ${path.relative(rootDir, auditPath)}`);
