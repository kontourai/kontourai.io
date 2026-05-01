import { expect, test } from "@playwright/test";

test("homepage renders the trust infrastructure entry points", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".label-sm").filter({ hasText: "Trust Infrastructure" }).first()).toBeVisible();
  await expect(page.locator('[data-umami-event="home-hero-explore-veritas"]')).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore Surface" }).first()).toBeVisible();
  await expect(page.getByText('"Evidence-backed confidence. Not certainty theater."').first()).toBeVisible();
});

test("surface page renders workflow archetypes without project-specific public-data branding", async ({ page }) => {
  await page.goto("/surface/");

  await expect(page.getByText("Fault lines:")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Field-Attested Records" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fact Resolution" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reputation Integrity" })).toBeVisible();
  await expect(page.getByText("unsupported inference", { exact: true })).toBeVisible();
  await expect(page.getByText(/field-attested-records\.public-data/)).toBeVisible();
  await expect(page.getByText(/claim\.field-attested-records\.registration-status/)).toBeVisible();
  await expect(page.getByText(new RegExp(`camp${"fit"}`, "i"))).toHaveCount(0);
});
