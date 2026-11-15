# Portfolio Performance Optimization Report

**Owner:** Muhammad Shehroz\
**Repository:** `shehroz-codes/Shehroz.my.id`\
**Date:** 14 November 2026 (Asia/Karachi)\
**Branch:** `perf/portfolio-speed-optimization`\
**Original commit:** `a30bf38d1a2377fb4c04c9ab47a45f34cd0635ad`

## A. Executive summary

Implemented and tested lossless asset and loading-order improvements while preserving the approved design, content, animations and interactions.

The strongest verified gains are on a cold, slow connection. With 4× CPU throttling, 1.6 Mbps download and 150 ms latency, median Hero lanyard readiness improved from **38.117 to 22.163 seconds (41.9%)**. In the separate immediate-About scenario, complete readiness from navigation improved from **19.121 to 13.315 seconds (30.4%)**, and portrait readiness after scrolling improved from **15.657 to 9.785 seconds (37.5%)**.

Desktop Hero readiness did **not** improve: its cold median increased from 5.580 to 5.968 seconds in this software-GPU lab. About's normal staggered reveal after an already-loaded Hero is essentially unchanged. These limits are included below; the results do not establish a universal speedup.

All five optimized images have exactly matching browser-decoded pixels and dimensions. Desktop and mobile lanyard WebGL buffers also match exactly at a controlled animation frame. The original artwork files remain available in the repository.

Validation passed: TypeScript, production build, 77 unit tests, 8 production Chromium tests, all 8 existing Chromium tests, and the disposable local database suite. No production deployment, hosted database change, merge, or commit was performed.

## B. Root causes and audit findings

| Area and affected file | Evidence and user impact | Resolution and visual risk |
|---|---|---|
| Hero artwork: `public/images/lanyard/card-front.png`, `card-back.png` | Two textures total 4,216,807 bytes. The throttled waterfall waits for both before the first real card render. Geometry is procedural; there is no GLTF/model download causing the delay. | Lossless WebP copies total 1,988,784 bytes, a 52.8% reduction. Low visual risk, verified with exact Chromium pixel and matched-render comparisons. |
| Hero initialization: `src/components/Hero/HeroLanyard.tsx`, `src/components/Lanyard/Lanyard.tsx` | The original image requests begin after the lazy Three.js chunk and synchronous renderer/environment setup. The first canvas paint could also require decode work. | Preload the two textures when the stage is near, start the existing image cache before WebGL setup, explicitly await asynchronous decoding, and omit never-presented blank face painting. Appearance, physics, shaders, materials, lighting, dimensions, DPR and interactions are preserved. Combined benefit is measured; individual changes were not separately benchmarked. |
| Duplicate About portrait: `src/sections/config/profile.ts`, `src/sections/components/my-interests/interestsData.ts` | `public/sections/about/profile.png` and `src/sections/assets/portraits/real-portrait.png` have the same SHA-256, but the baseline downloads both URLs. This adds 640,933 redundant bytes and competes with the About image. | Both sections use one optimized PNG URL. This removes the verified duplicate request and reduces the shared image to 475,557 bytes. Exact browser pixels match. |
| About reveal: `src/sections/components/AboutCard.tsx`, `AboutCard.css` | About is eagerly mounted. There is no About Suspense/import waterfall. IntersectionObserver waits for 15% visibility. The last action uses index 20: `20 × 90 ms + 250 ms + 700 ms = 2.75 s` of intentional reveal, in addition to observer scheduling, images and blocked main-thread time. | Preserve the approved timeline. Improve the underlying portrait transfer and decoding. A 5–10 second immediate-About wait is reproducible on desktop during startup, but is not explained by a single artificial loading timer. |
| Profile decoding: `src/sections/components/ProfileCard/ProfileCard.tsx` | The main portrait previously supplied no explicit asynchronous decode hint. Image availability is measured separately from DOM insertion and reveal. | Add `decoding="async"`; retain lazy loading and all card interactions. |
| Other large images: Interests anime artwork and Contact portrait | The originals are 1,008,321 and 1,853,228 bytes. | Pixel-identical optimized PNG and lossless WebP copies. Neither image is resized, recolored or replaced with different artwork. |
| WebGL/main thread | Real Chromium long-task observations and cold/warm reruns show substantial startup work. Software-GPU shader caching changes exploratory timings significantly. | Preserve renderer quality, existing motion, focus/visibility pauses and disposal. Earlier exploratory 11–13 s desktop Hero timings are excluded from the final comparison. |

