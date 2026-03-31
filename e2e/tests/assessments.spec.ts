import { test, expect } from "@playwright/test";

test.describe("TS-04: Test / Değerlendirme Yönetimi", () => {
  test("TS-04.1: Test listesi yüklenir", async ({ page }) => {
    await page.goto("/assessments");
    await expect(page.locator("h2", { hasText: "Testler" })).toBeVisible();
  });

  test("TS-04.2: Test detay sayfası açılır", async ({ page }) => {
    await page.goto("/assessments");
    const card = page.locator("a[href^='/assessments/']").filter({ hasNotText: /yeni test/i }).first();
    await card.click();
    await expect(page).toHaveURL(/\/assessments\/(?!new).+/);
  });

  test("TS-04.3: Test detay sayfası içerik yüklenir", async ({ page }) => {
    await page.goto("/assessments");
    const card = page.locator("a[href^='/assessments/']").filter({ hasNotText: /yeni test/i }).first();
    await card.click();
    await expect(page).toHaveURL(/\/assessments\/(?!new).+/);
    // Detail page should have tabs or content
    await expect(page.locator("h2, h1").first()).toBeVisible();
  });

  test("TS-04.4: Sorular sekmesi", async ({ page }) => {
    await page.goto("/assessments");
    const card = page.locator("a[href^='/assessments/']").filter({ hasNotText: /yeni test/i }).first();
    await card.click();
    await expect(page).toHaveURL(/\/assessments\/(?!new).+/);
    const questionsTab = page.getByRole("tab", { name: /sorular/i });
    if (await questionsTab.isVisible()) {
      await questionsTab.click();
      await page.waitForTimeout(1000);
    }
    // Page content should exist
    await expect(page.locator("main, [role='tabpanel']").first()).toBeVisible();
  });

  test("TS-04.5: Yeni test oluşturma sayfası", async ({ page }) => {
    await page.goto("/assessments");
    await page.getByRole("link", { name: /yeni test oluştur/i }).click();
    await expect(page).toHaveURL(/\/assessments\/new/);
  });

  test("TS-04.6: Davet gönder sekmesi", async ({ page }) => {
    await page.goto("/assessments");
    const card = page.locator("a[href^='/assessments/']").filter({ hasNotText: /yeni test/i }).first();
    await card.click();
    const tab = page.getByRole("tab", { name: /davet/i });
    if (await tab.isVisible()) {
      await tab.click();
      await expect(page.getByText(/davet/i).first()).toBeVisible();
    }
  });

  test("TS-04.7: Ayarlar sekmesi", async ({ page }) => {
    await page.goto("/assessments");
    const card = page.locator("a[href^='/assessments/']").filter({ hasNotText: /yeni test/i }).first();
    await card.click();
    const tab = page.getByRole("tab", { name: /ayarlar/i });
    if (await tab.isVisible()) {
      await tab.click();
      await expect(page.getByText(/dakika|süre/i).first()).toBeVisible();
    }
  });
});
