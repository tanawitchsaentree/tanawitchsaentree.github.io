import { MDXRemote } from 'next-mdx-remote/rsc'
import { UniverseHero } from '@/components/universe/UniverseHero'
import { UniverseClient } from '@/components/universe/UniverseClient'
import { SubCase } from '@/components/universe/SubCase'
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
          'border-t border-[var(--universe-border)]'
        )}
      >
        <p
          className={cn(
            'font-mono text-[var(--type-xs)] tracking-widest uppercase',
            'text-[var(--universe-fg-2)] opacity-60'
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
        'py-12 md:py-16',
        'border-b border-[var(--universe-border)] last:border-b-0'
      )}
    >
      {/* Case header */}
      <div className="mb-8 max-w-[80rem]">
        <p
          className={cn(
            'font-mono text-[var(--type-xs)] tracking-widest uppercase mb-3',
            'text-[var(--universe-accent)]'
          )}
        >
          {subCase.tags.slice(0, 2).join(' · ')}
        </p>
        <h2
          className={cn(
            'font-display font-normal',
            'text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] tracking-[-0.032em]',
            'text-[var(--universe-fg)] mb-3'
          )}
        >
          {subCase.title}
        </h2>
        <p
          className={cn(
            'text-[var(--type-base)] leading-[1.6] tracking-[-0.011em]',
            'text-[var(--universe-fg-2)]',
            'max-w-[56ch]'
          )}
        >
          {subCase.tagline}
        </p>
      </div>

      {/* Screen image */}
      <ScreenImage slug={subCase.slug} title={subCase.title} />

      {/* MDX content */}
      <div
        className={cn(
          'max-w-[var(--max-reading)]',
          '[&_h2]:font-display [&_h2]:font-normal [&_h2]:text-[var(--type-xl)]',
          '[&_h2]:leading-[1.2] [&_h2]:tracking-[-0.02em]',
          '[&_h2]:text-[var(--universe-fg)] [&_h2]:mt-10 [&_h2]:mb-4',
          '[&_h3]:font-sans [&_h3]:font-medium [&_h3]:text-[var(--type-base)]',
          '[&_h3]:text-[var(--universe-fg)] [&_h3]:mt-8 [&_h3]:mb-3',
          '[&_p]:text-[var(--type-base)] [&_p]:leading-[1.75]',
          '[&_p]:text-[var(--universe-fg-2)] [&_p]:mb-5',
          '[&_strong]:text-[var(--universe-fg)] [&_strong]:font-medium',
          '[&_ul]:list-none [&_ul]:p-0 [&_ul]:m-0 [&_ul]:mb-5',
          '[&_li]:relative [&_li]:pl-4 [&_li]:mb-2',
          '[&_li]:text-[var(--universe-fg-2)] [&_li]:text-[var(--type-base)] [&_li]:leading-[1.75]',
          '[&_li]:before:content-["—"] [&_li]:before:absolute [&_li]:before:left-0',
          '[&_li]:before:text-[var(--universe-accent)] [&_li]:before:font-mono'
        )}
      >
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
        'border border-[var(--universe-border)]',
        'bg-[var(--universe-surface)]'
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
