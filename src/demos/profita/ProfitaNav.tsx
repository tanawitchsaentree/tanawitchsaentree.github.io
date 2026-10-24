'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { P, rgbaFrom } from './tokens'

export function ProfitaNav() {
  const router    = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const barRef      = useRef<HTMLDivElement>(null)

  // "Scrolled" flips once, when a 30px sentinel at the top of the page leaves the
  // viewport. No scroll listener, no per-frame setState.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Progress bar: CSS scroll-driven animation where supported (no JS at all).
  // Fallback writes a transform directly, at most once per frame.
  useEffect(() => {
    if (typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()')) return
    const bar = barRef.current
    if (!bar) return
    let raf = 0
    const paint = () => {
      raf = 0
      const doc   = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      bar.style.transform = `scaleX(${total > 0 ? window.scrollY / total : 0})`
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint) }
    paint()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      <style>{`
        @keyframes prof-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @supports (animation-timeline: scroll()) {
          .prof-progress { animation: prof-progress auto cubic-bezier(0,0,1,1) both; animation-timeline: scroll(root block); }
        }
      `}</style>
      <div ref={sentinelRef} aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 30, pointerEvents: 'none' }} />

      {/* Progress bar */}
      <div ref={barRef} className="prof-progress" aria-hidden="true" style={{
        position:        'fixed',
        top:             0,
        left:            0,
        right:           0,
        height:          2,
        transform:       'scaleX(0)',
        transformOrigin: 'left center',
        background:      `linear-gradient(90deg, ${P.color.goldDeep}, ${P.color.gold}, ${P.color.goldSoft})`,
        zIndex:          100,
      }} />

      {/* Nav bar */}
      <nav style={{
        position:       'fixed',
        top:            0,
        left:           0,
        right:          0,
        zIndex:         50,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '1rem clamp(1.2rem,5vw,7.5rem)',
        // Solid-enough fill instead of a full-width backdrop blur that repaints on every scroll frame.
        background:     scrolled
          ? rgbaFrom(P.color.navy900Rgb, .94)
          : rgbaFrom(P.color.navy900Rgb, 0),
        borderBottom:   scrolled
          ? `1px solid ${P.alpha.line}`
          : '1px solid transparent',
        transition:     `background .4s ${P.ease.expo}, border-color .4s ${P.ease.expo}`,
        fontFamily:     P.font.mono,
      }}>
        {/* Left: back */}
        <button
          type="button"
          onClick={() => router.push('/')}
          aria-label="Back to portfolio"
          style={{
            fontFamily:  P.font.mono,
            fontSize:    '1rem',
            color:       P.color.onMut,
            background:  'none',
            border:      'none',
            cursor:      'pointer',
            padding:     '.75rem',
            marginLeft:  '-.75rem',
            display:     'inline-flex',
            alignItems:  'center',
            gap:         '.5em',
            transition:  `color .3s ${P.ease.expo}`,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = P.color.on)}
          onMouseLeave={e => (e.currentTarget.style.color = P.color.onMut)}
        >
          ← <span style={{ fontSize: '.8rem', letterSpacing: '.05em' }}>back</span>
        </button>

        {/* Center: title */}
        <span style={{
          position:      'absolute',
          left:          '50%',
          transform:     'translateX(-50%)',
          fontSize:      '.85rem',
          fontWeight:    700,
          letterSpacing: '.04em',
          color:         P.color.on,
        }}>
          Profita
        </span>

        {/* Right: label */}
        <span style={{
          fontSize:      '.72rem',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color:         P.color.onFaint,
        }}>
          Case study · LH Bank
        </span>
      </nav>
    </>
  )
}
