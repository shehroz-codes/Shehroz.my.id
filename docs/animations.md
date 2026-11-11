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
animations are retained. The logo's spin duration and number of revolutions are
the only changes to its animation implementation in this revision. Keyboard
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
on teardown. No automatic quality enhancement or heavy animation dependency is
introduced. Physical GPU performance still needs device testing.
