#!/usr/bin/env node

import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packages = ["@kontourai/veritas", "@kontourai/surface"];
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryBaseUrl = "https://registry.npmjs.org";

let errorCount = 0;

function error(message) {
  errorCount += 1;
  console.error(`ERROR ${message}`);
}

async function checkPackage(packageName) {
  const url = `${registryBaseUrl}/${encodeURIComponent(packageName)}`;

  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status === 404) {
      console.log(`WARN  ${packageName}: not yet published`);
      return;
    }

    if (!response.ok) {
      error(`${packageName}: registry returned HTTP ${response.status}`);
      return;
    }

    const metadata = await response.json();
    const latest = metadata?.["dist-tags"]?.latest;

    if (!latest) {
      error(`${packageName}: registry metadata did not include dist-tags.latest`);
      return;
    }

    console.log(`PASS  ${packageName}: found version ${latest}`);
  } catch (err) {
    error(`${packageName}: registry check failed (${err.message})`);
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

for (const packageName of packages) {
  await checkPackage(packageName);
}

await checkDist();

if (errorCount > 0) {
  process.exitCode = 1;
}
