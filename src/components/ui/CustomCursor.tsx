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

    // Ring leads (fast), dot trails slightly for organic feel
    let ringX = -100, ringY = -100
    let dotX  = -100, dotY  = -100

    function tick() {
      const ring = ringRef.current
      const dot  = dotRef.current
      if (!ring || !dot) { rafRef.current = requestAnimationFrame(tick); return }

      const tx = posRef.current.x
      const ty = posRef.current.y

      ringX = lerp(ringX, tx, 0.80)
      ringY = lerp(ringY, ty, 0.80)
      dotX  = lerp(dotX,  tx, 0.55)
      dotY  = lerp(dotY,  ty, 0.55)

      ring.style.transform = `translate(${ringX}px, ${ringY}px)`
      dot.style.transform  = `translate(${dotX}px,  ${dotY}px)`

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    function onMove(e: MouseEvent) {
      posRef.current = { x: e.clientX, y: e.clientY }
    }

    function onOver(e: MouseEvent) {
      const t = e.target as Element
      if      (t.closest('[data-cursor="diagram"]'))                         setState('diagram')
      else if (t.closest('[data-cursor="button"]') ||
               t.closest('button, a, [role="button"]'))                     setState('button')
      else if (t.closest('[data-cursor="text"]') || t.closest('h1,h2,h3')) setState('text')
      else                                                                   setState('default')
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      document.documentElement.style.cursor = ''
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
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

  const TRANSITION = 'width 200ms cubic-bezier(0.22,1,0.36,1), height 200ms cubic-bezier(0.22,1,0.36,1), border-radius 200ms cubic-bezier(0.22,1,0.36,1), opacity 150ms ease'

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
              fontFamily:    'monospace',
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
          transition:    'opacity 150ms ease',
        }}
      />
    </>
  )
}
