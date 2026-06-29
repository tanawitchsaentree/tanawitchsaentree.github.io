'use client'

import type { ProjectFrontmatter } from '@/types/project'
import { WorkGridFeaturedCard } from './WorkGridFeaturedCard'
import { WorkGridCard } from './WorkGridCard'
import { WorkListRow } from './WorkListRow'

// ── Routing ────────────────────────────────────────────────────
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

// ── Tims — injected as featured if not already in MDX ─────────
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

// ── Props ──────────────────────────────────────────────────────
interface WorkGridProps {
  projects:      ProjectFrontmatter[]
  onOpenProject: (slug: string) => void
  onNavigate:    (href: string) => void
}

// ── WorkGrid ───────────────────────────────────────────────────
export function WorkGrid({ projects, onOpenProject, onNavigate }: WorkGridProps) {
  const inGridProjects = projects.filter(p => p.inGrid !== false)
  const hasTims        = inGridProjects.some(p => p.slug === 'tims-pos')

  const allProjects = [
    ...(hasTims ? [] : [TIMS_PROJECT]),
    ...inGridProjects,
  ].sort((a, b) => a.order - b.order)

  const featured   = allProjects[0]
  const gridItems  = allProjects.slice(1, 4)
  const listItems  = allProjects.slice(4)

  return (
    <section id="work" aria-label="Selected work" className="w-full">
      <div
        className="flex flex-col"
        style={{
          maxWidth:   '72rem',
          margin:     '0 auto',
          padding:    'clamp(var(--space-6), 3vw, var(--space-12))',
          paddingTop: 'var(--space-8)',
          gap:        'var(--space-4)',
        }}
      >
        <p style={{
          fontSize:      'var(--type-xs)',
          letterSpacing: '0.14em',
          fontWeight:    500,
          textTransform: 'uppercase' as const,
          color:         'var(--fg-subtle)',
          margin:        0,
        }}>
          Selected work
        </p>

        {featured && (
          <WorkGridFeaturedCard
            project={featured}
            locked={LOCKED.has(featured.slug)}
            accentColor={featured.coverColor ?? 'var(--cover-tims)'}
            onOpen={onOpenProject}
            onNavigate={onNavigate}
            universePath={UNIVERSE_SLUGS[featured.slug]}
          />
        )}

        {gridItems.length > 0 && (
          /*
           * Pull grid row up by gap + add matching paddingTop + bg fill
           * so the iPad bleed zone from FeaturedCard is covered cleanly.
           */
          <div style={{
            marginTop:  'calc(-1 * var(--space-4))',
            paddingTop: 'var(--space-4)',
            background: 'var(--bg)',
            position:   'relative',
            zIndex:     2,
          }}>
            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap:                 'var(--space-4)',
            }}>
              {gridItems.map((project, i) => (
                <WorkGridCard
                  key={project.slug}
                  project={project}
                  index={i + 1}
                  locked={LOCKED.has(project.slug)}
                  onOpen={onOpenProject}
                  onNavigate={onNavigate}
                  universePath={UNIVERSE_SLUGS[project.slug]}
                />
              ))}
            </div>
          </div>
        )}

        {listItems.length > 0 && (
          <div style={{ marginTop: 'var(--space-10)' }}>
            {listItems.map((project, i) => (
              <WorkListRow
                key={project.slug}
                project={project}
                index={gridItems.length + i + 1}
                locked={LOCKED.has(project.slug)}
                onOpen={onOpenProject}
                onNavigate={onNavigate}
                universePath={UNIVERSE_SLUGS[project.slug]}
              />
            ))}
            <div style={{ height: 1, background: 'var(--border)' }} />
          </div>
        )}
      </div>
    </section>
  )
}
