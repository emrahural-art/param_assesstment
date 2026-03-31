import { test, expect } from "@playwright/test";

test.describe("TS-10: Sistem Admin Özellikleri", () => {
  test("TS-10.1: Ayarlar sayfası — Sistem Ayarları başlığı", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Sistem Ayarları" })).toBeVisible();
  });

  test("TS-10.2: Modül Yönetimi bölümü görünür", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("Modül Yönetimi")).toBeVisible();
  });

  test("TS-10.3: Feature flag toggle'ları mevcut", async ({ page }) => {
    await page.goto("/settings");
    const toggles = page.locator("button[role='switch']");
    const count = await toggles.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("TS-10.4: Sistem Logları sayfasına erişim", async ({ page }) => {
    await page.goto("/settings/logs");
    await expect(page.getByRole("heading", { name: "Sistem Logları" })).toBeVisible();
  });

  test("TS-10.5: Denetim logları sekmesi", async ({ page }) => {
    await page.goto("/settings/logs");
    await expect(page.getByText(/kullanıcı işlem/i).first()).toBeVisible();
  });

  test("TS-10.6: Kullanıcı davet sayfasına erişim", async ({ page }) => {
    await page.goto("/settings/users/new");
    await expect(page.getByText("Kullanıcı davet et").first()).toBeVisible();
  });

  test("TS-10.7: Davet formu — E-posta ve Rol alanları", async ({ page }) => {
    await page.goto("/settings/users/new");
    await expect(page.locator("label", { hasText: "E-posta" })).toBeVisible();
    await expect(page.locator("label", { hasText: "Rol" })).toBeVisible();
  });

  test("TS-10.8: Sistem Logları sidebar'da görünür", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("a[href='/settings/logs']")).toBeVisible();
  });
});
