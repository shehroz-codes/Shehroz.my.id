# Experience

Type: Showcase tab. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Present professional history and supporting documents when authentic records are available.

## B. Source architecture

[`src/sections/components/showcase/ExperiencePanel.tsx:1`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/showcase/ExperiencePanel.tsx#L1); [`src/sections/components/showcase/portfolioData.ts:149`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/showcase/portfolioData.ts#L149); `DocumentPreview.tsx`, `Modal.tsx`, shared CSS and letter sample assets.

## C. Technology

Typed static data, conditional tab rendering, image/PDF dialog previews. There is no external employment database or verification API.

## D. Initialization

Experience module is statically imported; content is only rendered for the Experience tab. Preview requests are initiated by a user action.

## E. Loading

Letter thumbnails are 22,648 / 34,576 bytes; sample PDF 51,069 bytes. These do not prove previous employment.

## F. Rendering and updates

Parent doc state drives dialogs; panel itself has no async lifecycle. Records contain no employer, role, dates or achievements and empty skills arrays.

## G. Animation

Shared showcase tab/card effects, no separate GPU renderer.

## H. Network

Local assets only when rendered/previewed. No authenticated or backend dependency.

## I. Performance

A small inactive-panel splitting opportunity, not a primary bottleneck. No isolated duration was measured for panel computation.

## J. Timing and readiness

The tab rendered on both viewports in the functional run; followup.json records preview/Escape behavior. Screenshot-based elapsed values include capture and are not tab interaction latency.

## K. Problems

Professional Work framing is stronger than the supplied evidence. Sample employment letters should never be interpreted as work history. No experience timeline can be truthfully populated from the existing data.

## L. Potential fixes

Use verified internships, freelance engagements or project contributions only when the owner supplies their role, dates and outcomes. A student can rely on strong project work without inventing employment. Consider a compact honest state instead of empty letter slots.

## M. Risks

Replacing samples with unsupported company/achievement claims would harm credibility. Publishing real letters needs owner review. Preserve tab keyboard and modal behavior when splitting.

## N. Recommendation

Keep truthful limitations; Improve only with genuine records. An additional work timeline is optional and currently unnecessary.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
