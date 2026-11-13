import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { changeEvent, expiry } from './services/storage';

// Port of the source's absolute-expiry cooldown; storage events synchronize tabs.
// Timers exist only while cooling down and are removed when the section unmounts.
export function useCooldown(key: string) {
  const subscribe = useCallback((update: () => void) => {
    window.addEventListener('storage', update);
    window.addEventListener(changeEvent, update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener(changeEvent, update);
    };
  }, []);
  const snapshot = useCallback(() => expiry(key), [key]);
  const until = useSyncExternalStore(subscribe, snapshot, () => 0);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    if (until <= Date.now()) return;
    const timer = window.setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('focus', update);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('focus', update);
    };
  }, [until, until > now]);
  const remaining = Math.max(0, until - now);
  const seconds = Math.ceil(remaining / 1000);
  return { remaining, label: `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` };
}
