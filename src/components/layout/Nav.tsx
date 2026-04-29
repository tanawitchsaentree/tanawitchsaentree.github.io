'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const SECTIONS = [
  { id: 'hero',    num: '01', label: 'Hero'    },
  { id: 'work',    num: '02', label: 'Work'    },
  { id: 'about',   num: '03', label: 'About'   },
  { id: 'process', num: '04', label: 'Process' },
  { id: 'contact', num: '05', label: 'Contact' },
] as const

type SectionId = typeof SECTIONS[number]['id']

export function Nav() {
  const [active, setActive] = useState<SectionId>('hero')
  const [mobileLabelId, setMobileLabelId] = useState<SectionId | null>(null)
  const mobileLabelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Active section via IntersectionObserver
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId)
        })
      },
      { rootMargin: '-50% 0px -50% 0px' }
    )
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  // Cleanup mobile timer on unmount
  useEffect(() => {
    return () => { if (mobileLabelTimer.current) clearTimeout(mobileLabelTimer.current) }
  }, [])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })
    setActive(id as SectionId)
  }, [])

  const handleMobileTap = useCallback((id: SectionId) => {
    scrollTo(id)
    setMobileLabelId(id)
    if (mobileLabelTimer.current) clearTimeout(mobileLabelTimer.current)
    mobileLabelTimer.current = setTimeout(() => setMobileLabelId(null), 1500)
  }, [scrollTo])

  return (
    <>
      {/* ── Desktop: vertical numbered side index ─────────────────── */}
      <nav
        aria-label="Page sections"
        className={cn(
          'hidden md:flex flex-col items-center',
          'fixed right-12 z-40',
          'top-1/2 -translate-y-1/2'
        )}
      >
        <ul className="flex flex-col items-center list-none m-0 p-0">
          {SECTIONS.map(({ id, num, label }, i) => {
            const isActive = active === id
            return (
              <Fragment key={id}>
                <li className="group relative flex items-center">
                  <button
                    type="button"
                    onClick={() => scrollTo(id)}
                    aria-label={`Go to ${label} section`}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'flex items-center justify-center',
                      'py-2 px-1 cursor-pointer',
                      'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
                      'transition-colors duration-[240ms] ease-out',
                      'focus-visible:outline-2 focus-visible:outline-[var(--fg)] focus-visible:outline-offset-2',
                      isActive
                        ? 'text-[var(--fg)]'
                        : 'text-[var(--fg-subtle)] hover:text-[var(--fg-muted)]'
                    )}
                  >
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded-full',
                        'transition-all duration-[240ms] ease-out',
                        isActive
                          ? 'border border-[var(--fg)]'
                          : 'border border-transparent'
                      )}
                    >
                      {num}
                    </span>
                  </button>

                  {/* Hover label — slides in from right */}
                  <span
                    className={cn(
                      'absolute right-full mr-4',
                      'flex items-center gap-2',
                      'pointer-events-none select-none whitespace-nowrap',
                      'opacity-0 translate-x-2',
                      'group-hover:opacity-100 group-hover:translate-x-0',
                      'transition-all duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                      'motion-reduce:translate-x-0 motion-reduce:transition-opacity'
                    )}
                    aria-hidden="true"
                  >
                    <span className="font-mono text-[var(--type-xs)] uppercase tracking-[0.15em] text-[var(--fg-muted)]">
                      {label}
                    </span>
                    <span className="inline-block w-3 h-px bg-[var(--fg-subtle)]" />
                  </span>
                </li>

                {/* Connector dot between items */}
                {i < SECTIONS.length - 1 && (
                  <li aria-hidden="true" className="flex items-center justify-center py-0.5">
                    <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] leading-none select-none">
                      ·
                    </span>
                  </li>
                )}
              </Fragment>
            )
          })}
        </ul>
      </nav>

      {/* ── Mobile: horizontal bottom indicator ───────────────────── */}
      <nav
        aria-label="Page sections"
        className={cn(
          'md:hidden',
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-40',
          'flex flex-col items-center gap-2'
        )}
      >
        {/* Tap label — fades in for 1.5s */}
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

      {/* ── Theme toggle — fixed bottom-left ──────────────────────── */}
      <div
        className="fixed bottom-6 left-6 md:bottom-12 md:left-12 z-40"
        aria-label="Theme toggle"
      >
        <ThemeToggle />
      </div>
    </>
  )
}
