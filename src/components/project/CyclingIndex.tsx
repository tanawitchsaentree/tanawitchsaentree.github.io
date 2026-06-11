'use client'

import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'

interface CyclingIndexProps {
  projects: ProjectFrontmatter[]
  pausedSlug: string | null
}

/**
 * Index line above the work list. Deliberately STILL at rest — no auto-cycling.
 * It only reflects what the visitor is pointing at: default shows the count,
 * hovering a row reveals that project. Motion belongs to interaction, not idle.
 */
export function CyclingIndex({ projects, pausedSlug }: CyclingIndexProps) {
  const total = projects.length
  const hovered = pausedSlug
    ? projects.find(p => p.slug === pausedSlug) ?? null
    : null
  const hoveredIndex = hovered
    ? projects.findIndex(p => p.slug === hovered.slug)
    : -1

  return (
    <p
      className={cn(
        'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
        'flex items-center gap-3 mb-16 md:mb-20'
      )}
    >
      <span className="text-[var(--fg-subtle)]">[ Selected work ]</span>
      <span
        className={cn(
          'text-[var(--fg-muted)]',
          'transition-opacity duration-[320ms] ease-[var(--ease-out-quick)]',
          hovered ? 'opacity-100' : 'opacity-50'
        )}
      >
        {hovered
          ? `${String(hoveredIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')} — ${hovered.company.toUpperCase()}`
          : `${String(total).padStart(2, '0')} projects`}
      </span>
    </p>
  )
}
