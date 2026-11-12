import { certificates } from "./portfolioData";
import type { Certificate, PreviewDocument } from "./types";
import Icon from "./Icon";
interface CertificatesPanelProps {
  onPreview: (
    title: string,
    document: PreviewDocument,
    sample: boolean,
  ) => void;
}
export default function CertificatesPanel({
  onPreview,
}: CertificatesPanelProps) {
  return (
    <div className="ps-cert-grid">
      {certificates.map((c: Certificate, i) => (
        <article className="ps-document-card" key={c.id}>
          <div className="ps-document-thumb">
            {c.document ? (
              <img
                src={c.document.thumbnail}
                alt={c.document.alt}
                loading="lazy"
                width="912"
                height="568"
              />
            ) : (
              <div className="ps-empty-art">
                <Icon name="award" size={48} />
              </div>
            )}
            <span className="ps-document-type">
              {c.document?.kind.toUpperCase() || "AWAITING FILE"}
            </span>
          </div>
          <div className="ps-document-info">
            <p className="ps-eyebrow">CERTIFICATE / 0{i + 1}</p>
            <h3>{c.name}</h3>
            <dl>
              <div>
                <dt>Issuer</dt>
                <dd>{c.issuer || "To be provided"}</dd>
              </div>
              <div>
                <dt>Completed</dt>
                <dd>{c.completionDate || "Not supplied"}</dd>
              </div>
            </dl>
            {c.sample && (
              <p className="ps-sample-note">
                Sample placeholder — not a real certificate
              </p>
            )}
            <button
              type="button"
              className="ps-button ps-button--primary"
              disabled={!c.document}
              onClick={() =>
                c.document && onPreview(c.name, c.document, c.sample)
              }
            >
              <Icon name="award" size={17} />
              View Certificate
              <Icon name="arrow" size={16} className="ps-arrow" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
