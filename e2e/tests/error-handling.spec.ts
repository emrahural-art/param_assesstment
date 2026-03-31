import { test, expect } from "@playwright/test";

test.describe("TS-13: Hata Yönetimi ve Edge Case", () => {
  test("TS-13.1: 404 — var olmayan sayfa", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res?.status()).toBe(404);
  });

  test("TS-13.2: API — authenticated system admin gets 200", async ({ request }) => {
    const res = await request.get("/api/candidates");
    expect(res.ok()).toBeTruthy();
  });

  test("TS-13.3: Geçersiz sınav token'ı", async ({ page }) => {
    await page.goto("/exam/totally-invalid-token");
    await expect(
      page.getByText(/bulunamadı|hata|error|geçersiz|not found/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("TS-13.4: Health API çalışıyor", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
  });
});
