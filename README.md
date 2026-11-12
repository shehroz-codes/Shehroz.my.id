# Shehroz.my.id

Premium Personal Developer Portfolio

Tech Stack:
- React
- Vite
- TypeScript
- Tailwind CSS

Page order: **Hero → About Card → My Interests → Portfolio Showcase**.

The existing Hero, navbar and animated page background are preserved. The imported
sections retain their interactive ProfileCard, halftone/anime portrait, music UI,
and Projects / Certificates / Experience / Tech Stack tabs with document previews.

Use Node 24 LTS (minimum 22.12) and npm:

```sh
npm ci
npm run dev
npm run build     # TypeScript + production build
npm run preview   # verify dist locally
```

Vite uses `/Shehroz.my.id/` for GitHub Pages. The existing Pages workflow builds
and deploys pushes to `main`; do not deploy the integration branch directly.

See [AI handoff](docs/AI_HANDOFF.md) for component/data paths, editing boundaries,
assets, navigation and known incomplete content. The imported project's original
[README](docs/IMPORTED_SECTIONS_SOURCE.md) is retained with its source attribution.
No backend is required. Music URLs and some showcase records are intentionally
unconfigured/sample content as supplied; they are not verified achievements.
