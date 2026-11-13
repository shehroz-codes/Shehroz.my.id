interface ImportMetaEnv {
  readonly VITE_CONTACT_BACKEND?: 'firebase' | 'supabase';
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_VISITOR_SUBMISSIONS_ENABLED?: string;
  readonly VITE_CONTACT_MODE?: 'preview' | 'live';
  readonly VITE_CONTACT_FUNCTIONS_URL?: string;
}
