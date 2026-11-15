import { defineConfig } from '@playwright/test';

const baseURL = process.env.PERF_BASE_URL || 'http://127.0.0.1:4180/Shehroz.my.id/';
export default defineConfig({
  testDir: './tests/browser',
  testMatch: /(?:contact|performance)\.spec\.ts/,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  workers: 1,
  use: {
    baseURL,
    launchOptions: { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] },
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4180',
    url: baseURL,
    reuseExistingServer: true,
  },
});
