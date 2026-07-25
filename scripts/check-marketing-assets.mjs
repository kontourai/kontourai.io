#!/usr/bin/env node
// Deploy-blocking integrity check for marketing visuals (exit 1 on failure —
// unlike check-marketing-freshness.mjs, which is an advisory desk signal).
//
// Contract: every committed product visual is exactly the bytes a guarded
// capture produced. capture-marketing-screenshot.mjs is the only thing that
// stamps sha256 into marketing-assets.json, and it refuses to write a capture
// that fails its styled-render guard — so a screenshot of a UI whose CSS
// didn't load (the 2026-07-20 survey workbench incident) can't reach deploy
// with a matching hash.
//
// Checks:
//   1. every manifest entry's file exists and its sha256 matches the bytes
//   2. every file in public/screenshots/ has a manifest entry (no unmanaged visuals)
//   3. every /screenshots/... reference in src/pages has a manifest entry
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(path.join(repoRoot, 'src/data/marketing-assets.json'), 'utf8'));
const assets = manifest.assets ?? [];
const byPath = new Map(assets.map((a) => [a.asset, a]));
let failures = 0;
const fail = (msg) => { console.error(`FAIL ${msg}`); failures += 1; };

for (const entry of assets) {
  const abs = path.join(repoRoot, entry.asset);
  if (!existsSync(abs)) {
    fail(`${entry.asset}: listed in marketing-assets.json but missing on disk`);
    continue;
  }
  if (!entry.sha256) {
    fail(`${entry.asset}: no sha256 in marketing-assets.json — restamp via scripts/capture-marketing-screenshot.mjs`);
    continue;
  }
  const actual = createHash('sha256').update(readFileSync(abs)).digest('hex');
  if (actual !== entry.sha256) {
    fail(`${entry.asset}: bytes don't match manifest sha256 — the file changed outside the guarded capture path; recapture via scripts/capture-marketing-screenshot.mjs`);
  }
}

const screenshotsDir = path.join(repoRoot, 'public/screenshots');
for (const file of readdirSync(screenshotsDir)) {
  const rel = `public/screenshots/${file}`;
  if (!byPath.has(rel)) fail(`${rel}: on disk but not in marketing-assets.json — add an entry and stamp it`);
}

const pagesDir = path.join(repoRoot, 'src/pages');
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
for (const page of walk(pagesDir)) {
  const source = readFileSync(page, 'utf8');
  for (const [, ref] of source.matchAll(/["'(]\/screenshots\/([^"')?#]+)/g)) {
    if (!byPath.has(`public/screenshots/${ref}`)) {
      fail(`${path.relative(repoRoot, page)}: references /screenshots/${ref} which has no marketing-assets.json entry`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} marketing-asset integrity failure(s).`);
  process.exit(1);
}
console.log(`ok    ${assets.length} marketing assets: files present, hashes match, all screenshots manifested.`);
