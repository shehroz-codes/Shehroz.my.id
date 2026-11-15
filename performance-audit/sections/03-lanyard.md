# Interactive 3D Lanyard

Type: Hero subcomponent. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Present the original two-sided developer badge with physical drag, swing and flip.

## B. Source architecture

[`src/components/Hero/HeroLanyard.tsx:8`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/components/Hero/HeroLanyard.tsx#L8); [`src/components/Lanyard/Lanyard.tsx:1141`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/components/Lanyard/Lanyard.tsx#L1141); `Lanyard.css`, `Hero.css`, `public/images/lanyard/card-front.png` / `card-back.png`.

## C. Technology

Three.js 0.187.0, WebGL2, procedural geometry/PMREM, canvas-generated textures, raycasting and handwritten quaternion/vector physics. No React Three Fiber, Rapier or GLB asset.

## D. Initialization

150 px root-margin observer enables lazy import. Effect creates context/renderer, environment, materials and textures, applies dimensions, then requests both PNGs. Both loads must succeed before artworkReady; a returned renderer.render call sets ready. The blank Suspense fallback does not show a temporary card.

## E. Loading

594,388 raw JS bytes; 2,394,468-byte front and 1,822,339-byte back. Both faces are necessary to preserve the existing experience. Image promises are cached only within the renderer instance.

## F. Rendering and updates

ready/side/failure use React state; mutable refs and vector buffers run simulation without React per frame. Effect rebuilds for changed front/back URLs, reduce/failure or desktop viewport mode. Settings apply uses keys to avoid rebuilding unchanged geometry.

## G. Animation

Four joints, two constraint iterations, maximum substep 1/960 s and 72 strap samples. Breeze 0.5 keeps motion alive while visible. Adaptive FPS/DPR, focus/page-visibility/offscreen pauses and cleanup already exist.

## H. Network

Card assets are same-origin; no card API or external model request. Downloads begin after initialization, competing with below-fold images. Warm cache avoids the payload but not renderer construction.

## I. Performance

Median constrained cold markers: desktop 38.64 s / mobile 38.15 s; warm: 8.96 / 3.25 s. Separate trace has a shared ~2.82 s graphics stall, not uniquely attributable to the card. Two face textures imply ~16.77 MB with mipmaps before other allocations; this is an estimate.

## J. Timing and readiness

See report 02 for the timestamped lifecycle. data-ready=true means render returned with artwork, not physical presentation or settled input. Pointer flip, mobile touch tap and drag initiation were exercised after loading.

## K. Problems

Late image discovery, multi-megabyte textures, competing startup work and a keyboard interaction gap. Desktop uses a larger draw surface and an additional text effect. Historical optimization attribution is unavailable.

## L. Potential fixes

Start both image requests earlier; defer unrelated below-fold work; evaluate pixel-preserving compression; profile PMREM and first draw on hardware; add keyboard flip equivalence. Keep dimensions/materials/physics/artwork unchanged in the initial optimization tier.

## M. Risks

Cross-origin mismatch can duplicate requests; color-space/premultiplication differences can alter art; shared resource caches can leak/dispose live textures; reducing DPR or physics steps changes the approved experience.

## N. Recommendation

Optimize Internally / Improve keyboard access / Investigate Further GPU phase attribution. Reject static replacement as the preferred performance fix. Full details: [Hero deep dive](../02-HERO-3D-LANYARD-DEEP-DIVE.md).

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
