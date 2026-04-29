'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Nav } from '@/components/layout/Nav'
import { Hero } from '@/components/sections/Hero'
import { WorkGrid } from '@/components/sections/WorkGrid'
import { About } from '@/components/sections/About'
import { Process } from '@/components/sections/Process'
import { Contact } from '@/components/sections/Contact'
import { ProjectModal } from '@/components/project/ProjectModal'
import type { ProjectFrontmatter } from '@/types/project'

interface HomeClientProps {
  projects: ProjectFrontmatter[]
}

export function HomeClient({ projects }: HomeClientProps) {
  const router = useRouter()
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [modalContent, setModalContent] = useState<string | null>(null)

  // ── URL sync — read ?project= on mount and on popstate ─────────
  useEffect(() => {
    function readUrl() {
      const params = new URLSearchParams(window.location.search)
      setActiveSlug(params.get('project'))
    }
    readUrl()
    window.addEventListener('popstate', readUrl)
    return () => window.removeEventListener('popstate', readUrl)
  }, [])

  // ── Open project — update URL + fetch MDX content ──────────────
  const openProject = useCallback(async (slug: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('project', slug)
    window.history.pushState({ project: slug }, '', url.toString())
    setActiveSlug(slug)
    setModalContent(null)
    setModalContent('')
  }, [])

  // ── Close project — clean URL ───────────────────────────────────
  const closeProject = useCallback(() => {
    window.history.pushState({}, '', window.location.pathname)
    setActiveSlug(null)
    setModalContent(null)
  }, [])

  // ── Universe navigation with View Transitions ───────────────────
  const navigateWithTransition = useCallback((href: string) => {
    const vt = document.startViewTransition
    if (vt) {
      vt.call(document, () => { router.push(href) })
    } else {
      router.push(href)
    }
  }, [router])

  const activeProject = activeSlug
    ? (projects.find(p => p.slug === activeSlug) ?? null)
    : null

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Nav />

      <main id="main-content">
        <Hero />
        <WorkGrid projects={projects} onOpenProject={openProject} onNavigate={navigateWithTransition} />
        <About />
        <Process />
        <Contact />
      </main>

      <ProjectModal
        project={activeProject}
        content={modalContent}
        onClose={closeProject}
      />
    </>
  )
}
