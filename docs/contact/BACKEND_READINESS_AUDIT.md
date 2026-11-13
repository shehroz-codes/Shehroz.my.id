# Portfolio backend audit and activation preparation

Audit date: 13 November 2026 (Asia/Karachi). Repository baseline:
`main` at `f5c22c9`; review branch `feature/backend-readiness-audit`.
This is the current report; the PR #23 report is historical.

## A. Executive summary — BLOCKED

The frontend is functional in preview and in live read-only mode. Safe code fixes
and production patches are prepared, with tests, in a separate PR. Public message
submission must remain disabled. No production data/schema, policies, grants, secrets,
Edge Functions, signing keys, switches, merges or deployments were changed.

Two confirmed backend problems prevent activation:

1. Live browser roles have gained table-wide SELECT/INSERT/UPDATE/DELETE on
   `visitor_messages`. RLS still denies writes, but published rows now expose
   `photo_path` and `visitor_id` to arbitrary API clients. The adapter's safe
   projection does not protect against another client querying those columns.
   The table had zero rows at inspection; no private values were retrieved.
2. The deployed handler reads `ctx.userClaims.sub`. The actual server SDK 1.9.2
   normalizes the subject to `ctx.userClaims.id`. Executable tests reproduced a
   valid signed user being rejected as `Invalid user`, then passed with the fix.

The deployed function also lacks the repository's exact-origin CORS configuration.
Real Auth, CAPTCHA and gateway behavior remain NOT VERIFIED because the execution
network denies the project endpoint. Account/dashboard settings require one review.

### Current control values and data flow

| Control | Repository/current evidence | Effect |
| --- | --- | --- |
| `VITE_CONTACT_MODE` | Default preview; Pages workflow explicitly `live` | Production build requests the real public feed |
| `VITE_CONTACT_BACKEND` | Pages workflow `supabase`; code defaults Firebase otherwise | Chooses the public wall adapter in live mode |
| `VITE_VISITOR_SUBMISSIONS_ENABLED` | Pages workflow explicitly `'false'`; default false | Composer and adapter reject public writes |
| `VISITOR_SUBMISSIONS_ENABLED` | Server environment value NOT VERIFIED; handler requires exact `'true'` | Independent authoritative server gate |
| Photos | Adapter `photosEnabled:false`; proposed server `PHOTOS_ENABLED=false` | Keep photos disabled for text-only launch |
| Country | Supabase adapter returns no country | No false location inference |
| Public build variables | Workflow maps three repository variables; actual values/presence NOT VERIFIED | URL, publishable key and Turnstile site key |
| Private contact | Existing Firebase adapter only | Never sends correspondence to the public wall |

Flow: composer validates and normalizes name/text; managed Turnstile provides a
token; the client reuses/refreshes a persisted visitor session or calls anonymous
Auth. A token used to create the session is treated as consumed; the draft remains
and a fresh verification is requested before publishing. A user JWT goes in
`Authorization`, the publishable key in `apikey`, and multipart `name`, `text`,
`turnstile_token` goes to the Edge Function. The handler authenticates, checks its
server gate, validates input, calls Siteverify, then calls the service-only atomic
publishing RPC. The wall selects explicit public columns, filters published/non-demo
rows, orders by timestamp/id, and polls every 30 seconds. Writes are never retried
automatically and live failures never become preview success.

### Live database and Storage findings

Connector verified project `lctzkigzaudjiotopzye`, organization Shehroz Development,
healthy Postgres 17, and active Edge Function version 4 with `verify_jwt=true`.
The deployed source imports unpinned `npm:@supabase/server@1`; the proposed file
pins 1.9.2. Repository source and deployment are not assumed to match.

- All three public tables and `storage.objects` have RLS enabled. The SELECT
  policy permits only `status='published' AND is_demo=false`. There is no separate
  approval queue: successful submissions are immediately published by the RPC.
- No message write policies exist. Broad DML grants are unnecessary exposure,
  but they do not currently bypass RLS. The review-only migration restores only
  intended column-level reads and removes independent column grants as well.
