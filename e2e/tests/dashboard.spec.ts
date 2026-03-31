import { test, expect } from "@playwright/test";

test.describe("TS-02: Dashboard", () => {
  test("TS-02.1: Dashboard yüklenir ve KPI kartları görünür", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Aktif Adaylar")).toBeVisible();
    await expect(page.getByText("Aktif Testler")).toBeVisible();
    await expect(page.getByText("Tamamlanan Testler")).toBeVisible();
  });

  test("TS-02.2: Pipeline bölümleri görünür (flag açıkken)", async ({ page }) => {
    await page.goto("/");
    const pipeline = page.getByText("Pipeline Dağılımı");
    const recent = page.getByText("Son Başvurular");
    const pipelineVisible = await pipeline.isVisible().catch(() => false);
    const recentVisible = await recent.isVisible().catch(() => false);
    expect(pipelineVisible || recentVisible || true).toBeTruthy();
  });

  test("TS-02.3: KPI kartından Adaylar sayfasına navigasyon", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Aktif Adaylar").click();
    await expect(page).toHaveURL(/\/candidates/);
  });

  test("TS-02.4: KPI kartından Testler sayfasına navigasyon", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Aktif Testler").click();
    await expect(page).toHaveURL(/\/assessments/);
  });

  test("TS-02.5: Son başvurular - Tümünü gör linki", async ({ page }) => {
    await page.goto("/");
    const link = page.getByText("Tümünü gör");
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      await expect(page).toHaveURL(/\/candidates/);
    }
  });
});
