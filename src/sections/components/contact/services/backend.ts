import { contactMode, contactProvider } from '../config';
import type { Backend } from '../types';
import { previewBackend } from './previewBackend';

// Lazy-load the SDK only for explicit live mode. Never fall back from live
// failures to the local preview, which could falsely imply successful delivery.
export async function loadBackend(): Promise<Backend> {
  if (contactMode === 'live') return contactProvider === 'supabase'
    ? (await import('./supabaseBackend')).supabaseBackend
    : (await import('./firebaseBackend')).firebaseBackend;
  return previewBackend;
}
