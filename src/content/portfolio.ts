import type { SocialLinks } from "../components/SocialSpotlight/SocialSpotlight";

interface PortfolioContent {
  name: string;
  displayName: string;
  location: string;
  identity: string;
  introduction: string;
  roles: string[];
  socials: SocialLinks;
  cvPath: string | null;
  contactHref: string | null;
}

/** Paths are relative to Vite's BASE_URL; never use domain-root asset URLs. */
export const portfolio: PortfolioContent = {
  name: "Muhammad Shehroz",
  displayName: "Shehroz Coder",
  location: "Lahore, Pakistan",
  identity: "Web Developer & AI Integration Enthusiast",
  introduction:
    "I build modern, responsive web experiences and explore AI-powered solutions that make digital work smarter.",
  roles: [
    "Web Developer",
    "Frontend Developer",
    "AI Automation Enthusiast",
    "Creative Problem Solver",
  ],
  socials: { github: "https://github.com/shehroz-codes" },
  cvPath: null,
  contactHref: null,
};
