import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ExternalLink,
  Heart,
  Info,
  Music2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react';
import { genres, playlist, type Track } from './musicData';

const PROVIDER_LABEL: Record<string, string> = {
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  youtube: 'YouTube',
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeGenre, setActiveGenre] = useState<string>('lofi');
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(playlist.tracks.filter((t) => t.favorite).map((t) => t.id)),
  );
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  /** Tracks visible under the selected genre tab. */
  const visibleTracks = useMemo<Track[]>(() => {
    if (activeGenre === 'favorites') return playlist.tracks.filter((t) => favorites.has(t.id));
    const genre = genres.find((g) => g.id === activeGenre);
    if (!genre) return playlist.tracks;
    return playlist.tracks.filter((t) => t.category.toLowerCase().includes(genre.label.toLowerCase()));
  }, [activeGenre, favorites]);

  const current: Track | undefined = visibleTracks[Math.min(index, Math.max(0, visibleTracks.length - 1))];

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [activeGenre]);

  const audioSrc = current?.source.kind === 'audio' ? current.source.src : '';
  const isEmbed = current?.source.kind === 'embed';
  const embedUrl = current?.source.kind === 'embed' ? current.source.embedUrl : '';
  const hasAudio = audioSrc.length > 0;
  const hasEmbed = embedUrl.length > 0;

  /* HTML5 Audio element lifecycle — only for local/licensed files. */
  useEffect(() => {
    if (!hasAudio || !audioRef.current) return;
    const audio = audioRef.current;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (playing) void audio.play().catch(() => setPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSrc]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, []);

  const step = useCallback(
    (direction: 1 | -1) => {
      if (visibleTracks.length === 0) return;
      setPlaying(false);
      if (shuffle && visibleTracks.length > 1) {
        let next = index;
        while (next === index) next = Math.floor(Math.random() * visibleTracks.length);
        setIndex(next);
        return;
      }
      setIndex((i) => (i + direction + visibleTracks.length) % visibleTracks.length);
    },
    [index, shuffle, visibleTracks.length],
  );

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(value)) {
      audio.currentTime = value;
      setCurrentTime(value);
    }
  };

  return (
    <section className="mi-player" aria-label="My music playlist">
      {/* LEFT — artwork, titles, transport */}
      <div className="mi-player-left">
        <div className="mi-player-art" aria-hidden="true">
          {playlist.artworkSrc ? (
            <img src={playlist.artworkSrc} alt="" />
          ) : (
            <Music2 size={26} strokeWidth={1.8} />
          )}
        </div>
        <div className="mi-player-meta">
          <h3 className="mi-player-title">{playlist.title}</h3>
          <p className="mi-player-subtitle">{playlist.subtitle}</p>
          <div className="mi-player-controls">
            <button
              type="button"
              className={`mi-btn mi-btn--icon${shuffle ? ' is-active' : ''}`}
              onClick={() => setShuffle((v) => !v)}
              aria-pressed={shuffle}
              aria-label="Shuffle"
              disabled={!hasAudio}
              title={hasAudio ? 'Shuffle' : 'Controls enable once you add an audio file in musicData.ts'}
            >
              <Shuffle size={15} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="mi-btn mi-btn--icon"
              onClick={() => step(-1)}
              aria-label="Previous track"
              disabled={!hasAudio}
            >
              <SkipBack size={16} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="mi-btn mi-btn--play"
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
              disabled={!hasAudio}
            >
              {playing ? (
                <Pause size={17} strokeWidth={2.2} aria-hidden="true" />
              ) : (
                <Play size={17} strokeWidth={2.2} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="mi-btn mi-btn--icon"
              onClick={() => step(1)}
              aria-label="Next track"
              disabled={!hasAudio}
            >
              <SkipForward size={16} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`mi-btn mi-btn--icon${repeat ? ' is-active' : ''}`}
              onClick={() => setRepeat((v) => !v)}
              aria-pressed={repeat}
              aria-label="Repeat"
              disabled={!hasAudio}
            >
              <Repeat size={15} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* CENTER — track info, progress, duration, favourite */}
      <div className="mi-player-center">
        {isEmbed ? (
          hasEmbed ? (
            <>
              <iframe
                title={`${current.title} — ${
                  current.source.kind === 'embed' ? PROVIDER_LABEL[current.source.provider] : 'provider'
                } embed`}
                src={embedUrl}
                className="mi-player-embed"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
              <p className="mi-player-note">
                Playback is handled by{' '}
                {current.source.kind === 'embed' ? PROVIDER_LABEL[current.source.provider] : 'the provider'}
                &rsquo;s own player.
              </p>
            </>
          ) : (
            <div className="mi-player-placeholder">
              <Info size={16} aria-hidden="true" />
              <p>
                Paste an official{' '}
                {current && current.source.kind === 'embed' ? PROVIDER_LABEL[current.source.provider] : ''} embed URL
                in <code>musicData.ts</code> to activate the embed player.
              </p>
            </div>
          )
        ) : hasAudio ? (
          <>
            <div className="mi-player-track-row">
              <span className="mi-player-track-title">{current?.title}</span>
              <span className="mi-player-track-category">{current?.category}</span>
              <button
                type="button"
                className={`mi-btn mi-btn--icon mi-btn--heart${current && favorites.has(current.id) ? ' is-active' : ''}`}
                onClick={() => current && toggleFavorite(current.id)}
                aria-pressed={current ? favorites.has(current.id) : false}
                aria-label={current && favorites.has(current.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={15} strokeWidth={2.1} aria-hidden="true" />
              </button>
            </div>
            <div className="mi-player-progress">
              <span className="mi-player-time">{formatTime(currentTime)}</span>
              <input
                type="range"
                className="mi-player-range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label="Seek"
                style={{ ['--progress' as string]: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
              <span className="mi-player-time">{formatTime(duration)}</span>
            </div>
            <div className="mi-player-volume">
              <Volume2 size={14} aria-hidden="true" />
              <input
                type="range"
                className="mi-player-range mi-player-range--volume"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume"
                style={{ ['--progress' as string]: `${volume * 100}%` }}
              />
            </div>
            {audioSrc && <audio
              ref={audioRef}
              src={audioSrc}
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onEnded={() => (repeat ? togglePlay() : step(1))}
            />}
          </>
        ) : (
          <div className="mi-player-placeholder">
            <Info size={16} aria-hidden="true" />
            <p>
              Add your own licensed audio URL for &ldquo;{current?.title}&rdquo; in <code>musicData.ts</code> — play,
              seek, volume and favorites activate automatically.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT — genre selection */}
      <nav className="mi-player-genres" aria-label="Playlist genres">
        {genres.map((genre) => (
          <button
            key={genre.id}
            type="button"
            className={`mi-genre${activeGenre === genre.id ? ' is-active' : ''}`}
            onClick={() => setActiveGenre(genre.id)}
            aria-pressed={activeGenre === genre.id}
          >
            {genre.id === 'favorites' ? <Heart size={13} aria-hidden="true" /> : <Music2 size={13} aria-hidden="true" />}
            {genre.label}
          </button>
        ))}
        {isEmbed && hasEmbed && (
          <a className="mi-genre mi-genre--link" href={embedUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={13} aria-hidden="true" />
            Open on{' '}
            {current && current.source.kind === 'embed' ? PROVIDER_LABEL[current.source.provider] : 'provider'}
          </a>
        )}
      </nav>
    </section>
  );
}
