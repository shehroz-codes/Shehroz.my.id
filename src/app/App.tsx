import { useState } from "react";
import GlowCursor from "../components/GlowCursor/GlowCursor";
import PillNav from "../components/PillNav/PillNav";
import type { PillNavItem } from "../components/PillNav/PillNav";
import { DesignSystemPreview } from "../design-system/DesignSystemPreview";
import "./App.css";

const navigation: PillNavItem[] = [
  { label: "Home", href: "#home", ariaLabel: "Home — design-system preview" },
  ...["About", "Skills", "Projects", "Contact"].map((label) => ({
    label,
    disabled: true,
    ariaLabel: `${label} — not implemented yet`,
  })),
];

export function App() {
  const [notice, setNotice] = useState(
    "Home opens the existing preview. Other sections are not implemented yet.",
  );

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
              onItemClick={(item) => {
                if (item.disabled)
                  setNotice(`${item.label} is not implemented yet.`);
              }}
              style={{
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
        <p className="navigation-notice" role="status">
          {notice}
        </p>
        <div id="home" className="home-destination" tabIndex={-1}>
          <DesignSystemPreview />
        </div>
      </div>
    </div>
  );
}
