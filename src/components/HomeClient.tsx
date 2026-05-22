'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Nav } from '@/components/layout/Nav'
import { WorkGrid } from '@/components/sections/WorkGrid'
import { About } from '@/components/sections/About'
import { Process } from '@/components/sections/Process'
import { Contact } from '@/components/sections/Contact'
import { ProjectModal } from '@/components/project/ProjectModal'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'

// ── Live time ──────────────────────────────────────────────────
function LiveTime() {
  const [time, setTime] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    function update() {
      if (document.visibilityState === 'hidden') return
      setTime(new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }))
    }
    update()
    const id = setInterval(update, 60_000)
    document.addEventListener('visibilitychange', update)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', update) }
  }, [])

  if (!mounted) return null
  return <span>{time}</span>
}

// ── Section nav ────────────────────────────────────────────────
const SECTIONS = [
  { id: 'work',    label: 'Work'    },
  { id: 'about',   label: 'About'   },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
] as const

type SectionId = typeof SECTIONS[number]['id']

function LeftNav() {
  const [active, setActive] = useState<SectionId>('work')

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id as SectionId) }) },
      { root: null, rootMargin: '-40% 0px -55% 0px' }
    )
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
    setActive(id as SectionId)
  }

  return (
    <nav aria-label="Page sections">
      <ul className="list-none m-0 p-0 flex flex-col gap-1">
        {SECTIONS.map(({ id, label }) => {
          const isActive = active === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => scrollTo(id)}
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  'flex items-center gap-3 py-1.5 cursor-pointer w-full text-left',
                  'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
                  'transition-colors duration-[240ms] ease-out',
                  isActive ? 'text-[var(--fg)]' : 'text-[var(--fg-subtle)] hover:text-[var(--fg-muted)]'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-px transition-all duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                    'bg-current',
                    isActive ? 'w-6' : 'w-2'
                  )}
                  aria-hidden="true"
                />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function LeftIdentity() {
  return (
    <div className="flex flex-col gap-6">
      {/* Hierarchy 1 — Display: name */}
      <div>
        <p className={cn(
          'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
          'text-[var(--fg-subtle)] mb-3'
        )}>
          Portfolio
        </p>
        <h1
          className={cn(
            'font-display font-normal',
            'text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.02] tracking-[-0.036em]',
            'text-[var(--fg)]'
          )}
        >
          Tanawitch
          <br />
          Saentree
        </h1>
      </div>

      {/* Hierarchy 2 — Body: tagline + role + experience at same weight */}
      <div className="flex flex-col gap-2">
        <p className={cn(
          'text-[var(--type-sm)] leading-[1.5] tracking-[-0.005em]',
          'text-[var(--fg-muted)]'
        )}>
          Designer for regulated systems.
        </p>
        <p className={cn(
          'text-[var(--type-sm)] leading-[1.5] tracking-[-0.005em]',
          'text-[var(--fg-muted)]'
        )}>
          Senior Designer at{' '}
          <span style={{ color: 'var(--accent-text)' }}>Allianz Technology</span>.
        </p>
        <p className={cn(
          'text-[var(--type-sm)] leading-[1.5] tracking-[-0.005em]',
          'text-[var(--fg-muted)]'
        )}>
          8 years · Allianz · Invitrace · DoctorAnywhere
        </p>
      </div>

      {/* Hierarchy 3 — Mono small: sector tags */}
      <p className={cn(
        'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
        'text-[var(--fg-subtle)]'
      )}>
        Insurance · Healthcare · Fintech
      </p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
interface HomeClientProps {
  projects: ProjectFrontmatter[]
}

export function HomeClient({ projects }: HomeClientProps) {
  const router = useRouter()
  const rightRef = useRef<HTMLDivElement>(null)
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [modalContent, setModalContent] = useState<string | null>(null)

  useEffect(() => {
    function readUrl() {
      const params = new URLSearchParams(window.location.search)
      setActiveSlug(params.get('project'))
    }
    readUrl()
    window.addEventListener('popstate', readUrl)
    return () => window.removeEventListener('popstate', readUrl)
  }, [])

  const openProject = useCallback(async (slug: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('project', slug)
    window.history.pushState({ project: slug }, '', url.toString())
    setActiveSlug(slug)
    setModalContent(null)
    setModalContent('')
  }, [])

  const closeProject = useCallback(() => {
    window.history.pushState({}, '', window.location.pathname)
    setActiveSlug(null)
    setModalContent(null)
  }, [])

  const navigateWithTransition = useCallback((href: string) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as Document & { startViewTransition: (cb: () => void) => void })
        .startViewTransition(() => { router.push(href) })
    } else {
      router.push(href)
    }
  }, [router])

  const activeProject = activeSlug
    ? (projects.find(p => p.slug === activeSlug) ?? null)
    : null

  return (
    <>
      <Nav rightRef={rightRef} />

      <div className="split-layout">

        {/* ── LEFT PANEL ──────────────────────────────────────── */}
        <motion.aside
          className="split-left"
          aria-label="Site identity and navigation"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <LeftIdentity />

          {/* Section nav */}
          <LeftNav />

          {/* Bottom: time + theme */}
          <div className="flex flex-col gap-4">
            <div className={cn(
              'font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]',
              'tracking-widest uppercase flex items-center gap-3'
            )}>
              <span>Bangkok</span>
              <span aria-hidden="true">·</span>
              <span>GMT+7</span>
              <span aria-hidden="true">·</span>
              <LiveTime />
            </div>
            <ThemeToggle />
          </div>
        </motion.aside>

        {/* ── RIGHT PANEL ─────────────────────────────────────── */}
        <motion.div
          ref={rightRef}
          className="split-right"
          id="main-content"
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <WorkGrid
            projects={projects}
            onOpenProject={openProject}
            onNavigate={navigateWithTransition}
          />
          <About />
          <Process />
          <Contact />
        </motion.div>

      </div>

      <ProjectModal
        project={activeProject}
        content={modalContent}
        onClose={closeProject}
      />
    </>
  )
}
