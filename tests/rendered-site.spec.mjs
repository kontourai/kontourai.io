import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("homepage shows the hero, six product cards, and the suite layering", async ({ page }) => {
  await page.goto("/");

  // Hero
  await expect(page.locator(".label-sm").filter({ hasText: "Kontour AI" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Show the work behind AI.", exact: true })).toBeVisible();
  await expect(page.getByText("Agents write code, run processes, and make claims faster than anyone").first()).toBeVisible();

  // CTAs
  await expect(page.locator('[data-umami-event="home-hero-github"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="home-hero-early-access"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="home-hero-early-access"]')).toHaveAttribute("href", "/early-access/");

  // The v1 launch framing is intentionally retired from the hero and cards
  await expect(page.getByText("Every product reached 1.0")).toHaveCount(0);

  // All six product names visible in the grid
  await expect(page.getByText("Surface").first()).toBeVisible();
  await expect(page.getByText("Survey", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Flow", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Veritas").first()).toBeVisible();
  await expect(page.getByText("Flow Agents").first()).toBeVisible();
  await expect(page.getByText("Console", { exact: true }).first()).toBeVisible();

  // Product grid cards link to product pages (multiple links per product exist; first() picks the grid card)
  await expect(page.locator('a[href="/surface"]').first()).toBeVisible();
  await expect(page.locator('a[href="/survey"]').first()).toBeVisible();
  await expect(page.locator('a[href="/flow"]').first()).toBeVisible();
  await expect(page.locator('a[href="/veritas"]').first()).toBeVisible();
  await expect(page.locator('a[href="/flow-agents"]').first()).toBeVisible();
  await expect(page.locator('a[href="/console"]').first()).toBeVisible();

  // "How it fits together" section with the layer stack
  await expect(page.locator(".label-sm").filter({ hasText: "How it fits together" })).toBeVisible();
  await expect(page.locator('[aria-label="Kontour product layer stack"]')).toBeVisible();

  // Terminal quickstart present
  await expect(page.getByText("npm install -D @kontourai/surface").first()).toBeVisible();

  // Subscribe and brand promise
  await expect(page.locator('[data-umami-event="home-subscribe"]')).toBeVisible();
  await expect(page.getByText("Evidence-backed confidence.").first()).toBeVisible();
  await expect(page.getByText("Not certainty theater.").first()).toBeVisible();

  // Teaser: product nav/footer links are hidden on the public home
  await expect(page.locator('[data-umami-event="nav-flow"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="nav-veritas"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="nav-surface"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="nav-survey"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="nav-flow-agents"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="nav-console"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-flow"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-veritas"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-surface"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-survey"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-console"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-github"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="footer-contact"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="footer-contact"]')).toHaveAttribute("href", "/early-access/");

  // Guard against leaked build-process / internal copy regressing back in
  await expect(page.getByText("still shaping")).toHaveCount(0);
  await expect(page.getByText("intentionally simple")).toHaveCount(0);
});

test("/preview no longer serves the old preview page", async ({ page }) => {
  // In production (Cloudflare Pages), _redirects issues a 301 to /.
  // In the local Vite preview server, the page is simply absent (404 served from 404.html).
  // Both outcomes are correct: the old preview content must not be reachable.
  await page.goto("/preview/", { waitUntil: "load" });
  const finalUrl = page.url();
  const redirectedAway = !finalUrl.includes("/preview");
  const got404 = await page.getByText("PRODUCT LINE PREVIEW").count() === 0;
  // Acceptable: redirected to home, or serving 404 without old preview content
  expect(redirectedAway || got404, `Old /preview content is still accessible at ${finalUrl}`).toBe(true);
});

test("early access page gives static contact paths", async ({ page }) => {
  await page.goto("/early-access/");

  await expect(page.getByRole("heading", { name: "Tell us where trust breaks." })).toBeVisible();
  await expect(page.getByText("Design partners, product builders, and teams shipping AI-assisted workflows.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Design partner" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Product builder" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Agent workflow team" })).toBeVisible();
  await expect(page.getByText("One concrete workflow is enough.")).toBeVisible();
  await expect(page.locator('[data-umami-event="early-access-hero-email"]')).toHaveAttribute("href", /mailto:hello@kontourai\.io/);

  // Teaser: product links are hidden here too (nav, footer, and inline)
  await expect(page.locator('[data-umami-event="nav-veritas"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-surface"]')).toHaveCount(0);
  await expect(
    page.locator('a[href="/surface"], a[href="/survey"], a[href="/flow"], a[href="/flow-agents"], a[href="/veritas"], a[href="/console"]')
  ).toHaveCount(0);
});

test("default social metadata includes canonical and share image", async ({ page }) => {
  await page.goto("/early-access/");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://kontourai.io/early-access/");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://kontourai.io/early-access/");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "https://kontourai.io/og/kontour-share.png");
  await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute("content", "image/png");
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", /Kontour AI share card/);
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", "https://kontourai.io/og/kontour-share.png");
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute("content", /Kontour AI share card/);
});

test("production analytics scripts are configured defensively", async ({ page }) => {
  await page.goto("/");

  const umami = page.locator('script[src="https://cloud.umami.is/script.js"]');
  await expect(umami).toHaveAttribute("data-website-id", "6a6ee693-2480-4bd2-a371-6af4e5f82e7d");
  await expect(umami).toHaveAttribute("data-domains", "kontourai.io,www.kontourai.io");
  await expect(umami).toHaveAttribute("data-do-not-track", "true");
  await expect(umami).toHaveAttribute("data-exclude-search", "true");
});

test("flow page explains process transparency and product boundaries", async ({ page }) => {
  await page.goto("/flow/");

  await expect(page.getByText("required paths, gates, evidence, and exceptions made inspectable")).toBeVisible();
  await expect(page.getByText("A trace says what happened.")).toBeVisible();
  await expect(page.getByText("Flow says why it was enough.")).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "What Flow answers" })).toBeVisible();
  await expect(page.getByText("What process path was required?")).toBeVisible();
  await expect(page.getByText("Why was the transition allowed or blocked?")).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Example use case" })).toBeVisible();
  await expect(page.getByText("A release path that waits for evidence.")).toBeVisible();
  await expect(page.getByText("rendered-page screenshot missing")).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "What Flow does not replace" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Workflow engines" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Agent frameworks" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Observability" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Policy systems" })).toBeVisible();

  // Guard against the old internal "the user sees" framing
  await expect(page.getByText("The user sees a useful workflow")).toHaveCount(0);
});

