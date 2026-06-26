'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { V } from './tokens'

export function VitaeNav() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  const handleBack = () => { router.push('/') }

  return (
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
        backdropFilter:   'blur(14px) saturate(150%)',
        background:       scrolled ? V.alpha.paper82 : V.alpha.paper60,
        borderBottom:     scrolled ? `1px solid ${V.alpha.ink10}` : '1px solid transparent',
        transition:       `border-color 400ms ${V.ease.quart}, background 400ms ${V.ease.quart}`,
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
        {(['Process', 'Phases', 'The Build', 'Outcome'] as const).map((label, i) => {
          const href = ['#loop', '#phases', '#build', '#outcome'][i]
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
  )
}
