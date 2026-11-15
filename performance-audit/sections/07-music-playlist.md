# Music playlist

Type: Interests subsection. Snapshot: `6839347096468ec0ff98a5c01e5a1df0f03e1cfd` on branch `work`, audited 14 November 2026. Labels used in the main reports distinguish source facts, local-browser observations, lab measurements, research and judgment. No section was modified.

## A. Purpose

Let visitors explore curated Lo-Fi, anime and electronic tracks as an optional personality detail.

## B. Source architecture

[`src/sections/components/my-interests/MusicPlayer.tsx:5`](https://github.com/shehroz-codes/Shehroz.my.id/blob/6839347096468ec0ff98a5c01e5a1df0f03e1cfd/src/sections/components/my-interests/MusicPlayer.tsx#L5); `musicData.ts` and playlist styles in `MyInterests.css`.

## C. Technology

React activeGenre/current-track state, native buttons with aria-pressed, lazy artwork images and a conditional Spotify iframe. No audio engine, Spotify OAuth client or playback API in app source.

## D. Initialization

Default genre is Lo-Fi; there is no current track and no iframe. A song click supplies a track; iframe is then mounted by track ID. Genre changes clear the selected player.

## E. Loading

Artwork URLs are Spotify CDN images with small 32×32 display dimensions. The selected iframe has fixed 80 px height. Spotify controls actual player assets and availability.

## F. Rendering and updates

Filtering is local over a small static array. Favorites is intentionally empty, displaying an explanatory note; it is not a broken dynamic feed. Selection toggles button state and iframe key.

## G. Animation

Local button/visual decoration only until third-party embed loads. No automatic audio starts on navigation; visitors must press play inside Spotify.

## H. Network

CDN artwork may load as the section nears viewport. Spotify iframe is requested only after selection. The environment proxy blocked Spotify resources; playback/sign-in could not be verified.

## I. Performance

On-demand embed is already an effective optimization worth preserving. Initial desktop runs recorded one failed Spotify artwork URL, while initial mobile runs did not request it before their snapshot. This is environmental failure, not proof of a dead URL.

## J. Timing and readiness

Buttons are ready with the initial React tree. Functional checks switched genres, created the expected iframe URL and removed it on Favorites. They did not prove third-party playback success.

## K. Problems

Optional media adds page length before work examples and introduces unavailable third-party states. There is no evidence that recruiters universally dislike personal music; avoid claiming that.

## L. Potential fixes

Keep click-to-load, current lazy artwork and clear fallback instructions. Preserve the existing direct external link. No additional embed preconnect or player library is justified by the recorded evidence.

## M. Risks

A custom lightweight replacement could break licensing/playback behavior or remove accessibility. Autoloading an iframe or audio would worsen initial loading and surprise visitors.

## N. Recommendation

Keep Unchanged: user-controlled player. Investigate Further: real-device third-party behavior. Optional placement change only with owner approval.

## Evidence and handover

[Architecture](../01-ARCHITECTURE-AND-TECH-STACK.md) · [Measurements and limitations](../06-CHROMIUM-PERFORMANCE-RESULTS.md) · [Recommendation register](../07-OPTIMIZATION-ROADMAP.md) · [Section index](../04-ALL-SECTIONS-ANALYSIS.md). Raw results and screenshots are in `../evidence/`. Source locations are pinned to the audited commit. Any future source/content/design change requires separate owner authorization.
