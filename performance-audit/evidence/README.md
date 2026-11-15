# Evidence inventory

All original collected artifacts were copied intact from `/workspace/work/audit/evidence` after recovery. Evidence is diagnostic data, not a source-code distribution. Main benchmark/research collection is 14 November 2026; `resume-*` interaction/recovery artifacts are 15 November. Some filesystem modification timestamps reflect resumption/copying; JSON contents/logs and cohort labels govern measurement provenance.

`all-measurements.json` includes the sixteen complete primary records, duplicated intentionally as per-run JSON for easier independent inspection. `direct-about.json` contains four fresh-entry runs. `functional-*.zip` are Playwright traces; `startup-trace.json.gz` is a compressed Chromium trace; `startup.cpuprofile` is a V8 CPU profile. No application source map files are bundled; `bundle-modules.json` provides module attribution.

`functional-*.json` retain two original harness failures per viewport. `followup.json` resolves About tilt and preview/modal checks but retains the ambiguous `.hp` selector failure. `resume-targeted-checks.json` resolves the portrait keyboard and actual Details button paths. Keeping these records avoids silently presenting failed automation as a source fix. `existing-test-results` is the original repository browser runner output. The development-font 403s are a documented test-environment limitation.

Research raw web exports did not survive; `research-sources.json` is a durable reconstruction from retained verified notes, with the snippet-only source clearly labeled. External-source access dates are not publication dates. Original user historical optimization values are in `ORIGINAL-MASTER-PROMPT.txt` and remain unverified. No hosted messages/private records were retrieved for this audit.

## Screenshots

| Capture | Purpose |
|---|---|
| [desktop-constrained-cold-1-about.png](desktop-constrained-cold-1-about.png) | Initial or primary cold-run snapshot |
| [desktop-constrained-cold-1.png](desktop-constrained-cold-1.png) | Initial or primary cold-run snapshot |
| [desktop-fast-cold-1-about.png](desktop-fast-cold-1-about.png) | Initial or primary cold-run snapshot |
| [desktop-fast-cold-1.png](desktop-fast-cold-1.png) | Initial or primary cold-run snapshot |
| [desktop-initial.png](desktop-initial.png) | Initial or primary cold-run snapshot |
| [mobile-constrained-cold-1-about.png](mobile-constrained-cold-1-about.png) | Initial or primary cold-run snapshot |
| [mobile-constrained-cold-1.png](mobile-constrained-cold-1.png) | Initial or primary cold-run snapshot |
| [mobile-fast-cold-1-about.png](mobile-fast-cold-1-about.png) | Initial or primary cold-run snapshot |
| [mobile-fast-cold-1.png](mobile-fast-cold-1.png) | Initial or primary cold-run snapshot |
| [resume-desktop-portrait-enter.png](resume-desktop-portrait-enter.png) | New focused Enter/Space interaction |
| [resume-desktop-portrait-space.png](resume-desktop-portrait-space.png) | New focused Enter/Space interaction |
| [resume-mobile-portrait-enter.png](resume-mobile-portrait-enter.png) | New focused Enter/Space interaction |
| [resume-mobile-portrait-space.png](resume-mobile-portrait-space.png) | New focused Enter/Space interaction |
| [ui-desktop-about.png](ui-desktop-about.png) | Functional layout / interaction capture |
| [ui-desktop-certificates.png](ui-desktop-certificates.png) | Functional layout / interaction capture |
| [ui-desktop-contact.png](ui-desktop-contact.png) | Functional layout / interaction capture |
| [ui-desktop-experience.png](ui-desktop-experience.png) | Functional layout / interaction capture |
| [ui-desktop-footer.png](ui-desktop-footer.png) | Functional layout / interaction capture |
| [ui-desktop-hero-settled.png](ui-desktop-hero-settled.png) | Functional layout / interaction capture |
| [ui-desktop-hero.png](ui-desktop-hero.png) | Functional layout / interaction capture |
| [ui-desktop-interests.png](ui-desktop-interests.png) | Functional layout / interaction capture |
| [ui-desktop-lanyard-back.png](ui-desktop-lanyard-back.png) | Functional layout / interaction capture |
| [ui-desktop-lanyard-drag.png](ui-desktop-lanyard-drag.png) | Functional layout / interaction capture |
| [ui-desktop-music.png](ui-desktop-music.png) | Functional layout / interaction capture |
| [ui-desktop-projects.png](ui-desktop-projects.png) | Functional layout / interaction capture |
| [ui-desktop-tech-stack.png](ui-desktop-tech-stack.png) | Functional layout / interaction capture |
| [ui-desktop-visitor-wall.png](ui-desktop-visitor-wall.png) | Functional layout / interaction capture |
| [ui-mobile-about.png](ui-mobile-about.png) | Functional layout / interaction capture |
| [ui-mobile-certificates.png](ui-mobile-certificates.png) | Functional layout / interaction capture |
| [ui-mobile-contact.png](ui-mobile-contact.png) | Functional layout / interaction capture |
| [ui-mobile-experience.png](ui-mobile-experience.png) | Functional layout / interaction capture |
| [ui-mobile-footer.png](ui-mobile-footer.png) | Functional layout / interaction capture |
| [ui-mobile-hero-settled.png](ui-mobile-hero-settled.png) | Functional layout / interaction capture |
| [ui-mobile-hero.png](ui-mobile-hero.png) | Functional layout / interaction capture |
| [ui-mobile-interests.png](ui-mobile-interests.png) | Functional layout / interaction capture |
| [ui-mobile-lanyard-back.png](ui-mobile-lanyard-back.png) | Functional layout / interaction capture |
| [ui-mobile-lanyard-drag.png](ui-mobile-lanyard-drag.png) | Functional layout / interaction capture |
| [ui-mobile-music.png](ui-mobile-music.png) | Functional layout / interaction capture |
| [ui-mobile-projects.png](ui-mobile-projects.png) | Functional layout / interaction capture |
| [ui-mobile-tech-stack.png](ui-mobile-tech-stack.png) | Functional layout / interaction capture |
| [ui-mobile-visitor-wall.png](ui-mobile-visitor-wall.png) | Functional layout / interaction capture |
| [ui-reduced-motion.png](ui-reduced-motion.png) | Functional layout / interaction capture |

## Integrity and complete file list

[Artifact manifest](artifact-manifest.json) records byte counts and SHA-256 for retained evidence (excluding itself and this index). [Final integrity](final-integrity.json) compares all original tracked files and Git HEAD/status. [Documentation verification](../DOCUMENTATION-VERIFICATION.md) records link/source/coverage checks.
