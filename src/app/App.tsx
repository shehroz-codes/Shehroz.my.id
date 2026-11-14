import { useEffect, useState } from "react";
import GlowCursor from "../components/GlowCursor/GlowCursor";
import PillNav from "../components/PillNav/PillNav";
import type { PillNavItem } from "../components/PillNav/PillNav";
import "./App.css";
import { PortfolioSections } from "../sections/PortfolioSections";
import { Hero } from "../components/Hero/Hero";
import PortfolioFooter from "../components/PortfolioFooter";

const navigation: PillNavItem[] = [
  { label: "Home", href: "#home", ariaLabel: "Home" },
  { label: "About", href: "#about", ariaLabel: "About" },
  { label: "My Interests", href: "#interests", ariaLabel: "My Interests" },
  { label: "Projects", href: "#projects", ariaLabel: "Projects" },
  { label: "Contact", href: "#contact", ariaLabel: "Contact" },
];

export function App() {
  const [activeHref, setActiveHref] = useState("#home");

  useEffect(() => {
    const sections = ["about", "interests", "projects", "contact"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    let frame = 0;
    const update = () => {
      frame = 0;
      // Use one stable viewport line in both directions; Home wraps all sections.
      const activationLine = window.innerHeight * 0.25;
      let href = "#home";
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= activationLine) {
          href = `#${section.id}`;
        }
      }
      setActiveHref(href);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    sections.forEach((section) => observer.observe(section));
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="app-shell">
      <GlowCursor
        className="app-background"
        color="#5B21F0"
        secondaryColor="#4F46E5"
        theme="dark"
        quality="low"
        maxDevicePixelRatio={1.5}
        aria-hidden="true"
      />
      <div className="app-content">
        <header className="site-header">
          <div className="site-navigation">
            <PillNav
              logo={
                <img
                  src={`${import.meta.env.BASE_URL}icons/web-app-manifest-192x192.png`}
                  alt=""
                  width={192}
                  height={192}
                  decoding="async"
                  draggable={false}
                />
              }
              logoAlt="MS — Home"
              logoHref="#home"
              items={navigation}
              activeHref={activeHref}
              theme="dark"
              layout="split"
              surface="glass"
              itemStyle="pill"
              hoverEffect="fill"
              indicator="dot"
              size="md"
              bounce={0.3}
              stretch={0.5}
              collapse="auto"
              intro
              highlightColor="var(--gradient-brand)"
              highlightTextColor="var(--color-text)"
              barColor="color-mix(in srgb, var(--color-surface) 80%, transparent)"
              style={{
                "--pn-mark": "44px",
                "--pn-h": "50px",
                "--pn-inner": "42px",
                "--pn-x": "18px",
                "--pn-font": "16px",
                "--pn-gap": "9px",
                "--pn-strong": "var(--color-text)",
                "--pn-text": "var(--color-muted)",
                "--pn-ring": "var(--color-accent)",
                "--pn-dot": "var(--color-accent)",
                "--pn-tile": "var(--color-surface)",
                "--pn-row-hover":
                  "color-mix(in srgb, var(--color-primary) 20%, transparent)",
              }}
            />
          </div>
        </header>
        <main
          id="home"
          className="home-destination"
          aria-label="Home"
          tabIndex={-1}
        >
          <Hero />
          <PortfolioSections />
        </main>
        <PortfolioFooter />
      </div>
    </div>
  );
}
