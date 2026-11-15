# Optimization and professional improvement roadmap

All entries are **proposals**, not implemented work. This task authorizes documentation and diagnostics only. “Approval required” below describes future implementation authority; it is not a request to interrupt this audit for permission. No source/configuration/dependency/database/design/content change was made. No measured numeric benefit is invented. Sources use the verified snapshot `6839347096468ec0ff98a5c01e5a1df0f03e1cfd`; external S01–S17 IDs resolve in [the research register](RESEARCH-SOURCES.md).

## Ordering and three tiers

| Tier | Work | Why and sequencing |
|---|---|---|
| 1 — High value, comparatively low risk | R01 earlier original images, R02 shared portrait, R07 real CV/contact, R08 factual positioning, R11 metadata after host verification, R13 missing-history/live verification, R16 preserve strengths | Resolve source/history boundaries first. Small proposed code/content changes can yield clear user value; low risk is relative, not exemption from tests or owner authorization |
| 2 — Moderate complexity | R03 offscreen lifecycle, R04 GPU attribution, R05 panel splitting, R06 lossless encoding experiment, R09 real project evidence, R10 accessible equivalents, R12 polling visibility | Test one hypothesis at a time and keep networking, native rendering and perceived completion clocks distinct |
| 3 — Optional strategy | R14 genuine additional evidence/writing, R15 visible ordering or timing experiments | Only after core action/proof/loading gaps; no new section, redesign or animation reduction is required by this audit |

Priorities are High/Medium/Optional, with no invented Critical incident. Tier is complexity/strategy, not urgency: accessible operation and genuine proof are high priority despite medium effort. A future engineer should first recover the missing optimization diff if possible and avoid applying duplicate work. The best early technical experiment is starting the existing image requests earlier; the clearest recruiter improvement is a real CV/contact/project journey. These can proceed independently after future authorization.

## Recommendation register

## R01 — Start original badge image requests earlier

Classification: **Optimize Internally** · Priority: **High** · Tier: **1**

**Observed issue or opportunity:** Both face requests begin only after lazy code and synchronous renderer/environment/setup work.

**Affected sections / relevant files:** src/components/Hero/HeroLanyard.tsx; src/components/Lanyard/Lanyard.tsx:424,1141,1401–1440

**Evidence:** Constrained desktop cold 1: React ~2.085 s, chunk 3.494–7.992 s, faces start ~8.94 s; 4,216,807 image bytes. Report 02 and resource timings.

**Why it matters:** Current serial discovery lengthens the first-card critical path despite an existing lazy chunk.

**Suggested improvement:** Initiate the same two image promises earlier at the visible/near-visible Hero gate or before procedural setup, sharing the existing cache and preserving cross-origin mode, cancellation/error behavior and complete-first-frame gating. Establish exact insertion point in a future approved diff.

**Expected recruiter benefit:** Earlier recognizable identity and functioning badge without changing its visual story.

**Expected performance impact:** Expected overlap of download and setup; no measured saving or target seconds promised. Do not make all below-fold assets high priority.

**Visual impact:** None intended: identical files, dimensions, lighting, physics and render gating.

**Implementation complexity:** Low to medium; a small scheduling change with state/cache implications.

**Regression risk:** Duplicate requests, early bandwidth on reduced-motion/error paths, load races or stale cached promise after failure.

**Confidence level:** High on cause/order; medium on net speed gain until matched tests.

**Testing requirements:** Compare request start and encoded bytes on cold/warm profiles; test both face failures, reduced motion, resize, flip/drag; verify identical decoded pixels and matched deterministic 3D frames.

**Approval required:** Yes for any application change. No implementation in this audit.

## R02 — Share the identical real portrait resource

Classification: **Optimize Internally** · Priority: **Medium** · Tier: **1**

**Observed issue or opportunity:** About and Interests use byte-identical 640,933-byte PNGs at distinct URLs; both load during the measured initial request set.

