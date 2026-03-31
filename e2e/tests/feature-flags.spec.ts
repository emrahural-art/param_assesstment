import { test, expect } from "@playwright/test";

const sidebar = "nav, aside, [class*='sidebar']";

test.describe("TS-12: Feature Flag Entegrasyonu", () => {
  test("TS-12.1: Sidebar temel menü öğeleri her zaman var", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator(sidebar).first();
    await expect(nav.locator("a[href='/']")).toBeVisible();
    await expect(nav.locator("a[href='/candidates']")).toBeVisible();
    await expect(nav.locator("a[href='/assessments']")).toBeVisible();
    await expect(nav.locator("a[href='/settings']")).toBeVisible();
  });

  test("TS-12.2: Feature flag API — GET", async ({ request }) => {
    const res = await request.get("/api/settings/features");
    expect(res.ok()).toBeTruthy();
    const flags = await res.json();
    expect(Array.isArray(flags)).toBeTruthy();
    expect(flags.length).toBeGreaterThanOrEqual(3);
  });

  test("TS-12.3: Feature flag API — PATCH toggle", async ({ request }) => {
    const getRes = await request.get("/api/settings/features");
    const flags = (await getRes.json()) as { id: string; key: string; enabled: boolean }[];
    const comm = flags.find((f) => f.key === "communication");
    if (!comm) return;

    const original = comm.enabled;
    const patchRes = await request.patch("/api/settings/features", {
      data: { key: comm.key, enabled: !original },
    });
    expect(patchRes.ok()).toBeTruthy();

    await request.patch("/api/settings/features", {
      data: { key: comm.key, enabled: original },
    });
  });

  test("TS-12.4: Feature flag sidebar durumu API ile uyumlu", async ({ page, request }) => {
    const getRes = await request.get("/api/settings/features");
    const flags = (await getRes.json()) as { key: string; enabled: boolean }[];

    await page.goto("/");
    const nav = page.locator(sidebar).first();

    for (const flag of flags) {
      const hrefMap: Record<string, string> = {
        pipeline: "/pipeline",
        listings: "/listings",
        communication: "/communication",
      };
      const href = hrefMap[flag.key];
      if (!href) continue;

      const link = nav.locator(`a[href='${href}']`);
      if (flag.enabled) {
        await expect(link).toBeVisible();
      } else {
        await expect(link).not.toBeVisible();
      }
    }
  });
});
