import { lazy, Suspense, useState } from "react";
import { portfolio } from "../../content/portfolio";
import { useHeroMotion } from "../../hooks/useHeroMotion";
import WarpText from "../WarpText/WarpText";
import Magnet from "../Magnet/Magnet";
import PulseHeart from "../PulseHeart/PulseHeart";
import SocialSpotlight from "../SocialSpotlight/SocialSpotlight";
import "./Hero.css";

const RotatingText = lazy(() => import("../RotatingText/RotatingText"));

export function Hero() {
  const { ref, enhanced, active } = useHeroMotion();
  const [notice, setNotice] = useState("");
  return (
    <section
      ref={ref}
      className="hero"
      aria-labelledby="hero-title"
      data-motion={active ? "active" : "paused"}
    >
      <div className="hero-copy">
        <p className="hero-eyebrow">
          <span aria-hidden="true" /> WEB DEVELOPMENT · AI INTEGRATION
        </p>
        <p className="hero-greeting">Hi, I'm {portfolio.name}.</p>
        <h1 id="hero-title" className="hero-title">
          <span className="sr-only">{portfolio.displayName}</span>
          <span aria-hidden="true">
            <WarpText
              text={portfolio.displayName}
              textAlign="left"
              enabled={enhanced}
              color="currentColor"
              fontFamily="var(--font-heading)"
              fontWeight={700}
              fontSize="clamp(2rem, 5vw, 4rem)"
              lineHeight={0.95}
              idleDrift={0.08}
              chromatic={0.15}
            />
          </span>
        </h1>
        <div className="hero-roles" aria-label={portfolio.roles.join(", ")}>
          <span aria-hidden="true">I’m a</span>
          <span aria-hidden="true" className="hero-roles-window">
            <Suspense
              fallback={
                <span className="hero-role-static">{portfolio.roles[0]}</span>
              }
            >
              {active ? (
                <RotatingText
                  texts={portfolio.roles}
                  auto={active}
                  rotationInterval={3000}
                  staggerDuration={0.015}
                  highlight
                  highlightColor="var(--color-primary)"
                  style={{ color: "var(--color-text)" }}
                  splitBy="words"
                  mainClassName="hero-rotating"
                />
              ) : (
                <span className="hero-role-static">{portfolio.roles[0]}</span>
              )}
            </Suspense>
          </span>
        </div>
        <p className="hero-introduction">{portfolio.introduction}</p>
        <div className="hero-actions">
          <Magnet
            disabled={!enhanced}
            padding={32}
            magnetStrength={5}
            maxOffset={7}
          >
            {portfolio.cvPath ? (
              <a
                className="hero-cta hero-cta-primary"
                href={`${import.meta.env.BASE_URL}${portfolio.cvPath}`}
                download
              >
                Download CV{" "}
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M18 6 6 18M6 6v12h12" />
                </svg>
              </a>
            ) : (
              <button
                type="button"
                className="hero-cta hero-cta-primary"
                aria-disabled="true"
                onClick={() => setNotice("The CV has not been published yet.")}
              >
                Download CV{" "}
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M18 6 6 18M6 6v12h12" />
                </svg>
              </button>
            )}
          </Magnet>
          <Magnet
            disabled={!enhanced}
            padding={32}
            magnetStrength={5}
            maxOffset={7}
          >
            {portfolio.contactHref ? (
              <a className="hero-cta" href={portfolio.contactHref}>
                Contact Me{" "}
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 18 18 6M6 6h12v12" />
                </svg>
              </a>
            ) : (
              <button
                type="button"
                className="hero-cta"
                onClick={() =>
                  setNotice(
                    "Contact details are not published yet. You can visit my GitHub profile below.",
                  )
                }
              >
                Contact Me{" "}
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 18 18 6M6 6h12v12" />
                </svg>
              </button>
            )}
          </Magnet>
        </div>
        <p className="hero-action-status" role="status">
          {notice}
        </p>
        <div className="hero-social-row">
          <SocialSpotlight links={portfolio.socials} />
          <div className="hero-reaction">
            <PulseHeart
              disabled
              showCount={false}
              size={26}
              likedColor="var(--color-accent)"
              idleColor="var(--color-muted)"
              pillColor="var(--color-surface)"
              textColor="var(--color-text)"
              label="Likes unavailable — shared backend is not configured"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
