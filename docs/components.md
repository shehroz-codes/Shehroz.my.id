# Components

## Homepage shell

`src/app/App.tsx` renders the fixed background, centered navigation and empty
`main#home` landmark. No Hero, portfolio sections, demo specimens, sample buttons,
or visible implementation notices are rendered. Home and the logo target this
real same-page destination. The original temporary preview file was deleted.

## PillNav

Source: `src/components/PillNav/PillNav.tsx` and `PillNav.css`.

Current settings are dark theme, split layout, glass surface, pill items, fill
hover, dot indicator, medium size, bounce 0.3, stretch 0.5, automatic collapse,
and intro animation. Violet/indigo highlights and accent focus/dot colors are
passed through CSS-variable overrides in App. The original spring engine,
measurement, fill effects, intro, and menu morph remain intact.

Labels are Home, About, Skills, Projects and Contact. Unimplemented destinations
are focusable `aria-disabled` buttons with explicit accessible labels and no
fake href. They neither navigate nor change the active Home state. No visible
implementation notice is shown. They can become anchors when real sections exist.

The menu is a non-modal disclosure: Tab follows document order; Escape closes it
and restores focus to the toggle; Home closes it; outside pointer/focus dismisses
it. Closing panels are inert and hidden from accessibility APIs. The logo link
has the accessible name `MS — Home`; its image is decorative within that link.

## MS logo and icons

The supplied `favicon.zip` already contains transparent MS artwork. No background
removal, replacement logo generation, lettering changes or recoloring was done.
The navbar uses `public/icons/web-app-manifest-192x192.png`, displayed at 36px
inside a 44px circular logo control. It supports high-density displays without
stretching; dimensions are reserved before loading. The original 512px PNG is
also retained as larger source artwork.

Integrated files in `public/icons/`:

- `favicon.ico`: supplied multi-resolution ICO.
- `favicon-96x96.png`: supplied PNG favicon.
- `favicon.svg`: optimized raster-backed SVG embedding the supplied 96px PNG.
- `apple-touch-icon.png`: supplied 180px Apple icon.
- `web-app-manifest-192x192.png` and `web-app-manifest-512x512.png`: supplied icons.
- `site.webmanifest`: supplied manifest with project branding, dark colors and
  relative project-safe paths. Icons use `purpose: any`; no maskable-safe variant
  was supplied or claimed.

The supplied SVG was a 2.59MB wrapper around a 1254px raster, not vector paths.
The favicon wrapper now embeds the supplied small PNG (~32KB total). It preserves
the MS artwork without downloading the large raster for a browser-tab icon. It
is still raster-backed, so it should not be treated as an editable vector master.

See [Animations](animations.md) for logo behavior and [Architecture](architecture.md)
for deployment paths.

## GlowCursor

Source: `src/components/GlowCursor/GlowCursor.tsx` and `GlowCursor.css`.

This change leaves its code, palette, props and safeguards unchanged: violet
`#5B21F0`, indigo `#4F46E5`, dark theme, low quality, DPR at most 1.5 and rendering
at most 30 FPS. It remains fixed behind the page and cannot intercept clicks or
scrolls. See [Animations](animations.md) for pause/fallback behavior.
