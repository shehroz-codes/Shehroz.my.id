import { experiences } from "./portfolioData";
import type { PreviewDocument } from "./types";
import Icon from "./Icon";
interface ExperiencePanelProps {
  onPreview: (
    title: string,
    document: PreviewDocument,
    sample: boolean,
  ) => void;
}
export default function ExperiencePanel({ onPreview }: ExperiencePanelProps) {
  return (
    <ol className="ps-timeline">
      {experiences.map((e, i) => (
        <li className="ps-timeline-item" key={e.id}>
          <span className="ps-timeline-dot">
            <Icon name="briefcase" size={19} />
          </span>
          <article className="ps-experience-card">
            <div className="ps-experience-main">
              <p className="ps-eyebrow">EXPERIENCE / 0{i + 1}</p>
              <h3>{e.jobTitle || "Your role goes here"}</h3>
              <div className="ps-experience-meta">
                <span>{e.company || "Company not provided"}</span>
                <span>{e.dates || "Dates not provided"}</span>
              </div>
              <p>{e.description || "Add your verified experience details."}</p>
              {e.skills.length ? (
                <ul className="ps-skill-tags">
                  {e.skills.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="ps-muted ps-small">
                  Relevant skills will appear once supplied.
                </p>
              )}
              {e.sample && (
                <p className="ps-sample-note">SAMPLE — NOT A REAL DOCUMENT</p>
              )}
              <button
                type="button"
                className="ps-button ps-button--secondary"
                disabled={!e.letter}
                onClick={() =>
                  e.letter &&
                  onPreview(`Experience letter ${i + 1}`, e.letter, e.sample)
                }
              >
                <Icon name="file" size={16} />
                View experience letter
                <Icon name="arrow" size={15} className="ps-arrow" />
              </button>
            </div>
            {e.letter && (
              <button
                className="ps-letter-preview"
                type="button"
                onClick={() =>
                  e.letter &&
                  onPreview(`Experience letter ${i + 1}`, e.letter, e.sample)
                }
                aria-label={`${e.letter.kind.toUpperCase()} preview for experience letter ${i + 1}`}
              >
                <img
                  src={e.letter.thumbnail}
                  alt={e.letter.alt}
                  loading="lazy"
                  width="624"
                  height="832"
                />
                <span>
                  {e.letter.kind.toUpperCase()} PREVIEW{" "}
                  <Icon name="expand" size={13} />
                </span>
              </button>
            )}
          </article>
        </li>
      ))}
    </ol>
  );
}
