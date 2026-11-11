# React Bits provenance

Exactly two components were adapted from the complete JavaScript/CSS source
supplied in `Pasted text.txt`: GlowCursor and PillNav. The original 14 shader
strings, fluid passes, spring equations, fill effects and intro/menu animations
were retained during the TypeScript conversion. No React Bits installer or
additional runtime library is required.

The integration first mounted around a temporary design-system preview. That
preview is now removed. The navbar uses the supplied MS logo, centers its whole
group and rotates the logo four times on mouse entry. GlowCursor remains unchanged.

Current implementation details are maintained in [Components](components.md),
[Animations](animations.md) and [Architecture](architecture.md). Historical
validation and limitations belong in [Changelog](changelog.md).
