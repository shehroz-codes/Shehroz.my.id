import type { LucideIcon } from 'lucide-react';
import { Bot, Code2, Gamepad2, Layers, Sparkles, Terminal } from 'lucide-react';

import realPortrait from '../../assets/portraits/real-portrait.png';
import animePortrait from '../../assets/portraits/anime-portrait.png';

/* ------------------------------------------------------------------ */
/* Section header copy                                                 */
/* ------------------------------------------------------------------ */

export const sectionHeader = {
  badge: 'My Interests',
  titleLead: 'Beyond',
  titleAccent: 'the Code',
  subtitle: 'The things that fuel my creativity, keep me inspired, and make me… me.',
};

/* ------------------------------------------------------------------ */
/* Interest cards — edit titles, descriptions, icons and links here    */
/* ------------------------------------------------------------------ */

export interface Interest {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Featured cards get the premium violet glow border + badge. */
  featured?: boolean;
  /**
   * Optional destination. The arrow button renders ONLY when this is set —
   * never show an inert clickable arrow.
   */
  href?: string;
}

export const interestsLeft: Interest[] = [
  {
    id: 'coding',
    title: 'Coding',
    description: 'Building ideas, solving problems, and turning concepts into reality.',
    icon: Code2,
    featured: true,
  },
  {
    id: 'ai-agents',
    title: 'AI & Agents',
    description: 'Exploring AI tools, building smart agents, and automating workflows.',
    icon: Bot,
  },
  {
    id: 'web-design',
    title: 'Web Design',
    description: 'Crafting modern, responsive and visually engaging web experiences.',
    icon: Layers,
  },
];

export const interestsRight: Interest[] = [
  {
    id: 'anime',
    title: 'Anime',
    description: 'A massive fan of Naruto and anime that inspire growth, strategy and never giving up.',
    icon: Sparkles,
    featured: true,
  },
  {
    id: 'gaming',
    title: 'Gaming',
    description: 'Exploring immersive worlds, competitive games and great stories.',
    icon: Gamepad2,
  },
  {
    id: 'linux',
    title: 'Linux',
    description: 'My daily driver for development, customization and full control.',
    icon: Terminal,
  },
];

/* ------------------------------------------------------------------ */
/* Center portrait — halftone reveal configuration                     */
/* ------------------------------------------------------------------ */

import type { HalftonePortraitProps } from './HalftonePortrait';

export const portrait: HalftonePortraitProps = {
  realSrc: realPortrait,
  animeSrc: animePortrait,
  alt: 'Shehroz — hover to reveal the anime ninja version of my portrait',
  mode: 'duotone',
  shape: 'dot',
  cellSize: 6,
  angle: 45,
  dotScale: 1,
  inkColor: '#e9d5ff',
  accentColor: '#7c3aed',
  paperColor: '#120f17',
  contrast: 1.1,
  brightness: 0.05,
  invert: false,
  roughness: 0,
  misregistration: 0,
  revealRadius: 140,
  softness: 0.6,
  linger: 0.8,
  reverse: false,
  wander: false,
  clickBurst: true,
  intro: false,
};
