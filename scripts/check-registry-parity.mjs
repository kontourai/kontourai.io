#!/usr/bin/env node
/**
 * check-registry-parity.mjs (issue #3)
 *
 * The authoritative registry-parity gate, designed to run BEFORE `npm ci`,
 * the build, or any test step — i.e. before any PR-controlled code has
 * executed in the job. It is deliberately dependency-free (node built-ins +
 * global fetch only) so nothing installed or generated in-job can influence
 * it, closing the in-job code-execution laundering path that a mode gate
 * inside `npm run validate` cannot close (build/tests run PR code first and
 * could rewrite the compared inputs or the validator).
 *
 * Checks (same set `scripts/validate.mjs` also enforces later, as
 * defense-in-depth):
 *   1. Every versioned product's advertised version matches npm dist-tags
 *      latest.
 *   2. flow-agents publish-state vs the page's advertised install path.
 *
 * Mode: VALIDATE_REGISTRY_PARITY=strict (default) errors; =warn downgrades
 * to warnings — the PR lane sets warn via a changed-files guard unless the
 * PR touched parity-sensitive inputs. Registry/network failures are warnings
 * in both modes (same posture as validate.mjs).
 *
 * Known residual (disclosed on /trust and tracked for repo-level workflow
 * protection): a PR that edits this script or the workflow definitions can
 * defeat any in-repo check; that boundary predates this gate and can only be
 * closed by owner-review protection on CI files, not by more checks.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryBaseUrl = "https://registry.npmjs.org";
const mode = process.env.VALIDATE_REGISTRY_PARITY === "warn" ? "warn" : "strict";

let errorCount = 0;
function issue(message) {
  if (mode === "warn") {
    console.log(`WARN  ${message} (non-blocking: VALIDATE_REGISTRY_PARITY=warn)`);
  } else {
    errorCount += 1;
    console.error(`ERROR ${message}`);
  }
}
function warn(message) {
  console.log(`WARN  ${message}`);
}

const statusData = JSON.parse(
  readFileSync(path.join(rootDir, "src/data/product-status.json"), "utf8"),
);

async function fetchNpmLatest(packageName) {
  const url = `${registryBaseUrl}/${encodeURIComponent(packageName)}`;
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (response.status === 404) return { published: false };
  if (!response.ok) return { error: `registry returned HTTP ${response.status}` };
  const body = await response.json();
  const latest = body?.["dist-tags"]?.latest;
  if (!latest) return { error: "registry metadata did not include dist-tags.latest" };
  return { published: true, latest };
}

const versionedPackages = [
  { key: "veritas", name: "@kontourai/veritas" },
  { key: "surface", name: "@kontourai/surface" },
  { key: "survey", name: "@kontourai/survey" },
  { key: "flow", name: "@kontourai/flow" },
  { key: "flow-agents", name: "@kontourai/flow-agents" },
  { key: "console", name: "@kontourai/console" },
];

for (const { key, name } of versionedPackages) {
  const advertised = statusData.products?.[key]?.version;
  if (!advertised) {
    issue(`${key}: missing public version for ${name} in product-status.json`);
    continue;
  }
  let result;
  try {
    result = await fetchNpmLatest(name);
  } catch (err) {
    warn(`${name}: registry check skipped (${err.message})`);
    continue;
  }
  if (result.error) {
    warn(`${name}: ${result.error}; public version not rechecked`);
    continue;
  }
  if (!result.published) {
    warn(`${name}: not published on npm; metadata v${advertised} requires manual review`);
    continue;
  }
  if (result.latest !== advertised) {
    issue(`${name}: metadata v${advertised} does not match npm latest v${result.latest}`);
    continue;
  }
  console.log(`PASS  ${name}: metadata v${advertised} matches npm latest`);
}

// flow-agents publish-state vs advertised install path (page source as text).
{
  const pageFile = "src/pages/flow-agents.astro";
  const source = readFileSync(path.join(rootDir, pageFile), "utf8");
  const advertisesGithubInstall = /install\.sh/.test(source);
  const advertisesNpmInstall = /(npm install|npx)[^<]*flow-agents/.test(source);
  try {
    const result = await fetchNpmLatest("@kontourai/flow-agents");
    if (result.error) {
      warn(`@kontourai/flow-agents: ${result.error}`);
    } else if (result.published && !advertisesNpmInstall) {
      issue(`@kontourai/flow-agents: published (v${result.latest}) but ${pageFile} does not advertise the npm install`);
    } else if (!result.published && !advertisesGithubInstall) {
      issue(`${pageFile}: Flow Agents is unpublished but the page does not show the install.sh path`);
    } else {
      console.log(`PASS  @kontourai/flow-agents: publish state matches the page's advertised install path`);
    }
  } catch (err) {
    warn(`@kontourai/flow-agents: registry check skipped (${err.message})`);
  }
}

if (errorCount > 0) {
  console.error(`Registry parity failed with ${errorCount} error(s) (mode: ${mode}).`);
  process.exitCode = 1;
} else {
  console.log(`Registry parity passed (mode: ${mode}).`);
}
