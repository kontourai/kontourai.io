#!/usr/bin/env node
// Deploy-blocking integrity check for marketing visuals (exit 1 on failure —
// unlike check-marketing-freshness.mjs, which is an advisory desk signal).
//
// Contract: every committed product visual is exactly the bytes a guarded
// capture produced. capture-marketing-screenshot.mjs is the only thing that
// stamps sha256 into marketing-assets.json, and it refuses to write a capture
// that fails its styled-render guard — so a screenshot of a UI whose CSS
// didn't load (the 2026-07-20 survey workbench incident) can't reach deploy
// with a matching hash. The hash proves byte identity, not provenance: a
// deliberate hand-computed hash still passes, which is why "never hand-edit
// a sha256" is an AGENTS.md rule and captures stay human-reviewed.
//
// Checks:
//   1. every manifest entry resolves inside public/, exists, carries full
//      metadata (page/product/capturedAgainstVersion/capturedAt/sha256),
//      and its sha256 matches the file bytes
//   2. every file under public/screenshots/ has a manifest entry (no
//      unmanaged visuals)
//   3. every /screenshots/... reference anywhere in src/ has a manifest entry
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestRel = 'src/data/marketing-assets.json';
const manifest = JSON.parse(readFileSync(path.join(repoRoot, manifestRel), 'utf8'));
const assets = manifest.assets ?? [];
const byPath = new Map(assets.map((a) => [a.asset, a]));
let failures = 0;
const fail = (msg) => { console.error(`FAIL ${msg}`); failures += 1; };

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);

for (const entry of assets) {
  const abs = path.resolve(repoRoot, entry.asset);
  if (!abs.startsWith(path.join(repoRoot, 'public') + path.sep)) {
    fail(`${entry.asset}: manifest path must resolve inside public/`);
    continue;
  }
  if (!existsSync(abs)) {
    fail(`${entry.asset}: listed in marketing-assets.json but missing on disk`);
    continue;
  }
  for (const field of ['page', 'product', 'capturedAgainstVersion', 'capturedAt', 'sha256']) {
    if (!entry[field]) fail(`${entry.asset}: manifest entry is missing "${field}"`);
  }
  if (!entry.sha256) continue;
  const actual = createHash('sha256').update(readFileSync(abs)).digest('hex');
  if (actual !== entry.sha256) {
    fail(`${entry.asset}: bytes don't match manifest sha256 — the file changed outside the guarded capture path; recapture via scripts/capture-marketing-screenshot.mjs`);
  }
}

for (const file of walk(path.join(repoRoot, 'public/screenshots'))) {
  const rel = path.relative(repoRoot, file);
  if (!byPath.has(rel)) fail(`${rel}: on disk but not in marketing-assets.json — add an entry and stamp it`);
}

// Preceded by a quote, backtick, or `url(` opener (optional whitespace);
// terminated by quote/backtick/paren/query/hash/whitespace.
const refPattern = /["'`(]\s*\/screenshots\/([^"'`)?#\s]+)/g;
for (const file of walk(path.join(repoRoot, 'src'))) {
  const rel = path.relative(repoRoot, file);
  if (rel === manifestRel) continue;
  const source = readFileSync(file, 'utf8');
  for (const [, ref] of source.matchAll(refPattern)) {
    if (!byPath.has(`public/screenshots/${ref}`)) {
      fail(`${rel}: references /screenshots/${ref} which has no marketing-assets.json entry`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} marketing-asset integrity failure(s).`);
  process.exit(1);
}
console.log(`ok    ${assets.length} marketing assets: files present, metadata complete, hashes match, all screenshots and references manifested.`);
