#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const headersPath = path.join(rootDir, "public/_headers");
const workflowPath = path.join(rootDir, ".github/workflows/deploy.yml");
const astroConfigPath = path.join(rootDir, "astro.config.mjs");
const layoutPath = path.join(rootDir, "src/layouts/Layout.astro");

let errorCount = 0;

function error(message) {
  errorCount += 1;
  console.error(`ERROR ${message}`);
}

function requireIncludes(source, needle, fileLabel) {
  if (!source.includes(needle)) {
    error(`${fileLabel}: missing ${needle}`);
  }
}

const [headers, workflow, astroConfig, layout] = await Promise.all([
  readFile(headersPath, "utf8"),
  readFile(workflowPath, "utf8"),
  readFile(astroConfigPath, "utf8"),
  readFile(layoutPath, "utf8"),
]);

const globalHeadersMatch = headers.match(/^\/\*\n(?<block>(?:  .+\n)+)/m);
if (!globalHeadersMatch) {
  error("public/_headers: missing global /* security header block");
} else {
  const globalHeaders = globalHeadersMatch.groups.block;
  for (const header of [
    "X-Frame-Options: DENY",
    "X-Content-Type-Options: nosniff",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "Permissions-Policy:",
    "Content-Security-Policy:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "https://cloud.umami.is",
    "https://static.cloudflareinsights.com",
    "style-src 'self' https://fonts.googleapis.com",
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ]) {
    requireIncludes(globalHeaders, header, "public/_headers global /* block");
  }
  if (globalHeaders.includes("'unsafe-inline'")) {
    error("public/_headers global /* block: avoid unsafe-inline in CSP");
  }

  // Umami Cloud serves its script from cloud.umami.is but the script sends
  // beacons to gateway.umami.is — a CSP that allows only the script host
  // silently blocks every pageview/event in the browser (found live 2026-07-12:
  // the dashboard read zero while the site looked instrumented).
  const connectSrc = globalHeaders.match(/connect-src[^;]*/)?.[0] ?? "";
  if (layout.includes("cloud.umami.is/script.js") && !connectSrc.includes("https://gateway.umami.is")) {
    error(
      "public/_headers connect-src: Layout loads Umami Cloud's script, so the beacon host https://gateway.umami.is must be allowed (cloud.umami.is alone only covers the script download)"
    );
  }
}

requireIncludes(astroConfig, "inlineStylesheets: 'never'", "astro.config.mjs");

const deployJobMatch = workflow.match(/\n  deploy:\n(?<job>[\s\S]*?)(?:\n  [a-zA-Z0-9_-]+:\n|$)/);
if (!deployJobMatch) {
  error(".github/workflows/deploy.yml: missing deploy job");
} else {
  const deployJob = deployJobMatch.groups.job;
  requireIncludes(
    deployJob,
    "if: github.event_name == 'push' && github.ref == 'refs/heads/main'",
    ".github/workflows/deploy.yml deploy job"
  );
  requireIncludes(deployJob, "deployments: write", ".github/workflows/deploy.yml deploy job");
  requireIncludes(deployJob, "CLOUDFLARE_API_TOKEN", ".github/workflows/deploy.yml deploy job");
  requireIncludes(deployJob, "npm exec -- wrangler", ".github/workflows/deploy.yml deploy job");
  if (deployJob.includes("npx")) {
    error(".github/workflows/deploy.yml deploy job: do not resolve executable packages while deploy secrets are present");
  }
}

const verifyJobMatch = workflow.match(/\n  verify:\n(?<job>[\s\S]*?)(?:\n  [a-zA-Z0-9_-]+:\n|$)/);
if (!verifyJobMatch) {
  error(".github/workflows/deploy.yml: missing verify job");
} else {
  const verifyJob = verifyJobMatch.groups.job;
  if (verifyJob.includes("CLOUDFLARE_API_TOKEN") || verifyJob.includes("pages deploy")) {
    error(".github/workflows/deploy.yml verify job: PR verification must not deploy or receive Cloudflare secrets");
  }
}

if (workflow.includes("pull-requests: write")) {
  error(".github/workflows/deploy.yml: pull-requests: write is not needed for this workflow");
}

if (errorCount > 0) {
  process.exit(1);
}

console.log("PASS  security hardening: headers and deploy workflow are scoped");
