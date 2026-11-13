# Shehroz.my.id

Premium Personal Developer Portfolio

Tech Stack:
- React
- Vite
- TypeScript
- Tailwind CSS

Page order: **Hero → About Card → My Interests → Portfolio Showcase**.

The existing Hero, navbar and animated page background are preserved. The imported
sections retain their interactive ProfileCard, halftone/anime portrait, music UI,
and Projects / Certificates / Experience / Tech Stack tabs with document previews.

Use Node 24 LTS (minimum 22.12) and npm:

```sh
npm ci
npm run dev
npm run build     # TypeScript + production build
npm run preview   # verify dist locally
```

Vite uses `/Shehroz.my.id/` for GitHub Pages. The existing Pages workflow builds
and deploys pushes to `main`; do not deploy the integration branch directly.

See [AI handoff](docs/AI_HANDOFF.md) for component/data paths, editing boundaries,
assets, navigation and known incomplete content. The imported project's original
[README](docs/IMPORTED_SECTIONS_SOURCE.md) is retained with its source attribution.
No backend is required. Music URLs and some showcase records are intentionally
unconfigured/sample content as supplied; they are not verified achievements.

## Firebase foundation

Existing project: `shehroz-portfolio-45a2b`; registered web app: **Shehroz
Portfolio Web**; Firestore: **(default), Standard Edition, Native Mode**.
No new Firebase project, database or web app is needed.

### Local configuration

Use Node >=22.12 (24 LTS recommended), then:

```sh
npm ci
cp .env.example .env.local
```

Fill `.env.local` with the existing web app's configuration from Firebase Console
→ Project settings → Your apps → Shehroz Portfolio Web. Required variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

These are public client configuration, embedded by Vite at build time. Restart
Vite after editing them; rebuild for production changes. `.env.local` is ignored
by Git. Never put service-account keys, OAuth tokens, Firebase CLI credentials
or other private credentials in any `VITE_*` variable or frontend source.

```sh
npm run dev
npm run typecheck
npm run build
```

Visit `/Shehroz.my.id/`. Existing sections work without Firebase configuration.
`src/lib/firebase.ts` uses the official modular SDK, reuses the default app, and
exports `firebaseApp`, `db` (the default Firestore instance) and
`isFirebaseConfigured`. Incomplete/blank configuration returns null instances;
future consumers must check `db !== null` before calling Firestore. The presence
check does not validate credentials, project access or network availability.
No Analytics, Auth, Admin SDK, database operations or UI wiring is included.
The module is not imported by the current UI, so Firebase is not added to its
current browser bundle or startup path.

### Firestore configuration and manual deployment

- `.firebaserc` selects the existing project.
- `firebase.json` targets only default Firestore rules and indexes.
- `firestore.rules` denies every client read/write, including nested documents.
- `firestore.indexes.json` is an empty foundation; it is not an export of live indexes.

**Rules files in GitHub are not active rules.** They take effect only after a
separate authenticated deployment. Codex Cloud does not currently have
authenticated Firebase management access. Remote Firestore access and deployment
permissions have not been tested here. The developer will deploy manually from
Linux Mint using the locally authenticated Firebase CLI:

```sh
# From the repository root after pulling the reviewed foundation changes:
npx -y firebase-tools@latest login:list
npx -y firebase-tools@latest projects:list
npx -y firebase-tools@latest firestore:databases:get '(default)' --project shehroz-portfolio-45a2b
npx -y firebase-tools@latest apps:list WEB --project shehroz-portfolio-45a2b
# Enter the App ID for Shehroz Portfolio Web from the preceding output:
read -r -p "Firebase Web App ID: " FIREBASE_WEB_APP_ID
npx -y firebase-tools@latest apps:sdkconfig WEB "$FIREBASE_WEB_APP_ID" --project shehroz-portfolio-45a2b
# Copy the six public config values into .env.local; never paste login tokens.
# Review the current live rules in Firebase Console before replacing them.
npx -y firebase-tools@latest deploy --only firestore:rules --project shehroz-portfolio-45a2b
```

If the local login has expired, run `npx -y firebase-tools@latest login` first.
Rules deployment requires Firebase Security Rules management permissions (for
example, Firebase Rules Admin). Other backend deployments need their own IAM
permissions; an SDK config alone grants none. Deploying this baseline blocks all
client Firestore access, even authenticated clients. Server/Admin access is
controlled separately by IAM. Review and verify the prototype rules before use.
No Hosting configuration or existing website deployment workflow is changed.
Do not deploy the empty indexes file over a live setup without first comparing
existing indexes and preserving anything required; the command above deploys
rules only.

Future Contact and Visitor Message Wall services can import `db` from
`src/lib/firebase.ts`. Their schemas, authentication/abuse controls, validation,
queries, indexes, rules and error handling must be designed and tested together
before enabling access. Neither feature, messaging, uploads, moderation, cooldowns
nor location detection is implemented by this foundation.


Foundation verification: TypeScript and production build pass without Firebase
configuration. Local module checks cover missing/partial/blank configuration,
complete public test configuration and app/Firestore reuse across reloads without
remote calls. Reduced-motion browser smoke checks cover rendered sections,
showcase tab selection, About navigation and mobile overflow with no page errors.
The rules dry-run stopped at missing cloud authentication; rules compilation and
remote access remain unverified. Static review finds all reads/writes (including
nested paths, schema/ownership tampering and role escalation) denied by the
single unconditional false rule. No feature schema or queries exist yet.
