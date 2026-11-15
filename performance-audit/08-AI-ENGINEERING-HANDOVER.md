# AI engineering handover

This document provides an actionable independent handover for an AI or engineer. The [combined report](PERFORMANCE-AUDIT-COMPLETE.md) contains the full essential technical and market evidence. Neither substitutes for obtaining the exact application source and raw artifacts before implementing changes.

## Mission, authority and source boundary

Owner: Muhammad Shehroz, Lahore, Pakistan; BS Computer Science, Virtual University of Pakistan, in progress (owner-provided context). Targets: frontend/React-TypeScript, junior full stack, AI integration/automation and freelance work. Repository: `shehroz-codes/Shehroz.my.id`; intended domain `Shehroz.my.id`.

The original instruction is a **read-only application audit**. Preserve React/TypeScript, CSS, theme, colors, fonts, layout, images, 3D artwork, animation, navigation, text, functional behavior, Supabase, dependencies, configuration and environment. Documentation/diagnostics are authorized; implementation, commits, pushes, merges, migrations and deployments are not. The roadmap is not implementation permission. Existing uncommitted work must be retained if recovered in another workspace.

Available checkout: `/workspace/Shehroz.my.id`, branch **`work`**, HEAD **`6839347096468ec0ff98a5c01e5a1df0f03e1cfd`**, initially clean, 176 tracked files. Requested `perf/portfolio-speed-optimization` was absent locally and in the previously accessible remote branch listing. Its historical uncommitted optimization diff and comparison artifacts were not recovered. Never call this snapshot the optimized branch or claim the missing changes were preserved here. Current available files were preserved and SHA-256 checked.

Historical user-provided values are Hero 38.1→22.2 s, About 19.1→13.3 s, 77 unit tests, 16 browser tests, build/type success and pixel-identical matched 3D frames; desktop reportedly did not improve. These are unverified history. The independently collected current-task results below are a different cohort. The report resumption reused those saved results and did not repeat benchmarks.

## Architecture in one view

The application is a client-rendered SPA using React/React DOM 19.3.1, TypeScript 7.0.2, Vite 8.3.8/Rolldown, Tailwind 4.3.5 plus extensive custom CSS, Motion 14.12.0, Three 0.187.0 and OGL 1.0.11. Supabase JS 2.119.0 supplies the live Contact path; Firebase 12.19.0 remains in historical/inactive source but was absent from the measured browser bundle. There is no React Router/Redux/R3F/Drei/Rapier. Node is 24.22.1, Playwright 1.65.0, Chromium 156.0.8078.79.

`src/main.tsx` creates the root with StrictMode. `src/app/App.tsx` owns active anchors, global GlowCursor, PillNav, Hero, `PortfolioSections`, and Footer. `src/sections/PortfolioSections.tsx` eagerly mounts About/ProfileCard, Interests/Music, tabbed showcase and Contact/Visitor Wall. Hash navigation serves Home/About/Interests/Projects/Contact; `#skills` selects the toolkit tab. No separate Skills route exists. State is local hooks; frame motion is mostly mutable refs/direct CSS variables rather than React state per frame.

Actual audited regions are Navbar, Hero, Lanyard, About, compact skills, Interests, Music, Projects/showcase, Certificates, Experience, Development Toolkit, Contact, Visitor Wall, Footer and global effects. Certificates/Experience/Toolkit are tabs, not additional top-level pages. Fifteen separate reports cover purpose, source, dependencies, lifecycle, requests, animations, measured/unknown costs, fixes and visual risks.

Theme invariants: background `#050310`, surface `#0B0A1F`, primary `#5B21F0`, secondary `#4F46E5`, text `#F8FAFC`, muted `#A7A3BA`, accent `#A78BFA`; self-hosted Inter/Space Grotesk/JetBrains Mono Latin variable fonts with swap. Preserve transparent Footer and all existing responsive/interactive design. CI targets Node 24/main deployment with Vite base `/Shehroz.my.id/`; no tracked CNAME proves custom-domain routing.

## Important source entry points

