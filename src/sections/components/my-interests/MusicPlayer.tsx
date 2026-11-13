import { useState } from 'react';
import { ExternalLink, Heart, Info, Music2 } from 'lucide-react';
import { genres, playlist, type GenreId, type Track } from './musicData';

export default function MusicPlayer() {
  const [activeGenre, setActiveGenre] = useState<GenreId>('lofi');
  const [current, setCurrent] = useState<Track>();
  const visibleTracks = playlist.tracks.filter((track) => track.genre === activeGenre);

  return (
    <section className="mi-player" aria-label="My music playlist">
      <div className="mi-player-library">
        <div className="mi-player-left">
          <div className="mi-player-art" aria-hidden="true">
            <Music2 size={26} strokeWidth={1.8} />
          </div>
          <div className="mi-player-meta">
            <h3 className="mi-player-title">{playlist.title}</h3>
            <p className="mi-player-subtitle">{playlist.subtitle}</p>
          </div>
        </div>
        {visibleTracks.length ? (
          <ul className="mi-player-songs" aria-label="Songs">
            {visibleTracks.map((track) => (
              <li key={track.id}>
                <button
                  type="button"
                  className={`mi-song${current?.id === track.id ? ' is-active' : ''}`}
                  aria-pressed={current?.id === track.id}
                  onClick={() => { setCurrent(track); }}
                >
                  <span className="mi-song-art" aria-hidden="true">
                    <Music2 size={18} />
                    {track.artworkSrc && (
                      <img
                        src={track.artworkSrc}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                        onError={(event) => { event.currentTarget.hidden = true; }}
                      />
                    )}
                  </span>
                  <span className="mi-song-label">
                    <span>{track.title}</span>
                    <small>{track.artist}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mi-player-note">Personal favorites will appear here once selected.</p>
        )}
      </div>

      <div className="mi-player-center">
        {current ? (
          <>
            <div className="mi-player-embed-wrap" tabIndex={0} aria-label="Spotify player">
              <iframe
                key={current.id}
                title={`${current.title} — Spotify player`}
                src={`https://open.spotify.com/embed/track/${current.id}?theme=0`}
                className="mi-player-embed"
                width="100%"
                height={80}
                allow="autoplay; clipboard-write; encrypted-media"
              />
            </div>
            <p className="mi-player-note">
              Playback may be a preview and can require Spotify sign-in.
              If this track is unavailable, choose another song or{' '}
              <a href={`https://open.spotify.com/track/${current.id}`} target="_blank" rel="noreferrer">
                open on Spotify <ExternalLink size={11} aria-hidden="true" />
              </a>.
            </p>
          </>
        ) : (
          <div className="mi-player-placeholder">
            <Info size={16} aria-hidden="true" />
            <p>{activeGenre === 'favorites'
              ? 'Your personal Hindi, Urdu, English, Anime and Lo-Fi favorites belong here.'
              : 'Choose a song to load the Spotify player, then press play inside it.'}</p>
          </div>
        )}
      </div>

      <nav className="mi-player-genres" aria-label="Playlist genres">
        {genres.map((genre) => (
          <button
            key={genre.id}
            type="button"
            className={`mi-genre${activeGenre === genre.id ? ' is-active' : ''}`}
            onClick={() => { setActiveGenre(genre.id); setCurrent(undefined); }}
            aria-pressed={activeGenre === genre.id}
          >
            {genre.id === 'favorites' ? <Heart size={13} aria-hidden="true" /> : <Music2 size={13} aria-hidden="true" />}
            {genre.label}
          </button>
        ))}
      </nav>
    </section>
  );
}