### Whole-site audit scope

Reviewed the application entry, navigation and section mounting, Hero, lanyard, About/ProfileCard, Interests/halftone portrait/music, project tabs and dialogs, Contact/visitor interfaces, shared fonts/styles, asset sizes, installed dependencies, Vite output and GitHub Pages workflow.

The installed stack is React 19.3.1, TypeScript 7.0.2, Vite 8.3.8, Tailwind 4.3.5, Motion 14.12.0, Three.js 0.187.0 and OGL 1.0.11; Node is 24.22.1 and npm 11.9.0. The installed dependency tree deduplicates React. Three.js and rotating text already use separate lazy chunks. The active backend selector already lazy-loads live Supabase code; the legacy Firebase adapter is not imported by that selector. No dependency or lockfile changes were needed.

Existing listener cleanup, resting animation behavior, visibility/focus pausing, renderer disposal, lazy project/contact images, on-demand Spotify embeds, self-hosted variable fonts and font-display behavior were retained. There was no verified reason to add memoization throughout the application, delay About mounting, lower rendering quality or remove animation libraries.

Two experiments were reverted: font preloads worsened throttled first paint, and deferring the Interests WebGL setup moved initialization toward the About scroll. Transparent portrait WebP variants also failed the stricter Chromium pixel test despite an ImageMagick pixel match; optimized PNGs passed and are the delivered versions.

## C. Files modified and added

| File(s) | Purpose |
|---|---|
| `src/components/Hero/HeroLanyard.tsx` | Use the pixel-identical texture copies and preload them alongside the lazy renderer chunk. |
| `src/components/Lanyard/Lanyard.tsx` | Overlap image loading/decoding with renderer setup and skip unused blank face painting. |
| `src/sections/components/ProfileCard/ProfileCard.tsx` | Asynchronous portrait decode hint. |
| `src/sections/config/profile.ts` | Point About to the optimized shared portrait. |
| `src/sections/components/my-interests/interestsData.ts` | Share About's portrait URL and use the optimized original anime PNG. Content is preserved. |
| `src/sections/components/contact/ContactProfile.tsx` | Use the pixel-identical Contact portrait WebP. |
| `public/images/lanyard/card-front.webp`, `card-back.webp` | Lossless copies of the original card textures. |
| `public/sections/about/profile-optimized.png` | Lossless optimized shared portrait. |
| `src/sections/assets/portraits/anime-portrait-optimized.png` | Lossless optimized anime artwork. |
| `src/sections/components/contact/assets/profile.webp` | Lossless Contact portrait. |
| `scripts/performance-audit.mjs`, `performance-about.mjs` | Repeatable production Chromium measurements and immediate-About scenarios. |
| `scripts/verify-performance-assets.mjs`, `performance-visual.mjs` | Browser pixel verification and controlled-frame WebGL comparison. |
| `playwright.performance.config.ts`, `tests/browser/performance.spec.ts` | Production Hero, touch, About, navigation and section regressions. Reuses existing Contact tests. |
| `.gitignore` | Exclude generated performance PNGs, logs and trace ZIPs from Git. |
| `artifacts/performance/`, this report | Raw evidence, summaries, reproduction instructions and final findings. |

The production CSS is byte-identical: `index-D2gQNqDz.css`, 110,268 bytes before and after. Vite base configuration, deployment workflow, Supabase code/policies/migrations, authentication configuration, environment secrets and backend adapters are unchanged.

### Asset sizes

All byte counts below are source file sizes; every optimized image passed exact Chromium RGBA/dimension comparison.

| Original asset | Before bytes | After bytes | Reduction |
|---|---:|---:|---:|
| `public/images/lanyard/card-front.png` | 2,394,468 | 1,157,008 | 51.7% |
| `public/images/lanyard/card-back.png` | 1,822,339 | 831,776 | 54.4% |
| `public/sections/about/profile.png` | 640,933 | 475,557 | 25.8% |
| `src/sections/assets/portraits/anime-portrait.png` | 1,008,321 | 789,399 | 21.7% |
| `src/sections/components/contact/assets/profile.png` | 1,853,228 | 918,914 | 50.4% |

Combined unique asset files decreased from **7,719,289 to 4,172,654 bytes**, saving **3,546,635 bytes (45.9%)**. Sharing the About/Interests portrait removes an additional duplicate transfer observed in the original waterfall. Retaining original source artwork increases files stored on disk; unused originals are not requested by the optimized components.

