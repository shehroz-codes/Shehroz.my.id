# Portfolio audit — executive summary

Audit date: 14 November 2026. Owner: Muhammad Shehroz, Lahore, Pakistan. Inspected checkout: `/workspace/Shehroz.my.id`, branch `work`, commit `6839347096468ec0ff98a5c01e5a1df0f03e1cfd`. Evidence labels: **S — verified source**, **O — direct local-browser observation**, **M — measured lab result**, **R — verified external research**, **J — professional judgment**, **H — unverified hypothesis**.

The requested `perf/portfolio-speed-optimization` branch was absent locally and from the accessible GitHub branch listing. The initial checkout was clean. Historical 38.1→22.2 s Hero, 19.1→13.3 s About, 16 browser tests and pixel-identical frames remain user-provided history, not verified before/after results. Current source and existing documentation were preserved. This audit makes no application changes.

Browser results describe a production Vite build served locally with explicit gzip and cache headers, default **preview** Contact configuration, Chromium 156 and **SwiftShader software graphics**. They are not measurements of the deployed domain or real-user field data. Public-site access failed through the environment proxy and web retrieval tool. Live Supabase configuration, delivery and hosted caching were not verified.

## Overall assessment

**J:** This is a distinctive, cohesive frontend demonstration with a substantial custom interaction implementation. Its current presentation is not yet a strong evidence package for employment or freelance conversion: the project gallery contains concepts/placeholders, no project live/source URLs are supplied, and the Hero CV and contact actions do not complete their advertised tasks. Keep the violet/indigo identity, artwork, dimensions and preferred interactions. Prioritize usable contact and verified project evidence alongside invisible loading work.

## Principal findings

1. **M/S — slow card readiness has a substantial transfer component.** Front/back PNGs total **4,216,807 bytes**. In desktop constrained cold run 1, their requests began near 8.94 s, the last response ended at 37.24 s, and the first-render marker appeared at 38.60 s. Real/anime/About portraits also transfer early. Start artwork work earlier and reduce competing initial work, preserving both card faces and their pixels.
2. **M — warm caches do not eliminate desktop cost.** Median first-frame marker: 38.64 s constrained cold / 8.96 s constrained warm; 5.81 s unthrottled cold / 5.19 s unthrottled warm. The diagnostic trace contains an overlapping 2.82 s graphics task/commit; this is software-renderer evidence, not proof of a specific hardware shader bottleneck.
3. **S/M — About is eager, with an intentional reveal gate.** It mounts in the initial React tree, uses no WebGL itself, and has no Suspense boundary. Its 11 skills yield an actions animation ending nominally 2.75 s after intersection. The observed post-scroll readiness range was 3.08–5.22 s across the main runs. Delaying the user's scroll also delays navigation-relative readiness; those clocks must not be conflated.
4. **S — startup includes avoidable unrelated work.** Interests creates its WebGL context at mount and eagerly references two portraits. The identical 640,933-byte real portrait is served at two URLs. Lower-page section implementations are eagerly imported, alongside 116,159 bytes of initial CSS; Lanyard and rotating role text retain separate lazy chunks. Firebase, PulseHeart and the like hook are not in the active UI path.
5. **O/S — conversion gaps outweigh any need for a new visual theme.** `cvPath` and `contactHref` are null in Hero data. About contact routes to GitHub. Project, certificate and employment materials are explicitly labeled samples. These honest labels should remain until real records replace them.
6. **S/O — accessibility and discovery need targeted work.** The card has pointer interactions but no keyboard flip control. There is no skip link, meaningful description metadata, canonical link or social-preview metadata. Automated accessibility results and manual limitations are detailed in report 06/09; an automated scan is not WCAG certification.

## Measurements

| Profile | Cache | Runs | FCP / observed LCP (s) | Card first-frame marker (s) | About after scroll (s) |
| --- | --- | --- | --- | --- | --- |
| desktop-fast | cold | 2 | 0.68 | 5.81 | 4.20 |
| desktop-fast | warm | 2 | 0.58 | 5.18 | 3.89 |
| mobile-fast | cold | 2 | 0.78 | 1.87 | 3.37 |
| mobile-fast | warm | 2 | 0.50 | 1.54 | 3.17 |
| desktop-constrained | cold | 2 | 2.28 | 38.64 | 5.00 |
| desktop-constrained | warm | 2 | 1.57 | 8.96 | 4.73 |
| mobile-constrained | cold | 2 | 2.86 | 38.15 | 3.56 |
| mobile-constrained | warm | 2 | 1.09 | 3.25 | 3.69 |

FCP/LCP refer to text/image candidates; the interactive WebGL card is not represented by that LCP value. Card readiness means the existing `data-ready=true` marker after `renderer.render`, not guaranteed GPU presentation, settled animation or input responsiveness. About means actions reveal complete and portrait images loaded after an explicit instant scroll. Two samples per condition support a directional comparison, not a population percentile.

## First priorities

- **High:** recover the missing optimization branch/work before proposing replacement patches; reproduce this audit on its exact diff.
- **High:** begin both card image requests before expensive renderer setup; prioritize them against below-fold portrait/graphics initialization. Preserve the original art and all interactions.
- **High:** provide a real CV, a working contact destination and one genuine portfolio case study with source/demo evidence. Do not invent client work or employment.
- **High:** provide keyboard access to the card's flip function; review continuous motion controls and focus behavior.
- **Medium:** use one URL for identical portrait bytes, investigate pixel-preserving asset encoding, and defer inactive showcase modules while retaining navigation/layout dimensions.
- **Medium:** add accurate metadata after confirming the intended canonical hostname. The repository deploys a GitHub Pages project path; custom-domain operation was not verified.

All implementation is future work requiring owner authorization. No redesign, schema action, deployment, commit or push was performed. See [roadmap](07-OPTIMIZATION-ROADMAP.md), [Chromium evidence](06-CHROMIUM-PERFORMANCE-RESULTS.md), [market review](09-PORTFOLIO-RECRUITER-UX-MARKET-RESEARCH.md) and [combined handover](PERFORMANCE-AUDIT-COMPLETE.md).
