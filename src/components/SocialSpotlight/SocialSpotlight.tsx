import { useState, type CSSProperties, type PointerEvent } from "react";
import { SiGithub, SiInstagram, SiFacebook, SiTiktok } from "react-icons/si";
import type { IconType } from "react-icons";
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

type SocialItem = {
  key: keyof SocialLinks;
  name: string;
  Icon: IconType;
  color: string;
};

const SOCIALS: SocialItem[] = [
  { key: "github", name: "GitHub", Icon: SiGithub, color: "#F8FAFC" },
  { key: "instagram", name: "Instagram", Icon: SiInstagram, color: "#F77737" },
  { key: "facebook", name: "Facebook", Icon: SiFacebook, color: "#1877F2" },
  { key: "tiktok", name: "TikTok", Icon: SiTiktok, color: "#25F4EE" },
];

export default function SocialSpotlight({
  links,
  className = "",
  ariaLabel = "Social media profiles",
}: SocialSpotlightProps) {
  const [active, setActive] = useState<string | null>(null);

  function trackPointer(event: PointerEvent<HTMLAnchorElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    event.currentTarget.style.setProperty(
      "--pointer-x",
      `${Math.max(0, Math.min(100, x))}%`,
    );
  }

  return (
    <nav
      className={`social-spotlight ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <div className="social-spotlight__inner">
        {SOCIALS.map(({ key, name, Icon, color }) => {
          const href = links[key];
          if (!href) return null;
          return (
            <a
              key={key}
              className={`social-spotlight__item social-spotlight__item--${key}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} (opens in a new tab)`}
              title={name}
              style={{ "--brand-color": color } as CSSProperties}
              data-active={active === key ? "true" : undefined}
              onPointerEnter={() => setActive(key)}
              onPointerLeave={() => setActive(null)}
              onPointerMove={trackPointer}
              onFocus={() => setActive(key)}
              onBlur={() => setActive(null)}
            >
              <span className="social-spotlight__beam" aria-hidden="true" />
              <span className="social-spotlight__icon-wrap" aria-hidden="true">
                <Icon className="social-spotlight__icon" />
              </span>
              <span className="sr-only">{name}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
