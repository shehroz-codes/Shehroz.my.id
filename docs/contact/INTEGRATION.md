# Contact and visitor wall integration

## Source and scope

Ported from the user-supplied Antigravity archive, `test.zip`:

- `index.html`: four-card markup, ordering, labels and forms.
- `css/style.css`: preserved dark-violet cards, 50/50 top row, 40/60 bottom row,
  mobile stacking, photo crop, hover effects and travelling border.
  Every selector is scoped under `.contact-section`; keyframes and the border
  custom property have unique names. No source body/background/reset escapes
  into the portfolio.
- `js/app.js`: validation, photo thumbnails, country selection, suggestions,
  feed rendering and pagination, expressed as React components.
- `js/cooldown.js`: absolute expiry, refresh/tab synchronization and wake-up
  handling, using React subscriptions and cleaned-up timers.
- `js/suggest.js`: the supplied local Roman-Urdu/English dictionary. It only
  proposes corrections; visitors choose whether to apply them.
- `js/services/mock-backend.js`: adapted into an explicitly local preview.
  No synthetic delay, mock email delivery or stored private inbox.
- `js/services/firebase-backend.js`: adapted behind an explicit live-mode
  boundary, reusing the existing `src/lib/firebase.ts` rather than initializing
  another Firebase app or loading another SDK from a CDN.
- `images/profile.png`: the supplied portrait, unchanged and lazy-loaded.

The supplied 20 fictional messages are **not seeded**. Local posts are visibly
tagged “Local preview”, even after refresh. Local storage retains at most 50.
Country preview uses the browser timezone with an approximate label and an
optional manual choice. It never treats browser language as location evidence
and makes no third-party geolocation request in preview mode. Live country
comes from the contact service; the supplied server does not accept a manual
country override, so that control is preview-only.

No site-wide footer existed. The Showcase's internal panel footer stays there.
Only the section mount and Contact's target/active tracking change shared files.
Navbar visuals and other sections are unchanged. Missing email, phone, LinkedIn,
TikTok and WhatsApp details remain unpublished; the existing GitHub URL and
Lahore location are reused. Edit `contact/config.ts` to publish verified details.

## Default behavior: local preview

`VITE_CONTACT_MODE` defaults to `preview`. A permanent notice explains that
wall messages remain in this browser and nothing is sent to Firebase or emailed.
The button says “Preview Message”; confirmation explicitly says it was saved
locally, not published. Private submissions validate but report that delivery is
unconnected, retain the draft, and never store the correspondence.

Wall posts and a ten-minute expiry are saved atomically under
`shehroz.contact.preview.v1`. Storage failures show an error instead of success.
This cooldown is a preview interaction, **not server-side abuse protection**.
It is shared across tabs on the same origin using storage events and cannot
promise identity or tamper resistance. The live server must enforce its own limits.

## Firebase status

At integration time the latest `main` already contained the foundation originally
introduced by PR #17. It was inspected and reused without merging that PR or
changing `firebase.json`, rules, indexes, Hosting or workflows. Firebase CLI
authentication remained unavailable; no live reads, writes or deployments were
performed. SDK configuration alone is not evidence of a connection.

The optional adapter lazily imports the existing modular SDK, checks the expected
project ID `shehroz-portfolio-45a2b`, reads only approved, non-demo messages ordered by
`createdAt`, and uses limit + 1 for pagination. Listener errors clear the feed
and show an unavailable state. It has **no direct Firestore write calls**.
Production failures never fall back to local success. Public input is rendered
as React text, not HTML.

Live calls follow the supplied contracts:

- `POST /submitPublicMessage`: multipart name/text/website and optional photo;
  requires `{status: "published" | "pending", cooldownUntil: number}`.
- `POST /submitContact`: JSON name/email/subject/message/website;
  requires `{ok: true}`. The UI acknowledges service receipt only, never promises
  email delivery, because the supplied server can return success after email failure.
- `GET /detectCountry`: optional approximate country code and name.
- Public writes include an anonymous per-browser `X-Visitor-Id`; the supplied
  backend also enforces salted-IP cooldowns. HTTP requests time out after 15s.
  A timed-out submission is reported as unconfirmed, since it might have reached
  the server.

No dependencies were added. Functions/Admin SDK/Groq/Resend packages are not
bundled in the frontend. The archive's deployable server files and Firebase
Hosting configuration were deliberately not copied over the portfolio's setup.

## Remaining steps before live activation

1. Review and test the supplied Cloud Functions independently with emulators.
   The seven supplied pure validation tests pass, but this does not verify the
   functions, Firestore rules, moderation, email or Storage.
