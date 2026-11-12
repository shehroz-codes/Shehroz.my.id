import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { ArrowRight, Download, Layers, Send } from 'lucide-react';
import { GitHubMark } from './icons';
import './AboutCard.css';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface AboutDetail {
  /** Any icon node — a lucide component instance or an inline SVG. */
  icon: ReactNode;
  label: string;
  /** Optional link (mailto:, tel:, https://...). Omit when there is no real target. */
  href?: string;
}

export interface TechItem {
  name: string;
  /** Any ReactNode, usually an inline <svg>. */
  icon: ReactNode;
  /** Optional link (e.g. your GitHub profile). */
  href?: string;
}

export interface CardAction {
  label: string;
  href: string;
  icon: 'download' | 'github';
  /** Suggests a download to the browser instead of navigating. */
  download?: boolean;
}

export interface AboutCardProps {
  name?: string;
  role?: string;
  specialty?: string;
  bio?: string;

  /** Path to your portrait (transparent PNG/WebP looks best). Files in /public are served from "/". */
  image?: string;
  imageAlt?: string;
  /**
   * Replace the built-in portrait panel with your own node,
   * for example the React Bits <ProfileCard />.
   */
  profileSlot?: ReactNode;

  eyebrow?: string;
  eyebrowIndex?: string;

  available?: boolean;
  availableLabel?: string;

  /** Left info column. */
  contactDetails?: AboutDetail[];
  /** Right info column. */
  highlights?: AboutDetail[];

  techStackLabel?: string;
  techStack?: TechItem[];

  connectLabel?: string;
  connectHref?: string;
  /** Optional second button. Omit it to render a single primary action. */
  secondaryAction?: CardAction;

  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Default content                                                           */
/*  Real content lives in `src/config/profile.ts` + `src/config/aboutCardData.tsx`. */
/*  These defaults are intentionally neutral so no demo identity can leak in.  */
/* -------------------------------------------------------------------------- */

const DEFAULT_CONTACT: AboutDetail[] = [];
const DEFAULT_HIGHLIGHTS: AboutDetail[] = [];
const DEFAULT_TECH: TechItem[] = [];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Sets the stagger index used by the CSS reveal animation. */
const delay = (index: number): CSSProperties => ({ '--i': index }) as CSSProperties;

const linkProps = (href: string) =>
  /^https?:\/\//.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};

/** Becomes true once the element scrolls into view (runs once). */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible] as const;
}

