'use client'

import { useEffect, useRef, useState } from 'react'
import { useMotion } from '@/hooks/useMotion'

/**
 * Custom cursor — pointer:fine + motion allowed only.
 *
 * Architecture: ring (fast) leads, dot (slight lag) follows for organic feel.
 * No mix-blend-mode — pure border/fill on top of a --bg box-shadow halo.
 *
 * States:
 *   default    ring 12px + dot 4px
 *   button     ring 32px, dot stays
 *   text       ring 2px × 24px vertical line, dot hidden
 *   diagram    ring 56px + "explore" label, dot hidden
 */

type CursorState = 'default' | 'button' | 'text' | 'diagram'

export function CustomCursor() {
  const motionAllowed = useMotion()
  const [active, setActive] = useState(false)
  const [state, setState] = useState<CursorState>('default')

  const ringRef  = useRef<HTMLDivElement>(null)
  const dotRef   = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  const posRef = useRef({ x: -100, y: -100 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const isPointerFine = window.matchMedia('(pointer: fine)').matches
    if (!isPointerFine || !motionAllowed) return

    setActive(true)
    document.documentElement.style.cursor = 'none'

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

    // Ring leads (fast), dot trails slightly for organic feel.
    // The rAF loop only runs while either mark is still travelling toward the
    // pointer; it stops once both are within 0.1px and restarts on the next move.
    let ringX = -100, ringY = -100
    let dotX  = -100, dotY  = -100
    let primed = false
    let last = 0
    const RING_T = 0.5
    const DOT_T  = 0.38
    const EPS    = 0.1

    function tick(now: number) {
      rafRef.current = null
      // time-based easing so the trail feels the same at 60 Hz and 120 Hz
      const frames = last ? Math.min((now - last) / 16.67, 4) : 1
      last = now
      const rt = 1 - Math.pow(1 - RING_T, frames)
      const dt = 1 - Math.pow(1 - DOT_T, frames)
      const ring = ringRef.current
      const dot  = dotRef.current
      if (!ring || !dot) { rafRef.current = requestAnimationFrame(tick); return }

      const tx = posRef.current.x
      const ty = posRef.current.y

      ringX = lerp(ringX, tx, rt)
      ringY = lerp(ringY, ty, rt)
      dotX  = lerp(dotX,  tx, dt)
      dotY  = lerp(dotY,  ty, dt)

      const settled =
        Math.abs(tx - ringX) < EPS && Math.abs(ty - ringY) < EPS &&
        Math.abs(tx - dotX)  < EPS && Math.abs(ty - dotY)  < EPS
      if (settled) { ringX = dotX = tx; ringY = dotY = ty }

      ring.style.transform = `translate(${ringX}px, ${ringY}px)`
      dot.style.transform  = `translate(${dotX}px, ${dotY}px)`

      if (!settled) rafRef.current = requestAnimationFrame(tick)
      else last = 0
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return // touch/pen on hybrids keep the native cursor path
      posRef.current = { x: e.clientX, y: e.clientY }
      // First move: jump straight to the pointer instead of sliding in from -100.
      if (!primed) { primed = true; ringX = dotX = e.clientX; ringY = dotY = e.clientY }
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick)
    }

    // Single DOM walk instead of three — closest() with a combined selector,
    // then branch on which part matched.
    function onOver(e: MouseEvent) {
      const t = e.target as Element
      const match = t.closest(
        '[data-cursor="diagram"], [data-cursor="button"], button, a, summary, [role="button"], [data-cursor="text"], h1, h2, h3'
      )
      if (!match)                                             { setState('default'); return }
      if (match.matches('[data-cursor="diagram"]'))            setState('diagram')
      else if (match.matches('[data-cursor="button"], button, a, summary, [role="button"]')) setState('button')
      else                                                      setState('text')
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('mouseover', onOver)
      document.documentElement.style.cursor = ''
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [motionAllowed])

  if (!active) return null

  const isDiagram = state === 'diagram'
  const isButton  = state === 'button'
  const isText    = state === 'text'

  // Ring geometry
  const ringW = isText ? 2 : isDiagram ? 56 : isButton ? 32 : 12
  const ringH = isText ? 24 : ringW
  const ringR = isText ? 1 : '50%'

  // Dot visibility
  const dotHidden = isText || isDiagram

  const TRANSITION = 'width 200ms cubic-bezier(0.22,1,0.36,1), height 200ms cubic-bezier(0.22,1,0.36,1), border-radius 200ms cubic-bezier(0.22,1,0.36,1), opacity 150ms cubic-bezier(0.22,1,0.36,1)'

  return (
    <>
      {/* Ring — leads */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         ringW,
          height:        ringH,
          borderRadius:  typeof ringR === 'number' ? ringR : ringR,
          border:        '1px solid var(--cursor-ring, var(--fg))',
          background:    'transparent',
          // bg halo keeps ring visible against any surface
          boxShadow:     '0 0 0 1px var(--bg)',
          pointerEvents: 'none',
          zIndex:         9999,
          marginLeft:    -(ringW / 2),
          marginTop:     -(ringH / 2),
          willChange:    'transform',
          transition:    TRANSITION,
          display:       'flex',
          alignItems:    'center',
          justifyContent:'center',
        }}
      >
        {isDiagram && (
          <span
            ref={labelRef}
            style={{
              position:      'absolute',
              top:           '100%',
              marginTop:     8,
              fontFamily:    "'IBM Plex Mono', monospace",
              fontSize:      9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color:         'var(--cursor-ring, var(--fg))',
              userSelect:    'none',
              whiteSpace:    'nowrap',
              opacity:       1,
            }}
          >
            explore
          </span>
        )}
      </div>

      {/* Dot — trails */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         4,
          height:        4,
          borderRadius:  '50%',
          background:    'var(--cursor-ring, var(--fg))',
          // bg halo keeps dot visible on any surface
          boxShadow:     '0 0 0 1px var(--bg)',
          pointerEvents: 'none',
          zIndex:         9998,
          marginLeft:    -2,
          marginTop:     -2,
          willChange:    'transform',
          opacity:       dotHidden ? 0 : 1,
          transition:    'opacity 150ms cubic-bezier(0.22,1,0.36,1)',
        }}
      />
    </>
  )
}
