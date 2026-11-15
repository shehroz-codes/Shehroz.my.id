# Chromium performance and functional results

**Chromium actually launched.** The preserved evidence contains 16 completed primary production-bundle navigations, four direct-About navigations, one separately instrumented startup trace/CPU profile, desktop/mobile functional traces, a reduced-motion check and eight passing available repository browser tests. These were collected on 14 November 2026 before interruption. On 15 November only two targeted interaction checks per viewport were added to resolve harness-selector ambiguity; no performance benchmark was repeated.

## Environment and reproducibility

| Item | Verified configuration |
|---|---|
| Source | `6839347096468ec0ff98a5c01e5a1df0f03e1cfd`, branch `work`, no application changes |
| Runtime | Node 24.22.1; Playwright 1.65.0; Chromium 156.0.8078.79 at `/usr/bin/chromium` |
| Host | Debian 13 Linux, three reported logical CPUs, AMD EPYC 9V74/KVM |
| Rendering | Headless Chromium, ANGLE SwiftShader software Vulkan; no physical GPU |
| Desktop | 1440×900 CSS pixels, DPR 1, fine pointer |
| Mobile emulation | 390×844 CSS pixels, DPR 2, touch/mobile enabled; not a physical phone |
| Fast profile | No CDP CPU/network throttle; local HTTP |
| Constrained profile | CDP CPU 4×; 150 ms latency; 200,000 B/s download; 93,750 B/s upload; connectionType cellular3g |
| Launch flags | `--no-sandbox --enable-unsafe-swiftshader` in the isolated diagnostic environment |
| Serving | Local built assets at `http://127.0.0.1:4180/Shehroz.my.id/`; gzip, static max-age=600, HTML no-cache |
| Backend | Default preview build; no live credentials/env modifications |
| Repetition | Four profiles × two independent context replicates × cold and warm = 16 |

The name cellular3g is a CDP connection label; the exact custom throughput above is authoritative. CPU throttling does not emulate a particular phone or throttle every GPU/compositor operation. Host scheduling and software graphics introduce noise. Two repetitions are descriptive evidence, not a confidence interval or p75 field estimate.

`diagnostics/measure.cjs` creates a new browser/context for each replicate, clears browser cache for cold, and navigates again within that context for warm. It observes paint/LCP/layout-shift/longtask entries and DOM mutations before navigation. It waits for the card ready marker, nominally another 700 ms, then saves the initial snapshot. Blocking can delay that wait substantially. For cold replicate 1 it then takes a screenshot before scrolling instantly to About. About completes when its action-row animation event has fired and ProfileCard images have natural dimensions. Screenshots are outside the initial timing window, but their time precedes the About scroll; do not interpret that combined sequence as a natural navigation-to-About metric.

The preserved `measure.cjs` has a corrected footer selector from a later inspection; the 16 stored results contain **no footerDOM mark**. This small harness revision was not followed by a benchmark rerun. Footer rendering is supported by functional screenshots, not a fabricated timestamp. Scripts use absolute paths for this workspace; relocate the path constants when reproducing in another environment. Avoid reusing these exact scripts blindly on production because preview/mock assumptions matter.

## Metric definitions and boundaries

