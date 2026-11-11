# Development

Use Node.js 22.12 or newer (Node.js 24 LTS recommended) and npm.

```sh
npm ci
npm run dev
```

The application renders the preserved MS navbar/background and the Phase 05 Hero.
Original badge artwork, CV and contact data remain pending; see
[Components](components.md) for the exact configuration steps. See
[Design system](design-system.md) for token usage and accessibility guidance.
No environment variables or backend services are required.

## Commands

- `npm run dev`: Vite development server with React Fast Refresh.
- `npm run typecheck`: check application and Vite configuration types without emitting files.
- `npm run build`: type check, then generate the production site in `dist/`.
- `npm run preview`: serve the production build locally for verification.

Deploy `dist/` to a static host after building. The preview server is for local
verification, not production hosting. No client-side routing is configured yet.

## Structure

- `src/main.tsx`: React entry point.
- `src/app/`: application composition and future providers.
- `src/components/`: preserved PillNav/GlowCursor and the supplied Hero components.
- `src/content/portfolio.ts`: editable content, links and asset paths.
- `src/hooks/useHeroMotion.ts`: enhancement/lifecycle policy.
- `public/images/`: strap SVG and the future original badge images.
- `src/styles/`: global CSS, fonts, design tokens, and Tailwind import.
- `public/icons/`: MS logo, favicons, and web app manifest.
- `docs/`: development documentation.

Add feature folders and shared components when they are needed, rather than
creating unused placeholders. Tailwind CSS uses its Vite plugin and CSS-first
configuration; no PostCSS or legacy Tailwind configuration is required.

The lockfile is committed for reproducible installs. There is no automated test
suite yet; foundation validation consists of type checking, a production build,
and development/production browser smoke checks.

For the complete documentation map, see [Documentation](README.md).

The Three.js lazy chunk currently exceeds Vite's 500KB warning threshold; this
is a reported build warning, not a failed build. See [Architecture](architecture.md)
for measured chunk sizes and [Changelog](changelog.md) for actual browser coverage.
Do not enable nonexistent image/CV paths merely to suppress placeholders.
