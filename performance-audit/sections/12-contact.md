# Contact and private-message form

Type: Top-level section. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Offer contact details and a private inquiry flow, with a separate public visitor composer below.

## B. Source architecture

[`src/sections/components/contact/ContactSection.tsx:14`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/contact/ContactSection.tsx#L14); `ContactProfile.tsx`, `ContactForm.tsx`, `FormParts.tsx`, `config.ts`, `services/backend.ts`, `ContactSection.css`; private server handler in `supabase/functions/submit-private-message/index.ts`.

## C. Technology

React local form/backend state, field refs and labeled inputs; Turnstile component in gated live mode; dynamic backend adapter; typed errors and separate private/public storage behavior.

## D. Initialization

Contact mounts with the shell and immediately loads its backend, even below the fold. Default local build chooses preview. Live build uses the Supabase adapter and its guarded session flow. A failed load remains an error with Retry, never silently becomes preview.

## E. Loading

Contact portrait is 1,853,228 bytes and marked lazy. Shared form icon/CSS code is initial. Turnstile is only relevant when the live form requires it and a site key exists; hosted setup was not verified.

## F. Rendering and updates

Controlled form values/errors/busy state update on editing/submission. Errors use aria-invalid/descriptions and focus the first failed field. Preview private submission reports not connected; it does not publish to the wall or store private correspondence.

## G. Animation

Glass cards, avatar ring and CSS decoration; no dedicated Contact WebGL context. Global background remains visible beneath the section.

## H. Network

Default audit build makes no Supabase calls. Live private action would invoke submit-private-message after Auth/Turnstile validation; server reception is gated separately. GitHub is the only configured direct public social link; email and phone are null.

## I. Performance

Large portrait is a below-fold image opportunity, but not an initial request in the representative Hero trace. Backend startup/polling begins before visibility in live architecture. Quantifying hosted SDK/download/API cost is outside this preview measurement.

## J. Timing and readiness

Initial Contact DOM observed with About; functional scroll capture found form/labels. Existing browser tests validate preview behavior and mocked live state. No real message or email/Telegram notification was sent in this audit.

## K. Problems

Hero Contact Me does not navigate here. Local private form is unavailable by design; no independently verified public email means direct contact is weak. Live release status must be checked separately instead of assuming preview unavailability proves production failure.

## L. Potential fixes

Wire a real contact destination from Hero, publish an owner-approved address or validate hosted delivery, maintain clear unavailable/error states. Consider near-view backend initialization with reliable hash focus and retry behavior. Evaluate smaller pixel-equivalent portrait delivery.

## M. Risks

Lazy backend setup may delay first form input/verification. Client feature flags are not security boundaries. Changing CORS, database grants or delivery configuration requires a separate implementation task and verification.

## N. Recommendation

Improve contact conversion, high priority. Keep validation and privacy separation. Investigate Further live delivery; no backend changes were made.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
