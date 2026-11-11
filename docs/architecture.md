# Architecture

## Application structure

- `src/main.tsx` mounts React 19 in StrictMode and imports global CSS.
- `src/app/App.tsx` retains the existing PillNav/GlowCursor shell and mounts Hero
  inside the real `main#home` destination. No router or backend is needed.
- `src/app/App.css` retains viewport layering, centered/fixed navbar positioning
  and the logo presentation without changes in Phase 05.
- `src/components/Hero/` composes the introduction, roles, CTAs, social/reaction
  controls and badge stage. `HeroBadge.tsx` owns the static/3D badge boundary.
- `src/components/{WarpText,RotatingText,Magnet,Lanyard,PulseHeart,SocialSpotlight}/`
  contains the six supplied implementations converted to strict TypeScript.
- `src/content/portfolio.ts` centralizes editable identity, roles, paths and links.
- `src/hooks/useHeroMotion.ts` gates enhancement on visibility, focus, motion
  preference, pointer capability and reported hardware concurrency.
- `src/styles/` retains tokens, self-hosted fonts and reusable CSS recipes.
- `public/icons/` retains the MS logo, favicons and manifest. `public/images/`
  contains the generated text-only strap SVG; original badge PNGs are pending.

## Scope and source selection

The user explicitly selected the second supplied component list after resolving
conflicting briefs. Phase 05 therefore uses WarpText, RotatingText, Magnet,
Lanyard, PulseHeart and SocialSpotlight. It does not add ProfileCard or StarBorder.
Only Hero is a new portfolio section; other nav destinations remain unavailable.

## Layering and loading

GlowCursor remains at layer 0 with pointer-transparent canvas, content at layer 1
and the fixed header at layer 20. The complete logo/nav group stays centered.
Hero's scoped CSS creates two columns above 850px and a single column below.

RotatingText/Motion is a lazy chunk, requested when animation is active. Lanyard/
Three.js is a separate lazy chunk requested only when both badge paths exist and
fine-pointer enhancement is appropriate. Missing badge files show an explicitly
labelled placeholder, without loading Three.js or issuing nonexistent requests.
Touch, reduced motion and constrained devices receive static text and badge art.

## Dependencies and cost

Existing React, React DOM, Fontsource, Vite, TypeScript and Tailwind remain.
The supplied implementations add `motion` (RotatingText), `ogl` (WarpText),
`three` (Lanyard), `react-icons` (social logos), `@hugeicons/core-free-icons`
(PulseHeart paths), and development-only `@types/three`. No alternative animation
engines or component installers are added.

The baseline main JS was ~259KB (~81.5KB gzip). Phase 05 main is ~352KB (~112KB
gzip), plus lazy Motion/RotatingText ~164KB (~55.6KB gzip) and lazy Lanyard/Three.js
~592KB (~152KB gzip). These are local production-build measurements, not network
or FPS benchmarks. Vite warns about the >500KB Three.js chunk; it remains visible
and documented. That chunk is not downloaded while original badge assets are
missing or enhancement is unsuitable. Retest performance on real hardware before
turning on the full card for modest devices.

## GitHub Pages

The unchanged Vite base is `/Shehroz.my.id/`. Use `import.meta.env.BASE_URL` for
app assets, `%BASE_URL%` for HTML links, and project-relative manifest URLs.
Configured content asset paths omit the leading slash. No duplicate font requests
or external font service are added. The existing Node 24 Pages workflow still
runs `npm ci` and `npm run build`, uploads `dist`, and deploys updates to `main`.
Local build/preview checks do not establish live deployment success.