**Affected sections / relevant files:** src/sections/config/profile.ts; src/sections/components/my-interests/interestsData.ts; public/sections/about/profile.png; src/sections/assets/portraits/real-portrait.png

**Evidence:** asset-inventory.json SHA-256 equality plus desktop-constrained-cold-1 resource entries; report 05.

**Why it matters:** Browser URL caches cannot deduplicate identical content across unrelated URLs automatically.

**Suggested improvement:** Choose a single existing image URL/import and update consumers in a future approved change; preserve image pixels, sizes, fallback, base path and alt semantics. Do not delete either source asset in this audit.

**Expected recruiter benefit:** Less time competing with visible identity; no new learning burden.

**Expected performance impact:** Potential removal of one 640,933-byte cold transfer in this observed pattern; not equivalent to a guaranteed 3.2 s time saving.

**Visual impact:** None intended; exact image bytes already match.

**Implementation complexity:** Low.

**Regression risk:** Incorrect Vite project-base path, cache mismatch or accidental selection of the different Contact portrait.

**Confidence level:** High for duplicated payload; medium for elapsed-time effect.

**Testing requirements:** Hash/decoded-pixel comparison, one-URL resource count, direct #about/#interests, cold/warm and image failure.

**Approval required:** Yes for code/content path changes.

## R03 — Delay offscreen graphics initialization without delaying layout

Classification: **Optimize Internally** · Priority: **High** · Tier: **2**

**Observed issue or opportunity:** Halftone context/program setup and portrait requests occur at initial mount despite being below fold; ProfileCard also starts an offscreen intro.

**Affected sections / relevant files:** src/sections/components/my-interests/HalftonePortrait.tsx; MyInterests.tsx and interestsData.ts in the same directory; src/sections/components/ProfileCard/ProfileCard.tsx

**Evidence:** Source effects; GL context probe; real/anime responses ~17.23 /22.93 s while badge waits. Reports 02,03,05.

**Why it matters:** Offscreen work competes for network/main/native graphics during visible Hero startup.

**Suggested improvement:** Separate stable DOM/reserved size from effect activation. Gate resource/setup work near the viewport with a fallback and activate immediately for deep links or rapid arrival. Treat ProfileCard intro phase carefully so its observed animation remains the same.

**Expected recruiter benefit:** Visible professional content becomes available with less unrelated startup competition.

**Expected performance impact:** Likely less initial transfer/setup, but saved milliseconds and fast-scroll behavior are unmeasured.

**Visual impact:** None intended; late popping, altered animation phase or missing first hover would be regressions.

**Implementation complexity:** Medium; lifecycle/observer and resource cancellation design.

**Regression risk:** Deep links, reverse scroll, context disposal/recreation, focus-triggered reveal, reduced-motion fallback and image failures.

**Confidence level:** High that work is eager; medium that rescheduling improves all devices.

**Testing requirements:** Default/#about/#interests entry; rapid scroll in both directions; first pointer/keyboard interaction; hidden-tab resume; resize; screenshots with synchronized state; resource timing comparison.

**Approval required:** Yes; any behavior or source change requires separate owner authorization.

## R04 — Attribute native graphics phases on a physical GPU before changing them

Classification: **Investigate Further** · Priority: **High** · Tier: **2**

**Observed issue or opportunity:** Warm desktop remains slow and a separate SwiftShader trace contains a ~2.82 s overlapping graphics/compositor task; context acquisition alone is small.

**Affected sections / relevant files:** src/components/Lanyard/Lanyard.tsx (PMREM, face painting, first render); src/components/GlowCursor/GlowCursor.tsx; src/components/WarpText/WarpText.tsx; HalftonePortrait.tsx

**Evidence:** startup-trace.json.gz, startup.cpuprofile, gl-startup.json and report 06. The dominant native time is not isolated to one shader.

**Why it matters:** A speculative shader rewrite or lower quality may destroy visual parity without fixing the actual cost.

