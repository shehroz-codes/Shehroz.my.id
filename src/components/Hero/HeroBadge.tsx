import { lazy, Suspense, useState } from "react";
import { portfolio } from "../../content/portfolio";

const Lanyard = lazy(() => import("../Lanyard/Lanyard"));
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export function HeroBadge({ enhanced }: { enhanced: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [back, setBack] = useState(false);
  const [flipSignal, setFlipSignal] = useState(0);
  const { badge } = portfolio;
  const surface = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-surface")
    .trim();
  const ready = Boolean(badge.front && badge.back && !imageFailed);
  const fallback =
    badge.front && !imageFailed ? (
      <img
        className="hero-badge-static"
        onError={() => setImageFailed(true)}
        src={asset((back ? badge.back : badge.front) || badge.front)}
        alt={`${portfolio.name} — ${back ? "reverse of developer badge" : "developer badge portrait"}`}
        width={1080}
        height={1440}
      />
    ) : (
      <div className="hero-badge-pending">
        <span className="hero-badge-caption">ORIGINAL ARTWORK</span>
        <div className="hero-badge-outline" aria-hidden="true">
          <span>FRONT / BACK</span>
        </div>
        <strong>{portfolio.name}</strong>
        <p>Badge artwork pending</p>
        <small>
          The original image files still need to be transferred into the
          project.
        </small>
      </div>
    );
  return (
    <figure
      className="hero-badge"
      aria-label={`${portfolio.name}, developer badge`}
    >
      <div className="hero-badge-stage">
        {ready && enhanced ? (
          <Suspense fallback={fallback}>
            <Lanyard
              imageAlt={`${portfolio.name} — developer badge`}
              frontImage={asset(badge.front!)}
              backImage={asset(badge.back!)}
              strapImage={asset(badge.strap)}
              imageFit="contain"
              cardColor={surface}
              size={0.72}
              strapLength={0.4}
              strapColor={surface}
              strapWidth={0.65}
              finish="glossy"
              breeze={0}
              damping={0.7}
              intro
              flipSignal={flipSignal}
            />
          </Suspense>
        ) : (
          fallback
        )}
      </div>
      <figcaption className="hero-badge-footer">
        <span>{portfolio.location}</span>
        {ready && (
          <button
            type="button"
            onClick={() => {
              setBack((value) => !value);
              setFlipSignal((value) => value + 1);
            }}
            aria-label="Flip developer badge"
          >
            Flip badge
          </button>
        )}
      </figcaption>
    </figure>
  );
}
