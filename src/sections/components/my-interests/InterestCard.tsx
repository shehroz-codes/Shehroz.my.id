import { ArrowRight } from 'lucide-react';
import type { Interest } from './interestsData';

interface InterestCardProps {
  interest: Interest;
  direction?: 'left' | 'right';
}

export default function InterestCard({ interest, direction }: InterestCardProps) {
  const { title, description, icon: Icon, featured = false, href } = interest;

  return (
    <article data-reveal-direction={direction} className={`mi-card${featured ? ' mi-card--featured' : ''}`}>
      <span className="mi-card-icon" aria-hidden="true">
        <Icon size={22} strokeWidth={1.9} />
      </span>
      <div className="mi-card-body">
        <h3 className="mi-card-title">{title}</h3>
        <p className="mi-card-desc">{description}</p>
      </div>
      {/* The arrow renders only when a real destination exists in interestsData.ts. */}
      {href && (
        <a className="mi-card-arrow" href={href} aria-label={`Open ${title}`}>
          <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </a>
      )}
    </article>
  );
}