**Suggested improvement:** In a separately authorized implementation environment, add phase marks around PMREM, geometry, decode, canvas painting, upload/first render; profile a physical desktop GPU and ordinary mobile device. Examine compileAsync only with supported extensions and the exact environment/material state. Consider deterministic procedural caches only when measured.

**Expected recruiter benefit:** Protects responsiveness while preserving distinctive visual work.

**Expected performance impact:** Unknown until attribution; no GPU percentage, FPS or seconds-saving guarantee.

**Visual impact:** Profiling itself none. Reusing environments/materials or changing compilation order must preserve color/lighting. DPR/solver/sample reductions are visible trade-offs.

**Implementation complexity:** Medium to high; suitable hardware and precise instrumentation.

**Regression risk:** Probe overhead, misleading native attribution, double-counted overlapping events, shared-resource disposal, shader-cache effects.

**Confidence level:** High on observed stall; low on a specific untested fix.

**Testing requirements:** Same source/browser/viewport/DPR/cache/network/CPU, trace metadata and multiple runs; test context loss, cleanup, both faces, first drag, matching frames.

**Approval required:** Read-only external diagnostics were already within audit scope, but unavailable physical hardware remains a limitation. Source instrumentation/optimization needs owner authorization.

## R05 — Split inactive showcase code at actual activation boundaries

Classification: **Optimize Internally** · Priority: **Medium** · Tier: **2**

**Observed issue or opportunity:** All showcase panel implementations are statically imported even though one panel renders at a time; initial shell is 505,710 raw bytes.

**Affected sections / relevant files:** src/sections/components/showcase/PortfolioShowcase.tsx (the Projects grid is inline); ProjectCard.tsx, CertificatesPanel.tsx, ExperiencePanel.tsx, TechStackPanel.tsx and portfolioData.ts in that directory

**Evidence:** Source imports/conditional render, component and bundle module inventories; report 01/05. No fine-grained JS coverage experiment was run.

**Why it matters:** The initially unused tabs need not all participate in early parse/evaluation if loading can retain current interaction quality.

**Suggested improvement:** Experiment with lazy panel/detail modules and stable boundaries; keep initial Projects available and prefetch on meaningful user intent. Keep data labels and dimensions. Verify Vite 8/Rolldown behavior rather than copying old Rollup configuration.

**Expected recruiter benefit:** Potentially faster initial content with unchanged discoverability and tab labels.

**Expected performance impact:** Likely smaller initial parse/evaluation, unknown net compressed saving; extra requests may hurt first tab switch.

**Visual impact:** None intended; empty flashes or reflow are unacceptable regressions.

**Implementation complexity:** Medium.

**Regression risk:** Hash #skills deep entry, tab focus, modal loading, network failures, chunk request overhead.

**Confidence level:** Medium; module structure is confirmed but net benefit requires build and browser comparison.

**Testing requirements:** Compare emitted chunks and initial request set; keyboard tabs, #skills, Details/modal focus, offline/failure and rapid switches; 320/390/1440 widths.

**Approval required:** Yes for source changes; dependency/config changes are not assumed necessary.

## R06 — Evaluate smaller encodings with exact decoded pixels

Classification: **Investigate Further** · Priority: **Medium** · Tier: **2**

**Observed issue or opportunity:** Large PNG artwork/portraits dominate cold transfer; essential detail and the original art are protected.

**Affected sections / relevant files:** public/images/lanyard/card-front.png and card-back.png; portrait assets listed in report 05

**Evidence:** Asset hashes/dimensions and network timings; no alternate encoder experiment has been performed.

**Why it matters:** Transfer can potentially shrink without an approved redesign, but lossy artifacts would violate preferred parity.

**Suggested improvement:** In diagnostics only, compare lossless encodings/recompression preserving alpha, color metadata, dimensions and decoded pixel values. Evaluate browser decode/upload cost before proposing replacement. Keep originals and present evidence for approval.

**Expected recruiter benefit:** Faster identity/project discovery if gains survive decode/render testing.

