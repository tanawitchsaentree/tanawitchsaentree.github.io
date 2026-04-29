'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { UniverseSwitcher } from './UniverseSwitcher'
import type { SubCaseFrontmatter } from '@/lib/universes'

interface UniverseClientProps {
  subCases: SubCaseFrontmatter[]
}

export function UniverseClient({ subCases }: UniverseClientProps) {
  const [activeSlug, setActiveSlug] = useState(subCases[0]?.slug ?? '')
  const scrollingProgrammatically = useRef(false)

  // IntersectionObserver — update active tab as user scrolls
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    subCases.forEach(sc => {
      const el = document.getElementById(sc.slug)
      if (!el) return

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (scrollingProgrammatically.current) return
          if (entry.isIntersecting) setActiveSlug(sc.slug)
        },
        { rootMargin: '-30% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [subCases])

  const handleSelect = useCallback((slug: string) => {
    setActiveSlug(slug)
    const el = document.getElementById(slug)
    if (!el) return

    scrollingProgrammatically.current = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })

    // Re-enable IO tracking after scroll settles (~800ms)
    setTimeout(() => { scrollingProgrammatically.current = false }, 800)
  }, [])

  return (
    <div
      className={cn(
        'sticky top-6 z-30',
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'pointer-events-none'
      )}
    >
      {/* pointer-events-auto so the switcher itself is still clickable */}
      <div className="inline-block pointer-events-auto">
        <UniverseSwitcher
          subCases={subCases}
          activeSlug={activeSlug}
          onSelect={handleSelect}
        />
      </div>
    </div>
  )
}
