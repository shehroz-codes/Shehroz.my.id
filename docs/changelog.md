# Changelog

## Unreleased — Phase 05 Hero (original badge files pending)

The navbar-branding PR was verified merged before branching from latest `main`.
The user selected the second supplied component list after a scope clarification:
WarpText, RotatingText, Magnet, Lanyard, PulseHeart and SocialSpotlight.

- Added a responsive Hero and typed centralized personal content; kept PillNav,
  logo rotation, GlowCursor, global styles/tokens, icons and Pages config unchanged.
- Converted the six supplied sources to TypeScript, retaining their engines.
  Added visibility/focus/coarse-pointer/reduced-motion/constrained-device gates,
  static fallbacks, resource cleanup, frame/DPR caps and lazy loading.
- Added compact social controls, one local like per load, truthful unavailable CV
  and contact behavior, and generated text-only “Shehroz Coder” strap artwork.
- Badge front/back paths remain null because the inline chat images were not
  exposed as downloadable files and local Downloads paths are unavailable.
  No replacement face was generated. Final badge artwork integration is blocked.
- Added five source-required runtime packages and `@types/three`; measured bundle
  sizes and the Three.js chunk warning are documented in Architecture.

### Verification and remaining review

- `npm ci`, type checking and production build pass. No pre-existing automated
  test suite is configured; browser checks used temporary external Playwright.
- Chromium reduced-motion checks pass at 320/375/390/768/1024/1366/1440/1920px:
  responsive Hero, no horizontal overflow, working destinations, centered navbar,
  unavailable CV explanation, contact action, local-like guard and asset paths.
- Normal-motion StrictMode checks pass: actual WarpText shader draws, all four
  rotating roles, Magnet movement, PulseHeart animation and live reduced-motion
  cleanup, without runtime/console errors. Role-fit checks at 320/1440px confirm
  all four roles fit one line with no vertical shift in the following paragraph.
- The original Lanyard renderer mounted, loaded diagnostic logo textures and
  tore down successfully. Those diagnostic textures were browser-only; they are
  not shipped as replacements. Real portrait/front/back clarity remains untested.
- Original navbar logo/background source and deployment configuration remain
  unchanged. Their regression checks and the current external asset limitation
  must remain visible in review; do not describe this as completed badge delivery.

Not verified: real badge files, a real CV/contact endpoint, shared live reactions,
physical GPU/mobile hardware, Safari/Firefox, screen readers or live deployment.
Review the Hero typography/spacing, optional data behavior, reaction semantics,
performance cost and real badge textures before merge. No other section is added.

## Earlier — centered navbar and supplied MS branding

- Branched from the latest `main`; existing feature branches were retained.
- Removed the temporary preview file, its homepage specimens, sample controls,
  and visible navigation implementation notices. Tokens, fonts, reusable CSS
  recipes, PillNav and GlowCursor remain.
- Centered the complete logo/navbar group in a fixed top header. Preserved dark
  glass styling, violet/indigo fill highlights, automatic collapse and the
  original navigation engine. Unimplemented sections remain unavailable controls.
- Integrated the supplied transparent MS image and PNG/ICO/Apple/manifest icons.
  Optimized the raster-backed SVG favicon from 2,589,687 to 32,367 bytes by
  embedding the supplied 96px PNG. All supplied PNG and ICO bytes are unchanged.
- Updated manifest branding, colors and project-relative URLs; no maskable icon
  was fabricated. Kept the existing Vite base and deployment workflow unchanged.
- Changed logo hover to four clockwise turns over 2000ms, finishing upright,
  without looping or triggering on touch/pen or reduced motion.
- Added a documentation index, architecture, component and animation guides;
  refreshed design-system/development/provenance docs without changing root README.

### Validation

- `npm ci`, `npm run typecheck`, `npm run build`, and `git diff --check` passed.
- Chromium production-preview checks at 320, 375, 768, 1440 and 1920px at 2× DPR
  passed: complete-group centering within 0.5px, fixed position, reserved logo
  dimensions, mobile/keyboard behavior, no demo content or horizontal overflow,
  valid Home anchors, and all icon/manifest URLs under `/Shehroz.my.id/`.
- The SVG favicon decoded successfully in Chromium. Relative manifest scope,
  start URL, and both icon URLs resolve to the project path.
- Scroll tests injected a temporary spacer only in the browser, since the actual
  homepage intentionally contains no portfolio content or artificial sections.
- Logo tests confirmed 0→1440 degree keyframes, 2000ms/one iteration, visible
  rotation, identity transform after completion, no looping while hovered, and
  live reduced-motion cancellation.
- WebGL2 software-renderer checks confirmed nontransparent pointer/click output,
  DPR ≤1.5, blur/hidden/idle stopping and focus resume. GlowCursor source and app
  settings were verified unchanged. No application dependencies were added.

Limitations: automated browser tooling is temporary and outside the repository;
no persistent browser-test dependency was added. Safari, Firefox, physical GPU/
mobile hardware, real screen readers, installed Apple/PWA icon presentation, and
live GitHub Pages deployment were not tested. A manifest does not provide offline
support; no service worker is implemented. PR creation and hosted CI depend on
GitHub permissions and review.

## Earlier foundations

- Initial React 19 / Vite / TypeScript / Tailwind v4 foundation, strict type checks
  and build scripts.
- Dark design tokens, self-hosted variable fonts and a temporary preview (now removed).
- GitHub Actions Pages deployment with Node 24 and `/Shehroz.my.id/` asset base.
- Supplied GlowCursor/PillNav conversion, original shader/spring preservation,
  responsive disclosure navigation and GPU/reduced-motion safeguards.