## D. Before/after measurements

### Conditions and definitions

Final timing evidence comprises 24 homepage navigations and 8 separate immediate-About navigations in real headless **Chromium 156.0.8078.79**, driven by Playwright 1.65.0 on Linux with software WebGL. Desktop is 1440×900 at DPR 1. Mobile is 390×844 at DPR 2 with mobile/touch emulation. Low-end adds 4× CPU throttle, 200,000 bytes/s down, 93,750 bytes/s up and 150 ms latency through CDP.

Each profile has two independent cold browser contexts, each followed by a warm navigation. Browser caches/storage are isolated between repetitions; OS and GPU shader caches are not reset. Vite production preview serves the frozen original build on port 4181 and optimized build on 4180. Warm requests may revalidate. Tests are local preview-mode builds, not measurements of the deployed live Supabase configuration. Timing runs were separate from functional/visual runs.

Values are medians of two repetitions. FCP/LCP are browser paint entries, not custom readiness metrics. WebGL canvas pixels do not become an LCP element. Hero readiness uses the existing first-render `data-ready` state. About timings distinguish DOM mounting, reveal, image decode and final actions. The raw JSON records all samples, resources, long tasks, errors and transfer sizes.

### Primary slow-network comparison

| Metric — low-end cold unless stated | Before | After | Result |
|---|---:|---:|---|
| Lighthouse Performance | NOT MEASURED | NOT MEASURED | No Lighthouse score claimed. |
| FCP | 2.702 s | 2.836 s | +0.134 s; no improvement. |
| LCP, before scrolling | 2.702 s | 2.836 s | +0.134 s; Hero text, not card readiness. |
| Observed lab layout-shift total | 0.004541 | 0.003625 | Both below 0.1 in the sampled initial window. |
| Lighthouse TBT | NOT MEASURED | NOT MEASURED | Long-task observations are provided separately. |
| Initial JS transfer, including lazy Hero chunks | 369,119 bytes | 369,284 bytes | +165 bytes, approximately 0.045%; no bundle-reduction claim. |
| Initial CSS transfer | 25,850 bytes | 25,850 bytes | Unchanged. |
| Hero first-render readiness | 38.117 s | 22.163 s | **41.9% faster.** |
| About immediate scenario: complete from navigation | 19.120 s | 13.315 s | **30.4% faster.** |
| About immediate scenario: portrait after scroll | 15.657 s | 9.785 s | **37.5% faster.** |
| About final actions after an already-ready Hero | 3.673 s | 3.593 s | Essentially unchanged; approved reveal preserved. |
| Field INP | NOT MEASURED | NOT MEASURED | No field dataset; lab input tests are not INP. |

### All homepage profiles

The About column below is readiness **after scrolling from an already-ready Hero**, including the intentional stagger. It is a different scenario from immediate-About navigation.

| Profile / cache | FCP before → after | Hero before → after | About actions after scroll before → after |
|---|---|---|---|
| desktop / cold | 0.674 s → 0.638 s | 5.580 s → 5.968 s | 3.954 s → 4.107 s |
| desktop / warm | 0.732 s → 0.556 s | 5.118 s → 5.550 s | 3.917 s → 3.985 s |
| mobile / cold | 0.824 s → 0.758 s | 2.071 s → 1.931 s | 3.359 s → 3.447 s |
| mobile / warm | 0.566 s → 0.524 s | 1.619 s → 1.566 s | 3.326 s → 3.385 s |
| low-end / cold | 2.702 s → 2.836 s | 38.117 s → 22.163 s | 3.673 s → 3.593 s |
| low-end / warm | 1.406 s → 1.486 s | 4.258 s → 4.019 s | 3.661 s → 3.703 s |

Desktop Hero cold and warm medians are about 0.39 and 0.43 seconds slower. The small sample, software renderer and shader-cache sensitivity limit conclusions, but these results must not be described as a desktop speedup. The final mobile cold Hero median improves by about 6.7%. Most warm-cache and already-loaded-About differences are small.

### Immediate-About scenario

This scenario scrolls immediately after the app becomes available, without first waiting for the Hero. Builds alternate within each repetition. The scroll start varies with page initialization, so navigation-based completion and scroll-relative readiness are both reported.

| Profile, cold | Complete from navigation, before → after | Portrait after scroll, before → after | Complete after scroll, before → after |
|---|---|---|---|
| desktop | 8.987 s → 8.906 s | 4.458 s → 2.748 s | 7.656 s → 5.939 s |
| low-end | 19.120 s → 13.315 s | 15.657 s → 9.785 s | 15.694 s → 9.819 s |

