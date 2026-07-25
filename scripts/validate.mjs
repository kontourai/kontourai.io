#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { readLocalWorkspacePackage } from "./local-workspace.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryBaseUrl = "https://registry.npmjs.org";

// Registry-parity mode (issue #3): "strict" (default) treats an advertised
// version that lags npm latest as an ERROR; "warn" downgrades ONLY that
// live-registry mismatch to a warning. PR validation runs in warn mode so an
// out-of-band package release (e.g. console 2.0.0 -> 2.0.1 in one day) can't
// turn every open PR red — keeping drift-chasing where it belongs, in the
// scheduled Pin Refresh automation and the strict main/deploy lane. All
// repo-internal checks (missing metadata, page/metadata mismatch, sibling
// manifest drift) stay errors in both modes.
const registryParityMode = process.env.VALIDATE_REGISTRY_PARITY === "warn" ? "warn" : "strict";

function registryParityIssue(message) {
  if (registryParityMode === "warn") {
    warn(`${message} (non-blocking: VALIDATE_REGISTRY_PARITY=warn; the scheduled Pin Refresh lane owns drift)`);
  } else {
    error(message);
  }
}
const statusData = JSON.parse(await readFile(path.join(rootDir, "src/data/product-status.json"), "utf8"));

let errorCount = 0;

function error(message) {
  errorCount += 1;
  console.error(`ERROR ${message}`);
}

function warn(message) {
  console.log(`WARN  ${message}`);
}

// Packages whose advertised version badge must match public metadata when
// registry access is available. Local workspace packages listed in
// localWorkspacePackages must also match their sibling package manifests.
const versionedPackages = [
  // Veritas' terminal blocks cite the version whose real output they show —
  // capture provenance, same rule as survey and fieldwork below.
  { key: "veritas", name: "@kontourai/veritas", page: "src/pages/veritas.astro", allowsPinnedEvidence: true },
  { key: "surface", name: "@kontourai/surface", page: "src/pages/surface.astro" },
  // Survey's terminal blocks cite the version that produced their output. That
  // is capture provenance, not status copy: deriving it from product-status
  // would re-stamp the citation at every release without a re-run, which is
  // exactly the defect the screenshot captions had. Displayed package status
  // must still come from product-status.
  { key: "survey", name: "@kontourai/survey", page: "src/pages/survey.astro", allowsPinnedEvidence: true },
  { key: "flow", name: "@kontourai/flow", page: "src/pages/flow.astro" },
  { key: "flow-agents", name: "@kontourai/flow-agents", page: "src/pages/flow-agents.astro" },
  { key: "console", name: "@kontourai/console", page: "src/pages/console.astro" },
  // Fieldwork cites its immutable 0.2.4 release evidence directly. Its current
  // displayed package status is still required to come from product-status.
  { key: "fieldwork", name: "@kontourai/fieldwork", page: "src/pages/fieldwork.astro", allowsPinnedEvidence: true },
];

// Local workspace packages. Their version expectation is DERIVED from
// src/data/product-status.json — the single generated source of truth that
// scripts/refresh-product-status.mjs refreshes from npm. There is intentionally
// no separately-committed expectedVersion literal here: that duplicated copy is
// exactly what drifted out of lockstep and broke CI fleet-wide (issue #87).
// When a sibling workspace checkout is present we still assert the sibling
// package.json agrees with the generated metadata; when it is absent (the normal
// CI case) npm parity is enforced independently in versionedPackages below.
const localWorkspacePackages = [
  { key: "surface", packageFile: "../surface/package.json" },
  { key: "survey", packageFile: "../survey/package.json" },
];

let viteServer;

async function loadProductCatalog() {
  viteServer = await createServer({
    root: rootDir,
    logLevel: "silent",
    server: { middlewareMode: true },
    appType: "custom",
  });
  return viteServer.ssrLoadModule("/src/lib/products.ts");
}

