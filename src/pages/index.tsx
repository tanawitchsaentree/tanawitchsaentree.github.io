import React from 'react';
import { Linkedin, BookOpenText, ArrowUpRight } from 'lucide-react';
import nateProfile from '../image/nateprofile.png';
import profileData from '../../profile_data.json';

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

type ParsedDate =
  | { kind: 'present'; label: string }
  | { kind: 'month-year'; label: string; year: number; month: number }
  | { kind: 'year'; label: string; year: number }
  | { kind: 'text'; label: string };

function parseDateInput(value: string): ParsedDate {
  const trimmed = value.trim();
  if (!trimmed) {
    return { kind: 'text', label: '' };
  }

  const normalized = trimmed.toLowerCase();
  if (normalized === 'current' || normalized === 'present') {
    return { kind: 'present', label: 'Present' };
  }

  if (/^\d{4}$/.test(trimmed)) {
    const year = Number(trimmed);
    return { kind: 'year', label: trimmed, year };
  }

  const parsedDate = new Date(trimmed);
  if (!Number.isNaN(parsedDate.getTime())) {
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth();
    const label = `${monthFormatter.format(parsedDate)} ${year}`;
    return { kind: 'month-year', label, year, month };
  }

  const yearMatch = trimmed.match(/\d{4}/);
  if (yearMatch) {
    return { kind: 'year', label: yearMatch[0], year: Number(yearMatch[0]) };
  }

  return { kind: 'text', label: trimmed };
}

function formatYearRange(startDate: string, endDate: string) {
  const start = parseDateInput(startDate);
  const end = parseDateInput(endDate);

  const formatLabel = (entry: ParsedDate) => {
    switch (entry.kind) {
      case 'present':
        return entry.label;
      case 'month-year':
        return entry.label;
      case 'year':
        return entry.label;
      case 'text':
      default:
        return entry.label;
    }
  };

  if (start.kind === 'month-year' && end.kind === 'month-year') {
    if (start.year === end.year) {
      if (start.month === end.month) {
        return formatLabel(start);
      }
      const startMonth = monthFormatter.format(new Date(start.year, start.month));
      const endMonth = monthFormatter.format(new Date(end.year, end.month));
      return `${startMonth}–${endMonth} ${start.year}`;
    }
    return `${formatLabel(start)}–${formatLabel(end)}`;
  }

  if (start.kind === 'month-year' && end.kind === 'present') {
    return `${formatLabel(start)}–${formatLabel(end)}`;
  }

  if (start.kind === 'year' && end.kind === 'present') {
    return `${formatLabel(start)}–${formatLabel(end)}`;
  }

  if (start.kind === 'year' && end.kind === 'year') {
    if (start.year === end.year) {
      return formatLabel(start);
    }
    return `${formatLabel(start)}–${formatLabel(end)}`;
  }

  if (start.kind === 'text' && !start.label) {
    return formatLabel(end);
  }

  if (start.kind === 'present') {
    return formatLabel(start);
  }

  if (end.kind === 'text' && !end.label) {
    return formatLabel(start);
  }

  if (start.kind === 'text' && end.kind === 'text' && start.label === end.label) {
    return formatLabel(start);
  }

  if (start.kind === 'text' && !end.label) {
    return formatLabel(start);
  }

  if (end.kind === 'text' && !start.label) {
    return formatLabel(end);
  }

  const formattedStart = formatLabel(start);
  const formattedEnd = formatLabel(end);

  if (!formattedStart) {
    return formattedEnd;
  }

  if (!formattedEnd) {
    return formattedStart;
  }

  if (formattedStart === formattedEnd) {
    return formattedStart;
  }

  return `${formattedStart}–${formattedEnd}`;
}

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

function ExperienceItem({
  startDate,
  endDate,
  company,
  role,
  link,
  achievements,
}: {
  startDate: string;
  endDate: string;
  company: string;
  role: string;
  link?: string;
  achievements?: string[];
}) {
  const year = formatYearRange(startDate, endDate);
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
        {achievements && achievements.length > 0 && (
          <ul
            style={{
              margin: '0.5rem 0 0',
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              color: 'var(--muted-foreground)',
              fontSize: '0.75rem',
              lineHeight: 1.4,
            }}
          >
            {achievements.map((achievement, idx) => (
              <li key={idx} style={{ display: 'flex', gap: '0.35rem' }}>
                <span aria-hidden="true" style={{ color: 'var(--foreground)' }}>
                  •
                </span>
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        )}
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
            startDate={exp.start_date}
            endDate={exp.end_date}
            role={exp.role}
            company={exp.company}
            link={exp.link}
            achievements={exp.achievements}
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
      aria-label={href.includes('linkedin') ? 'LinkedIn' : 'Medium'}
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
        <Linkedin style={{ width: '20px', height: '20px', color: 'inherit' }} />
      </SocialIcon>
      
      <SocialIcon href="https://medium.com/@thenutlpkl">
        <BookOpenText style={{ width: '20px', height: '20px', color: 'inherit' }} />
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