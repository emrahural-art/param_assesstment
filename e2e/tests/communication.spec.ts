import { test, expect } from "@playwright/test";

test.describe("TS-08: İletişim Merkezi", () => {
  test("TS-08.1: İletişim sayfası yüklenir", async ({ page }) => {
    await page.goto("/communication");
    await expect(page.locator("h2", { hasText: "İletişim Merkezi" })).toBeVisible();
    await expect(page.getByText("E-posta Şablonları")).toBeVisible();
  });

  test("TS-08.2: E-posta gönder linki", async ({ page }) => {
    await page.goto("/communication");
    await expect(page.getByRole("link", { name: /e-posta gönder/i })).toBeVisible();
  });

  test("TS-08.3: Gönderim logları linki", async ({ page }) => {
    await page.goto("/communication");
    await expect(page.getByRole("link", { name: /gönderim logları/i })).toBeVisible();
  });

  test("TS-08.4: Yeni şablon oluşturma linki", async ({ page }) => {
    await page.goto("/communication");
    await expect(page.getByRole("link", { name: /yeni şablon/i })).toBeVisible();
  });

  test("TS-08.5: Şablon kartına tıklama", async ({ page }) => {
    await page.goto("/communication");
    const templateLink = page.locator("a[href^='/communication/templates/']").first();
    if (await templateLink.isVisible()) {
      await templateLink.click();
      await expect(page).toHaveURL(/\/communication\/templates\/.+/);
    }
  });
});