async function assertPageUsesProductStatus(pageFile, key, version, allowsPinnedEvidence = false) {
  const source = await readFile(path.join(rootDir, pageFile), "utf8");
  if (!source.includes("product-status") || !source.includes(`getProductStatus('${key}')`)) {
    error(`${pageFile}: does not derive ${key} status from src/data/product-status.json`);
  }

  if (!allowsPinnedEvidence && version && (source.includes(version) || source.includes(`v${version}`))) {
    error(`${pageFile}: hard-coded version/status copy remains (${version}); derive it from product-status metadata`);
  }
}

function assertUniqueKeys(keys, label) {
  const seen = new Set();
  for (const key of keys) {
    if (seen.has(key)) {
      error(`${label}: duplicate product key ${key}`);
    }
    seen.add(key);
  }
}

async function checkProductCatalogCoverage(catalog) {
  const productKeys = catalog.products.map((product) => product.key);
  const applicationKeys = catalog.applications.map((application) => application.key);
  const referenceKeys = catalog.referencedPackages.map((reference) => reference.key);
  // Referenced packages carry status but no page/nav/homepage obligations.
  const catalogKeys = [...productKeys, ...applicationKeys, ...referenceKeys];
  const statusKeys = Object.keys(statusData.products);
  const homepageKeys = catalog.homepageProducts.map((product) => product.key);

  assertUniqueKeys(productKeys, "src/lib/products.ts products");
  assertUniqueKeys(applicationKeys, "src/lib/products.ts applications");
  assertUniqueKeys(catalogKeys, "src/lib/products.ts products and applications");
  assertUniqueKeys(homepageKeys, "src/lib/products.ts homepageProducts");

  const requiredApplicationKeys = ["fieldwork"];
  for (const key of requiredApplicationKeys) {
    if (!applicationKeys.includes(key)) {
      error(`src/lib/products.ts: missing required application catalog entry ${key}`);
    }
    if (productKeys.includes(key)) {
      error(`src/lib/products.ts: application ${key} must not be represented as a primitive product`);
    }
  }

  for (const key of catalogKeys) {
    if (!statusData.products[key]) {
      error(`src/data/product-status.json: missing catalog status for ${key}`);
    }
  }
  for (const key of statusKeys) {
    if (!catalogKeys.includes(key)) {
      error(`src/lib/products.ts: missing catalog product or application for status entry ${key}`);
    }
  }
  for (const key of productKeys) {
    if (!homepageKeys.includes(key)) {
      error(`src/lib/products.ts: homepageProducts omits catalog product ${key}`);
    }
  }

  for (const application of catalog.applications) {
    const status = statusData.products[application.key];
    if (status && status.packageName !== application.packageName) {
      error(`${application.key}: application packageName ${application.packageName} does not match status packageName ${status.packageName ?? "null"}`);
    }
  }

  const developerMap = await readFile(path.join(rootDir, "src/pages/developers.astro"), "utf8");
  if (!developerMap.includes("applications.map")) {
    error("src/pages/developers.astro: does not derive application discoverability from the shared applications catalog");
  }
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

async function checkVersionedPackage({ key, name, page, allowsPinnedEvidence = false }) {
  const status = statusData.products[key];
  if (!status) {
    error(`src/data/product-status.json: missing ${key}`);
    return;
  }
  await assertPageUsesProductStatus(page, key, status.version, allowsPinnedEvidence);
  if (status.packageName !== name) {
    error(`${key}: expected packageName ${name}, found ${status.packageName ?? "null"}`);
    return;
  }
  if (!status.version) {
    error(`${key}: missing public version for ${name}`);
    return;
  }

  const advertised = status.version;

  try {
    const result = await fetchNpmLatest(name);
    if (result.error) {
      warn(`${name}: ${result.error}; public version not rechecked`);
      return;
    }
    if (!result.published) {
      warn(`${name}: not published on npm; metadata v${advertised} requires manual public-source review`);
      return;
    }
    if (result.latest !== advertised) {
      registryParityIssue(`${name}: metadata v${advertised} does not match npm latest v${result.latest}`);
      return;
    }
    console.log(`PASS  ${name}: metadata v${advertised} matches npm latest`);
  } catch (err) {
    warn(`${name}: registry check skipped (${err.message})`);
  }
}

async function checkLocalWorkspacePackage({ key, packageFile }) {
  const status = statusData.products[key];
  if (!status) {
    error(`src/data/product-status.json: missing ${key}`);
    return;
  }

  const packageJsonPath = path.resolve(rootDir, packageFile);
  const localPackage = await readLocalWorkspacePackage(packageJsonPath);
  if (localPackage.state === "absent") {
    // Sibling checkout absent (normal in CI). product-status.json is the single
    // source of truth for this expectation and npm parity is enforced separately
    // in versionedPackages, so there is nothing to reconcile here.
    console.log(`PASS  ${key}: expectation derived from product-status.json v${status.version} (${packageFile} not present)`);
    return;
  }

  if (localPackage.state === "inactive") {
    console.log(
      `PASS  ${key}: expectation derived from product-status.json v${status.version} (${packageFile} is in a bare repository, not an active Git worktree)`,
    );
    return;
  }

  const packageJson = localPackage.packageJson;
  if (status.packageName !== packageJson.name) {
    error(`${key}: status packageName ${status.packageName ?? "null"} does not match ${packageFile} name ${packageJson.name}`);
  }
  if (status.version !== packageJson.version) {
    error(`${key}: status v${status.version ?? "null"} does not match ${packageFile} v${packageJson.version}`);
    return;
  }
  console.log(`PASS  ${key}: metadata v${status.version} matches ${packageFile}`);
}

// Flow Agents publishes to npm like the other packages, so its metadata
// version is checked against the registry. Additionally guard the drift that
// matters for its page: no "coming soon" framing, and the advertised install
// path must stay in step with its npm publish status.
async function checkFlowAgents() {
  const name = "@kontourai/flow-agents";
  const pageFile = "src/pages/flow-agents.astro";
  const source = await readFile(path.join(rootDir, pageFile), "utf8");
  const status = statusData.products["flow-agents"];

  if (!source.includes("product-status") || !source.includes("getProductStatus('flow-agents')")) {
    error(`${pageFile}: does not derive Flow Agents status from src/data/product-status.json`);
  }

  if (/coming soon/i.test(source)) {
    error(`${pageFile}: still says "coming soon" but Flow Agents is installable today`);
  }

  const advertisesGithubInstall = /install\.sh/.test(source);
  const advertisesNpmInstall = /(npm install|npx)[^<]*flow-agents/.test(source);

  let result;
  try {
    result = await fetchNpmLatest(name);
  } catch (err) {
    warn(`${name}: registry check skipped (${err.message})`);
    return;
  }

  if (result.error) {
    warn(`${name}: ${result.error}`);
    return;
  }

  if (result.published) {
    if (advertisesNpmInstall) {
      console.log(`PASS  ${name}: published v${result.latest} and page advertises npm install`);
    } else {
      // Live-registry state change (unpublished -> published), same class as
      // version drift: warn on PRs, block on the strict lane.
      registryParityIssue(`${name}: now published to npm (v${result.latest}); update ${pageFile} to advertise the npm install`);
    }
    return;
  }

  if (!advertisesGithubInstall) {
    registryParityIssue(`${pageFile}: Flow Agents is unpublished but the page does not show the install.sh path`);
    return;
  }
  console.log(`PASS  ${name}: unpublished, page advertises GitHub install (install.sh)`);
}



async function checkDist() {
  const distDir = path.join(rootDir, "dist");
  try {
    await access(distDir);
    console.log("PASS  dist/: build output exists");
  } catch {
    error("dist/: build output missing; run npm run build");
  }
}

try {
  const catalog = await loadProductCatalog();
  await checkProductCatalogCoverage(catalog);
  for (const pkg of localWorkspacePackages) {
    await checkLocalWorkspacePackage(pkg);
  }
  for (const pkg of versionedPackages) {
    await checkVersionedPackage(pkg);
  }
  await checkFlowAgents();
  await checkDist();
} finally {
  await viteServer?.close();
}

if (errorCount > 0) {
  process.exitCode = 1;
}
