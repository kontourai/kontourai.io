#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryBaseUrl = "https://registry.npmjs.org";
const statusData = JSON.parse(await readFile(path.join(rootDir, "src/data/product-status.json"), "utf8"));

let errorCount = 0;

function error(message) {
  errorCount += 1;
  console.error(`ERROR ${message}`);
}

function warn(message) {
  console.log(`WARN  ${message}`);
}

// Packages whose advertised version badge must match the public metadata. The
// metadata is compared against the public npm version when registry access is
// available; local sibling checkouts are never public release evidence.
const versionedPackages = [
  { key: "veritas", name: "@kontourai/veritas", page: "src/pages/veritas.astro" },
  { key: "surface", name: "@kontourai/surface", page: "src/pages/surface.astro" },
  { key: "survey", name: "@kontourai/survey", page: "src/pages/survey.astro" },
  { key: "flow", name: "@kontourai/flow", page: "src/pages/flow.astro" },
];

async function assertPageUsesProductStatus(pageFile, key, version) {
  const source = await readFile(path.join(rootDir, pageFile), "utf8");
  if (!source.includes("product-status") || !source.includes(`getProductStatus('${key}')`)) {
    error(`${pageFile}: does not derive ${key} status from src/data/product-status.json`);
  }

  if (version && (source.includes(version) || source.includes(`v${version}`))) {
    error(`${pageFile}: hard-coded version/status copy remains (${version}); derive it from product-status metadata`);
  }
}

async function checkProductRegistryCoverage() {
  const productsSource = await readFile(path.join(rootDir, "src/lib/products.ts"), "utf8");
  const keys = [...productsSource.matchAll(/key: "([^"]+)"/g)].map((match) => match[1]);
  for (const key of keys) {
    if (!statusData.products[key]) {
      error(`src/data/product-status.json: missing product status for ${key}`);
    }
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

async function checkVersionedPackage({ key, name, page }) {
  const status = statusData.products[key];
  if (!status) {
    error(`src/data/product-status.json: missing ${key}`);
    return;
  }
  await assertPageUsesProductStatus(page, key, status.version);
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
      error(`${name}: metadata v${advertised} does not match npm latest v${result.latest}`);
      return;
    }
    console.log(`PASS  ${name}: metadata v${advertised} matches npm latest`);
  } catch (err) {
    warn(`${name}: registry check skipped (${err.message})`);
  }
}

// Flow Agents is intentionally unpublished and installed from GitHub, so it has
// no version badge to check. Guard the drift that actually matters instead:
// the page must stop calling itself "coming soon" now that it ships, and the
// advertised install path must stay in step with its npm publish status.
async function checkFlowAgents() {
  const name = "@kontourai/flow-agents";
  const pageFile = "src/pages/flow-agents.astro";
  const source = await readFile(path.join(rootDir, pageFile), "utf8");
  const status = statusData.products["flow-agents"];

  if (!status || status.packageName !== name || status.version !== null || status.phase !== "early access") {
    error(`src/data/product-status.json: Flow Agents must stay GitHub-only early access until public npm publish is reviewed`);
  }
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
      error(`${name}: now published to npm (v${result.latest}); update ${pageFile} to advertise the npm install`);
    }
    return;
  }

  if (!advertisesGithubInstall) {
    error(`${pageFile}: Flow Agents is unpublished but the page does not show the install.sh path`);
    return;
  }
  console.log(`PASS  ${name}: unpublished, page advertises GitHub install (install.sh)`);
}

async function checkConsole() {
  const pageFile = "src/pages/console.astro";
  const source = await readFile(path.join(rootDir, pageFile), "utf8");
  const status = statusData.products.console;

  if (!status || status.packageName !== null || status.version !== null || status.phase !== "early preview") {
    error("src/data/product-status.json: Console must stay a manual early-preview status until a public package is reviewed");
  }
  if (!source.includes("product-status") || !source.includes("getProductStatus('console')")) {
    error(`${pageFile}: does not derive Console status from src/data/product-status.json`);
  }
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

await checkProductRegistryCoverage();
for (const pkg of versionedPackages) {
  await checkVersionedPackage(pkg);
}
await checkFlowAgents();
await checkConsole();
await checkDist();

if (errorCount > 0) {
  process.exitCode = 1;
}
