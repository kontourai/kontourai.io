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

  // #113: recognition moments — examples first, mechanism second.
  await expect(page.getByRole("heading", { name: "You've watched this happen." })).toBeVisible();
  // Credibility ordering: the backstop/memory case leads (believable AND implemented).
  await expect(page.getByText('"Said done — never actually ran it."')).toBeVisible();
  await expect(page.getByText('"The summary said pass; the log said fail."')).toBeVisible();
  await expect(page.getByText('"Masked the exit code."')).toBeVisible();
  await expect(page.getByText('"Edited the evidence record."')).toBeVisible();
  await expect(page.getByText('"Made the gate green under pressure."')).toBeVisible();
  await expect(page.locator(".narrator__moment")).toHaveCount(5);
  // Doctrine ordering pinned in full (marketing-hooks credibility ordering).
  await expect(page.locator(".narrator__moment .narrator__quote")).toHaveText([
    '"Said done — never actually ran it."',
    '"The summary said pass; the log said fail."',
    '"Masked the exit code."',
    '"Edited the evidence record."',
    '"Made the gate green under pressure."',
  ]);
  // The hero's catch is the backstop re-run — the doctrine's load-bearing claim.
  await expect(page.getByText("re-runs the project's own declared check itself")).toBeVisible();
  // Moment 5 must NOT imply an unconditional CI identity (signing is opt-in;
  // scope lives on /trust) — it claims only the fresh, untouched-env re-run.
  await expect(page.getByText("in an environment the agent never touched")).toBeVisible();
  // Residuals stated as gaps, never as catches — all three named.
  await expect(page.getByText("Honest residuals:")).toBeVisible();
  await expect(page.getByText("isn't auto-invalidated when the code changes afterward")).toBeVisible();
  await expect(page.getByText("a narrowed test scope isn't detected")).toBeVisible();
  await expect(page.getByText("an edited test slips the runtime gate")).toBeVisible();
  await expect(page.locator('[data-umami-event="home-narrator-trust"]')).toHaveAttribute("href", "/trust/");
  // Examples-first placement: the recognition block renders above the mechanism.
  const narratorBox = await page.getByRole("heading", { name: "You've watched this happen." }).boundingBox();
  const toothbrushBox = await page.getByRole("heading", { name: "Don't ask the agent. Check the toothbrush." }).boundingBox();
  expect(narratorBox).not.toBeNull();
  expect(toothbrushBox).not.toBeNull();
  expect(narratorBox.y).toBeLessThan(toothbrushBox.y);
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
  await expect(page.locator('[data-umami-event="nav-builder-kit"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="nav-knowledge-kit"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="nav-console"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-flow"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-veritas"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-surface"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-survey"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-builder-kit"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-knowledge-kit"]')).toHaveCount(0);
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

  // #91 F12: published packages link their npmjs page (parity with Surface/Survey/Veritas).
  await expect(page.locator('[data-umami-event="flow-hero-npm"]')).toHaveAttribute(
    "href",
    "https://www.npmjs.com/package/@kontourai/flow",
  );

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

  // Flow 3.0 runtime root: generated run state lives under .kontourai/flow, not .flow.
  await expect(page.getByText(".kontourai/flow/runs/dev-1847/report.md")).toBeVisible();
  await expect(page.getByText(".kontourai/flow/runs/<id>/")).toBeVisible();
  await expect(page.getByText("Reading: .kontourai/flow/runs/dev-1847/")).toBeVisible();
  await expect(page.getByText(/\.flow\/runs/)).toHaveCount(0);
  // Flow Agents runtime list matches src/lib/products.ts.
  await expect(page.getByText("Codex, Kiro, opencode, pi, and GitHub Actions").first()).toBeVisible();
  // #164 enrichment: run lifecycle authority + kits as the distribution unit.
  await expect(page.getByRole("heading", { name: "Pausing a run is a decision, and it says who decided." })).toBeVisible();
  await expect(page.getByText("flow pause dev-1847 --request pause-request.json")).toBeVisible();
  await expect(page.getByText("flow kit validate ./release-kit")).toBeVisible();

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

  // Trust status model shows the full nine-status taxonomy (src/status-taxonomy.ts).
  await expect(page.locator(".label-sm").filter({ hasText: "Trust status model" })).toBeVisible();
  await expect(page.locator(".status-card")).toHaveCount(9);
  for (const status of ["unknown", "proposed", "assumed", "verified", "stale", "disputed", "superseded", "rejected", "revoked"]) {
    await expect(page.locator(".status-card .trust-badge").filter({ hasText: status }).first()).toBeVisible();
  }

  // Surface Console — including the multi-producer merge shipped in 2.1.0.
  await expect(page.getByText("Surface Console").first()).toBeVisible();
  await expect(page.getByText("merge multiple").first()).toBeVisible();
  await expect(page.getByText("kontour-surface-validation-examples")).toBeVisible();
  await expect(page.getByText("kontour-surface-validation-fixtures")).toHaveCount(0);

  // #164 enrichment: agent tooling, waiver validity, customer-facing surfaces,
  // and the conformance suite — all shipped capabilities the page omitted.
  await expect(page.getByRole("heading", { name: "Agent-queryable (MCP)" })).toBeVisible();
  await expect(page.getByText("npx surface mcp")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Waiver validity" })).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Show it to your users" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trust Panel embed" })).toBeVisible();
  await expect(page.getByText("<surface-trust-panel>")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Snapshot viewer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Built with Surface badge" })).toBeVisible();
  await expect(page.getByText("A conformance suite lives in the Surface repo")).toBeVisible();
  await expect(page.getByText("never leaves the page")).toBeVisible();

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
  // #164 enrichment: exceptions are first-class and attributed.
  await expect(page.getByText("authority-backed decision to accept")).toBeVisible();
  await expect(page.getByText("accepted by exception").first()).toBeVisible();

  // Integrations name all four supported runtimes, not just claude-code.
  await expect(page.getByText("codex, claude-code, cursor, or copilot")).toBeVisible();
  // Attestation copy is scoped to what ships: the authorizing block is optional,
  // records verbatim words or a prompt/response exchange — "environment" is not a field.
  await expect(page.getByText("Attestations can record how authorization was collected")).toBeVisible();
  await expect(page.getByText("the channel, the environment")).toHaveCount(0);
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
  // Review statuses named truthfully (ReviewStatus: verified | assumed | rejected | proposed).
  await expect(page.getByText("verified, assumed, rejected, or proposed").first()).toBeVisible();
  await expect(page.getByText("Needs Review")).toHaveCount(0);
  // Install hint carries the runtime dep + Surface companion, per the README quickstart.
  await expect(page.getByText("npm install @kontourai/survey @kontourai/surface").first()).toBeVisible();
  // fieldObservation example carries the claim fields required since surface-2.0.
  await expect(page.getByText("facet").first()).toBeVisible();
  await expect(page.getByText("fieldOrBehavior").first()).toBeVisible();

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

  // #164 enrichment: review surfaces (MCP, standalone console, flywheel).
  await expect(page.getByRole("heading", { name: "The queue meets the reviewer where they already are." })).toBeVisible();
  await expect(page.getByText("npx survey-review-mcp")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Review Console" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reviewed learning updates" })).toBeVisible();
  // 1.9/1.10: calibration derived from owned review outcomes.
  await expect(page.getByRole("heading", { name: "Calibrated confidence" })).toBeVisible();
  await expect(page.getByText("labeled sample")).toBeVisible();

  // Surface handoff
  await expect(page.getByText("Survey produces.")).toBeVisible();
  await expect(page.getByText("Surface makes it inspectable.")).toBeVisible();
  await expect(page.getByText("Surface TrustBundle").first()).toBeVisible();
});

