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

Lanyard retains the supplied strap geometry, physics, materials and flip engine.
The Hero requests low-power rendering, DPR 1.5, at most 30 FPS and zero breeze so
it can become idle. It is not loaded until real front/back paths exist. Reduced
motion/touch use static images, and context/asset errors fall back. No second
GlowCursor or global duplicate background loop is introduced.

PulseHeart preserves the supplied swell/glyph/number roll animation, with an
added one-way local-like guard. Keyboard/reduced-motion activation updates the
state without the pointer animation. Live preference changes settle and cancel
a running pulse. SocialSpotlight retains its supplied beam/border effects at a
compact size; its border pauses outside the active Hero and stops for reduced
motion. There are no flashing effects or automatic sound.
