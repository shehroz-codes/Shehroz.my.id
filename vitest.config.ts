import { defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: { alias: { 'npm:@imagemagick/magick-wasm@0.0.30': '@imagemagick/magick-wasm', 'npm:@supabase/server@1.9.2': '@supabase/server', 'npm:@supabase/supabase-js@2.119.0': '@supabase/supabase-js' } },
  test: { environment: 'jsdom', include: ['tests/**/*.test.{ts,tsx}'], restoreMocks: true },
});
