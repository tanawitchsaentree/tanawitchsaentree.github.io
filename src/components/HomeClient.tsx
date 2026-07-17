'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { ProjectFrontmatter } from '@/types/project'
import { HomeProjectCard } from '@/components/sections/HomeProjectCard'

const ProjectModal = dynamic(
  () => import('@/components/project/ProjectModal').then(m => m.ProjectModal),
  { ssr: false },
)

// ── routing / data ────────────────────────────────────────────

const UNIVERSE_SLUGS: Record<string, string> = {
  'allianz-doc-classification': '/projects/allianz',
  'invitrace-design-system':    '/projects/invitrace',
  'profita-mutual-fund':        '/projects/profita',
  'stellareat':                 '/projects/stellareat',
  'vitae':                      '/projects/vitae',
  'tims-pos':                   '/projects/tims',
  'claims':                     '/projects/claims',
}

const LOCKED = new Set(['allianz-doc-classification', 'invitrace-design-system'])

const TIMS_PROJECT: ProjectFrontmatter = {
  slug:       'tims-pos',
  title:      'Terminal Velocity',
  company:    'Personal / Concept',
  year:       '2026',
  role:       'Design + Front-end Build',
  timeline:   'Capped at 3 iterations',
  team:       'Solo · weekends',
  tags:       ['POS', 'iPad', 'Drive-thru'],
  summary:    "Two years on the drive-thru line. One POS that fought back every shift. Built a version that doesn't.",
  coverColor: 'var(--cover-tims)',
  coverImage: '/images/work-cover/tims-pos.png',
  coverFg:    'light',
  order:      0,
  inGrid:     true,
  highlight:  true,
}

const WORK_HISTORY = [
  { year: '2025 →',  company: 'Allianz Technology', role: 'Senior Designer' },
  { year: '2024–25', company: 'Invitrace Health',    role: 'Lead Product Designer' },
  { year: '2024',    company: 'Stellareat',          role: 'Product Designer' },
  { year: '2020',    company: 'Robowealth',          role: 'Senior UX/UI Designer' },
] as const

// ── ProjectStack ──────────────────────────────────────────────
// title + tagline ด้านบนแต่ละ project แล้วตามด้วย animated card เดิม

interface StackProps {
  projects:      ProjectFrontmatter[]
  onOpenProject: (slug: string) => void
  onNavigate:    (href: string) => void
}

