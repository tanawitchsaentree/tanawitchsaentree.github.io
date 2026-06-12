'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WorkGrid } from '@/components/sections/WorkGrid'
import { About } from '@/components/sections/About'
import { Process } from '@/components/sections/Process'
import { Contact } from '@/components/sections/Contact'
import { ProjectModal } from '@/components/project/ProjectModal'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ParticleName } from '@/components/ui/ParticleName'
import { SDFMark } from '@/components/ui/SDFMark'
import { FrameDeck } from '@/components/ui/FrameDeck'
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

function Identity() {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      {/* 3D raymarched mark — the masthead sculpture */}
      <SDFMark size={180} className="mb-1" />

      {/* Name — the one deliberate "big" moment: rendered as ink particles
          that assemble on load and ripple under the cursor. */}
      <div className="flex flex-col items-center gap-3">
        <p className={cn(
          'font-mono text-[var(--type-xs)] uppercase tracking-[0.18em]',
          'text-[var(--fg-subtle)]'
        )}>
          Portfolio
        </p>
        <h1 className="font-display font-medium text-[var(--fg)] leading-none">
          <ParticleName text="Tanawitch Saentree" height={96} />
        </h1>
      </div>

      {/* Body — all one quiet size */}
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-[var(--type-sm)] leading-[1.6] text-[var(--fg-muted)]">
          Designer for regulated systems.
        </p>
        <p className="text-[var(--type-sm)] leading-[1.6] text-[var(--fg-muted)] whitespace-nowrap">
          Senior Designer at{' '}
          <span style={{
            background:    'var(--accent)',
            color:         'var(--accent-fg)',
            paddingInline: '0.25em',
            paddingBlock:  '0.05em',
            borderRadius:  '2px',
            whiteSpace:    'nowrap',
          }}>Allianz Technology</span>.
        </p>
      </div>

      {/* Sector tags */}
      <p className={cn(
        'font-mono text-[var(--type-xs)] uppercase tracking-[0.14em]',
        'text-[var(--fg-subtle)]'
      )}>
        Insurance · Healthcare · Fintech
      </p>

      {/* Social links */}
      <div className="flex items-center justify-center gap-5">
        {[
          { label: 'LinkedIn', href: 'https://linkedin.com/in/tanawitchsaentree' },
          { label: 'Behance',  href: 'https://behance.net/tanawitchsaentree' },
          { label: 'GitHub',   href: 'https://github.com/tanawitchsaentree' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
              'text-[var(--fg-subtle)] hover:text-[var(--fg)]',
              'transition-colors duration-[200ms]'
            )}
          >
            {label}
          </a>
        ))}
      </div>
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

  // Each frame centers a column; tall frames (Work/About/Process) scroll inside.
  const frameClass = 'min-h-svh w-full mx-auto max-w-[34rem] px-6 flex flex-col items-center justify-center py-20'

  return (
    <>
      <FrameDeck labels={['Intro', 'Work', 'About', 'Process', 'Contact']}>

        {/* Frame 0 — Identity */}
        <header aria-label="Site identity" className={cn(frameClass, 'gap-10')}>
          <Identity />
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              'font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]',
              'tracking-[0.14em] uppercase flex items-center gap-3'
            )}>
              <span>Bangkok</span>
              <span aria-hidden="true">·</span>
              <span>GMT+7</span>
              <span aria-hidden="true">·</span>
              <LiveTime />
            </div>
            <ThemeToggle />
          </div>
          <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)] animate-scroll-hint">
            scroll ↓
          </p>
        </header>

        {/* Frame 1 — Work */}
        <div ref={rightRef} id="main-content" tabIndex={-1} className={frameClass}>
          <WorkGrid
            projects={projects}
            onOpenProject={openProject}
            onNavigate={navigateWithTransition}
          />
        </div>

        {/* Frame 2 — About */}
        <div className={frameClass}><About /></div>

        {/* Frame 3 — Process */}
        <div className={frameClass}><Process /></div>

        {/* Frame 4 — Contact */}
        <div className={frameClass}><Contact /></div>

      </FrameDeck>

      <ProjectModal
        project={activeProject}
        content={modalContent}
        onClose={closeProject}
      />
    </>
  )
}
