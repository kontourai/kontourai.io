#!/usr/bin/env node
/**
 * check-playwright-pin.mjs
 *
 * The rendered-test CI job (.github/workflows/deploy.yml) runs inside a pinned
 * Playwright container image (mcr.microsoft.com/playwright:vX.Y.Z-noble) whose
 * bundled browsers must match the @playwright/test version in package.json. When
 * they drift — e.g. a Dependabot bump of @playwright/test without a matching
 * image-tag bump — `browserType.launch` fails in CI because the browser build the
 * new client expects doesn't exist in the old image. This guard asserts the two
 * versions match so that class of failure is caught in `validate` (locally and in
 * Trust Verify) instead of only in the rendered-test job.
 *
 * Run standalone: `npm run check:playwright-pin`.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const pkg = JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf8"));
const pwSpec =
  pkg.devDependencies?.["@playwright/test"] ?? pkg.dependencies?.["@playwright/test"] ?? "";
const pwVersion = pwSpec.replace(/^[^0-9]*/, "").trim(); // strip range prefix (^, ~, >=)

const workflowPath = path.join(rootDir, ".github/workflows/deploy.yml");
const workflow = readFileSync(workflowPath, "utf8");
const imageMatch = workflow.match(
  /mcr\.microsoft\.com\/playwright:v([0-9]+\.[0-9]+\.[0-9]+)-noble/,
);

let errorCount = 0;
if (!pwVersion) {
  console.error("ERROR @playwright/test version not found in package.json");
  errorCount += 1;
}
if (!imageMatch) {
  console.error(
    "ERROR playwright container image tag (mcr.microsoft.com/playwright:vX.Y.Z-noble) not found in .github/workflows/deploy.yml",
  );
  errorCount += 1;
}

if (pwVersion && imageMatch && pwVersion !== imageMatch[1]) {
  console.error(
    `ERROR playwright version mismatch: package.json @playwright/test=${pwVersion} but ` +
      `deploy.yml container image=v${imageMatch[1]}-noble.\n` +
      `      Bump the container image tag in .github/workflows/deploy.yml to ` +
      `mcr.microsoft.com/playwright:v${pwVersion}-noble (or align package.json).`,
  );
  errorCount += 1;
}

if (errorCount > 0) process.exit(1);
console.log(
  `PASS  check-playwright-pin: @playwright/test ${pwVersion} matches deploy.yml image v${imageMatch[1]}-noble`,
);
