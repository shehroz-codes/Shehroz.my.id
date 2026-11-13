# Supabase visitor wall review — 2026-11-13

## 1. Executive summary — COMPLETE implementation; NEEDS TESTING activation

The existing Contact layout is preserved. Supabase is an opt-in visitor wall
provider; preview and Firebase remain available. Production builds remain in
preview with submissions disabled. No database changes, secret changes, Edge
deployments, merges, or production posts were performed.

## 2. GitHub inspection — COMPLETE

Verified `shehroz-codes/Shehroz.my.id`, default branch `main`, with push/admin
permissions. Fetched current main at `ce56a4d` before branching to
`feature/supabase-visitor-wall-integration`. Contact files live under
`src/sections/components/contact/`, including the composer, wall, private form,
configuration, types, and preview/Firebase adapters. `src/lib/firebase.ts` remains
unchanged. No test command existed. React 19, Vite, Tailwind v4 and the Pages
base `/Shehroz.my.id/` are retained. The existing workflow deploys only main pushes.

## 3. Supabase connection — COMPLETE

Connector verified project `lctzkigzaudjiotopzye`, named `shehroz-codes's Project`,
organization `Shehroz Development`, region `ap-south-1`, status `ACTIVE_HEALTHY`,
Postgres 17.11. A usable publishable key exists; its value is not committed.

## 4. Database/RLS audit — COMPLETE inspection; SECURITY ISSUE advisor review

- `visitor_messages`: UUID id, name/text checks (1–80/1–300), country fields,
  photo flag/path, status, demo flag, timestamp, visitor UUID. No messages existed
  at inspection. Public SELECT policy requires published and non-demo records.
- Public column grants exclude `photo_path` and `visitor_id`; the adapter explicitly
  selects only id/name/text/country/timestamp. Browser roles have no message writes.
- `portfolio_admins`: user_id/timestamp, RLS permits only the user's own record
  with a non-anonymous JWT. One admin record existed; identities were not read.
  Authorization uses a protected membership table, not editable user metadata.
- `visitor_cooldowns`: user_id/timestamp, RLS enabled and no client policies or
  grants. The advisor's no-policy INFO is intentional deny-by-default behavior.
- All three public tables and `storage.objects` have RLS enabled. No Storage
  object policies exist, so broad base role grants do not permit client access.
- `publish_visitor_message(uuid,text,text,text)` and `claim_visitor_slot(uuid)`
  are SECURITY DEFINER with empty search paths, executable only by postgres and
  service_role. Neither anon nor authenticated can invoke them.
- Publishing validates identity/input/path prefix and uses an atomic conditional
  UPSERT on the user-keyed cooldown, followed by message insertion in the same
  transaction. Failed insertion rolls back the cooldown. The window is 10 minutes.
- Advisor WARN: `rls_auto_enable()` inherits PUBLIC execute. It is an event-trigger
  function with fixed `pg_catalog` search_path; this warning does not prove it can
  be exploited as a normal RPC. A narrow hardening proposal is below.
- Advisor WARN: leaked password protection disabled; relevant to permanent/admin
  password accounts. Review in Auth settings.

