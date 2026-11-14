> Current implementation and release procedure: [Supabase Contact completion](COMPLETION_AND_RELEASE.md). The notes below include historical states.

# Read-only frontend deployment preparation

PR #24 remains draft and unmerged. Public submissions remain OFF. This is a
frontend release checklist, not a repeated backend audit or approval to activate.

## Completed in this update

- Confirmed a production SELECT under database role `anon` succeeds for the
  published, non-demo Visitor Wall; there are currently zero visible messages.
  This verifies database access, not browser/Data API HTTP delivery.
- Added Contact service retry after an SDK/module load failure. The wall now
  reports unavailability instead of displaying a permanent loading state.
- Added a Visitor Wall retry action after feed errors, preserving the live backend
  and clearing stale error state on recovery. No preview fallback is introduced.
- Bounded public reads to 15 seconds and abort them on unsubscribe, so stalled
  requests can reach the retry UI and unmounted components receive no callbacks.
- Preserved the existing layout, styles, animations and Firebase implementation.
- Added focused regression coverage for recovery, timeout and cancellation.
- Constrained the Interests portrait by a few pixels only on the narrowest screens
  so its full halo pulse cannot create horizontal scrolling. The animation and
  wider layouts are preserved; the browser check now uses the widest pulse frame.

## Validation

- Clean dependency installation: passed.
- TypeScript: passed.
- Unit/component/adapter suite: 59 tests passed. Existing isolated security tests
  remain in the suite; no real CAPTCHA/Auth integration test or user creation ran.
- Production build: passed with `VITE_CONTACT_MODE=live`, backend `supabase` and
  `VITE_VISITOR_SUBMISSIONS_ENABLED=false`, using a dummy public test key.
- Browser suite: seven Chromium cases passed, covering preview and live-disabled modes,
  form validation/persistence, retry after 403, and Contact responsiveness and
  axe accessibility at 320, 390, 768 and 1440 pixels. Cloud HTTP responses in the
  browser suite are mocked.
- Direct production HTTP: still blocked by the execution proxy (CONNECT 403).
  Do not describe the mocked browser feed as a successful production HTTP test.

## Remaining work

- Verify the actual deployed public Data API read from the real Pages origin in
  a permitted/local browser, with no signup or message submission.
- Private contact/email delivery is still dependent on the existing Firebase
  service configuration; successful private delivery is not claimed here.
- Turnstile/CAPTCHA and Auth integration testing is postponed at the user's request.
  This does not block a read-only UI release; it blocks enabling public submissions.
- Photo delivery remains deferred; uploads remain disabled.

For the outstanding HTTP check only, open the real portfolio in a local browser
and run this DevTools snippet. It performs one public GET, creates no user, runs
no widget and prints no messages, IDs or credentials:

```js
void (async () => {
  if (location.origin !== 'https://shehroz-codes.github.io') return;
  const key = prompt('Public Supabase publishable key only');
  if (!key?.startsWith('sb_publishable_')) return;
  try {
    const response = await fetch('https://lctzkigzaudjiotopzye.supabase.co/rest/v1/visitor_messages?select=id&status=eq.published&is_demo=eq.false&limit=1', {
      headers: { apikey: key }, credentials: 'omit', signal: AbortSignal.timeout(15000),
    });
    const valid = response.status === 200 && Array.isArray(await response.json());
    console.log({ check: 'Public wall HTTP', result: valid ? 'PASS' : 'FAIL', status: response.status });
  } catch { console.log({ check: 'Public wall HTTP', result: 'NOT VERIFIED', reason: 'Network/CORS/timeout' }); }
})();
```

## Next deployment action — requires approval

Review and explicitly approve merging PR #24 for the read-only frontend release.
The existing push-to-main workflow then builds and deploys GitHub Pages. Keep:

- `VITE_CONTACT_MODE=live`
- `VITE_CONTACT_BACKEND=supabase`
- `VITE_VISITOR_SUBMISSIONS_ENABLED=false`
- Server `VISITOR_SUBMISSIONS_ENABLED=false` (user-confirmed; do not change it)
- Photos disabled; JWT verification and CAPTCHA enforcement retained

The permission migration and exact reviewed Edge source were already deployed
separately (migration history version `20261113141350`, Edge version 7). Do not
reapply migrations or redeploy the function as part of this frontend release.
Merging this PR does not automatically deploy SQL or Edge Functions.

After the approved Pages deployment, verify the real public feed and the
submission-disabled UI at desktop/mobile widths. Do not enable submissions to
test the frontend. No merge, deploy, database/security change or activation was
performed during this frontend update.
