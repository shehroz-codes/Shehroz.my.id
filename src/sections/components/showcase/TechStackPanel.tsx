import type { ComponentType, CSSProperties } from "react";
import {
  SiHtml5, SiJavascript, SiTypescript, SiReact, SiTailwindcss,
  SiNodedotjs, SiExpress, SiFirebase, SiPostgresql, SiGit, SiGithub,
  SiGooglechrome, SiClaude, SiLinuxmint, SiGnubash, SiVite, SiNpm,
  SiGithubpages,
} from "react-icons/si";
import { FaCss3Alt } from "react-icons/fa";
import { VscVscode, VscOpenai } from "react-icons/vsc";
import { Braces, Database, MonitorSmartphone, Network, Sparkles } from "lucide-react";
import antigravityIcon from "./assets/antigravity.svg";
import type { TechnologyGroup } from "./types";

interface ToolkitItem {
  name: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  color: string;
}

// Personal toolkit, independent of the technologies confirmed in project records.
// Learning status is part of the label; no proficiency or project usage is inferred.
const toolkit: { group: TechnologyGroup; items: ToolkitItem[] }[] = [
  {
    group: "Frontend",
    items: [
      { name: "HTML5", icon: SiHtml5, color: "#E34F26" },
      { name: "CSS3", icon: FaCss3Alt, color: "#1572B6" },
      { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "React.js", icon: SiReact, color: "#61DAFB" },
      { name: "Tailwind CSS v4", icon: SiTailwindcss, color: "#06B6D4" },
      { name: "Responsive Web Design", icon: MonitorSmartphone, color: "#A78BFA" },
      { name: "CSS Animations", icon: Braces, color: "#A78BFA" },
    ],
  },
  {
    group: "Backend",
    items: [
      { name: "Node.js (Learning)", icon: SiNodedotjs, color: "#5FA04E" },
      { name: "Express.js (Learning)", icon: SiExpress, color: "#F4F0FF" },
      { name: "REST API Integration", icon: Network, color: "#A78BFA" },
      { name: "Firebase Integration", icon: SiFirebase, color: "#FFC400" },
      { name: "AI API Integration", icon: Sparkles, color: "#A78BFA" },
    ],
  },
  {
    group: "Database",
    items: [
      { name: "Firebase Cloud Firestore", icon: SiFirebase, color: "#FFC400" },
      { name: "SQL (Learning)", icon: Database, color: "#A78BFA" },
      { name: "PostgreSQL (Learning)", icon: SiPostgresql, color: "#6FA8D1" },
    ],
  },
  {
    group: "Tools",
    items: [
      { name: "Git", icon: SiGit, color: "#F05032" },
      { name: "GitHub", icon: SiGithub, color: "#F4F0FF" },
      { name: "VS Code", icon: VscVscode, color: "#23A9F2" },
      { name: "Chrome DevTools", icon: SiGooglechrome, color: "#4285F4" },
      { name: "ChatGPT", icon: VscOpenai, color: "#F4F0FF" },
      { name: "Codex", icon: VscOpenai, color: "#F4F0FF" },
      { name: "Claude", icon: SiClaude, color: "#D97757" },
      { name: "Google Antigravity", icon: AntigravityIcon, color: "#A78BFA" },
    ],
  },
  {
    group: "Development Environment",
    items: [
      { name: "Linux Mint", icon: SiLinuxmint, color: "#86BE43" },
      { name: "Bash Terminal", icon: SiGnubash, color: "#A4CC70" },
      { name: "Vite", icon: SiVite, color: "#A78BFA" },
      { name: "npm", icon: SiNpm, color: "#CB3837" },
      { name: "GitHub Pages", icon: SiGithubpages, color: "#F4F0FF" },
      { name: "Firebase CLI", icon: SiFirebase, color: "#FFC400" },
    ],
  },
];

// Google Antigravity's brand mark, sourced from the SVGL logo collection.
function AntigravityIcon() {
  return <img src={antigravityIcon} width={24} height={24} alt="" />;
}

export default function TechStackPanel() {
  return (
    <>
      <p className="ps-stack-intro">
        My development toolkit, including technologies I am learning.
        Project-specific technologies are listed separately on each project.
      </p>
      <div className="ps-stack-groups">
        {toolkit.map(({ group, items }) => (
          <section key={group} className="ps-stack-group">
            <div className="ps-group-heading">
              <h3>{group}</h3>
              <span>{String(items.length).padStart(2, "0")}</span>
            </div>
            <ul
              className="ps-tech-grid"
              style={{ "--tech-columns": Math.ceil(items.length / 2) } as CSSProperties}
              tabIndex={0}
              aria-label={`${group} technologies`}
            >
              {items.map(({ name, icon: TechnologyIcon, color }) => (
                <li
                  className="ps-tech-tile"
                  key={name}
                  style={{ "--brand": color } as CSSProperties}
                >
                  <TechnologyIcon size={24} aria-hidden={true} />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