Advisor references: [public definer permissions](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable),
[signed-in definer permissions](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable),
[password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection),
[no-policy INFO](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

### Proposed migration — NEEDS TESTING; not applied

```sql
begin;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
commit;
```

Review/test this in a disposable database: confirm event-trigger auto-RLS behavior
is preserved and both browser roles lose execute. No tables, rows, policies, or
existing publication RPCs are replaced. A formal CLI migration file was blocked:
the current CLI tried to create a read-only home configuration directory, and
the older CLI's postinstall failed. Generate it with `supabase migration new
harden_rls_auto_enable_execute` in a configured environment, then insert this SQL.

## 5. Edge Function — COMPLETE source inspection; NEEDS TESTING HTTP

Verified active `submit-visitor-message`, version 3, `verify_jwt=true`, using
`withSupabase({auth:'user'})`. Multipart fields are exactly `name`, `text`, optional
`photo`, and `turnstile_token`; unknown/duplicate fields are rejected. Success is
HTTP 201 `{success:true,message_id:<uuid>}`. Cooldown is HTTP 429 with
`code:'COOLDOWN'`. Error text uses `error`, not the Firebase response contract.

The handler enforces its independent `VISITOR_SUBMISSIONS_ENABLED` gate, input
normalization/control-character checks, 100 KB request limit, WebP-only photos
of at most 60 KiB and 256×256 header dimensions, user authentication, Cloudflare
Siteverify with a six-second timeout, and privileged atomic publishing. Failed
publishing attempts trigger best-effort photo cleanup. No country input is accepted.

The deployed source lacks an explicit CORS origin setting. Inspection of the
current `@supabase/server` 1.9.2 package confirms its default CORS handling; a local
copy now pins that version and sets the exact Pages origin, POST/OPTIONS and SDK
request headers. This patch is review-only and has not been deployed. Origins
are not authentication; the user JWT and server authorization remain required.
Keep the deployed JWT flag unchanged until staging verifies the SDK/gateway pair.

## 6. Created files

- `src/lib/supabase.ts`: lazy public client and session lifecycle.
- `src/sections/components/contact/services/supabaseBackend.ts`: compatible adapter.
- `supabase/functions/submit-visitor-message/index.ts`: version-3 source with only
  pinned SDK and exact-origin CORS changes, not deployed.
- `vitest.config.ts`, `playwright.config.ts`, `tests/supabaseBackend.test.ts`,
  `tests/VisitorComposer.test.tsx`, `tests/browser/contact.spec.ts`.
- This review report.

## 7. Modified files

`.env.example`, `.gitignore`, `.github/workflows/deploy.yml`, `package.json`,
`package-lock.json`, and Contact's `VisitorComposer.tsx`, `config.ts`, `env.d.ts`,
`types.ts`, `services/backend.ts`, `services/previewBackend.ts`.
No unrelated section, style, animation, Firebase implementation, private form,
or wall rendering implementation was changed.

## 8. Dependencies — COMPLETE

Runtime pinned: `@supabase/supabase-js@2.119.0`,
`@marsidev/react-turnstile@1.6.3`. Test-only pinned: Vitest, Testing Library React,
jsdom, Playwright Test; exact versions and dependency resolution in the lockfile.
The Edge source pins `@supabase/server@1.9.2` through its Deno import.

## 9. Frontend — COMPLETE text integration; NEEDS TESTING live

Choose `VITE_CONTACT_MODE=live` and `VITE_CONTACT_BACKEND=supabase` only for reviewed
testing. Missing/incorrect configuration fails visibly; there is no mock fallback.
The singleton persists visitor sessions under a dedicated storage key and uses
SDK refresh. Expired-session refresh failures do not silently create a replacement
identity. Parallel same-client authentication and submissions are guarded.
Public reads use bounded pagination, stable ordering, 30-second polling and
post-submit refresh, avoiding unverified Realtime setup. No direct browser writes.
Private messages still use Firebase's existing `/submitContact` service; Supabase
does not receive correspondence. That Firebase endpoint needs its own configuration.

## 10. Turnstile — COMPLETE frontend; NEEDS CONFIGURATION / TESTING

Managed widget with expiry/error handling, a fresh token requirement and reset
after each submission attempt. On a first visit Auth may consume the token when
creating the anonymous user; the draft stays intact and asks for fresh verification
before publishing. The same single-use token is never sent to both services.
Existing server verification rejects missing/invalid/expired/replayed tokens via
Siteverify. Real token behavior has not been tested. Secret presence could not be
verified: available connector tools do not expose Edge secret metadata. The server
checks for the secret and fails closed; this is not proof that it is configured.

## 11. Visitor photos — BLOCKED secure delivery

`visitor-photos-private` is private, capped at 61,440 bytes, allows only image/webp,
and has no client object policies. The server uploads with privileged credentials;
the browser never uploads directly or obtains private paths. No signed delivery
function was found. Live photo selection/submission is therefore explicitly
disabled, and the existing initials avatar remains. JPEG/PNG/WebP local previews
are preserved. Live image processing/upload/display is not claimed complete.
Before enabling photos, implement authorized delivery without exposing object
paths and add a JPEG/PNG/WebP-to-WebP processor capped at 256×256 and 60 KiB.
Server validation currently checks container/header dimensions, not a full safe
image decode/re-encode; review that before enabling uploads.

## 12. Tests — COMPLETE automated checks

- Clean `npm ci`, TypeScript and production build passed. Existing large-chunk
  warning remains; no build failure.
- 26 Vitest tests passed: session reuse/refresh/failure/concurrency, safety switch,
  input rejection, exact multipart/JWT contract, token non-reuse, duplicate writes,
  cooldown/error responses, safe reads, cleanup and no fallback; component tests
  cover CAPTCHA expiry/error/reset, draft preservation, gate and preview validation.
  Backend and CAPTCHA dependencies are mocked; these are not live cloud tests.
- Two real Chromium browser checks passed at 390px and 1440px: local posting,
  persistence after reload, cooldown, no horizontal overflow, no page errors and
  no Supabase/Firebase/Turnstile requests in preview. Initial test selector failures
  were corrected; final checks pass. Screenshots are task-local under `/tmp`.
- Live connector reads verified schema, grants, RLS, function source and advisors.
  A read-only SELECT under database role anon succeeded with an empty feed.
  Permission introspection confirms denial of private columns and publishing RPCs;
  these checks are not adversarial HTTP/RLS integration tests with seeded records.

Run `npm test`; install a Playwright Chromium or set `CHROMIUM_PATH` and run
`npm run test:browser`. This task used `/usr/bin/chromium`.

## 13. Live tests still required — NEEDS TESTING

In a disposable/staging setup, test anonymous creation and refresh across reloads,
Auth CAPTCHA, gateway JWT handling, exact-origin preflight and error CORS, valid
and missing/expired/replayed Turnstile tokens, concurrent same-user cooldown,
atomic rollback, unauthorized table/RPC/admin/Storage access and hidden/demo rows.
After photo implementation, test upload limits, malicious containers, delivery
authorization/expiry and fallback. Do not generate production test posts or
enable the production switch just to test. No successful live submission is claimed.

## 14. Remaining risks — SECURITY ISSUE / BLOCKED

Direct HTTP to `lctzkigzaudjiotopzye.supabase.co` and the Supabase changelog was
denied by the environment proxy (403); current product docs were consulted through
Supabase search_docs instead. SDK/gateway runtime compatibility needs live testing.
Anonymous Auth configuration, rate-limit settings, secret existence, and the
current server-switch value cannot be verified through available tools. No values
were changed. User-keyed cooldown does not prevent identity churn; review Auth
CAPTCHA/rate limits and broader abuse controls. Review advisor findings and photo
parser/delivery gaps. Siteverify checks success but does not bind an expected
hostname/action in handler code; verify Cloudflare hostname settings and consider
binding those fields server-side before activation.

## 15. Required actions — NEEDS CONFIGURATION

1. Review the PR, CORS patch, proposed permission migration, Auth advisors and
   privacy/delivery design. Keep server `VISITOR_SUBMISSIONS_ENABLED` disabled.
2. Confirm anonymous Auth, Auth CAPTCHA/rate limits, Edge secret presence by name
   only, server-switch value, and Pages hostname in Turnstile. Never paste secrets
   into chat or put them in `VITE_*` variables.
3. Set GitHub repository variables `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_TURNSTILE_SITE_KEY`. `.env.local` remains
   ignored. Workflow currently forces preview and frontend submissions false.
4. Permit required Supabase and documentation hosts in environment network
   settings for direct live tests. No network configuration was changed here.
5. Complete staging tests and secure photos; separately review/authorize backend
   deployment, migration application and production activation. This PR does not
   merge or deploy any of them automatically.

## 16. Pull request

The final task reply links the draft PR against main on the dedicated feature
branch. Review blockers above before merge; pushing this branch cannot trigger
the existing main-only Pages deployment.