**Expected performance impact:** Unknown byte/time savings; lossless formats may not beat PNG for every asset.

**Visual impact:** Zero intended. Lossy WebP/AVIF quality or reduced texture resolution is a separate visible trade-off, not presumed acceptable.

**Implementation complexity:** Medium.

**Regression risk:** Color-space/alpha differences, browser compatibility, increased decode cost, URL/cache invalidation and GPU appearance changes.

**Confidence level:** High on byte burden; low to medium on achievable compression gain.

**Testing requirements:** Decoded RGBA equality, size/decode comparison, matched lighting/frames/front/back, error fallback, cold/warm/network and mobile CPU tests.

**Approval required:** Diagnostic files are authorized; replacing application artwork requires explicit owner authorization.

## R07 — Make resume and contact actions reach real destinations

Classification: **Improve** · Priority: **High** · Tier: **1**

**Observed issue or opportunity:** CV is unavailable; Hero Contact Me shows an unavailable notice; About Contact/Let’s Connect route to GitHub through null email fallback despite an existing #contact region.

**Affected sections / relevant files:** src/content/portfolio.ts; src/components/Hero/Hero.tsx; src/sections/config/profile.ts; src/sections/config/aboutCardData.tsx; ContactProfile.tsx

**Evidence:** Source null values and functional contact-button observation. S07/S08 job examples request CV; S06–S09 support project/communication evidence.

**Why it matters:** A visitor cannot complete the intended resume/contact journey from prominent controls.

**Suggested improvement:** Owner supplies a truthful current CV and preferred contact route; link the existing Contact section or approved destination and label GitHub as GitHub. Keep missing links honestly disabled until real values exist.

**Expected recruiter benefit:** Clear route to application and conversation; less inference or dead-end clicking.

**Expected performance impact:** Negligible JS; CV fetch can remain on demand. No extra third-party contact service needed.

**Visual impact:** Existing button placement/theme can stay; labels/link behavior change with approval.

**Implementation complexity:** Low technical effort; depends on owner content.

**Regression risk:** Stale CV, accidentally public personal information, invalid URL/base path or implying hosted delivery is verified.

**Confidence level:** High on current usability gap; benefit is qualitative, not a conversion forecast.

**Testing requirements:** Real URL/PDF validation, keyboard activation, mobile anchor visibility, download MIME/name; test hosted form only with separately authorized delivery verification.

**Approval required:** Yes; user-facing content/behavior is locked in this audit.

## R08 — Align professional role, education and skill claims with evidence

Classification: **Improve** · Priority: **High** · Tier: **1**

**Observed issue or opportunity:** Hero role labels, About Full Stack title and toolkit learning markers emphasize different levels; university is absent from displayed education; AI tool names outnumber linked AI implementations.

**Affected sections / relevant files:** src/content/portfolio.ts; src/sections/config/profile.ts; src/sections/components/showcase/portfolioData.ts and TechStackPanel.tsx

**Evidence:** Source content; owner-provided in-progress Virtual University education; four employer examples S06–S09.

**Why it matters:** Readers need to distinguish demonstrated skill, learning and tooling without inferring unsupported experience.

**Suggested improvement:** Choose an owner-approved primary role supported by current projects, preserve learning labels, state education accurately and connect backend/AI claims to real work. If describing Supabase, distinguish implemented source from unverified live deployment. Replace vague phrasing only with specific truthful capabilities.

**Expected recruiter benefit:** More credible junior positioning and easier role matching.

**Expected performance impact:** Negligible text-only change; no new library or page required.

**Visual impact:** No structural redesign; text length can alter wrapping.

**Implementation complexity:** Low implementation, medium evidence/content effort.

**Regression risk:** Overclaiming, removing honest context, stale availability or widening mobile layout.

**Confidence level:** High on observed inconsistency; wording choice is professional judgment.

**Testing requirements:** Owner factual review; links to demonstrable work; heading order, 320/390/1440 wrapping and screen-reader labels.

**Approval required:** Yes; wording remains a proposal.

