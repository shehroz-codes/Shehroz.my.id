# Animation behavior

## Logo hover

`spin` in `src/components/PillNav/PillNav.tsx` handles mouse entry into the logo
link. The mark rotates from 0 to 1440 degrees (four clockwise revolutions) over
2000ms, with `cubic-bezier(0.65, 0, 0.35, 1)` acceleration/deceleration. The WAAPI
animation has one iteration and no retained fill, so its finished state is the
underlying identity transform: exactly upright, equivalent to 0 degrees.

A pointer-enter event starts one animation; remaining hovered does not restart
it. A running animation blocks re-entry triggers until it finishes. A later
leave/re-enter may start a new animation. Touch/pen input and reduced-motion
preferences do not trigger rotation. Existing lifecycle cleanup cancels active
animations on teardown, and runtime reduced-motion changes cancel them as well.
Only the transform is animated, without frame-by-frame React updates.

## PillNav

The supplied spring engine, dot behavior, fill hover and WAAPI intro/mobile-menu
animations are retained. PillNav and the four-turn logo implementation are unchanged
in Phase 05. Keyboard
focus remains visible without requiring animation. CSS media rules disable
transitions for reduced motion; the engine applies states without spring travel.

## GlowCursor performance

The unchanged WebGL2 engine renders a low-quality fluid simulation only while
needed. Work is limited to 30 FPS and DPR 1.5 in the app. Idle simulation stops;
window blur and document-hidden events pause it. Focus/visibility and pointer
input resume work. Passive global pointer listeners do not block scrolling.

Reduced motion disables the canvas entirely, including preference changes during
a session. Unsupported WebGL2/float framebuffers, shader/allocation errors and
context loss use the static ambient gradient. Context loss stays on the fallback
until reload. GPU objects, listeners, observers and frame requests are released
on teardown. GlowCursor itself introduces no new dependencies in this phase. Hero-specific
engines and costs are documented in [Architecture](architecture.md). Physical GPU
performance still needs device testing.

## Hero motion policy

`src/hooks/useHeroMotion.ts` observes the Hero and document visibility, window
focus, reduced motion, and fine-pointer capability. It disables heavy enhancement
for coarse pointers and reported concurrency ≤2. Hidden/out-of-view/blurred Hero
engines tear down instead of running behind the page. Rotating text remains a
lightweight visible animation on touch; reduced motion shows a static first role.

WarpText retains its supplied shaders, lens/ripple logic and rasterizer. The
Hero adds left alignment, a 30 FPS cap, DPR 1.5 and static semantic text when
WebGL is unavailable or disabled. OGL resources/listeners/observers are cleaned up.

RotatingText retains the supplied Motion presets, grapheme/word splitting,
AnimatePresence and highlight-width animation. Hero uses word splitting with
short stagger and a 3-second interval. It pauses by unmounting the lazy animation
when inactive and uses a stable static first role; timers and width controls are
cleaned up. Screen readers receive a single stable role description.

Magnet retains the supplied shared-pointer arbitration and spring solver. Hero
limits reach to 32px and offset to 7px, with strength 5. Disabled enhancement
removes its registry listeners; keyboard access never depends on attraction.

PulseHeart's existing glyph/number-roll implementation is unchanged. Hero no
longer uses the local-demo behavior: the control is disabled with no count until
the separately planned shared backend exists. No counter behavior is represented
as persistent. SocialSpotlight retains its supplied beam, brand glows and animated
border at a compact size; the border pauses outside the active Hero and stops
for reduced motion.

The final heading passes **Shehroz Coder** without a newline. Responsive font and
stage sizing keep it on one line in canvas and static fallback. WarpText's
original shaders, lens, pointer and click-ripple behavior are unchanged.

## Phase 06 Lanyard

The newly supplied TypeScript engine retains its foil shader strings, procedural
strap/card/metal geometry, Verlet/spring integration, drag/release, breeze, intro
and flip equations. App changes align the face/slot to the supplied original
artwork and add lifecycle, accessible flip and performance safeguards.

The lazy wrapper avoids loading Three.js for reduced motion. Suspense renders
nothing in normal sessions; the canvas stays hidden until both original textures
are painted and a real frame is ready. The original horizontal hanging/drop
intro then appears directly, without first showing a static card. Lanyard also
observes runtime preference changes and disposes its scene when disabled. Hidden,
blurred or offscreen stages cancel their render loop and resume on return.
WebGL2 absence, image failure and context loss select static original art. Cleanup
releases observers, listeners, animation frames, geometries, materials, textures,
environment and GL context.

Fine-pointer devices reporting >4 logical processors use a DPR cap of 2 and
60 FPS active /30 FPS after four idle seconds. Coarse/constrained devices use
DPR 1.5 and 30/15 FPS. The source breeze continues while visible at the lower
idle rate; it is not replaced with a different idle animation. The solver retains
its small integration substeps. Touch outside the card retains page scrolling;
card hit testing gates capture/drag and the supplied touch handling. The keyboard
button provides equivalent side selection without dragging. Physical device GPU
performance and Safari/Firefox remain unmeasured.

### Visual refinement reference

The supplied 40-second recording shows the existing portfolio first, then the
reference site's longer top-origin strap, broad swing and offscreen-to-hanging
entrance. The refinement adopts only that spatial behavior. Original badge art,
Three.js shaders and integration equations remain unchanged. Desktop rendering
now spans the viewport; the physical anchor is at its top edge, the card rests
higher, and the retained spring/drag solver can move it through the text region
behind readable copy. A subtle dark paragraph text shadow preserves legibility
as the artwork passes underneath. Text/header controls retain hit priority.
Extreme desktop pin targets are bounded to physical strap/grip reach with 15%
elastic allowance, preventing indefinite stretch without changing the solver. Mobile remains
an inline card with normal page scrolling, rather than sharing the expanded
mouse-interaction area. Screenshot comparisons cover resting and dragged states;
software-rendered recordings do not establish physical-device frame rates.
