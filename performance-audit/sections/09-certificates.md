# Certificates

Type: Showcase tab. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Reserve space for verified learning credentials and readable document previews.

## B. Source architecture

[`src/sections/components/showcase/CertificatesPanel.tsx:13`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/showcase/CertificatesPanel.tsx#L13); [`src/sections/components/showcase/portfolioData.ts:125`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/showcase/portfolioData.ts#L125); `DocumentPreview.tsx`, `Modal.tsx`, shared showcase CSS and certificate sample assets.

## C. Technology

Typed static certificate records, React conditional tab mount, lazy thumbnails and native modal; image or PDF preview depending on document kind.

## D. Initialization

Module loads as part of the shell, but cards mount only when Certificates is selected. Preview button sets document state, mounts dialog and creates a preview of the selected file.

## E. Loading

Two thumbnails are 30,218 / 39,318 bytes; sample PDF is 59,774 bytes. Emission in dist is distinct from a network request. The PDF is a sample, not a verified educational qualification.

## F. Rendering and updates

No data-fetch hook in the panel; parent preview callback supplies modal state. Missing issuer/completion fields explicitly display not supplied.

## G. Animation

Uses shared tab entry and document card CSS. No WebGL or dedicated animation package.

## H. Network

Local thumbnail/document requests after tab/preview activation. No credential verification endpoint or external issuer checks are implemented.

## I. Performance

Modest assets; statically imported panel code remains an initial JS opportunity. No independent CPU or memory measurement was isolated for this small panel.

## J. Timing and readiness

Desktop/mobile functional tab selection succeeded. Follow-up opens image certificate preview and closes with Escape. PDF viewer behavior needs a separate browser-specific check if replacing samples with real PDFs.

## K. Problems

Both records are sample:true and have no verified issuer/date. Showing many placeholders makes the portfolio appear unfinished, even though disclosure is honest.

## L. Potential fixes

Publish only real credentials with verifiable issuer/date/link if available. If none are available, keep them unpublished or use an owner-approved compact empty state. This is preferable to inventing certificates or adding more sections.

## M. Risks

Credential documents may contain information the owner does not intend to publish. Redact only with approval; do not claim verification from a preview. Dynamic loading must preserve accessible dialog focus.

## N. Recommendation

Improve content when real records exist. Keep sample disclosure until replacement. Optional suppression of empty tab requires owner approval; not a performance emergency.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
