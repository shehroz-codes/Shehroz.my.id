import { useEffect, useState } from 'react';
import { Calendar, Clock, Globe, MessageCircle, Users } from 'lucide-react';
import type { Backend, Feed, WallMessage } from './types';
import { wallSettings } from './config';

const dateFormat = new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });
function countryFlag(code: string | null) {
  return code && /^[A-Za-z]{2}$/.test(code)
    ? [...code.toUpperCase()].map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join('') : '';
}
function VisitorMessage({ message: m }: { message: WallMessage }) {
  const initials = m.name.trim().split(/\s+/).slice(0, 2).map((word) => [...word][0]).join('').toUpperCase();
  let hue = 0;
  for (const letter of m.name) hue = (hue * 31 + letter.codePointAt(0)!) % 360;
  const photo = m.photoUrl && (/^data:image\/(jpeg|png|webp);base64,/.test(m.photoUrl) || m.photoUrl.startsWith('https://')) ? m.photoUrl : null;
  return <li className="msg">
    <div className="msg__avatar" style={{ background: `linear-gradient(135deg,hsl(${hue} 70% 45%),hsl(${(hue + 50) % 360} 70% 30%))` }}>
      {photo ? <img src={photo} alt={`${m.name}'s photo`} loading="lazy" /> : initials}
    </div>
    <div className="msg__body">
      <div className="msg__top">
        <div className="msg__who">
          <span className="msg__name" dir="auto">{m.name}</span>
          <span className="msg__country">{countryFlag(m.countryCode) || <Globe className="icon" aria-hidden="true" />}{m.countryName || 'Unspecified'}</span>
          {m.isDemo && <span className="tag">Local preview</span>}
        </div>
        <div className="msg__when">
          <span><Calendar className="icon" aria-hidden="true" /><time dateTime={new Date(m.createdAt).toISOString()}>{dateFormat.format(m.createdAt)}</time></span>
          <span><Clock className="icon" aria-hidden="true" />{timeFormat.format(m.createdAt)}</span>
        </div>
      </div>
      <p className="msg__text" dir="auto">{m.text}</p>
    </div>
  </li>;
}

export default function VisitorWall({ backend, cooling, unavailable = false }: { backend: Backend | null; cooling: boolean; unavailable?: boolean }) {
  const [limit, setLimit] = useState(wallSettings.pageSize);
  const [feed, setFeed] = useState<Feed>({ messages: [], hasMore: false });
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const failure = unavailable ? 'The contact service could not load. Please retry the contact service.' : error;
  useEffect(() => {
    setError(''); setLoaded(false);
    if (!backend) return;
    return backend.subscribe(limit, (next) => { setFeed(next); setLoaded(true); setError(''); },
      (message) => { setError(message); setLoaded(true); setFeed({ messages: [], hasMore: false }); });
  }, [backend, limit, attempt]);
  return <article className="card feed-card gb" data-cooldown={cooling} aria-labelledby="contact-wall-title">
    <div className="feed-card__head">
      <h3 id="contact-wall-title"><Users className="icon" aria-hidden="true" />Visitor Messages</h3>
      <div className="pill"><MessageCircle className="icon" aria-hidden="true" />{backend?.mode === 'preview' ? 'Previews' : 'Showing'} <b aria-live="polite">{feed.messages.length}</b></div>
    </div>
    <div className="feed-scroll-container" tabIndex={0} role="region" aria-label="Visitor message list">
      <ul className="feed" aria-label="Visitor messages">
        {feed.messages.length ? feed.messages.map((message) => <VisitorMessage key={message.id} message={message} />) : (
          <li className="empty"><MessageCircle className="icon" aria-hidden="true" />
            <h4>{failure ? 'Wall unavailable' : !loaded ? 'Loading messages…' : 'No messages yet'}</h4>
            <p>{failure || (backend?.mode === 'preview' ? 'Try a local preview of the visitor wall.' : 'Leave a note for the visitor wall.')}</p>
          </li>
        )}
      </ul>
    </div>
    {error && !unavailable && <div className="feed__more"><button className="btn btn--ghost" type="button" onClick={() => setAttempt((old) => old + 1)}>Retry messages</button></div>}
    {feed.hasMore && !failure && <div className="feed__more"><button className="btn btn--ghost" type="button" onClick={() => setLimit((old) => old + wallSettings.pageSize)}>Load more messages</button></div>}
  </article>;
}
