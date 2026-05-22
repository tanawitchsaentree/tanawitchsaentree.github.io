'use client'

import { useEffect, useState } from 'react'

/**
 * Returns whether motion is allowed.
 * false  = prefers-reduced-motion: reduce — use instant final state
 * true   = full motion permitted
 *
 * Defaults to true (SSR-safe) until media query resolves on mount.
 */
export function useMotion(): boolean {
  const [allowed, setAllowed] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setAllowed(!mq.matches)
    const handler = (e: MediaQueryListEvent) => setAllowed(!e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return allowed
}
