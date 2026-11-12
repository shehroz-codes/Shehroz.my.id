import type { Certificate, Experience, Project, Technology } from "./types";
import p1 from "./assets/project-1.webp";
import p2 from "./assets/project-2.webp";
import p3 from "./assets/project-3.webp";
import p4 from "./assets/project-4.webp";
import c1 from "./assets/certificate-1.webp";
import c2 from "./assets/certificate-2.webp";
import certificatePdf from "./assets/certificate-sample.pdf";
import e1 from "./assets/letter-1.webp";
import e2 from "./assets/letter-2.webp";
import letterPdf from "./assets/experience-sample.pdf";
import reactIcon from "./assets/react.svg";
import typescriptIcon from "./assets/typescript.svg";
import tailwindIcon from "./assets/tailwindcss.svg";
import viteIcon from "./assets/vite.svg";

// Edit project content here. Add liveUrl/sourceUrl only when verified.
// Replace asset imports and set previewIsSample:false for real screenshots.
// For real certificates/letters, replace document.src, kind and thumbnail,
// supply verified fields, then set sample:false. PDF files need a thumbnail.
// CONFIRMED stack of the existing portfolio. No other project's stack is inferred.
export const technologies: Technology[] = [
  {
    id: "react",
    name: "React 19",
    icon: reactIcon,
    color: "#61DAFB",
    group: "Frontend",
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: typescriptIcon,
    color: "#3178C6",
    group: "Frontend",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS v4",
    icon: tailwindIcon,
    color: "#06B6D4",
    group: "Frontend",
  },
  {
    id: "vite",
    name: "Vite",
    icon: viteIcon,
    color: "#646CFF",
    group: "Development Environment",
  },
];
export const projects: Project[] = [
  {
    id: "portfolio",
    number: "01",
    title: "Developer Portfolio",
    category: "Portfolio",
    status: "Sample concept",
    description:
      "Existing React portfolio. This artwork is a sample concept, not a screenshot of the live site.",
    preview: p1,
    previewIsSample: true,
    previewAlt:
      "AI-generated sample developer portfolio concept, not an actual website screenshot",
    technologyIds: ["react", "typescript", "tailwind", "vite"],
    overview:
      "The existing portfolio uses React 19, TypeScript, Vite and Tailwind CSS v4. Replace this concept artwork with your actual screenshot and add your verified project details.",
    screenshots: [{ src: p1, alt: "Sample portfolio concept artwork" }],
    detailsEnabled: true,
  },
  {
    id: "gifts",
    number: "02",
    title: "Personalized Gifts",
    category: "Project concept",
    status: "Sample concept",
    description:
      "Editable project placeholder. Add your actual overview, technologies and verified links.",
    preview: p2,
    previewIsSample: true,
    previewAlt:
      "AI-generated personalized gifts concept, not a deployed store screenshot",
    technologyIds: [],
    overview:
      "Placeholder for your Personalized Gifts project. No features, technology choices or deployment status have been supplied.",
    screenshots: [{ src: p2, alt: "Sample gift store concept artwork" }],
    detailsEnabled: true,
  },
  {
    id: "studio",
    number: "03",
    title: "NA Studio & Mobile",
    category: "Project concept",
    status: "Sample concept",
    description:
      "A space for your studio project. The preview is concept artwork; project details are pending.",
    preview: p3,
    previewIsSample: true,
    previewAlt:
      "AI-generated studio and mobile concept, not an actual business website screenshot",
    technologyIds: [],
    overview:
      "Placeholder for NA Studio & Mobile. Replace the sample artwork with actual project screenshots and provide the confirmed details.",
    screenshots: [{ src: p3, alt: "Sample studio concept artwork" }],
    detailsEnabled: true,
  },
  {
    id: "pending",
    number: "04",
    title: "Project 04 — Pending",
    category: "Coming next",
    status: "Pending",
    description:
      "Reserved for your next project. No completion, functionality or deployment is claimed.",
    preview: p4,
    previewIsSample: true,
    previewAlt: "Sample abstract wireframe for a pending project",
    technologyIds: [],
    overview:
      "This slot is intentionally unfilled. Update portfolioData.ts when the project is ready to share.",
    screenshots: [{ src: p4, alt: "Sample pending project wireframe" }],
    detailsEnabled: true,
  },
];
export const certificates: Certificate[] = [
  {
    id: "certificate-1",
    name: "Certificate slot 01",
    sample: true,
    document: {
      src: c1,
      kind: "image",
      thumbnail: c1,
      alt: "Sample certificate placeholder — not a real certificate",
    },
  },
  {
    id: "certificate-2",
    name: "Certificate slot 02",
    sample: true,
    document: {
      src: certificatePdf,
      kind: "pdf",
      thumbnail: c2,
      alt: "Sample certificate PDF — not a real certificate",
    },
  },
];
export const experiences: Experience[] = [
  {
    id: "experience-1",
    sample: true,
    skills: [],
    description:
      "Your first experience letter will appear here. Company, role, dates and achievements are intentionally unspecified.",
    letter: {
      src: e1,
      kind: "image",
      thumbnail: e1,
      alt: "Sample experience letter — not a real employment document",
    },
  },
  {
    id: "experience-2",
    sample: true,
    skills: [],
    description:
      "Reserved for your second experience letter. Replace the sample PDF with your actual document.",
    letter: {
      src: letterPdf,
      kind: "pdf",
      thumbnail: e2,
      alt: "Sample experience PDF — not a real employment document",
    },
  },
];
// Only allow http(s) external project links. Empty or unsafe URLs render unavailable.
export function safeExternalUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