## R09 — Document one or two genuine implemented projects in existing details

Classification: **Add** · Priority: **High** · Tier: **2**

**Observed issue or opportunity:** Four showcase entries are concepts/pending and lack provided live/source links; sample documents do not establish delivered engineering work.

**Affected sections / relevant files:** src/sections/components/showcase/portfolioData.ts; ProjectCard.tsx, ProjectDetails.tsx and Modal.tsx in that directory; existing project README/documentation

**Evidence:** Source entries and local modal inspection; S06–S09 employer requirements; S05 is adjacent UX case-study research, applied as judgment.

**Why it matters:** The page does not make ownership, problem solving, API/database skills, testing and results independently assessable.

**Suggested improvement:** Use existing detail layout for problem, real scope/role, architecture, key trade-off, loading/error/empty states, tests, deployment and limitations. Link verified public repo/demo; for this portfolio explain actual Three.js and Contact engineering. Label self-directed work honestly. Use measured outcomes only with reproducible evidence.

**Expected recruiter benefit:** Strongest direct improvement to hiring-manager and client proof without invented employment.

**Expected performance impact:** Mostly text plus existing lazy media; avoid adding autoplay video or heavy new galleries.

**Visual impact:** Retain cards/modal design; content and possibly genuine screenshots change only after approval.

**Implementation complexity:** Medium authoring/verification; low to medium UI work.

**Regression risk:** Exposing secrets, unsupported metrics/clients, stale links, claiming this audit proves live delivery.

**Confidence level:** High on missing proof; qualitative hiring benefit, no guaranteed offers.

**Testing requirements:** Verify every URL, ownership and claim; build/unit/browser checks where code changes; keyboard dialog focus, long-text scrolling, mobile and image failures.

**Approval required:** Yes; no fabricated case study or application edit is made now.

## R10 — Provide equivalent keyboard operation and correct known semantics

Classification: **Improve** · Priority: **High** · Tier: **2**

**Observed issue or opportunity:** Lanyard lacks keyboard flip; `.hero-roles` has prohibited aria-label use; portrait toggle is labeled as an image/hover action; no skip link; disabled social anchors remain focusable.

**Affected sections / relevant files:** src/components/Lanyard/Lanyard.tsx; src/components/Hero/Hero.tsx; src/components/SocialSpotlight/SocialSpotlight.tsx; src/sections/components/my-interests/HalftonePortrait.tsx; src/app/App.tsx

**Evidence:** Source/DOM, full-page axe one serious violation, targeted keyboard screenshots and successful modal/tab checks; WCAG 2.2 S01.

**Why it matters:** Core interaction should not require pointer use; correct names/roles and predictable focus improve access.

**Suggested improvement:** Add an accessible equivalent flip action with visible focus while retaining drag; correct Hero semantics; expose portrait toggle intent/state appropriately; add skip-to-main; review disabled social focus. Perform manual contrast and continuous-motion applicability review, adding a control only where required. Retain existing dialog/tab/reduced-motion strengths.

**Expected recruiter benefit:** More reliable review by keyboard and assistive-technology users; demonstrates engineering care.

**Expected performance impact:** Small control/semantics overhead; user motion pause could reduce work when selected but no automatic removal is proposed.

**Visual impact:** Semantic corrections can be invisible; focus/control affordances are intentional visible accessibility changes requiring design review.

**Implementation complexity:** Medium; design and assistive-technology validation.

**Regression risk:** New tab-order noise, double activation, focus loss, motion-state desynchronization, claiming WCAG conformance from axe alone.

**Confidence level:** High on observed defects; contrast/motion outcomes need manual assessment.

**Testing requirements:** Keyboard only, screen reader, Enter/Space, visible/unobscured focus, dialog restore, target size/reflow/zoom, reduced motion; rerun scoped axe and manually review incomplete nodes.

**Approval required:** Yes for any code, interaction or visual control change.

## R11 — Add factual metadata after confirming the canonical site

