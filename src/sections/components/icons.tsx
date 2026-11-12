/* ==========================================================================
   Icon registry — maps the string keys in `src/config/profile.ts` to real
   SVG components. Keeping icons out of the config file keeps the config plain,
   editable data.

   Tech marks are inline SVG (no extra dependency); info rows reuse lucide-react.
   ========================================================================== */

import type { ReactNode } from 'react';
import { CodeXml, Globe, GraduationCap, Link, Mail, MapPin, Sparkles } from 'lucide-react';
import type { DetailIconKey, TechIconKey } from '../config/profile';

/* -------------------------------------------------------------------------- */
/*  Brand / tech marks                                                        */
/* -------------------------------------------------------------------------- */

const Html5Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 3h16l-1.5 16.5L12 21l-6.5-1.5L4 3z" fill="#e34f26" />
    <path d="M12 4.6v14.6l5.1-1.2L18.3 4.6H12z" fill="#f06529" />
    <path
      d="M8.4 8.2h7.2l-.25 2.6H11v2.3h4.1l-.35 3.6L12 17.5l-2.75-.8-.2-2.1h2.1l.1.95 1 .25 1-.25.1-1.25H8.75L8.4 8.2z"
      fill="#fff"
    />
  </svg>
);

const Css3Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 3h16l-1.5 16.5L12 21l-6.5-1.5L4 3z" fill="#1572b6" />
    <path d="M12 4.6v14.6l5.1-1.2L18.3 4.6H12z" fill="#33a9dc" />
    <path
      d="M8.6 8.2h6.8l-.2 2.3H11.3l.15 2.1h3.5l-.3 3.5L12 17l-2.6-.75-.15-1.9h2.05l.08.9.62.2.62-.2.1-1.15H9.2L8.6 8.2z"
      fill="#fff"
    />
  </svg>
);

const JavaScriptIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="1" y="1" width="22" height="22" rx="3" fill="#f7df1e" />
    <path
      d="M12.6 18.4c.6 1 1.5 1.6 3 1.6 1.6 0 2.6-.85 2.6-2.2 0-1.3-.75-1.9-2.1-2.5-.7-.32-.95-.55-.95-.93 0-.32.24-.55.62-.55.4 0 .63.18.85.6l1.4-.9c-.5-.9-1.25-1.3-2.3-1.3-1.4 0-2.4.85-2.4 2.15 0 1.25.72 1.85 2 2.42.75.35 1.05.6 1.05 1 0 .4-.32.65-.8.65-.55 0-.9-.28-1.15-.75l-1.4.85zM6.35 18.55c.35.6.85 1.1 1.85 1.1 1.5 0 2.45-.8 2.45-2.5v-5.1H9.1v5.05c0 .65-.25.9-.65.9-.4 0-.6-.2-.8-.5l-1.3.75z"
      fill="#111"
    />
  </svg>
);

const ReactMark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#61dafb" strokeWidth="1.1" aria-hidden="true">
    <circle cx="12" cy="12" r="1.9" fill="#61dafb" stroke="none" />
    <ellipse cx="12" cy="12" rx="10" ry="4" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
  </svg>
);

const TypeScriptMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="1" y="1" width="22" height="22" rx="3" fill="#3178c6" />
    <text
      x="12.5"
      y="17"
      textAnchor="middle"
      fontSize="10.5"
      fontWeight="800"
      fill="#fff"
      fontFamily="system-ui, sans-serif"
    >
      TS
    </text>
  </svg>
);

const LinuxMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="1" y="1" width="22" height="22" rx="5" fill="#1c1c22" />
    <path
      d="M12 4.6c-1.5 0-2.3 1.25-2.3 2.95 0 1.05-.35 1.6-1 2.55-.95 1.35-1.7 2.6-1.7 3.85 0 .6.2 1 .55 1.3-.15.35-.25.7-.25 1 0 .55.3.85.9.95.35.85.95 1.35 1.7 1.35.55 0 1-.2 1.4-.55h1.4c.4.35.85.55 1.4.55.75 0 1.35-.5 1.7-1.35.6-.1.9-.4.9-.95 0-.3-.1-.65-.25-1 .35-.3.55-.7.55-1.3 0-1.25-.75-2.5-1.7-3.85-.65-.95-1-1.5-1-2.55 0-1.7-.8-2.95-2.3-2.95z"
      fill="#f4f4f5"
    />
    <ellipse cx="10.9" cy="7.5" rx="0.72" ry="0.95" fill="#1c1c22" />
    <ellipse cx="13.1" cy="7.5" rx="0.72" ry="0.95" fill="#1c1c22" />
    <path d="M10.7 9.6c.4.55.85.85 1.3.85s.9-.3 1.3-.85c-.45.2-.9.3-1.3.3s-.85-.1-1.3-.3z" fill="#1c1c22" />
    <ellipse cx="10.35" cy="11.9" rx="1.5" ry="1.05" fill="#f9a03f" />
    <ellipse cx="13.65" cy="11.9" rx="1.5" ry="1.05" fill="#f9a03f" />
  </svg>
);

