'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'
import { ProjectCard } from '@/components/project/ProjectCard'

interface WorkGridProps {
  projects: ProjectFrontmatter[]
  onOpenProject: (slug: string) => void
  onNavigate: (href: string) => void
}

export function WorkGrid({ projects, onOpenProject, onNavigate }: WorkGridProps) {
  const reduced = useReducedMotion()
  const visible = projects.filter(p => p.inGrid !== false).sort((a, b) => a.order - b.order)

  return (
    <section id="work" aria-label="Selected work" className="w-full py-12">

      {/* Section eyebrow */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="font-mono text-[var(--type-xs)] uppercase tracking-[0.18em] text-[var(--fg-subtle)] mb-8 text-center"
      >
        Selected work · {visible.length} projects
      </motion.p>

      {/* Grid — 1 col mobile, 2 col ≥640px, 3 col ≥1024px */}
      <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {visible.map((project, i) => (
          <motion.li
            key={project.slug}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-6% 0px' }}
            transition={{
              duration: 0.5,
              delay: (i % 3) * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="list-none"
          >
            <ProjectCard
              project={project}
              onOpen={onOpenProject}
              onNavigate={onNavigate}
            />
          </motion.li>
        ))}
      </ul>

    </section>
  )
}
