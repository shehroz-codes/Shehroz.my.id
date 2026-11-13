import { links, profile } from '../../config/profile';

// Public contact details only. Missing channels stay unpublished.
export const contactProfile = {
  name: profile.fullName,
  role: 'Web Developer & AI Integration',
  location: profile.location,
  email: links.email,
  phone: null as string | null,
  github: links.github,
  linkedin: links.linkedin,
  tiktok: null as string | null,
  whatsapp: null as string | null,
};

// Live mode is an explicit opt-in after backend/rules review and verification.
// Never put service-account credentials or email/moderation secrets in VITE_*.
export const contactMode = import.meta.env.VITE_CONTACT_MODE === 'live' ? 'live' : 'preview';
export const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? '';
// This is only a UI gate. The Edge Function's independent server gate stays authoritative.
export const visitorSubmissionsEnabled = import.meta.env.VITE_VISITOR_SUBMISSIONS_ENABLED === 'true';
export const functionsBaseUrl = import.meta.env.VITE_CONTACT_FUNCTIONS_URL?.trim() ?? '';
export const wallSettings = { maxMessageLength: 300, cooldownMs: 600_000, pageSize: 5, maxPhotoBytes: 2 * 1024 * 1024 };
