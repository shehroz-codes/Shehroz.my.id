export const previewKey = 'shehroz.contact.preview.v1';
export const liveCooldownKey = 'shehroz.contact.live.cooldown';
export const changeEvent = 'shehroz-contact-change';

export function readStored(key: string): unknown {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null'); } catch { return null; }
}
export function expiry(key: string): number {
  const record = readStored(key) as { cooldownUntil?: unknown } | null;
  const until = record?.cooldownUntil;
  return typeof until === 'number' && Number.isFinite(until) ? until : 0;
}
export function notify() { window.dispatchEvent(new Event(changeEvent)); }
export function setLiveExpiry(until: number) {
  try {
    localStorage.setItem(liveCooldownKey, JSON.stringify({ cooldownUntil: until }));
  } catch { /* The live server still enforces cooldown when browser storage is unavailable. */ }
  notify();
}
