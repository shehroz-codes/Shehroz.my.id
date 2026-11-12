import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { portfolio } from "../../content/portfolio";

const Lanyard = lazy(() => import("../Lanyard/Lanyard"));
const base = `${import.meta.env.BASE_URL}images/lanyard/`;

/** Keep Three.js out of the initial bundle and reduced-motion sessions. */
export function HeroLanyard() {
  const stage = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [wide, setWide] = useState(
    () => matchMedia("(min-width: 851px)").matches,
  );
  const [back, setBack] = useState(false);
  const [reduce, setReduce] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const desktop = matchMedia("(min-width: 851px)");
    const updateDesktop = () => setWide(desktop.matches);
    desktop.addEventListener("change", updateDesktop);
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(query.matches);
    query.addEventListener("change", update);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" },
    );
    if (stage.current) observer.observe(stage.current);
    return () => {
      desktop.removeEventListener("change", updateDesktop);
      query.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);
  const frontAlt = `${portfolio.name} — original developer badge front`;
  const backAlt =
    "Original developer badge back, Scan to Connect, with blank QR area";
  const fallback = (
    <div className="hero-lanyard-static">
      <img
        src={`${base}card-${back ? "back" : "front"}.png`}
        alt={back ? backAlt : frontAlt}
        width={1086}
        height={1448}
      />
      <button
        type="button"
        onClick={() => setBack((value) => !value)}
        aria-label={`Show ${back ? "front" : "back"} of developer badge`}
      >
        <span aria-hidden="true">↻</span>
      </button>
    </div>
  );
  return (
    <div ref={stage} className="hero-lanyard-stage">
      {reduce ? (
        fallback
      ) : near ? (
        <div className="hero-lanyard-renderer">
          <Suspense fallback={null}>
            <Lanyard
              frontImage={`${base}card-front.png`}
              backImage={`${base}card-back.png`}
              frontAlt={frontAlt}
              backAlt={backAlt}
              imageFit="contain"
              cardColor="#080616"
              orientation="portrait"
              finish="glossy"
              cornerRadius={0.3}
              size={0.67}
              viewport={wide}
              frameRef={stage}
              anchor="center"
              strapLength={0.5}
              strapColor="#111111"
              strapWidth={0.65}
              metal="silver"
              gravity={1}
              damping={0.5}
              elasticity={0.5}
              breeze={0.5}
              interactive
              intro
            />
          </Suspense>
        </div>
      ) : null}
    </div>
  );
}
