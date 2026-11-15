# Diagnostic scripts

These scripts generated or inspected audit evidence without changing application source. They preserve original absolute paths under `/workspace/work/audit` and `/workspace/Shehroz.my.id`. They are reproducibility aids, not a portable product or CI installation. Review path constants before use; choose a **new** output directory to avoid overwriting saved evidence.

| Script | Purpose / limitation |
|---|---|
| `server.cjs` | GET/HEAD-only static production build server, port 4180, gzip text assets, static max-age=600, HTML no-cache; models local headers only |
| `measure.cjs` | 16-run primary matrix, buffered observers and custom markers; footer selector was corrected after saved runs, so no historical footer timestamp exists |
| `direct-about.cjs` | Four fresh constrained hash-entry runs, explicit instant scroll to attached About; images plus action-animation completion |
| `deep-trace.cjs` | Separate GL wrapper, CDP trace and V8 CPU profile; probe overhead means timings are not primary benchmarks |
| `probe.cjs` | Initial browser/source-DOM reconnaissance |
| `functional.cjs` | Desktop/mobile interactions, screenshots, Playwright traces and axe; retains original two locator/stability failures |
| `followup.cjs` | Corrected About tilt and preview/modal checks; portrait `.hp` selector remained ambiguous |
| `resume-keyboard.cjs` | Only new resumed browser checks: exact `.mi-portrait` Enter/Space and named project Details/focus/Escape, both viewports |
| `analyze-build.mjs` | Separate diagnostic source-map/module inventory build; original application/build directory unchanged |
| `existing-tests.config.mjs` | Temporary override of repository Playwright config for installed Chromium, isolated copy/output; original config unchanged |
| `verify-docs.py` | Documentation/evidence validation, source-path/line checks and all-original-file hash/Git comparison; writes audit evidence only |

Main evidence was collected on 14 November 2026. Targeted resumed interaction results are dated 15 November. Browser version, throttling, viewports, software GPU and readiness definitions are in [report 06](../06-CHROMIUM-PERFORMANCE-RESULTS.md). The primary scripts are diagnostic programs, not independent assertion suites for every metric. Keyboard portrait confirmation includes source inspection and retained screenshots; the script itself logs focus/attributes.

The isolated copy reused installed `node_modules` by symlink. Existing development-server tests consequently had blocked font requests; do not use their screenshots for typography equivalence. Production asset requests succeeded. No dependency reinstall, environment change, hosted submission or configuration edit was performed.

To reproduce later, obtain the exact source SHA plus any previously missing uncommitted optimization diff, build in a fresh diagnostic directory with the same configuration, point a copied server/harness at it, record browser/GPU/host conditions, and write a new labeled evidence cohort. Review mocked/preview assumptions before any run. Saved measurements are sufficient for this audit; no routine rerun is required.
