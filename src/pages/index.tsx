import React, { useState } from 'react';
import { ArrowUpRight, Copy, Check } from 'lucide-react';
import nateProfile from '../image/nateprofile.png';
import profileData from '../../profile_data.json';

function ProfileHeader() {
  return (
    <div className="profile-header" style={{
      display: 'flex',
      alignItems: 'flex-start',
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
      }}>
        <h2 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          margin: 0,
          lineHeight: '1.2',
          marginBottom: '2px',
        }}>
          Hey, I'm Nate
        </h2>
        <p style={{
          fontSize: 'var(--text-lg)',
          margin: 0,
          lineHeight: '1.2',
          color: 'var(--muted-foreground)',
        }}>
          Product Designer
        </p>
      </div>
    </div>
  );
}

function BioSection() {
  return (
    <div className="bio-section">
      <p className="bio-text">
        I’m a product designer with 8+ years of hands-on experience across health, finance, and tools that people rely on.
      </p>
      <p className="bio-text">
        I care about making things work well — for real people and real problems.
      </p>
      <p className="bio-text">
        I’m always learning, always building, and lately, I’ve been deep into AI — not just using it, but understanding how it changes the way we design and think.
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

function ExperienceSection() {
  return (
    <div className="w-full flex flex-col" style={{ gap: 'var(--space-5)' }}>
      <h2 style={{
        fontSize: 'var(--text-base)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        margin: 0,
        marginBottom: 'var(--space-4)',
        color: 'var(--foreground)',
      }}>
        Previously
      </h2>
      <div className="flex flex-col" style={{ gap: 'var(--space-3)' }}>
        {profileData.work_experience.map((exp, index) => (
          <ExperienceItem
            key={index}
            year={`${new Date(exp.start_date).getFullYear()}-${new Date(exp.end_date).getFullYear()}`}
            role={exp.role}
            company={exp.company}
            link={exp.link}
          />
        ))}
      </div>
    </div>
  );
}

function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  return (
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
      onMouseOver={(e) => (e.currentTarget.style.opacity = '0.7')}
      onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
      aria-label={
        href.includes('linkedin') ? 'LinkedIn' :
          href.includes('medium') ? 'Medium' :
            href.includes('behance') ? 'Behance' : 'Social'
      }
    >
      {children}
    </a>
  );
}

function SocialLinks() {
  return (
    <div style={{
      display: 'flex',
      gap: '1.5rem',
      marginTop: '1rem',
    }}>
      {/* LinkedIn */}
      <SocialIcon href="https://www.linkedin.com/in/tanawitch-saentree/">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </SocialIcon>

      {/* Medium */}
      <SocialIcon href="https://medium.com/@thenutlpkl">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
        </svg>
      </SocialIcon>

      {/* Behance */}
      <SocialIcon href="https://www.behance.net/tanawitchsaentree">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.25-1.91.25H0V4.503h6.938zM14.97 0c.91 0 1.73.07 2.46.216.74.144 1.38.363 1.92.663.54.3.96.68 1.26 1.15.3.47.45 1.05.45 1.73 0 .75-.17 1.36-.51 1.86-.34.5-.84.9-1.5 1.22.91.26 1.58.72 2.03 1.37.45.66.67 1.45.67 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.35-1.05.6-1.67.77-.61.17-1.25.25-1.91.25H9.57V0h5.4zm-7.86 10.403h2.49c.91 0 1.58-.16 2.03-.48.44-.318.66-.813.66-1.48 0-.37-.07-.68-.21-.94-.14-.26-.34-.48-.59-.65-.25-.17-.55-.29-.91-.36-.35-.07-.74-.11-1.16-.11H7.11v4.02zm15.68-5.49h-5.73v1.21h5.73V4.91zm-15.68 9.63h2.93c.46 0 .88-.05 1.27-.14.39-.09.73-.23 1.01-.43.28-.2.5-.45.66-.76.16-.32.23-.71.23-1.18 0-.8-.24-1.37-.72-1.7-.48-.33-1.13-.5-1.95-.5H7.11v4.71zM20.54 19c.74 0 1.38-.17 1.94-.52.56-.35.94-.86 1.15-1.53h3.69c-.39 1.81-1.14 3.06-2.23 3.76-1.09.7-2.42 1.05-3.98 1.05-1.06 0-2.01-.15-2.86-.44-.84-.29-1.56-.73-2.17-1.32-.6-.6-1.07-1.35-1.39-2.27-.32-.92-.48-2-.48-3.24 0-1.15.15-2.18.44-3.09.29-.91.72-1.68 1.29-2.31.57-.63 1.28-1.11 2.13-1.44.85-.33 1.83-.5 2.94-.5 1.24 0 2.27.24 3.1.71.82.47 1.48 1.08 1.97 1.82.49.74.84 1.58 1.04 2.52.2.94.28 1.9.24 2.88h-10.8c.1 1.33.51 2.27 1.24 2.83.73.55 1.59.83 2.58.83z" />
        </svg>
      </SocialIcon>
    </div>
  );
}

function ContactSection() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const emailAddress = 'tanawitchsaentree@gmail.com';

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
        gap: '6px',
        fontSize: 'var(--text-base)',
        borderBottom: '1px solid var(--foreground)',
        paddingBottom: '1px',
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

export default function Index() {
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
      <ProfileHeader />
      <div style={{ marginBottom: '2rem' }}>
        <BioSection />
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <ExperienceSection />
      </div>
      <ContactSection />
      <div style={{ marginTop: '1rem' }}>
        <SocialLinks />
      </div>
    </div>
  );
}