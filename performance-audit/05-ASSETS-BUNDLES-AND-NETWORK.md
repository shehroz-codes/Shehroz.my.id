# Assets, bundles and network

Snapshot `6839347096468ec0ff98a5c01e5a1df0f03e1cfd`, branch `work`. Measurements collected 14 November 2026; report completed during the 15 November resumption. Sources: [asset inventory](evidence/asset-inventory.json), [build inventory](evidence/build-assets.json), [module attribution](evidence/bundle-modules.json), [build log](evidence/build.log), and [resource timing](evidence/desktop-constrained-cold-1.json). Bytes are exact file sizes unless labeled otherwise. MB/kB are decimal. This is a local production build with preview backend, not an inspected live CDN deployment.

## Asset inventory

| Asset | File path | Bytes | Used by | Load stage | Performance impact |
| --- | --- | --- | --- | --- | --- |
| apple-touch-icon.png | `public/icons/apple-touch-icon.png` | 73,463 | Document / manifest icon metadata | Browser-dependent icon/manifest fetch | Do not count every icon in the page initial transfer |
| favicon-96x96.png | `public/icons/favicon-96x96.png` | 24,161 | Document / manifest icon metadata | Browser-dependent icon/manifest fetch | Do not count every icon in the page initial transfer |
| favicon.ico | `public/icons/favicon.ico` | 15,086 | Document / manifest icon metadata | Browser-dependent icon/manifest fetch | Do not count every icon in the page initial transfer |
| favicon.svg | `public/icons/favicon.svg` | 32,367 | Document / manifest icon metadata | Browser-dependent icon/manifest fetch | Do not count every icon in the page initial transfer |
| site.webmanifest | `public/icons/site.webmanifest` | 474 | Document / manifest icon metadata | Browser-dependent icon/manifest fetch | Do not count every icon in the page initial transfer |
| web-app-manifest-192x192.png | `public/icons/web-app-manifest-192x192.png` | 82,775 | PillNav brand logo | Initial render | 82.8 kB PNG; identity artwork is protected |
| web-app-manifest-512x512.png | `public/icons/web-app-manifest-512x512.png` | 466,677 | Web app manifest icon | Manifest/install consumer, not proven initial fetch | 466.7 kB; absence from TS imports does not mean unused |
| card-back.png | `public/images/lanyard/card-back.png` | 1,822,339 | HeroLanyard / Lanyard | After lazy chunk and procedural setup | Critical first-card transfer; preserve both original faces |
| card-front.png | `public/images/lanyard/card-front.png` | 2,394,468 | HeroLanyard / Lanyard | After lazy chunk and procedural setup | Critical first-card transfer; preserve both original faces |
| iconpattern.svg | `public/sections/about/iconpattern.svg` | 1,094 | ProfileCard mask/backdrop | CSS / initial card styling | Small SVG; retain gradients and mask; Vite emits backdrop asset |
| portrait-backdrop.svg | `public/sections/about/portrait-backdrop.svg` | 5,798 | ProfileCard mask/backdrop | CSS / initial card styling | Small SVG; retain gradients and mask; Vite emits backdrop asset |
| profile.png | `public/sections/about/profile.png` | 640,933 | ProfileCard via profile config | Browser lazy, observed near initial load | 0.64 MB; browser threshold does not prevent initial request |
| anime-portrait.png | `src/sections/assets/portraits/anime-portrait.png` | 1,008,321 | HalftonePortrait | Eager initial img plus texture Image | 1.01 MB competes with Hero; defer initialization only with scroll/deep-link tests |
| real-portrait.png | `src/sections/assets/portraits/real-portrait.png` | 640,933 | HalftonePortrait | Eager initial img | Duplicate decoded pixels and bytes of About portrait under a different URL |
| profile.png | `src/sections/components/contact/assets/profile.png` | 1,853,228 | ContactProfile | Lazy near Contact | 1.85 MB below fold; not an initial Hero transfer in recorded run |
| antigravity.svg | `src/sections/components/showcase/assets/antigravity.svg` | 7,949 | TechStackPanel | Selected toolkit panel | Small SVG; not a material first-card bottleneck |
| certificate-1.webp | `src/sections/components/showcase/assets/certificate-1.webp` | 30,218 | CertificatesPanel / document modal | Selected Certificates panel or document interaction | Not every emitted file downloads on first navigation |
| certificate-2.webp | `src/sections/components/showcase/assets/certificate-2.webp` | 39,318 | CertificatesPanel / document modal | Selected Certificates panel or document interaction | Not every emitted file downloads on first navigation |
| certificate-sample.pdf | `src/sections/components/showcase/assets/certificate-sample.pdf` | 59,774 | CertificatesPanel / document modal | Selected Certificates panel or document interaction | Not every emitted file downloads on first navigation |
| experience-sample.pdf | `src/sections/components/showcase/assets/experience-sample.pdf` | 51,069 | ExperiencePanel / document modal | Selected Experience panel or document interaction | Sample content; preserve truthful labels |
| letter-1.webp | `src/sections/components/showcase/assets/letter-1.webp` | 22,648 | ExperiencePanel / document modal | Selected Experience panel or document interaction | Sample content; preserve truthful labels |
| letter-2.webp | `src/sections/components/showcase/assets/letter-2.webp` | 34,576 | ExperiencePanel / document modal | Selected Experience panel or document interaction | Sample content; preserve truthful labels |
| project-1.webp | `src/sections/components/showcase/assets/project-1.webp` | 21,252 | ProjectCard / details | Lazy preview, selected Projects panel | Four previews total 107,566 bytes; already WebP with dimensions |
| project-2.webp | `src/sections/components/showcase/assets/project-2.webp` | 31,860 | ProjectCard / details | Lazy preview, selected Projects panel | Four previews total 107,566 bytes; already WebP with dimensions |
| project-3.webp | `src/sections/components/showcase/assets/project-3.webp` | 37,682 | ProjectCard / details | Lazy preview, selected Projects panel | Four previews total 107,566 bytes; already WebP with dimensions |
| project-4.webp | `src/sections/components/showcase/assets/project-4.webp` | 16,772 | ProjectCard / details | Lazy preview, selected Projects panel | Four previews total 107,566 bytes; already WebP with dimensions |
| react.svg | `src/sections/components/showcase/assets/react.svg` | 2,930 | Showcase data icon imports | Build may inline SVG / render selected use | Raw-file presence is not proof of a separate request |
| tailwindcss.svg | `src/sections/components/showcase/assets/tailwindcss.svg` | 606 | Showcase data icon imports | Build may inline SVG / render selected use | Raw-file presence is not proof of a separate request |
| typescript.svg | `src/sections/components/showcase/assets/typescript.svg` | 1,298 | Showcase data icon imports | Build may inline SVG / render selected use | Raw-file presence is not proof of a separate request |
| vite.svg | `src/sections/components/showcase/assets/vite.svg` | 913 | Showcase data icon imports | Build may inline SVG / render selected use | Raw-file presence is not proof of a separate request |
| inter Latin variable WOFF2 | `node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2` | 48,256 | Global typography | CSS font discovery | Self hosted, swap; preserve family and metrics |
| space-grotesk Latin variable WOFF2 | `node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2` | 22,288 | Global typography | CSS font discovery | Self hosted, swap; preserve family and metrics |
| jetbrains-mono Latin variable WOFF2 | `node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2` | 40,404 | Global typography | CSS font discovery | Self hosted, swap; preserve family and metrics |

