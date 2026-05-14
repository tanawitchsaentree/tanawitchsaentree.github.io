import { MDXRemote } from 'next-mdx-remote/rsc'
import { UniverseHero } from '@/components/universe/UniverseHero'
import { UniverseClient } from '@/components/universe/UniverseClient'
import { getUniverseSubCases } from '@/lib/universes'
import { cn } from '@/lib/cn'

export const dynamic = 'force-static'

export default function AllianzPage() {
  const subCases = getUniverseSubCases('allianz')

  return (
    <>
      <UniverseHero />

      <UniverseClient subCases={subCases} />

      <main id="main-content">
        {subCases.map(sc => (
          <div key={sc.slug} id={sc.slug}>
            <SubCaseServer subCase={sc} />
          </div>
        ))}
      </main>

      {/* Footer nav */}
      <footer
        className={cn(
          'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
          'py-16 md:py-24',
          'border-t border-[var(--border)]'
        )}
      >
        <p
          className={cn(
            'font-mono text-[var(--type-xs)] tracking-widest uppercase',
            'text-[var(--fg-muted)] opacity-60'
          )}
        >
          Allianz Technology · 2024–2025
        </p>
      </footer>
    </>
  )
}

// Server component that renders MDX for each sub-case
async function SubCaseServer({
  subCase,
}: {
  subCase: ReturnType<typeof getUniverseSubCases>[number]
}) {
  return (
    <article
      className={cn(
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'py-20 md:py-28',
        'border-b border-[var(--border)] last:border-b-0'
      )}
    >
      {/* Case header */}
      <div className="mb-8 max-w-[80rem]">
        <p
          className={cn(
            'font-mono text-[var(--type-xs)] tracking-widest uppercase mb-3',
            'text-[var(--accent-text)]'
          )}
        >
          {subCase.tags.slice(0, 2).join(' · ')}
        </p>
        <h2
          className={cn(
            'font-display font-normal',
            'text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] tracking-[-0.032em]',
            'text-[var(--fg)] mb-3'
          )}
        >
          {subCase.title}
        </h2>
        <p
          className={cn(
            'text-[var(--type-base)] leading-[1.6] tracking-[-0.011em]',
            'text-[var(--fg-muted)]',
            'max-w-[56ch]'
          )}
        >
          {subCase.tagline}
        </p>
      </div>

      {/* Screen image */}
      <ScreenImage slug={subCase.slug} title={subCase.title} />

      {/* MDX content */}
      <div className="max-w-[var(--max-reading)] prose-sub-case">
        <MDXRemote source={subCase.content} />
      </div>
    </article>
  )
}

function ScreenImage({ slug, title }: { slug: string; title: string }) {
  const SCREENS: Record<string, string> = {
    'document-classification': '/projects/allianz/screen-doc-classification.svg',
    'prompt-management':       '/projects/allianz/screen-prompt-management.svg',
    'fallback-states':         '/projects/allianz/screen-fallback-states.svg',
  }

  const src = SCREENS[slug]
  if (!src) return null

  return (
    <div
      className={cn(
        'relative w-full max-w-[80rem] mb-10',
        'rounded-[var(--radius-xl)] overflow-hidden',
        'border border-[var(--border)]',
        'bg-[var(--bg-elevated)]'
      )}
      style={{ aspectRatio: '3/2' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${title} interface`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  )
}
