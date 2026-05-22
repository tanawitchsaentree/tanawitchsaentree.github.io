'use client'

import { useCallback, useState } from 'react'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'
import { ProjectRow } from '@/components/project/ProjectRow'
import { CyclingIndex } from '@/components/project/CyclingIndex'

interface WorkGridProps {
  projects: ProjectFrontmatter[]
  onOpenProject: (slug: string) => void
  onNavigate: (href: string) => void
}

export function WorkGrid({ projects, onOpenProject, onNavigate }: WorkGridProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const handleHoverChange = useCallback((slug: string | null) => {
    setHoveredSlug(slug)
  }, [])

  const highlighted = projects.filter(p => p.highlight !== false)
  const secondary   = projects.filter(p => p.highlight === false)
  const visible     = showAll ? projects : highlighted

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className={cn(
        'pt-14 pb-8 md:pt-16 md:pb-10',
        'px-8 md:px-12 lg:px-16'
      )}
    >
      <h2
        id="work-heading"
        className={cn(
          'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
          'text-[var(--fg-subtle)] mb-10 md:mb-12'
        )}
      >
        Selected work
      </h2>

      <CyclingIndex projects={visible} pausedSlug={hoveredSlug} />

      <div className="border-t border-[var(--border)]" aria-hidden="true" />

      <ul className="list-none m-0 p-0" aria-label="Portfolio projects">
        {visible.map((project, i) => (
          <ProjectRow
            key={project.slug}
            project={project}
            index={i}
            total={visible.length}
            isHighlighted={project.highlight !== false}
            onOpen={onOpenProject}
            onNavigate={onNavigate}
            onHoverChange={handleHoverChange}
          />
        ))}
      </ul>

      {secondary.length > 0 && (
        <div className="mt-2 border-t border-[var(--border)] pt-6">
          <button
            type="button"
            onClick={() => setShowAll(v => !v)}
            className={cn(
              'flex items-center gap-3 cursor-pointer',
              'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
              'text-[var(--fg-subtle)] hover:text-[var(--fg-muted)]',
              'transition-colors duration-[240ms] ease-out',
              'bg-transparent border-none p-0'
            )}
          >
            <span
              className={cn(
                'inline-block h-px bg-current transition-all duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                showAll ? 'w-6' : 'w-2'
              )}
              aria-hidden="true"
            />
            {showAll ? 'Show less' : `+ ${secondary.length} more projects`}
          </button>
        </div>
      )}
    </section>
  )
}
