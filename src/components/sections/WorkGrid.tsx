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

  const handleHoverChange = useCallback((slug: string | null) => {
    setHoveredSlug(slug)
  }, [])

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className={cn(
        'py-24 md:py-32',
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]'
      )}
    >
      <h2
        id="work-heading"
        className={cn(
          'font-display font-normal',
          'text-[var(--type-2xl)] tracking-[-0.024em]',
          'text-[var(--fg)] mb-12 md:mb-16'
        )}
      >
        Selected work
      </h2>

      <CyclingIndex projects={projects} pausedSlug={hoveredSlug} />

      {/* Border-top before first row */}
      <div className="border-t border-[var(--border)]" aria-hidden="true" />

      <ul
        className="list-none m-0 p-0"
        aria-label="Portfolio projects"
      >
        {projects.map((project, i) => (
          <ProjectRow
            key={project.slug}
            project={project}
            index={i}
            total={projects.length}
            onOpen={onOpenProject}
            onNavigate={onNavigate}
            onHoverChange={handleHoverChange}
          />
        ))}
      </ul>
    </section>
  )
}
