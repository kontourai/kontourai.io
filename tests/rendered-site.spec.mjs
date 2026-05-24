import { expect, test } from "@playwright/test";

test("homepage renders the product transparency entry points", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".label-sm").filter({ hasText: "Kontour AI" }).first()).toBeVisible();
  await expect(page.locator('[data-umami-event="home-hero-github"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="home-hero-contact"]')).toBeVisible();
  await expect(page.getByText("Transparency building blocks").first()).toBeVisible();
  await expect(page.getByText("Claims").first()).toBeVisible();
  await expect(page.getByText("Processes").first()).toBeVisible();
  await expect(page.getByText("Changes").first()).toBeVisible();
  await expect(page.getByText("Evidence-backed confidence.").first()).toBeVisible();
  await expect(page.getByText("Not certainty theater.").first()).toBeVisible();
  await expect(page.locator('[data-umami-event="nav-flow"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="nav-veritas"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="nav-surface"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-flow"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-veritas"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-surface"]')).toHaveCount(0);
  await expect(page.locator('[data-umami-event="footer-github"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="footer-contact"]')).toBeVisible();
});

test("preview page keeps the fuller product-line story accessible", async ({ page }) => {
  await page.goto("/preview/");

  await expect(page.getByText("Transparency building blocks for the AI era.").first()).toBeVisible();
  await expect(page.locator("h3").filter({ hasText: "Surface" }).first()).toBeVisible();
  await expect(page.locator("h3").filter({ hasText: "Flow" }).first()).toBeVisible();
  await expect(page.locator("h3").filter({ hasText: "Veritas" }).first()).toBeVisible();
});

test("flow page explains process transparency and product boundaries", async ({ page }) => {
  await page.goto("/flow/");

  await expect(page.getByText("Process transparency for agentic work")).toBeVisible();
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
});

test("surface page presents product transparency paths and vocabulary", async ({ page }) => {
  await page.goto("/surface/");

  await expect(page.getByText("Product transparency for the AI era")).toBeVisible();
  await expect(page.getByText("Show your work. Earn trust.")).toBeVisible();
  await expect(page.getByText("Transparency gaps:")).toBeVisible();
  await expect(page.getByText("Claim Groups:")).toBeVisible();

  // Role paths and product transparency vocabulary
  await expect(page.locator(".label-sm").filter({ hasText: "Surface paths" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "View the Surface" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shape the Surface" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Build with Surface" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Verify with Surface" })).toBeVisible();
  await expect(page.getByText("Trust Snapshot").first()).toBeVisible();
  await expect(page.getByText("Trust Panel").first()).toBeVisible();
  await expect(page.getByText("Surface Console").first()).toBeVisible();
  await expect(page.getByText("Transparency Gap").first()).toBeVisible();

  // Domain examples remain present with target product vocabulary.
  await expect(page.locator(".label-sm").filter({ hasText: "Where it fits" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Public Data" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fact Resolution" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Security & Compliance" })).toBeVisible();
  await expect(page.getByText("Requirements with drilldown")).toBeVisible();
  await expect(page.getByText("requirement set", { exact: false })).toBeVisible();

  // Products built with Surface section
  await expect(page.locator(".label-sm").filter({ hasText: "Built with Surface" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Veritas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your product" })).toBeVisible();

  // Reputation Integrity is fixture-only and should not appear as a peer product
  await expect(page.getByRole("heading", { name: "Reputation Integrity" })).toHaveCount(0);

  // No project-specific public-data branding leakage
  await expect(page.getByText(new RegExp(`camp${"fit"}`, "i"))).toHaveCount(0);
});

test("veritas page shows product promise and the surface handoff", async ({ page }) => {
  await page.goto("/veritas/");

  await expect(page.locator(".label-sm").filter({ hasText: "What Veritas makes possible" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Define what good looks like" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guide work at the moment of change" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Earn merge readiness" })).toBeVisible();

  await expect(page.locator(".label-sm").filter({ hasText: "Built with Surface" })).toBeVisible();
  await expect(page.getByText(/veritas:readiness-run/)).toBeVisible();
});