function DetailRow({ item, index }: { item: AboutDetail; index: number }) {
  const inner = (
    <>
      <span className="about-card__chip">{item.icon}</span>
      <span className="about-card__detail-text">{item.label}</span>
    </>
  );

  return (
    <li className="about-card__detail ac-reveal" style={delay(index)}>
      {item.href ? (
        <a className="about-card__detail-link" href={item.href} {...linkProps(item.href)}>
          {inner}
        </a>
      ) : (
        <span className="about-card__detail-link">{inner}</span>
      )}
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function AboutCard({
  name = '',
  role = '',
  specialty,
  bio = '',
  image = `${import.meta.env.BASE_URL}sections/about/profile.png`,
  imageAlt,
  profileSlot,
  eyebrow = 'About Me',
  eyebrowIndex = '01',
  available = true,
  availableLabel = 'Available for work',
  contactDetails = DEFAULT_CONTACT,
  highlights = DEFAULT_HIGHLIGHTS,
  techStackLabel = 'Tech Stack',
  techStack = DEFAULT_TECH,
  connectLabel = "Let's Connect",
  connectHref = '#',
  secondaryAction,
  className = '',
}: AboutCardProps) {
  const [ref, visible] = useInView<HTMLElement>();
  const headingId = useId();

  // Last word of the name gets the animated violet gradient.
  const words = name.trim().split(/\s+/).filter(Boolean);
  const accentWord = words.length > 1 ? words.pop() : undefined;
  const leadingWords = words.join(' ');

  // Moves the "light" on the glass to follow the pointer (CSS variables only, no re-render).
  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
  };

  const techBase = 9;
  const actionsIndex = techBase + techStack.length;

  return (
    <section
      ref={ref}
      aria-labelledby={headingId}
      className={`about-card ${visible ? 'is-visible' : ''} ${className}`.trim()}
      onPointerMove={handlePointerMove}
    >
      <div className="about-card__surface">
        {/* Decorative layers: glow, light sweep, pointer light, coding symbols */}
        <div className="about-card__fx" aria-hidden="true">
          <span className="about-card__orb about-card__orb--a" />
          <span className="about-card__orb about-card__orb--b" />
          <span className="about-card__shine" />
          <span className="about-card__spot" />
          <span className="about-card__dots about-card__dots--tr" />
          <span className="about-card__dots about-card__dots--bl" />
          <span className="about-card__symbol about-card__symbol--lg">{'</>'}</span>
          <span className="about-card__symbol about-card__symbol--sm-a">{'{ }'}</span>
          <span className="about-card__symbol about-card__symbol--sm-b">{'=>'}</span>
        </div>
        <span className="about-card__border" aria-hidden="true" />

        <div className="about-card__grid">
          {/* ------------------------------ Left: portrait ------------------------------ */}
          <div className="about-card__media ac-reveal" style={delay(0)}>
            {profileSlot ? (
              <div className="about-card__slot">{profileSlot}</div>
            ) : (
              <figure className="about-card__portrait">
                <img
                  className="about-card__photo"
                  src={image}
                  alt={imageAlt ?? (name ? `Portrait of ${name}` : 'Portrait')}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
                <span className="about-card__badge" aria-hidden="true">
                  {'</>'}
                </span>
                {available && (
                  <span className="about-card__status">
                    <span className="about-card__status-dot" aria-hidden="true" />
                    {availableLabel}
                  </span>
                )}
              </figure>
            )}
          </div>

          {/* ------------------------------ Right: content ------------------------------ */}
          <div className="about-card__content">
            <div className="about-card__eyebrow-row ac-reveal" style={delay(0)}>
              <span className="about-card__eyebrow">
                <span>{eyebrowIndex}</span>
                <span className="about-card__dash" aria-hidden="true" />
                <span>{eyebrow}</span>
              </span>
              <span className="about-card__rule" aria-hidden="true" />
            </div>

            <h2 id={headingId} className="about-card__name ac-reveal" style={delay(1)}>
              {leadingWords}
              {accentWord && (
                <>
                  {leadingWords ? ' ' : ''}
                  <span className="about-card__accent">{accentWord}</span>
                </>
              )}
            </h2>

            <p className="about-card__role ac-reveal" style={delay(2)}>
              {role}
            </p>

            {specialty && (
              <p className="about-card__specialty ac-reveal" style={delay(2)}>
                {specialty}
              </p>
            )}

            <p className="about-card__bio ac-reveal" style={delay(3)}>
              {bio}
            </p>

            {(contactDetails.length > 0 || highlights.length > 0) && (
              <div className="about-card__details">
                <ul className="about-card__list" aria-label="Contact information">
                  {contactDetails.map((item, i) => (
                    <DetailRow key={item.label} item={item} index={4 + i} />
                  ))}
                </ul>
                <ul className="about-card__list about-card__list--split" aria-label="Specialty and education">
                  {highlights.map((item, i) => (
                    <DetailRow key={item.label} item={item} index={4 + i} />
                  ))}
                </ul>
              </div>
            )}

            {techStack.length > 0 && (
              <div className="about-card__tech-block">
                <div className="about-card__tech-head ac-reveal" style={delay(techBase - 1)}>
                  <Layers size={20} aria-hidden="true" />
                  <h3>{techStackLabel}</h3>
                  <span className="about-card__rule" aria-hidden="true" />
                </div>
                <ul className="about-card__tech-list" aria-label={techStackLabel}>
                  {techStack.map((tech, i) => (
                    <li key={tech.name} className="ac-reveal" style={delay(techBase + i)}>
                      {tech.href ? (
                        <a
                          className="about-card__tech about-card__tech--labeled"
                          href={tech.href}
                          aria-label={tech.name}
                          title={tech.name}
                          {...linkProps(tech.href)}
                        >
                          {tech.icon}
                          <span className="about-card__tech-label">{tech.name}</span>
                        </a>
                      ) : (
                        <span
                          className="about-card__tech about-card__tech--labeled"
                          role="img"
                          aria-label={tech.name}
                          title={tech.name}
                        >
                          {tech.icon}
                          <span className="about-card__tech-label" aria-hidden="true">
                            {tech.name}
                          </span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="about-card__actions ac-reveal" style={delay(actionsIndex)}>
              <a className="about-card__btn about-card__btn--primary" href={connectHref} {...linkProps(connectHref)}>
                <Send className="about-card__btn-icon about-card__btn-icon--send" size={18} aria-hidden="true" />
                <span>{connectLabel}</span>
                <ArrowRight className="about-card__btn-arrow" size={18} aria-hidden="true" />
              </a>
              {secondaryAction && (
                <a
                  className="about-card__btn about-card__btn--ghost"
                  href={secondaryAction.href}
                  {...(secondaryAction.download ? { download: true } : linkProps(secondaryAction.href))}
                >
                  {secondaryAction.icon === 'github' ? (
                    <span className="about-card__btn-icon about-card__btn-icon--download">
                      <GitHubMark size={18} />
                    </span>
                  ) : (
                    <Download
                      className="about-card__btn-icon about-card__btn-icon--download"
                      size={18}
                      aria-hidden="true"
                    />
                  )}
                  <span>{secondaryAction.label}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