Desktop complete-from-navigation changes by less than 1%, despite a lower scroll-relative median. No meaningful desktop About speedup is established. Slow-network About readiness improves because fewer portrait bytes compete on the connection.

### Blocking time, memory and build output

The harness records real main-thread long tasks. Its `blockingTime` field sums task excess over 50 ms between FCP and a Hero-dependent observation endpoint; that changing window is **not Lighthouse TBT** and is not used as a directly comparable improvement claim. The observed layout-shift sum is a lab total, not field CLS or a full session-window analysis.

Point-in-time low-end cold JS heap snapshots are 12.08 MB before and 11.25 MB after. They are not peak memory, a leak test, or GPU-memory measurements. GPU memory is NOT MEASURED.

The entry JS file is 500,731 → 500,904 uncompressed bytes. CSS is unchanged. The existing >500 kB Vite warning remains; it was not hidden by changing warning thresholds. Separate Three.js and Motion chunks are retained. No dependencies were installed, removed, upgraded or duplicated for this task.

## E. Real Chromium testing

**Real Chromium launched successfully. No Chromium reinstall was needed.** All final test runs have zero failed, skipped or flaky tests.

| Validation | Actual result |
|---|---|
| `npm run build` | PASS, including `npm run typecheck` and production Vite build. |
| `npm test` | PASS: 10 files, 77 tests. |
| Original production browser checks | PASS: 8 latest tests across separate Contact, Hero and About runs. New harness issues involving moving targets and strict selectors were corrected and affected checks re-run. |
| Original mobile touch check | PASS against the frozen original production build. |
| `CHROMIUM_PATH=/usr/bin/chromium npx playwright test --config playwright.performance.config.ts` | PASS: all 8 production browser tests. |
| `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser -- --workers=1` | PASS: all 8 existing preview/mocked-live tests, including 320/390/768/1440 px Contact accessibility checks. |
| `npm run test:database` | PASS: existing migrations/assertions in disposable local PostgreSQL/Docker, including private inbox RLS, service-only writes, cooldown concurrency and cleanup queue. No hosted connection. |
| Browser asset verification | PASS: five image pairs, identical dimensions, zero differing RGBA channels. |
| Controlled lanyard visual comparison | PASS: desktop and mobile, zero differing pixels and RMSE 0. |
| `git diff --check` | PASS. |

The production suite checks real raycast hit testing, mouse drag/flip, mobile touch drag/tap-to-flip, reduced-motion behavior, About visibility and image decoding, ProfileCard tilt/contact navigation, mobile menu/About anchor, Interests portrait initialization and keyboard interaction, playlist categories, project tabs/dialogs, form validation, local preview persistence and photo decode/encode behavior. External Contact navigation is intercepted locally at the expected GitHub destination; no message is sent to another person or live backend.

## F. Visual verification

Before/after production screenshots were captured at the same desktop and mobile viewports. About CSS effects were paused at the same 5,000 ms frame. Mobile and low-end About images are exactly identical: **0 differing pixels**. Desktop differs in **68 of 878,592 pixels (0.0077%)**, localized to the animated/grain card layer; inspection found no layout, typography, text, artwork or spacing regression.

A separate visual-only harness captures the actual lanyard WebGL drawing buffer after 60 callbacks at a fixed 1,000 ms simulation clock. Desktop buffers are 1440×900 and mobile buffers are 537×732, matching each original renderer's DPR/framing. Both comparisons have **0 differing pixels / RMSE 0**. These test clocks are not shipped in application code and are never used for performance timings.

Normal Hero screenshots have different live swing, rotating-text and warp-text states. They were inspected visually, and the controlled WebGL comparison supplies matching-frame evidence. All original texture/portrait dimensions and browser-decoded pixels also match independently.

No visible fallback artwork, loading UI, skeletons, image replacements, animation removal or design changes were introduced. The pre-existing reduced-motion static badge is preserved and tested.

## G. Functional and integration status

