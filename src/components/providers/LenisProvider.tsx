'use client'

import { useEffect } from 'react'

/**
 * Lenis smooth scroll — wired to GSAP ScrollTrigger via RAF ticker.
 *
 * lenis + gsap (~120KB) are loaded LAZILY inside the effect, so they're not in
 * the initial bundle for the non-scrolling portal landing — they fetch only
 * after mount, on the client, when a scrolling surface actually needs them.
 *
 * Mobile (pointer: coarse) gets native scroll — Lenis disabled there.
 * prefers-reduced-motion: Lenis still runs (for ScrollTrigger scrub
 * correctness) but with duration=0 so it snaps instantly.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let cleanup = () => {}
    let cancelled = false

    ;(async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)

      if (isTouchDevice) {
        ScrollTrigger.normalizeScroll(false)
        return
      }

      const lenis = new Lenis({
        duration: reducedMotion ? 0 : 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 0,
      })

      lenis.on('scroll', ScrollTrigger.update)
      const tickerCb = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tickerCb)
      gsap.ticker.lagSmoothing(0)

      cleanup = () => {
        gsap.ticker.remove(tickerCb)
        lenis.destroy()
      }
    })()

    return () => { cancelled = true; cleanup() }
  }, [])

  return <>{children}</>
}
