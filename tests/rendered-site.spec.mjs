import { expect, test } from "@playwright/test";

test("homepage renders the teaser hero and six-product line", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".label-sm").filter({ hasText: "Kontour AI" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Show the work behind AI." })).toBeVisible();
  await expect(page.getByText("inspectability infrastructure for AI-assisted work").first()).toBeVisible();
  await expect(page.locator('[data-umami-event="home-hero-github"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="home-hero-contact"]')).toBeVisible();

  // Six-product line
  await expect(page.locator(".label-sm").filter({ hasText: "What we're building" })).toBeVisible();
  await expect(page.getByText("Surface").first()).toBeVisible();
  await expect(page.getByText("Survey", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Flow", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Veritas").first()).toBeVisible();
  await expect(page.getByText("Flow Agents").first()).toBeVisible();
  await expect(page.getByText("Console", { exact: true }).first()).toBeVisible();

  // Brand promise
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

  // Guard against leaked build-process / internal copy regressing back in
  await expect(page.getByText("still shaping")).toHaveCount(0);
  await expect(page.getByText("intentionally simple")).toHaveCount(0);
});

test("preview page keeps the fuller six-product story accessible", async ({ page }) => {
  await page.goto("/preview/");

  await expect(page.getByText("INTERNAL REVIEW").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kontour AI shows the work behind AI." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Surface", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Survey", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Flow", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Veritas", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Flow Agents", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Console", exact: true })).toBeVisible();
});

test("flow page explains process transparency and product boundaries", async ({ page }) => {
  await page.goto("/flow/");

  await expect(page.getByText("required paths, gates, evidence, and exceptions made inspectable")).toBeVisible();
  await expect(page.getByText("A trace says what happened.")).toBeVisible();
  await expect(page.getByText("Flow says why it was enough.")).toBeVisible();
  await expect(page.locator(".label-sm").filter({ hasText: "What Flow answers" })).toBeVisible();
  await expect(page.getByText("What process path was required?")).toBeVisible();
  await expect(page.getByText("Why was the transition allowed or blocked?")).toBeVisible();
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
  await expect(page.locator(".label-sm").filter({ hasText: "In practice" })).toBeVisible();
  await expect(page.getByText("The catch you'd")).toBeVisible();
  await expect(page.getByText("api handler changed, test missing")).toBeVisible();

  // Current CLI and the Surface handoff
  await expect(page.locator(".label-sm").filter({ hasText: "Current CLI" })).toBeVisible();
  await expect(page.getByText("Veritas is built with Surface.")).toBeVisible();
});

test("survey page explains the producer pipeline and surface handoff", async ({ page }) => {
  await page.goto("/survey/");

  await expect(page.getByText("producer-side provenance for Surface-ready claims").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Survey", exact: true })).toBeVisible();

  // Producer pipeline
  await expect(page.locator(".label-sm").filter({ hasText: "The producer pipeline" })).toBeVisible();
  await expect(page.getByText("Source", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Extraction", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Candidate", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Review", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Claim", { exact: true }).first()).toBeVisible();

  // Boundary and helpers
  await expect(page.getByRole("heading", { name: "Survey owns" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Producers own" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Surface owns" })).toBeVisible();
  await expect(page.getByText("fieldObservation()").first()).toBeVisible();

  // Surface handoff
  await expect(page.getByText("Survey produces.")).toBeVisible();
  await expect(page.getByText("Surface makes it inspectable.")).toBeVisible();
});

test("console page presents the suite operating plane and boundary", async ({ page }) => {
  await page.goto("/console/");

  await expect(page.getByText("suite trust state made operable without becoming the source of truth").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Console", exact: true })).toBeVisible();
  await expect(page.getByText("early preview").first()).toBeVisible();

  // Operating state + plane
  await expect(page.locator(".label-sm").filter({ hasText: "What it's built to answer" })).toBeVisible();
  await expect(page.getByText("Primitives make transparency portable.").first()).toBeVisible();

  // Honest framing: illustrative, not a live cross-product feed yet
  await expect(page.getByText("illustrative").first()).toBeVisible();

  // Unified work queue
  await expect(page.locator(".label-sm").filter({ hasText: "Unified work queue" })).toBeVisible();

  // Boundary — Console owns / does not own / primitives stay portable
  await expect(page.getByRole("heading", { name: "Console owns" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Console does not own" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Primitives stay portable" })).toBeVisible();
});

test("flow agents page presents agent-tool discipline and status", async ({ page }) => {
  await page.goto("/flow-agents/");

  await expect(page.getByRole("heading", { name: "Flow Agents", exact: true })).toBeVisible();
  await expect(page.getByText("Flow and Veritas discipline inside the agents you already use").first()).toBeVisible();

  // Early-access status, not vapor
  await expect(page.getByText("early access").first()).toBeVisible();

  // Real capabilities: runtimes, the Builder Kit, and an install path
  await expect(page.locator(".label-sm").filter({ hasText: "Builder Kit" }).first()).toBeVisible();
  await expect(page.getByText("Claude Code").first()).toBeVisible();
  await expect(page.getByText("idea-to-backlog").first()).toBeVisible();
  await expect(page.getByText("bash install.sh").first()).toBeVisible();

  // Guard against the old "coming soon" framing regressing back in
  await expect(page.getByText("coming soon")).toHaveCount(0);
});
