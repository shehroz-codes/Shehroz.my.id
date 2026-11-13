import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  use: { baseURL: 'http://127.0.0.1:4173/Shehroz.my.id/',
    launchOptions: { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173/Shehroz.my.id/', reuseExistingServer: false },
});