- **FCP:** first-contentful-paint entry from navigation. **LCP:** latest buffered Largest Contentful Paint candidate at the initial snapshot. It happened to equal FCP in all 16 runs. The card canvas is not represented by that text-oriented LCP candidate. Browser interaction can finalize LCP; the snapshot is not field telemetry.
- **CLS:** maximum session-window sum of layout shifts without recent input (1 s gap, maximum 5 s window) up to the initial snapshot. It does not cover every later tab, modal, image, or scrolling state. Low initial values do not certify the whole application.
- **Card:** first audit observation of `.lanyard[data-ready="true"]`, set after loaded faces and a successful render call. This is a first-frame **proxy**, not GPU display completion, settled physics, TTI, or guaranteed immediate input responsiveness. A long task can follow the marker.
- **About after scroll:** snapshot time minus the explicit instant-scroll time, after actions animationend and loaded portrait images. Polling/scheduling contributes overhead. It includes the intentional ~2.75 s reveal stagger.
- **Custom blocking:** sum of `max(duration − 50 ms, 0)` for observed long tasks starting at/after FCP through the initial snapshot. This is **not standard Lighthouse Total Blocking Time**: no TTI detection and variable end windows. Its name is kept explicit throughout; never compare it to Lighthouse scoring thresholds.
- **DCL/load:** Navigation Timing event-end timestamps from navigation. They can precede React-visible UI because lazy resource requests/effects start later. **Script ms:** CDP cumulative ScriptDuration at the initial snapshot; not total page wall time or all native graphics work.
- **Heap:** Chromium `performance.memory.usedJSHeapSize` at the snapshot, approximate JavaScript heap only. It excludes much native/image/GPU memory; no leak conclusion follows from warm values. No field INP, physical power use, isolated section VRAM or exact shader/decode durations were obtained.

## Primary medians

All seconds except custom blocking (ms); two observations each.

| Profile | Cache | n | FCP / LCP s | Card marker s | About after scroll s | Custom blocking ms |
| --- | --- | --- | --- | --- | --- | --- |
| desktop-fast | cold | 2 | 0.684 | 5.812 | 4.205 | 5187.5 |
| desktop-fast | warm | 2 | 0.578 | 5.185 | 3.887 | 4871.0 |
| mobile-fast | cold | 2 | 0.784 | 1.872 | 3.370 | 4279.5 |
| mobile-fast | warm | 2 | 0.496 | 1.542 | 3.172 | 4102.5 |
| desktop-constrained | cold | 2 | 2.284 | 38.637 | 5.002 | 8378.0 |
| desktop-constrained | warm | 2 | 1.566 | 8.960 | 4.727 | 7448.0 |
| mobile-constrained | cold | 2 | 2.856 | 38.147 | 3.558 | 3817.0 |
| mobile-constrained | warm | 2 | 1.094 | 3.246 | 3.687 | 5752.0 |

Constrained cold medians are ~38.64 s desktop and ~38.15 s mobile. Warm desktop remains ~8.96 s while warm mobile is ~3.25 s. Cached delivery eliminates much download time but not initialization/native graphics. Fast mobile marks ready at ~1.87 s; a representative run then contains a 2.742 s long task, so the early marker must not be sold as complete interactivity. Source and probe evidence support multiple causes, not a single alleged React-rendering bottleneck.

## Every primary observation

`Snapshot s` is the end of the initial metric window. DCL/load/script/blocking columns use milliseconds; heap MB is decimal. Full precision, long-task entries and resource timings remain in each JSON and [all-measurements.json](evidence/all-measurements.json).

