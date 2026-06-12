'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useInView } from 'framer-motion'
import { cn } from '@/lib/cn'

const QUOTE_LINES = ['Design is a stance,', 'not a service.']

const ELABORATION =
  "Eight years in regulated systems — insurance, healthcare, fintech — where 'move fast and break things' isn't an option. I build design systems that hold when the org grows, AI tools that don't collapse when the model is wrong, and research processes that give engineers something they can actually act on. I'm most useful on teams where design and build aren't separated."

const SKILLS = ['Systems', 'AI/ML UX', 'Accessibility', 'Research', 'Leadership'] as const

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
      className="w-full"
    >
      <h2 id="about-heading" className="sr-only">About</h2>

      <div className="py-16 md:py-24 flex flex-col items-center gap-10 text-center">

        {/* Quote — the one quiet accent line */}
        <blockquote className="m-0 flex flex-col items-center" aria-label={QUOTE_LINES.join(' ')}>
          {QUOTE_LINES.map((line, i) => (
            <motion.span
              key={line}
              className={cn(
                'block font-display italic font-normal',
                'text-[var(--type-lg)] leading-[1.35]',
                'text-[var(--fg)]'
              )}
              {...fadeUp(i * 0.1)}
            >
              {line}
            </motion.span>
          ))}
        </blockquote>

        {/* Body + years — one column, all small */}
        <motion.p
          {...fadeUp(0.1)}
          className="text-[var(--type-sm)] leading-[1.65] text-[var(--fg-muted)] max-w-[42ch]"
        >
          {ELABORATION}
        </motion.p>

        <motion.p
          {...fadeUp(0.15)}
          className="font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)]"
          aria-label="8 years of experience"
        >
          <CountUp target={8} duration={1.4} /> years
        </motion.p>

        {/* Skills */}
        <motion.p
          {...fadeUp(0.2)}
          className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-muted)] max-w-[40ch]"
        >
          {SKILLS.join('  ·  ')}
        </motion.p>

        {/* Work history — centered stacked entries */}
        <ul className="list-none m-0 p-0 flex flex-col items-center gap-5 pt-4" aria-label="Work history">
          {WORK.map((entry, i) => (
            <motion.li
              key={entry.company}
              {...fadeUp(i * 0.06)}
              className="flex flex-col items-center gap-0.5"
            >
              <span className="font-display font-medium text-[var(--type-base)] leading-[1.3] text-[var(--fg)]">
                {entry.company}
              </span>
              <span className="text-[var(--type-xs)] text-[var(--fg-muted)]">
                {entry.title}
              </span>
              <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
                {entry.dates}
              </span>
            </motion.li>
          ))}
        </ul>

        {/* Education footnote */}
        <motion.div
          {...fadeUp(0.1)}
          className="flex flex-col items-center gap-1.5 pt-2"
        >
          {EDUCATION.map(entry => (
            <span key={entry.dates} className="text-[var(--type-xs)] leading-[1.5] text-[var(--fg-subtle)]">
              <span className="font-mono uppercase tracking-[0.1em] mr-2">{entry.dates}</span>
              {entry.label}
            </span>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
