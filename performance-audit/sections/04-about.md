# About and ProfileCard

Type: Top-level section. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Explain identity, education, location, specialization, availability and contact channels beside a holographic portrait.

## B. Source architecture

[`src/sections/PortfolioSections.tsx:25`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/PortfolioSections.tsx#L25); [`src/sections/components/AboutCard.tsx:149`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/AboutCard.tsx#L149); [`src/sections/components/ProfileCard/ProfileCard.tsx:136`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/ProfileCard/ProfileCard.tsx#L136); `AboutCard.css`, `ProfileCard.css`, `profile-card-violet.css`, `aboutCardData.tsx`, `profile.ts`.

## C. Technology

React state/ref/useId, a one-time 15% IntersectionObserver reveal, CSS transforms/blends/masks and a direct-DOM spring engine. No About WebGL, dynamic import or Suspense.

## D. Initialization

About is eager. ProfileCard starts its intro and observers at mount. The section remains reveal-gated until intersection; portrait loading is delegated to the browser. root entry and staggered children are independent of fetching the component.

## E. Loading

640,933-byte public portrait, icon-pattern SVG and CSS backdrop assets plus shared fonts. ProfileCard renders the actual image slot; AboutCard’s own fallback figure is not the active branch. The mini avatar shares its URL, allowing reuse.

## F. Rendering and updates

About visible state changes once. Pointer coordinates set CSS custom properties directly. ProfileCard is memoized; its spring loop stops when settled and ResizeObserver refreshes dimensions. Mobile device-orientation tilt is disabled.

## G. Animation

0.9 s root reveal; child 0.7 s reveals with 90 ms per index and 250 ms base delay; 11 skill chips push action completion to nominal 2.75 s. Surface floating, borders/orbs/shimmer persist through CSS; reduced-motion rules disable animation.

## H. Network

No About-specific API call. The image requested early in homepage runs despite loading=lazy. The exact same portrait bytes also appear under an imported Interests URL.

## I. Performance

Initial mount observed at ~2.085 s in constrained desktop run 1; portrait response ends at 17.81 s. After the card experiment, the image is cached/loaded and post-scroll About medians range ~3.17–5.00 s. These are not isolated React or decode costs.

## J. Timing and readiness

Measured end requires actions animationend plus loaded portrait images. Direct #about tests are separate in report 06. DOM presence alone does not satisfy visual readiness.

## K. Problems

Competing portrait fetch, offscreen intro work, long intentional action reveal and GitHub-as-contact behavior. LinkedIn is a nonlinked label. Headline Full Stack should be supported by project evidence and reconciled with learning labels.

## L. Potential fixes

Deduplicate portrait URL, investigate lossless delivery and initialize offscreen interaction work nearer visibility. Publish verified contact/CV details. Keep current visual treatment. Shortening stagger requires explicit design approval.

## M. Risks

Changing visibility thresholds or mounting can break deep links and first interaction; font or texture alterations can shift layout. Direct-pointer geometry tests should not wait for the continuously floating card to become stable.

## N. Recommendation

Optimize Internally and Improve contact clarity. Preserve portrait composition and theme. Full diagnosis: [About deep dive](../03-ABOUT-SECTION-DEEP-DIVE.md).

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
