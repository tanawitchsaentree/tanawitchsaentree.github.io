import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import LinkedinIcon from '../assets/Linkedin.svg';
import MediumIcon from '../assets/Medium.svg';
import BehanceIcon from '../assets/Behance.svg';
import nateProfile from '../image/nateprofile.png';
import profileData from '../../profile_data.json';

function ProfileHeader() {
  return (
    <div className="profile-header" style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
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
          fontSize: '1.5rem',
          fontWeight: 600,
          margin: 0,
          lineHeight: '1.2',
          marginBottom: '2px',
        }}>
          Hey, I'm Nate
        </h2>
        <p style={{
          fontSize: '0.75rem',
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
        I'm a product designer with 8+ years of experience turning complicated systems into tools people actually want to use.
      </p>
      <p className="bio-text">
        I'm curious by nature, always digging into how complex products are built and how to reshape them so they feel natural, not overwhelming.
      </p>
      <p className="bio-text">
        Lately I've been exploring how AI changes that challenge, designing products that don't just simplify complexity but adapt to it, learning and evolving with their users.
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
    <div className="w-full flex flex-col gap-3">
      <h2 style={{
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        margin: 0,
        color: 'var(--foreground)',
      }}>
        Previously
      </h2>
      <div className="flex flex-col gap-3">
        {profileData.work_experience.map((exp, index) => (
          <ExperienceItem 
            key={index} 
            year={`${new Date(exp.start_date).getFullYear()} - ${/current|present/i.test(exp.end_date) ? 'Present' : new Date(exp.end_date).getFullYear()}`}
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
      className="social-icon"
      onMouseOver={(e) => (e.currentTarget.style.opacity = '0.7')}
      onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
      aria-label={
        href.includes('linkedin') ? 'LinkedIn' : 
        href.includes('medium') ? 'Medium' :
        href.includes('behance') ? 'Behance' : 'Social Link'
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
      <SocialIcon href="https://www.linkedin.com/in/tanawitch-saentree/">
        <img src={LinkedinIcon} alt="LinkedIn" style={{ width: '20px', height: '20px' }} />
      </SocialIcon>
      
      <SocialIcon href="https://medium.com/@thenutlpkl">
        <img src={MediumIcon} alt="Medium" style={{ width: '20px', height: '20px' }} />
      </SocialIcon>
      
      <SocialIcon href="https://www.behance.net/tanawitchsaentree">
        <img src={BehanceIcon} alt="Behance" style={{ width: '20px', height: '20px' }} />
      </SocialIcon>
    </div>
  );
}

function ContactSection() {
  return (
    <div className="w-full mt-4">
      <a 
        href="mailto:tanawitchsaentree@gmail.com" 
        style={{
          color: 'var(--foreground)',
          textDecoration: 'none',
          fontSize: '0.75rem',
          borderBottom: '1px solid var(--foreground)',
          paddingBottom: '1px',
          display: 'inline-block',
        }}
      >
        tanawitchsaentree@gmail.com
      </a>
    </div>
  );
}

export default function Index() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '500px',
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