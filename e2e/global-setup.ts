import { chromium, type FullConfig } from "@playwright/test";

const BASE = "http://localhost:3000";

const users = [
  {
    email: "emrah.ural@param.com.tr",
    password: "Param2026!",
    file: "e2e/.auth/system-admin.json",
  },
  {
    email: "aysenur.ors@param.com.tr",
    password: "Param2026!",
    file: "e2e/.auth/admin.json",
  },
];

async function loginAndSave(
  email: string,
  password: string,
  storageFile: string
) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Get CSRF token from the signin page
  const csrfRes = await page.request.get(`${BASE}/api/auth/csrf`);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  // POST credentials login
  await page.request.post(`${BASE}/api/auth/callback/credentials`, {
    form: {
      email,
      password,
      csrfToken,
      json: "true",
    },
  });

  // Verify login by navigating
  await page.goto(BASE);
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 10_000,
  });

  await context.storageState({ path: storageFile });
  await browser.close();
}

export default async function globalSetup(_config: FullConfig) {
  for (const u of users) {
    await loginAndSave(u.email, u.password, u.file);
    console.log(`  ✓ storageState saved: ${u.file}`);
  }
}
