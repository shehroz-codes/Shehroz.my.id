import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', testMatch: 'contact-final.spec.ts', workers: 1,
  timeout: 60000, expect: { timeout: 15000 },
  use: { baseURL: 'http://127.0.0.1:4176/Shehroz.my.id/', launchOptions: { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4176', url: 'http://127.0.0.1:4176/Shehroz.my.id/', reuseExistingServer: false,
    env: { VITE_CONTACT_MODE: 'live', VITE_CONTACT_BACKEND: 'supabase', VITE_VISITOR_SUBMISSIONS_ENABLED: 'true',
      VITE_SUPABASE_URL: 'https://lctzkigzaudjiotopzye.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_browser_test_only', VITE_TURNSTILE_SITE_KEY: '1x00000000000000000000AA' },
  },
});
