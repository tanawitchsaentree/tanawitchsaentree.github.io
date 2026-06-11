'use client'

import { useCallback, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { MorphText } from '@/components/ui/MorphText'
import type { ProjectFrontmatter } from '@/types/project'

const UNIVERSE_SLUGS: Record<string, string> = {
  'allianz-doc-classification': '/projects/allianz',
  'invitrace-design-system':    '/projects/invitrace',
  'profita-mutual-fund':        '/projects/profita',
  'stellareat':                 '/projects/stellareat',
}

interface ProjectRowProps {
  project: ProjectFrontmatter
  index: number
  total: number
  isHighlighted?: boolean
  onOpen: (slug: string) => void
  onNavigate: (href: string) => void
  onHoverChange: (slug: string | null) => void
}

const HEADLINES: Record<string, string> = {
  'invitrace-design-system':    'Federated design system for clinical workflows.',
  'allianz-doc-classification': 'Designing AI document tools that operators actually trust.',
  'stellareat':                 'AI culinary — making recommendations legible.',
  'robowealth-profita':         'Robo-advisory for first-time investors. Award-winning.',
  'profita-mutual-fund':        'Mutual fund platform under SEC regulatory constraints.',
  'doctoranywhere-telehealth':  'Telehealth UX across Southeast Asia.',
}

export function ProjectRow({
  project,
  index,
  total,
  isHighlighted = true,
  onOpen,
  onNavigate,
  onHoverChange,
}: ProjectRowProps) {
  const [hovered, setHovered] = useState(false)
  const universePath = UNIVERSE_SLUGS[project.slug]
  const headline = HEADLINES[project.slug] ?? project.summary
  const shouldReduceMotion = useReducedMotion()

  const handleClick = useCallback(() => {
    if (universePath) {
      // onNavigate = navigateWithTransition which already wraps in startViewTransition.
      // Do NOT double-wrap here — nested VT calls cancel the outer one and leave
      // stale ::view-transition pseudo-elements that cover the page on back-navigation.
      onNavigate(universePath)
    } else {
      onOpen(project.slug)
    }
  }, [universePath, onNavigate, onOpen, project.slug])

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
    onHoverChange(project.slug)
  }, [project.slug, onHoverChange])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
    onHoverChange(null)
  }, [onHoverChange])

  // Quiet scroll reveal — a short, uniform fade-up. No directional theatrics:
  // the page should feel like it's simply already there, settling in.
  const motionInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
  const motionVisible = { opacity: 1, y: 0 }

  return (
    <motion.li
      className="list-none m-0 p-0"
      initial={motionInitial}
      whileInView={motionVisible}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{
        duration: shouldReduceMotion ? 0.3 : 0.5,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={() => { setHovered(true); onHoverChange(project.slug) }}
        onBlur={() => { setHovered(false); onHoverChange(null) }}
        aria-label={`${project.company} — ${headline}`}
        className={cn(
          'group w-full cursor-pointer',
          'flex flex-col items-center',
          // Uniform, quiet rhythm — no row dominates at rest.
          'py-6',
          'px-4 rounded-md',
          'transition-colors duration-[240ms] ease-[var(--ease-out-quick)]',
          'focus-visible:outline-2 focus-visible:outline-[var(--fg)] focus-visible:outline-offset-[-2px]'
        )}
      >
        <div className="flex flex-col items-center gap-1.5">
          {/* Eyebrow — company · year */}
          <span
            className={cn(
              'font-mono text-[var(--type-xs)] uppercase tracking-[0.14em]',
              'text-[var(--fg-subtle)]',
              'transition-colors duration-[240ms] ease-[var(--ease-out-quick)]',
              hovered && 'text-[var(--fg-muted)]'
            )}
          >
            {project.company} · {project.year}
          </span>

          {/* Headline — morphs on hover */}
          <h2
            className={cn(
              'font-display font-medium',
              'leading-[1.35] tracking-[0.005em]',
              'text-[var(--fg)]',
              'text-[var(--type-base)] max-w-[34ch]'
            )}
          >
            <MorphText text={headline} active={hovered} />
          </h2>

          {/* Meta */}
          <p className="text-[var(--type-xs)] text-[var(--fg-subtle)] leading-[1.5]">
            {project.role}
            {project.tags.length > 0 && (
              <> · {project.tags.slice(0, 3).join(' · ')}</>
            )}
          </p>
        </div>
      </button>
    </motion.li>
  )
}
