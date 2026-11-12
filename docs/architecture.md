# Architecture

## Application structure

- `src/main.tsx` mounts React 19 in StrictMode and imports global CSS.
- `src/app/App.tsx` retains the existing PillNav/GlowCursor shell and mounts Hero
  inside the real `main#home` destination. No router or backend is needed.
- `src/app/App.css` retains viewport layering, centered/fixed navbar positioning
  and the logo presentation without changes in Phase 05.
- `src/components/Hero/` composes the introduction, single-line WarpText heading,
  roles, CTAs and social controls. `HeroLanyard.tsx` lazy-loads the
  supplied typed card using a right-column framing slot and a viewport-wide
  desktop stage (above the text on mobile).
- `src/components/{WarpText,RotatingText,Magnet,PulseHeart,SocialSpotlight}/`
  contains the existing supplied Hero implementations converted to strict TypeScript.
- `src/content/portfolio.ts` centralizes editable identity, roles, paths and links.
- `src/hooks/useHeroMotion.ts` gates enhancement on visibility, focus, motion
  preference, pointer capability and reported hardware concurrency.
- `src/styles/` retains tokens, self-hosted fonts and reusable CSS recipes.
- `public/icons/` retains the MS logo, favicons and manifest.
- `public/images/lanyard/` contains the two exact original badge PNGs.
- `src/components/Lanyard/` contains the newly supplied TypeScript engine and CSS.

## Scope and source selection

The user explicitly selected the second supplied component list after resolving
conflicting briefs. Phase 05 therefore uses WarpText, RotatingText, Magnet,
PulseHeart and SocialSpotlight. Lanyard was subsequently removed by the final
corrections. Phase 06 now integrates the newly supplied TypeScript Lanyard and
original badge PNGs. No ProfileCard or StarBorder is included.
Hero is followed by the supplied About Card, My Interests and Portfolio Showcase.
See [AI handoff](AI_HANDOFF.md) for the current integration boundaries and navigation.

## Layering and loading

GlowCursor remains at layer 0 with pointer-transparent canvas, content at layer 1
and the fixed header at layer 20. The complete logo/nav group stays centered.
Hero's scoped CSS creates two columns above 850px and a single column below.
On desktop `.hero-lanyard-renderer` is absolutely framed by `.app-content` at
its document-top origin. It spans the viewport with no negative margin and no
extra layout height. The right-column slot controls the resting card size and
horizontal anchor. The physical strap begins just beyond the camera's top edge;
its simulated length derives from the higher resting card position. The scene
scrolls away with the Hero rather than remaining fixed over future sections.
Hero copy is at local layer 1 above the stage at 0; the header stays at 20.
The expanded canvas is pointer-transparent. Window listeners raycast the actual
card, ignore copy/header/interactive controls, and capture only a card grab. Its drag target uses the original spring engine without the previous desktop reach clamp.
Cleanup restores the cursor and removes listeners. On mobile the canvas returns
to the inline slot and original local pointer/touch handling.

RotatingText/Motion remains a lazy chunk, requested when its existing animation
is active. Three.js/Lanyard is a separate lazy chunk requested near its stage,
except in reduced-motion sessions. Normal loading is transparent, including the
Suspense and texture-readiness phases, so there is no flat PNG flash. Unsupported
WebGL2 and reduced motion show the exact static artwork. No sample card or
decorative panel is introduced. The original
WarpText shaders/ripple/hover and Magnet solver are retained; the heading receives
one string without a newline, plus scoped responsive sizing for static fallback.

## Dependencies and cost

The remaining source-required packages are `motion`, `ogl`, `react-icons` and
`@hugeicons/core-free-icons`, alongside the existing React/Fontsource packages.
Phase 06 adds only `three` at runtime and `@types/three` for development, as
required by the supplied engine. Local production output is about 351KB main JS
(~112KB gzip), 164KB lazy RotatingText (~55.6KB gzip), and 594KB lazy Lanyard
(~152KB gzip). Vite reports its >500KB chunk advisory for Lanyard. Lazy loading
keeps that cost out of initial/reduced-motion loads. The original PNGs total
4.22MB; they are intentionally uncompressed originals. These are build sizes,
not physical GPU, network-speed, FPS or Lighthouse measurements.

## Likes status

Hero no longer renders a Like button. The reusable PulseHeart component,
`usePortfolioLike` hook and local persistence adapter remain available for future
use. No shared backend or Firebase SDK is configured. Do not invent a global count.

## GitHub Pages

The unchanged Vite base is `/Shehroz.my.id/`. Use `import.meta.env.BASE_URL` for
app assets, `%BASE_URL%` for HTML links, and project-relative manifest URLs.
Configured content asset paths omit the leading slash. No duplicate font requests
or external font service are added. The existing Node 24 Pages workflow still
runs `npm ci` and `npm run build`, uploads `dist`, and deploys updates to `main`.
Local build/preview checks do not establish live deployment success.

## Imported completed sections

`src/sections/PortfolioSections.tsx` mounts the supplied components beneath Hero
using the original ProfileCard props. Its CSS supplies section spacing and local
font inheritance, without importing the source demo's page background, reset,
entry point or Vite configuration. `lucide-react` is the only added dependency.
Public About artwork lives in `public/sections/about/`; portrait and showcase
assets remain beside the imported source and are bundled by Vite. See
[AI handoff](AI_HANDOFF.md) for data locations, checks and known source limitations.
