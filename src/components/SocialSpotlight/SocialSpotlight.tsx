import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import "./SocialSpotlight.css";

export interface SocialLinks {
  github?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}
export interface SocialSpotlightProps {
  links: SocialLinks;
  className?: string;
  ariaLabel?: string;
}
const socials = [
  { key: "github", name: "GitHub", color: "#a78bfa" },
  { key: "instagram", name: "Instagram", color: "#f97316" },
  { key: "facebook", name: "Facebook", color: "#3b82f6" },
  { key: "tiktok", name: "TikTok", color: "#22d3ee" },
] as const;

export default function SocialSpotlight({ links, className = "", ariaLabel = "Social media profiles" }: SocialSpotlightProps) {
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const gradientId = useId();
  useLayoutEffect(() => {
    const element = bar.current;
    if (!element || active === null) return;
    const update = () => {
      const tile = element.querySelector<HTMLElement>(`[data-social-index="${active}"]`);
      if (tile) element.style.setProperty("--beam-x", `${tile.offsetLeft + tile.offsetWidth / 2}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [active]);
  const icons = [
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#fff"/><path fill="#0b0820" d="M12 3.5a8.5 8.5 0 0 0-2.69 16.57c.43.08.58-.18.58-.41v-1.6c-2.37.52-2.87-1.01-2.87-1.01-.39-.99-.95-1.25-.95-1.25-.78-.53.06-.52.06-.52.86.06 1.31.88 1.31.88.76 1.31 2 .93 2.49.71.08-.55.3-.93.54-1.14-1.89-.21-3.88-.95-3.88-4.21 0-.93.33-1.69.88-2.28-.09-.21-.38-1.08.08-2.25 0 0 .72-.23 2.35.87a8.1 8.1 0 0 1 4.28 0c1.63-1.1 2.35-.87 2.35-.87.46 1.17.17 2.04.08 2.25.55.59.88 1.35.88 2.28 0 3.27-2 3.99-3.89 4.2.31.26.58.78.58 1.57v2.33c0 .23.15.5.59.41A8.5 8.5 0 0 0 12 3.5Z"/></svg>,
  <svg viewBox="0 0 24 24" aria-hidden="true">
            <defs><linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#fdc830"/><stop offset=".45" stopColor="#f0398a"/><stop offset="1" stopColor="#8a3ab9"/></linearGradient></defs>
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.2"/>
            <circle cx="12" cy="12" r="4.3" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.2"/>
            <circle cx="17.4" cy="6.6" r="1.3" fill={`url(#${gradientId})`}/>
          </svg>,
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877f2"/><path fill="#fff" d="M13.2 21.6v-7.7h2.6l.4-3h-3V9c0-.87.25-1.46 1.5-1.46h1.6V4.8a21 21 0 0 0-2.3-.12c-2.3 0-3.87 1.4-3.87 3.98v2.24H7.5v3h2.6v7.7Z"/></svg>,
  <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#ff2d55" transform="translate(.9 .7)" d="M16.6 3h-3v12.2a2.6 2.6 0 1 1-2.6-2.6c.27 0 .52.04.76.12V9.6a5.7 5.7 0 1 0 4.84 5.6V8.9a7 7 0 0 0 4 1.3V7.2A4.2 4.2 0 0 1 16.6 3Z"/>
            <path fill="#25f4ee" transform="translate(-.9 -.5)" d="M16.6 3h-3v12.2a2.6 2.6 0 1 1-2.6-2.6c.27 0 .52.04.76.12V9.6a5.7 5.7 0 1 0 4.84 5.6V8.9a7 7 0 0 0 4 1.3V7.2A4.2 4.2 0 0 1 16.6 3Z"/>
            <path fill="#fff" d="M16.6 3h-3v12.2a2.6 2.6 0 1 1-2.6-2.6c.27 0 .52.04.76.12V9.6a5.7 5.7 0 1 0 4.84 5.6V8.9a7 7 0 0 0 4 1.3V7.2A4.2 4.2 0 0 1 16.6 3Z"/>
          </svg>,
  ];
  return (
    <nav className={`social-spotlight ${className}`.trim()} aria-label={ariaLabel}>
      <div ref={bar} className={`social-spotlight__inner${active !== null ? " has-active" : ""}`}
        onPointerLeave={(event) => { if (event.pointerType !== "touch") setActive(null); }}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActive(null); }}>
        <span className="social-spotlight__beam" aria-hidden="true" />
        {socials.map(({ key, name, color }, index) => {
          const href = links[key];
          return <a key={key} data-social-index={index}
            className={`social-spotlight__item${active === index ? " is-active" : ""}`}
            href={href} role={href ? undefined : "link"} tabIndex={0}
            aria-disabled={!href || undefined}
            target={href ? "_blank" : undefined} rel={href ? "noopener noreferrer" : undefined}
            aria-label={href ? `${name} (opens in a new tab)` : `${name} — profile not configured`}
            title={href ? name : `${name} — profile not configured`}
            style={{ "--brand": color } as CSSProperties}
            onPointerEnter={(event) => { if (event.pointerType !== "touch") setActive(index); }}
            onPointerDown={(event) => { if (event.pointerType !== "mouse") setActive(index); }}
            onPointerCancel={() => setActive(null)}
            onFocus={() => setActive(index)}>
            {icons[index]}
          </a>;
        })}
      </div>
    </nav>
  );
}
