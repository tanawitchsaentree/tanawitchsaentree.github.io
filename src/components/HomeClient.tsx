'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { WorkGrid } from '@/components/sections/WorkGrid'
import { About } from '@/components/sections/About'
import { Process } from '@/components/sections/Process'
import { Contact } from '@/components/sections/Contact'
import { ProjectModal } from '@/components/project/ProjectModal'
import { PortalNav, type Door } from '@/components/PortalNav'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'

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
        className="font-sans text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)] hover:text-[var(--fg)] bg-transparent border-none cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)] inline-flex items-center gap-2"
      >
        <span aria-hidden="true">←</span> Back
      </button>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
interface HomeClientProps { projects: ProjectFrontmatter[] }

export function HomeClient({ projects }: HomeClientProps) {
  const router = useRouter()
  const [activeSlug, setActiveSlug]     = useState<string | null>(null)
  const [modalContent, setModalContent] = useState<string | null>(null)
  const [view, setView]                 = useState<View>('home')

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
  const goHome = useCallback(() => setView('home'), [])

  return (
    <>
      <main id="main-content" tabIndex={-1}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: EASE_DECISIVE }}
          >
            {view === 'home' && <PortalNav onEnter={setView} />}

            {view === 'work' && (
              <div className="w-full min-h-[100svh] flex flex-col justify-center">
                <WorkGrid
                  projects={projects}
                  onOpenProject={openProject}
                  onNavigate={navigateWithTransition}
                />
                <BackHome onBack={goHome} />
              </div>
            )}

            {view === 'about' && (
              <div className={PANEL}>
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

      <ProjectModal project={activeProject} content={modalContent} onClose={closeProject} />
    </>
  )
}
