'use client'

import { useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'
import { GenerativeCover, type CoverVariant } from '@/components/project/GenerativeCover'

type Tab = 'work' | 'build'

const BUILD_PROJECTS = [
  {
    slug:        'tims-pos',
    path:        '/projects/tims',
    title:       'Forty Seconds — Tims POS',
    summary:     'A weekend concept built from two years behind the Tim Hortons counter. Redesigned the POS terminal to survive a real 5 a.m. rush.',
    tags:        ['POS', 'iPad', 'Concept', 'Front-end'],
    coverColor:  '#da291c',
    coverImage:  '/images/work-cover/tims-pos.png',
    year:        '2026',
  },
] as const

const TABS: { id: Tab; label: string }[] = [
  { id: 'work',  label: 'Selected work'                             },
  { id: 'build', label: `Weekend build(${BUILD_PROJECTS.length})`  },
]

interface WorkGridProps {
  projects: ProjectFrontmatter[]
  onOpenProject: (slug: string) => void
  onNavigate: (href: string) => void
}

const UNIVERSE_SLUGS: Record<string, string> = {
  'allianz-doc-classification': '/projects/allianz',
  'invitrace-design-system':    '/projects/invitrace',
  'profita-mutual-fund':        '/projects/profita',
  'stellareat':                 '/projects/stellareat',
  'vitae':                      '/projects/vitae',
}

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
      whileTap={reduced ? {} : { scale: 0.97 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.5, delay: (index % 2) * 0.06, ease: EASE }}
      className="group flex items-stretch gap-6 text-left bg-transparent border-none cursor-pointer p-0 w-[clamp(380px,42vw,520px)] shrink-0"
      aria-label={`${project.title}${locked ? ' (password-protected)' : ''} — ${project.tags.slice(0, 2).join(', ')}`}
    >
      <div
        className="relative shrink-0 w-[clamp(140px,15vw,180px)] aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out-quick)] group-hover:border-[var(--fg-subtle)] group-hover:shadow-[0_8px_32px_-8px_color-mix(in_srgb,var(--fg)_18%,transparent)]"
        style={{ background: project.coverColor }}
      >
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt=""
            fill
            className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            sizes="180px"
          />
        ) : project.coverVariant ? (
          <GenerativeCover variant={project.coverVariant as CoverVariant} className="absolute inset-0 w-full h-full" />
        ) : null}
      </div>

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

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const reduced = useReducedMotion()
  return (
    <div role="tablist" aria-label="Work sections" className="flex items-center gap-0">
      {TABS.map(tab => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative font-sans text-[var(--type-sm)] pb-[0.6rem] pr-8 bg-transparent border-none cursor-pointer transition-colors',
              'duration-[var(--duration-base)] ease-[var(--ease-out-quick)]',
              'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] rounded-[2px]',
              isActive
                ? 'text-[var(--fg)] font-medium'
                : 'text-[var(--fg-subtle)] hover:text-[var(--fg-muted)]',
            )}
          >
            {tab.label}
            {isActive && (
              <motion.span
                layoutId="work-tab-indicator"
                transition={reduced ? { duration: 0 } : { duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-0 left-0 right-8 h-[2px] bg-[var(--accent)] rounded-full"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

function BuildPanel({ onNavigate }: { onNavigate: (href: string) => void }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      key="build"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 xl:px-[7.5rem]"
    >
      <div className="flex flex-col gap-8">
        {BUILD_PROJECTS.map((p, i) => (
          <motion.button
            key={p.slug}
            type="button"
            onClick={() => onNavigate(p.path)}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="group flex items-stretch gap-6 text-left bg-transparent border-none cursor-pointer p-0 w-full max-w-[520px]"
            aria-label={`${p.title} — ${p.tags.slice(0, 2).join(', ')}`}
          >
            <div
              className="relative shrink-0 w-[clamp(140px,15vw,180px)] aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] transition-[border-color] duration-[var(--duration-base)] ease-[var(--ease-out-quick)] group-hover:border-[var(--fg-subtle)]"
              style={{ background: p.coverColor }}
            >
              {p.coverImage && (
                <Image src={p.coverImage} alt="" fill className="object-cover" sizes="180px" />
              )}
            </div>
            <div className="flex flex-col justify-center gap-2 min-w-0 pt-1">
              <span className="font-sans text-[var(--type-xs)] uppercase tracking-[0.12em] text-[var(--fg-subtle)]">{p.year}</span>
              <h3 className="font-display font-medium text-[var(--type-lg)] leading-[1.25] text-[var(--fg)]">
                {p.title}
              </h3>
              <p className="text-[var(--type-base)] leading-[1.6] text-[var(--fg-muted)] max-w-[34ch] line-clamp-3">
                {p.summary}
              </p>
              <span className="font-sans text-[var(--type-xs)] uppercase tracking-[0.12em] text-[var(--fg-subtle)] mt-1 inline-flex items-center gap-1.5 opacity-0 -translate-x-1 transition-[opacity,transform] duration-[var(--duration-base)] ease-[var(--ease-out-quick)] group-hover:opacity-100 group-hover:translate-x-0">
                View case →
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export function WorkGrid({ projects, onOpenProject, onNavigate }: WorkGridProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<Tab>('work')
  const visible = projects.filter(p => p.inGrid !== false).sort((a, b) => a.order - b.order)

  const onWheel = useCallback((e: React.WheelEvent) => {
    const el = railRef.current
    if (!el) return
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    const max = el.scrollWidth - el.clientWidth
    if (max <= 0) return
    const atStart = el.scrollLeft <= 0 && e.deltaY < 0
    const atEnd   = el.scrollLeft >= max - 1 && e.deltaY > 0
    if (atStart || atEnd) return
    e.preventDefault()
    el.scrollLeft += e.deltaY
  }, [])

  return (
    <section id="work" aria-label="Selected work" className="w-full flex-1 flex flex-col">
      {/* tab bar */}
      <div className="flex justify-center pt-8 pb-0">
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>

      {/* panel content */}
      <AnimatePresence mode="wait" initial={false}>
        {activeTab === 'work' ? (
          <motion.div
            key="work"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col justify-center"
          >
            <div
              ref={railRef}
              onWheel={onWheel}
              className="work-rail overflow-x-auto overflow-y-hidden scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              <div className="grid grid-rows-2 grid-flow-col auto-cols-max gap-x-12 gap-y-10 w-max px-6 md:px-12 lg:px-20 xl:px-[7.5rem] py-4">
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
          </motion.div>
        ) : (
          <BuildPanel onNavigate={onNavigate} />
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `.work-rail::-webkit-scrollbar{display:none}` }} />
    </section>
  )
}
