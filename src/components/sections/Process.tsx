'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

const PRINCIPLES = [
  {
    number: '01',
    title: "The interesting problem isn't the model — it's where it fails.",
    body: "At Allianz, the classification AI was accurate enough. The design problem was what happened when it wasn't — and how to make that uncertainty legible to operators who needed to act on it. Low-confidence states, exception queues, fallback UX: this is where AI tooling lives or dies for real users. The system that ships is the one that handles its own failure modes gracefully.",
    example: '— From Allianz: designing UI fallbacks for low-confidence ML predictions.',
  },
  {
    number: '02',
    title: 'Systems are political. Pick a side.',
    body: 'The Invitrace design system had two possible models: gatekeeping (one team controls everything) or federated contribution (teams own their domains, shared governance). Gatekeeping is safer. Federated is faster and scales better. We chose federated and built the governance to make it safe. That was a design decision, not a technical one — and every system choice carries the same weight.',
    example: '— From Invitrace: federated contribution model with shared governance layer.',
  },
  {
    number: '03',
    title: 'Compliance is a design constraint, not a design enemy.',
    body: "Bi-weekly Legal and Compliance reviews on Profita taught me to treat regulatory requirements as constraints to design with — not last-minute blockers to design around. The prototypes that survived were the ones where the compliance case was already visible. Constraints have a shape. The best work I've seen finds that shape early and makes it load-bearing.",
    example: '— From Profita: SEC regulatory constraints baked into the fund purchase flow.',
  },
] as const

const VP = { once: true, margin: '-8% 0px' } as const

export function Process() {
  const reduced = useReducedMotion()

  const fadeUp = (delay = 0) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VP,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className={cn('py-24 md:py-32', 'px-8 md:px-12 lg:px-16')}
    >
      <motion.h2
        id="process-heading"
        {...fadeUp()}
        className={cn(
          'font-display font-normal',
          'text-[var(--type-3xl)] tracking-[-0.028em]',
          'text-[var(--fg)] mb-24 md:mb-32'
        )}
      >
        How I work
      </motion.h2>

      <ol className="list-none m-0 p-0 max-w-[80rem]" aria-label="Design principles">
        {PRINCIPLES.map((p, i) => (
          <li key={p.number} className={cn(i < PRINCIPLES.length - 1 && 'mb-24 md:mb-32')}>

            <motion.p
              {...fadeUp(0.05)}
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)] mb-5"
              aria-hidden="true"
            >
              {p.number}
            </motion.p>

            {/* Title — clip reveal */}
            <div className="overflow-hidden mb-6">
              <motion.h3
                className={cn(
                  'font-display font-normal',
                  'text-[var(--type-xl)] md:text-[var(--type-2xl)]',
                  'leading-[1.1] tracking-[-0.028em]',
                  'text-[var(--fg)] max-w-[32ch]'
                )}
                initial={reduced ? { opacity: 0 } : { clipPath: 'inset(0 0 100% 0)', opacity: 1 }}
                whileInView={reduced ? { opacity: 1 } : { clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
                viewport={VP}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                {p.title}
              </motion.h3>
            </div>

            <motion.p
              {...fadeUp(0.18)}
              className={cn(
                'text-[var(--type-lg)] leading-[1.7] tracking-[-0.014em]',
                'text-[var(--fg-muted)] max-w-[60ch] mb-5'
              )}
            >
              {p.body}
            </motion.p>

            <motion.p
              {...fadeUp(0.24)}
              className="font-mono text-[var(--type-xs)] tracking-[-0.005em] text-[var(--fg-subtle)] italic"
            >
              {p.example}
            </motion.p>
          </li>
        ))}
      </ol>

      <motion.p
        {...fadeUp(0.1)}
        className={cn(
          'font-display italic',
          'text-[var(--type-lg)]',
          'text-[var(--fg-muted)] max-w-[50ch] mt-24'
        )}
      >
        Make this small thing work better — that, I can sign up for.
      </motion.p>
    </section>
  )
}
