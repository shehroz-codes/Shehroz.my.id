import { Mail, MapPin, Phone } from 'lucide-react';
import { FaGithub, FaLinkedinIn, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { contactProfile as profile } from './config';
import portrait from './assets/profile.png';

export default function ContactProfile() {
  const socials = [
    { label: 'GitHub', url: profile.github, brand: 'github', Icon: FaGithub },
    { label: 'LinkedIn', url: profile.linkedin, brand: 'linkedin', Icon: FaLinkedinIn },
    { label: 'TikTok', url: profile.tiktok, brand: 'tiktok', Icon: FaTiktok },
    ...(profile.whatsapp ? [{ label: 'WhatsApp', url: profile.whatsapp, brand: 'whatsapp', Icon: FaWhatsapp }] : []),
  ];
  return (
    <article className="card profile" aria-label="Contact details">
      <div className="profile__top">
        <div className="avatar-ring"><div className="avatar-ring__inner">
          <img src={portrait} alt={`Portrait of ${profile.name}`} width={1024} height={1024} loading="lazy" />
        </div></div>
        <div className="profile__identity">
          <h3 className="profile__name">{profile.name}</h3>
          <p className="profile__role">{profile.role}</p>
        </div>
      </div>
      <div className="profile__section-label">Connect &amp; Follow</div>
      <div className="socials" aria-label="Social links">
        {socials.map(({ label, url, brand, Icon }) => url ? (
          <a key={label} className={`social social--${brand}`} href={url} target="_blank" rel="noreferrer">
            <Icon className="icon" aria-hidden="true" />{label}
          </a>
        ) : (
          <span key={label} className="social social--soon" aria-disabled="true">
            <Icon className="icon" aria-hidden="true" />{label} · soon
          </span>
        ))}
      </div>
      <div className="profile__section-label">Direct Details</div>
      <ul className="profile__list">
        {profile.phone && <li><Phone className="icon" aria-hidden="true" /><a href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`}>{profile.phone}</a></li>}
        {profile.email && <li><Mail className="icon" aria-hidden="true" /><a href={`mailto:${profile.email}`}>{profile.email}</a></li>}
        <li><MapPin className="icon" aria-hidden="true" /><span>{profile.location}</span></li>
      </ul>
      <div className="availability"><span className="dot" />Available for Projects</div>
    </article>
  );
}