test("surface page presents inspectable claims and trust vocabulary", async ({ page }) => {
  await page.goto("/surface/");

  await expect(page.getByText("claims, evidence, freshness, and gaps in one inspectable shape").first()).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "What Surface answers" })).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Example use case" })).toBeVisible();
  await expect(page.getByText("This provider directory listing is current")).toBeVisible();
  await expect(page.getByText("show uncertainty beside recommendation")).toBeVisible();

  // Trust report output
  await expect(page.getByText("Transparency gaps:")).toBeVisible();
  await expect(page.getByText("Claim Groups:")).toBeVisible();

  // Trust vocabulary
  await expect(page.locator(".label-sm").filter({ hasText: "Trust vocabulary" })).toBeVisible();
  await expect(page.getByText("Claim", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Evidence", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Trust Snapshot").first()).toBeVisible();
  await expect(page.getByText("Transparency Gap").first()).toBeVisible();

  // Trust status model and Surface Console
  await expect(page.locator(".label-sm").filter({ hasText: "Trust status model" })).toBeVisible();
  await expect(page.getByText("Surface Console").first()).toBeVisible();

  // Products built with Surface
  await expect(page.locator(".label-sm").filter({ hasText: "Products built with Surface" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Veritas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your product", exact: true })).toBeVisible();

  // No project-specific public-data branding leakage
  await expect(page.getByText(new RegExp(`camp${"fit"}`, "i"))).toHaveCount(0);
});

test("veritas page shows the promise, a concrete catch, and the surface handoff", async ({ page }) => {
  await page.goto("/veritas/");

  await expect(page.getByText("code and change readiness made inspectable").first()).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "What Veritas makes possible" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Define what good looks like" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guide work at the moment of change" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Earn merge readiness" })).toBeVisible();

  // Concrete use-case section
  await expect(page.locator(".label-sm").filter({ hasText: "Example use case" })).toBeVisible();
  await expect(page.getByText("The catch you'd")).toBeVisible();
  await expect(page.getByText("api handler changed, test missing")).toBeVisible();

  // Current CLI and the Surface handoff
  await expect(page.locator(".label-sm").filter({ hasText: "Current CLI" })).toBeVisible();
  await expect(page.getByText("Veritas is built with Surface.")).toBeVisible();
});

test("survey page explains the producer pipeline and surface handoff", async ({ page }) => {
  await page.goto("/survey/");

  await expect(page.getByText("review workflow for producing trustworthy Surface-ready claims").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Survey", exact: true })).toBeVisible();

  // Producer pipeline
  await expect(page.locator(".label-sm").filter({ hasText: "The producer pipeline" })).toBeVisible();
  await expect(page.getByText("Raw Source", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Source Reference").first()).toBeVisible();
  await expect(page.getByText("Extraction", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Candidate", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Review", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Claim", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Needs Review").first()).toBeVisible();

  // Boundary and helpers
  await expect(page.getByRole("heading", { name: "Survey owns" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Producers own" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Surface owns" })).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Consumer adapter contract" })).toBeVisible();
  await expect(page.getByText("ReviewPresentationAdapter").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Read the integration guide" })).toHaveAttribute(
    "href",
    "https://github.com/kontourai/survey/blob/main/docs/consumer-integration-guide.md",
  );
  await expect(page.getByText("fieldObservation()").first()).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Example use case" })).toBeVisible();
  await expect(page.getByText("public record and needs to preserve the extraction")).toBeVisible();

  // Surface handoff
  await expect(page.getByText("Survey produces.")).toBeVisible();
  await expect(page.getByText("Surface makes it inspectable.")).toBeVisible();
  await expect(page.getByText("Surface TrustBundle").first()).toBeVisible();
});

test("console page presents the suite operating plane and boundary", async ({ page }) => {
  await page.goto("/console/");

  await expect(page.getByText("suite trust state made operable without becoming the source of truth").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Console", exact: true })).toBeVisible();
  const consoleStatus = JSON.parse(
    await readFile(new URL("../src/data/product-status.json", import.meta.url), "utf8"),
  ).products.console;
  await expect(page.getByText(`v${consoleStatus.version}`).first()).toBeVisible();

  // Operating state + plane
  await expect(page.locator(".label-sm").filter({ hasText: "What it's built to answer" })).toBeVisible();
  await expect(page.getByText("Primitives make transparency portable.").first()).toBeVisible();

  // Honest framing: illustrative, not a live cross-product feed yet
  await expect(page.getByText("illustrative").first()).toBeVisible();

  // Unified work queue
  await expect(page.locator(".label-sm").filter({ hasText: "Unified work queue" })).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Example use case" })).toBeVisible();
  await expect(page.getByText("A release operator sees what needs attention.")).toBeVisible();
  await expect(page.getByText("release-browser-check missing")).toBeVisible();

  // Boundary — Console owns / does not own / primitives stay portable
  await expect(page.getByRole("heading", { name: "Console owns" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Console does not own" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Primitives stay portable" })).toBeVisible();
});

test("developers page maps product ownership, lifecycle, and maturity on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/developers/");

  await expect(page.locator('[data-umami-event="nav-developers"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="nav-developers"]')).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Kontour for developers" })).toBeVisible();

  await expect(page.getByText("Surface owns trust records.")).toBeVisible();
  await expect(page.getByText("Flow owns process semantics.")).toBeVisible();
  await expect(page.getByText("Veritas owns repo readiness.")).toBeVisible();
  await expect(page.getByText("Flow Agents brings those disciplines")).toBeVisible();

  await expect(page.getByLabel("Product relationship layer map")).toBeVisible();
  await expect(page.getByLabel("Product relationship layer map").getByText("Trust substrate")).toBeVisible();
  await expect(page.getByLabel("Product relationship layer map").getByText("Builder Kit")).toBeVisible();
  await expect(page.getByLabel("Evidence lifecycle flow")).toBeVisible();
  await expect(page.getByLabel("Evidence lifecycle flow").getByText("Readiness evidence")).toBeVisible();
  await expect(page.getByLabel("Evidence lifecycle flow").getByText("Trust projection")).toBeVisible();

  await expect(page.getByRole("heading", { name: "Sales / RevOps" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Software delivery" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Public data and records" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Regulated advisory review" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Support and customer operations" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Current state", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Near-term direction", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Future possibilities", exact: true })).toBeVisible();
  await expect(page.getByText("Kubernetes-style operators")).toBeVisible();
  await expect(page.getByText("They are not current requirements")).toBeVisible();

  await expect(page.getByRole("link", { name: "Product page" }).first()).toHaveAttribute("href", "/surface/");
  await expect(page.locator('[data-umami-event="developers-surface-repo"]')).toHaveAttribute("href", "https://github.com/kontourai/surface");
  await expect(page.locator('[data-umami-event="footer-developers"]')).toBeVisible();

  await expect(page.getByText("raw internal critique")).toHaveCount(0);
  await expect(page.getByText("production-ready Kubernetes operator")).toHaveCount(0);
  await expect(page.getByText("current Kubernetes runtime")).toHaveCount(0);
});

test("developers page keeps visual maps readable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1200 });
  await page.goto("/developers/");

  await expect(page.getByRole("heading", { name: "Kontour for developers" })).toBeVisible();
  await expect(page.getByLabel("Product relationship layer map")).toBeVisible();
  await expect(page.getByLabel("Evidence lifecycle flow")).toBeVisible();
  await expect(page.locator(".ownership-map")).toHaveCSS("display", "grid");

  const viewport = page.viewportSize();
  const mapBox = await page.locator(".ownership-map").boundingBox();
  const lifecycleBox = await page.locator(".lifecycle").boundingBox();
  expect(viewport).not.toBeNull();
  expect(mapBox).not.toBeNull();
  expect(lifecycleBox).not.toBeNull();
  if (viewport && mapBox && lifecycleBox) {
    expect(mapBox.x).toBeGreaterThanOrEqual(0);
    expect(lifecycleBox.x).toBeGreaterThanOrEqual(0);
    expect(mapBox.x + mapBox.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(lifecycleBox.x + lifecycleBox.width).toBeLessThanOrEqual(viewport.width + 1);
  }
});

test("flow agents page presents agent-tool discipline and status", async ({ page }) => {
  await page.goto("/flow-agents/");

  await expect(page.getByRole("heading", { name: "Flow Agents", exact: true })).toBeVisible();
  await expect(page.getByText("Flow and Veritas discipline inside the agents you already use").first()).toBeVisible();

  // Published status, not vapor: badge shows the released version from metadata
  const { products } = JSON.parse(
    await readFile(new URL("../src/data/product-status.json", import.meta.url), "utf8"),
  );
  await expect(page.getByText(`v${products["flow-agents"].version}`).first()).toBeVisible();

  // Real capabilities: runtimes, Flow Kits with the Builder Kit, and an install path
  await expect(page.locator(".label-sm").filter({ hasText: "Flow Kits" }).first()).toBeVisible();
  await expect(page.getByText("Builder Kit").first()).toBeVisible();
  await expect(page.getByText("flow-kit install-local").first()).toBeVisible();
  await expect(page.getByText("Claude Code").first()).toBeVisible();
  await expect(page.getByText("idea-to-backlog").first()).toBeVisible();
  await expect(page.getByText("npx @kontourai/flow-agents init").first()).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Example use case" })).toBeVisible();
  await expect(page.getByText("from idea to backlog to plan")).toBeVisible();

  // Guard against the old "coming soon" framing regressing back in
  await expect(page.getByText("coming soon")).toHaveCount(0);
});