| Run ID | FCP s | LCP s | CLS | DCL ms | Load ms | Card s | About delta s | Custom blocking ms | Snapshot s | Script ms | Heap MB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| desktop-fast-cold-1 | 0.712 | 0.712 | 0.000070 | 222.5 | 222.7 | 5.728 | 3.992 | 4788 | 6.901 | 897.0 | 12.5 |
| desktop-fast-warm-1 | 0.844 | 0.844 | 0.000071 | 96.5 | 97.7 | 5.283 | 4.086 | 4978 | 6.771 | 596.9 | 22.5 |
| desktop-fast-cold-2 | 0.656 | 0.656 | 0.000068 | 176.0 | 176.2 | 5.896 | 4.418 | 5587 | 7.260 | 951.2 | 14.7 |
| desktop-fast-warm-2 | 0.312 | 0.312 | 0.000069 | 76.0 | 77.4 | 5.087 | 3.688 | 4764 | 6.135 | 681.7 | 16.0 |
| mobile-fast-cold-1 | 0.780 | 0.780 | 0.000000 | 156.2 | 156.4 | 1.894 | 3.413 | 4127 | 5.809 | 773.1 | 13.8 |
| mobile-fast-warm-1 | 0.516 | 0.516 | 0.000000 | 34.5 | 35.8 | 1.568 | 3.269 | 4128 | 5.500 | 607.1 | 24.7 |
| mobile-fast-cold-2 | 0.788 | 0.788 | 0.000000 | 130.6 | 130.7 | 1.850 | 3.328 | 4432 | 6.219 | 711.4 | 13.8 |
| mobile-fast-warm-2 | 0.476 | 0.476 | 0.000000 | 67.7 | 68.7 | 1.516 | 3.075 | 4077 | 5.410 | 616.1 | 21.1 |
| desktop-constrained-cold-1 | 2.276 | 2.276 | 0.000690 | 1522.5 | 1524.0 | 38.599 | 5.224 | 7931 | 40.248 | 3671.0 | 11.7 |
| desktop-constrained-warm-1 | 1.980 | 1.980 | 0.000072 | 692.1 | 717.1 | 9.897 | 5.152 | 7871 | 11.678 | 1908.6 | 19.2 |
| desktop-constrained-cold-2 | 2.292 | 2.292 | 0.000690 | 1583.0 | 1584.2 | 38.674 | 4.780 | 8825 | 40.778 | 3705.5 | 12.0 |
| desktop-constrained-warm-2 | 1.152 | 1.152 | 0.000033 | 735.1 | 735.2 | 8.023 | 4.302 | 7025 | 9.729 | 1515.1 | 22.4 |
| mobile-constrained-cold-1 | 2.824 | 2.824 | 0.002596 | 1567.1 | 1568.2 | 38.105 | 3.320 | 3493 | 39.975 | 2894.8 | 11.5 |
| mobile-constrained-warm-1 | 1.052 | 1.052 | 0.000000 | 293.3 | 293.4 | 3.258 | 3.664 | 6218 | 8.606 | 1532.2 | 19.9 |
| mobile-constrained-cold-2 | 2.888 | 2.888 | 0.002596 | 1598.0 | 1599.1 | 38.188 | 3.796 | 4141 | 40.195 | 3227.2 | 11.2 |
| mobile-constrained-warm-2 | 1.136 | 1.136 | 0.000000 | 331.2 | 332.9 | 3.235 | 3.709 | 5286 | 7.719 | 1454.1 | 18.1 |

All 16 runs recorded zero page JavaScript exceptions. The eight desktop initial captures each recorded one Spotify CDN tunnel failure; the eight mobile initial captures did not request/fail that resource within their snapshot. Local HTTP responses were not failing in these primary runs. This differs from the development-server font limitation below.

## Direct About entry: distinct experiment

Fresh cold contexts, same constrained desktop/mobile settings, navigation directly to `#about` with an explicit instant scroll to that fragment once attached. The four preserved results in [direct-about.json](evidence/direct-about.json) did not wait for the Hero experiment. Navigation-relative seconds:

| Viewport | Replicate | About DOM | Reveal trigger | Actions animation end | Observed images + actions ready |
| --- | --- | --- | --- | --- | --- |
| desktop | 1 | 2.091 | 4.101 | 7.116 | 18.615 |
| desktop | 2 | 1.981 | 3.949 | 6.918 | 17.548 |
| mobile | 1 | 2.339 | 3.893 | 6.876 | 17.909 |
| mobile | 2 | 2.259 | 3.997 | 6.995 | 17.757 |

The observed completion spans 17.55–18.61 s; actions finish around 6.88–7.12 s. This separates the large image/network wait from the designed reveal. It does not validate the user's historical 19.1→13.3 s comparison, whose source revision/script is absent. The post-Hero About experiment instead starts after its image has loaded and yields ~3.08–5.22 s. These clocks answer different questions and must not be merged into one score.