| Files | What to understand before changing anything |
|---|---|
| `src/components/Hero/Hero.tsx`, `HeroLanyard.tsx`, `Hero.css` | Hero role/CTA state, near-viewport card gate, reduced motion, desktop/mobile composition |
| `src/components/Lanyard/Lanyard.tsx` | 1,974-line procedural Three card; image loader ~424, environment ~560, effect ~1141, texture settings ~1401, rendering ~1600, pointer logic ~1737, cleanup ~1890 |
| `src/sections/components/AboutCard.tsx`, `src/sections/components/AboutCard.css` | Eager section, 15% observer, root/child reveal and action staggering |
| `src/sections/components/ProfileCard/ProfileCard.tsx`, `profile-card-violet.css` | CSS holographic card, spring engine/intro, pointer/resize lifecycle; not WebGL |
| `src/sections/components/my-interests/HalftonePortrait.tsx`, `interestsData.ts`, `MyInterests.tsx` | Eager portrait resources/context; visibility gates loop rather than setup; keyboard/touch reveal |
| `src/components/GlowCursor/GlowCursor.tsx`, `WarpText/WarpText.tsx` | Additional WebGL startup, idle/visibility/frame-rate gates; desktop enhanced WarpText |
| `src/sections/components/showcase/PortfolioShowcase.tsx`, `portfolioData.ts`, `ProjectDetails.tsx`, `Modal.tsx` | Eager panel imports, conditional render, hash/tab state, honest sample content, native dialog focus behavior |
| `src/content/portfolio.ts`, `src/sections/config/profile.ts` | Separate role/link sources; unavailable CV/contact values and inconsistent primary emphasis |
| `src/sections/components/contact/ContactSection.tsx`, `services/backend.ts`, `services/supabaseBackend.ts`, `config.ts` | Eager adapter loading, preview/live choice, published-only feed, 15 s abort and 30 s polling |
| `supabase/functions/`, `supabase/migrations/`, `docs/contact/COMPLETION_AND_RELEASE.md` | Server authorization/public-private boundaries; historical migration timestamp mismatch warning; do not replay blindly |

Paths abbreviated with a shared directory above refer to real files; use the pinned source links/full module inventory in report 01. React development StrictMode and development-server typography limitations must not be blamed for production-bundle timing.

## Hero: verified cause chain and unknowns

The card dynamically loads Three/Lanyard near 150 px of the viewport; reduced motion uses the existing original-front fallback. It builds geometry, materials, a light-panel PMREM environment and deterministic grain/weave. No GLB/HDR downloads or physics library are involved. During `apply` after setup it starts two PNG requests, paints 1086×1448 canvas textures after both images load, then sets ready after a render call returns. Preserve original 3:4 art, 1.6875×2.25 body, size 0.67, silver hardware, strap, glossy finish, camera/light appearance, drag and flip.

Representative constrained desktop cold timing: initial JS ~0.21–1.33 s; React DOM ~2.085 s; text FCP/LCP 2.276 s; Lanyard chunk 3.494–7.992 s; component ~8.177 s; canvas ~8.934 s; face requests ~8.94 s; back response 34.396 s; front 37.236 s; first render-return marker 38.599 s. Final-response-to-marker ~1.36 s includes decode/draw/upload/event scheduling/render and cannot be labeled pure decode. Artwork totals 4,216,807 bytes, with an ideal 21.08 s aggregate transfer floor at 200,000 B/s before competing bytes. Eager real/anime Interests portraits plus the duplicate About portrait compete during this window.

A separate instrumented trace shows overlapping graphics/compositor work ~2.82 s under SwiftShader. The four context acquisitions are only ~12 /4.3 /64.3 /7 ms; context creation alone is insufficient to explain the stall. Dominant CPU profile `(program)` time is not a precise shader/evaluation attribution. Native PMREM/render/upload/raster costs remain candidates for targeted physical-GPU profiling. Do not promise `compileAsync` or a cache solves all of them.

Loops use handwritten small-step physics (`MAX_STEP=1/960`, two constraint iterations/four joints/72 strap samples), capped FPS/DPR and visibility/focus gates. Breeze 0.5 prevents the zero-breeze rest exit while visible. Current host reports three CPUs and follows 30/15 active/idle FPS caps; a cap is not achieved FPS. React reconciliation was not proven dominant. Both flip and drag worked; no keyboard flip exists. Two RGBA face levels are ~12.58 MB (~16.77 MB with a full rough mip pyramid), not exact total VRAM.

Best first experiment after authorization: initiate the same face requests earlier and share promises; then defer offscreen effect setup with reserved layout. Test error/reduced-motion/direct-entry/interaction behavior and exact appearance. Never replace the badge with static art as the preferred fix or describe lower DPR/solver quality as invisible.

