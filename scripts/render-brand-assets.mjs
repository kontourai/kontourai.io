#!/usr/bin/env node
// Derives site metadata artwork from the approved Kontour UI marks.
// DESIGN.md: raster exports derive from the SVGs, never from concept images.
//
//   public/favicon.svg           small cut, color set (a standalone SVG has no
//                                text color to inherit; currentColor draws black)
//   public/apple-touch-icon.png  180x180, the 64px+ symbol cut on the site ink
//   public/og/kontour-share.png  1200x630 share card, large lockup over faint
//                                generic contour rings (decorative terrain,
//                                deliberately NOT the symbol: a mark is never
//                                drawn under 3:1)
//
// Colors come from the site palette in src/styles/global.css (OPEN-11: the
// marketing site keeps its own palette), never from @kontourai/ui tokens.
// The card's text uses the site's Google Fonts; the run refuses to write a
// card rendered in a fallback face.
//
// Usage: node scripts/render-brand-assets.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(path.join(root, rel), 'utf8');
const require = createRequire(import.meta.url);
const icon = name => readFileSync(require.resolve(`@kontourai/ui/icons/${name}.svg`), 'utf8').trim();

const css = read('src/styles/global.css');
const token = (name) => {
  const value = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))?.[1];
  if (!value) throw new Error(`--color-${name} not found in src/styles/global.css`);
  return value;
};
const ink = token('ink');
const ink1 = token('ink-1');
const edge = token('edge');
const chalk = token('chalk');
const chalk2 = token('chalk-2');
const gold = token('gold');

// Generic terrain for the card background: offset rings whose centres drift
// down and to the left. Not the Headland symbol or any other mark.
const terrain = () => {
  const rings = Array.from({ length: 9 }, (_, i) => {
    const r = 36 + i * 34;
    return `<ellipse cx="${520 - i * 9}" cy="${250 + i * 7}" rx="${r * 1.18}" ry="${r}" />`;
  }).join('');
  return `<svg width="760" height="560" viewBox="0 0 760 560" fill="none" stroke="currentColor" stroke-width="1.5">${rings}</svg>`;
};

// Sizes the root <svg> by height only, so the mark keeps its own aspect ratio.
const sized = (svg, height) => {
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  return svg.replace(/\swidth="[^"]*"\s+height="[^"]*"/, ` width="${(w * height) / h}" height="${height}"`);
};

// --- favicon.svg: one color per scheme, both from the site palette. Ink
// holds on a light tab strip, chalk on a dark one.
const symbol = icon('kontour-symbol');
if (!symbol.includes('stroke="currentColor"')) throw new Error('kontour-symbol.svg no longer paints with currentColor');
const favicon = symbol.replace(
  /^<svg ([^>]*)>/,
  `<svg $1 color="${ink}"><style>@media (prefers-color-scheme: dark){svg{color:${chalk}}}</style>`,
);
writeFileSync(path.join(root, 'public/favicon.svg'), `${favicon}\n`);

const browser = await chromium.launch();
try {
  // --- apple-touch-icon.png: 180px tile; the mark is 120px (>= 64px, so the
  // heavier lockup cut) with a quarter of its height (30px) clear on each side.
  {
    const page = await browser.newPage({ viewport: { width: 180, height: 180 } });
    await page.setContent(`<!doctype html><html><body style="margin:0;width:180px;height:180px;background:${ink};color:${chalk};display:grid;place-items:center">${sized(icon('kontour-symbol-lockup'), 120)}</body></html>`);
    await page.screenshot({ path: path.join(root, 'public/apple-touch-icon.png'), omitBackground: false });
    await page.close();
  }

  // --- og/kontour-share.png
  {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(`<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&family=Syne:wght@400&display=block" rel="stylesheet" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; width: 1200px; height: 630px; background: ${ink}; }
  .card { position: absolute; inset: 40px; background: ${ink1}; border: 1px solid ${edge}; border-radius: 16px; overflow: hidden; }
  .art { position: absolute; right: -120px; top: -20px; color: ${chalk}; opacity: 0.09; }
  .lockup { position: absolute; left: 72px; top: 84px; color: ${chalk}; }
  .tagline { position: absolute; left: 72px; top: 212px; margin: 0; font: 400 34px/1.3 'Syne', sans-serif; color: ${chalk2}; }
  .rule { position: absolute; left: 72px; right: 72px; bottom: 96px; border-top: 1px solid ${edge}; }
  .url { position: absolute; right: 72px; bottom: 44px; font: 400 24px/1 'JetBrains Mono', monospace; color: ${gold}; }
</style></head><body><div class="card">
  <div class="art">${terrain()}</div>
  <div class="lockup">${sized(icon('kontour-lockup-large'), 88)}</div>
  <p class="tagline">Make your agents show their work.</p>
  <div class="rule"></div>
  <div class="url">kontourai.io</div>
</div></body></html>`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() => [
      document.fonts.check("400 34px 'Syne'"),
      document.fonts.check("400 24px 'JetBrains Mono'"),
      [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
    ]);
    if (!loaded[0] || !loaded[1] || !loaded[2].some((f) => f.includes('Syne')) || !loaded[2].some((f) => f.includes('JetBrains'))) {
      throw new Error(`share card fonts did not load (${JSON.stringify(loaded)}); refusing to write a fallback-face card`);
    }
    await page.screenshot({ path: path.join(root, 'public/og/kontour-share.png') });
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('wrote public/favicon.svg, public/apple-touch-icon.png, public/og/kontour-share.png');
