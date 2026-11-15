# Performance evidence

These measurements exercise the production builds in real Chromium through Playwright. See `../../PERFORMANCE_OPTIMIZATION_REPORT.md` for interpretation and limitations.

## Reproduce

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4180
# In another terminal:
CHROMIUM_PATH=/usr/bin/chromium npx playwright test --config playwright.performance.config.ts
node scripts/verify-performance-assets.mjs artifacts/performance/browser-pixel-verification.json
node scripts/performance-audit.mjs optimized artifacts/performance http://127.0.0.1:4180/Shehroz.my.id/
# With the original build also served on 4181:
node scripts/performance-visual.mjs artifacts/performance
```

`CHROMIUM_PATH` is optional when the Playwright-managed Chromium is installed. The audit scripts also detect `/usr/bin/chromium`. No browser was downloaded or dependency installed for this work.

For a before/after comparison, preserve the original production `dist` **before** rebuilding. Serve that directory with `vite preview --outDir /path/to/original-dist --port 4181`; run the same audit against port 4181. `performance-about.mjs` alternates the original on 4181 and optimized build on 4180, scrolling to About immediately rather than first waiting for the Hero.

## Measurement definitions

- Desktop: 1440×900, DPR 1. Mobile: 390×844, DPR 2, mobile/touch emulation. Low-end: the same mobile viewport, CDP 4× CPU throttle, 200,000 bytes/s download (1.6 Mbps), 93,750 bytes/s upload (750 kbps), 150 ms latency.
- Two new browser contexts per profile, each with a cold navigation followed by a warm navigation. Browser contexts and page storage are isolated between repetitions. Warm responses may revalidate under Vite preview's cache headers.
- OS file caches and software-GPU shader caches are **not** reset. A browser-cold navigation is not a cold operating system or GPU. Earlier exploratory runs are excluded from the final comparison.
- FCP/LCP/observed layout shifts use browser PerformanceObserver entries. LCP is sampled before scrolling and may refer to Hero text; WebGL canvas pixels are not an LCP element.
- `heroReady`: custom navigation-to-first-Three.js-render timing, using the existing `data-ready` attribute. This is separate from browser paint metrics.
- `aboutMount`: custom navigation-to-About DOM insertion timing. About is eagerly mounted, not lazy-imported.
- About reveal is the existing `is-visible` class. Portrait readiness awaits the real image decoder. Complete readiness waits for the last actions' computed opacity to reach 1. These are custom timings relative to a native instant scroll; the preserved stagger is included.
- `blockingTime`: sum of long-task excess above 50 ms, after FCP and before `blockingWindowEnd`. The observation window depends on Hero readiness; this is **not Lighthouse TBT**. Raw task entries are retained for inspection and common-window calculations.
- `cls` is the sum of observed non-input layout shifts in the initial window. It is a lab observation, not field CLS. Exact field CLS/session-window behavior is not assessed.
- Heap is a point-in-time Chromium `performance.memory` snapshot, not a peak, leak diagnosis, or GPU-memory measurement.
- Transfer sizes use browser Resource Timing and include response overhead. Gzip build sizes and transfer sizes use different compression/reporting paths; do not equate them.

The production CSS file is identical before and after. Five image pairs are verified by Chromium canvas RGBA comparison. Normal screenshots contain live animation states, so unmatched Hero frames cannot serve as exact pixel regression assertions. A separate visual-only harness captures the real lanyard WebGL drawing buffer after 60 animation callbacks at the same 1,000 ms simulation clock. Both desktop and mobile matched buffers have zero differing pixels. That harness controls only test-browser clocks; it is never used for performance measurements or shipped application behavior. About CSS effects are paused at the same 5,000 ms frame for comparison. Large PNG screenshots are retained locally in this directory and ignored by Git; no browser trace ZIPs are committed.

## Artifacts

- `baseline-final-measurements.json`, `optimized-final-measurements.json`: authoritative comparable runs.
- `about-immediate.json`: alternating cold-cache immediate-About scenarios.
- `browser-pixel-verification.json`: exact pixel and dimension comparisons for all five optimized assets.
- `visual-differences.json`, `lanyard-matched-frames.json`, `lanyard-visual-differences.json`: screenshot and matched WebGL-frame comparisons.
- `baseline-bundles.json`, `optimized-bundles.json`, `dependency-versions.txt`: production bundle and installed dependency evidence.
- Browser test JSON and validation logs: actual checks executed, with preview or mocked live mode explicitly identified in the report.
