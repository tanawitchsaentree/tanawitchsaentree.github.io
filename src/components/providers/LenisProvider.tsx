'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis smooth scroll — wired to GSAP ScrollTrigger via RAF ticker.
 *
 * Mobile (pointer: coarse) gets native scroll — Lenis disabled there
 * because momentum + battery on touch is worse than the gain.
 *
 * prefers-reduced-motion: Lenis still runs (for ScrollTrigger scrub
 * correctness) but with duration=0 so it snaps instantly.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Touch/coarse devices — skip Lenis smooth scroll
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isTouchDevice) {
      // Still need ScrollTrigger to work with native scroll
      ScrollTrigger.normalizeScroll(false)
      return
    }

    const lenis = new Lenis({
      duration:   reducedMotion ? 0 : 1.1,
      easing:     (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 0,
    })

    lenisRef.current = lenis

    // Sync Lenis scroll position to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Drive Lenis from GSAP's RAF ticker so timing is consistent
    const tickerCb = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tickerCb)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tickerCb)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
