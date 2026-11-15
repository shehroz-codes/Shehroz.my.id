# About — loading and interaction deep dive

Audit date: 14 November 2026. Owner: Muhammad Shehroz, Lahore, Pakistan. Inspected checkout: `/workspace/Shehroz.my.id`, branch `work`, commit `6839347096468ec0ff98a5c01e5a1df0f03e1cfd`. Evidence labels: **S — verified source**, **O — direct local-browser observation**, **M — measured lab result**, **R — verified external research**, **J — professional judgment**, **H — unverified hypothesis**.

The requested `perf/portfolio-speed-optimization` branch was absent locally and from the accessible GitHub branch listing. The initial checkout was clean. Historical 38.1→22.2 s Hero, 19.1→13.3 s About, 16 browser tests and pixel-identical frames remain user-provided history, not verified before/after results. Current source and existing documentation were preserved. This audit makes no application changes.

Browser results describe a production Vite build served locally with explicit gzip and cache headers, default **preview** Contact configuration, Chromium 156 and **SwiftShader software graphics**. They are not measurements of the deployed domain or real-user field data. Public-site access failed through the environment proxy and web retrieval tool. Live Supabase configuration, delivery and hosted caching were not verified.

## Exact architecture

`PortfolioSections` statically imports and immediately renders `AboutCard`, injecting `ProfileCard` through `profileSlot`. There is no About dynamic import or Suspense boundary. The fallback image code in AboutCard is not the selected path; the supplied ProfileCard renders the actual portrait. Sources: [`src/sections/PortfolioSections.tsx:1`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/PortfolioSections.tsx#L1), [`src/sections/components/AboutCard.tsx:149`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/AboutCard.tsx#L149), [`src/sections/components/ProfileCard/ProfileCard.tsx:105`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/ProfileCard/ProfileCard.tsx#L105), [`src/sections/config/aboutCardData.tsx:17`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/config/aboutCardData.tsx#L17), [`src/sections/config/profile.ts:78`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/config/profile.ts#L78).

The section contains identity, CSS portrait card, availability, role/specialty/bio, location/GitHub/education/LinkedIn label, 11 compact skills and two contact/GitHub actions. The same content is not an employment history. University name is supplied by the owner in this task, but the current site only displays BS Computer Science in progress; no degree completion is implied.

## Lifecycle and readiness

1. Initial HTML fetch loads a client-rendered shell; React commits About with every other top-level section.
2. ProfileCard initializes a CSS-variable spring engine at mount, reads size, registers pointer and ResizeObserver handlers, and starts its 1.4-second slow intro phase even if below the fold.
3. The portrait `<img loading="lazy">` is browser-scheduled. In observed initial loads it is close enough to request early; `loading=lazy` does not guarantee it waits for a user scroll. Pattern/backdrop assets are CSS resources. Fonts are shared with the rest of the page.
4. About's `useInView` observes its section with a 15% threshold. It sets `is-visible` once and disconnects.
5. Root entry lasts 0.9 s; child `.ac-reveal` uses 0.7 s duration and `index * 90 ms + 250 ms` delay. With 11 skills, `actionsIndex=9+11=20`: **20×90+250+700 = 2,750 ms** until the button row finishes its reveal. This is intentional visual timing.
6. Pointer movement writes `--mx/--my` directly; portrait hover/touch writes light/rotation/parallax variables through a damped spring RAF. React need not re-render every animation frame. The portrait loop stops when settled and removes listeners on unmount.

References: [`src/sections/components/AboutCard.tsx:100`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/AboutCard.tsx#L100), [`src/sections/components/AboutCard.tsx:178`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/AboutCard.tsx#L178), [`src/sections/components/AboutCard.tsx:187`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/AboutCard.tsx#L187), [`src/sections/components/AboutCard.css:270`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/AboutCard.css#L270), [`src/sections/components/ProfileCard/ProfileCard.tsx:136`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/ProfileCard/ProfileCard.tsx#L136), [`src/sections/components/ProfileCard/ProfileCard.tsx:260`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/ProfileCard/ProfileCard.tsx#L260).

## Distinguishing causes

| Category | Verified finding | Implication |
|---|---|---|
| Network | `public/sections/about/profile.png` is 640,933 bytes; requested at 2.19 s and ends 17.81 s in desktop constrained cold run 1 | Slow first arrival can wait for the portrait; browser lazy scheduling competes with eager Interests images |
| JavaScript | About/ProfileCard code is in the initial 505,710-byte shell | No separate About-chunk fetch explains the delay |
| React mount | About DOM observed at 2.085 s in that run | It is not mounted only at 13 or 19 seconds |
| Image decoding | Browser image completion observed; decode duration not separately instrumented | Do not assign the entire request/ready gap to decode |
| Animation | Nominal actions reveal finishes 2.75 s after intersection | Optimizing JS alone cannot remove this designed wait |
| Mount versus visibility | Root/children are animated from a hidden/reveal state until intersection | DOM present is not equivalent to visible or fully interactive content |
| Graphics | ProfileCard has CSS holographic/blend/filter effects; no About WebGL context | Other page WebGL and compositor work can contend; no isolated About GPU timing |
| Layout | Pointer handling reads bounding rect; spring writes multiple CSS variables; size reads on ResizeObserver | Batch layout reads and consider pausing unseen intro work only after profiling |
| Hardware | Software rendering and CPU throttling affect animation-event delivery | Cloud timings cannot predict all ordinary devices |

## Measured results and clocks

The main-run About measurement begins with an explicit instant scroll **after** the card experiment. It ends when the action-row animation has ended and ProfileCard images have natural dimensions. Medians: desktop fast cold 4.20 s; desktop constrained cold 5.00 s; mobile fast cold 3.37 s; mobile constrained cold 3.56 s. The portrait is already loaded in those post-card measurements. These values primarily capture reveal and shared scheduling, not a fresh About image download. Screenshots are taken between phases, so navigation-to-About in this sequence includes test-script time and must not be reported as a general section-loading score.

Additional direct `#about` navigations, measured under the constrained profile, are reported in [report 06](06-CHROMIUM-PERFORMANCE-RESULTS.md). They capture initial arrival without waiting for the Hero experiment. They are still not a reproduction of the historical 19.1→13.3 s result because its exact test script, source revision and readiness definition are missing.

Recovered direct-entry results: desktop 18.615 / 17.548 s; mobile 17.909 / 17.757 s from navigation to observed loaded images plus completed actions. The DOM appears at 1.981–2.339 s, and action animation ends at 6.876–7.116 s. The remaining wait is consistent with the portrait resource timing, not a delayed About component import. The direct-entry harness explicitly scrolls to the already targeted fragment once attached to make placement consistent; it is a controlled arrival scenario, not a field measurement.

The first automatic hover test timed out while Playwright waited for the continuously floating card to become geometrically stable. This is an automation precondition failure, not proof the user-facing hover interaction is broken. A follow-up uses an instant scroll and ordinary pointer coordinates; its outcome is retained with the original failed diagnostic in the evidence.

That saved follow-up passed: `--pc-rotate-y` changed from approximately 0° to −2.713° on desktop and −7.258° with pointer emulation at the mobile viewport. The latter is not a device-orientation or physical-phone test. Source still sets `enableMobileTilt=false`.

## Existing good behavior

The CSS design is coherent and the portrait gives clear identity. The reduced-motion CSS disables decorative animation; device-orientation permission is not requested because `enableMobileTilt=false`. Skill names are text-labeled, without invented percentage proficiency. Location and in-progress education are truthful. All contact data is centrally adapted and unavailable URLs are not fabricated.

## Content and accessibility observations

The role says Full Stack Web Developer, while Hero says Web/Frontend/AI enthusiast and the toolkit labels backend technologies as learning. This need not be dishonest, but the lack of linked implementation evidence makes the stronger role harder to evaluate. Prefer a consistent evidence-backed primary role. The LinkedIn row is present as plain text without a link, and the portrait Contact / Let's Connect actions currently route to GitHub because `links.email=null`. Do not claim they provide direct email delivery.

## Recommendations and risks

**Optimize Internally:** unify the real portrait URL with Interests; examine lossless smaller delivery; initialize a below-fold tilt intro closer to visibility while preserving its visual phase; coalesce pointer writes if a trace shows expensive repeated layout. These can retain colors, dimensions, animation curves and content.

**Investigate Further:** profile CSS rasterization and native graphics on real hardware; measure first pointer response separately from animation completion; check if near-viewport prefetching helps direct About entry without starving the Hero. No measured isolated per-component CPU or VRAM budget is claimed.

**Improve, owner approval:** direct contact destination, consistent role wording and verified LinkedIn/CV content. Shortening the 2.75-second stagger is a visible motion change and therefore belongs to an optional design decision, not the invisible-optimization tier. Removing ProfileCard or replacing it with a static portrait is not the preferred recommendation.

Regression tests must cover default Hero-first entry, `#about` entry, 390/1440 px layouts, 320 px reflow, reduced motion, image failure, fast reverse scrolling, focus and touch scrolling. Compare matched screenshots rather than unmatched frames from the floating animation.
