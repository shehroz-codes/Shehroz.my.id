# Supabase Contact completion and release

This is the current implementation/release guide. Earlier audits and Firebase integration notes describe historical states. This branch is review-only: no hosted migration, function, account, message, or posting switch was changed.

## Behavior

The public composer stays editable with posting disabled, during cooldown, and while the backend loads. Name/text drafts survive refresh in sessionStorage in the same tab. Failed submissions retain drafts and photos; successful submissions clear them. Photos are intentionally kept in memory rather than persisted. Browser previews remain explicitly local.

Live Contact uses Supabase exclusively. Public messages retain the existing atomic `publish_visitor_message` RPC and ten-minute identity cooldown. The client reuses/refreshes the persisted anonymous Auth session, sends its signed JWT, and never automatically retries a write. Turnstile tokens are reset after attempts. On first public verification, Auth consumes a token: the composer establishes that session and prompts for a fresh check before enabling Post Message. If private correspondence is used first, the form requests a fresh check after establishing the session. This avoids reusing a consumed CAPTCHA. No cooldown begins for failed publication; the existing RPC transaction rolls back its cooldown if insertion fails. The browser expiry survives refresh and synchronizes through the existing storage events.

Input photos must be JPG/PNG/WebP, <=2 MB and <=20 million decoded pixels. The browser center-crops a 160px square, re-encodes WebP without original metadata and caps it at 60 KB. Only that thumbnail enters multipart upload. The Edge Function bounds its body, validates WebP headers/dimensions and actually decodes/re-encodes with the pinned ImageMagick WASM implementation before Storage upload. Originals never leave the browser.

`visitor-photo?id=<message UUID>` is deliberately a public read endpoint with **no JWT gateway**, because ordinary `<img>` requests do not carry a bearer. It checks current published/non-demo membership for every request, returns bytes with `Cache-Control: no-store`, and never reveals the path or visitor identity. Missing/hidden/deleted photos return 404. All write and owner endpoints retain JWT gateway checks and SDK signature/audience/issuer verification. Public database reads still select only granted public columns. Unknown country is omitted; unavailable images fall back to initials.

Photo cleanup intent is inserted before upload. Successful publication removes the intent. Failed publication attempts immediate removal and retains failed cleanup intent. A database delete trigger queues the old photo path atomically with deletion. Owner deletion removes the message first, revoking future photo delivery, then immediately removes its object. Owner maintenance retries failures and uploads abandoned for at least one hour, confirming that no message references the path. Paths never appear in owner endpoint responses. The public wall polls every 30 seconds; successful posting requests an immediate refresh, including when a read is already in flight.

Telegram sends once following a successful atomic publication. A lost response/retry encounters the existing cooldown rather than posting/notifying twice. Missing secrets, network errors and Telegram rejection never undo publication. Notifications are best effort: there is no automatic notification retry queue. Public notification text includes name, message preview, UTC time, message UUID and a safe project management link; private notifications omit correspondence contents and email.

Private correspondence uses `submit-private-message` with its own `private-message` Turnstile action, honeypot, strict validation and independent atomic ten-minute identity limit. Its table has no public access and only non-anonymous `portfolio_admins` members can read through RLS. It never writes the wall. `PRIVATE_CONTACT_ENABLED` fails closed until configured. Firebase remains available to unrelated portfolio features and historical source, but is absent from the active Contact import path.

## Owner management

Use an existing non-anonymous Supabase Auth account already present in `portfolio_admins`. No account or admin was created by this task. From a trusted terminal, supply `SUPABASE_PUBLISHABLE_KEY` and an existing owner session as `SUPABASE_OWNER_ACCESS_TOKEN` (or `SUPABASE_OWNER_EMAIL` and `SUPABASE_OWNER_PASSWORD` for an account with password login) using the terminal's secret/environment mechanism (never commit them or put them in frontend variables), then run:

```sh
node scripts/manage-visitors.mjs list
node scripts/manage-visitors.mjs list 1
node scripts/manage-visitors.mjs delete <message-uuid>
node scripts/manage-visitors.mjs cleanup
```

The script reuses the supplied owner token, or creates a temporary session for the existing owner and signs that temporary session out afterward. It keeps credentials out of command arguments. The server independently checks `portfolio_admins` on every request and rejects anonymous identities even if mistakenly listed. For private inbox reading, the owner can use the project dashboard or an authenticated Supabase client under the inbox RLS policy. No public admin controls are rendered.

## Production observations (read-only, 2026-11-13)

