'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'
import { ProjectRow } from '@/components/project/ProjectRow'
import { CyclingIndex } from '@/components/project/CyclingIndex'
import { MorphText } from '@/components/ui/MorphText'

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
            'transition-colors duration-[220ms] ease-[var(--ease-out-quick)]',
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
        'flex flex-col items-center gap-1.5 py-6 px-4',
        project.href ? 'cursor-pointer' : 'cursor-default'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={cn(
        'font-mono text-[var(--type-xs)] uppercase tracking-[0.14em]',
        'transition-colors duration-[220ms]',
        hovered ? 'text-[var(--fg-muted)]' : 'text-[var(--fg-subtle)]'
      )}>
        {project.name} · {project.year}
      </span>

      <h3 className="font-display font-medium text-[var(--type-base)] leading-[1.35] tracking-[0.005em] text-[var(--fg)] max-w-[34ch]">
        <MorphText text={project.tagline} active={hovered} />
      </h3>

      <p className="text-[var(--type-xs)] text-[var(--fg-subtle)] leading-[1.5]">
        {project.tags.join(' · ')} · {project.status}
        {project.href && <span aria-hidden="true"> ↗</span>}
      </p>
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
      className={cn('py-16 md:py-24', 'text-center')}
    >
      {/* Tab switch */}
      <div className="mb-10 flex justify-center">
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
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll(v => !v)}
                  className={cn(
                    'cursor-pointer',
                    'font-mono text-[var(--type-xs)] uppercase tracking-[0.14em]',
                    'text-[var(--fg-subtle)] hover:text-[var(--fg-muted)]',
                    'transition-colors duration-[240ms] ease-[var(--ease-out-quick)]',
                    'bg-transparent border-none p-0'
                  )}
                >
                  {showAll ? '— Show less' : `+ ${secondary.length} more`}
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
