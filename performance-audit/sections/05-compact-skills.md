# Compact About skills

Type: About subsection. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Provide a quick scan of 11 named technologies/interests without percentage ratings.

## B. Source architecture

[`src/sections/config/profile.ts:145`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/config/profile.ts#L145); [`src/sections/config/aboutCardData.tsx:32`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/config/aboutCardData.tsx#L32); [`src/sections/components/AboutCard.tsx:290`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/AboutCard.tsx#L290); `src/sections/components/icons.tsx` and AboutCard CSS.

## C. Technology

Typed Skill data maps to ReactNode inline icons. Lists and accessible labels describe nonlink chips. No independently mounted Skills page or API.

## D. Initialization

All 11 chips are rendered inside About on initial commit; their reveal timing starts when the About observer triggers. Skills do not require another bundle or a network response.

## E. Loading

Inline icon code in the shell and shared fonts/CSS. No separate downloaded skill image files for these chips. Their primary delay is CSS reveal index, not icon networking.

## F. Rendering and updates

Static data; re-renders follow About props/visibility. `primarySkills` stays separate from the larger development toolkit. React/ReactJS duplication is avoided in the supplied list.

## G. Animation

Indices 9–19 use the same 90 ms stagger; final skill animation ends nominally at 2.66 s after intersection. Actions use index 20 after all skills.

## H. Network

No independent requests or credential/API dependency. About and global font downloads apply.

## I. Performance

No separate chip CPU timing was isolated. Inline SVG DOM contributes to initial rendering. More chips would increase DOM and push action reveal later because the current calculation depends on list length.

## J. Timing and readiness

DOM is present with About. Last chip nominal completion is 19×90+250+700=2,660 ms; actual event delivery can be later under contention. This derived timing is not an independently measured stopwatch result.

## K. Problems

HTML/CSS/JS/React/TypeScript are clear; AI Integration, Vibe Coding and AI Agents are broader capability claims not linked to examples. No evidence justifies inventing proficiency or calling all tools mastered.

## L. Potential fixes

Preserve the compact count and readable labels. Associate claims with real case studies in the existing Projects surface. Any rewording or grouping is an owner-approved content decision; avoid adding a second redundant Skills section.

## M. Risks

Conflating toolkit usage with production experience weakens credibility. Removing text and retaining icons alone would worsen scanning/accessibility. Changing count affects reveal choreography.

## N. Recommendation

Keep Unchanged: labeled, percentage-free presentation. Improve: supporting evidence for AI/automation claims. No new Skills section is needed.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