Classification: **Improve** · Priority: **Medium** · Tier: **1**

**Observed issue or opportunity:** HTML has generic site title and icons, without description, canonical or social preview metadata.

**Affected sections / relevant files:** index.html; public icons/share assets if approved; vite.config.ts and .github/workflows for read-only hostname/base verification

**Evidence:** Source and DOM meta inventory; S15 Search Central snippet guidance. Custom-domain operation was inaccessible.

**Why it matters:** Shared/search links do not clearly communicate the owner’s role or project context.

**Suggested improvement:** Confirm the actual canonical host/base, then propose truthful name/role title, description and Open Graph/Twitter preview using approved assets. Structured Person metadata is optional and must be factual. Do not change deployment/base settings as a side effect.

**Expected recruiter benefit:** Clearer identity in shared links and search previews; no ranking promise.

**Expected performance impact:** Tiny HTML overhead; share image should not become an unsolicited initial-page fetch.

**Visual impact:** On-page design unchanged; external previews intentionally improve.

**Implementation complexity:** Low once canonical destination and copy are verified.

**Regression risk:** Incorrect canonical can mislead indexing; stale role/image URLs; social crawlers may not execute client code.

**Confidence level:** High on missing metadata; medium on discovery benefit.

**Testing requirements:** Inspect raw served HTML, resolve absolute URLs on real host, validate preview dimensions, verify robots/indexability separately when accessible.

**Approval required:** Yes for metadata/content changes. Read-only hostname verification already authorized.

## R12 — Avoid unnecessary feed polling while the page is hidden

Classification: **Optimize Internally** · Priority: **Medium** · Tier: **2**

**Observed issue or opportunity:** Live backend source polls every 30 seconds without a document-visibility gate; no real hosted request-volume measurement is available.

**Affected sections / relevant files:** src/sections/components/contact/services/supabaseBackend.ts; ContactSection.tsx; VisitorWall.tsx

**Evidence:** Source subscription/poll/abort behavior; report 05; no Supabase Realtime channel here.

**Why it matters:** Unseen periodic reads may waste network and wakeups; changing it must preserve published-feed freshness and errors.

**Suggested improvement:** Consider pause on hidden document and immediate refresh on return, using existing abort/disposal paths. Distinguish document hidden from Contact merely offscreen. Keep published filters, explicit columns, pagination, RLS and photo authorization untouched.

**Expected recruiter benefit:** Reliable contact/visitor experience with less background work.

**Expected performance impact:** Potential fewer hidden-tab requests; not measured in default preview tests.

**Visual impact:** None intended; returning users must see fresh data and correct loading/error state.

**Implementation complexity:** Medium.

**Regression risk:** Stale feed, duplicate timers, overlapping reads, pagination reset or accidental privacy-policy changes.

**Confidence level:** High on polling source; medium on real workload benefit.

**Testing requirements:** Mock visibility changes, network failure, abort, unmount, pagination and resume refresh; authorized read-only live observation before estimating savings.

**Approval required:** Yes for backend-adapter behavior changes; no database/schema changes proposed.

## R13 — Recover missing optimization history and verify production in an accessible environment

Classification: **Investigate Further** · Priority: **High** · Tier: **1**

**Observed issue or opportunity:** Requested branch/uncommitted optimization diff absent; live website/CDN and hosted Supabase inaccessible; historical 38.1→22.2/19.1→13.3 results cannot be reconstructed.

**Affected sections / relevant files:** Git references/diff and saved historical artifacts if supplied; deployment workflow; docs/contact/COMPLETION_AND_RELEASE.md; source snapshot in this report

**Evidence:** Clean baseline/hash recovery, current branch work; environment proxy failures; original master prompt labels historical metrics.

**Why it matters:** Applying recommendations to an unknown optimized revision or asserting deployed delivery could invalidate comparisons and overwrite useful work.

