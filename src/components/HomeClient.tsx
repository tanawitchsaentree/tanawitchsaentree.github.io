'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { PortalNav, type Door, type Phase } from '@/components/PortalNav'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'

// Sections live behind the portal doors — only loaded once a door is opened,
// so their JS (incl. GenerativeCover's canvas + lucide icons) stays off the
// homepage's first paint.
const WorkGrid = dynamic(() => import('@/components/sections/WorkGrid').then(m => m.WorkGrid))
const About    = dynamic(() => import('@/components/sections/About').then(m => m.About))
const Process  = dynamic(() => import('@/components/sections/Process').then(m => m.Process))
const Contact  = dynamic(() => import('@/components/sections/Contact').then(m => m.Contact))
const ProjectModal = dynamic(
  () => import('@/components/project/ProjectModal').then(m => m.ProjectModal),
  { ssr: false },
)

// ── Spacing contract ───────────────────────────────────────────
// PANEL owns ONLY width + horizontal padding.
// Each section owns its own vertical rhythm via py-* internally.
const PANEL = 'w-full mx-auto max-w-[34rem] px-6'

const EASE_DECISIVE = [0.16, 1, 0.3, 1] as const

// View = the portal landing, or one of the three sections behind a door.
type View = 'home' | Door

// ── Return-to-portal control — sits at the BOTTOM of each section ──
function BackHome({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full flex justify-center py-10">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="text-[var(--fg-subtle)] hover:text-[var(--fg)] bg-transparent border-none cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)] p-4 -m-4"
      >
        <span aria-hidden="true" className="font-mono text-base">←</span>
      </button>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
interface HomeClientProps { projects: ProjectFrontmatter[] }

export function HomeClient({ projects }: HomeClientProps) {
  const router = useRouter()
  const shouldReduce = useReducedMotion()
  const [activeSlug, setActiveSlug]     = useState<string | null>(null)
  const [modalContent, setModalContent] = useState<string | null>(null)
  const [view, setView]                 = useState<View>('home')
  // Lifted from PortalNav so phase survives navigating into a section and back.
  const [portalPhase, setPortalPhase]       = useState<Phase>('open')
  const [portalEverOpened, setPortalEverOpened] = useState(true)

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

  const activeProject = activeSlug ? (projects.find(p => p.slug === activeSlug) ?? null) : null
  const goHome = useCallback(() => {
    setView('home')
    // Restore the open/split state so the three doors are visible immediately
    setPortalPhase('open')
    setPortalEverOpened(true)
  }, [])

  return (
    <>
      <main id="main-content" tabIndex={-1}>
        {/* Stable page heading for SEO + screen readers — the visible greeting
            rotates every load, so it must NOT be the h1. */}
        <h1 className="sr-only">Tanawitch Saentree — Senior Product Designer</h1>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={shouldReduce ? {} : { opacity: 0, y: 8 }}
            animate={shouldReduce ? {} : { opacity: 1, y: 0 }}
            exit={shouldReduce ? {} : { opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: EASE_DECISIVE }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {view === 'home' && (
              <PortalNav
                onEnter={door => { setPortalPhase('open'); setView(door) }}
                phase={portalPhase}
                setPhase={setPortalPhase}
                everOpened={portalEverOpened}
                setEverOpened={setPortalEverOpened}
              />
            )}

            {view === 'work' && (
              <div className="w-full min-h-[100svh] flex flex-col isolate">
                <WorkGrid
                  projects={projects}
                  onOpenProject={openProject}
                  onNavigate={navigateWithTransition}
                />
                <BackHome onBack={goHome} />
              </div>
            )}

            {view === 'about' && (
              <div className="w-full mx-auto max-w-[60rem] px-6">
                <About />
                <Process />
                <BackHome onBack={goHome} />
              </div>
            )}

            {view === 'contact' && (
              <div className={cn(PANEL, 'min-h-[100svh] flex flex-col items-center justify-center')}>
                <Contact />
                <BackHome onBack={goHome} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {activeProject && (
        <ProjectModal project={activeProject} content={modalContent} onClose={closeProject} />
      )}
    </>
  )
}
