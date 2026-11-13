/** Edit this file to change the playlist. IDs and artwork below were verified
 * against official Spotify track/embed pages. Order is curated, not a live ranking.
 * Playback and availability are controlled entirely by Spotify.
 */
export type GenreId = 'lofi' | 'anime-ost' | 'electronic' | 'favorites';

export interface Track {
  /** The 22-character ID from https://open.spotify.com/track/<id>. */
  id: string;
  title: string;
  artist: string;
  genre: GenreId;
  artworkSrc?: string;
}

export const genres: { id: GenreId; label: string }[] = [
  { id: 'lofi', label: 'Lo-Fi' },
  { id: 'anime-ost', label: 'Anime OST' },
  { id: 'electronic', label: 'Electronic' },
  { id: 'favorites', label: 'Favorites' },
];

/** Add your own Hindi, Urdu, English, Anime or Lo-Fi choices here.
 * Copy an existing track object (or add a verified Spotify track), set
 * genre: 'favorites', and keep its real title, artist and Spotify track ID.
 * Intentionally empty: no personal favorites have been supplied.
 */
const favorites: Track[] = [];

export const playlist = {
  title: 'My Music Playlist',
  subtitle: 'Lo-Fi, anime themes and electronic music.',
  tracks: [
    { id: '3ukklzkdKjDzqkroiXTvf4', title: 'Affection', artist: 'Jinsang', genre: 'lofi' },
    {
      id: '4DZNBRBogcfKTTaTyi4V01', title: "i'm closing my eyes", artist: 'potsu', genre: 'lofi',
      artworkSrc: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e024dfc8542b4afa02d7a668705',
    },
    {
      id: '4U2v1vLfpfNjOEXVuY1aHd', title: 'Sadness and Sorrow (Naruto)', artist: 'Taylor Davis', genre: 'anime-ost',
      artworkSrc: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e025eff0626284aa8f4c35cabb6',
    },
    {
      id: '5Zormp4Hq3Tszy3v1aMDNe', title: 'We are [Originally Performed by Hiroshi Kitadani]',
      artist: "Angel's Music Box", genre: 'anime-ost',
      artworkSrc: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e028d69e2e8bb8d22657af5a37d',
    },
    { id: '2Wi5ubKr8zSk8L3CLemyS4', title: 'Tank!', artist: 'SEATBELTS', genre: 'anime-ost' },
    {
      id: '6Xe9wT5xeZETPwtaP2ynUz', title: 'Levels - Original Version', artist: 'Avicii', genre: 'electronic',
      artworkSrc: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02ffb343926530168be4724dd4',
    },
    {
      id: '0DiWol3AO6WpXZgp0goxAV', title: 'One More Time', artist: 'Daft Punk', genre: 'electronic',
      artworkSrc: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e021e81bff9807a9e629fce5ade',
    },
    ...favorites,
  ] satisfies Track[],
};
