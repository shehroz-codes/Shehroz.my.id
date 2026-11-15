# Phase 2 completion report — Hero and About

Date: 2026-11-15 UTC. Branch: `perf/portfolio-speed-optimization`. HEAD: `a30bf38d1a2377fb4c04c9ab47a45f34cd0635ad`.

## Outcome

Resumed the saved implementation without restarting research, rerunning baseline tests, or changing the approved design. The implementation and five selected assets were already complete; this phase confirmed the format choice, measured optimized production again, strengthened reduced-motion coverage and preserved all previous evidence.

The refreshed cold throttled results are **Hero 38.117 → 22.070 s (42.1% faster)** and **immediate About completion 19.121 → 13.400 s (29.9% faster)**. The original paired-session results remain valid historical observations: 41.9% and 30.4%, respectively. They are not overwritten or pooled with the new run.

**No universal speedup is claimed.** Refreshed desktop Hero is essentially unchanged; desktop immediate About is 0.524 s slower and warm mobile Hero is 0.174 s slower. No functional or visual regression has been established. Startup timing variability remains unresolved, and renderer/reveal changes were not made to chase lab numbers.

## Preservation and method

The earlier exploratory baseline and designated final baseline each contain 12 homepage samples: all **24 existing baseline samples** are preserved. This comparison uses only `baseline-final-measurements.json`; the exploratory data is excluded from improvement claims. The existing baseline immediate-About samples are reused from `about-immediate.json`.

This continuation added **12 optimized homepage navigations, four optimized immediate-About navigations, and 60 isolated image decode/pixel samples**. No baseline browser test or benchmark was rerun. Existing evidence, experimental images and the frozen original build are protected by `phase2-preservation-manifest.json`: **all 238 saved file hashes match at completion**.

Chromium 156.0.8078.79; Node 24.22.1; existing dependencies and browser reused. Production build served locally on port 4180. Desktop: 1440×900/DPR1. Mobile: 390×844/DPR2 with touch. Throttled mobile: CPU4×, 200,000 B/s download, 93,750 B/s upload, 150 ms latency. Two fresh contexts per profile, cold followed by warm navigation. Browser storage/cache isolated; OS/shader caches not reset. Timing and functional browser suites ran sequentially.

The baseline is from the previous session; the optimized refresh is from this session. These small samples do not establish statistical significance or remove host/GPU variance. Custom first-render readiness is not LCP; canvas rendering is not an LCP candidate. Lighthouse, field INP and real-device GPU behavior were not measured.

## Exact refreshed before/after results

Values below are medians of two samples, in seconds. About in the homepage table means final actions after scrolling from an already-ready Hero, including the original staggered reveal.

| Profile / cache | FCP before → after | Hero before → after | Hero reduction | About actions before → after |
|---|---:|---:|---:|---:|
| desktop / cold | 0.674 → 0.566 | 5.580 → 5.622 | -0.8% | 3.954 → 4.210 |
| desktop / warm | 0.732 → 0.392 | 5.118 → 5.197 | -1.6% | 3.917 → 4.169 |
| mobile / cold | 0.824 → 0.740 | 2.071 → 1.964 | 5.2% | 3.359 → 3.246 |
| mobile / warm | 0.566 → 0.532 | 1.619 → 1.793 | -10.7% | 3.326 → 3.232 |
| low-end / cold | 2.702 → 2.656 | 38.117 → 22.070 | 42.1% | 3.673 → 3.681 |
| low-end / warm | 1.406 → 1.312 | 4.258 → 3.421 | 19.7% | 3.661 → 3.641 |

Negative reduction means slower. FCP and sampled pre-scroll LCP are equal in these runs. The earlier optimized low-end FCP was 2.836 s versus 2.702 s baseline; this refresh is 2.656 s. That variability does not justify declaring the earlier paint regression fixed by a code change: application code did not change during this continuation.