The inventory's `references` field was generated by textual filename matching: it can include tests or unrelated files using the same basename. The explicit Used by column above resolves the actual active consumer. For example ContactProfile imports its own portrait; About uses the public profile URL. Source images and a build-emitted counterpart are the same resource, not two transfers merely because both exist on disk. The build asset list is not a HAR of all navigation downloads.

## Emitted JavaScript and CSS

| Production chunk | Raw bytes | Diagnostic gzip bytes |
| --- | --- | --- |
| `assets/Lanyard-BUJBlfLP.css` | 595 | 325 |
| `assets/Lanyard-CD_tL8ZQ.js` | 594,388 | 150,221 |
| `assets/RotatingText-B7BL-bgu.css` | 624 | 310 |
| `assets/RotatingText-UhVjntJK.js` | 164,358 | 54,926 |
| `assets/index-Bk1_npaR.js` | 505,710 | 162,019 |
| `assets/index-bD8Zdz39.css` | 116,159 | 24,745 |
| `assets/supabaseBackend-CRslbejq.js` | 5,351 | 2,119 |

The gzip column is an offline compressor estimate from `build-assets.json`; it is **not** the browser's encoded transfer count. Vite's build log estimates 164.54 kB initial JS, 152.66 kB Lanyard, 55.59 kB RotatingText and 25.01 kB initial CSS. The static server's gzip bodies in the representative run are 163,119 / 151,567 / 55,085 / 24,907 bytes respectively. Compressor settings explain these small differences. PNG, WebP and WOFF2 were not additionally gzipped by the server.

