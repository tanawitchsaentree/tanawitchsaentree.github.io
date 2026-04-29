import Image from 'next/image'
import { cn } from '@/lib/cn'
import type { SubCaseFrontmatter } from '@/lib/universes'

const SCREENS: Record<string, string> = {
  'document-classification': '/projects/allianz/screen-doc-classification.svg',
  'prompt-management':       '/projects/allianz/screen-prompt-management.svg',
  'fallback-states':         '/projects/allianz/screen-fallback-states.svg',
}

interface SubCaseProps {
  subCase: SubCaseFrontmatter & { content: string }
  contentHtml: string
}

export function SubCase({ subCase, contentHtml }: SubCaseProps) {
  const screenSrc = SCREENS[subCase.slug]

  return (
    <article
      id={subCase.slug}
      className={cn(
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'py-12 md:py-16'
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

      {/* Screen */}
      {screenSrc && (
        <div
          className={cn(
            'relative w-full max-w-[80rem] mb-10',
            'rounded-[var(--radius-xl)] overflow-hidden',
            'border border-[var(--universe-border)]',
            'bg-[var(--universe-surface)]'
          )}
          style={{ aspectRatio: '3/2' }}
        >
          <Image
            src={screenSrc}
            alt={`${subCase.title} interface`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 85vw, 1080px"
          />
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          'max-w-[var(--max-reading)]',
          'prose-sub-case'
        )}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  )
}
