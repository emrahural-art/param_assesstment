import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  globalSetup: "./e2e/global-setup.ts",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "system-admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/system-admin.json",
      },
      testIgnore: [
        "**/auth.spec.ts",
        "**/candidate-portal.spec.ts",
        "**/exam-invite.spec.ts",
      ],
    },
    {
      name: "no-auth",
      use: { ...devices["Desktop Chrome"] },
      testMatch: [
        "**/auth.spec.ts",
        "**/candidate-portal.spec.ts",
        "**/exam-invite.spec.ts",
      ],
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
