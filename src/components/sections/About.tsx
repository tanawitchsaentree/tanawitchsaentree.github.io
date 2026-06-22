'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

const WORK = [
  { dates: 'Sep 2025 – Present',  title: 'Senior Designer',         company: 'Allianz Technology' },
  { dates: 'Nov 2024 – Aug 2025', title: 'Lead Product Designer',   company: 'Invitrace Health' },
  { dates: 'Jan 2024 – Jun 2024', title: 'Product Designer',        company: 'Stellareat' },
  { dates: 'Jun 2022 – Aug 2024', title: 'Senior Product Designer', company: 'LH Bank / Profita' },
  { dates: 'May 2020 – Dec 2020', title: 'Senior UX/UI Designer',   company: 'Robowealth' },
] as const

const EDUCATION = [
  { dates: '2022–23', label: 'Web Development & Mobile Application — Fanshawe College, Canada' },
  { dates: '2009–13', label: 'Photography & Cinematography — RMUTT, Thailand' },
] as const

const VP = { once: true, margin: '-8% 0px' } as const

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

      {/* ── Timeline ── */}
      <div className="flex flex-col gap-6">

        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          Experience
        </p>

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
                <span className="font-display font-normal text-[var(--type-base)] leading-[1.3] text-[var(--fg)]">
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

        <motion.div {...fadeUp(0.08)} className="flex flex-col gap-1 pt-2">
          {EDUCATION.map(entry => (
            <p key={entry.dates} className="text-[var(--type-xs)] leading-[1.6] text-[var(--fg-subtle)]">
              <span className="font-mono uppercase tracking-[0.1em] mr-3">{entry.dates}</span>
              {entry.label}
            </p>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
