import { ArrowRight, Star } from 'lucide-react';
import type { Interest } from './interestsData';

interface InterestCardProps {
  interest: Interest;
}

export default function InterestCard({ interest }: InterestCardProps) {
  const { title, description, icon: Icon, featured = false, href } = interest;

  return (
    <article className={`mi-card${featured ? ' mi-card--featured' : ''}`}>
      {featured && (
        <span className="mi-card-badge">
          <Star size={11} strokeWidth={2.5} aria-hidden="true" />
          Featured
        </span>
      )}
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