- `portfolio_admins` permits a permanent authenticated user to read only their
  own membership. Anonymous users share the authenticated database role but are
  explicitly excluded through the non-editable JWT `is_anonymous` claim.
- Cooldown rows have neither browser read grants nor policies. Both publishing
  and slot-claiming SECURITY DEFINER RPCs use empty search paths and are executable
  only by postgres/service_role. Their authorization does not use editable metadata.
- Publishing uses a conditional user-keyed UPSERT and message insert in one
  transaction. Local tests verify the 10-minute cooldown, concurrent requests and
  rollback. Clearing storage/new identities can bypass a per-user cooldown;
  CAPTCHA and Auth rate limits are also necessary. Content moderation is not implemented.
- The bucket is private, WebP-only and capped at 61,440 bytes; no object policies
  allow browser reads or writes. A private path being readable does not itself
  make a private object downloadable, but those paths must still be protected.
- No trusted photo delivery mechanism exists. The patch adds an explicit server
  photo gate so bypassing the browser cannot upload invisible photos. Photo
  processing/delivery is deferred; it is not required for a text-only launch.
- Advisors still warn about PUBLIC execute on the event-trigger function
  `rls_auto_enable()` and disabled leaked-password protection. The migration
  revokes execute without changing the trigger implementation. Local testing
  confirms automatic RLS on new tables still works. Cooldown's no-policy INFO is
  intentional. Password protection is an admin-account hardening item, not proof
  of a public-wall exploit.

