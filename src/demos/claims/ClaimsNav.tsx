'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { C } from './tokens'

const LINKS = [
  { href: '#exhibit', label: 'Exhibit' },
  { href: '#shift',   label: '01 Shift' },
  { href: '#loop',    label: '02 Loop' },
  { href: '#skeleton',label: '03 Skeleton' },
  { href: '#broke',   label: '04 Broke' },
  { href: '#ripple',  label: '05 Ripple' },
]

export function ClaimsNav() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <nav style={{
      position:       'fixed',
      top:            0, left: 0, right: 0,
      zIndex:         60,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      padding:        `0.75rem clamp(1.1rem,4vw,2.4rem)`,
      backdropFilter: 'blur(12px)',
      background:     `color-mix(in srgb,${C.color.bg} 80%,transparent)`,
      borderBottom:   scrolled ? `1px solid ${C.color.line}` : '1px solid transparent',
      transition:     `border-color .35s ${C.ease.std}`,
      fontFamily:     C.font.mono,
      fontSize:       '.72rem',
      color:          C.color.txDim,
    }}>
      <button
        type="button"
        onClick={() => router.push('/')}
        style={{
          fontFamily: C.font.mono, fontSize: '.82rem',
          color: C.color.txDim, background: 'none', border: 'none',
          cursor: 'pointer', padding: '.5rem',
          marginLeft: '-.5rem', display: 'inline-flex', alignItems: 'center', gap: '.4rem',
        }}
      >
        ← back
      </button>
      <div style={{ display: 'flex', gap: '1.4rem', flexWrap: 'wrap' }}>
        {LINKS.map(l => (
          <a key={l.href} href={l.href} style={{ color: 'inherit', textDecoration: 'none' }}>
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
