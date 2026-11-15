# Development Toolkit / Tech Stack

Type: Showcase tab, #skills destination. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Describe the personal development environment and distinguish learning technologies from verified project technologies.

## B. Source architecture

[`src/sections/components/showcase/TechStackPanel.tsx:23`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/showcase/TechStackPanel.tsx#L23); `TechnologyIcons.tsx`, `portfolioData.ts`, `types.ts`, `PortfolioShowcase.tsx:68` and showcase CSS.

## C. Technology

Static grouped arrays, react-icons brand components, Lucide icons, one imported Antigravity SVG. CSS custom property controls group columns; focusable lists allow horizontal exploration where needed.

## D. Initialization

Module is eagerly imported but rendered only for active tech tab; #skills selects it on initial hash/navigation. It is not a second top-level independent section.

## E. Loading

Thirty named toolkit entries across five groups: Frontend 8, Backend 5, Database 3, Tools 8, Development Environment 6. Brand icon code sits in the main bundle; Antigravity SVG is 7,949 bytes when requested.

## F. Rendering and updates

No local state/effect; parent tab state determines mount. Data labels Node/Express/SQL/PostgreSQL as learning and separates personal tools from per-project verified technology IDs.

## G. Animation

Shared tab reveal, tile hover and branded colors. No custom canvas or per-frame JS in this panel.

## H. Network

Local SVG plus shell resources. Mentioning ChatGPT/Codex/Claude/Firebase does not call those services.

## I. Performance

Tree-shaken react-icons/si code contributes to the shell; module inventory reports ~28,324 pre-minification rendered bytes for the selected icon module. This is not the full installed icon package size or direct transfer cost.

## J. Timing and readiness

Tech Stack tab and End-key navigation succeeded on desktop/mobile. Direct #skills behavior is source-verified and should be rechecked after any lazy-mount refactor.

## K. Problems

The panel lists Firebase prominently while the active contact path uses Supabase; it omits an equally clear current Supabase/test/deployment case-study connection. AI tooling names alone do not show engineering ownership.

## L. Potential fixes

Keep learning labels and compact groups. Align toolkit descriptions with actual usage and link evidence from existing projects. Lazy-load this inactive tab and associated icons if the measured entry-bundle reduction is worthwhile.

## M. Risks

Grouping changes can imply proficiency or remove honest learning labels. A split must handle focus, hash navigation and loading without layout jumps. Do not add more badges just to match job keywords.

## N. Recommendation

Keep Unchanged: grouping and honesty. Improve supporting context; Optimize Internally inactive-tab imports. No new toolkit section is needed.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
