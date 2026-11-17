# PR #29 security verification

Verified 17 November 2026, approximately 13:50 Pakistan time (08:50 UTC).
PR: https://github.com/shehroz-codes/Shehroz.my.id/pull/29
Reviewed head: `4bf12cb3ab26357e9222abbaca63f8fbaffcfb92`.

Decision: **HOLD deployment.** No production migration, function deployment, merge, Auth change, or successful submission was performed. No application code was changed. Tests ran against a temporary archive of the PR and a disposable local database. The performance worktree was not accessed.

## Gates

| Gate | Result | Evidence and limit |
|---|---|---|
| Trusted IP metadata | FAIL — hosted guarantee unverified | PR trusts `CF-Connecting-IP`, ignores forwarded-IP fallback, and rejects missing metadata. Local tests pass. Production has no `visitor-country` function or equivalent safe diagnostic returning evidence of the address seen by the handler. Hosted overwrite of forged `CF-Connecting-IP` has not been established. Country output alone would not prove that overwrite guarantee. |
| Publishable-key authorization | FAIL — new hosted paths unverified | Existing REST reads: valid enabled publishable key HTTP 200, invalid key HTTP 401. Existing public handler with publishable key alone HTTP 401 (`auth: user`); `visitor-country` HTTP 404 `NOT_FOUND`. PR's actual SDK publishable-key tests pass locally, but that implementation is not live. |
| HMAC configuration | FAIL — runtime unverified | PR requires `SUPABASE_SECRET_KEYS.default` to be a string at least 32 characters long, then derives domain-separated HMAC-SHA-256 identities. Local tests use synthetic keys. Available evidence does not establish deployed runtime presence/shape/usability. No secret value was fetched or exposed. |
| Rate limiting | FAIL — hosted enforcement unverified | Fresh disposable PostgreSQL suite passed the 30/hour submit quota, device/network cooldowns, concurrency and service-only grants. Production has neither `public_visitor_limits` nor the new quota/public-publish RPCs. No production flooding was performed. |
| Migration compatibility | PASS — local and schema inspection | Existing live `visitor_id` is nullable, country columns exist, message constraints fit the PR, service-role insert is allowed, and browser-role insert is denied with RLS enabled. New objects have no naming collision. Existing disposable PostgreSQL migration suite passed. Migration has not been applied to production. |
| Private CAPTCHA preservation | PASS — preservation boundary | Live v4 private handler, shared CAPTCHA helper and origin helper exactly match PR content. Private/moderation JWT settings remain enabled. Missing user JWT and publishable-key-as-bearer both yield HTTP 401. PR tests reject missing/invalid CAPTCHA and invalid/expired/tampered JWTs. Real human CAPTCHA, authenticated delivery and Telegram receipt remain unverified. |

Fresh focused tests: **23 passed in 2 files**, from the PR archive. Fresh disposable PostgreSQL suite passed, including existing private protections, restricted ACLs, quotas, concurrent public commits and country persistence across connections. GitHub `Validate portfolio` run `44040408576` completed successfully for the reviewed head. Netlify preview status is successful; neither is proof of production security.

## HTTP observations

Requests retained inherited proxy settings and TLS verification. No custom-domain retry was made.

| Request | Status |
|---|---|
| GET `https://shehroz-codes.github.io/Shehroz.my.id/` | 200 |
| GET `/auth/v1/settings` with enabled publishable key | 200; anonymous Auth is enabled; this public response does not disclose CAPTCHA configuration |
| GET `/rest/v1/visitor_messages?select=id,country_code,country_name&limit=0` with enabled publishable key | 200 |
| GET `/rest/v1/visitor_messages?select=id&limit=0` with invalid key | 401 |
| GET `/functions/v1/visitor-country` with enabled publishable key and Pages Origin | 404 `NOT_FOUND` |
| GET `/functions/v1/submit-visitor-message` with enabled publishable key and Pages Origin | 401; current handler accepts user auth |
| POST `{}` to `/functions/v1/submit-private-message`, enabled publishable key, no user JWT | 401 |
| Same private negative request with publishable key as bearer | 401 |
| Public function OPTIONS with Pages Origin | 204 |
| Public function OPTIONS with hostile Origin | 403 |
| `https://shehroz.my.id` | Prior proxy CONNECT 403; intentionally not retried |

The Supabase root 404 is not a connectivity failure and was not used as a gate.

## Exact manual browser checks for the custom domain

These are instructions, not observed results. Run from a normal browser outside the Codex proxy. Keep PR #29 unmerged until the hosted IP/HMAC gates have evidence; do not disable CAPTCHA or JWT protection to run these checks.

1. Open `https://shehroz.my.id/` in a fresh browser profile. Open Developer Tools → Network, enable Preserve log and Disable cache, then reload. Confirm a valid HTTPS page, successful JS/CSS assets and no CORS failures. Record the final URL, timestamp and deployed asset identifiers.
2. Scroll to Contact. Inspect its Supabase requests. The public wall read must return 200 from `/rest/v1/visitor_messages`. Its projection must omit `photo_path` and `visitor_id`. Confirm responses to custom-origin requests contain `Access-Control-Allow-Origin: https://shehroz.my.id`, not `*`. Confirm no server secret or service-role key appears in browser requests or assets; the publishable key is expected.
3. Fill the private form with a controlled test message but leave CAPTCHA incomplete: Send must stay disabled and no private delivery request should run. To check server rejection safely without a user session, run the following in the site's console, using only the public publishable key: `await fetch('https://lctzkigzaudjiotopzye.supabase.co/functions/v1/submit-private-message', {method:'POST', headers:{apikey:prompt('Public publishable key only'), 'Content-Type':'application/json'}, body:'{}'}).then(async r=>({status:r.status, body:await r.text()}))`. Expect 401 and no delivery. With an existing authenticated test session, an omitted/invalid CAPTCHA must be rejected before delivery; a no-session 401 alone does not prove CAPTCHA validation.
4. After the mandatory pre-activation gates have passed and a controlled release test is authorized, complete a fresh Turnstile check for private contact. If anonymous Auth consumes it, complete another fresh check. Confirm `apikey` contains the publishable key, `Authorization` contains a user JWT, and the private handler receives a fresh `private-message` CAPTCHA token. Confirm the expected success response and owner receipt. Verify expired/error CAPTCHA resets the token and preserves the draft. Do not export or share tokens in HAR files.
5. After the coordinated migration/functions/frontend release, confirm the public composer requires no CAPTCHA or Auth creation. `/functions/v1/visitor-country` should return a country pair or nulls with exact-origin CORS; null country must not block posting. Publish one authorized test message, refresh and verify persisted text/country. A second attempt within ten minutes, including with a changed browser device ID on the same network, must return 429 without a second published message. Run quota-exhaustion and concurrency checks in an isolated staging environment rather than flooding production. VPN country verification requires an actual VPN; no such result was observed here.

Remaining prerequisites: evidence of ingress overwrite at the handler boundary, runtime HMAC configuration verification without exposing the secret, hosted verification of the new publishable-key/quota paths in an isolated approved setting, and the real private CAPTCHA/delivery checks. A provider-supported diagnostic or staging verification is required for the first two; the current production endpoints cannot establish them. Keep private/moderation JWT gates enabled and release the migration, public functions and frontend together only after mandatory pre-activation gates pass.
