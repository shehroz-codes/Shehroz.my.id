# Architecture

## Application structure

- `src/main.tsx` mounts React 19 in StrictMode and imports global CSS.
- `src/app/App.tsx` composes exactly two React Bits components and an empty,
  accessible `main#home` destination. No router or backend is needed.
- `src/app/App.css` owns viewport layering, navbar centering, fixed positioning,
  the circular logo presentation, and shell dimensions.
- `src/components/PillNav/` contains the typed original navigation and CSS.
- `src/components/GlowCursor/` contains the original shader/simulation engine
  and its performance safeguards.
- `src/styles/` holds centralized tokens, self-hosted fonts, and reusable CSS.
- `public/icons/` contains the supplied MS branding/favicon assets and manifest.

The temporary preview component and all demonstration content were removed.
Underlying tokens, fonts, `.ds-panel` and `.ds-button` recipes remain available.

## Layering and layout

The shell isolates its stacking context. GlowCursor sits at layer 0, fixed to
the viewport with `pointer-events: none`; content sits at layer 1. The header is
fixed near the top at layer 20 and has symmetric fluid page padding. Its flex
container centers the entire logo + PillNav group, not just the menu pills.

The collapsed navbar fills the available padded width and places the logo and
44px toggle at opposite ends. The whole group stays centered. Explicit control
and logo dimensions reserve layout space before assets load. Header padding is
pointer-transparent; the navigation itself accepts input. The empty main reserves
a viewport of space for the upcoming Hero without adding mock content.

## Dependencies

Runtime dependencies remain React, React DOM, and three Fontsource variable-font
packages. Vite, TypeScript, Tailwind v4 and their existing plugins handle builds.
PillNav uses browser RAF/WAAPI; GlowCursor uses native WebGL2. No animation, router,
image-processing, or 3D package was added to the application.

## GitHub Pages and assets

`vite.config.ts` sets `base: '/Shehroz.my.id/'`. App asset URLs use
`import.meta.env.BASE_URL`; HTML icon links use Vite's `%BASE_URL%` replacement.
The manifest is served from `icons/site.webmanifest`; relative icon URLs resolve
inside that directory, while `start_url` and `scope` use `../` to resolve to the
project root. Do not replace these with domain-root paths.

The existing `.github/workflows/deploy.yml` builds with Node 24, runs `npm ci`
and `npm run build`, uploads `dist`, and deploys on updates to `main`. It retains
its job-scoped permissions and deployment concurrency group. Live deployment
is separate from local build/preview validation.
