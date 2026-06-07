#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryBaseUrl = "https://registry.npmjs.org";

let errorCount = 0;

function error(message) {
  errorCount += 1;
  console.error(`ERROR ${message}`);
}

// Packages whose advertised version badge must match the real package. Each
// reads a `vX.Y.Z` trust-badge from its product page and compares it against the
// local sibling checkout (preferred) or the published npm version.
const versionedPackages = [
  { name: "@kontourai/veritas", page: "src/pages/veritas.astro" },
  { name: "@kontourai/surface", page: "src/pages/surface.astro" },
  { name: "@kontourai/survey", page: "src/pages/survey.astro" },
  { name: "@kontourai/flow", page: "src/pages/flow.astro" },
];

async function readAdvertisedVersion(pageFile, packageName) {
  const source = await readFile(path.join(rootDir, pageFile), "utf8");
  const match = source.match(/trust-badge[^>]*>v([0-9]+\.[0-9]+\.[0-9]+)</);
  if (!match) {
    error(`${pageFile}: could not find advertised ${packageName} version badge (expected a vX.Y.Z trust-badge)`);
    return null;
  }
  return match[1];
}

async function readLocalSiblingVersion(packageName) {
  const repoName = packageName.split("/").at(-1);
  const packagePath = path.resolve(rootDir, "..", repoName, "package.json");
  try {
    const source = await readFile(packagePath, "utf8");
    return JSON.parse(source).version;
  } catch {
    return null;
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

async function checkVersionedPackage({ name, page }) {
  const advertised = await readAdvertisedVersion(page, name);
  if (!advertised) {
    return;
  }

  const localVersion = await readLocalSiblingVersion(name);
  if (localVersion && localVersion === advertised) {
    console.log(`PASS  ${name}: advertised v${advertised} matches local sibling`);
    return;
  }

  try {
    const result = await fetchNpmLatest(name);
    if (result.error) {
      error(`${name}: ${result.error}`);
      return;
    }
    if (!result.published) {
      if (localVersion) {
        error(`${name}: advertised v${advertised} does not match local sibling v${localVersion}`);
      } else {
        console.log(`WARN  ${name}: not yet published and no local sibling to confirm advertised v${advertised}`);
      }
      return;
    }
    if (result.latest !== advertised) {
      error(`${name}: advertised v${advertised} does not match npm latest v${result.latest}`);
      return;
    }
    console.log(`PASS  ${name}: advertised v${advertised} matches npm latest`);
  } catch (err) {
    error(`${name}: registry check failed (${err.message})`);
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

  if (/coming soon/i.test(source)) {
    error(`${pageFile}: still says "coming soon" but Flow Agents is installable today`);
  }

  const advertisesGithubInstall = /install\.sh/.test(source);
  const advertisesNpmInstall = /npm install[^<]*flow-agents/.test(source);

  let result;
  try {
    result = await fetchNpmLatest(name);
  } catch (err) {
    console.log(`WARN  ${name}: registry check skipped (${err.message})`);
    return;
  }

  if (result.error) {
    error(`${name}: ${result.error}`);
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

async function checkDist() {
  const distDir = path.join(rootDir, "dist");
  try {
    await access(distDir);
    console.log("PASS  dist/: build output exists");
  } catch {
    error("dist/: build output missing; run npm run build");
  }
}

for (const pkg of versionedPackages) {
  await checkVersionedPackage(pkg);
}
await checkFlowAgents();
await checkDist();

if (errorCount > 0) {
  process.exitCode = 1;
}
