#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const registryPath = "src/data/public-evidence-registry.json";
export const comparisonPagePath = "src/pages/fieldwork-vs-langextract.astro";

const claimIdPattern = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const sourceIdPattern = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const immutableGithubUrl = /^https:\/\/github\.com\/[^/]+\/[^/]+\/(?:blob|tree)\/[0-9a-f]{40}(?:\/|$)/;

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.length > 0;
}

function uniqueIds(items, label, errors) {
  const seen = new Set();
  for (const item of items) {
    if (!isRecord(item) || !hasText(item.id)) continue;
    if (seen.has(item.id)) {
      errors.push(`${label}: duplicate id ${item.id}`);
    }
    seen.add(item.id);
  }
}

/**
 * Validate the public evidence registry without making network requests. This
 * function is exported so reachability classification can be unit-tested with
 * only stubbed fetch responses.
 */
export async function validatePublicEvidenceRegistry(registry, { rootDir, readFileImpl = readFile } = {}) {
  const errors = [];
  if (!isRecord(registry)) return ["registry: expected an object"];
  if (registry.schemaVersion !== 1) errors.push("registry: schemaVersion must be 1");
  if (!Array.isArray(registry.sources)) errors.push("registry: sources must be an array");
  if (!Array.isArray(registry.claims)) errors.push("registry: claims must be an array");
  if (errors.length > 0) return errors;

  uniqueIds(registry.sources, "sources", errors);
  uniqueIds(registry.claims, "claims", errors);

  const sourceById = new Map();
  for (const source of registry.sources) {
    if (!isRecord(source)) {
      errors.push("sources: every source must be an object");
      continue;
    }
    const prefix = `source ${source.id ?? "<missing id>"}`;
    if (!hasText(source.id) || !sourceIdPattern.test(source.id)) errors.push(`${prefix}: id must be a lowercase canonical identifier`);
    if (!hasText(source.subject)) errors.push(`${prefix}: subject is required`);
    if (!hasText(source.sourcePath) || source.sourcePath.startsWith("/") || source.sourcePath.includes("..")) {
      errors.push(`${prefix}: sourcePath must be a relative canonical source path`);
    }
    if (!hasText(source.url) || !immutableGithubUrl.test(source.url)) {
      errors.push(`${prefix}: url must be an immutable GitHub blob or tree URL`);
    }
    if (source.subject === "google-langextract" && source.scope !== "comparison-only") {
      errors.push(`${prefix}: Google LangExtract sources must be comparison-only`);
    }
    if (source.scope && source.scope !== "comparison-only") {
      errors.push(`${prefix}: unsupported scope ${source.scope}`);
    }
    sourceById.set(source.id, source);
  }

  const referencedSourceIds = new Set();
  const sourcePages = new Map();
  for (const claim of registry.claims) {
    if (!isRecord(claim)) {
      errors.push("claims: every claim must be an object");
      continue;
    }
    const prefix = `claim ${claim.id ?? "<missing id>"}`;
    if (!hasText(claim.id) || !claimIdPattern.test(claim.id)) errors.push(`${prefix}: id must be a lowercase canonical identifier`);
    if (!hasText(claim.pagePath) || !claim.pagePath.startsWith("src/pages/") || !claim.pagePath.endsWith(".astro")) {
      errors.push(`${prefix}: pagePath must name a public Astro page`);
    }
    if (!Array.isArray(claim.sourceIds) || claim.sourceIds.length === 0) {
      errors.push(`${prefix}: sourceIds must name at least one source`);
      continue;
    }
    const claimSources = new Set();
    for (const sourceId of claim.sourceIds) {
      if (!hasText(sourceId) || !sourceById.has(sourceId)) {
        errors.push(`${prefix}: unknown source ${sourceId}`);
        continue;
      }
      if (claimSources.has(sourceId)) errors.push(`${prefix}: duplicate source ${sourceId}`);
      claimSources.add(sourceId);
      referencedSourceIds.add(sourceId);
      const pages = sourcePages.get(sourceId) ?? new Set();
      pages.add(claim.pagePath);
      sourcePages.set(sourceId, pages);
    }
  }

  for (const source of registry.sources) {
    if (hasText(source.id) && !referencedSourceIds.has(source.id)) {
      errors.push(`source ${source.id}: is not linked to a claim`);
    }
    if (source.scope === "comparison-only") {
      const pages = sourcePages.get(source.id) ?? new Set();
      if ([...pages].some((pagePath) => pagePath !== comparisonPagePath)) {
        errors.push(`source ${source.id}: comparison-only sources may only support ${comparisonPagePath}`);
      }
    }
  }

  if (!rootDir) return errors;

  const pageSource = new Map();
  for (const claim of registry.claims) {
    if (!isRecord(claim) || !hasText(claim.pagePath) || pageSource.has(claim.pagePath)) continue;
    try {
      pageSource.set(claim.pagePath, await readFileImpl(path.join(rootDir, claim.pagePath), "utf8"));
    } catch {
      errors.push(`claim ${claim.id ?? "<missing id>"}: pagePath does not exist (${claim.pagePath})`);
    }
  }
  for (const claim of registry.claims) {
    if (!isRecord(claim) || !hasText(claim.id) || !Array.isArray(claim.sourceIds)) continue;
    const source = pageSource.get(claim.pagePath);
    if (!source) continue;
    const consumesClaimSources = source.includes(`getPublicEvidenceClaimSources('${claim.id}')`);
    const consumesEveryBoundPair = claim.sourceIds.every(
      (sourceId) =>
        hasText(sourceId) &&
        source.includes(`getPublicEvidenceClaimSourceUrl('${claim.id}', '${sourceId}')`),
    );
    if (!consumesClaimSources && !consumesEveryBoundPair) {
      errors.push(`claim ${claim.id}: ${claim.pagePath} does not consume its explicit claim-source binding`);
    }
  }
  return errors;
}

async function main() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  let registry;
  try {
    registry = JSON.parse(await readFile(path.join(rootDir, registryPath), "utf8"));
  } catch (error) {
    console.error(`ERROR ${registryPath}: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  const errors = await validatePublicEvidenceRegistry(registry, { rootDir });
  if (errors.length > 0) {
    for (const error of errors) console.error(`ERROR ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS  public evidence registry: ${registry.claims.length} claims, ${registry.sources.length} immutable sources`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
