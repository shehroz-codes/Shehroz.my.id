# Design system

The temporary preview has been removed from the homepage. All underlying tokens,
fonts and reusable CSS recipes remain available for approved future components.

## Tokens

`src/styles/tokens.css` is the source of truth. Tailwind v4's `@theme` exposes
semantic utilities such as `bg-background`, `bg-surface`, `text-text`,
`text-muted`, `text-accent`, `font-heading`, `font-sans`, `font-mono`,
`rounded-control`, `rounded-panel`, `text-display`, and `text-title`.

| Role | Value |
| --- | --- |
| Background | `#050310` |
| Surface | `#0B0A1F` |
| Primary violet | `#5B21F0` |
| Secondary indigo | `#4F46E5` |
| Main text | `#F8FAFC` |
| Muted text | `#A7A3BA` |
| Accent | `#A78BFA` |

Spacing uses a 0.25rem unit (`gap-4` = 1rem). `px-page` and `py-section` provide
fluid spacing; display/title sizes use clamp. Radii, focus outlines, decorative
borders, interaction timing and ambient/brand gradients live in the same file.
`src/styles/index.css` applies base styles and retains `.ds-panel`, `.ds-button`
and `.ds-button-primary` for future use. The root uses `color-scheme: dark`.

## Fonts

`src/styles/fonts.css` self-hosts Latin variable WOFF2 assets: Space Grotesk for
headings, Inter for body text, and JetBrains Mono for code. Normal styles use
`font-display: swap` and system fallbacks. No external font service is needed.
Additional scripts and italic files can be added when required; Fontsource
licenses remain in the installed packages.

## Accessibility

Use main/muted text on background or surface, and main text on the brand gradient.
Violet/indigo are fills rather than small-text colors on dark surfaces. Global
keyboard focus uses a 3px accent outline; PillNav retains its local visible 2px
accent rings. The 44px logo/toggle controls have reserved dimensions. Unavailable
nav items remain explicitly `aria-disabled`, not fake anchors. Reduced motion and
component-specific performance policies are described in [Animations](animations.md).
