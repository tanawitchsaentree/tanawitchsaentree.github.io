import type { ReactNode } from 'react'
import type { SubCaseSections } from '@/lib/universes'

interface Props {
  slug: string
  index: number
  title: string
  tags: string[]
  sections: SubCaseSections
  children?: ReactNode
}

export function SubCaseShell({ index, title, sections, children }: Props) {
  return (
    <article className="px-6 md:px-12 lg:px-20 xl:px-[7.5rem] py-10 md:py-12 border-b border-[var(--border)]">
      <div className="max-w-[72rem] mx-auto">
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-5 md:gap-12 mb-8">
          <h2 className="text-[clamp(1.4rem,2.8vw,2rem)] leading-tight tracking-[-0.02em] text-[var(--fg)] font-medium">
            <span className="block text-xs text-[var(--fg-subtle)] mb-3">0{index + 1}</span>
            {title}
          </h2>
          <div className="text-[15px] leading-[1.75] text-[var(--fg-muted)] max-w-[60ch]">
            <p>{sections.problem}</p>

          </div>
        </div>
        <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-5 max-w-[75ch]">{sections.decision}</p>
        <div className="overflow-x-auto pb-2"><div className="min-w-[580px]">{children}</div></div>
        <p className="text-sm text-[var(--fg-muted)] leading-relaxed mt-5 max-w-[80ch]">{sections.tradeoff}</p>
      </div>
    </article>
  )
}
