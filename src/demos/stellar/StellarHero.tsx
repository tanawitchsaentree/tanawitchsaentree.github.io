'use client'

import { useEffect, useRef } from 'react'
import { S } from './tokens'

// 3 depth layers — far moves barely, near moves dramatically
// negative depth = moves AGAINST the mouse (adds visual complexity)
const VEGS = [
  // FAR  — tiny, whisper-level, peek from edges
  { emoji: '🌿', depth:  6, style: { top: '19%',    left: '-1%',  fontSize: 'clamp(1.1rem,1.8vw,1.7rem)' } },
  { emoji: '🥕', depth: -7, style: { bottom: '24%', left: '5%',   fontSize: 'clamp(1.1rem,1.8vw,1.6rem)' } },

  // MID  — medium, scattered across the field
  { emoji: '🍅', depth:  15, style: { top: '10%',    right: '20%', fontSize: 'clamp(1.7rem,3vw,2.8rem)'   } },
  { emoji: '🥦', depth: -16, style: { top: '60%',    right: '30%', fontSize: 'clamp(1.6rem,2.8vw,2.6rem)' } },
  { emoji: '🧅', depth:  13, style: { bottom: '32%', left: '16%',  fontSize: 'clamp(1.5rem,2.6vw,2.3rem)' } },

  // NEAR — large, maximum parallax, create depth drama
  { emoji: '🍋', depth:  28, style: { top: '18%',    right: '3%',  fontSize: 'clamp(2.8rem,5.5vw,5rem)'   } },
  { emoji: '🫑', depth: -26, style: { bottom: '7%',  right: '12%', fontSize: 'clamp(2.5rem,5vw,4.4rem)'   } },
  { emoji: '🧄', depth:  22, style: { top: '48%',    right: '44%', fontSize: 'clamp(2rem,4vw,3.5rem)'     } },
]

export function StellarHero() {
  const vegRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let tx = 0, ty = 0      // mouse target (normalised –0.5 to 0.5)
    let cx = 0, cy = 0      // current lerped mouse
    let tsy = 0, csy = 0   // scroll target / lerped

    const onMove = (e: MouseEvent) => {
      tx = e.clientX / window.innerWidth  - 0.5
      ty = e.clientY / window.innerHeight - 0.5
    }
    const onScroll = () => { tsy = window.scrollY }

    window.addEventListener('mousemove', onMove,   { passive: true })
    window.addEventListener('scroll',    onScroll, { passive: true })

    let raf: number
    const frame = () => {
      // lerp — lazy 6% per frame = lush, premium feel
      cx  += (tx  - cx)  * 0.06
      cy  += (ty  - cy)  * 0.06
      csy += (tsy - csy) * 0.08

      vegRefs.current.forEach((v, i) => {
        if (!v) return
        const d = VEGS[i].depth
        v.style.transform = `translate(${cx * d}px, ${cy * d - csy * d * 0.04}px) rotate(${cx * d * 0.35}deg)`
      })
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <header
      className="stellar-hero"
      style={{
        minHeight:    '100vh',
        display:      'grid',
        alignContent: 'center',
        position:     'relative',
        padding:      '7rem 0 3rem',
        overflow:     'hidden',
      }}
    >
      {/* floating produce — 3-layer depth field */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        {VEGS.map((v, i) => {
          const d = Math.abs(v.depth)
          const shadow = d > 20
            ? `drop-shadow(0 ${d}px ${d * 2}px ${S.alpha.ink25})`
            : d > 10
              ? `drop-shadow(0 ${Math.round(d * 0.8)}px ${d * 1.6}px ${S.alpha.ink18})`
              : `drop-shadow(0 6px 12px ${S.alpha.ink12})`
          return (
            <span
              key={v.emoji}
              ref={el => { vegRefs.current[i] = el }}
              className={`stellar-veg stellar-veg-${i + 1}`}
              style={{
                position:   'absolute',
                filter:     shadow,
                willChange: 'transform',
                ...v.style,
              }}
            >
              {v.emoji}
            </span>
          )
        })}
      </div>

      <div className="stellar-wrap" style={{ position: 'relative', zIndex: 2 }}>
        <span className="stellar-label" style={{ marginBottom: '1.4rem' }}>
          Mobile · AI cooking app · sole designer
        </span>

        <h1 className="stellar-hero-h1">
          <span className="stellar-l1"><span>Your fridge is</span></span>
          <span className="stellar-l1"><span><em style={{ fontFamily: S.font.italic, fontStyle: 'italic', fontWeight: 500, color: S.color.greenDeep }}>full.</em> Dinner</span></span>
          <span className="stellar-l1"><span>still feels</span></span>
          <span className="stellar-l1"><span>impossible.</span></span>
        </h1>

        <p className="stellar-hero-lead">
          Stellar is an AI cooking companion built around one stubborn truth: people waste food they own and still don&apos;t know what to make. So I designed an app that cooks from what&apos;s already in your kitchen.
        </p>

        <div className="stellar-meta">
          <div><b>Role</b><span>Sole designer · UX/UI</span></div>
          <div><b>Scope</b><span>End-to-end · mobile</span></div>
          <div><b>Grounded in</b><span>6 interviews · 20+ surveyed</span></div>
          <div><b>Year</b><span>2024</span></div>
        </div>
      </div>
    </header>
  )
}
