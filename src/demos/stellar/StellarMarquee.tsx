'use client'

import { useEffect, useRef } from 'react'
import { S } from './tokens'

const ITEMS = [
  '🍅 tomatoes', '🥦 broccoli', '🧄 garlic', '🍋 lemon',
  '🫑 peppers',  '🥕 carrots',  '🍚 leftover rice', '🥚 eggs',
  '🧅 onion',    '🌿 herbs',
]
// doubled for seamless loop
const ALL = [...ITEMS, ...ITEMS]

/** Speed in pixels per second — adjustable without touching animation durations */
const PX_PER_S = 80

export function StellarMarquee() {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const xRef     = useRef(0)
  const rafRef   = useRef<number>(0)
  const lastRef  = useRef<number | null>(null)
  const pausedRef = useRef(false)

  useEffect(() => {
    const wrap  = wrapRef.current
    const track = trackRef.current
    if (!wrap || !track) return

    // Respect prefers-reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    let visible = false

    function step(ts: number) {
      if (!visible) { rafRef.current = 0; return }
      if (lastRef.current === null) lastRef.current = ts
      const dt = Math.min(ts - lastRef.current, 50) // cap at 50ms to avoid jump on tab-resume
      lastRef.current = ts

      if (!pausedRef.current && track) {
        const halfW = track.scrollWidth / 2
        xRef.current += PX_PER_S * (dt / 1000)
        if (xRef.current >= halfW) xRef.current -= halfW
        track.style.transform = `translateX(-${xRef.current}px)`
      }

      rafRef.current = requestAnimationFrame(step)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        lastRef.current = null // avoid a big dt jump after being scrolled back into view
        if (!rafRef.current) rafRef.current = requestAnimationFrame(step)
      }
    }, { threshold: 0 })
    io.observe(wrap)

    const onEnter = () => { pausedRef.current = true }
    const onLeave = () => { pausedRef.current = false }
    track.addEventListener('mouseenter', onEnter)
    track.addEventListener('mouseleave', onLeave)

    return () => {
      io.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      track.removeEventListener('mouseenter', onEnter)
      track.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={{
        overflow:     'hidden',
        borderTop:    `1px solid ${S.alpha.line}`,
        borderBottom: `1px solid ${S.alpha.line}`,
        padding:      '1.1rem 0',
        background:   S.alpha.onFill40,
        position:     'relative',
        zIndex:       2,
      }}
    >
      <div ref={trackRef} className="stellar-marquee-track">
        {ALL.map((item, i) => (
          <span key={i} className="stellar-marquee-item" style={{ fontFamily: S.font.display, fontWeight: 600, fontSize: '1.1rem', color: S.color.ink }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