Immediate-About scrolls as soon as the application is available, without waiting for Hero. Navigation-based completion includes startup; scroll-relative results have different scroll start times.

| Profile, cold | Complete from navigation before → after | Reduction | Portrait after scroll before → after | Complete after scroll before → after |
|---|---:|---:|---:|---:|
| desktop | 8.987 → 9.511 | -5.8% | 4.458 → 5.016 | 7.656 → 8.082 |
| low-end | 19.120 → 13.400 | 29.9% | 15.657 → 9.727 | 15.694 → 9.848 |

## Format selection and visual quality

Five selected image pairs again passed exact Chromium canvas RGBA and dimension comparison: zero differing channels. Original images and experimental WebPs are retained. WebP is selected for both badge textures and the Contact portrait; optimized PNG is selected for the transparent About and anime portraits.

Five fresh contexts per asset measured isolated Blob decoding with candidate order rotated. Base64 conversion and network transfer are excluded. Canvas timing includes drawing and readback, not GPU upload. These small timings are diagnostic, not a page-speed benchmark.

| Asset / candidate | Bytes | Median decode ms | Median draw + readback ms | RGBA channels differing from original |
|---|---:|---:|---:|---:|
| front / `card-front.png` | 2,394,468 | 31.7 | 26.8 | 0 |
| front / `card-front.webp` | 1,157,008 | 36.7 | 30.6 | 0 |
| back / `card-back.png` | 1,822,339 | 34.6 | 23.7 | 0 |
| back / `card-back.webp` | 831,776 | 29.7 | 36.1 | 0 |
| about / `profile.png` | 640,933 | 13.5 | 26.1 | 0 |
| about / `profile-optimized.png` | 475,557 | 15.9 | 12.5 | 0 |
| about / `profile.webp` | 295,210 | 18.2 | 20.4 | 15,569 |
| anime / `anime-portrait.png` | 1,008,321 | 18.9 | 12.8 | 0 |
| anime / `anime-portrait-optimized.png` | 789,399 | 18.8 | 12.2 | 0 |
| anime / `anime-portrait.webp` | 539,698 | 22.1 | 18.9 | 1,222,021 |
| contact / `profile.png` | 1,853,228 | 26.3 | 20.3 | 0 |
| contact / `profile.webp` | 918,914 | 32.7 | 26.5 | 0 |

The experimental transparent portrait WebPs fail exact browser appearance (About: 15,569 differing channels; anime: 1,222,021). Their smaller size cannot override the design lock. Selected optimized PNGs preserve the exact pixels. WebP does not decode universally faster: front badge decode increased about 5 ms in this isolated sample, while its transfer shrank by 1,237,460 bytes. The two badge textures together shrink from 4,216,807 to 1,988,784 bytes (52.8%). All five unique assets shrink by 3,546,635 bytes (45.9%); sharing the About/Interests URL also removes the original duplicate portrait transfer.

The saved production low-end cold waterfall supplies actual loading evidence (combined format and loading-order changes, not isolated causal attribution):

| Resource | Request start before → after | Transfer duration before → after | Body bytes before → after |
|---|---:|---:|---:|
| Front badge | 8.140 → 3.231 s | 29.063 → 17.739 s | 2,394,468 → 1,157,008 |
| Back badge | 8.141 → 3.234 s | 26.198 → 16.322 s | 1,822,339 → 831,776 |
| About portrait | 2.685 → 2.255 s | 16.526 → 11.062 s | 640,933 → 475,557 |

The refreshed About screenshots match the saved baseline exactly on mobile and throttled mobile (zero differing pixels). Desktop differs in 66 of 878,592 pixels (0.0075%), within the card effects; visual inspection found unchanged artwork, layout, text and spacing. The previous controlled-frame desktop/mobile WebGL comparisons remain zero-difference evidence because the application source/assets are unchanged and checksum-verified. They were not rerun.

## Implementation and files

Preserved application changes:

