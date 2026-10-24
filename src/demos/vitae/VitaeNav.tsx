'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { V } from './tokens'

export function VitaeNav() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const sentinelRef = useRef<HTMLSpanElement>(null)

  // A 20px sentinel at the top of the page replaces the per-scroll listener.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const handleBack = () => { router.push('/') }

  return (
    <>
    <span ref={sentinelRef} aria-hidden style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 20, pointerEvents: 'none' }} />
    <nav
      aria-label="VITAE case study navigation"
      style={{
        position:         'fixed',
        top:              0,
        left:             0,
        right:            0,
        zIndex:           50,
        display:          'flex',
        alignItems:       'center',
        justifyContent:   'space-between',
        padding:          '1.1rem clamp(1.2rem,5vw,7.5rem)',
        // solid paper instead of a full-width backdrop blur (repaints every scroll frame)
        background:       `color-mix(in srgb, ${V.color.paper} ${scrolled ? 97 : 92}%, transparent)`,
        borderBottom:     scrolled ? `1px solid ${V.alpha.ink10}` : '1px solid transparent',
        transition:       `border-color ${V.motion.durationNav} ${V.ease.quart}, background ${V.motion.durationNav} ${V.ease.quart}`,
      }}
    >
      {/* left: back to work */}
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        style={{
          fontFamily: V.font.mono,
          fontSize:   '1rem',
          color:      V.color.inkSoft,
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          padding:    '.75rem',
          marginLeft: '-.75rem',
          display:    'inline-flex',
          alignItems: 'center',
        }}
      >
        ←
      </button>

      {/* right: section links */}
      <div
        className="vitae-nav-links"
        style={{
          display:    'flex',
          gap:        '1.6rem',
          fontSize:   '1rem',
          color:      V.color.inkSoft,
          fontFamily: V.font.sans,
        }}
      >
        {(['The room', 'The reframe', 'The loop', 'The calls', 'What moved'] as const).map((label, i) => {
          const href = ['#room', '#reframe', '#loop', '#forks', '#moved'][i]
          return (
            <a
              key={label}
              href={href}
              style={{ color: 'inherit', textDecoration: 'none', fontSize: 'inherit' }}
            >
              {label}
            </a>
          )
        })}
      </div>
    </nav>
    </>
  )
}
