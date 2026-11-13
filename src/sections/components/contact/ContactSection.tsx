import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import type { Backend } from './types';
import { contactMode } from './config';
import { loadBackend } from './services/backend';
import { liveCooldownKey, previewKey } from './services/storage';
import { useCooldown } from './useCooldown';
import ContactProfile from './ContactProfile';
import ContactForm from './ContactForm';
import VisitorComposer from './VisitorComposer';
import VisitorWall from './VisitorWall';
import './ContactSection.css';

export default function ContactSection() {
  const [backend, setBackend] = useState<Backend | null>(null);
  const [failed, setFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const { remaining, label } = useCooldown(contactMode === 'live' ? liveCooldownKey : previewKey);
  useEffect(() => {
    let cancelled = false;
    void loadBackend().then((service) => { if (!cancelled) setBackend(service); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [loadAttempt]);
  return <section className="contact-section" aria-labelledby="contact-title">
    {contactMode === 'preview' && <div className="mode-banner-wrap">
      <p className="mode-banner" role="note">Local preview — wall messages stay in this browser. Nothing is published or delivered.</p>
    </div>}
    {failed && <div className="mode-banner" role="alert">
      <p>The contact service could not load. Nothing has been sent.</p>
      <button className="btn btn--ghost" type="button" onClick={() => { setFailed(false); setLoadAttempt((attempt) => attempt + 1); }}>Retry contact service</button>
    </div>}
    <div className="contact">
      <header className="contact__head">
        <h2 id="contact-title"><Mail className="icon" aria-hidden="true" />Contact Me</h2>
        <p>Get in touch directly or leave a note on the visitor wall.</p>
      </header>
      <div className="contact__grid-row contact__grid-row--top">
        <ContactProfile /><ContactForm backend={backend} />
      </div>
      <div className="contact__grid-row contact__grid-row--bottom">
        <VisitorComposer backend={backend} remaining={remaining} cooldownLabel={label} />
        <VisitorWall backend={backend} cooling={remaining > 0} unavailable={failed} />
      </div>
    </div>
  </section>;
}
