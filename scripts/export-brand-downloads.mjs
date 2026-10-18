import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { zipSync, strToU8 } from 'fflate';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { assets } = JSON.parse(await readFile(path.join(root, 'src/data/brand-assets.json'), 'utf8'));
const css = await readFile(path.join(root, 'src/styles/global.css'), 'utf8');
const color = name => {
  const value = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6});`))?.[1];
  if (!value) throw new Error(`Missing site color ${name}`);
  return value;
};
const out = path.join(root, 'public/brand-assets');
await mkdir(out, { recursive: true });
const files = {};
const provenance = [];
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const asset of assets) {
    const source = asset.source.startsWith('@') ? require.resolve(asset.source) : path.join(root, asset.source);
    const original = await readFile(source, 'utf8');
    const frame = original.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number);
    if (!frame || frame.length !== 4) throw new Error(`Missing SVG frame: ${asset.id}`);
    const width = Math.ceil(asset.height * frame[2] / frame[3]);
    provenance.push({ id: asset.id, source: asset.source, sha256: createHash('sha256').update(original).digest('hex') });
    for (const [variant, ink] of [['light', color('chalk')], ['dark', color('ink')]]) {
      const svg = original.replace(/<svg\b([^>]*)>/, (_, attrs) => `<svg${attrs.replace(/\s(?:width|height|color)="[^"]*"/g, '')} width="${width}" height="${asset.height}" color="${ink}">`);
      const stem = `${asset.id}-${variant}`;
      await writeFile(path.join(out, `${stem}.svg`), svg);
      files[`${stem}.svg`] = strToU8(svg);
      await page.setViewportSize({ width, height: asset.height });
      await page.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`);
      const png = await page.screenshot({ omitBackground: true });
      await writeFile(path.join(out, `${stem}.png`), png);
      files[`${stem}.png`] = png;
    }
  }
} finally {
  await browser.close();
}
files['LICENSE-APACHE-2.0.txt'] = new Uint8Array(await readFile(path.resolve(path.dirname(require.resolve('@kontourai/ui/icons/flow.svg')), '../LICENSE')));
files['sources.json'] = strToU8(`${JSON.stringify(provenance, null, 2)}\n`);
files['README.txt'] = strToU8('Kontour brand assets\n\nLight artwork is for dark backgrounds; dark artwork is for light backgrounds. PNGs are transparent. SVGs preserve the source geometry. Keep proportions and clear space; do not redraw the wordmark or imply endorsement. Small corporate cuts are for heights below 64px; large cuts are for 64px and above.\n\nGuidance and usage questions: https://kontourai.io/brand/\n');
await writeFile(path.join(out, 'sources.json'), files['sources.json']);
await writeFile(path.join(out, 'LICENSE-APACHE-2.0.txt'), files['LICENSE-APACHE-2.0.txt']);
await writeFile(path.join(out, 'kontour-brand-assets.zip'), zipSync(files, { level: 9, mtime: new Date("2026-01-01T00:00:00Z") }));
console.log(`Exported ${assets.length} approved source assets in light/dark SVG and transparent PNG, plus ZIP.`);