2. Harden the supplied backend before using it:
   - Separate public message fields from server-only moderation and IP-hash
     metadata. Firestore rules cannot hide individual fields of a readable
     document; selecting fields in the UI is not access control.
   - Keep pending/unreviewed photos private. The supplied server generates
     download-token URLs before approval, and its draft Storage rules allow
     public gets. Do not activate those rules unchanged.
   - Validate photos server-side, enforce request/file bounds and server
     cooldown/rate limits, and verify App Check tokens server-side. The archive
     sends an optional App Check header but does not enforce it. Client App Check
     initialization/token forwarding is not wired in this port; add and verify it
     together with enforcement before live activation. CORS is not authentication.
   - Make the supplied stats trigger idempotent before relying on its counter;
     this frontend does not consume that counter.
   - Verify trusted proxy handling for IP/country headers, moderation
     fail-closed behavior, mail delivery failure handling and retention.
3. Use the existing Firebase project/default database/web app. Verify real public
   web configuration securely outside source control. Do not create replacements.
   CLI/admin access must be provisioned through the environment's secure identity/
   credential setup, never by putting tokens or service-account keys in chat or
   `VITE_*` variables.
4. Confirm server-side email recipient and a verified sender, moderation provider,
   salted-IP secret, allowed origins, billing requirements and the deployed
   function region. Keep all private provider credentials server-side.
5. Review live Firestore/Storage rules and existing indexes first. The foundation's
   local deny-all rules will block public reads if deployed. Any future changes
   to rules, indexes, functions, secrets or resources require separate approval.
   The adapter's query requires the status/isDemo/createdAt composite index
   included in the archive's second index definition.
6. After backend and rules approval, configure public build-time settings:
   `VITE_CONTACT_MODE=live` and `VITE_CONTACT_FUNCTIONS_URL=<verified HTTPS base URL>`,
   alongside the foundation's `VITE_FIREBASE_*` web configuration. No live endpoint
   is guessed or enabled by default.
7. Test real subscriptions, pending/approved states, photo moderation, cooldowns,
   failures and private delivery before publishing. Only then request deployment
   approval. No deployment is part of this PR.

## Validation

Use the repository scripts: `npm ci`, `npm run typecheck`, `npm run build`.
A bare `tsc --noEmit` is not the project's configured check; its two TypeScript
projects are checked by `npm run typecheck`.

Browser validation uses a fresh browser context to avoid mixing real browser
data with previews. Check desktop/mobile layouts, Contact navigation, keyboard
access, form errors, Unicode and literal markup, photo decoding/removal, opt-in
suggestions, local posts/labels, pagination, cross-tab cooldown, reload/reopen,
expiry, storage-denied errors, reduced motion, and original-section regressions.
Live Firebase, email, moderation and cloud permission tests remain outstanding.

### Results for this integration

- Clean `npm ci`, `npm run typecheck` (via build), and `npm run build`: passed.
  Vite's existing large Lanyard chunk advisory remains.
- Chromium at 1440, 1024, 768, 390 and 320px: cards, fields, photos, feed and
  country controls fit their containers; desktop card rows and mobile stacking
  match the supplied structure.
- Profile: verified GitHub target, unpublished phone/email, disabled missing
  social channels and correctly filled brand marks.
- Private form: required-field validation, explicit unconnected-service error,
  retained draft and no browser-stored private inbox.
- Public form: required/300-code-point limits, Urdu/emoji and literal HTML
  rendered as text, opt-in Roman-Urdu correction, invalid-photo rejection,
  valid thumbnail selection, local confirmation and visible preview labels.
- Actual second tab, refresh, browser close/reopen and expiry: local posts and
  absolute cooldown persist/synchronize; controls re-enable at expiry.
- Feed pagination, keyboard photo picker, hover-triggered border light and
  reduced-motion behavior: passed.
- Browser-storage denied: error reported, no saved post or fake success.
- Missing live Firebase configuration (mocked null foundation): listener and
  submit paths fail closed; no cloud calls.
- Contact desktop/mobile navigation, existing music categories, About/Interests,
  all Showcase tabs and the 30 Tech Stack entries: passed with no page errors.
- Production build at 1440/390px: local preview form/feed pass; Firebase chunk
  and live service URLs are not requested.
- The archive's seven server validation unit tests pass unchanged; that is not
  an emulator, integration or live-backend test.
- Not verified: live Firestore/Storage/rules/indexes, Cloud Functions,
  authentication/IAM, App Check, moderation, geolocation service or email delivery.
