# Design system foundation

The root application temporarily renders `src/design-system/DesignSystemPreview.tsx`.
It is a specimen of tokens and controls, not a portfolio page. Remove its import
from `src/app/App.tsx` when an approved component replaces the preview.

## Editing tokens

`src/styles/tokens.css` is the source of truth. Tailwind v4's `@theme` exposes
semantic utilities such as `bg-background`, `bg-surface`, `text-text`,
`text-muted`, `text-accent`, `font-heading`, `font-sans`, `font-mono`,
`rounded-control`, `rounded-panel`, `text-display`, and `text-title`.

Spacing uses a 0.25rem base unit (`gap-4` = 1rem). `px-page` and `py-section`
provide fluid page spacing; headings scale with clamp. The preview uses one
column on small screens and expands its typography and palette grids as space
allows. All controls have a minimum 44px height.

CSS custom properties in the same token file define decorative borders, focus
outlines, interaction timing, and ambient/brand gradients. `index.css` applies
base styles and the minimal `.ds-panel` / `.ds-button` / `.ds-button-primary`
recipes. There is no theme switcher; the root uses `color-scheme: dark`.

## Fonts

`fonts.css` self-hosts Latin variable WOFF2 assets from the three Fontsource
packages (Space Grotesk, Inter, JetBrains Mono). Only normal styles are loaded,
with `font-display: swap` and system fallbacks. No external font service is
needed at runtime. Additional scripts or italics can be added when required;
package licenses are retained in node_modules.

## Accessibility and motion

Use text or muted text on background/surface; use primary text on the brand
button gradient. Primary and secondary colors are fills, not small text colors
on dark surfaces. Swatch names sit outside the swatch to preserve contrast.
The subtle panel border is decorative; enabled buttons use an accent border.
All keyboard-focusable elements receive an offset 3px accent outline. Disabled
controls are native disabled buttons. Demo clicks announce a status message.

The only motion is a short border/shadow transition. The reduced-motion media
query sets its centralized duration to zero. There are no entrance animations,
transforms, or automatic motion. New motion must use the duration token and
honor the same preference.
