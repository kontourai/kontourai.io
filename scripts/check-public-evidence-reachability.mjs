#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registryPath, validatePublicEvidenceRegistry } from "./validate-public-evidence-registry.mjs";

const immutableGithubUrl = /^https:\/\/github\.com\/[^/]+\/[^/]+\/(?:blob|tree)\/[0-9a-f]{40}(?:\/|$)/;

function headerValue(headers, name) {
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(name);
  return headers[name] ?? headers[name.toLowerCase()] ?? null;
}

function hasTransient403Signal(response) {
  if (headerValue(response.headers, "retry-after") !== null) return true;
  return String(headerValue(response.headers, "x-ratelimit-remaining")) === "0";
}

function classifyResponse(response, source) {
  const status = response.status;
  const rateLimited = status === 429 || (status === 403 && hasTransient403Signal(response));
  if (rateLimited) return { status: "NOT_VERIFIED", detail: `rate limited (HTTP ${status})` };
  if (status === 408 || status === 425 || status >= 500) {
    return { status: "NOT_VERIFIED", detail: `transient response (HTTP ${status})` };
  }
  if ([401, 403, 404, 410, 451].includes(status)) {
    return { status: "FAIL", detail: `inaccessible or private source (HTTP ${status})` };
  }
  if (!response.ok) return { status: "FAIL", detail: `unreachable source (HTTP ${status})` };
  if (response.url && !immutableGithubUrl.test(response.url)) {
    return { status: "FAIL", detail: `redirected to a non-immutable URL (${response.url})` };
  }
  if (!immutableGithubUrl.test(source.url)) {
    return { status: "FAIL", detail: "source URL is not immutable" };
  }
  return { status: "PASS", detail: "reachable immutable source" };
}

export function reachabilityExitCode(results) {
  if (results.some((result) => result.status === "FAIL")) return 1;
  if (results.some((result) => result.status === "NOT_VERIFIED")) return 2;
  return 0;
}

/** Run anonymous reachability checks. This function never reads credentials. */
export async function checkPublicEvidenceReachability({ registry, fetchImpl = fetch, log = console.log }) {
  const sourceById = new Map(registry.sources.map((source) => [source.id, source]));
  const resultByCanonicalUrl = new Map();
  const results = [];

  for (const source of registry.sources) {
    if (resultByCanonicalUrl.has(source.url)) continue;
    let result;
    try {
      const response = await fetchImpl(source.url, {
        method: "GET",
        redirect: "follow",
        headers: {
          accept: "text/html,application/xhtml+xml",
          "user-agent": "kontourai-public-evidence-reachability/1.0"
        },
        signal: AbortSignal.timeout(10_000)
      });
      result = classifyResponse(response, source);
    } catch (error) {
      result = { status: "NOT_VERIFIED", detail: `transient network error (${error.message})` };
    }
    resultByCanonicalUrl.set(source.url, result);
  }

  for (const claim of registry.claims) {
    for (const sourceId of claim.sourceIds) {
      const source = sourceById.get(sourceId);
      const result = resultByCanonicalUrl.get(source.url);
      const line = `${result.status}  claim=${claim.id} source=${source.id} path=${source.sourcePath}: ${result.detail}`;
      log(line);
      results.push({ claimId: claim.id, sourceId: source.id, sourcePath: source.sourcePath, ...result });
    }
  }
  return results;
}

async function main() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  let registry;
  try {
    registry = JSON.parse(await readFile(path.join(rootDir, registryPath), "utf8"));
  } catch (error) {
    console.error(`FAIL  registry ${registryPath}: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  const schemaErrors = await validatePublicEvidenceRegistry(registry, { rootDir });
  if (schemaErrors.length > 0) {
    for (const error of schemaErrors) console.error(`FAIL  registry ${registryPath}: ${error}`);
    process.exitCode = 1;
    return;
  }
  const results = await checkPublicEvidenceReachability({ registry });
  process.exitCode = reachabilityExitCode(results);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