- `src/components/Hero/HeroLanyard.tsx`: preload selected badge images while the lazy renderer loads; existing reduced-motion fallback uses the same artwork.
- `src/components/Lanyard/Lanyard.tsx`: start image requests before renderer setup, await decoding, skip unused blank face painting. Physics, geometry, lighting, materials and controls unchanged.
- `src/sections/components/ProfileCard/ProfileCard.tsx`: asynchronous decode hint; lazy loading and tilt retained.
- `src/sections/config/profile.ts`, `src/sections/components/my-interests/interestsData.ts`: share the optimized portrait URL and preserve anime artwork with optimized PNG.
- `src/sections/components/contact/ContactProfile.tsx`: retain selected lossless portrait WebP.
- Five optimized image copies, existing performance harness/configuration and `.gitignore` remain as documented in `PERFORMANCE_OPTIMIZATION_REPORT.md`.

Only verification/reporting changes were added in this continuation:

- `scripts/performance-image-formats.mjs`: isolated browser decode and pixel evidence, including preserved rejected experiments.
- `scripts/performance-about.mjs`: optional `PERF_BUILDS=optimized` filter to avoid rerunning the baseline; default behavior unchanged.
- `tests/browser/performance.spec.ts`: extend reduced-motion checks to image decoding and About tilt/parallax while preserving existing tests.
- `PHASE2_PERFORMANCE_REPORT.md`, `PHASE2_CHECKPOINT.md`, and new `artifacts/performance/phase2-*` evidence.

Production CSS and bundle filenames/sizes match the previously saved optimized build. No dependency, lockfile, backend, secret, deployment or application-source change was added during this continuation.

## Validation

- Fresh build/typecheck: PASS.
- Fresh image verification: five exact selected pairs; 60 decode/pixel samples including experiments.
- Fresh performance: 12 homepage + four immediate-About samples; zero uncaught page errors, Hero timeouts or horizontal overflows. The inherited Spotify artwork proxy failure remains on desktop, as in the baseline.
- Fresh production interaction suite: **PASS, 8/8, zero failures, skips or flaky tests**. Includes desktop/mobile real card drag and flip, mobile touch, About navigation and ProfileCard interaction, section controls, reduced-motion badge decode, About visibility and zero tilt/parallax, plus Contact browser checks.
- Previously completed and preserved: 77 unit tests, eight existing preview/mocked-live browser tests, local disposable database suite, and controlled-frame lanyard visual checks. These unrelated completed suites were not repeated.

## Reproduce optimized-only checks

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4180
# In a separate terminal, sequentially:
node scripts/performance-image-formats.mjs artifacts/performance/phase2-image-formats.json
node scripts/verify-performance-assets.mjs artifacts/performance/phase2-browser-pixel-verification.json
node scripts/performance-audit.mjs phase2-optimized artifacts/performance http://127.0.0.1:4180/Shehroz.my.id/
PERF_BUILDS=optimized node scripts/performance-about.mjs artifacts/performance/phase2-about-immediate.json
CHROMIUM_PATH=/usr/bin/chromium PLAYWRIGHT_JSON_OUTPUT_FILE=artifacts/performance/phase2-production-browser-tests.json npx playwright test --config playwright.performance.config.ts --reporter=list,json
```

Use new destination names for subsequent runs to preserve these results. The format experiment script references preserved candidate copies under `/workspace/work/portfolio-performance/`.

## Git and remaining limits

All work remains uncommitted on `perf/portfolio-speed-optimization`; `work` remains at the original commit. No merge, push or deployment occurred. No original artwork or prior evidence was removed. No noticeable visual or functional change was introduced, so no design approval was needed.

The principal verified win is cold slow-network readiness. Desktop renderer startup, immediate-About delay and warm-mobile variability remain unresolved. The original reveal timeline and rendering quality remain intact. Hosted backend behavior, other browsers, field metrics and physical mobile GPU performance remain unverified. No further implementation change is justified by these measurements without a separate targeted investigation.
