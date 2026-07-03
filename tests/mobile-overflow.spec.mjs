import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { expect, test } from "@playwright/test";

/**
 * Regression guard for launch-bar item R-responsive (docs/launch-readiness-bar.md)
 * and launch-audit finding F9 (docs/launch-audit-2026-07-03.md): no page may
 * scroll horizontally on mobile. We removed the body-level `overflow-x: hidden`
 * mask, so overflow now has to be cured at its source — this is the mechanical
 * check that keeps it cured.
 *
 * Routes are discovered from the built `dist/` output so every current and
 * future page is covered automatically, with no hand-maintained list.
 */
const distDir = fileURLToPath(new URL("../dist", import.meta.url));

async function discoverRoutes(dir) {
  const routes = [];
  async function walk(abs, rel) {
    for (const entry of await readdir(abs, { withFileTypes: true })) {
      const absChild = path.join(abs, entry.name);
      const relChild = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(absChild, relChild);
      } else if (entry.name === "index.html") {
        routes.push(rel ? `/${rel}/` : "/");
      } else if (entry.name.endsWith(".html")) {
        // Standalone pages like 404.html.
        routes.push(`/${relChild}`);
      }
    }
  }
  await walk(dir, "");
  return [...new Set(routes)].sort();
}

const routes = await discoverRoutes(distDir);
// Mobile floor (360), a common device width (390 covered by 360/768 bounds),
// and the tablet edge (768). Assert the true horizontal-overflow condition.
const viewports = [
  { width: 360, height: 900, label: "360" },
  { width: 768, height: 1024, label: "768" },
];

test("regression routes were discovered from the build output", () => {
  // Guard against the glob silently matching nothing and the suite passing empty.
  expect(routes.length).toBeGreaterThanOrEqual(10);
  expect(routes).toContain("/");
});

for (const route of routes) {
  for (const vp of viewports) {
    test(`no horizontal overflow: ${route} @${vp.label}px`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route, { waitUntil: "networkidle" });

      const { scrollWidth, innerWidth, culprits } = await page.evaluate((vw) => {
        const de = document.documentElement;
        const containedBy = (el) => {
          let p = el.parentElement;
          while (p && p !== de) {
            const st = getComputedStyle(p);
            if (st.position === "fixed") return true;
            const ox = st.overflowX;
            if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") return true;
            p = p.parentElement;
          }
          return false;
        };
        const culprits = [];
        if (de.scrollWidth > window.innerWidth + 1) {
          for (const el of document.body.querySelectorAll("*")) {
            const st = getComputedStyle(el);
            if (st.position === "fixed") continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            if (r.right > vw + 1 && !containedBy(el)) {
              const cls = el.className && el.className.toString ? el.className.toString().slice(0, 40) : "";
              culprits.push(`${el.tagName.toLowerCase()}.${cls} (right=${Math.round(r.right)})`);
            }
          }
        }
        return { scrollWidth: de.scrollWidth, innerWidth: window.innerWidth, culprits: [...new Set(culprits)].slice(0, 6) };
      }, vp.width);

      expect(
        scrollWidth,
        `${route} @${vp.label}px overflows by ${scrollWidth - innerWidth}px. Uncontained culprits: ${culprits.join("; ") || "(none isolated — check fixed/scroll containers)"}`,
      ).toBeLessThanOrEqual(innerWidth + 1);
    });
  }
}
