# Contact section — final three fixes

Implemented on **`fix/contact-final-three`**, based on current remote main **`0f85121976961d705774249a0aea1b80a6dba214`**, in `/workspace/Shehroz-contact-final`.

**Release validation: 17 November 2026 (Pakistan time). Production activation blocked.** The approved implementation passed the fresh checks below. Production HTTP access is denied by this environment's enforced network proxy, so the hosted IP-header trust boundary and runtime configuration cannot yet be verified. No main merge, hosted migration, Edge deployment, Auth-setting change or production submission was performed. The separate performance worktree is preserved: its tracked diff and all 32 pending files match the recovery snapshot byte for byte. The validated feature branch can be committed/pushed independently of production activation; use Git history for its exact commit and publication status.

| Requested change | Implemented result |
|---|---|
| Remove public CAPTCHA | Public UI has no Turnstile import/widget, verification control, token, session-preparation step or verification wait. Public API no longer checks CAPTCHA or requires a user JWT/Auth account. The site's existing publishable key is validated automatically. Private form logic, Auth client, private Edge handler and shared CAPTCHA verifier remain unchanged. |
| Restore automatic country | Reused the existing `Backend.detectCountry()` interface. The old Firebase adapter had a country endpoint, but Supabase detection was a null stub and its publish RPC omitted country columns. A new server endpoint resolves country from the hosted platform's client IP; publication resolves it again for that request and saves the existing `country_code`/`country_name` fields atomically. Flags/names appear beneath message text. No manual selector, GPS request or location permission. Lookup failure leaves country null and still permits posting. |
| Compact, aligned layout | Existing Profile → private Contact column and Public Message → Visitor Messages column retained. Natural grid rows align desktop bottoms; unnecessary country/verification space removed. Message lists scroll internally, retain full text, keyboard access and Load More, and do not grow the columns as more messages load. Mobile stacking remains intact. |

The existing private widget's 300px logical viewport caused narrow-phone overflow. Contact-only CSS now scales its host to fit below 300px of available form width, without clipping its iframe or changing its options, callbacks, CAPTCHA validation or authentication.

## Public security and privacy

