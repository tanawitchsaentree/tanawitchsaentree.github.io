'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { WorkGrid } from '@/components/sections/WorkGrid'
import { About } from '@/components/sections/About'
import { Process } from '@/components/sections/Process'
import { Contact } from '@/components/sections/Contact'
import { ProjectModal } from '@/components/project/ProjectModal'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ParticleName } from '@/components/ui/ParticleName'
import { SDFMark } from '@/components/ui/SDFMark'
import { MorphParticles } from '@/components/ui/MorphParticles'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'

// ── Spacing contract ───────────────────────────────────────────
// panelClass / panelClassWide own ONLY width + horizontal padding.
// Each section owns its own vertical rhythm via py-* internally.
// This prevents double-padding from stacking.
const PANEL      = 'w-full mx-auto max-w-[34rem] px-6'
const PANEL_WIDE = 'w-full mx-auto max-w-[72rem] px-6'

// ── Tabs ───────────────────────────────────────────────────────
type Tab = 'home' | 'work' | 'about' | 'contact'

const TABS: { id: Tab; label: string }[] = [
  { id: 'home',    label: 'Home' },
  { id: 'work',    label: 'Work' },
  { id: 'about',   label: 'About' },
  { id: 'contact', label: 'Contact' },
]

const TAB_SHAPE: Record<Tab, number> = {
  home: 0, work: 1, about: 2, contact: 3,
}

// ── Tab navigation ─────────────────────────────────────────────
function TabNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      aria-label="Site navigation"
      className="fixed top-0 inset-x-0 z-40 h-11 flex items-stretch justify-center bg-[var(--bg)] border-b border-[var(--border)]"
    >
      <ul className="flex items-stretch gap-8 list-none m-0 p-0" role="tablist">
        {TABS.map(tab => {
          const on = tab.id === active
          return (
            <li key={tab.id} className="relative flex items-stretch">
              <button
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'relative flex items-center h-full px-0',
                  'font-mono text-[var(--type-xs)] uppercase tracking-[0.14em]',
                  'bg-transparent border-none cursor-pointer',
                  'transition-colors duration-[220ms] ease-[var(--ease-out-quick)]',
                  on ? 'text-[var(--fg)]' : 'text-[var(--fg-subtle)] hover:text-[var(--fg-muted)]',
                )}
              >
                {tab.label}
              </button>

              {on && (
                <motion.span
                  layoutId="tab-caret"
                  className="absolute bottom-0 inset-x-0 h-[2px] bg-[var(--accent)]"
                  transition={{ duration: 0.38, ease: [0.65, 0, 0.35, 1] }}
                />
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

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
        hour: '2-digit', minute: '2-digit', hour12: false,
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

// ── Identity — Home tab content ────────────────────────────────
function Identity() {
  return (
    <div className="flex flex-col items-center text-center gap-12">

      {/* Mark + name block */}
      <div className="flex flex-col items-center gap-6">
        <SDFMark size={160} />

        <div className="flex flex-col items-center gap-4">
          <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
            Portfolio
          </p>
          <h1 className="font-display font-normal text-[var(--fg)] leading-none">
            <ParticleName text="Tanawitch Saentree" height={96} />
          </h1>
        </div>
      </div>

      {/* Role block */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-[var(--type-base)] leading-[1.5] text-[var(--fg-muted)]">
          Designer for regulated systems.
        </p>
        <p className="text-[var(--type-base)] leading-[1.5] text-[var(--fg-muted)]">
          Senior Designer at{' '}
          <span style={{
            background: 'var(--accent)', color: 'var(--accent-fg)',
            paddingInline: '0.3em', paddingBlock: '0.05em',
            borderRadius: '2px', whiteSpace: 'nowrap',
          }}>
            Allianz Technology
          </span>.
        </p>
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)] mt-1">
          Insurance · Healthcare · Fintech
        </p>
      </div>

      {/* Footer row — social + meta */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
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
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)] hover:text-[var(--fg)] no-underline transition-colors duration-[200ms] ease-[var(--ease-out-quick)]"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)] flex items-center gap-2">
            <span>Bangkok</span>
            <span aria-hidden="true">·</span>
            <span>GMT+7</span>
            <span aria-hidden="true">·</span>
            <LiveTime />
          </span>
          <ThemeToggle />
        </div>
      </div>

    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
interface HomeClientProps { projects: ProjectFrontmatter[] }

export function HomeClient({ projects }: HomeClientProps) {
  const router = useRouter()
  const [activeSlug, setActiveSlug]     = useState<string | null>(null)
  const [modalContent, setModalContent] = useState<string | null>(null)
  const [activeTab, setActiveTab]       = useState<Tab>('home')

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

  return (
    <>
      <div className="fixed inset-0 -z-[5] pointer-events-none flex items-center justify-center">
        <MorphParticles
          shapeIndex={TAB_SHAPE[activeTab]}
          className="w-[min(90vw,900px)] h-[min(90vh,900px)]"
        />
      </div>

      <TabNav active={activeTab} onChange={setActiveTab} />

      <main id="main-content" tabIndex={-1} className="pt-11">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >

            {/* Home — vertically centered */}
            {activeTab === 'home' && (
              <div className={cn(PANEL, 'min-h-[calc(100svh-44px)] flex flex-col items-center justify-center')}>
                <Identity />
              </div>
            )}

            {/* Work — wide grid */}
            {activeTab === 'work' && (
              <div className={PANEL_WIDE}>
                <WorkGrid
                  projects={projects}
                  onOpenProject={openProject}
                  onNavigate={navigateWithTransition}
                />
              </div>
            )}

            {/* About — About section + Process section, each own their padding */}
            {activeTab === 'about' && (
              <div className={PANEL}>
                <About />
                <Process />
              </div>
            )}

            {/* Contact — vertically centered */}
            {activeTab === 'contact' && (
              <div className={cn(PANEL, 'min-h-[calc(100svh-44px)] flex flex-col items-center justify-center')}>
                <Contact />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      <ProjectModal project={activeProject} content={modalContent} onClose={closeProject} />
    </>
  )
}
