import { test, expect } from "@playwright/test";

test.describe("TS-11: Rol Bazlı Erişim Kontrolü", () => {
  test("TS-11.1: System Admin — Ayarlar sayfasında Modül Yönetimi görünür", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText("Modül Yönetimi")).toBeVisible();
  });

  test("TS-11.2: System Admin — Sistem Logları sidebar'da", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("a[href='/settings/logs']")).toBeVisible();
  });

  test("TS-11.3: System Admin — Kullanıcı davet erişimi", async ({ page }) => {
    await page.goto("/settings/users/new");
    await expect(page.getByText("Kullanıcı davet et")).toBeVisible();
  });

  test("TS-11.4: API yetki kontrolü — system admin settings/features", async ({ request }) => {
    const res = await request.get("/api/settings/features");
    expect(res.ok()).toBeTruthy();
  });

  test("TS-11.5: API yetki kontrolü — system admin settings/logs", async ({ request }) => {
    const res = await request.get("/api/settings/logs?type=audit");
    expect(res.ok()).toBeTruthy();
  });
});
