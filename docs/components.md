# Components

## Hero and editable content

`src/components/Hero/Hero.tsx` is the single new section inside `main#home`.
`Hero.css` scopes typography, the 850px grid breakpoint, CTA sizing and the
reserved role area. Phase 06 fills the right-hand desktop grid area with the supplied original Lanyard. Existing navbar/background sources and global styles
are unchanged. Personal content lives in `src/content/portfolio.ts`.

The existing Hero components remain unchanged:

| Component | Purpose | Source location |
| --- | --- | --- |
| WarpText | Distorted `Shehroz Coder` display name, with static fallback | `src/components/WarpText/` |
| RotatingText | Four professional roles; lazy Motion chunk | `src/components/RotatingText/` |
| Magnet | Restrained magnetic behavior around both CTAs | `src/components/Magnet/` |
| PulseHeart | Unchanged visual component; shared likes deferred | `src/components/PulseHeart/` |
| SocialSpotlight | Compact links for configured social profiles only | `src/components/SocialSpotlight/` |

The Hero greeting identifies Muhammad Shehroz. The visible and accessible h1
contains exactly **Shehroz Coder** on one line at all tested widths. Animated content
is hidden from screen readers; a stable role list describes the professional
identity without repetitive announcements. CTA/like/social controls retain focus
indicators and touch targets. Rotating roles reserve a stable line of space and
measure natural content width before animating the highlight.

## Real destinations and optional data

No CV, contact endpoint, or Projects/Contact sections exist in the repository.
The requested Download CV control is `aria-disabled` and explains its unavailable
state when activated; it has no fake download URL. Contact Me is a button that
reveals the current contact limitation and points to the visible GitHub link.
Populate `cvPath` with a real relative file path to enable download, and
`contactHref` with a valid contact destination to turn that action into an anchor.

Only the known repository-owner GitHub profile is configured. Instagram, Facebook
and TikTok remain omitted until actual URLs are supplied. No achievements,
experience counts, employment or certifications are invented.

PulseHeart's source and design remain unchanged. The previous local demo and
“This visit only” label have been removed. Hero disables the control and hides
its count until a real shared backend exists; the accessible label explains that
likes are unavailable. No total is invented and no global persistence is claimed.

The user explicitly deferred Firebase setup. Once a project/API is configured,
implement atomic server-side increments with abuse protection, update the UI only
after success, and verify persistence across refreshes and separate visitors.
Never put privileged database keys in Vite variables or client bundles.

## Phase 06 original Lanyard

`src/components/Hero/HeroLanyard.tsx` configures the separately lazy-loaded
`src/components/Lanyard/Lanyard.tsx` and its supplied CSS. The original procedural
Three.js card, strap, silver metal, glossy shaders, spring simulation, intro,
drag/release and click/touch flip are retained. No model, Fiber, Rapier, extra
animation package or stock card artwork is used.

Configuration: portrait, contain, glossy, dark card `#080616`, radius 0.3,
size 0.6, centered anchor, strap length 0.5/color `#111111`/width 0.65,
silver metal, gravity 1, damping/elasticity/breeze 0.5, intro and interaction on.
The portrait face geometry is 3:4 to match the original 1086×1448 PNGs. Native-size
face canvases avoid stretching or adding letterboxing. The physical slot is
aligned to the common black opening around image coordinates (542,79), inside
the painted silver rim; the attached ring passes through it. This geometry
adjustment does not change either PNG.

| Public asset | Exact ZIP entry | SHA-256 |
| --- | --- | --- |
| `public/images/lanyard/card-front.png` | `SHEHROZ Futuristic Developer Badge(1).png` | `2e3d80b095138a93e5c6d57ffc186d1bad8ce62a84936ad41e83f161476ededb` |
| `public/images/lanyard/card-back.png` | `Neon Purple Developer ID Badge(1).png` | `8289bd7def33c140bdbf55a994c91c8e13d4c158fed52eef1e47f937fde12acb` |

Both files are byte-identical to `Shehroz_Original_Badge_Assets.zip`: no cropping,
redrawing, recoloring or compression. The back retains `{NAME}` and its blank
QR area; no QR code or substitute identity is invented. The original glossy
lighting affects the rendered appearance, not the source artwork. Asset URLs
use `import.meta.env.BASE_URL`, including `/Shehroz.my.id/` on GitHub Pages.

The native **Flip card** button supports keyboard activation and uses the same
physics flip as card clicking. Its accessible name identifies the destination
side; status text identifies the current side. Reduced-motion and unsupported
WebGL2/context-loss states show the exact static artwork and still permit an
instant front/back switch. Loading controls are disabled until ready. No
performance numbers for physical devices are claimed; see [Animations](animations.md).

## Original supplied designs

The newly attached WarpText and Magnet source blocks were compared with the
previous supplied versions and are identical. The existing strict TypeScript
conversions retain those engines. Both CTAs now receive Magnet, even when their
destinations are unavailable; activation still explains that state without a fake URL.

SocialSpotlight's supplied TSX and CSS design are retained: animated outer border,
pointer beam, brand glows, raised hover tiles and keyboard focus. Hero sizing is
compact (44px tiles/22px icons) with proportional rounded corners. Missing social
URLs remain configurable and omitted. The supplied CSS begins mid-rule; the
existing minimal root/pseudo-element preamble completes those declarations.

## Existing components and branding

PillNav's dark/split/glass/pill/fill/dot/md settings, bounce 0.3, stretch 0.5,
automatic collapse and intro are unchanged. Home and the MS logo link to `#home`;
About/Skills/Projects/Contact stay explicitly unavailable controls. Keyboard,
Escape/outside dismissal and inert closing panels are retained. The original
four-turn logo behavior is described in [Animations](animations.md).

GlowCursor is unchanged: violet/indigo, low quality, 30 FPS cap, DPR 1.5,
passive pointer interaction and reduced-motion/context/static safeguards.
MS logo/favicons and the project-safe manifest in `public/icons/` remain intact.
See [Architecture](architecture.md) for layering and deployment URLs.
