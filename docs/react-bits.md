# React Bits provenance

The initial integration adapted the supplied GlowCursor and PillNav JavaScript/
CSS to TypeScript. Their sources are unchanged in Phase 05.

After the user explicitly selected the second Phase 05 component list, six more
supplied implementations were adapted: WarpText, RotatingText, Magnet, Lanyard,
PulseHeart and SocialSpotlight. ProfileCard/StarBorder from the earlier conflicting
brief are intentionally not substituted. No installer-generated components or
stock portrait assets replace the supplied source.

WarpText shader strings, Lanyard foil shader strings/physics equations, Motion
presets, Magnet's spring solver and PulseHeart's glyph animation are retained.
Changes are typed props/refs, app configuration, scoped layout, pause/reduced-motion
and resource/asset safeguards, plus the historical local reaction demo (subsequently removed) and
keyboard badge flip. The SocialSpotlight CSS paste began mid-rule: a minimal
namespaced root/pseudo-element preamble completes its supplied declarations.
Package attribution/licenses remain available with installed dependencies.

See [Components](components.md) for integration and exact artwork mapping,
[Animations](animations.md) for behavior, [Architecture](architecture.md) for
package/build costs, and [Changelog](changelog.md) for actual verification.

## Final Hero corrections

The new supplied WarpText/Magnet blocks and SocialSpotlight TSX match the prior
reference. Their existing strict TypeScript implementations remain the design
source. Final corrections remove Lanyard and the card wrapper/assets entirely,
keep the heading on one line and restore compact proportional social tiles.
PulseHeart's source remains unchanged; Firebase integration is explicitly deferred.

## Phase 06 source selection

The fresh supplied **TypeScript** Lanyard block is the source of truth for this
phase, rather than restoring the deleted Phase 05 implementation. Its shaders,
procedural meshes and physics are retained. Adaptations are the exact 3:4 face
and artwork-slot alignment, Vite asset URLs, lazy integration, ready/error states,
keyboard flip, reduced-motion fallback, rendering limits and lifecycle cleanup.
The original supplied Lanyard CSS is retained with scoped fallback/button styles.
Only `three` and its type package are added; all other Hero engines, PillNav and
GlowCursor source remain unchanged. Badge images come byte-for-byte from the
user ZIP; their mapping and hashes are recorded in Components.
