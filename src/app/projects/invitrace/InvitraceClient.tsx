'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { HeroBackground } from '@/components/invitrace/HeroBackground'
import { EngineSection } from '@/components/invitrace/EngineSection'
import { AtomicSection } from '@/components/invitrace/AtomicSection'

const METRICS = [
  { value: '3+',      label: 'hospitals onboarded'         },
  { value: '~85%',    label: 'component reuse across sites' },
  { value: '12→4 wk', label: 'onboarding time'             },
  { value: '~60%',    label: 'rework reduction'             },
] as const

function BackLink() {
  const router = useRouter()
  const handleBack = useCallback(() => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as Document & { startViewTransition: (cb: () => void) => void })
        .startViewTransition(() => { router.push('/') })
    } else {
      router.push('/')
    }
  }, [router])

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        'inline-flex items-center gap-2',
        'font-mono text-[var(--type-xs)] tracking-widest uppercase',
        'text-[var(--fg-muted)] hover:text-[var(--fg)]',
        'transition-colors duration-[var(--duration-fast)]',
        'cursor-pointer border-none bg-transparent p-0'
      )}
    >
      <span aria-hidden="true">←</span>
      <span>Back to work</span>
    </button>
  )
}

function HeroSection() {
  return (
    <section
      className="relative min-h-svh flex flex-col overflow-hidden"
      aria-label="Project overview"
    >
      {/* Full-bleed canvas — mouse events pass through to window */}
      <HeroBackground />

      {/* Top bar */}
      <div className={cn(
        'relative z-10',
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'pt-10 pb-0 flex-shrink-0'
      )}>
        <BackLink />
      </div>

      {/* Main content — left half only so graph is visible right */}
      <div className={cn(
        'relative z-10 flex-1 flex flex-col justify-center',
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'py-16 max-w-[52ch] md:max-w-[46%]'
      )}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--accent-text)] mb-5"
        >
          Invitrace Health · 2024–2025
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'font-display font-medium',
            'text-[clamp(2.75rem,6vw,5rem)] leading-[0.92] tracking-[-0.04em]',
            'text-[var(--fg)] mb-8'
          )}
        >
          One system.
          <br />
          <span className="text-[var(--fg-muted)]">Every hospital</span>
          <br />
          fits in it.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-[var(--type-base)] leading-[1.7] text-[var(--fg-muted)] mb-12"
        >
          Clinical software that sells into many hospitals can&apos;t rebuild for each one.
          A federated design system — what each hospital controls, what the contract locks.
        </motion.p>

        <motion.dl
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[var(--type-xs)] tracking-widest uppercase"
        >
          {([['Role', 'Lead Product Designer'], ['Timeline', '8 months'], ['Team', '4 Designers · Engineers']] as const).map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="text-[var(--fg-muted)] opacity-60">{label}</dt>
              <dd className="text-[var(--fg)]">{value}</dd>
            </div>
          ))}
        </motion.dl>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-10 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)]"
          aria-hidden="true"
        >
          Move cursor over the graph →
        </motion.p>
      </div>

      {/* Metrics bar */}
      {/* Metrics strip — bottom of hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className={cn(
          'relative z-10 flex-shrink-0',
          'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
          'py-6 border-t border-[var(--border)]',
          'flex flex-wrap gap-x-10 gap-y-3'
        )}
      >
        {METRICS.map((m) => (
          <div key={m.label} className="flex items-baseline gap-2">
            <span className="font-display font-medium tracking-[-0.04em] text-[1.5rem] leading-none text-[var(--fg)]">
              {m.value}
            </span>
            <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] uppercase tracking-[0.06em]">
              {m.label}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

function ReflectionSection() {
  const items = [
    {
      label: 'What held',
      body: 'Locking interaction behavior across hospitals — keyboard, focus, error — while letting visual density flex. Three hospitals in, zero accessibility regressions.',
    },
    {
      label: 'What didn\'t',
      body: 'Two hospitals built keyboard shortcut layers on top. Both broke focus management in edge cases we only caught in QA. The contract doesn\'t extend past the component boundary.',
    },
    {
      label: 'What it means',
      body: 'Governance is a component contract, not a doc. If the spec doesn\'t enforce it, the system doesn\'t either.',
    },
  ] as const

  return (
    <section
      className={cn(
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'py-24 md:py-32 border-t border-[var(--border)]'
      )}
      aria-labelledby="reflection-heading"
    >
      <p className="font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--accent-text)] mb-4">
        04 — Reflection
      </p>
      <h2
        id="reflection-heading"
        className={cn(
          'font-display font-normal leading-[1.05] tracking-[-0.032em]',
          'text-[clamp(1.75rem,4vw,3rem)] text-[var(--fg)] mb-14 max-w-[28ch]'
        )}
      >
        What it taught me
      </h2>
      <dl className="grid md:grid-cols-3 gap-10 max-w-[80rem]">
        {items.map(item => (
          <div key={item.label} className="border-t border-[var(--border)] pt-6">
            <dt className="font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--fg-subtle)] mb-3">
              {item.label}
            </dt>
            <dd className="text-[var(--type-sm)] text-[var(--fg-muted)] leading-[1.75]">
              {item.body}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function InvitraceClient() {
  return (
    <>
      <HeroSection />
      <EngineSection />
      <AtomicSection />
      <ReflectionSection />

      <footer className={cn(
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'py-16 border-t border-[var(--border)]'
      )}>
        <p className="font-mono text-[var(--type-xs)] tracking-widest uppercase text-[var(--fg-muted)] opacity-60">
          Invitrace Health · 2024–2025
        </p>
      </footer>
    </>
  )
}