| Feature | Status |
|---|---|
| Homepage, desktop and mobile Hero, 3D startup | PASS. |
| Mouse drag/flip and emulated-mobile real touch drag/tap flip | PASS. |
| About reveal, portrait, tilt and Contact destination | PASS. |
| Mobile menu/About navigation, project tabs/dialog, Interests controls | PASS. |
| Contact validation, preview submission/persistence, browser photo encoding | PASS. |
| Mocked Supabase reads, disabled writes, error recovery, Contact accessibility | PASS. |
| New uncaught JS errors / unexpected initial request failures | None found in final production measurements/tests. |
| Real hosted Supabase reads, auth, Turnstile and delivery | UNVERIFIED; local/mocked testing only. No production credentials or submissions used. |
| Spotify service playback and external social-site availability | UNVERIFIED. Existing Spotify artwork requests fail through the environment proxy on desktop, before and after, with `ERR_TUNNEL_CONNECTION_FAILED`; existing image error handling remains. |
| Real-device smoothness, field INP and non-Chromium browsers | UNVERIFIED. Lab scrolling/interaction and overflow checks passed; no field FPS/INP claim. |

Git diff verification confirms Supabase migrations, functions, backend services, secrets and production deployment configuration are unchanged. The existing development-server warning about a public portrait-backdrop URL is inherited; production assets load through the unchanged hashed Vite output.

## H. Remaining limitations and targets

- **Cold, slow-network loading is measurably faster; desktop GPU startup and the approved About timeline remain limiting factors.** Desktop immediate About still takes roughly 8–10 seconds in this software-GPU startup scenario.
- LCP meets 2.5 seconds in the final unthrottled desktop/mobile lab profiles, but low-end cold LCP is 2.836 seconds. It does not measure visibility of the WebGL badge. Low-end FCP/LCP are 134 ms slower than the baseline median; this regression is explicitly reported.
- Observed layout shifts are below 0.1, but field CLS and field INP are unavailable. Lighthouse Performance 90+ and Lighthouse TBT are **NOT MEASURED**; Lighthouse is not installed and no score is inferred from the custom harness.
- Large original-resolution artwork and Three.js initialization still impose transfer/decode/GPU costs. Reducing resolution, altering art, changing shaders, shortening reveals or lowering renderer quality would require a separate design decision and was not done.
- Two repetitions per profile reveal direction and variability, not statistical confidence or a field-device distribution. Browser-cold caches do not reset OS or shader caches. Early exploratory measurements are excluded from final claims.
- Additional shader/environment precomputation or asynchronous compilation could be investigated separately with the same exact-render comparisons. No unverified renderer rewrite is included.
- GitHub Pages base `/Shehroz.my.id/` and hashed asset paths are preserved and tested locally. Deployed CDN/cache behavior and the live-mode production backend were not measured or changed.

## I. Final Git status

Created `perf/portfolio-speed-optimization` from the initially clean `work` branch at the original commit above. `work` remains at that commit. There was no local `main` branch to modify. No checkout reset, merge, push, deployment or commit was performed. The optimized changes and report remain uncommitted for review.

Changed/added paths at completion:

```text
M .gitignore
 M src/components/Hero/HeroLanyard.tsx
 M src/components/Lanyard/Lanyard.tsx
 M src/sections/components/ProfileCard/ProfileCard.tsx
 M src/sections/components/contact/ContactProfile.tsx
 M src/sections/components/my-interests/interestsData.ts
 M src/sections/config/profile.ts
?? PERFORMANCE_OPTIMIZATION_REPORT.md
?? artifacts/
?? playwright.performance.config.ts
?? public/images/lanyard/card-back.webp
?? public/images/lanyard/card-front.webp
?? public/sections/about/profile-optimized.png
?? scripts/performance-about.mjs
?? scripts/performance-audit.mjs
?? scripts/performance-visual.mjs
?? scripts/verify-performance-assets.mjs
?? src/sections/assets/portraits/anime-portrait-optimized.png
?? src/sections/components/contact/assets/profile.webp
?? tests/browser/performance.spec.ts
```

Generated performance PNGs and logs are ignored by Git but retained locally under `artifacts/performance/`. No large browser traces were created or committed.

## J. Final outcome

**Verified improvement:** cold slow-network Hero readiness is 41.9% faster, and immediate-About completion from navigation is 30.4% faster, with exactly preserved asset pixels and matched desktop/mobile lanyard rendering. Functional, type/build, unit, browser and local database checks pass.

**Unresolved/unverified:** desktop Hero readiness did not improve; the desktop About startup delay and intentional reveal remain. The low-end paint regression, Lighthouse/field metrics, live backend, real-device smoothness and non-Chromium behavior are explicitly documented rather than reported as complete success.

Raw measurements, test summaries, matching-frame results and reproduction commands are in [`artifacts/performance/README.md`](artifacts/performance/README.md).
