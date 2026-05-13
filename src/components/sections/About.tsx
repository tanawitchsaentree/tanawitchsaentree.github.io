'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useInView } from 'framer-motion'
import { cn } from '@/lib/cn'

const QUOTE_LINES = ['Design is a stance,', 'not a service.']

const ELABORATION =
  "I've spent eight years in rooms where design decisions get stress-tested by engineers, compliance officers, and ML pipelines. The work that survives that contact looks different from work that doesn't. I'm most useful on teams where “design” isn't separated from “build.” That's where the interesting problems live."

const SKILLS = ['Systems', 'AI/ML UX', 'Accessibility', 'Research', 'Leadership'] as const

const WORK = [
  { dates: 'Sep 2025 – Present',  title: 'Senior Designer',       company: 'Allianz Technology' },
  { dates: 'Nov 2024 – Aug 2025', title: 'Lead Product Designer',  company: 'Invitrace Health' },
  { dates: 'Jan 2024 – Jun 2024', title: 'Product Designer',       company: 'Stellareat' },
  { dates: 'May 2020 – Dec 2020', title: 'Senior UX/UI Designer',  company: 'Robowealth' },
] as const

const EDUCATION = [
  { dates: '2022–23', label: 'Web Development & Mobile Application — Fanshawe College, Canada' },
  { dates: '2009–13', label: 'Photography & Cinematography — RMUTT, Thailand' },
] as const

// ── Count-up stat ──────────────────────────────────────────────
function CountUp({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!inView) return
    if (reduced) { setValue(target); return }
    const start = performance.now()
    function tick(now: number) {
      const t = Math.min((now - start) / (duration * 1000), 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration, reduced])

  return <span ref={ref}>{value}</span>
}

// ── Shared viewport config ─────────────────────────────────────
const VP = { once: true, margin: '-8% 0px' } as const

export function About() {
  const reduced = useReducedMotion()

  const fadeUp = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VP,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  })

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-t border-[var(--border)]"
    >
      <h2 id="about-heading" className="sr-only">About</h2>

      {/* ── Block 1: Quote — line-by-line clip reveal ─────────── */}
      <div className={cn('px-8 md:px-12 lg:px-16', 'pt-24 pb-12 md:pt-32 md:pb-16')}>
        <blockquote className="m-0" aria-label={QUOTE_LINES.join(' ')}>
          {QUOTE_LINES.map((line, i) => (
            <div key={line} className="overflow-hidden leading-none">
              <motion.span
                className={cn(
                  'block font-display italic font-normal',
                  'text-[clamp(2.75rem,5.5vw,5rem)] leading-[1.0] tracking-[-0.04em]',
                  'text-[var(--fg)]'
                )}
                initial={reduced ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)', opacity: 1 }}
                whileInView={reduced ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
                viewport={VP}
                transition={{ duration: 0.75, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.span>
            </div>
          ))}
        </blockquote>
      </div>

      {/* ── Block 2: Body + stat ──────────────────────────────── */}
      <div className={cn(
        'px-8 md:px-12 lg:px-16', 'py-16 md:py-20',
        'flex flex-col md:flex-row md:items-start md:justify-between gap-12 md:gap-24'
      )}>
        <motion.p
          {...fadeUp(0.1)}
          className={cn(
            'text-[var(--type-lg)] leading-[1.7] tracking-[-0.014em]',
            'text-[var(--fg-muted)] max-w-[52ch]'
          )}
        >
          {ELABORATION}
        </motion.p>

        <motion.div
          {...fadeUp(0.2)}
          className="flex-shrink-0 flex flex-col items-start md:items-end gap-1 md:pt-1"
          aria-label="8 years of experience"
        >
          <span className={cn(
            'font-display font-normal',
            'text-[clamp(2.75rem,5.5vw,5rem)] leading-[0.9] tracking-[-0.05em]',
            'text-[var(--fg)]'
          )}>
            <CountUp target={8} duration={1.4} />
          </span>
          <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.15em] text-[var(--fg-subtle)]">
            years
          </span>
        </motion.div>
      </div>

      {/* ── Block 3: Horizontal skills strip ─────────────────── */}
      <div className={cn(
        'px-8 md:px-12 lg:px-16', 'py-8',
        'border-t border-[var(--border)]',
        'flex flex-wrap items-center gap-x-8 gap-y-3'
      )}>
        {SKILLS.map((skill, i) => (
          <motion.span key={skill} className="flex items-center gap-8" {...fadeUp(i * 0.06)}>
            <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
              {skill}
            </span>
            {i < SKILLS.length - 1 && (
              <span className="text-[var(--fg-subtle)] font-mono text-[var(--type-xs)]" aria-hidden="true">/</span>
            )}
          </motion.span>
        ))}
      </div>

      {/* ── Block 4: Work history rows ────────────────────────── */}
      <ul className="list-none m-0 p-0" aria-label="Work history">
        {WORK.map((entry, i) => (
          <motion.li
            key={entry.company}
            {...fadeUp(i * 0.07)}
            className={cn(
              'px-8 md:px-12 lg:px-16',
              'py-7 md:py-8',
              'border-t border-[var(--border)]',
              'flex items-baseline justify-between gap-8'
            )}
          >
            <span className={cn(
              'font-display font-normal',
              'text-[clamp(1.25rem,2.5vw,2rem)] leading-[1.1] tracking-[-0.024em]',
              'text-[var(--fg)]'
            )}>
              {entry.company}
            </span>
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              <span className="text-[var(--type-sm)] leading-[1.4] tracking-[-0.005em] text-[var(--fg-muted)]">
                {entry.title}
              </span>
              <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] text-[var(--fg-subtle)]">
                {entry.dates}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* ── Block 5: Education footnote ───────────────────────── */}
      <motion.div
        {...fadeUp(0.1)}
        className={cn(
          'px-8 md:px-12 lg:px-16', 'py-6',
          'border-t border-[var(--border)]',
          'flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10'
        )}
      >
        {EDUCATION.map(entry => (
          <span key={entry.dates} className="flex items-baseline gap-3">
            <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)] flex-shrink-0">
              {entry.dates}
            </span>
            <span className="text-[var(--type-xs)] leading-[1.5] text-[var(--fg-subtle)]">
              {entry.label}
            </span>
          </span>
        ))}
      </motion.div>

    </section>
  )
}
