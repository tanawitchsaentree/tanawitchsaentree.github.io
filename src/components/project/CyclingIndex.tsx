'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import type { ProjectFrontmatter } from '@/types/project'

interface CyclingIndexProps {
  projects: ProjectFrontmatter[]
  pausedSlug: string | null
}

export function CyclingIndex({ projects, pausedSlug }: CyclingIndexProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Detect reduced motion on mount
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
  }, [])

  // Override active index when user hovers a row
  useEffect(() => {
    if (pausedSlug === null) return
    const idx = projects.findIndex(p => p.slug === pausedSlug)
    if (idx !== -1) setActiveIndex(idx)
  }, [pausedSlug, projects])

  // Auto-cycle every 4s — paused when hovering or tab hidden or reduced motion
  useEffect(() => {
    if (prefersReducedMotion) return
    if (pausedSlug !== null) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    function step() {
      if (document.visibilityState === 'hidden') return
      // Fade out → update → fade in
      setVisible(false)
      setTimeout(() => {
        setActiveIndex(i => (i + 1) % projects.length)
        setVisible(true)
      }, 300)
    }

    intervalRef.current = setInterval(step, 4000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [pausedSlug, projects.length, prefersReducedMotion])

  const current = projects[activeIndex]
  const total = projects.length

  return (
    <p
      className={cn(
        'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
        'flex items-center gap-3 mb-16 md:mb-20'
      )}
    >
      <span className="text-[var(--fg-subtle)]">[ Currently viewing ]</span>
      <span
        className={cn(
          'text-[var(--fg-muted)]',
          'transition-opacity duration-[600ms] ease-[var(--ease-out-quick)]',
          visible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        {' — '}
        {current.company.toUpperCase()}
      </span>
    </p>
  )
}
