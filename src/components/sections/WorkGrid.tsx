'use client'

import { useRef, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'
import { GenerativeCover, type CoverVariant } from '@/components/project/GenerativeCover'

interface WorkGridProps {
  projects: ProjectFrontmatter[]
  onOpenProject: (slug: string) => void
  onNavigate: (href: string) => void
}

// Routes that open a dedicated universe page; the rest open the modal.
const UNIVERSE_SLUGS: Record<string, string> = {
  'allianz-doc-classification': '/projects/allianz',
  'invitrace-design-system':    '/projects/invitrace',
  'profita-mutual-fund':        '/projects/profita',
  'stellareat':                 '/projects/stellareat',
}

// Password-gated case studies.
const LOCKED = new Set(['allianz-doc-classification', 'invitrace-design-system'])

const EASE = [0.16, 1, 0.3, 1] as const

function LockGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="inline-block shrink-0 translate-y-[-1px]">
      <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function WorkCard({ project, index, onOpen, onNavigate }: {
  project: ProjectFrontmatter
  index: number
  onOpen: (slug: string) => void
  onNavigate: (href: string) => void
}) {
  const reduced = useReducedMotion()
  const universePath = UNIVERSE_SLUGS[project.slug]
  const locked = LOCKED.has(project.slug)

  const handleClick = useCallback(() => {
    if (universePath) onNavigate(universePath)
    else onOpen(project.slug)
  }, [universePath, onNavigate, onOpen, project.slug])

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.5, delay: (index % 2) * 0.06, ease: EASE }}
      className="group flex items-stretch gap-6 text-left bg-transparent border-none cursor-pointer p-0 w-[clamp(380px,42vw,520px)] shrink-0"
      aria-label={`${project.title}${locked ? ' (password-protected)' : ''} — ${project.tags.slice(0, 2).join(', ')}`}
    >
      {/* thumbnail — generative cover on the project's colour */}
      <div
        className="relative shrink-0 w-[clamp(140px,15vw,180px)] aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] transition-[border-color] duration-[var(--duration-base)] ease-[var(--ease-out-quick)] group-hover:border-[var(--fg-subtle)]"
        style={{ background: project.coverColor }}
      >
        {project.coverVariant && (
          <GenerativeCover variant={project.coverVariant as CoverVariant} className="absolute inset-0 w-full h-full" />
        )}
      </div>

      {/* meta — title + lock + description */}
      <div className="flex flex-col justify-center gap-2 min-w-0 pt-1">
        <h3 className="font-display font-medium text-[var(--type-lg)] leading-[1.25] text-[var(--fg)] flex items-center gap-2">
          <span className="truncate">{project.title}</span>
          {locked && <span className="text-[var(--fg-subtle)]"><LockGlyph /></span>}
        </h3>
        <p className="text-[var(--type-base)] leading-[1.6] text-[var(--fg-muted)] max-w-[34ch] line-clamp-3">
          {project.summary}
        </p>
        <span className="font-sans text-[var(--type-xs)] uppercase tracking-[0.12em] text-[var(--fg-subtle)] mt-1 inline-flex items-center gap-1.5 opacity-0 -translate-x-1 transition-[opacity,transform] duration-[var(--duration-base)] ease-[var(--ease-out-quick)] group-hover:opacity-100 group-hover:translate-x-0">
          {locked ? 'Enter password' : 'View case'} →
        </span>
      </div>
    </motion.button>
  )
}

export function WorkGrid({ projects, onOpenProject, onNavigate }: WorkGridProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const visible = projects.filter(p => p.inGrid !== false).sort((a, b) => a.order - b.order)

  // translate vertical wheel into horizontal scroll over the rail
  const onWheel = useCallback((e: React.WheelEvent) => {
    const el = railRef.current
    if (!el) return
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    const max = el.scrollWidth - el.clientWidth
    if (max <= 0) return
    // only hijack if we can still scroll in that direction (lets the page move at the ends)
    const atStart = el.scrollLeft <= 0 && e.deltaY < 0
    const atEnd   = el.scrollLeft >= max - 1 && e.deltaY > 0
    if (atStart || atEnd) return
    e.preventDefault()
    el.scrollLeft += e.deltaY
  }, [])

  return (
    <section id="work" aria-label="Selected work" className="w-full">
      {/* eyebrow */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-[7.5rem] pt-8 pb-10">
        <p className="font-sans text-[var(--type-xs)] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          Selected work · {visible.length} projects
        </p>
      </div>

      {/* horizontal rail — two rows, scrolls sideways */}
      <div
        ref={railRef}
        onWheel={onWheel}
        className="work-rail overflow-x-auto overflow-y-hidden scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        <div
          className="grid grid-rows-2 grid-flow-col auto-cols-max gap-x-12 gap-y-10 w-max px-6 md:px-12 lg:px-20 xl:px-[7.5rem] pb-2"
        >
          {visible.map((project, i) => (
            <WorkCard
              key={project.slug}
              project={project}
              index={i}
              onOpen={onOpenProject}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>

      {/* scroll affordance */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-[7.5rem] pt-6">
        <p className="font-sans text-[var(--type-xs)] uppercase tracking-[0.12em] text-[var(--fg-subtle)]">
          Scroll sideways →
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.work-rail::-webkit-scrollbar{display:none}` }} />
    </section>
  )
}
