'use client'

import { useCallback, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { CoverSignature } from './CoverSignature'
import type { ProjectFrontmatter } from '@/types/project'

// Accent word for the featured (index 0) headline — weareyellow-style color-field
function FeaturedHeadline({ text }: { text: string }) {
  const ACCENT_WORD = 'trust'
  const idx = text.toLowerCase().indexOf(ACCENT_WORD)
  if (idx === -1) return <>{text}</>
  const before = text.slice(0, idx)
  const word   = text.slice(idx, idx + ACCENT_WORD.length)
  const after  = text.slice(idx + ACCENT_WORD.length)
  return (
    <>
      {before}
      <span
        className="relative inline"
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-fg)',
          paddingInline: '0.12em',
          marginInline: '0.02em',
          borderRadius: '2px',
        }}
      >
        {word}
      </span>
      {after}
    </>
  )
}

const UNIVERSE_SLUGS: Record<string, string> = {
  'allianz-doc-classification': '/projects/allianz',
}

interface ProjectRowProps {
  project: ProjectFrontmatter
  index: number
  total: number
  onOpen: (slug: string) => void
  onNavigate: (href: string) => void
  onHoverChange: (slug: string | null) => void
}

const HEADLINES: Record<string, string> = {
  'allianz-doc-classification': 'Designing AI document tools that operators actually trust.',
  'profita-mutual-fund':        'Behavioral nudges for first-time investors.',
  'invitrace-design-system':    'Federated design system for clinical workflows.',
  'doctoranywhere-telehealth':  'Telehealth UX research for Southeast Asia.',
}

// Clip-path reveal direction per card index
const CLIP_REVEAL = [
  { initial: 'inset(0 0 100% 0)', visible: 'inset(0 0 0% 0)'   }, // 0 Allianz   — from bottom
  { initial: 'inset(0 100% 0 0)', visible: 'inset(0 0% 0 0)'   }, // 1 Profita   — from left
  { initial: 'inset(0 0 0 100%)', visible: 'inset(0 0 0 0%)'   }, // 2 Invitrace — from right
  { initial: 'inset(100% 0 0 0)', visible: 'inset(0% 0 0 0)'   }, // 3 DA        — from top
]

export function ProjectRow({
  project,
  index,
  total,
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

  // Reveal animation — clip-path for full motion, opacity for reduced motion
  const clipDir = CLIP_REVEAL[index % CLIP_REVEAL.length]
  const motionInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { clipPath: clipDir.initial, opacity: 1 }
  const motionVisible = shouldReduceMotion
    ? { opacity: 1 }
    : { clipPath: clipDir.visible, opacity: 1 }

  return (
    <motion.li
      className="list-none m-0 p-0 border-b border-[var(--border)]"
      initial={motionInitial}
      whileInView={motionVisible}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{
        duration: shouldReduceMotion ? 0.3 : 0.8,
        delay: shouldReduceMotion ? index * 0.04 : index * 0.08,
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
          'group w-full text-left cursor-pointer',
          'flex items-start justify-between',
          index === 0 ? 'py-12 md:py-16' : 'py-8 md:py-10',
          'px-4 my-3 rounded-xl',
          'transition-colors duration-[240ms] ease-out',
          hovered && 'bg-[var(--bg-elevated)]',
          'focus-visible:outline-2 focus-visible:outline-[var(--fg)] focus-visible:outline-offset-[-2px]'
        )}
      >
        <div className="flex flex-col gap-6 min-w-0 pr-4">
          {/* Index line */}
          <div className="flex items-center gap-4">
            <span
              className={cn(
                'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
                'text-[var(--fg-subtle)] flex-shrink-0'
              )}
            >
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <span className="flex-1 h-px bg-[var(--border)]" aria-hidden="true" />
            <span
              className={cn(
                'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
                'text-[var(--fg-subtle)] flex-shrink-0'
              )}
            >
              {project.year}
            </span>
          </div>

          {/* Eyebrow */}
          <span
            className={cn(
              'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
              'text-[var(--fg-muted)]',
              'transition-colors duration-[240ms] ease-out',
              hovered && 'text-[var(--fg)]'
            )}
          >
            {project.company}
          </span>

          {/* Headline */}
          <h2
            className={cn(
              'font-display font-normal',
              'leading-[1.05] text-[var(--fg)]',
              index === 0
                ? 'text-[clamp(2.25rem,4.5vw,4rem)] tracking-[-0.036em] max-w-[20ch]'
                : 'text-[var(--type-2xl)] md:text-[var(--type-3xl)] tracking-[-0.024em] max-w-[24ch]'
            )}
          >
            {index === 0 ? <FeaturedHeadline text={headline} /> : headline}
          </h2>

          {/* Meta */}
          <p
            className={cn(
              'text-[var(--type-sm)] text-[var(--fg-muted)]',
              'leading-[1.5]'
            )}
          >
            {project.role}
            {project.tags.length > 0 && (
              <> · {project.tags.slice(0, 3).join(' · ')}</>
            )}
          </p>
        </div>

        <CoverSignature slug={project.slug} hovered={hovered} />
      </button>
    </motion.li>
  )
}
