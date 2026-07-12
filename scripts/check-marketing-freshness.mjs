#!/usr/bin/env node
// Marketing-content freshness signal (advisory; deploy-blocking version
// equality lives in validate.mjs). Each product in product-status.json
// carries marketingReviewed = { version, date }: the last release whose
// features were reconciled into the page copy + screenshots. A minor or
// major bump beyond that means shipped features nobody marketed yet.
//
// Exit 0 always (this is a desk signal, not a gate). After refreshing a
// page, set marketingReviewed to the version you reconciled against.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/data/product-status.json', import.meta.url), 'utf8'));
const products = data.products ?? data;

const parse = (v) => v.split('.').map(Number);
let flagged = 0;

for (const [key, node] of Object.entries(products)) {
  if (!node || typeof node !== 'object' || !node.packageName) continue;
  let latest;
  try {
    latest = execFileSync('npm', ['view', node.packageName, 'version'], { encoding: 'utf8', timeout: 30000 }).trim();
  } catch {
    console.log(`WARN  ${key}: npm lookup failed`);
    continue;
  }
  const reviewed = node.marketingReviewed?.version;
  if (!reviewed) { console.log(`WARN  ${key}: no marketingReviewed marker`); flagged += 1; continue; }
  const [lMaj, lMin] = parse(latest);
  const [rMaj, rMin] = parse(reviewed);
  if (lMaj > rMaj || (lMaj === rMaj && lMin > rMin)) {
    flagged += 1;
    console.log(`STALE ${key}: npm ${latest} vs marketing-reviewed ${reviewed} (${node.marketingReviewed.date}) — feature-level changes unmarketed`);
  } else if (latest !== reviewed) {
    console.log(`ok    ${key}: ${latest} (patch drift only; reviewed ${reviewed})`);
  } else {
    console.log(`ok    ${key}: ${latest} (current)`);
  }
}

console.log(flagged ? `\n${flagged} product page(s) need a marketing pass.` : '\nAll product pages marketing-current.');

// ── Per-asset visual freshness (images/videos) ────────────────────────────
// src/data/marketing-assets.json binds every product screenshot/video to the
// version it was captured against. Same advisory posture (exit 0): visuals
// need a human pass, so this names exactly which files went stale instead of
// blocking. `--assets-summary <path>` additionally writes a markdown table
// (used by the scheduled desk-signal issue in pin-refresh.yml).
import { existsSync, writeFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../src/data/marketing-assets.json', import.meta.url), 'utf8'));
const staleAssets = [];

for (const entry of manifest.assets ?? []) {
  const product = products[entry.product];
  if (!product?.packageName) {
    console.log(`WARN  asset ${entry.asset}: unknown product "${entry.product}"`);
    continue;
  }
  if (!existsSync(new URL(`../${entry.asset}`, import.meta.url))) {
    console.log(`WARN  asset ${entry.asset}: file missing from repo`);
    continue;
  }
  let latest;
  try {
    latest = execFileSync('npm', ['view', product.packageName, 'version'], { encoding: 'utf8', timeout: 30000 }).trim();
  } catch {
    console.log(`WARN  asset ${entry.asset}: npm lookup failed`);
    continue;
  }
  const [lMaj, lMin] = parse(latest);
  const [cMaj, cMin] = parse(entry.capturedAgainstVersion);
  if (lMaj > cMaj || (lMaj === cMaj && lMin > cMin)) {
    staleAssets.push({ ...entry, latest });
    console.log(
      `STALE asset ${entry.asset} (${entry.page}): captured against ${entry.product}@${entry.capturedAgainstVersion} on ${entry.capturedAt}; npm latest is ${latest}`,
    );
  } else {
    console.log(`ok    asset ${entry.asset}: current for ${entry.product}@${latest}`);
  }
}

console.log(
  staleAssets.length
    ? `${staleAssets.length} visual asset(s) need recapture + human review.`
    : 'All marketing visuals current.',
);

const summaryFlag = process.argv.indexOf('--assets-summary');
if (summaryFlag !== -1 && process.argv[summaryFlag + 1]) {
  const rows = staleAssets
    .map((a) => `| \`${a.asset}\` | ${a.page.replace('src/pages/', '/').replace('.astro', '/')} | ${a.product}@${a.capturedAgainstVersion} (${a.capturedAt}) | ${a.latest} |`)
    .join('\n');
  writeFileSync(
    process.argv[summaryFlag + 1],
    staleAssets.length
      ? `| Asset | Page | Captured against | npm latest |\n|---|---|---|---|\n${rows}\n`
      : '',
  );
}
