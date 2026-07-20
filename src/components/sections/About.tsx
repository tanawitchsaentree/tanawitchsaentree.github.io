'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

const WORK = [
  { dates: 'Sep 2025 – Present',  title: 'Senior Designer',         company: 'Allianz Technology' },
  { dates: 'Nov 2024 – Aug 2025', title: 'Lead Product Designer',   company: 'Invitrace Health' },
  { dates: 'Jan 2024 – Jun 2024', title: 'Product Designer',        company: 'Stellareat' },
  { dates: 'Aug 2020 – Dec 2020', title: 'Senior UX/UI Designer · Profita (for LH Bank)', company: 'Robowealth' },
] as const

const EDUCATION = [
  { dates: '2022–23', title: 'Web Development & Mobile Application', institution: 'Fanshawe College, Canada' },
  { dates: '2009–13', title: 'Photography & Cinematography',          institution: 'RMUTT, Thailand' },
] as const

const TAGS = ['Based in Bangkok', 'Valid Canadian work permit'] as const

const BIO = [
  <>I&apos;m Nat — a product designer who builds. For seven years I&apos;ve worked on hard, regulated products: enterprise AI tooling at Allianz Technology, a hospital information system at Invitrace Health, an AI-powered consumer platform at Stellareat, and an award-winning investment app at Robowealth.</>,
  <>I didn&apos;t get here on a straight line. I studied graphic design, film, and web development — three things that looked unrelated until they weren&apos;t. Film taught me to tell a story. Code taught me what&apos;s actually buildable. Design taught me to care about the person on the other side of the screen. I taught myself most of it, one problem at a time.</>,
  <>These days I work with AI as a primary collaborator. At Allianz I built a pipeline that turns requirements into live, deployable Angular prototypes with the design system built in — moving design validation from weeks to hours. I&apos;m most useful where things are messy: regulated constraints, incomplete data, systems that have to hold up when the AI gets it wrong. If you&apos;re building in that territory — that&apos;s the brief I&apos;m sharpest on.</>,
] as const

const VP = { once: true, margin: '0px 0px 80px 0px' } as const

export function About() {
  const reduced = useReducedMotion()

  const fadeUp = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VP,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <section id="about" aria-labelledby="about-heading" className="w-full pt-16 pb-16">
      <h2 id="about-heading" className="sr-only">About</h2>

      {/* ── Intro — portrait + pills (left) · bio (right) ── */}
      <div className="grid md:grid-cols-[300px_1fr] gap-12 lg:gap-20 items-start">

        {/* Left — portrait card + status pills */}
        <motion.div {...fadeUp()} className="flex flex-col gap-5">
          <div
            className="relative w-full aspect-[4/5] overflow-hidden rounded-[28px] border border-[var(--border)]"
            style={{ background: 'var(--bg-elevated)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/portrait.jpg"
              alt="Tanawitch Saentree"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-center select-none"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          </div>

          <div className="flex flex-col items-start gap-2.5">
            {TAGS.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg)] whitespace-nowrap"
                style={{ borderRadius: 14, fontSize: 14, padding: '8px 16px', lineHeight: 1.2 }}
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right — bio */}
        <div className="flex flex-col gap-6 max-w-[52ch]">
          {BIO.map((para, i) => (
            <motion.p
              key={i}
              {...fadeUp(0.06 + i * 0.06)}
              className="text-[var(--type-base)] leading-[1.7] text-[var(--fg-muted)]"
            >
              {para}
            </motion.p>
          ))}
          <motion.p
            {...fadeUp(0.06 + BIO.length * 0.06)}
            className="text-[var(--type-base)] leading-[1.7] text-[var(--fg)]"
          >
            If it&apos;s not buildable, it&apos;s just a drawing.<br />
            I&apos;d rather build.
          </motion.p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-[var(--border)] my-16" aria-hidden="true" />

      {/* ── Timeline ── */}
      <div className="grid md:grid-cols-[300px_1fr] gap-12 lg:gap-20 items-start">
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          Experience
        </p>

        <div className="flex flex-col gap-6 max-w-[52ch]">
          <ul className="list-none m-0 p-0 flex flex-col" aria-label="Work history">
            {WORK.map((entry, i) => (
              <motion.li
                key={entry.company}
                {...fadeUp(i * 0.05)}
                className={cn(
                  'grid grid-cols-[1fr_auto] items-baseline gap-6 py-3',
                  i < WORK.length - 1 && 'border-b border-[var(--border)]'
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-display font-medium text-[var(--type-base)] leading-[1.3] text-[var(--fg)]">
                    {entry.company}
                  </span>
                  <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] tracking-[0.04em]">
                    {entry.title}
                  </span>
                </div>
                <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)] shrink-0 tabular-nums">
                  {entry.dates.includes('Present')
                    ? entry.dates.replace('Sep ', '').replace(' – Present', ' →')
                    : entry.dates.split(' – ')[1]}
                </span>
              </motion.li>
            ))}
          </ul>

        </div>
      </div>

      {/* ── Divider between Experience and Education ── */}
      <div className="h-px bg-[var(--border)] mt-14" aria-hidden="true" />

      {/* ── Education ── */}
      <div className="grid md:grid-cols-[300px_1fr] gap-12 lg:gap-20 items-start mt-14">
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          Education
        </p>

        <div className="flex flex-col gap-6 max-w-[52ch]">
          <ul className="list-none m-0 p-0 flex flex-col" aria-label="Education history">
            {EDUCATION.map((entry, i) => (
              <motion.li
                key={entry.dates}
                {...fadeUp(i * 0.05)}
                className={cn(
                  'grid grid-cols-[1fr_auto] items-baseline gap-6 py-3',
                  i < EDUCATION.length - 1 && 'border-b border-[var(--border)]'
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-display font-medium text-[var(--type-base)] leading-[1.3] text-[var(--fg)]">
                    {entry.institution}
                  </span>
                  <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] tracking-[0.04em]">
                    {entry.title}
                  </span>
                </div>
                <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)] shrink-0 tabular-nums">
                  {entry.dates}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Divider before "How I work" ── */}
      <div className="h-px bg-[var(--border)] mt-16" aria-hidden="true" />
    </section>
  )
}
