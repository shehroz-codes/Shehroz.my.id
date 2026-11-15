# Global GlowCursor and shared visual effects

Type: Cross-section system. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Provide a subtle interactive violet/indigo background and consistent decorative motion throughout the page.

## B. Source architecture

[`src/app/App.tsx:62`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/app/App.tsx#L62); [`src/components/GlowCursor/GlowCursor.tsx:427`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/components/GlowCursor/GlowCursor.tsx#L427); `GlowCursor.css`, `App.css`, `styles/tokens.css`; WarpText is documented separately in Hero.

## C. Technology

Raw WebGL2 multi-pass simulation, float render targets, bloom and CSS fallback. React enable/motion/failure state wraps mutable GL engine state. Window pointer listeners, resize/intersection observers and focus/visibility gates manage lifecycle.

## D. Initialization

App always renders the component with low quality and max DPR 1.5. Effect acquires WebGL2 and requires EXT_color_buffer_float, compiles passes, allocates targets on size changes and clears the surface. Failure falls back to the static background.

## E. Loading

Shader strings and engine ship inside the initial JS; no external texture/model/network service. The initial shell module inventory attributes 33,321 pre-minification rendered bytes to GlowCursor; that is not its independent compressed transfer size.

## F. Rendering and updates

Pointer motion queues simulation state; settings refs avoid React updates each frame. Resize is batched. The loop has a 30-FPS cap and stops after quiet/resting conditions, rather than running forever at idle.

## G. Animation

Fluid-like cursor emission/bloom and background grading. Low-quality settings and capped DPR already protect cost. About and other sections have additional independent CSS effects; all share compositor resources.

## H. Network

None beyond the shared script/CSS. Do not blame network latency on this component simply because it contributes startup work.

## I. Performance

The probe measured its context acquisition around 12 ms, far below the shared 2.82 s graphics task. Native task attribution was insufficient to assign that stall to this effect. CPU/GPU utilization percentages and watts were not available.

## J. Timing and readiness

Its canvas appears during initial mount. The background does not gate a content-ready state; card and About definitions are independent. Pointer actions in functional scripts necessarily stimulate the effect and can affect capture timing.

## K. Problems

Multiple contexts/effects contend on software graphics; the actual device impact needs profiling. Automatic motion and continuous visual backgrounds warrant a WCAG 2.2.2 review for applicable pause/stop behavior; reduced-motion support alone does not settle compliance.

## L. Potential fixes

Keep low preset, visibility/focus/idle gates and exact palette. Profile allocation and startup scheduling. Add a user motion control if the continuous-motion applicability review requires it; this is an approved accessibility feature decision, not silently removing effects.

## M. Risks

Disabling or reducing effects changes the approved design. Altering simulation resolution, blending or time steps can change appearance; do not call those invisible optimizations. Shared GPU resource changes need disposal/context-loss tests.

## N. Recommendation

Keep existing design/safeguards. Investigate Further shared graphics costs and motion controls; optimize internally only with matched-frame verification.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
