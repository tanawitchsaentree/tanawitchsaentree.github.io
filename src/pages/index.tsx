import React, { useState } from 'react';
import { ArrowUpRight, Copy, Check } from 'lucide-react';
import nateProfile from '../image/nateprofile.png';
import profileData from '../data/profile_data_enhanced.json';
import LocationBadge from '../components/LocationBadge';

function ProfileHeader({ DarkModeToggle }: { DarkModeToggle: () => React.ReactElement }) {
  return (
    <div className="profile-header" style={{
      display: 'flex',
      alignItems: 'center', // Changed to center for vertical alignment
      gap: 'var(--space-3)',
      width: '100%',
    }}>
      <div style={{
        flexShrink: 0,
        width: '62px',
        height: '62px',
        borderRadius: '50%',
        overflow: 'hidden',
      }}>
        <img
          src={nateProfile}
          alt="Profile"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '62px',
        flex: 1,
      }}>
        <div className="profile-title-row" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}>
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            margin: 0,
            lineHeight: '1.2',
          }}>
            Hey, I'm {profileData.identity.full_name.nickname}
          </h2>
          <DarkModeToggle />
        </div>
        <p style={{
          fontSize: 'var(--text-lg)',
          margin: 0,
          lineHeight: '1.2',
          color: 'var(--muted-foreground)',
          marginTop: 'var(--space-1)',
        }}>
          {profileData.identity.current_title.value}
        </p>
      </div>
      <LocationBadge />
    </div>

  );
}

function BioSection() {
  return (
    <div className="bio-section">
      <p className="bio-text">
        {profileData.career_narrative.elevator_pitch}
      </p>
    </div>
  );
}

function ExperienceItem({ year, company, role, link }: { year: string; company: string; role: string; link?: string }) {
  return (
    <div className="experience-item">
      <div className="experience-year">
        <span>{year}</span>
      </div>
      <div className="experience-details">
        <span className="experience-role">{role}</span>
        <span className="experience-company">
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="company-link">
              {company}
              <ArrowUpRight className="company-link-icon" />
            </a>
          ) : company}
        </span>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'inherit',
        fontSize: 'var(--text-base)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        marginRight: 'var(--space-4)',
        cursor: 'pointer',
        color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--foreground)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--muted-foreground)';
      }}
    >
      {children}
    </button>
  );
}

function WorkExperienceList() {
  const getYear = (dateStr: string) => {
    if (dateStr.toLowerCase() === 'present') return 'Present';
    return new Date(dateStr).getFullYear().toString();
  };

  return (
    <>
      {profileData.experience.timeline.map((exp, index) => (
        <ExperienceItem
          key={index}
          year={`${getYear(exp.role.start)} - ${getYear(exp.role.end)}`}
          role={exp.role.title}
          company={exp.company.name}
          link={exp.company.url}
        />
      ))}
    </>
  );
}

function EducationList() {
  const getYear = (dateStr: string) => {
    return new Date(dateStr).getFullYear().toString();
  };

  return (
    <>
      {profileData.education.map((edu, index) => (
        <ExperienceItem
          key={index}
          year={`${getYear(edu.start)}-${getYear(edu.end)}`}
          role={edu.degree_type === 'bachelor' ? "Bachelor's Degree" : "Diploma"}
          company={edu.institution}
          link=""
        />
      ))}
    </>
  );
}

function TabExperienceSection() {
  const [activeTab, setActiveTab] = useState<'work' | 'education'>('work');

  return (
    <div className="w-full flex flex-col" style={{ alignItems: 'flex-start' }}>
      {/* Tab Headers */}
      <div style={{
        display: 'flex',
        marginBottom: 'var(--space-4)',
      }}>
        <TabButton
          active={activeTab === 'work'}
          onClick={() => setActiveTab('work')}
        >
          Work
        </TabButton>
        <TabButton
          active={activeTab === 'education'}
          onClick={() => setActiveTab('education')}
        >
          Education
        </TabButton>
      </div>

      {/* Tab Content */}
      <div
        className="flex flex-col"
        style={{
          gap: 'var(--space-3)',
          width: '100%',
          minHeight: '200px',
          alignItems: 'flex-start',
        }}
      >
        {activeTab === 'work' ? <WorkExperienceList /> : <EducationList />}
      </div>
    </div>
  );
}

function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--foreground)',
          transition: 'opacity 0.2s ease',
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={
          href.includes('linkedin') ? 'LinkedIn' :
            href.includes('medium') ? 'Medium' :
              href.includes('behance') ? 'Behance' : 'Social'
        }
      >
        {children}
      </a>
      {showTooltip && (
        <div style={{
          position: 'absolute',
          top: 'calc(-1 * var(--space-8))',
          left: '50%',
          transform: 'translateX(-50%) translateY(-100%)',
          backgroundColor: 'var(--foreground)',
          color: 'var(--background)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--space-1)',
          fontSize: 'var(--text-xs)',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          pointerEvents: 'none',
        }}>
          {href}
          <div style={{
            position: 'absolute',
            bottom: 'calc(-1 * var(--space-1))',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: 'var(--space-1) solid transparent',
            borderRight: 'var(--space-1) solid transparent',
            borderTop: 'var(--space-1) solid var(--foreground)',
          }} />
        </div>
      )}
    </div>
  );
}

function SocialLinks() {
  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-6)',
      marginTop: 'var(--space-4)',
    }}>
      {/* LinkedIn */}
      <SocialIcon href={profileData.contact.social.linkedin.url}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </SocialIcon>

      {/* Medium */}
      <SocialIcon href={profileData.contact.social.medium.url}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
        </svg>
      </SocialIcon>

      {/* Behance */}
      <SocialIcon href={profileData.contact.social.behance.url}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
        </svg>
      </SocialIcon>
    </div>
  );
}

function ContactSection() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const emailAddress = profileData.contact.primary.value;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddress).then(() => {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy email: ', err);
    });
  };

  return (
    <div className="w-full mt-4">
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        fontSize: 'var(--text-base)',
      }}>
        <a
          href={`mailto:${emailAddress}`}
          style={{
            textDecoration: 'none',
            color: 'var(--foreground)',
          }}
        >
          {emailAddress}
        </a>
        <button
          onClick={handleCopyEmail}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            display: 'inline-flex',
            alignItems: 'center',
            opacity: copiedEmail ? 1 : 0.5,
            transition: 'opacity 0.2s',
            color: 'var(--foreground)',
          }}
          title={copiedEmail ? "Copied!" : "Copy email"}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = copiedEmail ? '1' : '0.5'}
        >
          {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function Index({ DarkModeToggle }: { DarkModeToggle: () => React.ReactElement }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%', /* Full width */
      margin: '0 auto',
      padding: '2rem 1rem',
      minHeight: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Section 1: Profile + Title */}
      <div id="profile-section" style={{ marginBottom: 'var(--space-8)' }}>
        <ProfileHeader DarkModeToggle={DarkModeToggle} />
      </div>

      {/* Section 2: Bio/Summary */}
      <div id="about-section" style={{ marginBottom: 'var(--space-8)' }}>
        <BioSection />
      </div>

      {/* Section 3: Previously + Education (with tabs and listing) */}
      <div id="experience-section" style={{ marginBottom: 'var(--space-8)' }}>
        <TabExperienceSection />
      </div>

      {/* Section 4: Email + Social Icons */}
      <div id="contact-section">
        <ContactSection />
      </div>
      <div style={{ marginTop: 'var(--space-4)' }}>
        <SocialLinks />
      </div>
    </div>
  );
}