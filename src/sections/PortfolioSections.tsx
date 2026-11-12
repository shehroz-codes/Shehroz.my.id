import AboutCard from './components/AboutCard';
import ProfileCard from './components/ProfileCard/ProfileCard';
import MyInterests from './components/my-interests/MyInterests';
import PortfolioShowcase from './components/showcase/PortfolioShowcase';
import { aboutCardProps } from './config/aboutCardData';
import { contactHref, profile } from './config/profile';
import './PortfolioSections.css';

/**
 * Main application / portfolio shell.
 *
 * Page order:
 *   1. About Card
 *   2. My Interests Section
 *   3. Portfolio Showcase Section
 */
export function PortfolioSections() {
  return (
    <div className="portfolio-sections">
      <div id="about" className="portfolio-section-anchor">
        <AboutCard
          {...aboutCardProps}
          profileSlot={
            <ProfileCard
              name={profile.fullName}
              title={profile.title}
              handle={profile.username}
              status="Available for work"
              contactText="Contact"
              avatarUrl={profile.portrait.src}
              iconUrl={`${import.meta.env.BASE_URL}sections/about/iconpattern.svg`}
              holo={0.45}
              glare={0.4}
              tiltStrength={12}
              parallax={8}
              radius={16}
              enableTilt
              intro
              showUserInfo
              enableMobileTilt={false}
              theme="dark"
              className="about-profile-card"
              onContactClick={() => {
                window.location.href = contactHref;
              }}
            />
          }
        />
      </div>
      <div id="interests" className="portfolio-section-anchor"><MyInterests /></div>
      <div id="projects" className="portfolio-section-anchor">
        <span id="skills" className="portfolio-skills-anchor" aria-hidden="true" />
        <PortfolioShowcase />
      </div>
    </div>
  );
}
