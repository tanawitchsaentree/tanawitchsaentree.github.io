'use client'

/**
 * FieldCanvas — Canvas2D point field, the homepage's hidden signature moment.
 * Asleep until toggled on; a pointer-reactive sine grid tinted with --accent.
 * Follows the same visibility-gated RAF pattern as GenerativeCover.tsx —
 * no WebGL/three.js, DPR-aware resize, static single frame under
 * prefers-reduced-motion instead of animating.
 */

import { useEffect, useRef } from 'react'

const COLS = 90
const ROWS = 50

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [224, 164, 88]
}

interface FieldCanvasProps {
  active: boolean
  pulseSignal?: number
  className?: string
  style?: React.CSSProperties
}

export function FieldCanvas({ active, pulseSignal, className, style }: FieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pulseRef   = useRef(0)

  useEffect(() => {
    if (pulseSignal) pulseRef.current = 1
  }, [pulseSignal])

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const DPR = Math.min(window.devicePixelRatio ?? 1, 2)
    const dims = { w: 0, h: 0 }

    // canvas fillStyle can't resolve var()/color-mix() reliably — read the
    // computed accent once and build rgba strings by hand (paint ops are
    // exempt from the token rule; kept aligned to --accent for consistency).
    const accentRGB = getComputedStyle(canvas).getPropertyValue('--accent').trim() || '#E0A458'
    const [ar, ag, ab] = hexToRgb(accentRGB)

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      dims.w = rect.width; dims.h = rect.height
      canvas!.width  = Math.round(rect.width  * DPR)
      canvas!.height = Math.round(rect.height * DPR)
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    function onPointerMove(e: PointerEvent) {
      pointer.tx = e.clientX / window.innerWidth
      pointer.ty = e.clientY / window.innerHeight
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    let raf = 0
    const start = performance.now()

    function draw(t: number) {
      const { w, h } = dims
      if (!w || !h) return
      ctx!.clearRect(0, 0, w, h)

      pointer.x += (pointer.tx - pointer.x) * 0.04
      pointer.y += (pointer.ty - pointer.y) * 0.04
      const pulse = pulseRef.current

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const nx = col / (COLS - 1)
          const ny = row / (ROWS - 1)
          const px = nx * w
          const py = ny * h

          const dx = nx - pointer.x
          const dy = ny - pointer.y
          const dist = Math.hypot(dx, dy)
          const ripple = Math.max(0, 0.35 - dist) * (1 + pulse * 2)

          const wobble = Math.sin(nx * 6 + t * 0.6) * 0.5 + Math.cos(ny * 5 + t * 0.45) * 0.5
          const r = 0.6 + wobble * 0.4 + ripple * 2.4

          const alpha = Math.min(1, 0.12 + wobble * 0.06 + ripple * 0.5 + pulse * 0.08)
          ctx!.beginPath()
          ctx!.arc(px, py, Math.max(0.3, r), 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${ar}, ${ag}, ${ab}, ${alpha})`
          ctx!.fill()
        }
      }

      pulseRef.current *= 0.96
    }

    if (reduced) {
      resize()
      draw(0)
      return () => { ro.disconnect(); window.removeEventListener('pointermove', onPointerMove) }
    }

    function frame() {
      draw((performance.now() - start) / 1000)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  )
}