## About: verified cause chain and unknowns

About/ProfileCard is in the initial shell, with no dynamic import/Suspense or WebGL renderer. Its DOM appears with Hero (~2.085 s in the representative constrained run). ProfileCard starts a 1.4 s spring intro at mount and uses CSS blends/masks/transforms; spring RAF stops when settled. About visibility uses a one-time 15% observer. Root animation is 0.9 s; child reveal is 0.7 s plus 250 ms and 90 ms per index. Eleven chips make actions index 20, hence nominal **2.75 s** to button-row completion after intersection.

The public 640,933-byte portrait is browser-lazy but requested early in recorded home loads. It is identical to a differently addressed Interests portrait. Post-Hero scroll measurements begin with the image already loaded and span ~3.08–5.22 s, mostly reveal/scheduling. Four fresh constrained direct-About arrivals complete at 18.615/17.548 s desktop and 17.909/17.757 s mobile; actions finish ~6.88–7.12 s, while image completion extends the wait. Separate these clocks. They do not verify historical 19.1→13.3 s improvements.

The original hover automation waited for the continuously floating card to become stable and timed out. Corrected instant-scroll/pointer checks show rotation changes on both viewports. That is a harness correction, not a source fix. Device orientation remains disabled; mobile pointer emulation is not physical-phone testing. Shortening reveal timing is a visible change requiring approval; shared portrait URL and setup scheduling can be considered first.

## Measurement baseline and definitions

All primary tests use a locally served production Vite build, default preview Contact and SwiftShader software Vulkan. Desktop 1440×900/DPR 1; mobile 390×844/DPR 2 with touch. Fast means no CDP throttle, local HTTP. Constrained means CPU 4×, 150 ms latency, 200,000 B/s down and 93,750 B/s up. Two independent contexts/replicates per profile, cold then warm navigation in each: 16 runs collected 14 November. Medians:

| Profile | Cold card marker s | Warm card marker s | Cold FCP/latest LCP s | Cold About after-scroll s |
|---|---:|---:|---:|---:|
| Desktop fast | 5.812 | 5.185 | 0.684 | 4.205 |
| Mobile fast | 1.872 | 1.542 | 0.784 | 3.370 |
| Desktop constrained | 38.637 | 8.960 | 2.284 | 5.002 |
| Mobile constrained | 38.147 | 3.246 | 2.856 | 3.558 |

The card marker means loaded faces and first render returned, not actual GPU presentation/settled interaction/TTI. A fast mobile marker is followed by a 2.742 s long task in one run. Latest initial LCP equals FCP in all runs and is not the card canvas. Initial max CLS is ~0.002596; later user journeys are outside that snapshot. Custom blocking is the sum of task time beyond 50 ms after FCP up to a variable initial snapshot; **it is not Lighthouse TBT**. No field INP/CrUX, standard Lighthouse score, per-section VRAM, exact image decode, shader completion or physical-device generalization is claimed. CDP ScriptDuration and approximate JS heap are preserved separately in report 06.

Initial shell 505,710 raw bytes; CSS 116,159; Lanyard 594,388; RotatingText 164,358. Local server gzip bodies in the representative run are 163,119/24,907/151,567/55,085 bytes respectively. Offline/Vite gzip estimates differ. The 5,351-byte Supabase adapter chunk excludes unreachable configured SDK setup in this preview build; do not cite it as the live size. Contact portrait 1,853,228 bytes is later/lazy; project WebP previews total 107,566 and are already small. Preserve self-hosted fonts and on-demand Spotify iframe.

## Validation evidence and caveats

Build and no-emit typecheck passed; Vitest 77 tests / 10 files passed; eight available Playwright tests passed. These eight development-server tests used preview/mocked APIs, with font 403s caused by the isolated-copy node_modules symlink and Vite allowlist. They do not prove typography parity; production benchmark fonts loaded. No hosted message was submitted. Database fixtures/migrations were inspected, not newly executed against a hosted database.

Functional tests cover card tap/drag, seven observed page regions, About tilt (corrected harness), tab keyboard behavior, project/certificate/experience modals, navigation, back-to-top, music genre and iframe creation. Two new checks per viewport on 15 November resolved Interests Enter/Space and the correctly named Details button, preserving prior failure logs. Full-page axe has one serious `.hero-roles` ARIA violation and incomplete contrast review (130 desktop/118 mobile nodes). Successful scan execution is not accessibility conformance. No page-width overflow at 390/1440; mobile CTAs are below the first viewport. Physical mobile/screen-reader/complete manual contrast remain unknown.

