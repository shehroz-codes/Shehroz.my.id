import type { Project } from "./types";
import { safeExternalUrl } from "./portfolioData";
import Icon from "./Icon";
interface ProjectLinksProps {
  project: Project;
}
export default function ProjectLinks({ project }: ProjectLinksProps) {
  const live = safeExternalUrl(project.liveUrl),
    source = safeExternalUrl(project.sourceUrl);
  return (
    <div className="ps-project-links">
      {live ? (
        <a
          className="ps-button ps-button--primary"
          href={live}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${project.title} live demo`}
        >
          <Icon name="external" size={15} />
          Live Demo
          <Icon name="arrow" size={14} className="ps-arrow" />
        </a>
      ) : (
        <button
          type="button"
          className="ps-button ps-button--primary"
          disabled
          aria-label={`${project.title}: live demo link not provided`}
          title="Add a verified liveUrl in portfolioData.ts"
        >
          <Icon name="external" size={15} />
          Live Demo
        </button>
      )}
      {source ? (
        <a
          className="ps-button ps-button--secondary"
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${project.title} source code`}
        >
          <Icon name="github" size={16} />
          Code
          <Icon name="arrow" size={14} className="ps-arrow" />
        </a>
      ) : (
        <button
          type="button"
          className="ps-button ps-button--secondary"
          disabled
          aria-label={`${project.title}: source code link not provided`}
          title="Add a verified sourceUrl in portfolioData.ts"
        >
          <Icon name="github" size={16} />
          Code
        </button>
      )}
    </div>
  );
}
