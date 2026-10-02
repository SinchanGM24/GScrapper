import { expect, test } from "@playwright/test";

test("loads the local Analyzer workspace", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Recommended prospects")).toBeVisible();
  await page.getByRole("button", { name: "Prospects" }).click();
  await expect(page.getByRole("heading", { name: "Prospect table" })).toBeVisible();
  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Make the signal yours." })).toBeVisible();
});