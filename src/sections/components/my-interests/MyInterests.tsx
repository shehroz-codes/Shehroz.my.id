import { Sparkles } from 'lucide-react';
import HalftonePortrait from './HalftonePortrait';
import InterestCard from './InterestCard';
import MusicPlayer from './MusicPlayer';
import { interestsLeft, interestsRight, portrait, sectionHeader } from './interestsData';
import './MyInterests.css';

/**
 * My Interests — drop-in section for the existing portfolio.
 *
 * The section root is fully TRANSPARENT: your animated, cursor-reactive
 * global background shows straight through. Only the cards, the portrait
 * halo and the music panel carry translucent surfaces and glows.
 */
export default function MyInterests() {
  return (
    <section className="mi-section" aria-labelledby="my-interests-title">
      <header className="mi-header">
        <span className="mi-badge">
          <Sparkles size={13} strokeWidth={2.2} aria-hidden="true" />
          {sectionHeader.badge}
        </span>
        <h2 id="my-interests-title" className="mi-title">
          {sectionHeader.titleLead} <span className="mi-title-accent">{sectionHeader.titleAccent}</span>
        </h2>
        <p className="mi-subtitle">{sectionHeader.subtitle}</p>
      </header>

      <div className="mi-grid">
        <div className="mi-column mi-column--left">
          {interestsLeft.map((interest) => (
            <InterestCard key={interest.id} interest={interest} />
          ))}
        </div>

        <div className="mi-portrait-wrap">
          <HalftonePortrait {...portrait} className="mi-portrait" />
        </div>

        <div className="mi-column mi-column--right">
          {interestsRight.map((interest) => (
            <InterestCard key={interest.id} interest={interest} />
          ))}
        </div>
      </div>

      <MusicPlayer />
    </section>
  );
}
