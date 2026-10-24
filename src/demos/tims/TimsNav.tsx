'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { T } from './tokens'

export function TimsNav() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // A 20px sentinel at the top of the page replaces the scroll listener:
  // the border shows once it leaves the viewport, with no work per scroll frame.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const handleBack = () => { router.push('/') }

  const links = [
    { href: '#counter', label: 'The counter' },
    { href: '#problem',  label: 'The problem'  },
    { href: '#demo',     label: 'The build'    },
    { href: '#real',     label: 'Real orders'  },
    { href: '#learned',  label: 'What I learned'},
  ]

  return (
    <>
    <div ref={sentinelRef} aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 20, pointerEvents: 'none' }} />
    <nav
      style={{
        position:       'fixed',
        top:            0,
        left:           0,
        right:          0,
        zIndex:         50,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '1.05rem clamp(1.2rem,5vw,7.5rem)',
        // Solid paper instead of backdrop blur: same look over this page's flat sections, no per-frame blur cost.
        background:     `color-mix(in srgb, ${T.color.cream} 94%, transparent)`,
        borderBottom:   scrolled ? `1px solid ${T.alpha.line}` : '1px solid transparent',
        transition:     `border-color .4s ${T.ease.expo}`,
        fontFamily:     T.font.sans,
      }}
    >
      {/* left: back to work */}
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        style={{
          fontFamily: T.font.mono,
          fontSize:   '1rem',
          color:      T.color.inkSoft,
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
      <div className="tims-nav-links" style={{ display: 'flex', gap: '1.5rem', fontSize: '.9rem', color: T.color.inkSoft }}>
        {links.map(l => (
          <a key={l.href} href={l.href} style={{ color: 'inherit', textDecoration: 'none', position: 'relative', padding: '.2rem 0' }}
            className="tims-nav-link"
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
    </>
  )
}
