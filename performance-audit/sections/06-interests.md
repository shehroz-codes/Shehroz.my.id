# My Interests and HalftonePortrait

Type: Top-level section. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Show personal interests and creative interaction: Coding, AI & Agents, Web Design, Anime, Gaming and Linux, plus a real-to-anime portrait reveal.

## B. Source architecture

[`src/sections/components/my-interests/MyInterests.tsx:15`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/my-interests/MyInterests.tsx#L15); `interestsData.ts`, `InterestCard.tsx`, `MyInterests.css`; [`src/sections/components/my-interests/HalftonePortrait.tsx:375`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/my-interests/HalftonePortrait.tsx#L375) and `src/sections/assets/portraits/`.

## C. Technology

React composition, raw WebGL2 mask/view shaders, ping-pong framebuffer masks, texture mipmaps, pointer/touch/keyboard listeners, ResizeObserver, IntersectionObserver and CSS fallback. No Three.js in this effect.

## D. Initialization

MyInterests mounts eagerly below About. Halftone useEffect acquires WebGL and compiles programs immediately; observation mainly gates frame scheduling. The image onload uploads the anime texture even while the section is below the fold.

## E. Loading

Real portrait 640,933 bytes and anime portrait 1,008,321 bytes are eager DOM images. The shader creates an additional Image for the same anime URL; same-URL loads can coalesce/cache and must not be counted automatically as twice the network payload.

## F. Rendering and updates

Settings refs hold effect properties. Brush/mask state runs outside React. Mouse trail fades, touch tap toggles, and Enter/Space offers keyboard reveal. RAF continues only while interaction/trails/intro require work and respects page visibility.

## G. Animation

Halftone mask reveals real anime colors over a plain real-photo base; 0.5-resolution mask targets; DPR capped at 2. Hover cards/halo and other CSS decoration add compositor work. The base image survives WebGL failure.

## H. Network

The real portrait is byte-identical to the separate public About URL, causing two distinct requests. Anime imagery is local. The nested playlist can request Spotify artwork; its iframe is user-triggered.

## I. Performance

Both portrait requests begin ~2.087 s in constrained desktop cold run 1, before card images begin ~8.94 s. The raw GL probe observed a separate context before the Lanyard. This is verified early work; the number of seconds saved by deferral is unmeasured.

## J. Timing and readiness

The section DOM mounts with About, but it is below the viewport. Functional scroll captures confirm displayed cards and images. The original follow-up keyboard test had an ambiguous `.hp` selector; the resumed `.mi-portrait` test in `resume-targeted-checks.json` and Enter/Space screenshots confirms real/anime toggling in both viewports. Screenshot elapsed times include capture overhead and are not first-paint metrics.

## K. Problems

Early downloads/context setup compete with recruitment-critical Hero content. Personal content comes before project evidence. The latter is a strategic ordering question, not a standards failure.

## L. Potential fixes

Near-viewport initialize the WebGL effect and anime texture while reserving the exact portrait footprint. Reuse one real-photo URL. Keep the artistic reveal and touch/keyboard fallback. Moving Projects above Interests is optional and requires owner approval.

## M. Risks

Lazy mounting can produce empty transition frames or missed keyboard focus; ensure real-photo fallback exists, deep links work and rapid scroll does not thrash resources. Do not remove personal content simply for conformity.

## N. Recommendation

Optimize Internally: high-priority loading schedule and duplicate URL. Keep Unchanged: personality and reveal concept. Optional: section order after recruiter testing.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
