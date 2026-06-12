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
