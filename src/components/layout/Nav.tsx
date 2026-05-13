'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

const SECTIONS = [
  { id: 'work',    num: '01', label: 'Work'    },
  { id: 'about',   num: '02', label: 'About'   },
  { id: 'process', num: '03', label: 'Process' },
  { id: 'contact', num: '04', label: 'Contact' },
] as const

type SectionId = typeof SECTIONS[number]['id']

interface NavProps {
  rightRef?: React.RefObject<HTMLDivElement>
}

export function Nav({ rightRef }: NavProps) {
  const [active, setActive] = useState<SectionId>('work')
  const [mobileLabelId, setMobileLabelId] = useState<SectionId | null>(null)
  const mobileLabelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mobile: observe sections inside the right scroll container (or document)
  useEffect(() => {
    const container = rightRef?.current ?? null

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId)
        })
      },
      {
        root: container,
        rootMargin: '-40% 0px -55% 0px',
      }
    )

    SECTIONS.forEach(({ id }) => {
      const el = container
        ? container.querySelector(`#${id}`)
        : document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [rightRef])

  useEffect(() => {
    return () => { if (mobileLabelTimer.current) clearTimeout(mobileLabelTimer.current) }
  }, [])

  const scrollTo = useCallback((id: string) => {
    const container = rightRef?.current ?? null
    const el = container
      ? (container.querySelector(`#${id}`) as HTMLElement | null)
      : document.getElementById(id)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (container) {
      container.scrollTo({ top: el.offsetTop, behavior: reduced ? 'instant' : 'smooth' })
    } else {
      el.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })
    }
    setActive(id as SectionId)
  }, [rightRef])

  const handleMobileTap = useCallback((id: SectionId) => {
    scrollTo(id)
    setMobileLabelId(id)
    if (mobileLabelTimer.current) clearTimeout(mobileLabelTimer.current)
    mobileLabelTimer.current = setTimeout(() => setMobileLabelId(null), 1500)
  }, [scrollTo])

  return (
    <>
      {/* ── Mobile only: bottom dot nav ───────────────────────── */}
      <nav
        aria-label="Page sections"
        className={cn(
          'md:hidden',
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-40',
          'flex flex-col items-center gap-2'
        )}
      >
        <span
          className={cn(
            'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
            'text-[var(--fg-muted)]',
            'transition-opacity duration-[240ms]',
            mobileLabelId ? 'opacity-100' : 'opacity-0',
            'h-4'
          )}
          aria-live="polite"
        >
          {SECTIONS.find(s => s.id === mobileLabelId)?.label ?? ''}
        </span>

        <ul className="flex items-center gap-1 list-none m-0 p-0">
          {SECTIONS.map(({ id, num, label }, i) => {
            const isActive = active === id
            return (
              <Fragment key={id}>
                <li>
                  <button
                    type="button"
                    onClick={() => handleMobileTap(id)}
                    aria-label={`Go to ${label} section`}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
                      'transition-colors duration-[240ms] cursor-pointer',
                      isActive ? 'text-[var(--fg)]' : 'text-[var(--fg-subtle)]'
                    )}
                  >
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded-full inline-block',
                        'transition-all duration-[240ms] ease-out',
                        isActive
                          ? 'border border-[var(--fg)]'
                          : 'border border-transparent'
                      )}
                    >
                      {num}
                    </span>
                  </button>
                </li>
                {i < SECTIONS.length - 1 && (
                  <li aria-hidden="true">
                    <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] px-0.5">·</span>
                  </li>
                )}
              </Fragment>
            )
          })}
        </ul>
      </nav>

      {/* ── Mobile theme toggle — fixed bottom-left ───────────── */}
      {/* Desktop theme toggle lives in the left panel */}
      <div className="md:hidden fixed bottom-6 left-6 z-40" aria-label="Theme toggle">
        {/* imported inline in HomeClient for desktop; mobile uses this slot */}
      </div>
    </>
  )
}