## Section presence versus usable content

Representative constrained desktop cold run 1:

| Observed mark | Navigation seconds | Interpretation |
| --- | --- | --- |
| reactDOM | 2.085 | DOM observation; not interactive readiness |
| aboutDOM | 2.085 | DOM observation; not interactive readiness |
| interestsDOM | 2.085 | DOM observation; not interactive readiness |
| projectsDOM | 2.085 | DOM observation; not interactive readiness |
| contactDOM | 2.085 | DOM observation; not interactive readiness |
| lanyardDOM | 8.177 | DOM observation; not interactive readiness |
| lanyardCanvas | 8.934 | DOM observation; not interactive readiness |
| lanyardReady | 38.599 | First successful render-return marker |

The eager shell commits About/Interests/showcase/Contact with Hero, around 2.085 s here. Compact skills are part of About; Music is part of Interests; Visitor Wall is part of Contact. Certificates/Experience/Toolkit render on selected tabs. Their visual completion and interaction were inspected, but there are no isolated, precise per-tab first-interactive benchmarks. Functional-script elapsed durations include scrolling/screenshots/automation waits, so they are not published as user latency metrics. Footer is verified by screenshot only. See the [15 section reports](04-ALL-SECTIONS-ANALYSIS.md) for individual resource and lifecycle definitions.

## Graphics and CPU trace

The separate desktop startup probe wraps WebGL entry points and records Chromium tracing plus V8 profiling: [gl-startup.json](evidence/gl-startup.json), [trace-summary.json](evidence/trace-summary.json), [startup.cpuprofile](evidence/startup.cpuprofile), [compressed Chromium trace](evidence/startup-trace.json.gz). Instrumentation overhead means its timing is not a replacement for the primary run set.

Its card marker was ~6.20 s. The longest relevant graphics task is ~2,818.6 ms, overlapping compositor Commit ~2,820.0 ms. Do not add nested/overlapping trace durations. Context acquisition was only ~12 / 4.3 / 64.3 / 7 ms for Glow/Halftone/Warp/Lanyard. A Halftone texImage2D wrapper call took ~80.3 ms; these synchronous calls do not expose all deferred shader/native/GPU work. The CPU profile is dominated by `(program)` ~6,633.8 ms, with a sampled `Three.setSize` contribution ~224.5 ms. This supports native/shared graphics pressure but does not identify a single proven shader or component as responsible for the full stall. A graphics trace used-bytes field reached ~57.9 MB; it is not card-only VRAM.

Exact decode, GPU presentation, shader compile completion, per-effect GPU time and physical-device impact require a future targeted real-GPU investigation. Current evidence is sufficient to prioritize earlier artwork discovery and reduce unrelated initial work without guessing at shader rewrite benefits.

## Functional, accessibility and regression evidence

| Evidence set | Result and interpretation |
|---|---|
| `functional-desktop.json` / `functional-mobile.json` | 20 attempted checks each: 18 reported pass, two initial harness failures. Axe scan execution pass means the scan ran, not zero violations |
| Initial failed About hover | Playwright waited for stability on a continuously floating card; not a proven UI defect |
| Initial failed project Details | Locator used visible label instead of actual accessible name; not a proven modal defect |
| `followup.json` | Both viewports: pointer tilt changes, project preview/modal focus/Escape, certificate and experience previews pass. Its Interests selector `.hp` was ambiguous because Contact honeypots share that class |
| `resume-targeted-checks.json` (15 November) | Both viewports: `.mi-portrait` accepts Enter/Space; screenshots show real portrait after Enter and anime halftone after Space. Correct `View details for Developer Portfolio` button opens dialog, focus is inside, Escape returns focus. Zero page errors |
| Original interaction coverage | Card flip and drag; all seven observed page regions; tabs and arrow-key tab navigation; genre/favorites and on-demand iframe; navbar and Back to top pass in both layouts |
| `reduced-motion.json` | No Lanyard canvas, static front image present, no Lanyard/RotatingText chunk in resource list, no horizontal overflow. This is existing behavior, not a newly implemented replacement |
| Full-page axe 4.14 | One serious `aria-prohibited-attr` violation at `.hero-roles` per viewport. Incomplete checks include contrast (130 desktop / 118 mobile nodes) and one ARIA node; manual review required |
| Manual/source accessibility review | Card has no keyboard flip control; no skip link; disabled social links remain in tab order; portrait toggle uses image role/hover-only instruction despite keyboard support. Native dialog focus/Escape and tab behavior are strengths |
| Layout | Recorded scrollWidth equals viewport width at 1440 and 390. Settled mobile Hero shows complete card followed by copy, with CTAs below the 844 CSS-pixel viewport. Transient initial swing cropping is not evidence of persistent horizontal page overflow |

