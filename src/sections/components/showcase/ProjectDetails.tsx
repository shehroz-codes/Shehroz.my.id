import type { Project } from "./types";
import Modal from "./Modal";
import ProjectLinks from "./ProjectLinks";
import TechnologyIcons from "./TechnologyIcons";
import Icon from "./Icon";
interface ProjectDetailsProps {
  project: Project;
  onClose: () => void;
}
export default function ProjectDetails({
  project,
  onClose,
}: ProjectDetailsProps) {
  return (
    <Modal
      title={project.title}
      subtitle={
        project.previewIsSample
          ? "Sample concept artwork · actual project details remain editable"
          : project.category
      }
      onClose={onClose}
      wide
    >
      <div className="ps-detail-gallery">
        {(project.screenshots?.length
          ? project.screenshots
          : [{ src: project.preview, alt: project.previewAlt }]
        ).map((s, i) => (
          <figure key={`${s.src}-${i}`}>
            <img src={s.src} alt={s.alt} width="624" height="416" />
            <figcaption>{s.alt}</figcaption>
          </figure>
        ))}
      </div>
      <div className="ps-detail-columns">
        <section>
          <h3>Project overview</h3>
          <p>{project.overview || "No overview supplied yet."}</p>
          <h3>Features</h3>
          {project.features?.length ? (
            <ul className="ps-feature-list">
              {project.features.map((f) => (
                <li key={f}>
                  <Icon name="check" size={16} />
                  {f}
                </li>
              ))}
            </ul>
          ) : (
            <p className="ps-muted">
              Verified feature details have not been provided.
            </p>
          )}
        </section>
        <section>
          <h3>Technology stack</h3>
          <TechnologyIcons ids={project.technologyIds} />
          <h3>Project links</h3>
          <ProjectLinks project={project} />
          {(!project.liveUrl || !project.sourceUrl) && (
            <p className="ps-link-note">
              Missing links stay unavailable until you add verified URLs.
            </p>
          )}
        </section>
      </div>
    </Modal>
  );
}
