#!/usr/bin/env node
// Sanctioned capture path for marketing screenshots (marketing-assets.json).
//
// Why this exists: a screenshot of a product UI whose stylesheet failed to
// load or apply looks like plain HTML soup, and a human stamping the manifest
// is the only thing that would catch it (it wasn't caught — see the survey
// workbench capture shipped 2026-07-20). This script refuses to write a
// capture whose page fails a styled-render guard, and it stamps the manifest
// entry (sha256 + capturedAt [+ capturedAgainstVersion]) so
// check-marketing-assets.mjs can verify at deploy time that every committed
// visual is exactly the bytes a guarded capture produced.
//
// Usage:
//   node scripts/capture-marketing-screenshot.mjs \
//     --asset public/screenshots/survey-workbench.png \
//     --url http://localhost:4243/ \
//     [--width 1400] [--height 874] [--dpr 1] [--full-page] \
//     [--delay-ms 500] [--product-version 2.2.1]
//
//   # Non-screenshot assets (e.g. a VHS-recorded GIF) are produced by other
//   # tools; stamp them explicitly so the integrity check can bind the bytes:
//   node scripts/capture-marketing-screenshot.mjs \
//     --stamp public/screenshots/flow-demo.gif [--product-version 3.5.0]
//   (--stamp refuses .png files: PNGs must go through the guarded capture.)
//
// The capture is still human-reviewed before commit — this guard catches
// broken renders, not bad taste.
//
// Known limitation: the coverage signal reads same-origin stylesheets only.
// A product UI styled via cross-origin sheets, shadow-root adopted styles, or
// pure element-selector CSS could be falsely rejected — if that happens,
// investigate at capture time; do not weaken the guard to route around it.
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(repoRoot, 'src/data/marketing-assets.json');

const { values: args } = parseArgs({
  options: {
    asset: { type: 'string' },
    stamp: { type: 'string' },
    url: { type: 'string' },
    width: { type: 'string', default: '1400' },
    height: { type: 'string', default: '900' },
    dpr: { type: 'string', default: '1' },
    'full-page': { type: 'boolean', default: false },
    'delay-ms': { type: 'string', default: '500' },
    'color-scheme': { type: 'string', default: 'light' },
    'product-version': { type: 'string' },
  },
});

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if ((args.asset && args.stamp) || (!args.asset && !args.stamp)) {
  console.error('Use exactly one of --asset <path> --url <url> (guarded capture) or --stamp <path> (external asset).');
  process.exit(2);
}
const assetRel = args.asset ?? args.stamp;
const entry = (manifest.assets ?? []).find((a) => a.asset === assetRel);
if (!entry) {
  console.error(`FAIL ${assetRel}: not in src/data/marketing-assets.json — add the entry first.`);
  process.exit(1);
}
const assetAbs = path.resolve(repoRoot, assetRel);
// Containment incl. symlinks: the parent dir's realpath must sit inside
// public/'s realpath, and the asset itself must not be a symlink.
const publicReal = realpathSync(path.join(repoRoot, 'public'));
const containedInPublic = (abs) => {
  if (!abs.startsWith(path.join(repoRoot, 'public') + path.sep)) return false;
  const dirReal = realpathSync(path.dirname(abs));
  if (dirReal !== publicReal && !dirReal.startsWith(publicReal + path.sep)) return false;
  return !(existsSync(abs) && lstatSync(abs).isSymbolicLink());
};
if (!containedInPublic(assetAbs)) {
  console.error(`FAIL ${assetRel}: asset path must be a regular file inside public/ (no symlinks) — refusing to read or write outside it.`);
  process.exit(1);
}

const stampEntry = (buf) => {
  entry.sha256 = sha256(buf);
  const now = new Date();
  entry.capturedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (args['product-version']) entry.capturedAgainstVersion = args['product-version'];
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`stamped ${assetRel}: sha256=${entry.sha256.slice(0, 12)}… capturedAt=${entry.capturedAt}` +
    (args['product-version'] ? ` capturedAgainstVersion=${entry.capturedAgainstVersion}` : ''));
};

if (args.stamp) {
  if (args.stamp.endsWith('.png')) {
    console.error('FAIL --stamp refuses .png files: capture PNGs through --asset/--url so the styled-render guard runs.');
    process.exit(1);
  }
  stampEntry(readFileSync(assetAbs));
  console.log('Reminder: externally produced asset — human-review the visual before commit.');
  process.exit(0);
}

