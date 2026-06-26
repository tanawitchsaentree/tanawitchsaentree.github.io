'use client'

import { cn } from '@/lib/cn'
import { allianzMeta } from '@/data/universes/allianz-meta'
import { BackButton } from '@/components/universe/BackButton'

export function UniverseHero() {
  return (
    <header
      className={cn(
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'pt-24 pb-16 md:pt-32 md:pb-20'
      )}
    >
      <BackButton className="mb-10" />

      {/* Eyebrow */}
      <p
        className={cn(
          'font-mono text-[var(--type-xs)] tracking-widest uppercase mb-4',
          'text-[var(--accent-text)]'
        )}
      >
        {allianzMeta.company} · {allianzMeta.year}
      </p>

      {/* Headline */}
      <h1
        className={cn(
          'font-display font-normal',
          'text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] tracking-[-0.02em]',
          'text-[var(--fg)]',
          'max-w-[22ch] mb-6'
        )}
      >
        AI Document
        <br />
        <em className="not-italic text-[var(--fg-muted)]">Intelligence Suite</em>
      </h1>

      {/* Summary */}
      <p
        className={cn(
          'text-[var(--type-lg)] leading-[1.65] tracking-[-0.014em]',
          'text-[var(--fg-muted)]',
          'max-w-[60ch] mb-10'
        )}
      >
        {allianzMeta.summary}
      </p>

      {/* Meta strip */}
      <dl
        className={cn(
          'flex flex-wrap gap-x-8 gap-y-3',
          'font-mono text-[var(--type-xs)] tracking-widest uppercase'
        )}
      >
        {[
          ['Role', allianzMeta.role],
          ['Timeline', allianzMeta.timeline],
          ['Team', allianzMeta.team],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="text-[var(--fg-muted)] opacity-60">{label}</dt>
            <dd className="text-[var(--fg)]">{value}</dd>
          </div>
        ))}
      </dl>
    </header>
  )
}
