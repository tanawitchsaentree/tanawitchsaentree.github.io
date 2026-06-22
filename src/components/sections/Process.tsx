'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { DecodeText } from '@/components/ui/DecodeText'

const PRINCIPLES = [
  {
    number: '01',
    title: "The interesting problem isn't the model — it's where it fails.",
    body: "At Allianz, the classification AI was accurate enough. The design problem was what happened when it wasn't — and how to make that uncertainty legible to operators who needed to act on it. Low-confidence states, exception queues, fallback UX: this is where AI tooling lives or dies for real users.",
    source: 'Allianz — UI fallbacks for low-confidence ML predictions.',
  },
  {
    number: '02',
    title: 'Systems are political. Pick a side.',
    body: 'The Invitrace design system had two possible models: gatekeeping or federated contribution. Gatekeeping is safer. Federated is faster and scales better. We chose federated and built the governance to make it safe. That was a design decision, not a technical one.',
    source: 'Invitrace — federated contribution model with shared governance.',
  },
  {
    number: '03',
    title: 'Compliance is a design constraint, not a design enemy.',
    body: "Bi-weekly Legal and Compliance reviews on Profita taught me to treat regulatory requirements as constraints to design with — not last-minute blockers to design around. The prototypes that survived were the ones where the compliance case was already visible.",
    source: 'Profita — SEC regulatory constraints baked into the fund purchase flow.',
  },
] as const

const VP = { once: true, margin: '-8% 0px' } as const

export function Process() {
  const reduced = useReducedMotion()

  const fadeUp = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VP,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <section id="process" aria-labelledby="process-heading" className="w-full pb-16">

      {/* Section label */}
      <motion.p
        id="process-heading"
        {...fadeUp()}
        className="font-mono uppercase text-[var(--type-xs)] tracking-[0.18em] text-[var(--fg-subtle)] mb-10"
      >
        <DecodeText text="How I work" />
      </motion.p>

      <ol className="list-none m-0 p-0 flex flex-col gap-10" aria-label="Design principles">
        {PRINCIPLES.map((p, i) => (
          <motion.li
            key={p.number}
            {...fadeUp(i * 0.06)}
            className={cn(
              'flex flex-col gap-3',
              i < PRINCIPLES.length - 1 && 'pb-10 border-b border-[var(--border)]'
            )}
          >
            <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)]" aria-hidden="true">
              {p.number}
            </span>

            <h3 className="font-display font-normal text-[var(--type-base)] leading-[1.4] tracking-[0.005em] text-[var(--fg)] max-w-[36ch]">
              {p.title}
            </h3>

            <p className="text-[var(--type-sm)] leading-[1.7] text-[var(--fg-muted)] max-w-[52ch]">
              {p.body}
            </p>

            <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] italic">
              — {p.source}
            </p>
          </motion.li>
        ))}
      </ol>

      <motion.p
        {...fadeUp(0.08)}
        className="font-display font-normal italic text-[var(--type-sm)] text-[var(--fg-subtle)] mt-12 max-w-[42ch]"
      >
        Make this small thing work better — that, I can sign up for.
      </motion.p>

    </section>
  )
}
