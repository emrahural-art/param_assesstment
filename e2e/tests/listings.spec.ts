import { test, expect } from "@playwright/test";

test.describe("TS-07: İlan Yönetimi", () => {
  test("TS-07.1: İlan listesi yüklenir", async ({ page }) => {
    await page.goto("/listings");
    await expect(page.locator("h2", { hasText: "İlanlar" })).toBeVisible();
  });

  test("TS-07.2: İlan detay sayfası açılır", async ({ page }) => {
    await page.goto("/listings");
    const firstLink = page.locator("a[href^='/listings/']").filter({ hasNotText: /yeni/i }).first();
    await firstLink.click();
    await expect(page).toHaveURL(/\/listings\/(?!new).+/);
  });

  test("TS-07.3: Yeni ilan oluşturma sayfası", async ({ page }) => {
    await page.goto("/listings");
    await page.locator("a[href='/listings/new']").click();
    await expect(page).toHaveURL(/\/listings\/new/);
  });

  test("TS-07.4: İlan durum badge'leri", async ({ page }) => {
    await page.goto("/listings");
    await expect(page.getByText(/yayında|taslak|kapalı|açık/i).first()).toBeVisible();
  });
});
