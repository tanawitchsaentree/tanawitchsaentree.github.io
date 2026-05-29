'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

const SIDE_PROJECTS = [
  {
    slug:     'manabi',
    name:     'Manabi',
    tagline:  'School finder & comparison for Thai families.',
    tags:     ['EdTech', 'Consumer', 'Mobile'],
    year:     '2025',
    status:   'In progress',
    href:     null,
  },
] as const

function fadeUp(delay = 0) {
  return {
    initial:   { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport:  { once: true, margin: '-10% 0px' },
    transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
  }
}

export function SideProjects() {
  return (
    <section
      id="side-projects"
      aria-labelledby="side-projects-heading"
      className="px-8 md:px-12 lg:px-16 pb-12 md:pb-16"
    >
      <motion.p
        {...fadeUp()}
        id="side-projects-heading"
        className={cn(
          'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
          'text-[var(--fg-subtle)] mb-6'
        )}
      >
        Side projects
      </motion.p>

      <ul className="list-none m-0 p-0 flex flex-col gap-1">
        {SIDE_PROJECTS.map((p, i) => (
          <SideProjectRow key={p.slug} project={p} index={i} />
        ))}
      </ul>
    </section>
  )
}

function SideProjectRow({
  project,
  index,
}: {
  project: typeof SIDE_PROJECTS[number]
  index: number
}) {
  const [hovered, setHovered] = useState(false)

  const inner = (
    <div
      className={cn(
        'flex items-baseline justify-between gap-6',
        'py-3 px-3 rounded-lg -mx-3',
        'transition-colors duration-[220ms] ease-out',
        hovered ? 'bg-[var(--bg-elevated)]' : 'bg-transparent',
        project.href ? 'cursor-pointer' : 'cursor-default'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left */}
      <div className="flex items-baseline gap-5 min-w-0">
        <span
          className={cn(
            'font-mono text-[var(--type-xs)] uppercase tracking-[0.08em] flex-shrink-0',
            'transition-colors duration-[220ms]',
            hovered ? 'text-[var(--fg-muted)]' : 'text-[var(--fg-subtle)]'
          )}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className={cn(
              'text-[var(--type-sm)] leading-[1.4] tracking-[-0.01em]',
              'transition-colors duration-[220ms]',
              hovered ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'
            )}
          >
            {project.name}
          </span>
          <span
            className={cn(
              'font-mono text-[var(--type-xs)] tracking-[0.02em]',
              'text-[var(--fg-subtle)]',
              'truncate max-w-[32ch]'
            )}
          >
            {project.tagline}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <span
          className={cn(
            'font-mono text-[var(--type-xs)] uppercase tracking-[0.08em]',
            'text-[var(--fg-subtle)] opacity-60'
          )}
        >
          {project.status}
        </span>
        <span
          className={cn(
            'font-mono text-[var(--type-xs)] uppercase tracking-[0.08em]',
            'text-[var(--fg-subtle)] opacity-40'
          )}
        >
          {project.year}
        </span>
        {project.href && (
          <span
            className={cn(
              'font-mono text-[var(--type-xs)]',
              'transition-opacity duration-[220ms]',
              hovered ? 'opacity-60' : 'opacity-0'
            )}
            aria-hidden="true"
          >
            ↗
          </span>
        )}
      </div>
    </div>
  )

  return (
    <motion.li
      {...fadeUp(index * 0.06)}
      className="list-none"
    >
      {project.href ? (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${project.name} — ${project.tagline}`}
          className="block no-underline"
        >
          {inner}
        </a>
      ) : (
        <div
          role="listitem"
          aria-label={`${project.name} — ${project.tagline}`}
        >
          {inner}
        </div>
      )}
    </motion.li>
  )
}
