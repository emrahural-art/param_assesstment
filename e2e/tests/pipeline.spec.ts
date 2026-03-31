import { test, expect } from "@playwright/test";

test.describe("TS-06: Pipeline (Kanban Board)", () => {
  test("TS-06.1: Pipeline sayfası yüklenir", async ({ page }) => {
    await page.goto("/pipeline");
    await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
  });

  test("TS-06.2: Kanban kolonları görünür", async ({ page }) => {
    await page.goto("/pipeline");
    await expect(page.getByText("Yeni Başvuru")).toBeVisible();
    await expect(page.getByText("Mülakat")).toBeVisible();
    await expect(page.getByText("Teklif")).toBeVisible();
  });

  test("TS-06.3: Tablo görünümü butonu", async ({ page }) => {
    await page.goto("/pipeline");
    const tableBtn = page.getByText("Tablo Görünümü");
    await expect(tableBtn).toBeVisible();
    await tableBtn.click();
    await expect(page).toHaveURL(/\/candidates/);
  });
});
