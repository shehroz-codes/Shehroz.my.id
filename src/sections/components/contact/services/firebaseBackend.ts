import { collection, limit as take, onSnapshot, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db, firebaseApp } from '../../../../lib/firebase';
import { functionsBaseUrl } from '../config';
import { ContactError } from '../types';
import type { Backend, Country, WallMessage } from '../types';

// Adapted from the supplied firebase-backend.js. No direct client writes.
// Keep internal moderation/IP fields in server-only documents before activation.
function requireConfiguration() {
  if (!db || firebaseApp?.options.projectId !== 'shehroz-portfolio-45a2b') {
    throw new ContactError('The contact service is not configured. Nothing has been sent.');
  }
  let endpoint: URL;
  try { endpoint = new URL(functionsBaseUrl); } catch {
    throw new ContactError('The contact service is not configured. Nothing has been sent.');
  }
  if (endpoint.protocol !== 'https:') throw new ContactError('The contact service requires a secure endpoint.');
  return { database: db, endpoint: endpoint.href.replace(/\/$/, '') };
}
function visitorId(): string {
  const key = 'shehroz.contact.visitor-id';
  try {
    const current = localStorage.getItem(key);
    if (current && /^[a-zA-Z0-9-]{16,64}$/.test(current)) return current;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch { return crypto.randomUUID(); }
}
async function call(path: string, body?: FormData | object): Promise<Record<string, unknown>> {
  const { endpoint } = requireConfiguration();
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(endpoint + path, {
      method: body ? 'POST' : 'GET',
      headers: { ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(body ? { 'X-Visitor-Id': visitorId() } : {}) },
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const result = await response.json() as Record<string, unknown>;
    if (!response.ok) throw new ContactError(
      typeof result.message === 'string' ? result.message : 'The service could not accept your message.',
      typeof result.cooldownUntil === 'number' ? result.cooldownUntil : undefined,
    );
    return result;
  } catch (error) {
    if (error instanceof ContactError) throw error;
    throw new ContactError('The contact service could not be reached. Submission is unconfirmed; please try again later.');
  } finally { clearTimeout(timer); }
}

export const firebaseBackend: Backend = {
  mode: 'live',
  subscribe(limit, update, error) {
    try {
      const { database } = requireConfiguration();
      return onSnapshot(query(
        collection(database, 'publicMessages'), where('status', '==', 'approved'), where('isDemo', '==', false),
        orderBy('createdAt', 'desc'), take(limit + 1),
      ), (snapshot) => {
        const messages: WallMessage[] = snapshot.docs.flatMap((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : null;
          if (typeof data.name !== 'string' || typeof data.text !== 'string' || typeof createdAt !== 'number') return [];
          return [{
            id: doc.id, name: data.name, text: data.text,
            photoUrl: typeof data.photoUrl === 'string' && data.photoUrl.startsWith('https://') ? data.photoUrl : null,
            countryCode: typeof data.countryCode === 'string' ? data.countryCode : null,
            countryName: typeof data.countryName === 'string' ? data.countryName : null,
            createdAt, isDemo: false,
          }];
        });
        update({ messages: messages.slice(0, limit), hasMore: snapshot.size > limit });
      }, () => error('Visitor messages could not be loaded. Please try again later.'));
    } catch { error('The visitor wall is not connected yet.'); return () => {}; }
  },
  async submitPublic(input) {
    const form = new FormData();
    form.append('name', input.name); form.append('text', input.text);
    form.append('website', input.honeypot);
    if (input.photo) form.append('photo', input.photo);
    const result = await call('/submitPublicMessage', form);
    if (!['published', 'pending'].includes(String(result.status)) ||
        typeof result.cooldownUntil !== 'number' || !Number.isFinite(result.cooldownUntil)) {
      throw new ContactError('The service response was incomplete. Submission is unconfirmed.');
    }
    return { status: result.status as 'published' | 'pending', cooldownUntil: result.cooldownUntil };
  },
  async submitPrivate(input) {
    const result = await call('/submitContact', {
      name: input.name, email: input.email, subject: input.subject,
      message: input.message, website: input.honeypot,
    });
    if (result.ok !== true) throw new ContactError('The service did not confirm receipt.');
  },
  async detectCountry(): Promise<Country> {
    try {
      const result = await call('/detectCountry');
      const code = typeof result.countryCode === 'string' && /^[a-z]{2}$/i.test(result.countryCode)
        ? result.countryCode.toUpperCase() : null;
      return { code, name: code && typeof result.countryName === 'string' ? result.countryName : null };
    } catch { return { code: null, name: null }; }
  },
};
