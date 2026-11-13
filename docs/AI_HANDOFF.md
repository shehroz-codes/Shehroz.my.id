# Integrated portfolio handoff

Page order: **existing Hero → About Card/ProfileCard → My Interests → Portfolio Showcase**.
There are no duplicate About/Projects sections or additional demo sections.

## Entry points and boundaries

- `src/app/App.tsx`: existing application root, navbar and background; mounts
  `PortfolioSections` immediately after Hero inside the existing main landmark.
- `src/sections/PortfolioSections.tsx`: original supplied ProfileCard wiring and
  section order. Edit component props here only when changing the imported card.
- `src/sections/PortfolioSections.css`: section spacing, anchor offsets and local
  typography. The source demo App/index CSS and second React root are not imported.
- `src/components/Hero`, `Lanyard`, social buttons, and global theme are unchanged.
  Preserve their sizes, physics, artwork and interaction code in future section work.

## Safely edit content

- `src/sections/config/profile.ts`: About identity, portrait, 11 compact skills,
  published contacts. `aboutCardData.tsx` adapts these to AboutCard props.
- `src/sections/components/AboutCard.*`, `ProfileCard/`: About pointer light,
  staggered entrance, holographic tilt, glare and Contact action. Keep the original
  violet override stylesheet and transparent portrait fit. Reduced motion and
  touch-safe tilt behavior are retained.
- `src/sections/components/my-interests/interestsData.ts`: interest cards and
  portrait options; `HalftonePortrait.tsx` retains WebGL anime reveal, pointer/tap,
  burst and keyboard-focus behavior. `MyInterests.css` scopes card/portrait styles.
- `my-interests/musicData.ts`: playlist, genres, favorites and optional audio or
  official embed URLs. `MusicPlayer.tsx` retains filters, favorite toggles, seek,
  volume, shuffle, repeat, previous/next and play/pause when a source is supplied.
- `src/sections/components/showcase/portfolioData.ts`: projects, certificates,
  experience and technologies; shared interfaces in `types.ts`. Keep the supplied
  honest sample labels and unavailable-link controls until verified data is added.
- Showcase tabs retain arrow/Home/End keyboard navigation. Native dialog previews
  retain Escape, focus trapping/restoration, images, PDFs and download controls.

## Navigation

Home → `#home`; About → `#about`; Projects → `#projects`; Skills → `#skills`.
Projects and Skills hash navigation select the Projects or Tech Stack tab,
including direct loads. My Interests has a stable `#interests` anchor. Contact
remains unavailable as before; About's contact actions use its configured GitHub
fallback until an email is published. The navbar design is unchanged.

## Assets, dependencies and attribution

Only `lucide-react` was missing and added. React, TypeScript, Vite and Tailwind
reuse the host toolchain and lockfile. No router or second app is added.
The later Firebase foundation is documented below.

- Original profile PNG, iconpattern SVG and backdrop SVG:
  `public/sections/about/`. Runtime public paths use `import.meta.env.BASE_URL`.
- Real/anime portraits: `src/sections/assets/portraits/`.
- Original showcase WebP previews, SVG tech icons and sample PDFs:
  `src/sections/components/showcase/assets/` (bundled imports, base-path safe).
- Backdrop CSS uses a source-relative URL that Vite rewrites into a bundled asset.
- `docs/IMPORTED_SECTIONS_SOURCE.md` preserves the original README (its paths are
  relative to the supplied standalone project, now nested under `src/sections`).
  Original source comments/React Bits attribution and `SIMPLE-ICONS-LICENSE.txt`
  are retained. Do not copy source node_modules, build outputs or demo background.

For future public CV/audio paths, prepend `import.meta.env.BASE_URL`; use imported
assets for bundled documents and images. Never hardcode domain-root paths on Pages.
CSS class families `about-card`, `profile-card`, `mi-`, `hp-` and `ps-` remain scoped.
The imported wrapper inherits the source's Inter typography locally and does not
change the host headings or global background.

## Run and validate

From the repository root, use Node >=22.12 (24 LTS recommended): `npm ci`,
`npm run dev`, `npm run build` (includes both TypeScript projects), then
`npm run preview`. Visit `/Shehroz.my.id/`, not the domain root. The existing
GitHub Pages workflow builds `dist/` and deploys pushes to main.

Check mobile and desktop overflow, About tilt/contact links, interest hover and
portrait reveal, playlist state, all four showcase tabs, keyboard focus/Escape,
image/PDF previews and downloads, and About/Skills/Projects navigation. Verify
Hero source remains unchanged. Reduced motion intentionally uses static effects.

## Supplied content limitations

All track audio/embed URLs are empty. Playback/seek/volume controls appropriately
remain disabled and no audio is invented. Supply licensed tracks or official
embeds to validate real playback. Showcase assets include labeled sample projects,
certificates and experience letters; unprovided links stay unavailable. About
email/CV/LinkedIn and several social channels remain unconfigured. No credentials
or backend are needed to render the portfolio. Vite's existing large Lanyard chunk warning remains.


## Firebase foundation (no feature integration)

- Existing project: `shehroz-portfolio-45a2b`; web app: **Shehroz Portfolio Web**.
  Default Firestore: **(default), Standard Edition, Native Mode** (developer
  verified locally). Do not create replacements.
- Official modular `firebase` SDK is a runtime dependency. `src/lib/firebase.ts`
  exports `firebaseApp`, `db` and `isFirebaseConfigured`; it reuses the default app
  across hot reloads. All six values must be present/nonblank, otherwise instances
  are null. Consumers must guard `db` and handle runtime permission/network errors.
  No Analytics, Auth, Admin SDK, read/write calls or current UI imports are added.
- `.env.example` documents `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
  `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
  `VITE_FIREBASE_MESSAGING_SENDER_ID` and `VITE_FIREBASE_APP_ID`.
  Copy to ignored `.env.local` and use the existing web app's real public config.
  Vite embeds values during builds; restart dev/rebuild after changes. Never put
  OAuth/login tokens, service accounts or private keys in frontend variables.
- `.firebaserc` targets the existing project. `firebase.json` configures only
  Firestore rules/indexes. `firestore.rules` denies all client access recursively;
  `firestore.indexes.json` has empty indexes/field overrides, not a live export.
  No Hosting or Pages workflow changes are included.
- Files in GitHub do **not** activate Firestore rules. Codex Cloud currently lacks
  authenticated Firebase management access; no remote reads or deployments were
  tested here. The developer deploys manually on Linux Mint with their existing
  authenticated Firebase CLI. See [README](../README.md#firestore-configuration-and-manual-deployment)
  for exact login/project/database/app checks and the explicit project-scoped
  `deploy --only firestore:rules` command. Review live rules before replacement;
  this baseline denies all clients. Compare live indexes before any index deploy.
  Rules management needs appropriate IAM (such as Firebase Rules Admin); future
  backend deployments need separate permissions. Review/verify prototype rules.
- Local setup: `npm ci`, `cp .env.example .env.local`, fill values, then
  `npm run dev`, `npm run typecheck`, `npm run build`. Configuration is optional
  for existing portfolio sections; presence does not prove remote access.
- Future Contact and Visitor Message Wall should use shared `db` through feature
  services. Define schemas, allowed queries/indexes, rules, validation and abuse
  controls first. Neither feature nor collections, messages, uploads, cooldowns,
  AI moderation or location detection exists in this phase. Keep current About
  links, navigation, Hero, Interests and Showcase behavior intact.
