import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  testMatch: /(?:music-motion|performance|refinement)\.spec\.ts/,
  timeout: 90_000, expect: { timeout: 15_000 }, workers: 1,
  use: { baseURL: 'http://127.0.0.1:4182/Shehroz.my.id/', launchOptions: { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } },
  webServer: { command:'npm run preview -- --host 127.0.0.1 --port 4182',url:'http://127.0.0.1:4182/Shehroz.my.id/',reuseExistingServer:true },
});
