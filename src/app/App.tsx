import GlowCursor from "../components/GlowCursor/GlowCursor";
import PillNav from "../components/PillNav/PillNav";
import type { PillNavItem } from "../components/PillNav/PillNav";
import "./App.css";
import { PortfolioSections } from "../sections/PortfolioSections";
import { Hero } from "../components/Hero/Hero";

const navigation: PillNavItem[] = [
  { label: "Home", href: "#home", ariaLabel: "Home" },
  { label: "About", href: "#about", ariaLabel: "About" },
  { label: "Skills", href: "#skills", ariaLabel: "Skills" },
  { label: "Projects", href: "#projects", ariaLabel: "Projects" },
  { label: "Contact", disabled: true, ariaLabel: "Contact — not implemented yet" },
];

export function App() {
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
              activeHref="#home"
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
                "--pn-mark": "40px",
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
      </div>
    </div>
  );
}
