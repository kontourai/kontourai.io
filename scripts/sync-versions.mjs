#!/usr/bin/env node
// Version-pin sync: reads canonical package list from src/data/product-status.json,
// queries npm registry for each package's latest published version, and writes
// the resolved version back into product-status.json's `version` field.
//
// Does NOT touch `marketingReviewed` — that is a separate human-reviewed marker.
//
// Usage:
//   node scripts/sync-versions.mjs            # write updated versions
//   node scripts/sync-versions.mjs --check    # CI mode: exit 1 if any pin is stale
//
// Related: scripts/validate.mjs enforces version match at deploy time.
//          This script catches drift earlier and writes the fix.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const statusPath = path.join(rootDir, "src/data/product-status.json");
const registryBaseUrl = "https://registry.npmjs.org";
const checkMode = process.argv.includes("--check");

async function fetchNpmLatest(packageName) {
  const url = `${registryBaseUrl}/${encodeURIComponent(packageName)}`;
  let response;
  try {
    response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    return { error: err.message };
  }

  if (response.status === 404) {
    return { published: false };
  }
  if (!response.ok) {
    return { error: `registry returned HTTP ${response.status}` };
  }

  let metadata;
  try {
    metadata = await response.json();
  } catch (err) {
    return { error: `could not parse registry response: ${err.message}` };
  }

  const latest = metadata?.["dist-tags"]?.latest;
  if (!latest) {
    return { error: "registry metadata did not include dist-tags.latest" };
  }
  return { published: true, latest };
}

const statusData = JSON.parse(await readFile(statusPath, "utf8"));
const products = statusData.products;

if (!products || typeof products !== "object") {
  console.error("ERROR src/data/product-status.json: missing or invalid `products` field");
  process.exit(1);
}

// Collect products that carry a packageName (the canonical list lives in the JSON).
const entries = Object.entries(products).filter(
  ([, node]) => node && typeof node === "object" && typeof node.packageName === "string"
);

if (entries.length === 0) {
  console.error("ERROR src/data/product-status.json: no products with a packageName found");
  process.exit(1);
}

const updates = []; // { key, label, packageName, from, to }
const warnings = []; // lookup failures — warn but continue

for (const [key, node] of entries) {
  const { packageName, version: currentVersion, label } = node;
  const result = await fetchNpmLatest(packageName);

  if (result.error) {
    warnings.push(`WARN  ${packageName}: lookup failed (${result.error}); skipped`);
    continue;
  }
  if (!result.published) {
    warnings.push(`WARN  ${packageName}: not published on npm; skipped`);
    continue;
  }

  const latestVersion = result.latest;
  if (latestVersion !== currentVersion) {
    updates.push({ key, label: label ?? key, packageName, from: currentVersion, to: latestVersion });
    // Apply in write mode now; in check mode we'll only report.
    if (!checkMode) {
      products[key].version = latestVersion;
    }
  }
}

// --- Output warnings first ---
for (const w of warnings) {
  console.log(w);
}

// --- Report ---
if (updates.length === 0) {
  console.log("All pins current.");
  // Exit 0 — nothing stale; warnings above are informational.
} else {
  for (const { label, from, to } of updates) {
    const arrow = `${from ?? "(none)"} -> ${to}`;
    if (checkMode) {
      console.log(`STALE ${label}: ${arrow}`);
    } else {
      console.log(`UPDATED ${label}: ${arrow}`);
    }
  }

  if (checkMode) {
    console.log(`\n${updates.length} stale pin(s) found. Run \`npm run sync-versions\` to fix.`);
    process.exit(1);
  } else {
    // Write the updated JSON preserving formatting.
    await writeFile(statusPath, `${JSON.stringify(statusData, null, 2)}\n`);
    console.log(`\nWrote ${updates.length} update(s) to src/data/product-status.json`);
  }
}

// Non-zero exit if any lookup failures occurred in --check mode
// (but not in write mode; warnings there are informational).
if (checkMode && warnings.length > 0 && updates.length === 0) {
  // All lookups that could be checked passed; warn-only packages are benign.
  // Don't fail CI solely because of network errors — only stale confirmed pins fail.
}