**Suggested improvement:** When available, inspect the missing branch/diff and original benchmark definitions without resetting. Verify raw production headers/base/assets and read-only public feed on the intended hostname. Keep historical/current/new cohorts separate. Verify private delivery only through an explicitly authorized test plan; no unsolicited messages.

**Expected recruiter benefit:** Accurate confidence in contact/recruiter journeys and avoidance of regressions.

**Expected performance impact:** Diagnostic only; no predicted gain. Future hosted timing must include actual network/TLS/cache conditions.

**Visual impact:** None.

**Implementation complexity:** Low to medium once access/artifacts exist; currently externally limited.

**Regression risk:** Mistaking a different commit/config for an optimization delta; accidentally replaying migration history or enabling writes.

**Confidence level:** High on current limitation; no claim missing work was recovered.

**Testing requirements:** Record SHA, dirty diff hashes, exact metric script/settings; validate read-only responses and source/deployed artifact relationship; preserve all prior files.

**Approval required:** Read-only recovery/diagnostics already authorized. Any hosted submission, deployment, migration or application change requires a separate explicit instruction.

## R14 — Add experience, credentials or writing only when genuine evidence exists

Classification: **Add** · Priority: **Optional** · Tier: **3**

**Observed issue or opportunity:** Certificate and experience tabs contain honestly labeled samples; existing page already has ample sections.

**Affected sections / relevant files:** src/sections/components/showcase/portfolioData.ts; CertificatesPanel.tsx; ExperiencePanel.tsx; existing project documentation

**Evidence:** Source/sample captions; S06–S09 value real project evidence; S12 is an example of writing, not a requirement.

**Why it matters:** More placeholders do not improve credibility; fabricated work is unacceptable.

**Suggested improvement:** Replace samples only with earned credentials or real work with permission; a truthful self-directed project history can suffice. Optional short technical writing should follow core case studies. No blog/CMS/new timeline is necessary now.

**Expected recruiter benefit:** Clear truthful evidence and less ambiguity for managers/clients.

**Expected performance impact:** Minimal if text/documents load on demand; new CMS/media would add avoidable cost.

**Visual impact:** Use existing tab/card style; changes are content proposals.

**Implementation complexity:** Low UI effort, potentially high content/evidence effort.

**Regression risk:** Misrepresenting coursework/employment or exposing third-party private information.

**Confidence level:** High on current sample state; optional strategic benefit is judgment.

**Testing requirements:** Factual/permission review, links/PDF accessibility and mobile modal behavior.

**Approval required:** Yes for published content or structural additions.

## R15 — Evaluate visible ordering and motion changes only after core fixes

Classification: **Investigate Further** · Priority: **Optional** · Tier: **3**

**Observed issue or opportunity:** Mobile puts large badge art before copy; Interests precedes Projects; About actions complete nominally 2.75 s after intersection.

**Affected sections / relevant files:** src/components/Hero/Hero.css; src/sections/PortfolioSections.tsx; src/sections/components/AboutCard.css and AboutCard.tsx

**Evidence:** Settled mobile capture, source ordering/stagger math; no recruiter usability experiment.

**Why it matters:** Professional proof may be discovered later, but current ordering contributes to personal identity and could be preferred.

**Suggested improvement:** Only if user testing shows a problem, present an approved comparison of earlier Projects/CTA prominence or shorter About stagger. Keep original as baseline. Do not silently implement changes as performance fixes.

**Expected recruiter benefit:** Potential quicker proof/action discovery; unmeasured.

**Expected performance impact:** Changing stagger reduces intentional wait, not network/decode; ordering changes lazy-load behavior and requires fresh measurements.

**Visual impact:** Explicit layout/motion change; cannot be labeled pixel-identical or invisible.

**Implementation complexity:** Medium including usability and regression review.

**Regression risk:** Loss of distinctive first impression, anchor/focus changes, broken screenshot expectations or resource priority regressions.

**Confidence level:** High on current ordering; low on net audience preference.

**Testing requirements:** Small task-based user review, matched viewport/animation captures, deep links, navigation, layout shift and load sequence.