test("reference story: LLM proposes, structure verifies (#74)", async ({ page }) => {
  await page.goto("/writing/llm-proposes-structure-verifies/");

  await expect(page.getByRole("heading", { level: 1, name: "LLM proposes, structure verifies" })).toBeVisible();
  // The spine and the structural claim.
  await expect(page.getByText("extracted → resolved → verified")).toBeVisible();
  await expect(page.getByText("can only read verified facts.")).toBeVisible();
  // The honesty block: no LLM-in-production overclaim, no competitor named.
  await expect(page.getByRole("heading", { name: "What we're not claiming" })).toBeVisible();
  await expect(page.getByText("deterministic parsers, not LLMs")).toBeVisible();
  await expect(page.getByText(/TaxHacker/i)).toHaveCount(0);
  // Private-repo boundary: mechanics described, internals never linked.
  await expect(page.getByText("a private household repo")).toBeVisible();
  await expect(page.locator('a[href*="briananderson1222"]')).toHaveCount(0);
  // Product links out.
  await expect(page.locator('.prose a[href="/survey/"]').first()).toBeVisible();
  await expect(page.locator('.prose a[href="/receipts/"]').first()).toBeVisible();

  // Discovery: the survey page links the story.
  await page.goto("/survey/");
  await expect(page.locator('[data-umami-event="survey-writing-story"]')).toHaveAttribute(
    "href",
    "/writing/llm-proposes-structure-verifies/",
  );
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

  // Honest framing: illustrative where feeds aren't live; Flow IS live via the bridge.
  await expect(page.getByText("illustrative").first()).toBeVisible();
  await expect(page.getByText("kontour-flow-bridge").first()).toBeVisible();
  await expect(page.getByText("still being wired in").first()).toBeVisible();
  // The runtime root moved to .kontourai/console in 2.0.0; the retired .kontour root must not render.
  await expect(page.getByText(".kontourai/console").first()).toBeVisible();
  await expect(page.getByText(/"\.kontour"/)).toHaveCount(0);
  // Maturity note is truthful: hosted private production deployment exists (OIDC login etc.).
  await expect(page.getByText("console.kontourai.io").first()).toBeVisible();
  await expect(page.getByText("OIDC").first()).toBeVisible();
  await expect(page.getByText("No hosted service. No login.")).toHaveCount(0);
  // Provenance claims stay attributable: the trust panel via the Flow bridge, no ledger indexing.
  await expect(page.getByText("Console doesn't index those delivery")).toBeVisible();
  await expect(page.getByText("Console indexes")).toHaveCount(0);

  // Unified work queue
  await expect(page.locator(".label-sm").filter({ hasText: "Unified work queue" })).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "Example use case" })).toBeVisible();
  await expect(page.getByText("A release operator sees what needs attention.")).toBeVisible();
  await expect(page.getByText("release-browser-check missing")).toBeVisible();

  // #164 enrichment: the run-it-locally quickstart with real suite-CLI commands.
  await expect(page.getByRole("heading", { name: "Two commands to a live operating plane." })).toBeVisible();
  await expect(page.getByText("kontour console serve")).toBeVisible();
  await expect(page.getByText("kontour-flow-bridge --flow-root .kontourai/flow --watch")).toBeVisible();
  await expect(page.getByText("publishes an OpenAPI spec for everything the UI")).toBeVisible();
  // The stale "Shared UI later" framing is retired (UI ships in the package).
  await expect(page.getByText("Shared UI later.")).toHaveCount(0);
  await expect(page.getByText("The shared UI shipped on top.")).toBeVisible();

  // Boundary — Console owns / does not own / primitives stay portable
  await expect(page.getByRole("heading", { name: "Console owns" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Console does not own" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Primitives stay portable" })).toBeVisible();
});

