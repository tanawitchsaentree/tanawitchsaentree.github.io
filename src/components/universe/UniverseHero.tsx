'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/cn'
import { allianzMeta } from '@/data/universes/allianz-meta'

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
      data-cursor="button"
      className={cn(
        'inline-flex items-center gap-2 mb-10',
        'font-mono text-[var(--type-xs)] tracking-widest uppercase',
        'text-[var(--fg-muted)] hover:text-[var(--fg)]',
        'no-underline transition-colors duration-[var(--duration-fast)]',
        'cursor-pointer border-none bg-transparent p-0'
      )}
    >
      <span aria-hidden="true">←</span>
      <span>Back to work</span>
    </button>
  )
}

export function UniverseHero() {
  return (
    <header
      className={cn(
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'pt-24 pb-16 md:pt-32 md:pb-20'
      )}
    >
      <BackLink />

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
