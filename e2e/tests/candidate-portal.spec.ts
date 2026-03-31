import { test, expect } from "@playwright/test";

test.describe("TS-09: Aday Portalı (Public)", () => {
  test("TS-09.1: Açık pozisyonlar sayfası yüklenir", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.locator("h1", { hasText: "Açık Pozisyonlar" })).toBeVisible({ timeout: 10_000 });
  });

  test("TS-09.2: Yayındaki ilanlar listelenir", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.getByText("Başvur").first()).toBeVisible({ timeout: 10_000 });
  });

  test("TS-09.3: Başvuru butonuna tıklama", async ({ page }) => {
    await page.goto("/jobs");
    const applyLink = page.locator("a[href^='/apply/']").first();
    if (await applyLink.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await applyLink.click();
      await expect(page).toHaveURL(/\/apply\/.+/);
    }
  });

  test("TS-09.4: Başvuru formu yüklenir", async ({ page }) => {
    await page.goto("/jobs");
    const applyLink = page.locator("a[href^='/apply/']").first();
    if (await applyLink.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await applyLink.click();
      await expect(page.getByText("Kişisel Bilgiler")).toBeVisible();
    }
  });

  test("TS-09.5: Başvuru formu — zorunlu alanlar", async ({ page }) => {
    await page.goto("/jobs");
    const applyLink = page.locator("a[href^='/apply/']").first();
    if (await applyLink.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await applyLink.click();
      await expect(page.locator("label[for='firstName']")).toBeVisible();
      await expect(page.locator("label[for='lastName']")).toBeVisible();
      await expect(page.locator("label[for='email']")).toBeVisible();
    }
  });

  test("TS-09.6: Başvuru gönderimi", async ({ page }) => {
    await page.goto("/jobs");
    const applyLink = page.locator("a[href^='/apply/']").first();
    if (!(await applyLink.isVisible({ timeout: 10_000 }).catch(() => false))) return;
    await applyLink.click();
    await expect(page.getByText("Kişisel Bilgiler")).toBeVisible();

    await page.locator("input[name='firstName']").fill("Playwright");
    await page.locator("input[name='lastName']").fill("Test");
    await page.locator("input[name='email']").fill(`pw-${Date.now()}@test.com`);
    await page.locator("input[name='phone']").fill("05551112233");

    const kvkkCheckbox = page.locator("input[type='checkbox']");
    if (await kvkkCheckbox.isVisible()) {
      await kvkkCheckbox.check();
    }

    await page.getByRole("button", { name: /başvuruyu gönder/i }).click();
    await expect(page.getByText("Başvurunuz Alındı")).toBeVisible({ timeout: 10_000 });
  });
});
