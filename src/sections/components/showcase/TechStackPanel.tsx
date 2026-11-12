import type { CSSProperties } from "react";
import { projects, technologies } from "./portfolioData";
import type { TechnologyGroup } from "./types";
const groups: TechnologyGroup[] = [
  "Frontend",
  "Backend",
  "Database",
  "Tools",
  "Development Environment",
];
export default function TechStackPanel() {
  const used = new Set(projects.flatMap((p) => p.technologyIds));
  const confirmed = technologies.filter((t) => used.has(t.id));
  return (
    <>
      <p className="ps-stack-intro">
        Only technologies confirmed in project data are displayed. No inferred
        tools or proficiency ratings.
      </p>
      <div className="ps-stack-groups">
        {groups.map((group) => {
          const items = confirmed.filter((t) => t.group === group);
          return (
            <section
              key={group}
              className={`ps-stack-group ${items.length ? "" : "ps-stack-group--empty"}`}
            >
              <div className="ps-group-heading">
                <h3>{group}</h3>
                <span>{String(items.length).padStart(2, "0")}</span>
              </div>
              {items.length ? (
                <ul className="ps-tech-grid">
                  {items.map((t) => (
                    <li
                      className="ps-tech-tile"
                      key={t.id}
                      style={{ "--brand": t.color } as CSSProperties}
                    >
                      <img
                        src={t.icon}
                        width="40"
                        height="40"
                        alt={`${t.name} logo`}
                        loading="lazy"
                      />
                      <span>{t.name}</span>
                      <span className="ps-tech-confirmed">Confirmed stack</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ps-muted ps-small">
                  No confirmed technologies yet.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
