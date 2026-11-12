/* ------------------------------------------------------------------ */
/* Music playlist configuration                                        */
/*                                                                    */
/* ADD YOUR MUSIC HERE — every track, genre label and artwork path     */
/* lives in this one file.                                             */
/*                                                                    */
/* Two kinds of sources are supported:                                 */
/*                                                                    */
/* 1. { kind: 'audio', src: '/music/your-track.mp3' }                  */
/*    A local or licensed audio file. Gives full HTML5 Audio controls: */
/*    play/pause, previous/next, seek, volume, shuffle, repeat.        */
/*                                                                    */
/* 2. { kind: 'embed', provider: 'spotify' | 'soundcloud' | 'youtube', */
/*      embedUrl: 'https://…official-embed-url…' }                     */
/*    An OFFICIAL embed (Spotify / SoundCloud / YouTube iframe).       */
/*    Playback is handled entirely by the provider's own player —      */
/*    the custom controls step aside and the iframe is shown instead.  */
/*                                                                    */
/* Do NOT add scraped, ripped or unlicensed URLs. Leave src/embedUrl   */
/* as '' to show the honest placeholder state.                         */
/* ------------------------------------------------------------------ */

export type TrackSource =
  | { kind: 'audio'; src: string }
  | { kind: 'embed'; provider: 'spotify' | 'soundcloud' | 'youtube'; embedUrl: string };

export interface Track {
  id: string;
  title: string;
  /** Shown under the title, e.g. "Lo-Fi · Chill · Focus". */
  category: string;
  /** Favourited tracks appear under the "Favorites" genre. */
  favorite?: boolean;
  source: TrackSource;
}

export interface Genre {
  id: string;
  label: string;
}

export const genres: Genre[] = [
  { id: 'lofi', label: 'Lo-Fi' },
  { id: 'anime-ost', label: 'Anime OST' },
  { id: 'electronic', label: 'Electronic' },
  { id: 'favorites', label: 'Favorites' },
];

export const playlist = {
  title: 'My Music Playlist',
  subtitle: 'A few tracks I keep on repeat while coding.',
  artworkAlt: 'Playlist artwork',
  /** Optional: point at your own artwork image, or leave '' for the gradient placeholder. */
  artworkSrc: '',
  tracks: [
    {
      id: 'track-1',
      title: 'Lost in Code',
      category: 'Lo-Fi · Chill · Focus',
      favorite: true,
      source: { kind: 'audio', src: '' }, // ← add your licensed audio file URL
    },
    {
      id: 'track-2',
      title: 'Shinobi Way',
      category: 'Anime OST',
      favorite: true,
      source: { kind: 'audio', src: '' },
    },
    {
      id: 'track-3',
      title: 'Nightfall Drive',
      category: 'Electronic',
      source: { kind: 'audio', src: '' },
    },
    {
      id: 'track-4',
      title: 'Official Embed Demo',
      category: 'Spotify · SoundCloud · YouTube',
      source: { kind: 'embed', provider: 'spotify', embedUrl: '' }, // ← paste an official embed URL
    },
  ] as Track[],
};
