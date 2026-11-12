import { useEffect, useRef } from "react";
import { safeExternalUrl } from "./portfolioData";
import type { PointerEvent } from "react";
import type { Project } from "./types";
import Icon from "./Icon";
import TechnologyIcons from "./TechnologyIcons";
import ProjectLinks from "./ProjectLinks";
interface ProjectCardProps {
  project: Project;
  onDetails: (project: Project) => void;
}
export default function ProjectCard({ project, onDetails }: ProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null),
    frame = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    },
    [],
  );
  const hasLive = !!safeExternalUrl(project.liveUrl);
  const hasSource = !!safeExternalUrl(project.sourceUrl);
  const linkStatus =
    hasLive && hasSource
      ? "Live & source available"
      : hasLive
        ? "Live demo available"
        : hasSource
          ? "Source code available"
          : "Links not supplied";
  function reset() {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = undefined;
    const s = cardRef.current?.style;
    s?.removeProperty("--rx");
    s?.removeProperty("--ry");
    s?.removeProperty("--px");
    s?.removeProperty("--py");
  }
  function move(event: PointerEvent<HTMLElement>) {
    if (
      event.pointerType !== "mouse" ||
      !window.matchMedia(
        "(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)",
      ).matches
    )
      return;
    if (frame.current !== undefined) return;
    const x = event.clientX,
      y = event.clientY;
    frame.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (el) {
        const r = el.getBoundingClientRect(),
          px = (x - r.left) / r.width,
          py = (y - r.top) / r.height;
        el.style.setProperty("--rx", `${(0.5 - py) * 1.8}deg`);
        el.style.setProperty("--ry", `${(px - 0.5) * 1.8}deg`);
        el.style.setProperty("--px", `${px * 100}%`);
        el.style.setProperty("--py", `${py * 100}%`);
      }
      frame.current = undefined;
    });
  }
  return (
    <article
      ref={cardRef}
      className="ps-project-card"
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <div className="ps-card-image">
        <img
          src={project.preview}
          alt={project.previewAlt}
          loading="lazy"
          width="624"
          height="416"
        />
        <span className="ps-number">/{project.number}</span>
        {project.previewIsSample && (
          <span className="ps-image-label">SAMPLE CONCEPT</span>
        )}
        {project.detailsEnabled !== false && (
          <button
            type="button"
            className="ps-expand"
            aria-label={`Preview ${project.title}`}
            onClick={() => onDetails(project)}
          >
            <Icon name="expand" size={17} />
          </button>
        )}
      </div>
      <div className="ps-card-content">
        <div className="ps-card-kicker">
          <span>{project.category}</span>
          <span
            className={`ps-status ${project.status === "Pending" ? "ps-status--pending" : ""}`}
          >
            <i />
            {project.status === "Sample concept" ? "Concept" : project.status}
          </span>
        </div>
        <h3>{project.title}</h3>
        <p className="ps-card-description">{project.description}</p>
        <div className="ps-card-tech">
          <TechnologyIcons ids={project.technologyIds} />
        </div>
        <ProjectLinks project={project} />
        <div className="ps-card-bottom">
          <span>{linkStatus}</span>
          {project.detailsEnabled !== false && (
            <button
              type="button"
              className="ps-details-link"
              onClick={() => onDetails(project)}
              aria-label={`View details for ${project.title}`}
            >
              Details
              <Icon name="arrow" size={14} className="ps-arrow" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