## Backend and deployment guardrails

Contact default preview stores local data; live source uses Supabase with explicit published/non-demo columns, newest-first pagination, page size five plus one, 15 s abort and 30 s polling. No Realtime channel. Public photo edge reads verify publication and use no-store against a private bucket. Public/private write handlers require server validation/authentication/CAPTCHA/cooldown controls; owner actions require non-anonymous admin membership. Do not bypass permissions/caching for performance. No live schema or delivery was certified.

`docs/contact/COMPLETION_AND_RELEASE.md` records a historical remote/local migration timestamp mismatch; never replay the directory blindly. CORS expects the GitHub Pages origin in inspected shared server code. Domain/base/cache/TLS/Brotli/HTTP version and actual configured live bundle must be checked when accessible. External domain/Spotify access was blocked by this environment; do not report an outage or successful delivery.

## Recruiter and design handover

Keep the coherent violet/indigo system, artwork, typography, structured sections, truthful learning/sample labels and current responsive mechanics. Strongest gap: four concept/pending projects lack supplied demo/source URLs, CV is unavailable and Hero Contact Me does not reach the existing Contact section. About Contact falls back to GitHub; LinkedIn is plain text. One or two truthful case studies within existing details can explain problem, ownership, decisions, tested behavior and limitations. The portfolio itself can demonstrate real engineering if documented accurately. Do not invent clients, employment, metrics or credentials.

Four readable employer examples (TekSol Lahore, MQ Software, ReactWise, ByteGurus) emphasize frontend fundamentals, React/TypeScript, Git, tests, communication and project evidence. They are a qualitative sample, not market statistics. ReactWise is remote GB with UK right-to-work required and no sponsorship; not a Pakistan-eligible job recommendation. Other remote labels do not establish country eligibility. W3C/web.dev/Search Central guide accessibility/performance/metadata; NN/g case-study evidence concerns adjacent UX hiring. Full source URLs/dates are in report09/register. Previously retrieved research notes were reused; raw web exports did not survive.

No new section or forced redesign is needed. First professional actions after owner authorization: real CV/contact, supported primary role, project proof, keyboard/ARIA fixes, factual metadata after hostname confirmation. Optional later choices include earlier project order, shorter About reveal or writing; those are explicit layout/motion/content decisions, not invisible optimization. Subjective scores are explained in report09, not official hiring rankings.

## Reproduction, evidence access and next exact action

Read `PROGRESS-CHECKPOINT.md`, `README.md`, `06-CHROMIUM-PERFORMANCE-RESULTS.md` and `07-OPTIMIZATION-ROADMAP.md` first. `evidence/` contains aggregate/per-run JSON, resource timings, screenshots, Playwright trace ZIPs, compressed Chromium trace, V8 CPU profile and build/type/unit/browser logs. `diagnostics/` preserves the scripts; absolute workspace path constants must be reviewed on another machine. The original source/build is not bundled into this report. Retrieve the exact revision and any missing dirty diff separately.

The isolated build under `/workspace/work/audit/build` and diagnostics copy under `/workspace/work/audit/repo` are scratch resources, not required report dependencies. Saved evidence is sufficient to understand conclusions without rerunning expensive tests. Do not overwrite raw artifacts on rerun: choose a new output/cohort directory and record new metadata. `measure.cjs` has a corrected footer selector that postdates the stored run; footerDOM was not captured in the 16-run evidence. Use screenshots for Footer, or measure only that missing scenario if needed.

Next engineering action, **only when implementation is separately authorized**: establish the true source baseline including recovered optimization work; propose the smallest R01 image-scheduling diff; compare fixed-condition resource initiation and complete first-frame/interaction behavior. Then consider R02 portrait URL and R03 offscreen setup. Profile physical-GPU phases before R04 changes. For each accepted change preserve source safety, deterministic visual parity, interactions, backend privacy, direct fragments, errors and reduced motion. Do not implement optional redesigns or deploy under the authority of this document.

If work is interrupted, update `PROGRESS-CHECKPOINT.md` with completed artifacts, exact remaining checks, source SHA/dirty state, valid measurement cohort and next action. Preserve valid observations and previous failures; never silently relabel historical values as new measurements.
