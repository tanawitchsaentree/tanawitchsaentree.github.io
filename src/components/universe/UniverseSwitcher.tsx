'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/cn'

interface SubCaseTab {
  slug: string
  title: string
  order: number
}

interface UniverseSwitcherProps {
  subCases: SubCaseTab[]
  activeSlug: string
  onSelect: (slug: string) => void
}

export function UniverseSwitcher({ subCases, activeSlug, onSelect }: UniverseSwitcherProps) {
  const handleKey = useCallback(
    (e: React.KeyboardEvent, slug: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect(slug)
      }
    },
    [onSelect]
  )

  return (
    <nav
      aria-label="Sub-case navigation"
      className="universe-switcher"
    >
      {subCases.map(sc => {
        const isActive = sc.slug === activeSlug
        return (
          <button
            key={sc.slug}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(sc.slug)}
            onKeyDown={e => handleKey(e, sc.slug)}
            className={cn(
              'universe-switcher__item',
              isActive
                ? 'universe-switcher__item--active'
                : 'universe-switcher__item--inactive'
            )}
          >
            {sc.title}
          </button>
        )
      })}
    </nav>
  )
}
