# Components

## Hero and editable content

`src/components/Hero/Hero.tsx` is the single new section inside `main#home`.
`Hero.css` scopes typography, the 850px grid breakpoint, CTA sizing and the
reserved role/badge areas. Existing navbar/background sources and global styles
are unchanged. Personal content lives in `src/content/portfolio.ts`.

The latest confirmed component list supersedes the earlier ProfileCard/StarBorder
brief. Hero uses these supplied components:

| Component | Purpose | Source location |
| --- | --- | --- |
| WarpText | Distorted `Shehroz Coder` display name, with static fallback | `src/components/WarpText/` |
| RotatingText | Four professional roles; lazy Motion chunk | `src/components/RotatingText/` |
| Magnet | Restrained magnetic behavior around both CTAs | `src/components/Magnet/` |
| Lanyard | Original physics-driven front/back badge; lazy Three.js chunk | `src/components/Lanyard/` |
| PulseHeart | One local appreciation per page load | `src/components/PulseHeart/` |
| SocialSpotlight | Compact links for configured social profiles only | `src/components/SocialSpotlight/` |

The Hero greeting and accessible h1 identify Muhammad Shehroz. Animated content
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

PulseHeart starts at zero and accepts one like until refresh. The label explicitly
says the reaction is local to this visit. It is not a shared live count, does not
write to a backend, and does not collect visitor data. Refresh resets this local
state. A genuinely shared count requires a separately authorized service.

## Badge assets and replacement instructions

The two badge designs are visible in chat, but their local Downloads paths are
not accessible in the cloud and no downloadable PNG file IDs were exposed.
No face was generated, edited, substituted or extracted from a screenshot.
The stage is labelled **Badge artwork pending**; this is a real external blocker
for final visual validation, not a completed portrait integration.

To complete it:

1. Transfer both original badge PNGs as downloadable files (a ZIP is suitable).
2. Place the originals under `public/images/`, preserving front/back identity.
3. Set `portfolio.badge.front` and `.back` to their project-relative filenames.
   Front is the portrait side; back is the supplied “Scan to connect” side.
4. Validate the texture clarity, orientation, card fit and keyboard flip on real
   images. Do not fabricate a QR code or replace text embedded in the artwork.

`public/images/shehroz-strap.svg` is text-only strap artwork reading **Shehroz
Coder**; it is not a replacement portrait or logo. `HeroBadge.tsx` passes its
base-aware URL and uses `imageFit="contain"` to avoid cropping badge artwork.
On supported desktop devices the original drag/click-flip engine runs; the
external Flip badge button provides a keyboard equivalent through `flipSignal`.
Touch/reduced-motion/constrained environments use the original images statically,
with the same button switching sides. Asset/context failures have explicit
fallbacks. The card stage reserves its dimensions before lazy loading.

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
