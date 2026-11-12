# Muhammad Shehroz — About Card

A standalone, production-ready **About section** for a developer portfolio:
React 19 + TypeScript + Vite 8, with the original React Bits `ProfileCard`
portrait tile. The section has a **transparent background** and is designed to
sit on top of an existing animated page background — it never touches `html`
or `body`.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc --noEmit && vite build
npm run preview  # preview the production build
```

---

## Content lives in one file

All visible identity comes from **`src/config/profile.ts`**. No component needs
to be edited to change content.

```ts
export const profile: Profile = {
  fullName: 'Muhammad Shehroz',
  displayName: 'SHEHROZ',
  username: 'shehrozcoder',
  title: 'Full Stack Web Developer',
  specialty: 'AI Integration & Web Application Development',
  location: 'Lahore, Pakistan',
  education: 'Online BS Computer Science',
  bio: "I'm Muhammad Shehroz, a Full Stack Web Developer based in Lahore, Pakistan. …",
  portrait: { src: '/profile.png', alt: 'Portrait of Muhammad Shehroz, Full Stack Web Developer' },
  …
};
```

| Export | Purpose |
| --- | --- |
| `profile` | Identity, bio, location, education, portrait path, eyebrow / labels |
| `primarySkills` | The **11** skills shown on the compact card |
| `fullProfileSkills` | Separate, currently empty list for the future full portfolio page |
| `socialLinks` | Every channel; `href: null` means "not published" |
| `activeSocialLinks` | Derived — only channels with a real URL |
| `links` | `github`, `email`, `cv` |
| `contactHref` | "Let's Connect" target: email if published, otherwise GitHub |

### The 11 compact-card skills

`HTML5` · `CSS3` · `JavaScript` · `React.js` · `TypeScript` · `AI Integration` ·
`Vibe Coding` · `AI Agents` · `Linux` · `Git & Terminal` · `Web App Development`

React and ReactJS are the same technology, so only **React.js** is listed. No
proficiency percentages and no seniority claims are shown. Icons resolve through
`src/components/icons.tsx` (inline SVG, no extra dependency).

### Adding skills later

- **Compact card** → append to `primarySkills`. The label list wraps, so no
  redesign is needed.
- **Future full-profile page** → append to `fullProfileSkills`. The compact card
  ignores it entirely, so the two surfaces stay independent.

### Contact fields that intentionally are NOT rendered

Nothing is invented. These are `null` until a real value is supplied:

| Field | Where | Effect today |
| --- | --- | --- |
| `links.email` | `src/config/profile.ts` | No email row, and "Let's Connect" falls back to GitHub |
| `links.cv` | `src/config/profile.ts` | Button becomes **GitHub Profile** instead of **Download CV** |
| `socialLinks` — LinkedIn / Instagram / WhatsApp / website | `src/config/profile.ts` | Not rendered at all — no `#` hrefs, no broken links |

Set `links.email = 'you@example.com'` and the email row plus the `mailto:`
target appear automatically. Drop a `cv.pdf` into `public/`, set
`links.cv = '/cv.pdf'`, and the download button returns.

---

## Portrait and its background

- `public/profile.png` — the supplied transparent PNG, **byte-identical**. It is
  never re-rendered, cropped or colour-shifted; `object-fit: contain` with
  `object-position: center bottom` seats it in the tile without stretching.
- `public/portrait-backdrop.svg` — a premium dark backdrop drawn **behind** the
  portrait: deep navy → violet gradient, an ambient halo, a faint editor window,
  a terminal line and low-opacity `</>` / `{ }` marks. Opacity is kept near
  0.10–0.26 so the face stays dominant.
- `public/iconpattern.svg` — the holographic foil pattern.
- The extra pale-violet glow and the `object-fit` lock live in the scoped
  `ProfileCard/profile-card-violet.css`, applied only under
  `.about-profile-card`.

Swap the portrait by replacing `public/profile.png` (or point
`profile.portrait.src` elsewhere). Keep the image transparent for the backdrop
to show through.

---

## Structure

```
src/
  App.tsx                       demo page + ProfileCard wiring (edit only styling props)
  App.css                       demo page background (not part of the card)
  index.css                     Tailwind v4 entry + base text/background
  config/
    profile.ts                  ← single source of truth (identity, skills, links)
    aboutCardData.tsx           maps config → AboutCard props
  components/
    AboutCard.tsx               the card (design preserved)
    AboutCard.css               original violet/indigo glass styling + animations
    icons.tsx                   tech + UI icon registry
    ProfileCard/
      ProfileCard.tsx           React Bits ProfileCard (TypeScript port)
      ProfileCard.css           untouched base styling
      profile-card-violet.css   violet retheme + portrait backdrop/fit
public/
  profile.png                   portrait
  portrait-backdrop.svg         dark developer backdrop behind the portrait
  iconpattern.svg               holographic foil pattern
```

## Using the card in another app

```tsx
import AboutCard from './components/AboutCard';
import { aboutCardProps } from './config/aboutCardData';

<AboutCard {...aboutCardProps} />          // static portrait panel
<AboutCard {...aboutCardProps} profileSlot={<ProfileCard … />} />   // interactive tile
```

Copy `src/components/`, `src/config/`, `public/portrait*.{png,svg}` and
`public/iconpattern.svg`, and install `lucide-react`. No global CSS changes are
required.

## Accessibility & performance

- Real `<a>` / `<button>` elements, visible `:focus-visible` rings, and
  `aria-label` / `title` on every icon-only control.
- External links use `target="_blank"` + `rel="noopener noreferrer"`.
- `prefers-reduced-motion: reduce` disables the tilt engine, intro animation and
  every keyframe; all content stays visible.
- Pointer tracking and the tilt engine write CSS custom properties only — no
  React re-render per frame.
- Images are lazy-loaded and `draggable={false}`.
- Mobile: `touch-action: pan-y`, `max-width: 100%`, device-tilt off.

## Verified

- `npm install` — clean.
- `npm run build` (`tsc --noEmit` + `vite build`) — passes with `strict` +
  `verbatimModuleSyntax`.
- Rendered at 1440 / 900 / 390 px: no horizontal overflow, no clipped text,
  skill labels wrap correctly.

Not shipped in this archive: `node_modules`, `dist`, `.git`.
