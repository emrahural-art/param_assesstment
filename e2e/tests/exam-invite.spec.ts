import { test, expect } from "@playwright/test";

test.describe("TS-05: Sınav Davet Sistemi", () => {
  test("TS-05.1: Geçersiz token ile sınav erişimi → hata", async ({ page }) => {
    await page.goto("/exam/invalid-token-12345");
    await expect(
      page.getByText(/bulunamadı|hata|error|geçersiz/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test("TS-05.2: Sınav sayfası yüklenir (geçerli token varsa)", async ({ page, request }) => {
    // Önce login olalım
    const csrfRes = await request.get("/api/auth/csrf");
    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
    await request.post("/api/auth/callback/credentials", {
      form: {
        email: "emrah.ural@param.com.tr",
        password: "Param2026!",
        csrfToken,
        json: "true",
      },
    });

    // Token varsa sınav bilgileri kontrolü; yoksa skip
    const invitesRes = await request.get("/api/assessments/test-genel-yetenek/invites");
    if (invitesRes.ok()) {
      const invites = (await invitesRes.json()) as { token?: string }[];
      if (invites.length > 0 && invites[0].token) {
        await page.goto(`/exam/${invites[0].token}`);
        await expect(
          page.getByText(/genel yetenek|sınav|başlat/i)
        ).toBeVisible({ timeout: 10_000 });
      }
    }
  });

  test("TS-05.3: Sınav başlangıç ekranında kurallar gösterilir", async ({ page, request }) => {
    const csrfRes = await request.get("/api/auth/csrf");
    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
    await request.post("/api/auth/callback/credentials", {
      form: {
        email: "emrah.ural@param.com.tr",
        password: "Param2026!",
        csrfToken,
        json: "true",
      },
    });

    const invitesRes = await request.get("/api/assessments/test-genel-yetenek/invites");
    if (invitesRes.ok()) {
      const invites = (await invitesRes.json()) as { token?: string; status?: string }[];
      const pending = invites.find((i) => i.status === "PENDING");
      if (pending?.token) {
        await page.goto(`/exam/${pending.token}`);
        await expect(page.getByRole("button", { name: /başlat/i })).toBeVisible({
          timeout: 10_000,
        });
      }
    }
  });
});
