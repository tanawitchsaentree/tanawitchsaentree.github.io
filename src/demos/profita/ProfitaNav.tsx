'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { P } from './tokens'

export function ProfitaNav() {
  const router    = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress]  = useState(0)

  useEffect(() => {
    const h = () => {
      const doc     = document.documentElement
      const scrolled = window.scrollY
      const total   = doc.scrollHeight - doc.clientHeight
      setScrolled(scrolled > 30)
      setProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <>
      {/* Progress bar */}
      <div style={{
        position:   'fixed',
        top:        0,
        left:       0,
        height:     2,
        width:      `${progress}%`,
        background: `linear-gradient(90deg, ${P.color.goldDeep}, ${P.color.gold}, ${P.color.goldSoft})`,
        zIndex:     100,
        transition: `width .1s ${P.ease.smooth}`,
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
        backdropFilter: 'blur(14px) saturate(160%)',
        background:     scrolled
          ? `rgba(12,28,51,.72)`
          : `rgba(12,28,51,0)`,
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