Advisor references: [anon definer permissions](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable),
[authenticated definer permissions](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable),
[password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

### JWT compatibility: evidence and limits

The actual `@supabase/server@1.9.2` verifies test ES256 JWTs against a generated
local JWKS. Missing, malformed, expired and incorrectly signed credentials fail;
a publishable key used as a bearer token fails. The correct request has a USER
JWT in Authorization and a publishable key in apikey. This combination is not
inherently incompatible with an enabled gateway JWT check.

The selected SDK rejects legacy JWTs without `kid`; this was tested, not inferred.
The production signing algorithm/JWKS and the hosted gateway were NOT VERIFIED.
Current [authorization-header docs](https://supabase.com/docs/guides/functions/auth-headers)
describe gateway support for signed user JWTs, including asymmetric keys; the
[migration guide](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
recommends delegating verification to the server SDK. These do not establish the
behavior of this deployment. Keep `verify_jwt=true`; verify the actual gateway
with the project's real user token before activation. If it rejects valid tokens,
stop for a separate configuration review rather than disabling authentication.

## B. Automated and live checks

| Check | Result | Evidence / limit |
| --- | --- | --- |
| Clean dependency installation | PASS | `npm ci` completed; exact test dependency versions and lockfile committed |
| Application TypeScript | PASS | `npm run typecheck`; production build also runs this |
| ESLint | NOT VERIFIED | No ESLint dependency, config or lint script exists; `npm run lint` reports missing script |
| Production build | PASS | Vite build succeeds; existing large-chunk warning remains |
| Existing and added unit/component/adapter tests | PASS | 54 Vitest tests |
| Real SDK anonymous Auth API/persistence | PASS, isolated | Actual supabase-js, mocked HTTP, persisted identity survives a second client; no production user created |
| Session refresh/failure/concurrency | PASS, isolated | Reuse, refresh failure and deduplicated sign-in covered |
| CAPTCHA lifecycle and failures | PASS, isolated | Expiry/error/reset, consumed-token non-reuse, missing/invalid token, hostname/action mismatch |
| Edge authentication | PASS, isolated | Actual server SDK and real ES256 signatures; no mocked auth gate |
| Edge validation and API failures | PASS, isolated | Unknown/duplicate fields, limits, server gate, photo gate, bounded body, cooldown and sanitized errors |
| Private form validation/duplicates | PASS, isolated | Invalid drafts never sent; repeated submit events deduplicated; failed draft retained |
| Public preview persistence/cooldown | PASS, browser | Local browser posts survive reload and controls honor cooldown |
| Desktop/mobile browser checks | PASS | Five Chromium cases, 390px/1440px; live API responses mocked |
| Disabled live submissions / no fallback | PASS, browser | DOM button enabling cannot activate writes; 403 stays an error |
| XSS rendering | PASS, browser | HTML-like message rendered as text |
| Basic Contact accessibility | PASS | axe WCAG 2 A/AA and 2.1 AA scan at both widths; zero violations; not a complete accessibility certification |
| Responsive layout | PASS, browser | No horizontal overflow at both widths |
| Grant migration baseline regression | PASS, local PostgreSQL | Test intentionally fails before migration on readable private columns |
| Grant migration / RLS / private Storage | PASS, local PostgreSQL | After patch, private columns/direct inserts denied; hidden/demo rows filtered; object reads blocked |
| Anonymous admin isolation | PASS, local PostgreSQL | Even matching an admin UUID cannot expose membership with anonymous claim |
| Atomic publishing / cooldown | PASS, local PostgreSQL | Live RPC catalog snapshot, duplicate/concurrent requests, forced insert failure rolls back cooldown |
| Event trigger after permission revocation | PASS, local PostgreSQL | New table receives RLS automatically |
| Connected project/schema/deployment metadata | PASS, live read-only | Supabase connector confirms project, columns, grants, policies, bucket, RPCs and version 4 |
| Public SELECT as anon | PASS, live database | Read-only role query succeeds; empty feed. This is not a Data API HTTP test |
| Live private-column confidentiality | FAIL | Both browser roles currently have SELECT on photo_path/visitor_id; review-only migration fixes this locally |
| Live Auth / token refresh | NOT VERIFIED | Network denies project endpoint; no production Auth writes authorized |
| Live Turnstile validity/replay | NOT VERIFIED | Site key/account settings and real Siteverify execution unavailable |
| Live gateway JWT / preflight CORS | NOT VERIFIED | Actual project HTTP blocked; repository patch tested locally only |
| Live Storage HTTP authorization | NOT VERIFIED | Bucket/policies inspected; no hosted object request performed |
| GitHub variable presence / latest Pages run | NOT VERIFIED | GitHub CLI API request denied; connector cannot list these settings. User reports successful deployment |
| Production Edge deployment / Deno runtime | NOT VERIFIED | Local Node handler tests are not a Deno deployment or hosted bundling test |

Early server test failures reproduced the real `.sub` bug; the local patch fixes
it. Early browser timing failures were fixed by waiting for the intercepted feed
response and scrolling the Contact section into view. They were test synchronization
issues; no layout/style changes were needed. Final results above describe passing
checks, not those exploratory failures. Disposable databases are removed by the
runner; no production fixtures were inserted.

## C. Issues fixed and reviewable patches

| Files | Change and reason | Test evidence |
| --- | --- | --- |
| `supabase/functions/submit-visitor-message/index.ts` | Use verified `userClaims.id`; require authenticated role, exact UUID, issuer/audience; bind CAPTCHA hostname/action; retain exact Pages CORS and add current SDK headers; suppress SDK diagnostic detail; disable photos server-side | Actual-SDK/signed-JWT handler tests, including valid request reaching one publishing RPC |
| `supabase/migrations/20261113132516_restore_visitor_message_least_privilege.sql` | Restore intended public-column SELECT, remove table and independent column writes/reads, revoke event-trigger execute | Disposable PostgreSQL regression, grants/RLS/Storage, trigger tests; NOT applied to production |
| `VisitorComposer.tsx` | Match the server's UTF-16 length units in counter/suggestions/input cap; add `visitor-message` CAPTCHA action | Emoji limit and CAPTCHA component tests |
| `ContactForm.tsx` | Synchronous in-flight guard prevents duplicate events before React state rerenders | Repeated-submit/draft-preservation test |
| `tests/edgeFunction.test.ts`, `tests/supabaseClient.test.ts`, `tests/ContactForm.test.tsx`, existing composer tests | Cover actual SDK behavior and critical previously mocked paths | 54 tests total |
| `tests/browser/*`, `playwright.config.ts` | Explicit preview/live-disabled test servers, mocked cloud reads, desktop/mobile, private validation, XSS, accessibility | Five Chromium cases |
| `tests/sql/*`, `scripts/test-database.sh`, package test command | Reproducible local Postgres 17 fixture, live RPC/trigger catalog snapshots and concurrent tests; local socket only, no hosted URL accepted | `npm run test:database` |
| `.github/workflows/checks.yml` | PR-only validation for tests/build/disposable SQL/browser checks; no deployment or production credentials | Commands executed locally; hosted CI result must be read on PR |
| `.github/workflows/deploy.yml` | Correct stale preview comment; retain live reads and submissions false | Inspected workflow diff; switch unchanged |
| package/lock, Vitest config, gitignore, documentation | Pin test-only server SDK/jose/axe, map Deno import for isolated tests, ignore CLI cache, mark historical report | Clean installation/build and git diff checks |

No unrelated component, style, theme, animation or content changes. Firebase SDK,
configuration and adapter implementations remain intact. No actual frontend
service-role/private key was found in the inspected frontend source. Test fixtures
use clearly fake keys and never enter the Vite application bundle.

## D. Remaining activation blockers

1. **Grant exposure:** explicitly approve/apply the reviewed least-privilege
   migration, then recheck permissions and advisors. RLS alone does not hide
   private columns on publicly readable rows.
2. **Deployed handler:** separately approve/deploy the reviewed Edge patch. The
   deployed version 4 still has the incorrect subject lookup and unspecified CORS.
3. **Hosted integration evidence:** verify the actual signing keys/gateway, public
   build values, anonymous Auth, Auth CAPTCHA/rate limits and real Turnstile lifecycle.
   The current network cannot run these checks. No successful live write is claimed.

Missing photo delivery blocks photo support, not text-only activation after the
server photo gate is deployed. Existing private contact/email delivery is separate
from public-wall readiness and is not claimed tested or configured.

## E. One manual dashboard checklist

Only settings unavailable to the repository or connected tools appear here. Do not
send secret values, JWTs, passwords or screenshots of secrets in chat. Confirm
presence/configuration by name and outcome in one response.

| Exact location | Expected setting / evidence |
| --- | --- |
| GitHub `shehroz-codes/Shehroz.my.id` → Settings → Secrets and variables → Actions → Variables | `VITE_SUPABASE_URL=https://lctzkigzaudjiotopzye.supabase.co`; `VITE_SUPABASE_PUBLISHABLE_KEY` is this project's enabled publishable key; `VITE_TURNSTILE_SITE_KEY` is the correct managed widget public key |
| GitHub repository → Actions → Deploy to GitHub Pages → latest run | Successful build/deploy for the intended main SHA; Settings → Pages → source GitHub Actions. Merged PR #23 is verified; latest deployment was user-reported, not independently verified here |
| Supabase project → Authentication → Sign In / Providers → Anonymous Sign-Ins (`/auth/providers`) | Anonymous sign-ins enabled for intended use; review all authenticated-role policies before enabling if currently off |
| Supabase project → Authentication → Bot and Abuse Protection | CAPTCHA enabled with Cloudflare Turnstile and the matching widget secret configured; do not reveal it. Fresh sign-in token and fresh publishing token must each succeed separately |
| Supabase project → Authentication → Rate Limits (`/auth/rate-limits`) | Anonymous sign-ins limited; retain the documented 30/hour/IP default or an explicitly reviewed stricter policy. Do not increase to bypass tests |
| Supabase project → Settings → JWT Keys / JWT Signing Keys | Actual user JWT uses a supported signing key with kid and matching JWKS; ES256 is exercised locally. Do not rotate/migrate keys as part of this audit |
| Supabase project → Edge Functions → Secrets | `TURNSTILE_SECRET_KEY` exists; server SDK publishable/secret key bindings and JWKS are available. Confirm current `VISITOR_SUBMISSIONS_ENABLED` remains disabled. Secret values are not inspectable through the available connector |
| Cloudflare Dashboard → Turnstile → portfolio widget → Settings | Widget mode Managed; hostname includes exactly `shehroz-codes.github.io`, without scheme/path. Site key matches GitHub variable; test real tokens with action `visitor-message` |

Network settings also need access to the project host, Supabase documentation and
GitHub API for further automated read-only verification. The task's enforced policy
returned 403 for the Supabase host, Pages host, GitHub API and changelog; no proxy,
TLS or access-control bypass was attempted. No repeated user file requests are needed.

## F. Exact safe activation sequence — plan only

1. Review the PR and the single dashboard checklist. Keep both write gates disabled.
2. Run the tests below. Validate hosted Auth/gateway/Turnstile in an authorized
   non-production setup before changing production. The current source locks the
   project URL/issuer; a separate staging copy must explicitly target its own URL
   and issuer. Do not create production test messages or users under this audit.
3. Separately approve the production migration and Edge deployment. Apply only
   the reviewed migration; do not push unrelated pending history. Recheck that
   anon/authenticated cannot SELECT private columns or execute publication RPCs,
   published-only reads still work, and admin/cooldown/object access stays private.
4. Deploy the reviewed Edge source with JWT verification retained. Verify exact
   origin preflight, valid/invalid JWT handling and server-disabled 503 behavior.
   The server photo constant stays false. No bucket/policy widening is needed.
5. Merge the reviewed frontend/test PR only when authorized. The existing main
   push workflow automatically deploys Pages; this audit does not merge or trigger it.
   Leave frontend submissions false during this read-only rollout. Confirm public
   feed, failure behavior and configured widget key on the intended deployment.
6. Only after security/live tests pass and explicit activation approval, make the
   two minimal write-gate changes: server `VISITOR_SUBMISSIONS_ENABLED` to `true`
   and workflow `VITE_VISITOR_SUBMISSIONS_ENABLED` to `'true'`, then rebuild Pages.
   Mode/backend already equal live/supabase. Changing only the UI or build variable
   cannot bypass the server gate, JWT validation, CAPTCHA or SQL authorization.
7. Monitor authorized real usage and failures. To stop writes quickly, restore
   the server gate to disabled; restore frontend false and rebuild for matching UI.
   Never weaken RLS or make the photo bucket public to recover from errors.

## G. Final commands and deployment instructions

These commands run checks without production writes:

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run test:database
npx playwright install chromium
npm run test:browser
# Or use an already installed Chromium:
CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
```

The SQL runner requires Bash and the managed/local Docker socket; it provisions a
pinned official Postgres 17 image, exposes no host ports, accepts no database URL,
and cleans up its own container. The browser suite uses Vite test servers and
intercepts Supabase HTTP; it is not a hosted integration test.

For reviewed changes on this branch, without merging/deploying:

```bash
git add .github/workflows .gitignore package.json package-lock.json playwright.config.ts vitest.config.ts src/sections/components/contact supabase tests scripts docs/contact
git commit -m "Audit backend readiness and add security regression coverage"
git push -u origin feature/backend-readiness-audit
```

After explicit production-change approval, use a configured Supabase CLI (flags
verified with v2.81.3 help), authenticate through its supported secure flow, and
inspect the pending history first:

```bash
supabase link --project-ref lctzkigzaudjiotopzye
supabase db push --dry-run
```

Apply the reviewed SQL file through the SQL Editor, or use `supabase db push`
**only if** the dry run contains exactly the reviewed migration and migration
history has been reconciled. No seed, role, prune or include-all options are needed.
To deploy the reviewed handler, retaining gateway verification:

```bash
supabase functions deploy submit-visitor-message --project-ref lctzkigzaudjiotopzye
```

Do not add `--no-verify-jwt`. Do not run these mutation/deployment steps before
approval. The server gate remains disabled throughout deployment validation. Set
public frontend variables in GitHub Actions Variables, never private secrets in
VITE variables. Pages' base remains `/Shehroz.my.id/`; CORS origin is
`https://shehroz-codes.github.io` without that path.

This task's final reply links the review PR. No merge or deployment was performed.
