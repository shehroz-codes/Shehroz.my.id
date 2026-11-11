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
and resource/asset safeguards, plus the requested local one-like behavior and
keyboard badge flip. The SocialSpotlight CSS paste began mid-rule: a minimal
namespaced root/pseudo-element preamble completes its supplied declarations.
Package attribution/licenses remain available with installed dependencies.

See [Components](components.md) for integration and pending artwork,
[Animations](animations.md) for behavior, [Architecture](architecture.md) for
package/build costs, and [Changelog](changelog.md) for actual verification.
