# Hero introduction and actions

Type: Top-level section. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Introduce Muhammad Shehroz, communicate a developer identity, lead to CV/contact and expose public social profiles.

## B. Source architecture

[`src/components/Hero/Hero.tsx:12`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/components/Hero/Hero.tsx#L12); [`src/content/portfolio.ts:19`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/content/portfolio.ts#L19); `Hero.css`, `WarpText`, `RotatingText`, `Magnet`, `SocialSpotlight`, `HeroLanyard` and `useHeroMotion`.

## C. Technology

React lazy/Suspense for rotating text, matchMedia mobile state, IntersectionObserver/focus/visibility in useHeroMotion, OGL WebGL2 text enhancement on fine pointers, Motion role animation and CSS magnetic CTA movement.

## D. Initialization

Hero text and CTAs render in the initial shell. useHeroMotion activates visible non-reduced sessions; enhanced text additionally requires fine hover and more than two hardware threads. RotatingText loads lazily; Lanyard has its own near-view gate.

## E. Loading

Hero shares initial JS/CSS/fonts. RotatingText adds 164,358 raw JS bytes (55.59 kB Vite gzip estimate). WarpText lives in the initial shell and waits for document.fonts.ready before rasterizing name text.

## F. Rendering and updates

Notice state changes on incomplete CTA actions; media query changes alignment. Active motion switches between a static role and the rotating component. SocialSpotlight tracks hovered/focused tile and measures its center. Physics in the adjacent Lanyard is independent.

## G. Animation

Warped heading, rotating roles, magnetic CTAs and spotlight accents serve a creative-developer identity. Reduced motion preserves static readable text. Multiple simultaneously moving systems merit attention testing, not an automatic removal recommendation.

## H. Network

Only GitHub is configured in Hero socials. Three other social anchors expose unavailable state rather than fabricated destinations. The role chunk loads after Hero activation; contact clicks currently make no delivery request.

## I. Performance

FCP/latest initial LCP medians are 0.68 s desktop fast cold and 2.28 s desktop constrained cold. These exclude canvas readiness as a metric. Larger dependencies and text rasterization share startup resources with the card.

## J. Timing and readiness

The heading/intro DOM is observed with About/Interests/Projects at initial React commit. The card marker is separately measured. A functional click on Contact Me displayed the missing-contact notice; this is verified behavior, not successful contact conversion.

## K. Problems

cvPath=null and contactHref=null. Download CV cannot download a document; Contact Me does not navigate to the existing Contact section. Axe reports aria-prohibited-attr on `.hero-roles`, a div carrying aria-label without an appropriate role. Mobile puts the card first; CTAs fall below the first 844 CSS-pixel viewport.

## L. Potential fixes

Publish an authentic CV and wire a verified contact destination; use a valid semantic role or visible accessible role text. Keep explicit role wording consistent with About/toolkit evidence. Evaluate a smaller Motion import only with a measured bundle comparison and exact transition equivalence.

## M. Risks

Removing role information from accessibility APIs while fixing ARIA would regress access. Changing card order or shortening motion is visible redesign. Never fabricate experience or public social accounts.

## N. Recommendation

Keep Unchanged: violet identity, greeting and creative composition. Improve: CV/contact and semantics, high priority. Optimize Internally: role-module loading only after proof.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