- Public posts use a separate, **service-role-only** database operation; no Auth user/session is minted to bypass global CAPTCHA. Existing private Auth/CAPTCHA requirements and JWT gateway remain enabled.
- Database-enforced **ten-minute device and network cooldowns**, plus **30 submission attempts/hour/network**. Rotating the browser's anonymous device ID cannot bypass the network cooldown. Country previews have a separate 120-request/hour/network quota. Concurrent public submissions produce one commit and one cooldown rejection.
- Retained exact-origin CORS, server write gate, honeypot, name/text validation, body limits, processed-photo limits/real decoding, private photo storage and publication-dependent photo delivery. Browser roles cannot write messages or call the new privileged RPCs.
- The implementation relies on hosted ingress overwriting `CF-Connecting-IP`. `X-Forwarded-For`, country headers and client country fields are ignored/rejected. The header follows [Supabase's documented platform IP header](https://supabase.com/docs/guides/api/query-plans), but the overwrite guarantee has **not been verified against this project's live endpoint**. That verification is a release gate; self-hosted proxies would need the same guarantee.
- Server-side HTTPS lookup uses `ipapi.co` with a two-second timeout, canonical country names and a bounded country cache. The observed address is transiently processed by that provider; it is not returned to the browser, logged by this code or stored in the database. Database quota identities are domain-separated HMACs using the existing server secret.
- Historical messages, Auth foreign keys, old RPCs, private tables and existing RLS/grants are not rewritten. New anonymous messages use a null Auth visitor reference, with independent public cooldown records.

Visitors sharing an exit IP share its ten-minute public cooldown. Rotating the server secret changes public identity hashes and resets those quota windows; stored messages remain intact. These are operational consequences of CAPTCHA-free anonymous posting.

## Verification

| Check | Result / boundary |
|---|---|
| Frontend TypeScript and production build | PASS on the release rerun, including an additional build with production feature flags and test-only public keys; existing large-chunk advisory remains |
| Edge TypeScript | PASS with installed package types and a temporary declaration for the two Deno APIs used; not a hosted runtime test |
| Unit/security tests | **104 passed, 13 files**. Real SDK publishable-key checks, genuine signed/expired/tampered JWT checks for private contact, private CAPTCHA requirement, public no-CAPTCHA/Auth calls, forged-country rejection, optional lookup failure, body/photo validation and cleanup |
| Disposable PostgreSQL migration/security suite | PASS: RLS/ACL restrictions, old private protections, device/network cooldowns, quota exhaustion, country persistence, concurrent public posting and persistence across separate connections |
| New contact browser checks | **6/6 passed in one fresh release run**: four responsive/accessibility/layout cases, public post + refresh + private verification, and optional-country failure. All remote services/CAPTCHA are mocked |
| Existing contact browser checks | **8/8 passed in one fresh release run**; includes preview/photo behavior, safe public reads, disabled-write protection and failure recovery |
| Live read-only inspection | Confirmed service-role insertion permission and denial of anonymous direct insert/RPC execution; no hosted data or schema changed |
| Real VPN / new hosted submissions | **Blocked, not tested:** deployment is approved, but the environment proxy denies both production domains and the Supabase API (CONNECT 403). Shared-browser creation also failed. Existing production behavior is unchanged. Simulated changed exit-IP metadata selected Netherlands for the publish call rather than a spoofed US header; separate local PostgreSQL tests verified country persistence |

Country selection is based on the connection observed by the server, so a VPN exit country is used when the lookup provider identifies it. It is approximate country inference, not a GPS or physical-location guarantee. A stale form preview is never trusted as the saved country.

Screenshots use synthetic messages and a mocked **private** CAPTCHA placeholder, with reduced motion for inspection:

- [Desktop — 1440px](artifacts/contact-final/contact-1440.png)
- [Tablet — 768px](artifacts/contact-final/contact-768.png)
- [Mobile — 390px](artifacts/contact-final/contact-390.png)
- [Narrow mobile — 320px](artifacts/contact-final/contact-320.png)

All four layouts passed accessibility checks, zero horizontal overflow, full-message text, keyboard internal scrolling and pagination. Desktop column bottoms matched within one pixel; loading five more messages did not increase column height beyond two pixels. Original colors, borders and unrelated sections are unchanged.

An existing, unrelated Supabase advisor warning remains: [leaked-password protection disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Auth settings were deliberately left unchanged. Service-only cooldown/cleanup tables intentionally have RLS without browser policies.

## Exact files changed

Frontend:
`src/sections/components/contact/ContactSection.css`, `VisitorComposer.tsx`, `VisitorWall.tsx`, `types.ts`, and `services/supabaseBackend.ts` (all under that contact directory).

Backend:
`supabase/config.toml`; `supabase/functions/submit-visitor-message/index.ts`; `supabase/functions/visitor-country/index.ts`; `supabase/functions/_shared/public-visitor.ts`; `supabase/migrations/20261117044813_public_message_no_captcha_country.sql`.

Tests:
`scripts/test-database.sh`; `playwright.contact-final.config.ts`; `tests/VisitorComposer.test.tsx`; `tests/edgeFunction.test.ts`; `tests/privateContactAuth.test.ts`; `tests/supabaseBackend.test.ts`; `tests/sql/public_contact.sql`; `tests/browser/contact-final.spec.ts`; `tests/browser/live-readonly.spec.ts`.

This report and `artifacts/contact-final/` contain results/screenshots. The committed path inventory is [changed-files.txt](artifacts/contact-final/changed-files.txt); final evidence is indexed in [validation-summary.json](artifacts/contact-final/validation-summary.json). Earlier raw browser JSON files are retained locally, outside the release commit. Recovery bundle, performance-worktree snapshot and contact pre-release patch/untracked archive are under `/workspace/recovery/contact-final-20261117/`.

## Production release gate and observed versions

| Production item | Observed status; unchanged by this release attempt |
|---|---|
| Remote `main` | `0f85121976961d705774249a0aea1b80a6dba214` |
| Existing GitHub Pages workflow | [Run 43889388155](https://github.com/shehroz-codes/Shehroz.my.id/actions/runs/43889388155), successful, for that baseline commit; **not a deployment of these fixes** |
| `submit-visitor-message` | ACTIVE v11, JWT gateway enabled; existing CAPTCHA backend still serves production |
| `submit-private-message` | ACTIVE v4, JWT gateway enabled; untouched |
| `visitor-photo` / moderation | ACTIVE v4 / v4; untouched |
| `visitor-country` / new migration | Absent from production; no activation attempted |

Required next: permit outbound access to `shehroz.my.id`, `shehroz-codes.github.io` and `lctzkigzaudjiotopzye.supabase.co`. The environment reports restricted networking with no custom allowed hosts. This is an environment-access blocker, not evidence that either site is down or that a code security test failed.

Before public activation, verify that hosted ingress overwrites forged `CF-Connecting-IP` and ignores forwarded/country overrides, and that the existing server-side `SUPABASE_SECRET_KEYS.default` HMAC configuration is usable. Its presence/shape has not been proven live; no credential value was read or exposed. Then perform the coordinated additive migration + two public-function + frontend release, verifying ACLs, controlled public posting/refresh/country and real private CAPTCHA/delivery. Private/moderation JWT gates must remain enabled. Test a real VPN only if one is available. Do not merge the frontend alone against the existing CAPTCHA-requiring backend. **The main merge and all production mutations remain stopped pending these checks.**
