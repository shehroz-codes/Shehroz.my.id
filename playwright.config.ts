import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  use: { launchOptions: { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } },
  projects: [
    { name: 'preview', testMatch: 'contact.spec.ts', use: { baseURL: 'http://127.0.0.1:4173/Shehroz.my.id/' } },
    { name: 'live-disabled', testMatch: 'live-readonly.spec.ts', use: { baseURL: 'http://127.0.0.1:4174/Shehroz.my.id/' } },
  ],
  webServer: [
    { command: 'npm run dev -- --host 127.0.0.1 --port 4173', url: 'http://127.0.0.1:4173/Shehroz.my.id/', reuseExistingServer: false,
      env: { VITE_CONTACT_MODE: 'preview', VITE_CONTACT_BACKEND: 'supabase', VITE_VISITOR_SUBMISSIONS_ENABLED: 'false' } },
    { command: 'npm run dev -- --host 127.0.0.1 --port 4174', url: 'http://127.0.0.1:4174/Shehroz.my.id/', reuseExistingServer: false,
      env: { VITE_CONTACT_MODE: 'live', VITE_CONTACT_BACKEND: 'supabase', VITE_VISITOR_SUBMISSIONS_ENABLED: 'false',
        VITE_SUPABASE_URL: 'https://lctzkigzaudjiotopzye.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_browser_test_only' } },
  ],
});
