# Visitor Wall and public composer

Type: Contact subsection. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Display published visitor notes and, when enabled, allow controlled public messages with optional photos.

## B. Source architecture

[`src/sections/components/contact/VisitorWall.tsx:36`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/contact/VisitorWall.tsx#L36); `VisitorComposer.tsx`, `useCooldown.ts`, `services/supabaseBackend.ts`, `previewBackend.ts`, `storage.ts`, `photo.ts`; public/photo/owner Supabase handlers and migrations.

## C. Technology

React feed/loading/error/pagination state; sessionStorage drafts, preview localStorage and cooldown storage; browser image decode/canvas WebP encoding; Supabase reads, Auth session and guarded Edge Function writes in live mode.

## D. Initialization

Once backend resolves, VisitorWall subscribes with pageSize=5 and refreshes on retry/limit changes. Preview reads local records; live starts a GET immediately and polls every 30 seconds. No Realtime websocket is used.

## E. Loading

Text page includes five rows plus one for hasMore. Optional photos are lazy images served through a public read function; initials fallback handles failed images. User-selected photos are cropped/encoded to 160×160 and <=60 kB on submission.

## F. Rendering and updates

Updates come from adapter subscription, retry, Load More, cooldown and drafts. Local typing suggestions debounce. Live drafts stay editable while posting is disabled. Submission never automatically retries an uncertain write.

## G. Animation

CSS feed/composer styling and status indicators; no dedicated GPU renderer. Pagination can increase DOM indefinitely by five rows at a time; realistic feed sizes should be tested before adding virtualization.

## H. Network

Live select uses only explicit public columns and published/non-demo filters, orders created_at/id descending and aborts after 15 s. Photo endpoint revalidates membership and uses no-store. Public writes, Auth and Turnstile are distinct requests and were not executed live.

## I. Performance

A 30-second polling timer runs even when this section is not visible; potential battery/network waste depends on session duration and live usage, not measured in the preview build. Do not cache private/publication-sensitive photo responses indiscriminately.

## J. Timing and readiness

Local empty feed and composer rendered on desktop/mobile. Existing tests cover mocked published feed, disabled writes, injection escaping and error retry; those are not proof of hosted publishing. No wall network-read latency is claimed from preview.

## K. Problems

Production state is unverified. Polling need not be replaced with Realtime just to sound modern. An empty visitor wall is weaker hiring evidence than a case study and should not dominate the contact task.

## L. Potential fixes

Pause polling while hidden/offscreen and refresh on return with the existing cancellation semantics; retain explicit errors and page bounds. Verify hosted read-only behavior later without posting; request separate authorization for any end-to-end write test.

## M. Risks

Over-aggressive cache or refresh suppression could show moderated/deleted content too long. Preserve RLS, column grants, server CAPTCHA/auth, cooldown, thumbnail validation and no-retry write handling. Never replay historical migrations blindly.

## N. Recommendation

Keep safety boundaries and read-only release gates. Optimize Internally visibility-aware polling after tests. Investigate Further hosted integration; no schema or settings change.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