The targeted keyboard harness records focus and attributes; visual toggle confirmation comes from retained Enter/Space screenshots plus handler source inspection, not a nonexistent aria-pressed state. Mobile keyboard emulation establishes key handling, not physical mobile assistive-technology compatibility. Earlier failures are preserved, not erased.

## Existing automated checks reused

Production build succeeded (869 ms reported build execution); TypeScript no-emit check passed; Vitest **77 tests in ten files** passed; existing Playwright **eight tests** passed in ~1.7 minutes. Logs: [build](evidence/build.log), [typecheck](evidence/typecheck.log), [unit](evidence/unit-tests.log), [browser](evidence/existing-tests.log), [browser JSON](evidence/existing-tests.json).

Builds ran in an isolated copy; installed dependencies were reused through a symlink. Browser scenarios use development Vite servers and preview/mocked live APIs at multiple widths. Their fonts were blocked with 403 by Vite's serving allowlist because the symlink points outside the copy. The eight tests still passed, but **they do not establish exact typography or visual parity**. Production benchmark font requests succeeded. No reinstallation or application-config change was made. The historical user claim of 16 passing browser tests is not the same suite as the eight tests available here.

No before/after pixel equality experiment was performed because no optimization diff is available and source changes are forbidden. Existing screenshots document this baseline only. Continuous physics must be synchronized or deterministically captured before meaningful future image comparison.

## Artifact map and remaining limits

- Primary rows and page-level resource timings: `evidence/{desktop,mobile}-{fast,constrained}-{cold,warm}-{1,2}.json`; aggregate above.
- Four cold replicate-1 Hero and About screenshot pairs, plus `ui-desktop-*` and `ui-mobile-*` for all sections, modals/tabs and card interactions. [Settled desktop](evidence/ui-desktop-hero-settled.png), [settled mobile](evidence/ui-mobile-hero-settled.png), [About desktop](evidence/ui-desktop-about.png), [Contact mobile](evidence/ui-mobile-contact.png).
- [Desktop Playwright trace](evidence/functional-desktop.zip), [mobile trace](evidence/functional-mobile.zip); load these as Playwright traces. Decompress the startup JSON gzip for Chromium/Perfetto-compatible viewing; CPU profile can be imported into DevTools.
- New focused evidence: [desktop Enter](evidence/resume-desktop-portrait-enter.png), [desktop Space](evidence/resume-desktop-portrait-space.png), corresponding mobile captures and `resume-targeted-checks.log`.

Live custom domain/GitHub Pages delivery, hosted Supabase and third-party playback remain inaccessible. No field CrUX data, Lighthouse TBT/score, INP, physical-phone/GPU, Safari/Firefox, full screen-reader session, complete manual contrast assessment or historical optimization comparison is claimed. These limits are material but do not invalidate the measured local loading sequence. [Roadmap](07-OPTIMIZATION-ROADMAP.md) turns them into explicit follow-up experiments rather than invented results.