The shell is 505,710 raw bytes and Lanyard 594,388; Vite emitted its >500 kB advisory. This is a diagnostic threshold, not an automatic failure or a request to hide the warning. The initial bundle includes React DOM, navigation, GlowCursor, About, Interests/Halftone, showcase panels and Contact UI. Bundle analysis reports 164 shell modules. Large pre-minification rendered contributions include React DOM ~529,550 bytes, GlowCursor 33,321, PillNav 29,392, selected simple-icons code 28,324, Halftone 26,673, WarpText 20,518 and VisitorComposer 18,379. These are attribution sizes before final minification; they must not be summed with transfer sizes.

Lanyard's four modules include Three.js module/core (~540,963 / 366,210 pre-minification rendered bytes), custom card code (~50,000) and CSS. RotatingText includes 302 modules from Motion and supporting code. Dynamic imports already separate these paths, but a visible Hero requests both early. A separate chunk is not necessarily off the initial critical path.

The default `supabaseBackend` chunk is only 5,351 raw bytes because this no-credentials preview build allows the SDK guard to be folded away. **Do not treat it as the configured live Supabase bundle budget.** Firebase has source support for an inactive like feature but no module in this measured browser bundle. No code-coverage experiment establishes that every unused-looking export or dependency can be deleted. Package installation size is not page transfer size.

## Observed loading order

Constrained desktop cold run 1, seconds from navigation:

| Resource (local base omitted) | Start s | End s | Duration s | Encoded body bytes | Blocking status |
| --- | --- | --- | --- | --- | --- |
| assets/index-Bk1_npaR.js | 0.213 | 1.325 | 1.112 | 163,119 | non-blocking |
| assets/index-bD8Zdz39.css | 0.216 | 0.635 | 0.419 | 24,907 | blocking |
| assets/inter-latin-wght-normal-Dx4kXJAl.woff2 | 1.730 | 3.657 | 1.927 | 48,256 | non-blocking |
| assets/portrait-backdrop-DMgJuG56.svg | 1.751 | 1.925 | 0.174 | 1,569 | non-blocking |
| assets/space-grotesk-latin-wght-normal-BhU9QXUp.woff2 | 1.810 | 2.917 | 1.107 | 22,288 | non-blocking |
| assets/jetbrains-mono-latin-wght-normal-B9CIFXIH.woff2 | 1.817 | 3.478 | 1.661 | 40,404 | non-blocking |
| assets/real-portrait-C4jtm2R7.png | 2.087 | 17.225 | 15.138 | 640,933 | non-blocking |
| assets/anime-portrait-vfLZxsfa.png | 2.087 | 22.932 | 20.845 | 1,008,321 | non-blocking |
| sections/about/profile.png | 2.194 | 17.810 | 15.616 | 640,933 | non-blocking |
| assets/RotatingText-UhVjntJK.js | 3.464 | 5.536 | 2.072 | 55,085 | non-blocking |
| assets/RotatingText-B7BL-bgu.css | 3.467 | 3.666 | 0.199 | 309 | non-blocking |
| assets/Lanyard-CD_tL8ZQ.js | 3.494 | 7.992 | 4.498 | 151,567 | non-blocking |
| assets/Lanyard-BUJBlfLP.css | 3.498 | 3.847 | 0.348 | 324 | non-blocking |
| images/lanyard/card-front.png | 8.936 | 37.236 | 28.300 | 2,394,468 | non-blocking |
| images/lanyard/card-back.png | 8.940 | 34.396 | 25.456 | 1,822,339 | non-blocking |

