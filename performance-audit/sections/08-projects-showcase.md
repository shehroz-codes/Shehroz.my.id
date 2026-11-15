# Projects and showcase shell

Type: Top-level section / default tab. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Show project evidence and offer tabbed access to credentials, experience and the development toolkit.

## B. Source architecture

[`src/sections/components/showcase/PortfolioShowcase.tsx:64`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/showcase/PortfolioShowcase.tsx#L64); [`src/sections/components/showcase/portfolioData.ts:52`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/showcase/portfolioData.ts#L52); `ProjectCard.tsx`, `ProjectDetails.tsx`, `ProjectLinks.tsx`, `Modal.tsx`, `TechnologyIcons.tsx`, `PortfolioShowcase.css`.

## C. Technology

Local active/project/document state, useId ARIA relationships, hashchange handling, roving tab focus and native HTML dialog. Project tilt coalesces pointer motion through RAF and is restricted to fine pointers without reduced motion.

## D. Initialization

Shell and all panel modules are statically imported; only the chosen tab content mounts. Default Projects maps four records. Selecting #skills chooses Tech Stack; #projects returns Projects.

## E. Loading

Four WebP thumbnails total 107,566 bytes and have width/height plus lazy loading. They are sample concept artwork. Hidden panel assets are emitted in the build but images/PDFs are not all downloaded solely because their URLs were imported.

## F. Rendering and updates

Tab selection replaces keyed content; details mounts a dialog and selected project screenshots. Links pass safeExternalUrl; missing values render unavailable. Modal stores/restores focus, traps Tab and handles Escape.

## G. Animation

Tab indicator/entry, subtle card tilt, hover and light effects. Geometry writes are already capped to one RAF; styles remain part of the existing brand.

## H. Network

Local previews only; no project data API. No project has liveUrl or sourceUrl in the inspected data. This is a content evidence gap, not an HTTP 404 finding.

## I. Performance

Project cards are small compared with portrait/texture downloads. Inactive panels still contribute JavaScript/icon parsing to the initial shell; safe dynamic imports are plausible but exact savings require measuring built module output.

## J. Timing and readiness

Root DOM commits initially; functional scroll checks display cards. Tabs switched and keyboard End selected Tech Stack. The first Details test used the wrong accessible name. `followup.json` verifies the preview path; `resume-targeted-checks.json` verifies the correctly named Details button itself, including focus inside the dialog and restoration after Escape, at both viewports.

## K. Problems

Four concept/pending slots do not demonstrate shipped implementation. The existing portfolio itself has a concept image and no verified source/demo links in its project record. Placeholder instructions address the site editor instead of a recruiter.

## L. Potential fixes

Turn the portfolio into a factual case study: actual screenshots, personal role, supported features, design/engineering constraints, tests and deployment, known limits, verified repository and working site URL. Populate other records only when evidence exists. Split inactive panels without changing the tab design.

## M. Risks

Lazy panels can break tab focus, active hash or modal state; reserve geometry and preserve error/fallback behavior. Do not claim client outcomes, employers or metrics that were not supplied.

## N. Recommendation

Improve: highest-priority project evidence. Optimize Internally: inactive panel code loading. Keep Unchanged: tabbed layout, explicit sample labeling until replacement and guarded links.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
