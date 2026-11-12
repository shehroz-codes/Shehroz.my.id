export type TechnologyGroup =
  "Frontend" | "Backend" | "Database" | "Tools" | "Development Environment";
export interface Technology {
  id: string;
  name: string;
  icon: string;
  color: string;
  group: TechnologyGroup;
}
export interface ProjectScreenshot {
  src: string;
  alt: string;
}
export interface Project {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  status: "Sample concept" | "Pending" | "In progress" | "Completed";
  preview: string;
  previewAlt: string;
  /** Set false after replacing concept artwork with real screenshots. */
  previewIsSample?: boolean;
  technologyIds: string[];
  overview?: string;
  screenshots?: ProjectScreenshot[];
  features?: string[];
  liveUrl?: string;
  sourceUrl?: string;
  detailsEnabled?: boolean;
}
export interface PreviewDocument {
  src: string;
  kind: "image" | "pdf";
  thumbnail: string;
  alt: string;
}
export interface Certificate {
  id: string;
  name: string;
  issuer?: string;
  completionDate?: string;
  sample: boolean;
  document?: PreviewDocument;
}
export interface Experience {
  id: string;
  company?: string;
  jobTitle?: string;
  dates?: string;
  description?: string;
  skills: string[];
  sample: boolean;
  letter?: PreviewDocument;
}
export type TabId = "projects" | "certificates" | "experience" | "tech";
