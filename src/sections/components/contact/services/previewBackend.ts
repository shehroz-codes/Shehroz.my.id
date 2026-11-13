import { wallSettings } from '../config';
import { ContactError } from '../types';
import type { Backend, Country, WallMessage } from '../types';
import { changeEvent, notify, previewKey, readStored } from './storage';

interface PreviewRecord { cooldownUntil: number; messages: WallMessage[] }
function read(): PreviewRecord {
  const stored = readStored(previewKey) as Partial<PreviewRecord> | null;
  return {
    cooldownUntil: typeof stored?.cooldownUntil === 'number' ? stored.cooldownUntil : 0,
    messages: Array.isArray(stored?.messages) ? stored.messages.filter((m) =>
      m && typeof m.id === 'string' && typeof m.name === 'string' &&
      typeof m.text === 'string' && Number.isFinite(new Date(m.createdAt).getTime()),
    ).slice(0, 50) : [],
  };
}
export function localCountry(): Country {
  const countries: Record<string, string> = {
    'Asia/Karachi': 'PK', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
    'Europe/London': 'GB', 'America/Toronto': 'CA', 'Asia/Tokyo': 'JP',
    'Asia/Dubai': 'AE', 'Europe/Berlin': 'DE', 'America/New_York': 'US',
    'Australia/Sydney': 'AU', 'Asia/Riyadh': 'SA', 'Europe/Paris': 'FR',
    'Asia/Dhaka': 'BD', 'Asia/Singapore': 'SG', 'Europe/Istanbul': 'TR',
  };
  const code = countries[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? null;
  return { code, name: code ? new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code : null };
}

export const previewBackend: Backend = {
  mode: 'preview',
  subscribe(limit, update, error) {
    const emit = () => {
      try {
        const messages = read().messages;
        update({ messages: messages.slice(0, limit), hasMore: messages.length > limit });
      } catch { error('The local preview could not be read.'); }
    };
    emit();
    window.addEventListener('storage', emit);
    window.addEventListener(changeEvent, emit);
    return () => {
      window.removeEventListener('storage', emit);
      window.removeEventListener(changeEvent, emit);
    };
  },
  async submitPublic({ name, text, photoDataUrl, country, honeypot }) {
    if (honeypot) throw new ContactError('Submission rejected.');
    name = name.trim(); text = text.trim();
    if (!name || name.length > 80 || !text || text.length > 300) {
      throw new ContactError('Enter a name and a message of up to 300 characters.');
    }
    const record = read();
    if (record.cooldownUntil > Date.now()) {
      throw new ContactError('Please wait before posting again.', record.cooldownUntil);
    }
    // The preview is not a moderation or security service. Suspicious posts are
    // rejected locally, never represented as accepted by a live moderation queue.
    if (/(https?:\/\/|www\.|crypto|casino|free money)/i.test(name + ' ' + text)) {
      throw new ContactError('Links and promotional messages are not supported in the preview.');
    }
    const cooldownUntil = Date.now() + wallSettings.cooldownMs;
    const message: WallMessage = {
      id: crypto.randomUUID(), name, text,
      photoUrl: photoDataUrl, countryCode: country.code, countryName: country.name,
      createdAt: Date.now(), isDemo: true,
    };
    try {
      // One atomic browser-storage write contains both the post and its expiry.
      localStorage.setItem(previewKey, JSON.stringify({
        cooldownUntil, messages: [message, ...record.messages].slice(0, 50),
      }));
    } catch { throw new ContactError('Browser storage is unavailable or full. Your preview was not saved.'); }
    notify();
    return { status: 'published', cooldownUntil };
  },
  async submitPrivate() {
    // Never retain private correspondence or pretend to send email in demo mode.
    throw new ContactError('Private message delivery is not connected yet. Your message has not been sent.');
  },
  async detectCountry() { return localCountry(); },
};
