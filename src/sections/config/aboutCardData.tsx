/* ==========================================================================
   Data adapter — turns `src/config/profile.ts` into the exact prop shapes the
   About Card consumes. Edit the config file, not this one.
   ========================================================================== */

import type { AboutCardProps, AboutDetail, CardAction, TechItem } from '../components/AboutCard';
import { detailIcons, techIcons } from '../components/icons';
import { activeSocialLinks, contactHref, links, primarySkills, profile } from './profile';

const row = (key: keyof typeof detailIcons, label: string, href?: string): AboutDetail => {
  const Icon = detailIcons[key];
  return { icon: <Icon size={16} />, label, ...(href ? { href } : {}) };
};

/** Left column: location + verified public channels (GitHub, email once published). */
export const contactDetails: AboutDetail[] = [
  row('mapPin', profile.location),
  ...activeSocialLinks
    .filter((link) => link.id === 'github' || link.id === 'email')
    .map((link) => row(link.icon, link.label, link.href ?? undefined)),
];

/** Right column: education with LinkedIn profile row directly below it. */
export const highlights: AboutDetail[] = [
  row('graduationCap', profile.education),
  row('linkedin', 'LinkedIn Profile', links.linkedin ?? undefined),
];

/** The 11 compact-card skills, rendered as violet pills. */
export const techStack: TechItem[] = primarySkills.map((skill) => ({
  name: skill.label,
  icon: techIcons[skill.icon],
  href: skill.href,
}));

/** Second button: the CV when one is published, otherwise the verified GitHub profile. */
export const secondaryAction: CardAction = links.cv
  ? { label: 'Download CV', href: links.cv, icon: 'download', download: true }
  : { label: 'GitHub Profile', href: links.github, icon: 'github' };

/** Everything the card needs — spread straight into <AboutCard {...aboutCardProps} />. */
export const aboutCardProps: AboutCardProps = {
  name: profile.fullName,
  role: profile.title,
  specialty: profile.specialty,
  bio: profile.bio,
  image: profile.portrait.src,
  imageAlt: profile.portrait.alt,
  eyebrow: profile.eyebrow.label,
  eyebrowIndex: profile.eyebrow.index,
  available: true,
  availableLabel: 'Available for work',
  contactDetails,
  highlights,
  techStackLabel: profile.techStackLabel,
  techStack,
  connectLabel: "Let's Connect",
  connectHref: contactHref,
  secondaryAction,
};