- Remote migration history: `20261113141350_restore_visitor_message_least_privilege` already applied. The repository's historical permission file has a different timestamp (`20261113132516`). **Do not replay it or blindly run a directory-wide migration push.**
- `submit-visitor-message` is active version 7 with `verify_jwt=true`.
- The existing bucket is private, restricted to `image/webp`, and has `file_size_limit=61440`; no bucket configuration change is needed.
- The existing publication RPC is executable only by postgres/service_role.
- Direct website and function preflight probes failed at this environment's CONNECT proxy with 403. This is not evidence of a production failure. Hosted Auth, JWT gateway compatibility, CAPTCHA, CORS, image serving and Telegram delivery remain **NOT VERIFIED**.

## Safe deployment sequence (requires separate approval)

1. Review and approve the PR. Apply **only** `supabase/migrations/20261113154901_complete_contact_delivery.sql` as a new tracked migration named `complete_contact_delivery`, e.g. through the connected Supabase `apply_migration` tool. Check migration history afterward; do not alter or reapply the historical permission migration. The new migration adds cleanup/private-inbox tables, RLS, an index and a delete trigger; it does not replace the existing public read policy or publication RPC.
2. Configure server secrets if absent: `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Create the bot once with Telegram BotFather, send it a message from the owner's chat, and obtain that chat's ID; enter values through Supabase secrets. Reuse the existing `TURNSTILE_SECRET_KEY` and built-in Supabase keys. Leave `VISITOR_SUBMISSIONS_ENABLED=false`. Set `PRIVATE_CONTACT_ENABLED=true` only when private delivery has been approved. Keep anonymous Auth and Auth CAPTCHA enabled, and keep the existing Pages hostname allowed in Turnstile. Both `visitor-message` and `private-message` actions are verified server-side.
3. Deploy the changed `submit-visitor-message` plus new `visitor-photo`, `manage-visitor-messages`, and `submit-private-message` from this commit, including `_shared` imports and the WASM npm asset. Use `supabase/config.toml`: JWT checks remain on for all writes and owner management; only the public read-only image function has `verify_jwt=false`. No unchanged version 7 redeployment is needed before this approved release. Confirm deployment bundling/startup with the real WASM asset before enabling photos in production.
4. With merge approval, merge the PR and allow the existing Pages workflow to deploy. It still explicitly sets `VITE_VISITOR_SUBMISSIONS_ENABLED='false'`. Existing public text reads remain available. Confirm draft entry works with posting off. The existing GitHub variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_TURNSTILE_SITE_KEY` are reused; no service secret belongs in them.
5. **Final activation requires explicit approval** to change both the server `VISITOR_SUBMISSIONS_ENABLED` and Pages `VITE_VISITOR_SUBMISSIONS_ENABLED` to `true`. Rebuild Pages after the frontend change. Do not remove JWT gateway checks if hosted JWT compatibility fails; capture the failure and resolve the signing/gateway configuration while keeping posting off.

One authorized hosted browser smoke test: in a fresh browser profile on the real Pages URL, compose one clearly identified test message with an optional photo, complete the fresh Auth/Turnstile challenges, and post. Confirm it appears in a second profile, refresh and check cooldown, confirm the Telegram notification, then use owner deletion and verify its photo URL returns 404 and the wall removes the item on refresh/poll. This creates a production anonymous identity and message, so it was **not run** in this task. Do not claim hosted publishing works until this test succeeds.

Rollback: turn both public switches off first; disable private delivery if needed. Existing text reads continue working. Keep the additive schema and cleanup queue for recovery; do not discard stored correspondence or photos as a rollback shortcut.

## Validation

Run `npm test`, `npm run build`, `npm run test:database`, and `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser` (omit CHROMIUM_PATH when using Playwright-managed Chromium). Database tests use a disposable local PostgreSQL 17 container with no external network. The full database runner reproduces the old grant issue, applies the old fix only to that fixture, then applies this new migration and verifies private-inbox RLS, cooldown and deletion queue behavior. Two concurrent public RPC calls must produce one commit and one cooldown.

Deno runtime typecheck:

```sh
deno check --no-config --no-lock --node-modules-dir=manual supabase/functions/submit-visitor-message/index.ts supabase/functions/visitor-photo/index.ts supabase/functions/manage-visitor-messages/index.ts supabase/functions/submit-private-message/index.ts
```

Unit tests include real asymmetric JWT verification and real WASM image decoding; service HTTP calls are controlled. Browser tests use real Chromium and canvas decoding/encoding, with the live read API mocked. These checks do not prove production Auth/CAPTCHA/gateway/Storage/Telegram integration.

References: [Supabase Auth with Edge Functions](https://supabase.com/docs/guides/functions/auth), [WASM image processing](https://supabase.com/docs/guides/functions/examples/image-manipulation), [current changelog](https://supabase.com/changelog).
