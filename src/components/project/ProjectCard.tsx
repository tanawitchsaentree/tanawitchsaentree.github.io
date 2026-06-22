'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'
import { GenerativeCover } from './GenerativeCover'

const UNIVERSE_SLUGS: Record<string, string> = {
  'allianz-doc-classification': '/projects/allianz',
  'invitrace-design-system':    '/projects/invitrace',
  'profita-mutual-fund':        '/projects/profita',
  'stellareat':                 '/projects/stellareat',
}

interface ProjectCardProps {
  project: ProjectFrontmatter
  onOpen: (slug: string) => void
  onNavigate?: (href: string) => void
}

export function ProjectCard({ project, onOpen, onNavigate }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false)
  const universePath = UNIVERSE_SLUGS[project.slug]

  const handleClick = useCallback(() => {
    if (universePath && onNavigate) {
      onNavigate(universePath)
    } else if (universePath) {
      window.location.href = universePath
    } else {
      onOpen(project.slug)
    }
  }, [universePath, onNavigate, onOpen, project.slug])

  const hasCover = Boolean(project.coverImage)
  const fgClass      = project.coverFg === 'light' ? 'text-[var(--fg-on-cover)]'        : 'text-[var(--fg)]'
  const fgMutedClass = project.coverFg === 'light' ? 'text-[var(--fg-on-cover-subtle)]' : 'text-[var(--fg-subtle)]'

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`${project.title} — ${project.tags.slice(0, 2).join(', ')}`}
      className={cn(
        'group relative w-full text-left overflow-hidden',
        'rounded-[var(--radius-lg)]',
        'border border-[var(--border)]',
        // Consistent aspect ratio across all cards
        'aspect-[3/4]',
        'transition-transform duration-[360ms] ease-[var(--ease-out-quick)]',
        hovered && 'scale-[1.015]',
        'focus-visible:outline-2 focus-visible:outline-[var(--fg)] focus-visible:outline-offset-2',
        'cursor-pointer'
      )}
      style={{ background: project.coverColor }}
    >
      {/* Reaction-diffusion cover — always visible, hover injects reactant via canvas listener */}
      {project.coverVariant && (
        <div className="absolute inset-0">
          <GenerativeCover variant={project.coverVariant} className="w-full h-full" />
        </div>
      )}

      {/* Cover image — scales subtly on hover */}
      {hasCover && (
        <div
          className={cn(
            'absolute inset-0 overflow-hidden',
            'transition-transform duration-[360ms] ease-[var(--ease-out-quick)]',
            hovered && 'scale-[1.04]'
          )}
        >
          <Image
            src={project.coverImage!}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Index — top-right corner, always */}
      <span
        className={cn(
          'absolute top-5 right-5 z-10',
          'font-mono text-[var(--type-xs)] tracking-[0.14em]',
          fgMutedClass,
          'select-none'
        )}
        aria-hidden="true"
      >
        {String(project.order).padStart(2, '0')}
      </span>

      {/* Footer — pinned bottom, gradient mask */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-10',
          'px-5 pb-5 pt-16',
          // Gradient so footer reads on any cover color — token, not hardcoded black
          'bg-gradient-to-t from-[var(--cover-vignette)] to-transparent',
        )}
      >
        <p className="font-display font-normal text-[var(--type-base)] leading-[1.25] mb-1 text-[var(--fg-on-cover)]">
          {project.title}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[var(--type-xs)] text-[var(--fg-on-cover-muted)] tracking-[0.08em] truncate">
            {project.tags.slice(0, 2).join(' · ')}
          </p>
          <p className="font-mono text-[var(--type-xs)] text-[var(--fg-on-cover-muted)] tracking-[0.08em] shrink-0">
            {project.year}
          </p>
        </div>
      </div>
    </button>
  )
}
