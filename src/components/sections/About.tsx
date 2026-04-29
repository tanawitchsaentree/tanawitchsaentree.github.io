'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'

const PULL_QUOTE = 'Design is a stance, not a service.'

const ELABORATION =
  "I've spent eight years in rooms where design decisions get stress-tested by engineers, compliance officers, and ML pipelines. The work that survives that contact looks different from work that doesn't. I'm most useful on teams where “design” isn't separated from “build.” That's where the interesting problems live."

const SKILLS = [
  { label: 'Systems',       values: 'Enterprise design systems · Federated contribution models' },
  { label: 'AI/ML UX',     values: 'Confidence calibration · Fallback states · Operator trust' },
  { label: 'Accessibility', values: 'WCAG 2.2 AA · Screen reader patterns · Keyboard-first design' },
  { label: 'Research',      values: 'Clinical workflows · Behavioral economics · Stakeholder negotiation' },
  { label: 'Leadership',    values: 'Cross-functional alignment · Design-to-code partnerships' },
] as const

const WORK = [
  { dates: 'Sep 2025 – Present',  title: 'Senior Designer',       company: 'Allianz Technology' },
  { dates: 'Nov 2024 – Aug 2025', title: 'Lead Product Designer', company: 'Invitrace Health' },
  { dates: 'Jan 2024 – Jun 2024', title: 'Product Designer',      company: 'Stellareat by Eatvermont' },
  { dates: 'May 2020 – Dec 2020', title: 'Senior UX/UI Designer', company: 'Robowealth' },
] as const

const EDUCATION = [
  {
    dates: '2022 – 2023',
    degree: 'Diploma — Web Development and Mobile Application',
    school: 'Fanshawe College — Canada',
  },
  {
    dates: '2009 – 2013',
    degree: "Bachelor's degree — Photography and Cinematography",
    school: 'RMUTT — Thailand',
  },
] as const

type Tab = 'work' | 'education'

export function About() {
  const [activeTab, setActiveTab] = useState<Tab>('work')

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={cn(
        'py-32',
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'border-t border-[var(--border)]'
      )}
    >
      <h2 id="about-heading" className="sr-only">About</h2>

      <div className="max-w-[80rem] grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-24">

        {/* ── LEFT COLUMN (60%) ──────────────────────────────────── */}
        <div className="md:col-span-7 flex flex-col">

          {/* Pull-quote — inline style guarantees override any preflight/cascade */}
          <blockquote
            className="font-display italic"
            style={{
              fontStyle: 'italic',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: '1.15',
              letterSpacing: '-0.02em',
              color: 'var(--fg)',
              maxWidth: '18ch',
              margin: '0',
            }}
          >
            &ldquo;{PULL_QUOTE}&rdquo;
          </blockquote>

          {/* Body — inline style guarantees 64px gap regardless of cascade */}
          <p
            className={cn(
              'font-sans text-[var(--type-lg)] leading-relaxed tracking-[-0.014em]',
              'text-[var(--fg-muted)]',
              'max-w-[60ch]'
            )}
            style={{ marginTop: '64px' }}
          >
            {ELABORATION}
          </p>

          {/* Skill clusters — mt-24 = --space-24 (96px gap from body) */}
          <ul className="list-none m-0 p-0 mt-24">
            {SKILLS.map(skill => (
              <li
                key={skill.label}
                className="flex flex-col gap-1 border-t border-[var(--border)] py-4"
              >
                <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-muted)] not-italic">
                  {skill.label}
                </span>
                <span className="font-sans text-[var(--type-sm)] leading-[1.55] text-[var(--fg)] not-italic">
                  {skill.values}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── RIGHT COLUMN (40%) ─────────────────────────────────── */}
        <aside
          aria-label="Work and education history"
          className="md:col-span-5"
        >
          {/* Tab switcher — pb-4 border-b creates divider before list */}
          <div
            role="tablist"
            aria-label="History tabs"
            className="flex items-center gap-6 pb-4 border-b border-[var(--border)]"
          >
            {(['work', 'education'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`tabpanel-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
                  'cursor-pointer transition-colors duration-[240ms] ease-out',
                  'flex flex-col gap-1',
                  activeTab === tab
                    ? 'text-[var(--fg)]'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                )}
              >
                {tab === 'work' ? 'Work' : 'Education'}
                <span
                  className={cn(
                    'h-px w-full',
                    activeTab === tab ? 'bg-[var(--fg)]' : 'bg-transparent'
                  )}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>

          {/* Tab panels — mt-12 = --space-12 (48px gap from divider) */}
          <div className="mt-12">

            {/* WORK tab panel */}
            <div
              id="tabpanel-work"
              role="tabpanel"
              aria-label="Work history"
              hidden={activeTab !== 'work'}
            >
              <ul className="list-none m-0 p-0">
                {WORK.map((entry, i) => (
                  <li
                    key={entry.company}
                    className={cn(
                      'grid gap-6',
                      'grid-cols-[180px_1fr]',
                      i > 0 && 'mt-10'
                    )}
                  >
                    <span className="font-mono text-[var(--type-xs)] tracking-[-0.005em] text-[var(--fg-subtle)] pt-0.5 leading-[1.5] whitespace-nowrap">
                      {entry.dates}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-sans text-[var(--type-base)] text-[var(--fg)] leading-[1.5]">
                        {entry.title}
                      </span>
                      <span className="font-sans text-[var(--type-sm)] text-[var(--fg-muted)] leading-[1.5]">
                        {entry.company}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* EDUCATION tab panel */}
            <div
              id="tabpanel-education"
              role="tabpanel"
              aria-label="Education history"
              hidden={activeTab !== 'education'}
            >
              <ul className="list-none m-0 p-0">
                {EDUCATION.map((entry, i) => (
                  <li
                    key={entry.school}
                    className={cn(
                      'grid gap-6',
                      'grid-cols-[180px_1fr]',
                      i > 0 && 'mt-10'
                    )}
                  >
                    <span className="font-mono text-[var(--type-xs)] tracking-[-0.005em] text-[var(--fg-subtle)] pt-0.5 leading-[1.5] whitespace-nowrap">
                      {entry.dates}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-sans text-[var(--type-base)] text-[var(--fg)] leading-[1.5]">
                        {entry.degree}
                      </span>
                      <span className="font-sans text-[var(--type-sm)] text-[var(--fg-muted)] leading-[1.5]">
                        {entry.school}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </aside>

      </div>
    </section>
  )
}
