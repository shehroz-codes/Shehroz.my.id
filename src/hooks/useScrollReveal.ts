import { useEffect, useRef } from 'react';

/** Progressive enhancement: content is visible until an entrance actually starts.
 * One observation per mounted item; translate is independent of hover transforms.
 */
export function useScrollReveal<T extends HTMLElement>(selector: string, refreshKey?: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = [...root.querySelectorAll<HTMLElement>(selector)];
    if (typeof window.matchMedia !== 'function') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Map<HTMLElement, Animation>();
    const settle = (element: HTMLElement) => {
      animations.get(element)?.cancel();
      animations.delete(element);
      element.dataset.revealState = 'visible';
    };
    const showAll = () => items.forEach(settle);
    if (reduced.matches || typeof IntersectionObserver === 'undefined' || !Element.prototype.animate) {
      showAll();
      return;
    }
    let observer: IntersectionObserver | undefined;
    try {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          observer?.unobserve(element);
          if (element.dataset.revealState === 'visible' || reduced.matches || element.contains(document.activeElement)) {
            settle(element);
            continue;
          }
          const desktop = window.matchMedia('(min-width: 1024px)').matches;
          const direction = desktop ? element.dataset.revealDirection : undefined;
          const offset = direction === 'left' ? '-18px 0' : direction === 'right' ? '18px 0' : '0 18px';
          const index = items.indexOf(element);
          try {
            const animation = element.animate([
              { opacity: 0, translate: offset },
              { opacity: 1, translate: '0 0' },
            ], { duration: 460, delay: Math.min(index * 55, 220), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
            element.dataset.revealState = 'revealing';
            animations.set(element, animation);
            animation.onfinish = () => settle(element);
          } catch { settle(element); }
        }
      }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
      items.forEach(element => {
        if (element.dataset.revealState !== 'visible') observer?.observe(element);
      });
    } catch { observer?.disconnect(); showAll(); }
    const onFocus = (event: FocusEvent) => {
      const target = event.target as Node;
      items.filter(element => element.contains(target)).forEach(settle);
    };
    const onPreference = () => { if (reduced.matches) { observer?.disconnect(); showAll(); } };
    root.addEventListener('focusin', onFocus);
    reduced.addEventListener('change', onPreference);
    return () => {
      observer?.disconnect();
      items.forEach(settle);
      root.removeEventListener('focusin', onFocus);
      reduced.removeEventListener('change', onPreference);
    };
  }, [selector, refreshKey]);
  return ref;
}
