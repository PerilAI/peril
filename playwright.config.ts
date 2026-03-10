import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:0",
  },
  projects: [
    {
      name: "api",
      testMatch: "**/*.api.test.ts",
    },
    {
      name: "browser",
      testMatch: "**/*.browser.test.ts",
      use: {
        browserName: "chromium",
        headless: true,
      },
    },
  ],
});
