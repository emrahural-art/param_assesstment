import { test, expect } from "@playwright/test";

test.describe("TS-01: Kimlik Doğrulama ve Giriş", () => {
  test("TS-01.1: Login sayfası görünür", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /hoş geldiniz/i })).toBeVisible();
    await expect(page.getByText(/google ile devam et/i)).toBeVisible();
  });

  test("TS-01.2: Giriş yapmadan korumalı sayfaya erişim → login yönlendirmesi", async ({ page }) => {
    await page.goto("/candidates");
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test("TS-01.3: Giriş yapmadan API → 401", async ({ request }) => {
    const res = await request.get("/api/candidates");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("TS-01.4: Credentials login ile dashboard erişimi", async ({ page }) => {
    await page.goto("/login");

    const csrfRes = await page.request.get("/api/auth/csrf");
    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

    await page.request.post("/api/auth/callback/credentials", {
      form: {
        email: "emrah.ural@param.com.tr",
        password: "Param2026!",
        csrfToken,
        json: "true",
      },
    });

    await page.goto("/");
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("TS-01.5: Geçersiz credentials → hata", async ({ page }) => {
    await page.goto("/login");

    const csrfRes = await page.request.get("/api/auth/csrf");
    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

    const res = await page.request.post("/api/auth/callback/credentials", {
      form: {
        email: "nonexistent@test.com",
        password: "wrongpassword",
        csrfToken,
        json: "true",
      },
    });

    await page.goto("/candidates");
    await expect(page).toHaveURL(/\/login/);
  });
});
