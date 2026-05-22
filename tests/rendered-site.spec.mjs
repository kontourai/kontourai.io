import { expect, test } from "@playwright/test";

test("homepage renders the product transparency entry points", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".label-sm").filter({ hasText: "Product Transparency" }).first()).toBeVisible();
  await expect(page.locator('[data-umami-event="home-hero-explore-surface"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="home-hero-explore-veritas"]')).toBeVisible();
  await expect(page.getByText("Show the work").first()).toBeVisible();
  await expect(page.getByText("A transparency standard, and products built with it.").first()).toBeVisible();
  await expect(page.getByText('"Evidence-backed confidence. Not certainty theater."').first()).toBeVisible();
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
