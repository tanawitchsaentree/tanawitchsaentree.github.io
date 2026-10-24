'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { S } from './tokens'

export function StellarNav() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const sentinelRef = useRef<HTMLSpanElement>(null)
  // A 1px sentinel 20px below the page top. Once it leaves the viewport the nav
  // gets its hairline. No scroll listener, no per-frame work.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const handleBack = () => { router.push('/') }

  const links = [
    { href: '#problem',  label: 'The problem' },
    { href: '#heard',    label: 'What I heard' },
    { href: '#idea',     label: 'The idea'     },
    { href: '#build',    label: 'The build'    },
    { href: '#learned',  label: 'Reflection'   },
  ]

  return (
    <>
    <span ref={sentinelRef} aria-hidden style={{ position: 'absolute', top: 20, left: 0, width: 1, height: 1, pointerEvents: 'none' }} />
    <nav
      style={{
        position:       'fixed',
        top:            0,
        left:           0,
        right:          0,
        zIndex:         60,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        `1rem clamp(1.2rem,5vw,7.5rem)`,
        // Solid near-opaque paper instead of a live backdrop blur: the blur
        // re-rasterised the content under the fixed bar on every scroll frame.
        background:     'color-mix(in srgb, var(--stellar-paper) 94%, transparent)',
        borderBottom:   scrolled ? `1px solid ${S.alpha.line}` : '1px solid transparent',
        transition:     `border-color .4s ${S.ease.expo}`,
        fontFamily:     S.font.body,
      }}
    >
      {/* left side: back button replaces the standalone BackLink */}
      <button
        type="button"
        onClick={handleBack}
        aria-label="Back"
        style={{
          fontFamily: S.font.mono,
          fontSize:   '1rem',
          color:      S.color.inkSoft,
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

      {/* right side: section links */}
      <div className="stellar-nav-links" style={{ display: 'flex', gap: '1.5rem', fontSize: '.85rem', color: S.color.inkSoft }}>
        {links.map(l => (
          <a
            key={l.href}
            href={l.href}
            className="stellar-nav-link"
            style={{ color: 'inherit', textDecoration: 'none', position: 'relative', padding: '.2rem 0' }}
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
    </>
  )
}
