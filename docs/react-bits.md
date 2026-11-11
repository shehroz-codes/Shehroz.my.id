# React Bits integration

Exactly two components were adapted from the complete JavaScript/CSS source
supplied in `Pasted text.txt`: GlowCursor and PillNav. Their original shaders,
fluid simulation passes, spring equations, fill transitions, and Web Animations
API intro/menu animations are retained. No React Bits installer or additional
runtime dependencies are required.

## GlowCursor

`src/components/GlowCursor/` exposes a typed reusable component. The application
mounts it independently as a fixed, non-interactive viewport layer, underneath
content. Global passive pointer listeners allow the original trail and click
bursts to respond through the page without intercepting clicks or scrolling.

The app selects violet/indigo, dark mode, low quality, and maximum DPR 1.5.
Rendering is capped at 30 FPS. Quality stays low rather than guessing whether a
device can sustain a more expensive simulation. The original idle stop is
retained; leaving the viewport clears emitter velocity so it can settle.
Rendering pauses on document visibility changes and window blur, then resumes
on visibility/focus. All frame requests, listeners, observers, shaders, programs,
textures, framebuffers, buffers, and VAOs are cleaned up on teardown.

Reduced motion disables the canvas completely, including when the preference
changes at runtime. The fixed layer retains the design system's static ambient
gradient. Unsupported WebGL2/float render targets, shader/allocation failures,
and context loss also fall back to this static layer. Context loss intentionally
keeps the fallback until reload, rather than repeatedly attempting GPU recovery.

## PillNav

`src/components/PillNav/` exposes typed items, event callbacks, styling overrides,
and the original configuration options. The app uses dark/split/glass/pill/fill/
dot/md, bounce 0.3, stretch 0.5, automatic collapse, and the intro animation.
Highlights use the design system's brand gradient and accent focus/dot colors.

Home targets the existing preview at `#home`. About, Skills, Projects, and Contact
are focusable `aria-disabled` buttons with explicit unavailable labels. They do
not have fake section anchors or change the active location. A visible status
message explains that those sections are not implemented. The original preview
component itself remains unchanged.

The menu uses normal disclosure navigation, not ARIA menu roles or a modal focus
trap. Tab enters its links; Escape restores focus to the toggle; Home closes the
panel; clicking or tabbing outside dismisses it. Closing panels are inert and
hidden from accessibility APIs. Reduced-motion changes cancel running animations
and update the spring engine. Measurement is placed offscreen to prevent mobile
horizontal overflow.

## Branding and deployment

No MS logo or favicon ZIP was available in the repository or supplied attachments
(the only supplied attachment was the component source text). No replacement
logo, favicon, or manifest is fabricated. Those assets remain pending upload.

Vite's existing `/Shehroz.my.id/` base and Pages deployment workflow are unchanged.
The built JS, CSS, and fonts load under that project path. When the supplied
branding assets are available, use base-aware URLs and ensure the manifest's
icon, scope, and start URLs agree with the project path.

## Validation

Type checking and production build pass. Automated Chromium checks exercised
320, 375, 768, and 1440px layouts, mobile disclosure behavior, desktop fill hover,
intro/menu animations, keyboard navigation, unavailable destinations, preview
buttons, scrolling, no horizontal overflow, and asset loading at the Pages path.

WebGL2 tests used Chromium's software renderer to verify actual shader draws and
nontransparent pixels after pointer/click input, the DPR cap, idle/blur/visibility
pause and resume, live reduced-motion changes, unsupported-WebGL fallback, and
context loss. All 14 supplied shader strings were verified unchanged.

Browser checks used a temporary Playwright installation outside this repository.
Physical GPU performance, Safari/Firefox, real assistive technology, the missing
branding assets, and the live GitHub Pages deployment were not verified.
