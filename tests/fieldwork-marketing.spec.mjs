import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const comparisonRoute = "src/pages/fieldwork-vs-langextract.astro";
const ordinaryContentRoots = ["src/pages", "docs"];

async function walkFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? walkFiles(path) : [path];
  }));
  return nested.flat();
}

async function expectNoHorizontalOverflow(page) {
  const geometry = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
}

for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`Fieldwork product story is complete at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/fieldwork/");

    await expect(page.getByRole("heading", { level: 1, name: "Fieldwork" })).toBeVisible();
    await expect(page.getByText("v0.2.4", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("credential-free quickstart", { exact: true })).toBeVisible();
    await expect(page.getByText("npm install @kontourai/fieldwork", { exact: false })).toBeVisible();
    await expect(page.getByText("node_modules/@kontourai/fieldwork/examples/generic/task.json", { exact: false })).toBeVisible();
    await expect(page.getByText("node_modules/@kontourai/fieldwork/examples/generic/source.txt", { exact: false })).toBeVisible();

    for (const step of ["Extract", "Inspect", "Review", "Recheck", "Export"]) {
      await expect(page.getByRole("heading", { level: 3, name: step, exact: true })).toBeVisible();
    }

    await expect(page.getByText("Fieldwork does not include a PDF parser or OCR engine.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Read the v0.2.4 contract →" })).toHaveAttribute(
      "href",
      /github\.com\/kontourai\/fieldwork\/blob\/[0-9a-f]{40}\/README\.md/,
    );
    await expect(page.getByRole("link", { name: "Inspect the fixtures →" })).toHaveAttribute(
      "href",
      /github\.com\/kontourai\/fieldwork\/tree\/[0-9a-f]{40}\/conformance/,
    );

    const screenshots = page.locator("figure.product-shot img");
    await expect(screenshots).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await expect(screenshots.nth(index)).toHaveAttribute("alt", /.+/);
      await expect(screenshots.nth(index).locator("xpath=..").locator("figcaption")).toBeVisible();
    }

    await expectNoHorizontalOverflow(page);
  });

  test(`Fieldwork comparison is bounded at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/fieldwork-vs-langextract/");

    await expect(
      page.getByRole("heading", { level: 1, name: "Same grounded-extraction premise. Different completion boundary." }),
    ).toBeVisible();
    await expect(page.getByRole("region", { name: "Fieldwork and Google LangExtract comparison table" })).toBeVisible();
    await expect(page.getByText("No drop-in API compatibility")).toBeVisible();
    await expect(page.getByText("No general accuracy or provider superiority")).toBeVisible();
    await expect(page.getByText("No multipass-gain claim")).toBeVisible();
    await expect(page.getByText("No upstream-suite result")).toBeVisible();
    await expect(page.getByText("PDF and OCR are host adapters")).toBeVisible();
    await expect(page.getByText("Runtime adapters are not a quality score")).toBeVisible();
    await expect(page.getByRole("link", { name: "Read pinned upstream source ↗" })).toHaveAttribute(
      "href",
      "https://github.com/google/langextract/blob/0dff5479aa51934c7d5833a7c38e2a5abba4e0c2/README.md",
    );
    await expect(page.getByRole("link", { name: "Explore Fieldwork →" }).first()).toHaveAttribute("href", "/fieldwork/");

    await expectNoHorizontalOverflow(page);
  });
}

test("the named comparison stays out of ordinary product and engineering content", async () => {
  for (const root of ordinaryContentRoots) {
    for (const path of await walkFiles(root)) {
      const content = await readFile(path, "utf8");
      expect(content, `${path} must not expose private repository links`).not.toMatch(
        /github\.com\/kontourai\/evals/i,
      );
      if (path === comparisonRoute) continue;
      expect(content, `${path} must remain comparison-neutral`).not.toMatch(/LangExtract/i);
    }
  }
});
