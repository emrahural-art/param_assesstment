import { test, expect } from "@playwright/test";

test.describe("TS-03: Aday Yönetimi", () => {
  test("TS-03.1: Aday listesi yüklenir", async ({ page }) => {
    await page.goto("/candidates");
    await expect(page.locator("h2", { hasText: "Adaylar" })).toBeVisible();
    await expect(page.getByText(/aday/)).toBeVisible();
  });

  test("TS-03.2: Aday arama filtresi", async ({ page }) => {
    await page.goto("/candidates");
    const searchInput = page.getByPlaceholder("İsim veya e-posta ara...");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("test-unique-no-match-xyz");
    await page.waitForTimeout(1000);
  });

  test("TS-03.3: Arama temizleme", async ({ page }) => {
    await page.goto("/candidates");
    const searchInput = page.getByPlaceholder("İsim veya e-posta ara...");
    await searchInput.fill("zzz");
    await page.waitForTimeout(500);
    await searchInput.clear();
    await page.waitForTimeout(500);
    await expect(page.getByText(/aday/)).toBeVisible();
  });

  test("TS-03.4: Aday ekleme dialog açılır", async ({ page }) => {
    await page.goto("/candidates");
    await page.getByRole("button", { name: /aday ekle/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("#firstName")).toBeVisible();
    await expect(page.locator("#lastName")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
  });

  test("TS-03.5: Aday ekleme — form gönderimi", async ({ page }) => {
    const uniqueName = `E2ETest${Date.now()}`;
    await page.goto("/candidates");
    await page.getByRole("button", { name: /aday ekle/i }).click();

    await page.locator("#firstName").fill(uniqueName);
    await page.locator("#lastName").fill("Adayı");
    await page.locator("#email").fill(`${uniqueName.toLowerCase()}@test.com`);
    await page.locator("#phone").fill("05550000000");

    await page.getByRole("button", { name: /kaydet/i }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(uniqueName).first()).toBeVisible();
  });

  test("TS-03.6: Aday detay sayfasına erişim", async ({ page }) => {
    await page.goto("/candidates");
    const firstLink = page.locator("a[href^='/candidates/']").first();
    await firstLink.click();
    await expect(page).toHaveURL(/\/candidates\/.+/);
  });
});
