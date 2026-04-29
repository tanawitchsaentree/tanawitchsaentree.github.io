import Link from 'next/link'
import { cn } from '@/lib/cn'
import { allianzMeta } from '@/data/universes/allianz-meta'

export function UniverseHero() {
  return (
    <header
      className={cn(
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'pt-24 pb-16 md:pt-32 md:pb-20'
      )}
    >
      {/* Back link */}
      <Link
        href="/"
        className={cn(
          'inline-flex items-center gap-2 mb-10',
          'font-mono text-[var(--type-xs)] tracking-widest uppercase',
          'text-[var(--universe-fg-2)] hover:text-[var(--universe-fg)]',
          'no-underline transition-colors duration-[var(--duration-fast)]'
        )}
      >
        <span aria-hidden="true">←</span>
        <span>Back to work</span>
      </Link>

      {/* Eyebrow */}
      <p
        className={cn(
          'font-mono text-[var(--type-xs)] tracking-widest uppercase mb-4',
          'text-[var(--universe-accent)]'
        )}
      >
        {allianzMeta.company} · {allianzMeta.year}
      </p>

      {/* Headline */}
      <h1
        className={cn(
          'font-display font-normal',
          'text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.04em]',
          'text-[var(--universe-fg)]',
          'max-w-[22ch] mb-6'
        )}
      >
        IDAS — AI Document
        <br />
        <em className="not-italic text-[var(--universe-fg-2)]">Intelligence Suite</em>
      </h1>

      {/* Summary */}
      <p
        className={cn(
          'text-[var(--type-lg)] leading-[1.65] tracking-[-0.014em]',
          'text-[var(--universe-fg-2)]',
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
            <dt className="text-[var(--universe-fg-2)] opacity-60">{label}</dt>
            <dd className="text-[var(--universe-fg)]">{value}</dd>
          </div>
        ))}
      </dl>
    </header>
  )
}
