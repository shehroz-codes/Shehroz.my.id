/* ==========================================================================
   SINGLE SOURCE OF TRUTH — profile content for the About Card
   --------------------------------------------------------------------------
   Everything the card displays comes from this file. Edit the values here;
   no component needs to be touched.

   QUICK EDIT GUIDE:
     • profile.fullName / title / bio  → Update your personal info
     • profile.education               → Your degree / studies
     • profile.location                → Your city / country
     • links.github / linkedin / email → Your contact URLs (null = hidden)
     • primarySkills                   → The skills displayed on the card
   ========================================================================== */

/** Icon keys resolved to real SVG components in `src/components/icons.tsx`. */
export type TechIconKey =
  | 'html5'
  | 'css3'
  | 'javascript'
  | 'react'
  | 'typescript'
  | 'ai'
  | 'vibe'
  | 'agents'
  | 'linux'
  | 'git'
  | 'webapp';

/** Icon keys used by the small info rows (Lucide icons + brand marks). */
export type DetailIconKey =
  | 'mapPin'
  | 'github'
  | 'linkedin'
  | 'graduationCap'
  | 'code'
  | 'sparkles'
  | 'mail'
  | 'globe'
  | 'link';

export interface Profile {
  fullName: string;
  /** Short wordmark used by the ProfileCard overlay. */
  displayName: string;
  /** Public handle, rendered as @handle. */
  username: string;
  title: string;
  specialty: string;
  location: string;
  education: string;
  bio: string;
  eyebrow: { index: string; label: string };
  techStackLabel: string;
  portrait: { src: string; alt: string };
}

export interface Skill {
  id: string;
  label: string;
  icon: TechIconKey;
  /** Optional link (kept for future skill deep-links). */
  href?: string;
}

export interface SocialLink {
  id: 'github' | 'email' | 'linkedin' | 'instagram' | 'whatsapp' | 'website';
  label: string;
  /** `null` means "not published yet" — the entry is never rendered, so no fake or broken link can appear. */
  href: string | null;
  icon: DetailIconKey;
  external: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Identity                                                                  */
/* -------------------------------------------------------------------------- */

export const profile: Profile = {
  fullName: 'Muhammad Shehroz',
  displayName: 'SHEHROZ',
  username: 'shehrozcoder',
  title: 'Full Stack Web Developer',
  specialty: 'AI Integration & Web Application Development',
  location: 'Lahore, Pakistan',
  // Educational status — clean, professional, no institution or graduation year claims
  education: 'BS Computer Science — In Progress',
  bio: "I'm Muhammad Shehroz, a Full Stack Web Developer based in Lahore, Pakistan. I build modern, responsive web applications and explore AI integration, vibe coding, and AI-powered development workflows.",
  eyebrow: { index: '01', label: 'About Me' },
  techStackLabel: 'Tech Stack',
  portrait: {
    src: `${import.meta.env.BASE_URL}sections/about/profile.png`,
    alt: 'Portrait of Muhammad Shehroz, Full Stack Web Developer',
  },
};

/* -------------------------------------------------------------------------- */
/*  Links                                                                     */
/* -------------------------------------------------------------------------- */

export const links: {
  github: string;
  linkedin: string | null;
  email: string | null;
  cv: string | null;
} = {
  github: 'https://github.com/shehroz-codes',
  /**
   * TODO: Add your LinkedIn profile URL when ready, e.g. 'https://linkedin.com/in/yourhandle'
   * Once filled, a verified LinkedIn contact item will appear automatically.
   */
  linkedin: null,
  /** TODO: Add your public email when ready, e.g. 'you@example.com' → enables the mailto button. */
  email: null,
  /** TODO: Add '/cv.pdf' (place the file in `public/`) → shows the "Download CV" button. */
  cv: null,
};

/** Valid, non-empty contact channels only — used to build the info rows. */
export const socialLinks: SocialLink[] = [
  { id: 'github', label: `@${profile.username}`, href: links.github, icon: 'github', external: true },
  { id: 'linkedin', label: 'LinkedIn', href: links.linkedin, icon: 'linkedin', external: true },
  { id: 'email', label: 'Email', href: links.email ? `mailto:${links.email}` : null, icon: 'mail', external: false },
  { id: 'instagram', label: 'Instagram', href: null, icon: 'link', external: true },
  { id: 'whatsapp', label: 'WhatsApp', href: null, icon: 'link', external: true },
  { id: 'website', label: 'Portfolio', href: null, icon: 'globe', external: true },
];

/** Channels that are actually published. Never contains a `#` or guessed URL. */
export const activeSocialLinks: SocialLink[] = socialLinks.filter(
  (link): link is SocialLink & { href: string } => typeof link.href === 'string' && link.href.length > 0,
);

/**
 * Where "Let's Connect" goes: the private email if it has been published,
 * otherwise the public GitHub profile. Never an empty anchor.
 */
export const contactHref: string = links.email ? `mailto:${links.email}` : links.github;

/* -------------------------------------------------------------------------- */
/*  Compact card skills — exactly 11                                          */
/*  React and ReactJS are the same technology: only "React.js" is listed.     */
/*  No percentages and no seniority claims.                                  */
/* -------------------------------------------------------------------------- */

export const primarySkills: Skill[] = [
  { id: 'html5', label: 'HTML5', icon: 'html5' },
  { id: 'css3', label: 'CSS3', icon: 'css3' },
  { id: 'javascript', label: 'JavaScript', icon: 'javascript' },
  { id: 'react', label: 'React.js', icon: 'react' },
  { id: 'typescript', label: 'TypeScript', icon: 'typescript' },
  { id: 'ai-integration', label: 'AI Integration', icon: 'ai' },
  { id: 'vibe-coding', label: 'Vibe Coding', icon: 'vibe' },
  { id: 'ai-agents', label: 'AI Agents', icon: 'agents' },
  { id: 'linux', label: 'Linux', icon: 'linux' },
  { id: 'git-terminal', label: 'Git & Terminal', icon: 'git' },
  { id: 'web-apps', label: 'Web App Development', icon: 'webapp' },
];

/* -------------------------------------------------------------------------- */
/*  Future full-profile skills (separate from the compact card)               */
/*  Add entries here when the full portfolio page is built — the compact      */
/*  card above will NOT change.                                              */
/* -------------------------------------------------------------------------- */

export const fullProfileSkills: Skill[] = [];
