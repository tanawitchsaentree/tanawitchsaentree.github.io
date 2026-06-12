'use client'

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

/**
 * FrameDeck — turns a list of sections into a deck of full-viewport "frames"
 * that advance one at a time, like pages fed through a typewriter.
 *
 * Navigation: wheel / arrow keys / PageUp-Down / Home-End / touch swipe.
 * Between frames a brief glyph "decode wipe" sweeps the screen (DecodeWipe).
 *
 * Usability guards (the hard part of scroll-snapping):
 *  - If a frame's content is taller than the viewport, native scroll inside it
 *    works first; the deck only advances once you're at the top/bottom edge.
 *  - Transition is locked while animating so input can't queue up chaos.
 *  - prefers-reduced-motion → instant snap, no wipe.
 *  - Full keyboard support + an aria-live position announcement + side dots.
 */

const WIPE_MS = 620
// A frame only counts as "internally scrollable" if it overflows by more than
// this. Small overflows (centered heroes with padding) advance immediately.
const SCROLLABLE_MIN = 48
const EDGE_EPS = 4 // px tolerance at scroll edges

interface FrameDeckProps {
  children: ReactNode
  labels: string[]
}

export function FrameDeck({ children, labels }: FrameDeckProps) {
  const frames = Children.toArray(children)
  const n = frames.length

  const [active, setActive] = useState(0)
  const [wiping, setWiping] = useState(false)
  const [reduced, setReduced] = useState(false)

  const lockRef = useRef(false)
  const scrollerRefs = useRef<(HTMLDivElement | null)[]>([])
  const touchY = useRef<number | null>(null)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const go = useCallback((dir: 1 | -1) => {
    setActive(prev => {
      const next = prev + dir
      if (next < 0 || next >= n) return prev
      if (lockRef.current) return prev
      lockRef.current = true
      if (!reduced) setWiping(true)
      // release lock after the wipe; content swap happens at the wipe midpoint
      const release = reduced ? 0 : WIPE_MS
      window.setTimeout(() => {
        lockRef.current = false
        setWiping(false)
      }, release)
      return next
    })
  }, [n, reduced])

  const jumpTo = useCallback((i: number) => {
    if (i === active || lockRef.current) return
    if (i < 0 || i >= n) return
    lockRef.current = true
    if (!reduced) setWiping(true)
    setActive(i)
    window.setTimeout(() => { lockRef.current = false; setWiping(false) }, reduced ? 0 : WIPE_MS)
  }, [active, n, reduced])

  // Is the active frame's internal scroller at an edge in `dir`?
  const atEdge = useCallback((dir: 1 | -1) => {
    const el = scrollerRefs.current[active]
    if (!el) return true
    // Frames that fit (or barely overflow) always advance — no internal scroll.
    if (el.scrollHeight <= el.clientHeight + SCROLLABLE_MIN) return true
    if (dir === 1) return el.scrollTop + el.clientHeight >= el.scrollHeight - EDGE_EPS
    return el.scrollTop <= EDGE_EPS
  }, [active])

  // ── Wheel ─────────────────────────────────────────────────
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (lockRef.current) { e.preventDefault(); return }
      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1
      if (Math.abs(e.deltaY) < 4) return
      if (atEdge(dir)) {
        // only hijack when there's a frame to go to
        if ((dir === 1 && active < n - 1) || (dir === -1 && active > 0)) {
          e.preventDefault()
          go(dir)
        }
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [active, atEdge, go, n])

  // ── Keyboard ──────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // don't steal keys from form fields
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      switch (e.key) {
        case 'ArrowDown': case 'PageDown':
          if (atEdge(1) && active < n - 1) { e.preventDefault(); go(1) }
          break
        case 'ArrowUp': case 'PageUp':
          if (atEdge(-1) && active > 0) { e.preventDefault(); go(-1) }
          break
        case ' ':
          if (atEdge(1) && active < n - 1) { e.preventDefault(); go(1) }
          break
        case 'Home': e.preventDefault(); jumpTo(0); break
        case 'End':  e.preventDefault(); jumpTo(n - 1); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, atEdge, go, jumpTo, n])

  // ── Touch ─────────────────────────────────────────────────
  useEffect(() => {
    const onStart = (e: TouchEvent) => { touchY.current = e.touches[0].clientY }
    const onEnd = (e: TouchEvent) => {
      if (touchY.current === null) return
      const dy = touchY.current - e.changedTouches[0].clientY
      touchY.current = null
      if (Math.abs(dy) < 50) return
      const dir: 1 | -1 = dy > 0 ? 1 : -1
      if (atEdge(dir) && ((dir === 1 && active < n - 1) || (dir === -1 && active > 0))) go(dir)
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [active, atEdge, go, n])

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Frames — stacked, only the active one interactive/visible */}
      {frames.map((frame, i) => {
        const isActive = i === active
        return (
          <div
            key={i}
            aria-hidden={!isActive}
            className={cn(
              'absolute inset-0',
              'transition-opacity duration-[420ms] ease-[var(--ease-out-quick)]',
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            )}
          >
            <div
              ref={el => { scrollerRefs.current[i] = el }}
              className="h-full w-full overflow-y-auto overflow-x-hidden overscroll-contain"
            >
              {frame}
            </div>
          </div>
        )
      })}

      {/* Decode wipe overlay */}
      <DecodeWipe active={wiping} />

      {/* Side progress dots */}
      <nav
        aria-label="Frame navigation"
        className="fixed right-6 md:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-3"
      >
        {labels.map((label, i) => {
          const on = i === active
          return (
            <button
              key={label}
              type="button"
              onClick={() => jumpTo(i)}
              aria-current={on ? 'true' : undefined}
              aria-label={`Go to ${label}`}
              className="group flex items-center gap-3 cursor-pointer bg-transparent border-none p-0"
            >
              <span className={cn(
                'font-mono text-[var(--type-xs)] uppercase tracking-[0.14em]',
                'transition-all duration-[240ms] ease-[var(--ease-out-quick)]',
                on ? 'opacity-100 text-[var(--fg)]' : 'opacity-0 group-hover:opacity-60 text-[var(--fg-muted)]'
              )}>
                {label}
              </span>
              <span className={cn(
                'inline-block h-px bg-current transition-all duration-[320ms] ease-[var(--ease-out-quick)]',
                on ? 'w-6 text-[var(--accent)]' : 'w-2 text-[var(--fg-subtle)] group-hover:w-4'
              )} aria-hidden="true" />
            </button>
          )
        })}
      </nav>

      {/* Screen-reader position */}
      <p className="sr-only" aria-live="polite">
        {labels[active]} — frame {active + 1} of {n}
      </p>
    </div>
  )
}

/**
 * DecodeWipe — a band of monospace glyphs that sweeps top→bottom during a
 * frame change, like a teleprinter advancing the page. Pure DOM/CSS, cheap.
 */
function DecodeWipe({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 z-20 overflow-hidden',
        active ? 'opacity-100' : 'opacity-0',
        'transition-opacity duration-[160ms] ease-[var(--ease-out-quick)]'
      )}
    >
      <div className={cn('absolute inset-x-0', active ? 'animate-wipe-sweep' : '')}>
        <div className="wipe-band" />
      </div>
    </div>
  )
}
