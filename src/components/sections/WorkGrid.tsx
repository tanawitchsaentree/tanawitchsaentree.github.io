'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'
import { ProjectRow } from '@/components/project/ProjectRow'
import { CyclingIndex } from '@/components/project/CyclingIndex'

// ── Side project data ─────────────────────────────────────────────────────────
const SIDE_PROJECTS = [
  {
    slug:    'manabi',
    name:    'Manabi',
    tagline: 'School finder & comparison for Thai families.',
    tags:    ['EdTech', 'Consumer', 'Mobile'],
    year:    '2025',
    status:  'In progress',
    href:    null as string | null,
  },
]

// ── Tab switch ────────────────────────────────────────────────────────────────
type Tab = 'work' | 'side'

function TabSwitch({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex items-center gap-5">
      {(['work', 'side'] as Tab[]).map(tab => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
            'bg-transparent border-none p-0 cursor-pointer',
            'transition-colors duration-[220ms] ease-out',
            active === tab
              ? 'text-[var(--fg)]'
              : 'text-[var(--fg-subtle)] hover:text-[var(--fg-muted)]'
          )}
        >
          {tab === 'work' ? 'Selected work' : 'Side projects'}
        </button>
      ))}
    </div>
  )
}

// ── Side project row ──────────────────────────────────────────────────────────
function SideProjectRow({ project, index }: { project: typeof SIDE_PROJECTS[number]; index: number }) {
  const [hovered, setHovered] = useState(false)

  const inner = (
    <div
      className={cn(
        'flex items-baseline justify-between gap-6',
        'py-4 md:py-5 px-4 rounded-xl -mx-4',
        'transition-colors duration-[220ms] ease-out',
        hovered ? 'bg-[var(--bg-elevated)]' : 'bg-transparent',
        project.href ? 'cursor-pointer' : 'cursor-default'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
            {String(index + 1).padStart(2, '0')} / {String(SIDE_PROJECTS.length).padStart(2, '0')}
          </span>
          <span className="flex-1 h-px bg-[var(--border)] opacity-40" aria-hidden="true" />
          <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)]">
            {project.year}
          </span>
        </div>

        <span className={cn(
          'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
          'transition-colors duration-[220ms]',
          hovered ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'
        )}>
          {project.name}
        </span>

        <h3 className={cn(
          'font-display font-normal leading-[1.05] tracking-[-0.028em]',
          'text-[clamp(1.2rem,3vw,2.75rem)]',
          'text-[var(--fg)]'
        )}>
          {project.tagline}
        </h3>

        <p className="text-[var(--type-sm)] text-[var(--fg-muted)] leading-[1.5]">
          {project.tags.join(' · ')}
          <span className={cn(
            'ml-4 font-mono text-[var(--type-xs)] uppercase tracking-[0.08em]',
            'text-[var(--fg-subtle)]'
          )}>
            {project.status}
          </span>
        </p>
      </div>

      {project.href && (
        <span className={cn(
          'font-mono text-[var(--type-xs)] transition-opacity duration-[220ms]',
          hovered ? 'opacity-60' : 'opacity-0'
        )} aria-hidden="true">↗</span>
      )}
    </div>
  )

  return project.href ? (
    <a href={project.href} target="_blank" rel="noopener noreferrer" className="block no-underline">
      {inner}
    </a>
  ) : <div>{inner}</div>
}

// ── Main export ───────────────────────────────────────────────────────────────
interface WorkGridProps {
  projects: ProjectFrontmatter[]
  onOpenProject: (slug: string) => void
  onNavigate: (href: string) => void
}

export function WorkGrid({ projects, onOpenProject, onNavigate }: WorkGridProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)
  const [showAll, setShowAll]         = useState(false)
  const [tab, setTab]                 = useState<Tab>('work')

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
      className={cn('py-14 md:py-20', 'px-8 md:px-12 lg:px-16')}
    >
      {/* Tab switch */}
      <div className="mb-8">
        <TabSwitch active={tab} onChange={t => { setTab(t); setShowAll(false) }} />
      </div>

      <AnimatePresence mode="wait">
        {tab === 'work' ? (
          <motion.div
            key="work"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <CyclingIndex projects={visible} pausedSlug={hoveredSlug} />

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
              <div className="mt-6">
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
                  {showAll ? 'Show less' : `+ ${secondary.length} more`}
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="side"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="list-none m-0 p-0" aria-label="Side projects">
              {SIDE_PROJECTS.map((p, i) => (
                <li key={p.slug} className="list-none">
                  <SideProjectRow project={p} index={i} />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