const AiIntegrationMark = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2.6l1.9 4.5 4.5 1.9-4.5 1.9L12 15.4l-1.9-4.5L5.6 9l4.5-1.9L12 2.6z" fill="#c4b5fd" />
    <path d="M18.4 14.2l.95 2.25 2.25.95-2.25.95-.95 2.25-.95-2.25-2.25-.95 2.25-.95.95-2.25z" fill="#8b5cf6" />
    <path d="M5.6 15.4l.7 1.65 1.65.7-1.65.7-.7 1.65-.7-1.65-1.65-.7 1.65-.7.7-1.65z" fill="#6366f1" />
  </svg>
);

const VibeCodingMark = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
    <path d="M8.2 8.4L4 12l4.2 3.6M15.8 8.4L20 12l-4.2 3.6" />
    <path d="M6.2 4.6l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7.7-1.6z" fill="#c4b5fd" stroke="none" />
    <path d="M17.8 16.2l.55 1.3 1.3.55-1.3.55-.55 1.3-.55-1.3-1.3-.55 1.3-.55.55-1.3z" fill="#8b5cf6" stroke="none" />
    <path d="M12.6 6.6l-1.9 3.3h2.4l-1.4 3.4" />
  </svg>
);

const AiAgentMark = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4.4" y="7.4" width="15.2" height="11.4" rx="3.4" stroke="#a78bfa" strokeWidth="1.4" />
    <path d="M12 3.4v4" stroke="#8b5cf6" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="12" cy="3.1" r="1.2" fill="#c4b5fd" />
    <circle cx="9.1" cy="12.6" r="1.25" fill="#c4b5fd" />
    <circle cx="14.9" cy="12.6" r="1.25" fill="#c4b5fd" />
    <path d="M9.6 15.9h4.8" stroke="#8b5cf6" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M2.9 11.6v3M21.1 11.6v3" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const GitTerminalMark = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="22" height="22" rx="5" fill="#241a3f" stroke="#a78bfa" strokeOpacity="0.45" />
    <path
      d="M6.6 8.2l3 3.6-3 3.6"
      stroke="#c4b5fd"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12.4 15.4h5" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const WebAppMark = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2.6" y="4.2" width="18.8" height="15.6" rx="3" stroke="#a78bfa" strokeWidth="1.4" />
    <path d="M2.8 8.4h18.4" stroke="#a78bfa" strokeWidth="1.2" strokeOpacity="0.7" />
    <circle cx="5.6" cy="6.3" r="0.85" fill="#8b5cf6" />
    <circle cx="8.3" cy="6.3" r="0.85" fill="#6366f1" />
    <rect x="5.6" y="10.6" width="5.1" height="6.6" rx="1.2" fill="#8b5cf6" fillOpacity="0.45" />
    <path d="M12.9 11.3h5.4M12.9 14h5.4M12.9 16.7h3.4" stroke="#c4b5fd" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const GitHubMark = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.921.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const LinkedInMark = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  Registries                                                                */
/* -------------------------------------------------------------------------- */

export const techIcons: Record<TechIconKey, ReactNode> = {
  html5: <Html5Icon />,
  css3: <Css3Icon />,
  javascript: <JavaScriptIcon />,
  react: <ReactMark />,
  typescript: <TypeScriptMark />,
  ai: <AiIntegrationMark />,
  vibe: <VibeCodingMark />,
  agents: <AiAgentMark />,
  linux: <LinuxMark />,
  git: <GitTerminalMark />,
  webapp: <WebAppMark />,
};

type DetailIconComponent = (props: { size?: number }) => ReactNode;

/** Uniform factory so lucide icons and inline brand marks share one API. */
export const detailIcons: Record<DetailIconKey, DetailIconComponent> = {
  mapPin: ({ size = 18 }) => <MapPin size={size} aria-hidden="true" />,
  github: ({ size = 18 }) => <GitHubMark size={size} />,
  linkedin: ({ size = 18 }) => <LinkedInMark size={size} />,
  graduationCap: ({ size = 18 }) => <GraduationCap size={size} aria-hidden="true" />,
  code: ({ size = 18 }) => <CodeXml size={size} aria-hidden="true" />,
  sparkles: ({ size = 18 }) => <Sparkles size={size} aria-hidden="true" />,
  mail: ({ size = 18 }) => <Mail size={size} aria-hidden="true" />,
  globe: ({ size = 18 }) => <Globe size={size} aria-hidden="true" />,
  link: ({ size = 18 }) => <Link size={size} aria-hidden="true" />,
};

export { GitHubMark, LinkedInMark };
