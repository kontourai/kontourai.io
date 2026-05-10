import { expect, test } from "@playwright/test";

test("homepage renders the trust infrastructure entry points", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".label-sm").filter({ hasText: "Trust Infrastructure" }).first()).toBeVisible();
  await expect(page.locator('[data-umami-event="home-hero-explore-surface"]')).toBeVisible();
  await expect(page.locator('[data-umami-event="home-hero-explore-veritas"]')).toBeVisible();
  await expect(page.getByText("Show your work.").first()).toBeVisible();
  await expect(page.getByText("A substrate, and the products built on it.").first()).toBeVisible();
  await expect(page.getByText('"Evidence-backed confidence. Not certainty theater."').first()).toBeVisible();
});

test("surface page presents the substrate with reference adapters and real consumers", async ({ page }) => {
  await page.goto("/surface/");

  await expect(page.getByText("The trust substrate · Show your work")).toBeVisible();
  await expect(page.getByText("Fault lines:")).toBeVisible();

  // Reference adapters section
  await expect(page.locator(".label-sm").filter({ hasText: "Reference adapters" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Field-Attested Records" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fact Resolution" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "npm-audit" })).toBeVisible();

  // Real consumers section
  await expect(page.locator(".label-sm").filter({ hasText: "Real consumers" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Veritas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your product" })).toBeVisible();

  // Reputation Integrity is fixture-only and should not appear as a peer product
  await expect(page.getByRole("heading", { name: "Reputation Integrity" })).toHaveCount(0);

  // No project-specific public-data branding leakage
  await expect(page.getByText(new RegExp(`camp${"fit"}`, "i"))).toHaveCount(0);
});

test("veritas page shows three jobs and the surface handoff", async ({ page }) => {
  await page.goto("/veritas/");

  await expect(page.locator(".label-sm").filter({ hasText: "Three jobs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Enforce boundaries" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Deliver JIT context" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Self-correct via lint" })).toBeVisible();

  await expect(page.locator(".label-sm").filter({ hasText: "Built on Surface" })).toBeVisible();
  await expect(page.getByText(/veritas:check-in-local/)).toBeVisible();
});
