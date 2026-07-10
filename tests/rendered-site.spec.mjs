import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { validateTrustBundle } from "@kontourai/surface";

test("homepage leads with a single Flow Agents headline and Survey as the proof story", async ({ page }) => {
  await page.goto("/");

  // AC1: exactly one hero headline story — the Flow Agents wedge — above the fold.
  await expect(page.locator(".label-sm").filter({ hasText: "Kontour · Flow Agents" }).first()).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Ship AI-built code you can stand behind.", exact: true }),
  ).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByText("AI agents write more code than anyone can review by hand.").first()).toBeVisible();

  // Hero CTAs
  await expect(page.locator('[data-umami-event="home-hero-early-access"]')).toHaveAttribute("href", "/early-access/");
  await expect(page.locator('[data-umami-event="home-hero-flow-agents"]')).toHaveAttribute("href", "/flow-agents/");
  await expect(page.locator('[data-umami-event="home-hero-github"]')).toBeVisible();

  // AC5: enforcement framing renders.
  await expect(page.getByText("Prompts are advice.").first()).toBeVisible();
  await expect(page.getByText("Gates are laws.").first()).toBeVisible();

  // Mechanism section: "how a gate knows" the claim from the capture, sitting
  // between enforcement ("Prompts are advice.") and the proof section.
  await expect(page.locator(".label-sm").filter({ hasText: "How a gate knows" }).first()).toBeVisible();
  const mechanismHeading = page.getByRole("heading", { level: 2 }).filter({ hasText: "Don't ask the agent." });
  await expect(mechanismHeading).toBeVisible();
  await expect(mechanismHeading).toContainText("Check the toothbrush.");
  await expect(page.getByText("1 · The claim")).toBeVisible();
  await expect(page.getByText("2 · The capture")).toBeVisible();
  await expect(page.getByText("3 · The recompute")).toBeVisible();
  await expect(page.locator('[data-umami-event="home-mechanism-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="home-mechanism-trust"]')).toHaveAttribute("href", "/trust/");

  const enforceBox = await page.getByText("Prompts are advice.").first().boundingBox();
  const mechanismBox = await page.locator(".label-sm").filter({ hasText: "How a gate knows" }).first().boundingBox();
  const proofBox = await page.locator(".label-sm").filter({ hasText: "The proof" }).first().boundingBox();
  expect(enforceBox).not.toBeNull();
  expect(mechanismBox).not.toBeNull();
  expect(proofBox).not.toBeNull();
  if (enforceBox && mechanismBox && proofBox) {
    expect(enforceBox.y).toBeLessThan(mechanismBox.y);
    expect(mechanismBox.y).toBeLessThan(proofBox.y);
  }

  // AC2: Survey proof section, subordinate to the hero (an h2, not a second h1).
  await expect(page.locator(".label-sm").filter({ hasText: "The proof" }).first()).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: "Grounded claims, not confident guesses." }),
  ).toBeVisible();
  await expect(page.getByText("Survey", { exact: true }).first()).toBeVisible();
  await expect(page.locator('[data-umami-event="home-proof-survey"]')).toHaveAttribute("href", "/survey/");

  // AC4: memory-vs-trust line renders.
  await expect(page.getByText("Memory tells the agent what it knows.").first()).toBeVisible();
  await expect(page.getByText("Kontour proves what its answers stood on.").first()).toBeVisible();

  // AC3: the "Six products. One job." architecture tour is NOT on the index.
  await expect(page.getByText("Six products. One job.")).toHaveCount(0);
  await expect(page.locator('[aria-label="Kontour product layer stack"]')).toHaveCount(0);
  // Old lead framing is retired.
  await expect(page.getByText("Show the work behind AI.")).toHaveCount(0);

  // Subscribe and brand promise
  await expect(page.locator('[data-umami-event="home-subscribe"]')).toBeVisible();
  await expect(page.getByText("Evidence-backed confidence.").first()).toBeVisible();
  await expect(page.getByText("Not certainty theater.").first()).toBeVisible();

  // AC6: the moved architecture tour stays reachable from the home teaser.
  await expect(page.locator('[data-umami-event="nav-developers"]')).toHaveAttribute("href", "/developers/");
  await expect(page.locator('[data-umami-event="home-cta-developers"]')).toHaveAttribute("href", "/developers/");
  await expect(page.locator('[data-umami-event="footer-developers"]')).toBeVisible();

  // #82: receipts are the proof story's evidence — reachable from the home
  // proof section, the nav, and the footer even under the teaser rules.
  await expect(page.locator('[data-umami-event="home-proof-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="nav-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="footer-receipts"]')).toHaveAttribute("href", "/receipts/");

  // #109: peak-conviction fork right after the proof story — both paths.
  await expect(page.locator('[data-umami-event="home-fork-early-access"]')).toHaveAttribute("href", "/early-access/");
  await expect(page.locator('[data-umami-event="home-fork-trust"]')).toHaveAttribute("href", "/trust/");
  await expect(page.getByText("Skeptical? Good.")).toBeVisible();
  await expect(page.getByText("See how to cheat it →")).toBeVisible();
  // Placement: proof pull-quote above the fork, fork above the promise.
  const proofPullBox = await page.getByText("Memory tells the agent what it knows.").boundingBox();
  const forkBox = await page.getByText("Skeptical? Good.").boundingBox();
  const promiseBox = await page.getByRole("heading", { name: "Evidence-backed confidence." }).boundingBox();
  expect(proofPullBox).not.toBeNull();
  expect(forkBox).not.toBeNull();
  expect(promiseBox).not.toBeNull();
  expect(proofPullBox.y).toBeLessThan(forkBox.y);
  expect(forkBox.y).toBeLessThan(promiseBox.y);
  await expect(page.locator('[data-umami-event="footer-trust"]')).toHaveAttribute("href", "/trust/");

  // Teaser: product nav/footer links stay hidden on the public home
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
  await expect(page.locator("p.footer__category")).toHaveText("The receipt layer for AI work.");

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

  // #82: receipts stay reachable even on teaser pages (it is proof, not a product).
  await expect(page.locator('[data-umami-event="nav-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="footer-receipts"]')).toHaveAttribute("href", "/receipts/");

  // Teaser: product links are hidden here too (nav, footer, and inline)
  await expect(page.locator('[data-umami-event="nav-veritas"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-surface"]')).toHaveCount(0);
  await expect(
    page.locator('a[href="/surface/"], a[href="/survey/"], a[href="/flow/"], a[href="/flow-agents/"], a[href="/veritas/"], a[href="/console/"]')
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

test("pages without a custom description fall back to the receipt-layer default", async ({ page }) => {
  await page.goto("/404/");

  const defaultDescription =
    "The receipt layer for AI work. Kontour makes AI-assisted work inspectable — what was claimed, what supports it, which gates it passed, and what is still uncertain.";
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", defaultDescription);
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", defaultDescription);

  // Old lead framing is retired from the default description too.
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute("content", /Show the work behind AI\./);
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
  await expect(page.getByText("Claim groups:")).toBeVisible();

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

  // AC3: the "Six products. One job." architecture tour now lives here.
  await expect(page.getByRole("heading", { name: "Six products. One job." })).toBeVisible();
  await expect(page.locator('[aria-label="Kontour product layer stack"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="developers-product-survey"]')).toHaveAttribute("href", "/survey/");
  await expect(page.locator('[data-umami-event="developers-product-console"]')).toHaveAttribute("href", "/console/");

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
  await expect(page.getByText("trust machinery for the agent you already run").first()).toBeVisible();

  // Published status, not vapor: badge shows the released version from metadata
  const { products } = JSON.parse(
    await readFile(new URL("../src/data/product-status.json", import.meta.url), "utf8"),
  );
  await expect(page.getByText(`v${products["flow-agents"].version}`).first()).toBeVisible();

  // Real capabilities: engine discipline, kit portfolio, runtime adapters, and an install path
  await expect(page.getByText("product-neutral runtime for Flow Definitions, gates")).toBeVisible();
  await expect(page.getByText("The engine", { exact: true })).toBeVisible();
  await expect(page.getByText("Kit portfolio", { exact: true })).toBeVisible();
  await expect(page.getByText("Builder Kit").first()).toBeVisible();
  await expect(page.getByText("Knowledge Kit").first()).toBeVisible();
  await expect(page.getByText("kits/catalog.json").first()).toBeVisible();
  await expect(page.getByText("Claude Code").first()).toBeVisible();
  await expect(page.getByText("Codex").first()).toBeVisible();
  await expect(page.getByText("npx @kontourai/flow-agents init").first()).toBeVisible();
  await expect(page.getByText("not one blessed workflow")).toBeVisible();

  // Guard against the old "coming soon" framing regressing back in
  await expect(page.getByText("coming soon")).toHaveCount(0);

  // #110: the shared enforcement matrix is applied here — badges come from
  // EnforcementBadge (data-enforcement fingerprint), not hand-rolled spans.
  await expect(page.getByRole("heading", { name: "Where the gate actually blocks, per runtime" })).toBeVisible();
  const faMatrix = page.locator(".enforcement-table");
  await expect(faMatrix.getByRole("row", { name: /Claude Code/ }).locator('[data-enforcement="blocking"]')).toHaveText("Blocking");
  await expect(faMatrix.getByRole("row", { name: /Kiro/ }).locator('[data-enforcement="advisory"]')).toHaveText("Advisory / opt-in block");
  await expect(faMatrix.getByRole("row", { name: /opencode/ }).locator('[data-enforcement="advisory"]')).toHaveText("Advisory / partial");
  await expect(faMatrix.getByRole("row", { name: /Other harnesses/ }).locator('[data-enforcement="spec-only"]')).toHaveText("Spec-only");
});

test("receipts index lists the real pipeline bundles with downloads", async ({ page }) => {
  await page.goto("/receipts/");

  await expect(page.getByRole("heading", { name: "Check the receipts yourself" })).toBeVisible();

  // #82: the receipts nav link marks itself active on the receipts surface.
  await expect(page.locator('[data-umami-event="nav-receipts"]')).toHaveAttribute("aria-current", "page");

  // Honest framing (AC5): our own pipelines, no external-adoption claim.
  await expect(page.getByText("Kontour's own pipeline receipts")).toBeVisible();
  await expect(page.getByText(/an outside team has adopted it/)).toBeVisible();

  // #107: the page LEADS with the blocked run — demo, not archive.
  await expect(page.getByRole("heading", { name: "The receipt that says no." })).toBeVisible();
  // The story beats are derived from the bundle, not hand-authored.
  await expect(page.getByText("software-readiness-verdict").first()).toBeVisible();
  await expect(page.getByText("required-veritas-cli-artifacts").first()).toBeVisible();
  await expect(page.getByText("passing: false")).toBeVisible();
  await expect(page.locator('[data-umami-event="receipts-lead-blocked"]')).toHaveAttribute(
    "href",
    "/receipts/governance-readiness-not-ready/",
  );
  await expect(page.locator('[data-umami-event="receipts-lead-download"]')).toHaveAttribute(
    "href",
    "/receipts/governance-readiness-not-ready.trust.bundle",
  );
  // Honest framing on the lead exhibit: a fixture projection, not a live stopped run.
  await expect(page.getByText("not a live delivery stopped mid-run")).toBeVisible();
  // The blocked exhibit renders ABOVE the archive grid.
  const blockedBox = await page.getByRole("heading", { name: "The receipt that says no." }).boundingBox();
  const archiveBox = await page.getByRole("heading", { name: "Every published receipt, green or not." }).boundingBox();
  expect(blockedBox).not.toBeNull();
  expect(archiveBox).not.toBeNull();
  expect(blockedBox.y).toBeLessThan(archiveBox.y);

  // All four receipts are present.
  await expect(page.getByRole("heading", { name: "Flow Agents delivery bundle" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Governance Kit readiness — ready verdict" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Governance Kit readiness — blocked verdict" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Flow Agents ownership-guard bundle" })).toBeVisible();

  // Each has a rendered-view link and a raw download link (AC2/AC3).
  for (const slug of [
    "flow-agents-delivery",
    "governance-readiness-ready",
    "governance-readiness-not-ready",
    "flow-agents-ownership-guard",
  ]) {
    // Scoped to the archive grid so the lead exhibit's duplicate links (#107)
    // can't satisfy these on a card's behalf.
    const archiveGrid = page.locator(".archive-grid");
    await expect(archiveGrid.locator(`a[href="/receipts/${slug}/"]`)).toBeVisible();
    await expect(archiveGrid.locator(`a[href="/receipts/${slug}.trust.bundle"][download]`)).toBeVisible();
  }

  // #111: the second-validator affordance shows the exact pinned hachure+ajv
  // stack from package.json (check-receipts enforces the pins + runs the CLI).
  const { devDependencies } = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );
  await expect(page.getByText("two implementations, same verdict")).toBeVisible();
  // Honest independence scope: separate implementations, shared maintainer.
  await expect(page.getByText("not yet organizationally independent")).toBeVisible();
  await expect(
    page.getByText(`npx -y -p ajv@${devDependencies.ajv} -p hachure@${devDependencies.hachure} hachure validate`).first(),
  ).toBeVisible();

  // Each card names its own exact "check it yourself" command.
  await expect(page.getByText("Check it yourself")).toHaveCount(4);
  for (const slug of [
    "flow-agents-delivery",
    "governance-readiness-ready",
    "governance-readiness-not-ready",
    "flow-agents-ownership-guard",
  ]) {
    await expect(
      page.getByText(`npx @kontourai/surface@2.1.2 report --input ${slug}.trust.bundle --format summary`),
    ).toBeVisible();
  }
});

test("a receipt view renders the bundle's actual derived contents", async ({ page }) => {
  await page.goto("/receipts/governance-readiness-not-ready/");

  await expect(page.getByRole("heading", { name: "Governance Kit readiness — blocked verdict" })).toBeVisible();

  // Status derived from the artifact, not hardcoded: this bundle's claim is disputed.
  await expect(page.locator(".trust-badge--disputed").first()).toBeVisible();

  // The actual claim type from the bundle is shown.
  await expect(page.getByText("software-readiness-verdict").first()).toBeVisible();

  // #111: the per-file second-opinion command names the exact pinned stack
  // and THIS receipt's file — a hardcoded version or wrong slug fails here.
  const slugPagePins = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  ).devDependencies;
  await expect(
    page.getByText(`npx -y -p ajv@${slugPagePins.ajv} -p hachure@${slugPagePins.hachure} hachure validate`),
  ).toBeVisible();
  await expect(page.getByText("governance-readiness-not-ready.trust.bundle").first()).toBeVisible();
  await expect(page.getByText("second opinion — the reference CLI")).toBeVisible();

  // Provenance links to the immutable commit; download button points at the raw file.
  await expect(
    page.locator('a[href*="7a083966db47672ea552f13264ea3111e08fa06b"]'),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/receipts/governance-readiness-not-ready.trust.bundle"][download]'),
  ).toBeVisible();

  // The eyebrow above the command block was relabeled "Check it yourself"
  // (was "Verify it yourself"); this command names the validator.
  await expect(page.locator(".label-sm").filter({ hasText: "Check it yourself" }).first()).toBeVisible();
  await expect(page.getByText("Verify it yourself")).toHaveCount(0);
  await expect(page.getByText("npx @kontourai/surface").first()).toBeVisible();
  await expect(page.getByText("validateTrustBundle").first()).toBeVisible();
});

test("the ownership-guard receipt discloses its waived pre-existing-failure gap", async ({ page }) => {
  await page.goto("/receipts/flow-agents-ownership-guard/");

  await expect(page.getByRole("heading", { name: "Flow Agents ownership-guard bundle" })).toBeVisible();

  // AC: the gaps section is visible and names the waived claim from the bundle
  // (subjectId ends with pre-existing-failure-baseline) rather than hiding it.
  await expect(page.getByRole("heading", { name: "Gaps this receipt does not hide" })).toBeVisible();
  await expect(
    page
      .locator(".gap-item")
      .filter({ hasText: "Three eval suites carry failures independently reproduced as pre-existing baselines" }),
  ).toBeVisible();
  await expect(page.getByText('high-impact but status is "assumed"').first()).toBeVisible();
});

test("trust page states the honest ceiling, the bypass list, the assurance dial, and honest runtime badging", async ({ page }) => {
  await page.goto("/trust/");

  // Section 1 — hero: the honest ceiling. Exactly one h1 on the page.
  await expect(
    page.getByRole("heading", { level: 1, name: "We can't certify an agent is right. No one can.", exact: true }),
  ).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByText("status = f(evidence, …)").first()).toBeVisible();
  await expect(page.getByText("Recomputable", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Captured, not narrated").first()).toBeVisible();
  await expect(page.getByText("Refuses or escalates", { exact: true }).first()).toBeVisible();
  await expect(page.locator('[data-umami-event="trust-hero-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="trust-hero-early-access"]')).toHaveAttribute("href", "/early-access/");

  // Section 2 — the bypass list: three cheat rows, each badged.
  await expect(
    page.getByRole("heading", { level: 2, name: "Three ways to cheat it — and who catches each one." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tamper with it locally." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Forge the content." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bypass as an admin." })).toBeVisible();
  await expect(page.getByText("Caught", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Named, not caught")).toBeVisible();
  await expect(page.getByText("never \"tamper-proof.\"")).toBeVisible();
  // CI authority is scoped to repos with the required check configured — never universal.
  await expect(page.getByText("with the Trust Verify job wired in").first()).toBeVisible();
  await expect(page.getByText("installing the tool doesn't configure your branch protection")).toBeVisible();
  await expect(page.getByText("on where we build Flow Agents, off by default")).toBeVisible();
  await expect(page.getByText("It is the irreducible human boundary").first()).toBeVisible();

  // Section 3 — objection handler: "isn't that what CI does?"
  await expect(
    page.getByRole("heading", { level: 2, name: "But isn't that what CI does?" }),
  ).toBeVisible();
  // The opening concession must stay intact -- house rule, never silently drop it.
  await expect(page.getByText("We don't claim otherwise.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "CI is green on what nobody wrote a check for." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "We run inside CI too." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Before CI, in the loop." })).toBeVisible();

  // Section 4 — the assurance dial (L0/L1/L2), the load-bearing distinction.
  await expect(page.getByRole("heading", { name: "Turn up assurance as the stakes rise." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "L0 — Unsigned, local." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "L1 — Keyless CI identity." })).toBeVisible();
  // Transparency-log anchoring is optional for L1 (Hachure spec) — the copy must not imply it's intrinsic.
  await expect(page.getByText("optionally anchored in a public transparency log")).toBeVisible();
  await expect(page.getByRole("heading", { name: "L2 — Organization-held keys." })).toBeVisible();
  await expect(page.getByText("Assurance caps trust in provenance, never in derivation.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Hachure specification" })).toHaveAttribute(
    "href",
    "https://github.com/hachure-org/spec/blob/main/assurance.md",
  );

  // Section 5 — runtime enforcement, badged honestly (blocking vs advisory).
  await expect(
    page.getByRole("heading", { name: "Enforcement isn't uniform. Here's exactly where it blocks." }),
  ).toBeVisible();
  const runtimeTable = page.locator(".enforcement-table");
  await expect(runtimeTable.getByRole("row", { name: /Claude Code/ }).locator(".trust-badge--verified")).toHaveText("Blocking");
  await expect(runtimeTable.getByRole("row", { name: /Codex/ }).locator(".trust-badge--verified")).toHaveText("Blocking");
  // Kiro ships the engine's warn default (only Claude Code/Codex ship block) —
  // badging it "Blocking" was an overclaim, fixed in #110.
  await expect(runtimeTable.getByRole("row", { name: /Kiro/ }).locator(".trust-badge--stale")).toHaveText("Advisory / opt-in block");
  await expect(runtimeTable.getByRole("row", { name: /opencode/ }).locator(".trust-badge--stale")).toHaveText("Advisory / partial");
  await expect(runtimeTable.getByRole("row", { name: /^pi\s/ }).locator(".trust-badge--stale")).toHaveText("Advisory / partial");
  await expect(runtimeTable.getByRole("row", { name: /AWS Strands/ }).locator(".trust-badge--stale")).toHaveText("Advisory / partial");
  await expect(runtimeTable.getByRole("row", { name: /Other harnesses/ }).locator(".trust-badge--unknown")).toHaveText("Spec-only");
  await expect(page.getByText("it refuses or escalates to you, never silently proceeds.")).toBeVisible();
  // The hook-conformance scale must stay visibly distinct from the signing assurance dial.
  await expect(page.getByText("a different dial from the signing assurance levels above")).toBeVisible();

  // Section 6 — two receipt-linked stories + CTA pair.
  await expect(page.getByRole("heading", { name: "Two times the boundary held." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The agent that refused its own admin powers" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "The security fix that almost shipped its own backdoor" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "ADR 0017" }).first()).toHaveAttribute(
    "href",
    "https://github.com/kontourai/flow-agents/blob/main/docs/adr/0017-anti-gaming-trust-security-model.md",
  );
  await expect(page.getByRole("link", { name: "Flow Agents PR #475" })).toHaveAttribute(
    "href",
    "https://github.com/kontourai/flow-agents/pull/475",
  );
  await expect(page.locator('[data-umami-event="trust-cta-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="trust-cta-early-access"]')).toHaveAttribute("href", "/early-access/");

  // Footer + mechanism seed link both resolve to /trust/ from this page too.
  await expect(page.locator('[data-umami-event="footer-trust"]')).toHaveAttribute("href", "/trust/");
});

test("published bundles download and validate under the named validator", async ({ page }) => {
  for (const slug of [
    "flow-agents-delivery",
    "governance-readiness-ready",
    "governance-readiness-not-ready",
    "flow-agents-ownership-guard",
  ]) {
    const response = await page.request.get(`/receipts/${slug}.trust.bundle`);
    expect(response.status(), `${slug} download status`).toBe(200);
    const parsed = JSON.parse(await response.text());
    // AC4: the downloaded artifact passes the named validator.
    expect(() => validateTrustBundle(parsed), `${slug} validates`).not.toThrow();
  }
});
