#!/usr/bin/env node
/**
 * check-receipts.mjs
 *
 * Guards the published trust receipts (issue #70):
 *   1. Every canonical bundle under src/data/receipts/*.trust.bundle.json is a
 *      structurally valid Hachure trust.bundle under the named validator
 *      @kontourai/surface's validateTrustBundle — the same tool the site tells
 *      visitors to run. If a bundle stops validating, this fails.
 *   2. The downloadable copy served from public/receipts/<slug>.trust.bundle is
 *      byte-identical to its canonical source, so the artifact a visitor
 *      downloads is exactly the one the rendered view derives from.
 *
 * Run standalone (`npm run check:receipts`) or as part of `npm run validate`.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateTrustBundle } from "@kontourai/surface";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(rootDir, "src/data/receipts");
const publicDir = path.join(rootDir, "public/receipts");

const SRC_SUFFIX = ".trust.bundle.json";
let errorCount = 0;

function error(message) {
  errorCount += 1;
  console.error(`ERROR ${message}`);
}

const sources = readdirSync(srcDir).filter((name) => name.endsWith(SRC_SUFFIX));

if (sources.length === 0) {
  error("src/data/receipts: no *.trust.bundle.json artifacts found");
}

for (const sourceName of sources.sort()) {
  const slug = sourceName.slice(0, -SRC_SUFFIX.length);
  const srcPath = path.join(srcDir, sourceName);
  const publicPath = path.join(publicDir, `${slug}.trust.bundle`);

  const srcBytes = readFileSync(srcPath);

  // 1. Validate under the named validator.
  let parsed;
  try {
    parsed = JSON.parse(srcBytes.toString("utf8"));
  } catch (err) {
    error(`${sourceName}: not valid JSON (${err.message})`);
    continue;
  }
  try {
    const bundle = validateTrustBundle(parsed);
    console.log(
      `PASS  ${slug}: valid trust.bundle (schemaVersion ${bundle.schemaVersion}, ` +
        `${bundle.claims.length} claims, ${bundle.evidence.length} evidence)`,
    );
  } catch (err) {
    error(`${sourceName}: validateTrustBundle rejected it — ${err.message}`);
    continue;
  }

  // 2. Byte-identical downloadable copy.
  let publicBytes;
  try {
    publicBytes = readFileSync(publicPath);
  } catch {
    error(`public/receipts/${slug}.trust.bundle: missing downloadable copy`);
    continue;
  }
  if (!srcBytes.equals(publicBytes)) {
    error(
      `public/receipts/${slug}.trust.bundle: does not match src/data/receipts/${sourceName} byte-for-byte`,
    );
    continue;
  }
  console.log(`PASS  ${slug}: downloadable copy matches canonical source`);
}

if (errorCount > 0) {
  console.error(`Receipt check failed with ${errorCount} error(s).`);
  process.exitCode = 1;
} else {
  console.log("Receipt check passed.");
}