**Approval required:** Yes, explicit visual/design approval is required; default recommendation is retain current layout.

## R16 — Preserve the successful design and existing safeguards

Classification: **Keep Unchanged** · Priority: **High** · Tier: **1**

**Observed issue or opportunity:** Cohesive visual system, distinctive custom badge, truthful learning/sample labels, working responsive tabs/dialogs, lazy embeds and backend privacy boundaries already exist.

**Affected sections / relevant files:** Theme/global styles; Hero/Lanyard; About/ProfileCard; showcase; Contact services/edge functions/migrations; PortfolioFooter.tsx/CSS

**Evidence:** Source, screenshots, 77 unit tests, eight available browser tests, functional interactions; S01 and S06–S09 support accessibility and demonstrated engineering without prescribing a theme.

**Why it matters:** A redesign could remove identity and proven behavior while failing to address the actual loading/content gaps.

**Suggested improvement:** Retain palette/fonts/art/layout/physics, WebP dimensions, font swap, lazy card/iframe, visibility/idle/disposal guards, transparent footer, published-only feed/private data controls and honest labels. Treat these as regression invariants for future approved work.

**Expected recruiter benefit:** Consistent memorable branding and trustworthy technical presentation.

**Expected performance impact:** Retains existing savings and limits; keep does not mean every measured delay is acceptable.

**Visual impact:** Unchanged.

**Implementation complexity:** Low implementation (none); medium future verification.

**Regression risk:** Calling a future reduction in DPR/effects/physics an invisible optimization; losing sample/privacy semantics.

**Confidence level:** High on presence/behavior; aesthetic preference remains judgment.

**Testing requirements:** Retain baseline artifacts, deterministic visual comparison, interaction/accessibility/error/cleanup tests after approved changes.

**Approval required:** No action needed to keep current implementation. Any future change remains outside this audit authorization.

## Future implementation acceptance gates

1. Record actual branch/SHA and all pre-existing dirty changes before touching code. This audit's available branch is `work`; the absent optimization branch must not be recreated and described as recovered history.
2. Keep changes small and single-purpose; one scheduling or resource hypothesis per comparison. Preserve full original artwork and behavior. Do not upgrade dependencies, alter deployment or change RLS as incidental cleanup.
3. Compare the same production configuration, browser version, viewport, DPR, cache state, CPU/network profile and readiness definitions. Add a true post-ready interaction observation because the first-frame marker can precede another stall. Use enough repetitions for the decision; current two-run medians are baseline descriptions, not a promise of statistical power.
4. Validate original PNG/decoded pixels where appropriate. For 3D visual parity, synchronize deterministic simulation time, pointer state, camera, viewport, lights and GPU environment. Unmatched swinging frames cannot establish pixel equality. Keep drag/flip, reduced-motion/failure fallback and context-loss cleanup.
5. Test direct fragments (#about/#interests/#skills/#contact), 320/390/1440 widths, fast/reverse scrolling, focus/tab/dialog behavior, image/chunk/API failures and visibility/resize transitions. Fix the diagnostic development-font path only in a separate test setup before treating development screenshots as typography evidence.
6. Run affected existing unit/browser/type/build checks. Do not expand unrelated suites without a reason. Hosted write/delivery verification needs a separate explicit plan, and existing migration history warns against blind replay.
7. Record actual before/after artifacts and any trade-off. Accept only evidence-backed gains with no unapproved visual/behavior regression. Owner review/authorization governs any later merge/deploy; this report grants neither.

## Deprioritized or rejected shortcuts

Do not replace the badge with static art as the preferred fix; remove a dependency just because it appears in package.json; downgrade physics/DPR and call it invisible; change the color scheme to imitate an example portfolio; add arbitrary sections/blog/CMS; turn sample content into fictional credentials; bypass photo/publication checks; or claim historical improvements using this different checkout. These actions do not follow from the evidence. Keep existing good behavior, and investigate uncertain causes explicitly.
