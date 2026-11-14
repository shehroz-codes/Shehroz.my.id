import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { links } from "../sections/config/profile";
import "./PortfolioFooter.css";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SocialId = "github" | "linkedin" | "instagram";

export interface FooterSocial {
  id: SocialId;
  /** Accessible name, e.g. "GitHub" */
  label: string;
  /** Real profile URL. Leave undefined to show the dim "coming soon" state. */
  href?: string;
}

export interface FooterNavItem {
  /** Must match the `id` of the section in your page (without the #). */
  id: string;
  label: string;
}

export interface PortfolioFooterProps {
  /** First part of the brand name. Default: "Shehroz" */
  name?: string;
  /** Violet gradient part of the brand name. Default: "Coder" */
  highlight?: string;
  tagline?: string;
  /** Name used in the copyright line. */
  ownerName?: string;
  navItems?: readonly FooterNavItem[];
  socials?: readonly FooterSocial[];
  /** Shown as "Built with A, B, C & D". Pass [] to hide the line. */
  techStack?: readonly string[];
  /** Text of the status pill. Pass null to hide it. */
  availability?: string | null;
  /** Where "Back to top" points. Default: "#home" */
  topHref?: string;
  /** Extra classes on the root <footer> (e.g. Tailwind utilities like "mt-24"). */
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Defaults (edit these once; no need to touch the JSX)                */
/* ------------------------------------------------------------------ */

export const DEFAULT_NAV: readonly FooterNavItem[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "interests", label: "My Interests" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

/* Only put REAL urls here. No href = dim, non-clickable "soon" icon. */
export const DEFAULT_SOCIALS: readonly FooterSocial[] = [
  { id: "github", label: "GitHub", href: links.github },
  { id: "linkedin", label: "LinkedIn", href: links.linkedin ?? undefined },
  { id: "instagram", label: "Instagram" },
];

const DEFAULT_TECH: readonly string[] = ["React", "TypeScript", "Tailwind", "Supabase"];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** ["A","B","C"] -> "A, B & C" */
function formatList(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} & ${items[items.length - 1]}`;
}

/** Light scroll-spy: returns the id of the section currently in view. */
function useActiveSection(ids: readonly string[], initial: string): string {
  const [active, setActive] = useState(initial);
  const key = ids.join("|");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    for (const id of key.split("|")) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);

  return active;
}

/* ------------------------------------------------------------------ */
/* Icons (inline SVG, no icon library)                                 */
/* ------------------------------------------------------------------ */

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" className="pf-icon--fill" aria-hidden="true" focusable="false">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="pf-icon--both" aria-hidden="true" focusable="false">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="pf-icon--stroke" aria-hidden="true" focusable="false">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<SocialId, () => React.JSX.Element> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function PortfolioFooter({
  name = "Shehroz",
  highlight = "Coder",
  tagline = "Web Developer & AI Integration",
  ownerName = "Muhammad Shehroz",
  navItems = DEFAULT_NAV,
  socials = DEFAULT_SOCIALS,
  techStack = DEFAULT_TECH,
  availability = "Available for work",
  topHref = "#home",
  className,
}: PortfolioFooterProps) {
  const activeId = useActiveSection(
    navItems.map((item) => item.id),
    navItems[0]?.id ?? "home",
  );
  const year = new Date().getFullYear();

  const handleBackToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <footer className={className ? `pf-footer ${className}` : "pf-footer"} aria-label="Site footer">
      <div className="pf-inner">
        <div className="pf-glow" aria-hidden="true" />

        {/* Row 1: brand | nav | socials */}
        <div className="pf-top">
          <div className="pf-brand">
            <p className="pf-brand__name">
              {name} <span>{highlight}</span>
            </p>
            <p className="pf-brand__tagline">{tagline}</p>
          </div>

          <span className="pf-vr" aria-hidden="true" />

          <nav className="pf-nav" aria-label="Footer">
            <ul className="pf-nav__list">
              {navItems.map(({ id, label }) => (
                <li key={id}>
                  <a
                    className="pf-nav__link"
                    href={`#${id}`}
                    aria-current={activeId === id ? "location" : undefined}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <span className="pf-vr" aria-hidden="true" />

          <ul className="pf-socials" aria-label="Social links">
            {socials.map(({ id, label, href }) => {
              const Icon = SOCIAL_ICONS[id];
              return (
                <li key={id}>
                  {href ? (
                    <a
                      className="pf-social"
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} (opens in a new tab)`}
                    >
                      <Icon />
                    </a>
                  ) : (
                    <span
                      className="pf-social pf-social--soon"
                      role="img"
                      aria-label={`${label}, coming soon`}
                      title={`${label} — soon`}
                    >
                      <Icon />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Row 2: legal | status | built with | back to top */}
        <div className="pf-bottom">
          <p className="pf-copy">
            © {year} <strong>{ownerName}</strong>. All rights reserved.
          </p>

          {availability && (
            <>
              <span className="pf-vr pf-vr--sm" aria-hidden="true" />
              <span className="pf-status">
                <span className="pf-status__dot" aria-hidden="true" />
                {availability}
              </span>
            </>
          )}

          {techStack.length > 0 && (
            <>
              <span className="pf-vr pf-vr--sm" aria-hidden="true" />
              <p className="pf-built">Built with {formatList(techStack)}</p>
            </>
          )}

          <span className="pf-vr pf-vr--sm" aria-hidden="true" />

          <a className="pf-totop" href={topHref} onClick={handleBackToTop}>
            <ArrowUpIcon />
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}