'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'

// Slugs that navigate to a dedicated universe page instead of the modal
const UNIVERSE_SLUGS: Record<string, string> = {
  'allianz-doc-classification': '/projects/allianz',
}

interface ProjectCardProps {
  project: ProjectFrontmatter
  isHero?: boolean
  onOpen: (slug: string) => void
  onNavigate?: (href: string) => void
}

export function ProjectCard({ project, isHero = false, onOpen, onNavigate }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef<HTMLButtonElement>(null)

  const universePath = UNIVERSE_SLUGS[project.slug]

  const handleClick = useCallback(() => {
    if (universePath && onNavigate) {
      onNavigate(universePath)
    } else if (universePath) {
      // Fallback: plain navigation if no View Transition handler provided
      window.location.href = universePath
    } else {
      onOpen(project.slug)
    }
  }, [universePath, onNavigate, onOpen, project.slug])

  const hasCover = Boolean(project.coverImage)
  const fgClass = project.coverFg === 'light' ? 'text-white' : 'text-[#0A0A0A]'
  const fgMutedClass = project.coverFg === 'light' ? 'text-white/60' : 'text-[#0A0A0A]/60'

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`${project.title}${universePath ? ' — opens project page' : `, ${project.tags.join(', ')}. Press Enter to view case study`}.`}
      className={cn(
        'group relative w-full text-left overflow-hidden rounded-[var(--radius-xl)]',
        'border border-[var(--border)]',
        'transition-transform duration-[380ms] ease-[var(--ease-out-quick)]',
        isHero ? 'min-h-[420px] md:min-h-[520px]' : 'min-h-[280px] md:min-h-[320px]',
        // Scale on hover — 1.015, not 1.05 (per brief)
        'hover:scale-[1.015]',
        'focus-visible:outline-2 focus-visible:outline-[var(--fg)] focus-visible:outline-offset-2',
        'cursor-pointer'
      )}
      style={{ background: project.coverColor }}
    >
      {/* Cover — real image or typographic placeholder */}
      <div
        className={cn(
          'absolute inset-0 overflow-hidden',
          'transition-transform duration-[380ms] ease-[var(--ease-out-quick)]',
          hovered && 'scale-[1.04]' // Image scales inside overflow-hidden container
        )}
      >
        {hasCover ? (
          <Image
            src={project.coverImage!}
            alt=""
            fill
            sizes={isHero
              ? '(max-width: 768px) 100vw, 1280px'
              : '(max-width: 768px) 100vw, (max-width: 1024px) 58vw, 700px'
            }
            className="object-cover"
            priority={isHero}
          />
        ) : (
          // Typographic cover — project name large, no gradients, no mesh
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
            <span
              className={cn(
                'font-display font-normal',
                isHero
                  ? 'text-[clamp(2rem,5vw,3.5rem)]'
                  : 'text-[clamp(1.5rem,3vw,2.5rem)]',
                'leading-[1.05] tracking-[-0.028em]',
                fgClass,
                'max-w-[8ch]',
                // Single geometric accent: index number top-right
                'relative'
              )}
            >
              {project.title}
            </span>
          </div>
        )}

        {/* Geometric index accent — top-right corner */}
        <span
          className={cn(
            'absolute top-6 right-6',
            'font-mono text-[var(--type-xs)] tracking-widest',
            fgMutedClass,
            'select-none'
          )}
          aria-hidden="true"
        >
          {String(project.order).padStart(2, '0')}
        </span>
      </div>

      {/* Footer — always visible at bottom */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0',
          'flex items-end justify-between',
          'px-6 pb-5 pt-12 md:px-8 md:pb-6',
          // Gradient mask so footer reads on any cover
          'bg-gradient-to-t from-black/40 to-transparent',
        )}
      >
        <div>
          <p className={cn('font-sans font-medium text-[var(--type-sm)] text-white/90 mb-1')}>
            {project.title}
          </p>
          <p className="font-mono text-[var(--type-xs)] text-white/55 tracking-wide">
            {project.tags.slice(0, 2).join(' · ')}
          </p>
        </div>
        <p className="font-mono text-[var(--type-xs)] text-white/55 tracking-wide self-end">
          {project.year}
        </p>
      </div>
    </button>
  )
}