test("kit pages show real sidecar/store shapes and record dimensions", async ({ page }) => {
  // Builder Kit: sidecar state is keyed by work-item slug (flow-agents getting-started).
  await page.goto("/builder-kit/");
  await expect(page.getByText(".kontourai/flow-agents/issue-214-search-filters/")).toBeVisible();
  await expect(page.getByText(".kontourai/flow-agents/builder.build/")).toHaveCount(0);

  // Knowledge Kit: the shipped record dimensions — no "Authority" field exists in the store contract.
  await page.goto("/knowledge-kit/");
  await expect(page.getByRole("heading", { name: "Record type" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Authority" })).toHaveCount(0);
  await expect(page.getByText("owner label present")).toHaveCount(0);
  await expect(page.getByText("authority required before durable promotion")).toHaveCount(0);
  await expect(page.getByText("source refs to every raw required")).toBeVisible();
  await expect(page.getByText("mutation log intact")).toBeVisible();
  // Store root is a constructor argument with no default path — shown as adopter-chosen.
  await expect(page.getByText("root you configure")).toBeVisible();
  // #164 enrichment: store adapters + hygiene (verified vs kits/knowledge/adapters/).
  await expect(page.getByRole("heading", { name: "The knowledge lands where you already work." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Obsidian vault" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hygiene flows" })).toBeVisible();

  // Builder 3.x capabilities strip (verified vs kits/builder/kit.json + changelog).
  await page.goto("/builder-kit/");
  await expect(page.getByRole("heading", { name: "The delivery discipline kept compounding." })).toBeVisible();
  await expect(page.getByText("builder.publish-learn")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Model routing + escalation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bounded continuation" })).toBeVisible();
  await expect(page.getByText(".kontourai/flow-agents/knowledge/")).toHaveCount(0);
});

test("developers page leads with the engine and kits, states ownership once", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/developers/");

  await expect(page.locator('[data-umami-event="nav-developers"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="nav-developers"]')).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Kontour for developers" })).toBeVisible();

  // Single-story restructure: engine+kits lead; the six-product tour, the
  // hero mini-map, the lifecycle strip, and the composition-contracts grid
  // (four restatements of the same ownership idea) are gone.
  await expect(page.getByText("Six products. One job.")).toHaveCount(0);
  await expect(page.getByLabel("Kontour product relationship summary")).toHaveCount(0);
  await expect(page.getByLabel("Evidence lifecycle flow")).toHaveCount(0);
  await expect(page.getByText("Composes by:")).toHaveCount(0);

  // Hero sells the engine+kits story and routes straight to install.
  await expect(page.getByText("install the engine, add a kit, keep the receipts")).toBeVisible();
  await expect(page.locator('[data-umami-event="developers-hero-quickstart"]')).toHaveAttribute("href", "#quickstart");

  // Quickstart with REAL commands + verify-us links, pins rendered from
  // package.json so the advertised stack can't drift from CI.
  await expect(page.getByRole("heading", { name: "Two commands, then the diagrams." })).toBeVisible();
  await expect(page.getByText("advisory on the rest (matrix on /trust)")).toBeVisible();
  // Appears twice by design: the hero install-hint badge and the quickstart terminal.
  await expect(page.getByText("npx @kontourai/flow-agents init").first()).toBeVisible();
  const devPins = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  ).devDependencies;
  await expect(page.getByText(`npx -y -p ajv@${devPins.ajv} -p hachure@${devPins.hachure}`)).toBeVisible();
  await expect(page.locator('[data-umami-event="developers-quickstart-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="developers-quickstart-trust"]')).toHaveAttribute("href", "/trust/");

  // The kits section: all four catalog kits, the two paged ones linking to
  // their own pages, quickstart above them (install first, catalog second).
  await expect(page.getByRole("heading", { name: "Kits are the workflows. The engine treats them all the same." })).toBeVisible();
  await expect(page.locator('[data-umami-event="developers-kit-builder"]')).toHaveAttribute("href", "/builder-kit/");
  await expect(page.locator('[data-umami-event="developers-kit-knowledge"]')).toHaveAttribute("href", "/knowledge-kit/");
  await expect(page.getByText("Release Evidence Kit")).toBeVisible();
  await expect(page.getByText("Veritas Governance Kit")).toBeVisible();
  const quickstartBox = await page.getByRole("heading", { name: "Two commands, then the diagrams." }).boundingBox();
  const kitsBox = await page.getByRole("heading", { name: "Kits are the workflows. The engine treats them all the same." }).boundingBox();
  expect(quickstartBox).not.toBeNull();
  expect(kitsBox).not.toBeNull();
  expect(quickstartBox.y).toBeLessThan(kitsBox.y);

  // The ONE ownership artifact: the layer map, now covering all six products
  // (Survey joined the trust-substrate lane when the tour cards left).
  await expect(page.getByLabel("Product relationship layer map")).toBeVisible();
  await expect(page.getByLabel("Product relationship layer map").getByText("Trust substrate")).toBeVisible();
  await expect(page.getByLabel("Product relationship layer map").getByText("Builder Kit")).toBeVisible();
  await expect(page.getByLabel("Product relationship layer map").getByText("Survey")).toBeVisible();
  await expect(page.locator('[data-umami-event="developers-map-surface"]')).toHaveAttribute("href", "/surface/");
  await expect(page.locator('[data-umami-event="developers-map-console"]')).toHaveAttribute("href", "/console/");

  // Use cases and maturity framing stay.
  await expect(page.getByRole("heading", { name: "Sales / RevOps" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Software delivery" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Public data and records" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Regulated advisory review" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Support and customer operations" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Current state", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Near-term direction", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Future possibilities", exact: true })).toBeVisible();
  await expect(page.getByText("recompute under two validators").first()).toBeVisible();
  await expect(page.getByText("AWS Strands framework-adapter previews")).toBeVisible();
  await expect(page.getByText("Kubernetes-style operators")).toBeVisible();
  await expect(page.getByText("They are not current requirements")).toBeVisible();

  // Nav: engine + kits top-level; disciplines live in the Products dropdown
  // (eleven flat links overflowed every desktop width).
  await expect(page.locator('[data-umami-event="nav-flow-agents"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="nav-builder-kit"]')).toBeVisible();
  await expect(page.locator(".nav-dropdown__summary")).toBeVisible();
  await expect(page.locator('[data-umami-event="nav-surface"]')).toBeHidden();
  await page.locator(".nav-dropdown__summary").click();
  // toBeVisible() ignores ancestor overflow clipping (learned on this PR's
  // first cut, where the panel was 100% clipped yet tests were green) — so
  // assert real hit-testability: the point at the link's center must
  // resolve to the link itself.
  const surfaceHit = await page.evaluate(() => {
    const link = document.querySelector('[data-umami-event="nav-surface"]');
    const r = link.getBoundingClientRect();
    const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return !!el && (el === link || link.contains(el));
  });
  expect(surfaceHit).toBe(true);
  await expect(page.locator('[data-umami-event="nav-console"]')).toHaveAttribute("href", "/console/");
  // The row itself must not overflow its container on desktop.
  const navOverflow = await page.locator(".nav__links").evaluate((el) => el.scrollWidth - el.clientWidth);
  expect(navOverflow).toBeLessThanOrEqual(0);

  // Where-to-go-next leads with the engine and kits, then the disciplines.
  await expect(page.locator('[data-umami-event="developers-next-flow-agents"]')).toHaveAttribute("href", "/flow-agents/");
  await expect(page.locator('[data-umami-event="developers-next-builder-kit"]')).toHaveAttribute("href", "/builder-kit/");
  await expect(page.locator('[data-umami-event="developers-next-knowledge-kit"]')).toHaveAttribute("href", "/knowledge-kit/");
  await expect(page.locator('[data-umami-event="developers-next-receipts"]')).toHaveAttribute("href", "/receipts/");
  await expect(page.locator('[data-umami-event="developers-next-trust"]')).toHaveAttribute("href", "/trust/");

  // Lab section covers the public building blocks, including the new ones.
  await expect(page.locator('[data-umami-event="developers-lab-lookout-repo"]')).toHaveAttribute("href", "https://github.com/kontourai/lookout");
  await expect(page.locator('[data-umami-event="developers-lab-kit-research-repo"]')).toHaveAttribute("href", "https://github.com/kontourai/kit-research");
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
  await expect(page.locator(".ownership-map")).toHaveCSS("display", "grid");

  const viewport = page.viewportSize();
  const mapBox = await page.locator(".ownership-map").boundingBox();
  expect(viewport).not.toBeNull();
  expect(mapBox).not.toBeNull();
  if (viewport && mapBox) {
    expect(mapBox.x).toBeGreaterThanOrEqual(0);
    expect(mapBox.x + mapBox.width).toBeLessThanOrEqual(viewport.width + 1);
  }

  // Products dropdown on narrow screens: a fixed full-width sheet that
  // escapes the nav row's scroll clipping — hit-test, not just visibility.
  await page.locator(".nav-dropdown__summary").scrollIntoViewIfNeeded();
  await page.locator(".nav-dropdown__summary").click();
  const mobileHit = await page.evaluate(() => {
    const link = document.querySelector('[data-umami-event="nav-veritas"]');
    const r = link.getBoundingClientRect();
    const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return !!el && (el === link || link.contains(el));
  });
  expect(mobileHit).toBe(true);
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
  await expect(page.getByText("Install the engine into the coding agent you already run")).toBeVisible();
  await expect(page.getByText("Builder for delivery, Knowledge")).toBeVisible();
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

  // #91 F12: published packages link their npmjs page (parity with Surface/Survey/Veritas).
  await expect(page.locator('[data-umami-event="flow-agents-hero-npm"]')).toHaveAttribute(
    "href",
    "https://www.npmjs.com/package/@kontourai/flow-agents",
  );

  // #110: the shared enforcement matrix is applied here — badges come from
  // EnforcementBadge (data-enforcement fingerprint), not hand-rolled spans.
  await expect(page.getByRole("heading", { name: "Where the gate actually blocks, per runtime" })).toBeVisible();
  const faMatrix = page.locator(".enforcement-table");
  await expect(faMatrix.getByRole("row", { name: /Claude Code/ }).locator('[data-enforcement="blocking"]')).toHaveText("Blocking");
  await expect(faMatrix.getByRole("row", { name: /Kiro/ }).locator('[data-enforcement="advisory"]')).toHaveText("Advisory / opt-in block");
  await expect(faMatrix.getByRole("row", { name: /opencode/ }).locator('[data-enforcement="advisory"]')).toHaveText("Advisory / partial");
  await expect(faMatrix.getByRole("row", { name: /Other harnesses/ }).locator('[data-enforcement="spec-only"]')).toHaveText("Spec-only");
});

test("memory interop note states the do-not-build guard and the two-layer stance", async ({ page }) => {
  await page.goto("/memory/");

  await expect(page.getByRole("heading", { level: 1, name: "Works with your memory layer" })).toBeVisible();
  // The recorded do-NOT-build guard, stated as a guard (not a deferral).
  await expect(page.getByText("We build no memory platform.")).toBeVisible();
  await expect(page.getByText("a recorded do-not-build guard, not a roadmap gap")).toBeVisible();
  // The memory-vs-trust line (required by #71).
  await expect(page.getByText("Memory tells the agent what it knows. Kontour proves what its answers")).toBeVisible();
  // Named example categories/systems — as pattern examples only.
  await expect(page.getByText("OKF (Open Knowledge Format)")).toBeVisible();
  await expect(page.getByText("Context Lattice")).toBeVisible();
  await expect(page.getByText("hooks writing to your own store")).toBeVisible();
  // Honest scope: no vendor certification claims.
  await expect(page.getByText("not tested integrations or partnership claims")).toBeVisible();
  await expect(page.locator('[data-umami-event="memory-trust"]')).toHaveAttribute("href", "/trust/");

  // Reachable from developer-facing navigation (R1 reachability).
  await page.goto("/developers/");
  await expect(page.locator('[data-umami-event="developers-next-memory"]')).toHaveAttribute("href", "/memory/");
});

test("spec-driven post pairs the movement with the evidence half", async ({ page }) => {
  await page.goto("/writing/spec-driven-in-evidence-backed-out/");

  await expect(page.getByRole("heading", { level: 1, name: "Spec-driven in, evidence-backed out" })).toBeVisible();
  // The concession first (house rule): the movement is right.
  await expect(page.getByText("The design.md movement is right")).toBeVisible();
  // Enforcement framing folded in (#73 R2).
  await expect(page.getByText("prompts are advice, gates are laws")).toBeVisible();
  // The recognition moment anchors the missing half.
  await expect(page.getByText("remembers intending to run")).toBeVisible();
  // Dogfood cross-links: DESIGN.md + receipts + trust (#73 scope).
  await expect(page.getByRole("link", { name: "DESIGN.md" }).first()).toHaveAttribute(
    "href",
    "https://github.com/kontourai/kontourai.io/blob/main/DESIGN.md",
  );
  await expect(page.locator('[data-umami-event="writing-specdriven-trust"]')).toHaveAttribute("href", "/trust/");
  // Memory-vs-trust line present where it fits.
  await expect(page.getByText("Kontour proves what its answers stood on.")).toBeVisible();
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
  // Every archive-grid view/download link is instrumented (the live event
  // sweep found only the lead download tracked — 4 of 5 downloads invisible).
  await expect(page.locator('[data-umami-event="receipts-download-flow-agents-delivery"]')).toHaveAttribute(
    "href",
    "/receipts/flow-agents-delivery.trust.bundle",
  );
  await expect(page.locator('[data-umami-event="receipts-view-flow-agents-delivery"]')).toHaveAttribute(
    "href",
    "/receipts/flow-agents-delivery/",
  );
  await expect(page.locator(".receipt-download:not([data-umami-event])")).toHaveCount(0);
  // Umami silently truncates event names over 50 chars — keep slug-derived
  // names inside the limit as new receipts are added.
  const eventNames = await page.locator("[data-umami-event]").evaluateAll(
    (els) => els.map((el) => el.getAttribute("data-umami-event")),
  );
  for (const name of eventNames) expect(name.length).toBeLessThanOrEqual(50);
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
  const { devDependencies, dependencies } = JSON.parse(
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
      page.getByText(`npx @kontourai/surface@${dependencies["@kontourai/surface"]} report --input ${slug}.trust.bundle --format summary`),
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
  // Site-parity claim stays exactly as strong as the branch-protection fact:
  // required + no-bypass, with the workflow-protection gap disclosed.
  await expect(page.getByText("This site's own repo now requires the check too")).toBeVisible();
  // Since PR #141, workflow definitions and CI scripts are owner-review-protected via CODEOWNERS.
  await expect(page.getByText("require owner review via CODEOWNERS")).toBeVisible();
  await expect(page.getByText("isn't yet owner-review-protected")).toHaveCount(0);
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
