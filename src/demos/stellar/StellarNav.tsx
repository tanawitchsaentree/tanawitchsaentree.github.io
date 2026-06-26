'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { S } from './tokens'

export function StellarNav() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
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
        backdropFilter: 'blur(13px) saturate(160%)',
        background:     S.alpha.paper66,
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
  )
}
