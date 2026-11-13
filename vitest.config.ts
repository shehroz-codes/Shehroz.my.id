import { defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: { alias: { 'npm:@supabase/server@1.9.2': '@supabase/server' } },
  test: { environment: 'jsdom', include: ['tests/**/*.test.{ts,tsx}'], restoreMocks: true },
});
