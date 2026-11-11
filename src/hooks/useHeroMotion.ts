import { useEffect, useRef, useState } from "react";

/** Keep enhanced effects local, visible, focused, and off constrained/touch devices. */
export function useHeroMotion() {
  const ref = useRef<HTMLElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    let visible = false;
    let focused = true;
    const update = () => {
      const running = visible && focused && !document.hidden;
      setActive(running && !motion.matches);
      setEnhanced(
        running &&
          !motion.matches &&
          pointer.matches &&
          (navigator.hardwareConcurrency || 4) > 2,
      );
    };
    const blur = () => {
      focused = false;
      update();
    };
    const focus = () => {
      focused = true;
      update();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    if (ref.current) observer.observe(ref.current);
    motion.addEventListener("change", update);
    pointer.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    update();
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", update);
      pointer.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
    };
  }, []);
  return { ref, enhanced, active };
}
