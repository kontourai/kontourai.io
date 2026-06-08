#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const themeSourcePath = path.join(rootDir, "src/lib/theme.ts");
const globalCssPath = path.join(rootDir, "src/styles/global.css");

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function diff(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

const [themeSource, globalCss] = await Promise.all([
  readFile(themeSourcePath, "utf8"),
  readFile(globalCssPath, "utf8"),
]);

const accentTypeMatch = themeSource.match(/export\s+type\s+Accent\s*=([\s\S]*?);/);
if (!accentTypeMatch) {
  console.error("ERROR src/lib/theme.ts: could not find exported Accent union");
  process.exit(1);
}

const typedAccents = uniqueSorted(
  [...accentTypeMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1])
);
const cssAccents = uniqueSorted(
  [...globalCss.matchAll(/\[data-accent="([^"]+)"\]\s*\{\s*--accent:/g)].map((match) => match[1])
);

const missingFromCss = diff(typedAccents, cssAccents);
const missingFromType = diff(cssAccents, typedAccents);

if (missingFromCss.length || missingFromType.length) {
  if (missingFromCss.length) {
    console.error(`ERROR src/styles/global.css: missing [data-accent] rules for ${missingFromCss.join(", ")}`);
  }
  if (missingFromType.length) {
    console.error(`ERROR src/lib/theme.ts: missing Accent union values for ${missingFromType.join(", ")}`);
  }
  process.exit(1);
}

console.log(`PASS  theme accents: ${typedAccents.length} typed values match CSS rules`);
