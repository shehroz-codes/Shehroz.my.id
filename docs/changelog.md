# Changelog

## Unreleased — Phase 06 original Lanyard

- Branch `feature/phase-06-original-lanyard` starts from main `e3487f7`, whose
  merge history records Hero corrections PR #7. Main and unrelated work are untouched.
- Integrate the fresh supplied TypeScript Lanyard, not the deleted sample version.
  Add exact original front/back PNGs, preserving their bytes and blank QR area.
- Match portrait geometry/UV proportions and physical slot to the approved artwork.
  Retain original dark strap, silver hardware, glossy shaders, intro, physics,
  mouse/touch drag, swing and click/tap flip. Add keyboard flip and static art.
- Lazy-load Three.js; add reduced-motion, visibility/focus/offscreen pauses,
  DPR/frame-rate limits, context-loss fallback and resource cleanup.
- Preserve Hero copy/engines, PillNav/MS animation, GlowCursor, tokens, favicon,
  Pages configuration and deferred Firebase status. Update architecture/component/
  animation/provenance documentation with asset hashes and performance limits.

Validation: `npm ci`, `npm run typecheck`, `npm run build`, and `git diff --check`
passed. ZIP/public/dist PNG bytes and both supplied shader blocks match exactly.
Chromium production-preview checks passed at 320/375/390/768/1024/1440/1920px
without horizontal overflow, with real card rendering at desktop/tablet/mobile
widths. Keyboard, card click/tap, mouse/touch drag, mobile scrolling, menu Escape,
blur/offscreen draw-call pauses, reduced-motion/static flip, runtime motion
preference changes, unsupported WebGL2 and actual GL context loss were checked.
Both PNGs and favicon load with HTTP 200 under `/Shehroz.my.id/`. Desktop/mobile
front/back screenshots were captured. Normal sessions have no console/uncaught
errors; deliberately disabling WebGL emits the existing WarpText diagnostic.

Limits: Vite's lazy Lanyard chunk advisory remains (~594KB/~152KB gzip).
Unmodified original PNGs total 4.22MB. Tests use Chromium software WebGL and touch
emulation; physical GPU performance, Safari/Firefox and live Pages deployment
are not established. No merge or production deployment is authorized.

## Earlier — final Hero corrections

- Continue on `feature/phase-05-premium-hero`; bring the already-merged Phase 05
  main commit into the feature branch without rewriting history or modifying main.
- Remove Lanyard, HeroBadge, the placeholder/flip/card CSS, strap asset and badge
  config; remove `three`/`@types/three`. Keep the right-hand Hero area empty.
- Display exactly **Shehroz Coder** on one line with responsive WarpText sizing
  and an accessible no-wrap fallback. Retain the original shaders and interactions.
- Apply the supplied Magnet engine to both CTAs while preserving unavailable
  destination messages and existing styling.
- Retain the supplied SocialSpotlight icons, beam/border/glows/focus and compact
  tiles with proportional rounded corners. Only genuine configured URLs render.
- Remove the local reaction label/count. PulseHeart source stays unchanged;
  use disabled/no-count presentation while shared likes are unavailable.
- The user explicitly deferred Firebase project creation and global-counter work.
  No persistence, initial total, database credentials or backend is fabricated.

Validation: `npm ci`, `npm run typecheck`, `npm run build` and whitespace checks
passed. Chromium at 320/375/390/768/1024/1366/1440/1920px confirmed one-line static
text, no clipping/overflow, absent card, unavailable CTA states, empty count,
keyboard/mobile navigation and reduced motion. Normal-motion tests verified the
single-row WarpText raster/shader, both Magnet movements and the configured
social link's beam/border/glow/hover/focus. Global-like concurrency/refresh tests
are deferred because Firebase is intentionally not configured. Physical devices,
Safari/Firefox and live deployment were not tested.

PR #6 is recorded as merged in main. New feature-branch commits cannot become
new changes in that merged PR. API access/read failures are reported separately.


## Earlier — Phase 05 Hero (original badge files pending)

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