if (!args.url) {
  console.error('Need --url <url> with --asset.');
  process.exit(2);
}

const { chromium } = await import('playwright');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: Number(args.width), height: Number(args.height) },
    deviceScaleFactor: Number(args.dpr),
    // Matters for UIs that follow prefers-color-scheme (e.g. Surface Console);
    // 'light' mirrors Playwright's default so existing captures don't shift.
    colorScheme: args['color-scheme'],
    // Deterministic captures: skip count-up/stagger animations so the shot
    // shows final values, not whatever frame the settle delay happened to hit.
    reducedMotion: 'reduce',
  });
  // 'load', not 'networkidle': consoles with SSE/live streams never go idle.
  await page.goto(args.url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(Number(args['delay-ms']));

  // Styled-render guard. Three independent failure modes:
  //  1. a <link rel=stylesheet> that failed to load/parse (sheet === null)
  //  2. no author CSS rules at all
  //  3. rules exist but don't APPLY to the page — the survey-workbench
  //     failure: every rule scoped under a class the mount didn't carry.
  //     Detected as the fraction of visible body elements matched by a
  //     SPECIFIC author rule (selector referencing a class/id/attribute).
  //     Universal/element resets like `*` or `body` match everything even
  //     on a broken page, so they don't count (measured on the original
  //     incident: specific coverage was 98% styled vs 2% broken).
  const guard = await page.evaluate(() => {
    const links = [...document.querySelectorAll('link[rel="stylesheet"]')];
    const deadLinks = links.filter((l) => !l.sheet).map((l) => l.href);
    const selectors = [];
    // Only rules that are ACTIVE at this viewport count: descend into @media/
    // @supports groups only when their condition currently holds, so a sheet
    // full of media-mismatched rules can't fake coverage.
    const collect = (rules) => {
      for (const rule of rules) {
        if (rule instanceof CSSMediaRule) {
          if (matchMedia(rule.conditionText).matches) collect(rule.cssRules);
          continue;
        }
        if (rule instanceof CSSSupportsRule) {
          if (CSS.supports(rule.conditionText)) collect(rule.cssRules);
          continue;
        }
        if (rule.selectorText) selectors.push(rule.selectorText);
        if (rule.cssRules) collect(rule.cssRules);
      }
    };
    for (const sheet of document.styleSheets) {
      if (sheet.disabled) continue;
      if (sheet.media?.mediaText && !matchMedia(sheet.media.mediaText).matches) continue;
      try { collect(sheet.cssRules); } catch { /* cross-origin: ignore */ }
    }
    const specific = selectors.filter((s) => /[.#[]/.test(s));
    const matched = new Set();
    for (const sel of specific) {
      try { for (const el of document.querySelectorAll(sel)) matched.add(el); } catch { /* invalid in query context */ }
    }
    const visible = [...document.body.querySelectorAll('*')].filter((el) => el.getClientRects().length > 0);
    const styledCount = visible.filter((el) => matched.has(el)).length;
    return {
      deadLinks,
      ruleCount: selectors.length,
      specificRuleCount: specific.length,
      visibleCount: visible.length,
      coverage: visible.length ? styledCount / visible.length : 0,
    };
  });

  const failures = [];
  if (guard.deadLinks.length) failures.push(`stylesheet link(s) failed to load: ${guard.deadLinks.join(', ')}`);
  if (guard.specificRuleCount === 0) failures.push('page has no class/id/attribute-specific author CSS rules');
  if (guard.coverage < 0.5) failures.push(`only ${Math.round(guard.coverage * 100)}% of visible elements are matched by a specific author CSS rule (need >= 50%) — page is rendering unstyled`);
  if (failures.length) {
    for (const f of failures) console.error(`FAIL styled-render guard: ${f}`);
    process.exit(1);
  }
  console.log(`styled-render guard ok: ${guard.specificRuleCount}/${guard.ruleCount} specific rules, ${Math.round(guard.coverage * 100)}% of ${guard.visibleCount} visible elements styled`);

  const buf = await page.screenshot({ path: assetAbs, fullPage: args['full-page'] });
  stampEntry(buf);
  console.log(`wrote ${assetRel} (${buf.length} bytes). Human-review the visual before commit.`);
} finally {
  await browser.close();
}