The initial CSS is render-blocking; fonts are self hosted and swap. Source-level `loading="lazy"` on About is advisory: its 640,933-byte image starts at ~2.19 s. Interests starts both real/anime images at ~2.09 s, before the card chunk arrives. The artwork starts only at ~8.94 s after card setup, ending at ~34.40 / 37.24 s. Thus network competition and resource discovery are supported findings. The exact saved time from rescheduling a particular image remains unmeasured.

Two card faces total **4,216,807 bytes**. At this test's 200,000 B/s cap, just those bytes require an ideal 21.08 s of aggregate transfer, before competing data or scheduling. Replacing both faces with static art is not a preferred optimization. Earlier fetching and identical-pixel encoding are experiments that can preserve the experience. The current About portrait and imported real portrait have identical SHA-256 hashes but separate URLs; both requests occur. Reusing one URL could avoid one 640,933-byte cold transfer in this loading pattern. This is an upper bound on removed payload, not a measured time saving.

Halftone's separate `new Image` and `<img>` reference the same anime URL. Their existence does not prove a second full network download; browser coalescing/cache can reuse it. The portrait in Contact is different and must not be deduplicated solely because its filename is also profile.png.

## Cache and origin boundaries

The audit server returns `Cache-Control: public, max-age=600` for static assets, `no-cache` for HTML, `Vary: Accept-Encoding`, and gzip for JS/CSS/SVG/HTML. Warm navigation reuses a context/cache; each replicate starts with a new context and cold cache. Warm runs show the same URLs with cached transfers while graphics work remains. These modeled headers do not certify GitHub Pages cache policy, Brotli, TLS, HTTP/2/3, service-worker behavior or custom-domain routing.

Vite hashes imported asset/chunk names. Public PNGs have stable names; any future long immutable cache policy must pair content changes with URL versioning. No service worker is registered in the inspected source or measurement setup. Deployment uses `base: '/Shehroz.my.id/'`; no tracked CNAME establishes custom-domain setup. Canonical URLs and cross-origin headers need verification on the intended production hostname before changing metadata or caching.

## External and backend network

- Spotify artwork uses an external CDN. Desktop initial runs record one failed artwork request through the environment tunnel; mobile's initial snapshot records none. The on-demand embed iframe is created only after track selection; no initial autoplay is configured. Browser tests verified iframe creation, not successful Spotify playback. These failures are not evidence of a production service outage.
- Contact loads a backend adapter from its eager effect even when below the fold. In preview it reads local fixtures/local storage; no hosted Supabase credentials were introduced. In live source, `supabaseBackend.ts` requests only the published public feed columns, page size five plus one pagination row, with a 15 s timeout and 30 s polling. This is polling, not Supabase Realtime. A visibility-aware polling proposal needs fresh-data and error-state tests.
- Photo requests go through a public read edge function which verifies publication and returns no-store responses from a private bucket. Bypassing that check or caching private messages/photos publicly is not an acceptable speed optimization. User-submitted writes require server validation, authentication/Turnstile gates and cooldown behavior; no hosted submissions were made.
- Local unit and browser tests use preview or mocked APIs. RLS/migrations were reviewed statically; live schema, indexes, quotas, request latency, cache headers and delivery remain unverified. Existing contact release documentation warns about historical migration timestamp mismatch; do not replay migrations as part of a performance task.

## Opportunities, preserved behavior and risk

Priorities and full fields are in [report 07](07-OPTIMIZATION-ROADMAP.md): R01 earlier face requests, R02 duplicate portrait URL, R03 offscreen effect scheduling, R04 real-GPU profiling, R05 inactive panel splitting, R06 lossless asset experiment, R12 polling visibility. Keep WebP preview dimensions, self-hosted swap fonts, lazy embeds, existing lazy card split, cleanup, private/public data separation and all artwork. No numeric optimization gain is promised without a matched implementation experiment. SVG cleanup, compression level changes and dependency removal are low priority unless traces identify a material cost. CDN and server changes are proposals only and outside this read-only audit.
