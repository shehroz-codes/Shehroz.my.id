# PR #29: hosted release gate results

Repository: `shehroz-codes/Shehroz.my.id`; PR head `4bf12cb3ab26357e9222abbaca63f8fbaffcfb92`.
Date: 17 November 2026. Hosted probes ran around 14:17 Pakistan time (09:17 UTC).

**Deployment decision: HOLD.** This investigation obtained new hosted evidence for HMAC and publishable-key handling. It did not activate the PR, change existing handlers, apply a migration, or merge a branch.

## Security gates

| Gate | Result | Actual evidence |
|---|---|---|
| Trusted IP overwrite | FAIL — required overwrite evidence remains unavailable | Baseline handler observed valid platform metadata. Forged CF-Connecting-IP requests with two documentation IPv4 values, one documentation IPv6 value, and two public test addresses were rejected upstream: HTTP 403; inspected response had Cloudflare `error code: 1000`. They did not produce handler diagnostics. X-Forwarded-For/X-Real-IP/country overrides without the CF header reached the handler (200) and did not control observedIp. This establishes tested spoof rejection/forwarded-header resistance, but does not establish the required CF-header overwrite at the handler. |
| Publishable-key handling | PASS — hosted protected probe | Enabled project publishable key: 200. Invalid key: 401. Missing key: 401. Tests used the exact pinned `@supabase/server@1.9.2` publishable auth mode, with an additional legacy public anon JWT for the probe's enabled gateway verification. This does not claim that the undeployed PR posting endpoint has been activated. |
| HMAC runtime usability | PASS — hosted | Exact PR observed-IP/HMAC helper source ran against the existing runtime `SUPABASE_SECRET_KEYS.default`. It produced valid, deterministic, domain-separated HMAC-SHA-256 output; only booleans and a salted diagnostic comparison tag were returned. The server key, permanent quota hash and raw visitor IP were never returned. |
| Hosted rate limits/cooldowns | FAIL — unable to stage database prerequisites | No production quota table or new RPC was created. Initial migration request expired; one instructed retry returned `status: declined`, `Migration was declined.` No alternate SQL route was used. The transaction-only verification wrapper passed locally, but it was not installed or called in production. |
| Additive migration compatibility | PASS — local/preflight only | Previously established schema compatibility retained. New isolated wrapper validation passed 30-submit/120-country hourly quotas, hourly reset, device/network cooldowns, ten-minute expiry and country columns; all test message/quota writes rolled back. No hosted migration success is claimed. |
| Existing private security preservation | PASS — preservation | Existing private v4 and moderation v4 remain JWT-enabled with unchanged bundle digests. Existing public v11 and photo v4 are also unchanged. No Auth/CAPTCHA settings, frontend or application code was changed. Real human CAPTCHA/delivery was not newly tested. |

## Staging assessment and changes

- No existing Supabase branch or separate project was available. Branch creation returned an expired confirmation; no branch was created.
- The original probe proposal included an optional external country lookup. Automatic approval review rejected that proposal because it could transmit a raw visitor IP to ipapi.co and conflicted with the user's restriction. That proposal was not deployed.
- The safer deployed probe contained only the exact PR IP-normalization and HMAC helpers, the existing exact-origin wrapper, and the pinned SDK publishable-key verifier. It retained gateway JWT verification, required an independent random diagnostic credential, and had a hard 30-minute expiry. It made no geolocation request or database call.
- `pr29-security-probe` v1 was the only successful diagnostic deployment. After testing it expired and was replaced by v2, a JWT-protected handler that unconditionally returns HTTP 410 `Diagnostic closed`, with no environment, database or network access. A real HTTPS cleanup request returned 410. Its local diagnostic credential was destroyed. The inactive function entry remains; there is no delete-function operation in the connected toolset.
- No additive migration, test RPC, country endpoint or new posting handler was deployed. Schema follow-up confirmed the quota table and all proposed RPCs remain absent.
- All **7 existing messages** have the same aggregate row digest before and after. RLS remains enabled; anon/authenticated inserts remain denied. No successful submission or notification was generated. The checkout remains clean and the separate performance branch/worktree was not accessed.

## Prepared, but not deployed

- Additive migration: `/tmp/pr29-security-4bf12cb/supabase/migrations/20261117044813_public_message_no_captcha_country.sql` (the existing PR migration, unmodified).
- Service-only transaction wrapper: `/tmp/pr29-security-4bf12cb/pr29-hosted-db-probe.sql`. It exercises the actual new RPCs using randomized synthetic identities, then intentionally rolls back its entire subtransaction. It cannot commit a test message. It accepts no caller-controlled data.
- Rollback SQL for the staged additive objects: `/tmp/pr29-security-4bf12cb/pr29-rollback.sql`.
- Local probe validation: four tests passed, covering diagnostic credential, SDK key rejection, absence of secret/raw-IP output, origin/method restrictions and expiry.
- Transaction-wrapper validation: `/tmp/pr29-db-probe-validation.log`. Quotas, cooldowns, expiry, country columns and rollback assertions passed; zero quota rows remained and browser execution permissions were denied.
- Sanitized hosted observations: `/tmp/pr29-hosted-ip-hmac-results.json`; cleanup: `/tmp/pr29-probe-cleanup.json`.

## Minimum next actions

1. Resolve the Supabase migration confirmation decision: the service explicitly declined the migration. Approve that concrete additive migration through the platform confirmation flow, or provide an existing approved isolated staging target. Retain the prepared transaction-only wrapper for hosted quota/cooldown verification; do not expose a test posting endpoint or change the current public handler.
2. Obtain the required ingress-overwrite evidence: an authoritative provider guarantee applicable to this project's route, or an authorized test path that lets the safe handler observe the overwrite. Current injected-header requests are rejected upstream with Cloudflare error 1000; repeating them from this same path cannot prove overwrite. If overwrite cannot be guaranteed, the IP trust source must be corrected before release; do not substitute untrusted forwarded headers.
3. Only after those gates pass, prepare/execute the coordinated migration, public functions and frontend release, preserving private/moderation JWT gates and performing controlled production/CAPTCHA checks with rollback ready.

The custom-domain CONNECT 403 remains recorded; it was not retried. The earlier exact manual browser checks are in `/tmp/pr29-security-verification.md`. No root-URL Supabase 404 was treated as a connectivity failure.
