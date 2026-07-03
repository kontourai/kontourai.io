#!/usr/bin/env node
/**
 * check-sitemap.mjs
 *
 * The public sitemap (public/sitemap.xml) is hand-maintained. This guard keeps
 * it honest: after a build, every indexable route in dist/ (every **\/index.html)
 * must appear in dist/sitemap.xml, and every <loc> in the sitemap must map to a
 * built route. The 404 page (dist/404.html, intentionally noindex) is naturally
 * excluded because it is not an index.html route.
 *
 * Fails (exit 1) on any drift so a forgotten page can never silently fall out of
 * — or a stale entry linger in — the sitemap again. This is the durable fix for a
 * hand-maintained sitemap (launch-audit F6). Requires a prior `npm run build`
 * (CI builds before validate). Run standalone: `npm run check:sitemap`.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const SITE = "https://kontourai.io";

let errorCount = 0;
const error = (m) => {
  errorCount += 1;
  console.error(`ERROR ${m}`);
};

if (!existsSync(distDir)) {
  console.error("ERROR dist/ not found — run `npm run build` before check:sitemap");
  process.exit(1);
}

// 1. Built indexable routes: every **/index.html under dist (404.html excluded by construction).
function collectRoutes(dir) {
  const routes = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      routes.push(...collectRoutes(full));
    } else if (entry.name === "index.html") {
      const rel = path.relative(distDir, dir);
      routes.push(rel === "" ? "/" : `/${rel.split(path.sep).join("/")}/`);
    }
  }
  return routes;
}
const builtRoutes = new Set(collectRoutes(distDir));

// 2. Sitemap routes.
const sitemapPath = path.join(distDir, "sitemap.xml");
if (!existsSync(sitemapPath)) {
  console.error("ERROR dist/sitemap.xml not found");
  process.exit(1);
}
const xml = readFileSync(sitemapPath, "utf8");
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const sitemapRoutes = new Set(
  locs.map((loc) => {
    if (!loc.startsWith(SITE)) {
      error(`sitemap <loc> not on ${SITE}: ${loc}`);
      return loc;
    }
    const p = loc.slice(SITE.length);
    return p === "" ? "/" : p;
  }),
);

// 3. Compare both directions.
for (const route of [...builtRoutes].sort()) {
  if (!sitemapRoutes.has(route)) {
    error(`built route missing from public/sitemap.xml: ${route}`);
  }
}
for (const route of [...sitemapRoutes].sort()) {
  if (!builtRoutes.has(route)) {
    error(`public/sitemap.xml lists a route with no built page: ${route}`);
  }
}

if (errorCount > 0) {
  console.error(`\ncheck-sitemap: ${errorCount} error(s). Update public/sitemap.xml to match built routes.`);
  process.exit(1);
}
console.log(
  `PASS  check-sitemap: ${builtRoutes.size} indexable route(s) all present in sitemap.xml (404 excluded)`,
);
