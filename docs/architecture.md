# Architecture

## Application structure

- `src/main.tsx` mounts React 19 in StrictMode and imports global CSS.
- `src/app/App.tsx` retains the existing PillNav/GlowCursor shell and mounts Hero
  inside the real `main#home` destination. No router or backend is needed.
- `src/app/App.css` retains viewport layering, centered/fixed navbar positioning
  and the logo presentation without changes in Phase 05.
- `src/components/Hero/` composes the introduction, single-line WarpText heading,
  roles, CTAs and social/reaction controls. The right-hand grid area is empty.
- `src/components/{WarpText,RotatingText,Magnet,PulseHeart,SocialSpotlight}/`
  contains the six supplied implementations converted to strict TypeScript.
- `src/content/portfolio.ts` centralizes editable identity, roles, paths and links.
- `src/hooks/useHeroMotion.ts` gates enhancement on visibility, focus, motion
  preference, pointer capability and reported hardware concurrency.
- `src/styles/` retains tokens, self-hosted fonts and reusable CSS recipes.
- `public/icons/` retains the MS logo, favicons and manifest. Card/strap assets
  have been removed; no card asset directory is required.

## Scope and source selection

The user explicitly selected the second supplied component list after resolving
conflicting briefs. Phase 05 therefore uses WarpText, RotatingText, Magnet,
PulseHeart and SocialSpotlight. Lanyard was subsequently removed by the final
corrections. No replacement card, ProfileCard or StarBorder is included.
Only Hero is a new portfolio section; other nav destinations remain unavailable.

## Layering and loading

GlowCursor remains at layer 0 with pointer-transparent canvas, content at layer 1
and the fixed header at layer 20. The complete logo/nav group stays centered.
Hero's scoped CSS creates two columns above 850px and a single column below.

RotatingText/Motion remains a lazy chunk, requested when its existing animation
is active. The card component, its placeholder, strap and Three.js dependency
have been removed. Desktop keeps the right-hand grid area empty. The original
WarpText shaders/ripple/hover and Magnet solver are retained; the heading receives
one string without a newline, plus scoped responsive sizing for static fallback.

## Dependencies and cost

The remaining source-required packages are `motion`, `ogl`, `react-icons` and
`@hugeicons/core-free-icons`, alongside the existing React/Fontsource packages.
`three` and `@types/three` were removed because no remaining code needs them.
Local production output is about 350KB main JS (~111KB gzip) and 164KB lazy
RotatingText (~55.6KB gzip). The former 592KB card chunk and its build warning
are gone. These are build sizes, not FPS or Lighthouse measurements.

## Shared likes status

No Firebase project/backend is configured. The user explicitly deferred that
integration to a separate setup task. PulseHeart's component source is unchanged;
Hero uses its disabled/no-count state and does not claim a shared total. No SDK,
localStorage counter, fake persistence, initial count or privileged key is added.
Future integration requires a selected Firebase project or service, atomic server
increments, abuse controls, and tests across refreshes and independent sessions.

## GitHub Pages

The unchanged Vite base is `/Shehroz.my.id/`. Use `import.meta.env.BASE_URL` for
app assets, `%BASE_URL%` for HTML links, and project-relative manifest URLs.
Configured content asset paths omit the leading slash. No duplicate font requests
or external font service are added. The existing Node 24 Pages workflow still
runs `npm ci` and `npm run build`, uploads `dist`, and deploys updates to `main`.
Local build/preview checks do not establish live deployment success.
