import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const read = file => readFile(path.join(root, file));
const { assets } = JSON.parse(await read('src/data/brand-assets.json'));
const sources = JSON.parse(await read('public/brand-assets/sources.json'));
const zipped = unzipSync(await read('public/brand-assets/kontour-brand-assets.zip'));
assert.deepEqual(Buffer.from(zipped['LICENSE-APACHE-2.0.txt'] ?? []), await read('public/brand-assets/LICENSE-APACHE-2.0.txt'), 'License notice missing from brand download.');
assert.equal(sources.length, assets.length, 'Brand source inventory changed; regenerate downloads.');
for (const asset of assets) {
  const file = asset.source.startsWith('@') ? require.resolve(asset.source) : path.join(root, asset.source);
  const digest = createHash('sha256').update(await readFile(file)).digest('hex');
  const recorded = sources.find(row => row.id === asset.id);
  assert.equal(recorded?.source, asset.source, `${asset.id}: source changed; regenerate downloads.`);
  assert.equal(recorded.sha256, digest, `${asset.id}: artwork changed; regenerate downloads.`);
  for (const variant of ['light', 'dark']) {
    for (const format of ['svg', 'png']) {
      const name = `${asset.id}-${variant}.${format}`;
      assert.deepEqual(Buffer.from(zipped[name] ?? []), await read(`public/brand-assets/${name}`), `${name}: ZIP and individual download differ.`);
    }
  }
}
console.log(`PASS: ${assets.length} brand sources match pinned artwork; all SVG/PNG downloads match the ZIP.`);
