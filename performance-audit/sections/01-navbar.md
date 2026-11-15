# Navbar

Type: Top-level navigation. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Provide Home/About/My Interests/Projects/Contact navigation and compact mobile access, with an active-location cue.

## B. Source architecture

[`src/app/App.tsx:10`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/app/App.tsx#L10); [`src/components/PillNav/PillNav.tsx:203`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/components/PillNav/PillNav.tsx#L203); `PillNav.css`, `App.css`, and `public/icons/web-app-manifest-192x192.png`.

## C. Technology

React state/ref/effect/layout-effect hooks; ResizeObserver measures available width; requestAnimationFrame spring/glide engine; matchMedia handles reduced motion; native fragment links. No routing library or server navigation.

## D. Initialization

App renders navigation with the initial shell. PillNav measures a hidden menu row to decide collapse, initializes intro/indicator state and observes resize. App observes section sizes and schedules active-anchor updates on scroll.

## E. Loading

Shared 505,710-byte JS shell and 116,159-byte CSS; logo PNG is 82,775 bytes despite display around 44 px. The three self-hosted font files can affect measurement; no external menu service.

## F. Rendering and updates

ActiveHref is controlled by App. Mobile open/panelShown/collapsed are local state. Resize and active-item changes refresh the engine; hover/fill effects primarily write styles. Desktop and mobile DOM share accessible names but hidden duplicate decoration is marked aria-hidden.

## G. Animation

Glass backdrop blur, fill/indicator movement, menu transitions and an intro. Reduced-motion changes cancel subtree Web Animations. Existing spring work is not a reason to replace the visual design.

## H. Network

Logo and shared CSS/fonts only; clicking a fragment does not require a new document. The audited menu did not submit forms or contact a backend.

## I. Performance

No standalone navbar CPU duration was isolated. Width reads, resize observation and App getBoundingClientRect checks are real work; App already coalesces scroll callbacks into one RAF. Logo bytes are an opportunity, not evidence of the main 38-second bottleneck.

## J. Timing and readiness

Navigation is committed with the initial shell. Full functional scripts exercised desktop Projects navigation and the mobile menu. See `evidence/functional-desktop.json` / `functional-mobile.json`; section-root commitment in primary runs precedes card readiness.

## K. Problems

No skip-to-main link was present. An always-moving decorative layout can complicate automation, but menu destination checks completed. App and Footer use different active-section algorithms, so fast reverse-scroll consistency deserves targeted checks.

## L. Potential fixes

Add a focus-visible skip link to the existing main target. Consider lossless logo optimization at the same displayed dimensions. Keep scroll coalescing and test shared active-section logic before any unification.

## M. Risks

Incorrect layout measurements can break collapse thresholds, intro state or focus restoration. A skip link must land past navigation without obscuring content under the fixed header. Do not simplify colors/layout without approval.

## N. Recommendation

Keep Unchanged: theme, pill navigation and native fragments. Improve: skip navigation. Investigate Further: duplicated active-section algorithms and logo delivery.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
