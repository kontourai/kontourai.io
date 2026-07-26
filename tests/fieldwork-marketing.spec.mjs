import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";

const comparisonRoute = "src/pages/fieldwork-vs-langextract.astro";
const ordinaryContentRoots = ["src/pages", "docs"];
const execFileAsync = promisify(execFile);
const productStatus = JSON.parse(await readFile("src/data/product-status.json", "utf8"));
const fieldworkVersion = productStatus.products.fieldwork.version;

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
    await expect(page.getByText(`v${fieldworkVersion}`, { exact: true }).first()).toBeVisible();
    await expect(page.getByText("credential-free quickstart", { exact: true })).toBeVisible();
    await expect(page.getByText("npm install @kontourai/fieldwork", { exact: false })).toBeVisible();
    // The quickstart runs the two-field `vendor-obligations` fixture, not the
    // one-field `generic` one — a document with something to get wrong.
    await expect(page.getByText("node_modules/@kontourai/fieldwork/examples/vendor-obligations/task.json", { exact: false })).toBeVisible();
    await expect(page.getByText("node_modules/@kontourai/fieldwork/examples/vendor-obligations/source.txt", { exact: false })).toBeVisible();

    // The five-card workflow grid (five identical "Contract evidence →" links)
    // became a three-panel worked example: the document, the proposals with
    // their real locators, and the export actually refusing.
    for (const step of ["A document nobody has checked", "Seven values, each with its receipt", "The export refuses"]) {
      await expect(page.getByRole("heading", { level: 3, name: step, exact: true })).toBeVisible();
    }
    await expect(page.getByText("chars:362-386").first()).toBeVisible();
    await expect(page.getByText("Export refused: unresolved-review-item")).toBeVisible();
    // The honest limit of the credential-free demo: the bundled extractor
    // matches literal labels; real documents need a model you bring.
    await expect(
      page.getByRole("heading", { name: /The demo is free\. Real documents need a model/ }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Review PDF and OCR results with their layout context intact." }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: `Read the v${fieldworkVersion} contract →` })).toHaveAttribute(
      "href",
      /github\.com\/kontourai\/fieldwork\/blob\/[0-9a-f]{40}\/README\.md/,
    );
    await expect(page.getByRole("link", { name: "Inspect the fixtures →" })).toHaveAttribute(
      "href",
      /github\.com\/kontourai\/fieldwork\/tree\/[0-9a-f]{40}\/conformance/,
    );

    // One shot now. The mobile twin was the same screen at 390px, and the
    // format-inspection shot was the same chrome again around a two-line
    // synthetic fixture — the typed PDF_ADAPTER_REQUIRED refusal carries that
    // section instead.
    const screenshots = page.locator("figure.product-shot img");
    await expect(screenshots).toHaveCount(1);
    await expect(page.getByText("PDF_ADAPTER_REQUIRED")).toBeVisible();
    // Capture provenance comes from marketing-assets.json, not from the live
    // product version: the captions must state the version the image was
    // actually taken against.
    await expect(page.getByText("captured against v0.2.6 on 2026-07-26").first()).toBeVisible();
    await expect(screenshots.first()).toHaveAttribute("alt", /.+/);
    await expect(screenshots.first().locator("xpath=..").locator("figcaption")).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });

  test(`Fieldwork comparison is bounded at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/fieldwork-vs-langextract/");

    await expect(
      page.getByRole("heading", { level: 1, name: "Grounded extraction that continues through review, recheck, and proof." }),
    ).toBeVisible();
    await expect(page.getByRole("region", { name: "Fieldwork and Google LangExtract comparison table" })).toBeVisible();
    // The page concedes before it compares: where the other tool wins comes
    // BEFORE the table, so the table reads as analysis rather than a pitch.
    await expect(
      page.getByRole("heading", { name: "Four reasons to close this tab and use LangExtract." }),
    ).toBeVisible();
    await expect(page.getByText("LangExtract is the more mature tool on it")).toBeVisible();
    // Four disclaimers, in the reader's language. Two of the old six were cut:
    // "No upstream-suite result" raised a question nobody asked, and "Runtime
    // adapters are not a quality score" duplicated the accuracy card.
    await expect(page.getByRole("heading", { name: "Four things this page cannot tell you." })).toBeVisible();
    await expect(page.getByText("You cannot swap one for the other")).toBeVisible();
    await expect(page.getByText("Nothing here says either one is more accurate")).toBeVisible();
    await expect(page.getByText("We make no claim about multipass recall")).toBeVisible();
    await expect(page.getByText("PDFs and scans need an adapter you supply")).toBeVisible();
    // The comparison is grounded in a real run, not in prose about a run.
    await expect(page.getByText("Export refused: unresolved-review-item")).toBeVisible();
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

test("the content boundary ignores private untracked context but rejects tracked context", async () => {
  const root = await mkdtemp(join(tmpdir(), "kontour-content-boundary-"));
  try {
    await mkdir(join(root, "scripts"), { recursive: true });
    await mkdir(join(root, "context", "settings"), { recursive: true });
    await cp("scripts/check-content-boundary.cjs", join(root, "scripts", "check-content-boundary.cjs"));
    await writeFile(
      join(root, "context", "settings", "provider.json"),
      JSON.stringify({ project: "private-runtime-config" }),
    );
    await execFileAsync("git", ["init", "-q"], { cwd: root });

    const untracked = await execFileAsync("node", ["scripts/check-content-boundary.cjs"], { cwd: root });
    expect(untracked.stdout).toContain("Content boundary check passed.");

    await execFileAsync("git", ["add", "context/settings/provider.json"], { cwd: root });
    await expect(
      execFileAsync("node", ["scripts/check-content-boundary.cjs"], { cwd: root }),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining("private runtime context must not be tracked in this public repo"),
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("the content boundary rejects architecture-first product marketing", async () => {
  const root = await mkdtemp(join(tmpdir(), "kontour-marketing-boundary-"));
  try {
    await mkdir(join(root, "scripts"), { recursive: true });
    await mkdir(join(root, "src", "pages"), { recursive: true });
    await cp("scripts/check-content-boundary.cjs", join(root, "scripts", "check-content-boundary.cjs"));
    await writeFile(
      join(root, "src", "pages", "console.astro"),
      "<section><h2>Contracts first</h2><p>Git stays the authority.</p></section>",
    );
    await execFileAsync("git", ["init", "-q"], { cwd: root });
    await execFileAsync("git", ["add", "src/pages/console.astro"], { cwd: root });

    await expect(
      execFileAsync("node", ["scripts/check-content-boundary.cjs"], { cwd: root }),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining("product marketing includes an ownership reminder"),
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
