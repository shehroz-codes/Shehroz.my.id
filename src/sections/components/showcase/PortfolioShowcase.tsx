import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import type { PreviewDocument, Project, TabId } from "./types";
import Icon from "./Icon";
import type { IconName } from "./Icon";
import { projects } from "./portfolioData";
import ProjectCard from "./ProjectCard";
import ProjectDetails from "./ProjectDetails";
import CertificatesPanel from "./CertificatesPanel";
import ExperiencePanel from "./ExperiencePanel";
import TechStackPanel from "./TechStackPanel";
import DocumentPreview from "./DocumentPreview";
import "./PortfolioShowcase.css";
interface PortfolioShowcaseProps {
  className?: string;
}
interface TabDefinition {
  id: TabId;
  label: string;
  icon: IconName;
  heading: string;
  accent: string;
  subtitle: string;
  meta: string;
}
const tabs: TabDefinition[] = [
  {
    id: "projects",
    label: "Projects",
    icon: "code",
    heading: "Featured",
    accent: "Projects",
    subtitle: "A curated space for the things I build.",
    meta: "04 PROJECT SLOTS",
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: "award",
    heading: "Learning &",
    accent: "Certificates",
    subtitle: "A space for verified learning milestones.",
    meta: "02 SAMPLE PREVIEWS",
  },
  {
    id: "experience",
    label: "Experience",
    icon: "briefcase",
    heading: "Professional",
    accent: "Experience",
    subtitle: "The journey behind the work.",
    meta: "02 LETTER SLOTS",
  },
  {
    id: "tech",
    label: "Tech Stack",
    icon: "stack",
    heading: "My development",
    accent: "Toolkit",
    subtitle: "The tools and technologies in my development toolkit.",
    meta: "PERSONAL TOOLKIT",
  },
];
export default function PortfolioShowcase({
  className = "",
}: PortfolioShowcaseProps) {
  const [active, setActive] = useState<TabId>("projects");
  useEffect(() => {
    const navigate = () => {
      if (window.location.hash === "#skills") setActive("tech");
      else if (window.location.hash === "#projects") setActive("projects");
    };
    navigate();
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  const [project, setProject] = useState<Project | null>(null);
  const [doc, setDoc] = useState<{
    title: string;
    document: PreviewDocument;
    sample: boolean;
  } | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const instance = useId().replace(/:/g, "");
  const index = tabs.findIndex((t) => t.id === active),
    current = tabs[index];
  function keyDown(event: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next = i;
    if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (i + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActive(tabs[next].id);
    buttonRefs.current[next]?.focus();
  }
  function preview(title: string, document: PreviewDocument, sample: boolean) {
    setDoc({ title, document, sample });
  }
  return (
    <section
      className={`portfolio-showcase ${className}`}
      aria-labelledby={`${instance}-title`}
    >
      <header className="ps-intro">
        <span className="ps-section-label">
          <Icon name="layers" size={16} />
          <span>THE PORTFOLIO</span>
          <span className="ps-label-dot" />
        </span>
        <h2 id={`${instance}-title`}>
          Projects &<br className="ps-mobile-break" />{" "}
          <span>Professional Work</span>
        </h2>
        <p>
          A showcase of my selected projects, certificates, experience and
          technical skills.
        </p>
        <div className="ps-title-line" aria-hidden="true">
          <i />
        </div>
      </header>
      <div
        className="ps-tabs"
        role="tablist"
        aria-label="Portfolio showcase categories"
      >
        <span
          className="ps-tab-indicator"
          aria-hidden="true"
          style={{ "--active-index": index } as CSSProperties}
        />
        {tabs.map((t, i) => (
          <button
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            key={t.id}
            id={`${instance}-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            aria-controls={`${instance}-panel`}
            tabIndex={active === t.id ? 0 : -1}
            className={`ps-tab ${active === t.id ? "ps-tab--active" : ""}`}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => keyDown(e, i)}
          >
            <Icon name={t.icon} size={20} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <div
        className="ps-panel"
        role="tabpanel"
        id={`${instance}-panel`}
        aria-labelledby={`${instance}-tab-${active}`}
        tabIndex={0}
      >
        <div className="ps-panel-heading">
          <div className="ps-panel-title">
            <span className="ps-panel-symbol">
              <Icon name={current.icon} size={25} />
            </span>
            <div>
              <h3>
                {current.heading} <span>{current.accent}</span>
              </h3>
              <p>{current.subtitle}</p>
            </div>
          </div>
          <div className="ps-panel-meta">
            <span className="ps-meta-dot" />
            {current.meta}
          </div>
        </div>
        <div className="ps-tab-content" key={active}>
          {active === "projects" && (
            <div className="ps-project-grid">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} onDetails={setProject} />
              ))}
            </div>
          )}
          {active === "certificates" && (
            <CertificatesPanel onPreview={preview} />
          )}{" "}
          {active === "experience" && <ExperiencePanel onPreview={preview} />}{" "}
          {active === "tech" && <TechStackPanel />}
        </div>
        <footer className="ps-panel-footer">
          <span>
            <Icon name="spark" size={13} />
            Thoughtfully built. Always evolving.
          </span>
          <span>
            {active === "projects"
              ? "Concept previews · verified links only"
              : "Sample content · replace with your actual records"}
          </span>
        </footer>
      </div>
      {project && (
        <ProjectDetails project={project} onClose={() => setProject(null)} />
      )}{" "}
      {doc && <DocumentPreview {...doc} onClose={() => setDoc(null)} />}
    </section>
  );
}
