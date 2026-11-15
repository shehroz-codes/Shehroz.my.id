# Footer

Type: Top-level footer. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Reinforce owner identity, repeat navigation/contact availability, show build technologies and return to the top.

## B. Source architecture

[`src/components/PortfolioFooter.tsx:57`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/components/PortfolioFooter.tsx#L57); `PortfolioFooter.css`, shared profile links and App composition.

## C. Technology

React active-section state with IntersectionObserver; inline SVG icons; native fragment links; scrollIntoView/history/focus handling for Back to top. No third-party footer package.

## D. Initialization

Eagerly rendered outside main after PortfolioSections. Its independent active-section observer uses a narrow center band. Copyright year derives from current time.

## E. Loading

Shared shell/CSS/fonts; inline icons require no separate requests. The transparent background intentionally exposes the existing global cursor effect.

## F. Rendering and updates

Active nav state changes on intersections; unavailable socials render dim nonclickable soon states. Default tech line names React, TypeScript, Tailwind and Supabase. Names/availability are configurable props.

## G. Animation

CSS decorative glow/status, link interaction and smooth Back to top unless reduced motion. No footer canvas.

## H. Network

Only verified GitHub is linked; fragments are same-page. No analytics/social SDK introduced by footer.

## I. Performance

Small relative to startup dependencies; no isolated CPU timing. A second section observer has low expected cost, but correctness consistency with App is worth checking before consolidating.

## J. Timing and readiness

Functional scripts scrolled to the footer and exercised Back to top on both viewports. The initial timing observer used a wrong footer selector, so no footer-specific mount timestamp is claimed; the actual DOM/screenshot confirms it exists.

## K. Problems

Unconfigured LinkedIn/Instagram remain unavailable; this should not be mistaken for working contact. No evidence supports redoing the recently integrated transparent footer or palette.

## L. Potential fixes

Keep layout, transparency and build text. Connect verified social/contact data when supplied. Test active-section agreement after changes to sections or lazy loading.

## M. Risks

Changing the main #home wrapper or focus handling can break keyboard return-to-top and navigation history. Preserve existing footer work and its latest commit.

## N. Recommendation

Keep Unchanged. Improve verified links when owner data is available. No footer performance rewrite justified.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
