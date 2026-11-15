# Shehroz.my.id — audit index

Read-only technical performance, recruiter/UX and market audit for Muhammad Shehroz. Available source: branch `work`, commit `6839347096468ec0ff98a5c01e5a1df0f03e1cfd`. The requested `perf/portfolio-speed-optimization` branch and its historical uncommitted diff were not available. Source was preserved; this is not a before/after validation of that missing optimization.

Evidence collected 14 November 2026; resumed 15 November. No primary benchmark was repeated. Only focused portrait-keyboard and project Details checks were added. [Progress checkpoint](PROGRESS-CHECKPOINT.md) records recovery/milestones and [documentation verification](DOCUMENTATION-VERIFICATION.md) records final checks.

**COMPLETE — All required deliverables verified for the available snapshot.** The historical branch/live-service/physical-device limitations below remain explicit; completion does not imply implementation or deployment.

## Start here

- [Executive summary](00-EXECUTIVE-SUMMARY.md) — conclusions and priority decisions.
- [Combined standalone report](PERFORMANCE-AUDIT-COMPLETE.md) — essential technical/market evidence, full roadmap and handover in one file. Does not substitute for full source/raw traces.
- [AI engineering handover](08-AI-ENGINEERING-HANDOVER.md) — source/authority boundaries, causal findings and next exact action.
- [Chromium results](06-CHROMIUM-PERFORMANCE-RESULTS.md) — every run, methodology, interactions and limitations.

## Required reports

| File | Contents |
|---|---|
| [00-EXECUTIVE-SUMMARY.md](00-EXECUTIVE-SUMMARY.md) | Overall state, measured findings and top priorities |
| [01-ARCHITECTURE-AND-TECH-STACK.md](01-ARCHITECTURE-AND-TECH-STACK.md) | Stack, hierarchy, lifecycle, backend/deployment and complete module inventory |
| [02-HERO-3D-LANYARD-DEEP-DIVE.md](02-HERO-3D-LANYARD-DEEP-DIVE.md) | Original 3D implementation, timeline, native graphics limits and preserved design |
| [03-ABOUT-SECTION-DEEP-DIVE.md](03-ABOUT-SECTION-DEEP-DIVE.md) | Eager mount, portraits, reveal timing and distinct readiness experiments |
| [04-ALL-SECTIONS-ANALYSIS.md](04-ALL-SECTIONS-ANALYSIS.md) | Actual page/tab/subsection inventory |
| [05-ASSETS-BUNDLES-AND-NETWORK.md](05-ASSETS-BUNDLES-AND-NETWORK.md) | Assets, bundles, resource timing, duplicate portraits, caching and backend boundary |
| [06-CHROMIUM-PERFORMANCE-RESULTS.md](06-CHROMIUM-PERFORMANCE-RESULTS.md) | Real Chromium matrix, trace analysis, tests, screenshots and caveats |
| [07-OPTIMIZATION-ROADMAP.md](07-OPTIMIZATION-ROADMAP.md) | Sixteen fully specified recommendations in three tiers |
| [08-AI-ENGINEERING-HANDOVER.md](08-AI-ENGINEERING-HANDOVER.md) | Independent engineering continuation and protected invariants |
| [09-PORTFOLIO-RECRUITER-UX-MARKET-RESEARCH.md](09-PORTFOLIO-RECRUITER-UX-MARKET-RESEARCH.md) | Eighteen-part recruiter/UX/market review, scorecard and full sources |

## Individual sections

- [Navbar](sections/01-navbar.md)
- [Hero introduction and actions](sections/02-hero.md)
- [Interactive 3D Lanyard](sections/03-lanyard.md)
- [About and ProfileCard](sections/04-about.md)
- [Compact About skills](sections/05-compact-skills.md)
- [My Interests and HalftonePortrait](sections/06-interests.md)
- [Music playlist](sections/07-music-playlist.md)
- [Projects and showcase shell](sections/08-projects-showcase.md)
- [Certificates](sections/09-certificates.md)
- [Experience](sections/10-experience.md)
- [Development Toolkit / Tech Stack](sections/11-development-toolkit.md)
- [Contact and private-message form](sections/12-contact.md)
- [Visitor Wall and public composer](sections/13-visitor-wall.md)
- [Footer](sections/14-footer.md)
- [Global GlowCursor and shared visual effects](sections/15-global-effects.md)

## Supporting evidence and provenance

- [Research source register](RESEARCH-SOURCES.md) and [source JSON](evidence/research-sources.json): seventeen sources, dates, evidence/portfolio connection and access limitations. Previously verified notes were reused; raw web exports did not survive.
- [Machine-readable recommendations](RECOMMENDATIONS.json): the same sixteen entries as report 07, with evidence, priorities, impact, risk, confidence, tests and future approval requirements.
- [Primary measurements](evidence/all-measurements.json): sixteen preserved navigation records. [Direct About](evidence/direct-about.json): four separate initial-entry runs.
- [Startup trace](evidence/startup-trace.json.gz), [CPU profile](evidence/startup.cpuprofile), [GL probe](evidence/gl-startup.json) and [trace summary](evidence/trace-summary.json).
- [Desktop functional results](evidence/functional-desktop.json), [mobile results](evidence/functional-mobile.json), [corrected follow-up](evidence/followup.json), [new targeted checks](evidence/resume-targeted-checks.json), [reduced motion](evidence/reduced-motion.json).
- [Desktop trace](evidence/functional-desktop.zip) and [mobile trace](evidence/functional-mobile.zip); screenshots listed in [evidence index](evidence/README.md).
- [Asset inventory](evidence/asset-inventory.json), [bundle modules](evidence/bundle-modules.json), [component inventory](evidence/component-inventory.json), [augmented use-identifier inventory](evidence/component-hooks-verified.json), [dependency versions](evidence/dependency-versions.json).
- [Build](evidence/build.log), [typecheck](evidence/typecheck.log), [77 unit tests](evidence/unit-tests.log), [eight browser tests](evidence/existing-tests.log); development browser-suite font limitation documented in report 06.
- [Original master instruction](evidence/ORIGINAL-MASTER-PROMPT.txt), [initial file hashes](evidence/initial-sha256.json), [resume recovery](evidence/resume-recovery.json), [final integrity](evidence/final-integrity.json).
- [Diagnostic scripts and reproduction notes](diagnostics/README.md). Scripts preserve workspace paths and original harness failures; do not overwrite the baseline on a future rerun.

## Interpretation limits

These are local production-bundle tests with Chromium 156, SwiftShader software graphics and preview backend. Card readiness is a render-return proxy; About after-scroll and direct-entry clocks differ. The custom blocking sum is not Lighthouse TBT. No field INP/CrUX, physical-GPU prediction, full WCAG conformance, live Supabase delivery, production cache verification or historical pixel-identical optimization claim is made. No new application implementation, commit, push, merge or deployment occurred. See the checkpoint and verification record for final status.