function ProjectStack({ projects, onOpenProject, onNavigate }: StackProps) {
  const inGrid      = projects.filter(p => p.inGrid !== false)
  const hasTims     = inGrid.some(p => p.slug === 'tims-pos')
  const allProjects = [
    ...(hasTims ? [] : [TIMS_PROJECT]),
    ...inGrid,
  ].sort((a, b) => a.order - b.order)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2.5rem, 5vw, 4rem)' }}>
      {allProjects.map((p, i) => (
        <ProjectEntry
          key={p.slug}
          project={p}
          cardIndex={i}
          onOpenProject={onOpenProject}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  )
}

function ProjectEntry({
  project, cardIndex, onOpenProject, onNavigate,
}: {
  project:       ProjectFrontmatter
  cardIndex:     number
  onOpenProject: (slug: string) => void
  onNavigate:    (href: string) => void
}) {
  const path = UNIVERSE_SLUGS[project.slug]

  return (
    <div>
      {/* title + tagline */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span
            className="font-display font-bold text-[var(--fg)]"
            style={{ fontSize: 'clamp(1rem, 1.6vw, 1.15rem)', lineHeight: 1.25 }}
          >
            {project.title}
          </span>
          <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">
            {project.company} · {project.year}
          </span>
        </div>
        <p
          className="font-display text-[var(--fg-muted)]"
          style={{ fontSize: 'var(--type-sm)', lineHeight: 1.55, marginTop: '0.2rem' }}
        >
          {project.summary}
        </p>
      </div>

      <HomeProjectCard
        project={project}
        index={cardIndex}
        onOpen={onOpenProject}
        onNavigate={onNavigate}
        universePath={path}
      />
    </div>
  )
}

// ── HomeClient ────────────────────────────────────────────────

interface HomeClientProps { projects: ProjectFrontmatter[] }

export function HomeClient({ projects }: HomeClientProps) {
  const router = useRouter()
  const [activeSlug, setActiveSlug]     = useState<string | null>(null)
  const [modalContent, setModalContent] = useState<string | null>(null)

  const openProject = useCallback((slug: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('project', slug)
    window.history.pushState({ project: slug }, '', url.toString())
    setActiveSlug(slug)
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
        .startViewTransition(() => router.push(href))
    } else {
      router.push(href)
    }
  }, [router])

  const activeProject = activeSlug
    ? (projects.find(p => p.slug === activeSlug) ?? null)
    : null

  return (
    <>
      <main id="main-content" tabIndex={-1}>
        <h1 className="sr-only">Tanawitch Saentree — Senior Product Designer</h1>

        <div
          className="mx-auto px-6 md:px-10"
          style={{
            maxWidth:      980,
            paddingTop:    'clamp(3rem, 8vw, 5rem)',
            paddingBottom: 'clamp(4rem, 10vw, 7rem)',
          }}
        >
          {/* ── Bio ─────────────────────────────────── */}
          <header style={{ marginBottom: 'clamp(3rem, 7vw, 5rem)' }}>
            <p
              className="font-display text-[var(--fg)] leading-[1.45] mb-5"
              style={{ fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)' }}
            >
              <strong className="font-bold">Tanawitch Saentree</strong> is a product designer
              at Allianz Technology passionate about building AI-powered tools that make
              regulated, complex systems feel human.
            </p>
            <p
              className="font-display text-[var(--fg-muted)] leading-[1.6] mb-6"
              style={{ fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', maxWidth: '64ch' }}
            >
              Previously he worked on products that earn trust through design in{' '}
              <a href="/projects/profita"   className="text-[var(--fg)] underline underline-offset-[3px] hover:text-[var(--accent-text)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]">investment apps</a>,{' '}
              <a href="/projects/invitrace" className="text-[var(--fg)] underline underline-offset-[3px] hover:text-[var(--accent-text)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]">hospital information systems</a>,{' '}
              and{' '}
              <a href="/projects/stellareat" className="text-[var(--fg)] underline underline-offset-[3px] hover:text-[var(--accent-text)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]">AI-driven food discovery</a>.
            </p>
            <div className="flex items-center gap-5 flex-wrap">
              {[
                { label: 'GitHub',  href: 'https://github.com/tanawitchsaentree' },
                { label: 'Medium',  href: 'https://medium.com/@tanawitchsaentree' },
                { label: 'Behance', href: 'https://www.behance.net/tanawitchsaentree' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[var(--type-sm)] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
                >
                  {label} ↗
                </a>
              ))}
            </div>
          </header>

          {/* ── Two-col ──────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-y-12 md:gap-x-14 items-start">

            {/* Experience — sticky */}
            <aside className="md:sticky md:top-10">
              <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--accent-text)] font-medium mb-5">
                Experience
              </p>
              <ul className="list-none m-0 p-0 flex flex-col gap-5">
                {WORK_HISTORY.map(entry => (
                  <li key={entry.company}>
                    <p className="font-display font-semibold text-[var(--type-sm)] text-[var(--fg)] mb-0.5 leading-[1.3]">
                      {entry.company}
                    </p>
                    <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">
                      {entry.year} · {entry.role}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Projects */}
            <section id="projects" aria-label="Selected projects">
              <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--accent-text)] font-medium mb-8">
                Projects
              </p>
              <ProjectStack
                projects={projects}
                onOpenProject={openProject}
                onNavigate={navigateWithTransition}
              />
            </section>

          </div>
        </div>
      </main>

      {activeProject && (
        <ProjectModal project={activeProject} content={modalContent} onClose={closeProject} />
      )}
    </>
  )
}
