'use client'

import { useState } from 'react'
import { P } from './tokens'

const PROCESS = [
  'Ran diary studies with 12 first-time investors over 3 weeks',
  'Mapped 6 competing apps to understand where anxiety spikes',
  'Ran co-design workshops with the Robowealth product team',
  'Synthesised into 3 core friction clusters: language, trust, and first-step paralysis',
]

export function ProfitaProblem() {
  const [open, setOpen] = useState(false)

  return (
    <section
      id="problem"
      className="prof-animate"
      style={{ padding: 'clamp(4rem,9vw,7rem) 0', fontFamily: P.font.body }}
    >
      <div className="prof-wrap">
        <p className="prof-kick">01 · The problem</p>

        <h2 style={{
          fontFamily:    P.font.disp,
          fontWeight:    400,
          fontSize:      'clamp(1.8rem,4vw,3.2rem)',
          lineHeight:    1.12,
          letterSpacing: '-.02em',
          color:         P.color.on,
          maxWidth:      '22ch',
          marginBottom:  '1.4rem',
        }}>
          Most people who needed to invest{' '}
          <em style={{ fontStyle: 'italic', color: P.color.gold }}>
            didn&rsquo;t believe they could.
          </em>
        </h2>

        <div style={{ maxWidth: '58ch' }}>
          <p style={{ color: P.color.onMut, lineHeight: 1.72, marginBottom: '1rem' }}>
            LH Bank wanted to democratise mutual fund investment in Thailand. The opportunity
            was real — millions of potential investors existed, but the category spoke entirely
            to people who already knew what an NAV was. Everyone else felt locked out.
          </p>
          <p style={{ color: P.color.onMut, lineHeight: 1.72, marginBottom: '2rem' }}>
            Our challenge: design an experience where <strong style={{ color: P.color.on }}>
            someone who has never invested</strong> can take their first step in under five
            minutes — and feel confident doing it.
          </p>

          {/* Collapsible behind-this */}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            style={{
              fontFamily:    P.font.mono,
              fontSize:      '.72rem',
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color:         P.color.gold,
              background:    P.alpha.gold10,
              border:        `1px solid ${P.alpha.gold35}`,
              borderRadius:  8,
              padding:       '.5rem 1rem',
              cursor:        'pointer',
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '.5em',
              transition:    `background .25s ${P.ease.expo}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = P.alpha.gold20)}
            onMouseLeave={e => (e.currentTarget.style.background = P.alpha.gold10)}
            aria-expanded={open}
          >
            <span>{open ? '−' : '+'}</span> Behind this
          </button>

          {open && (
            <ul style={{
              marginTop:  '1.2rem',
              listStyle:  'none',
              padding:    0,
              display:    'flex',
              flexDirection: 'column',
              gap:        '.75rem',
            }}>
              {PROCESS.map((item, i) => (
                <li key={i} style={{
                  display:  'flex',
                  gap:      '1rem',
                  fontSize: '.92rem',
                  color:    P.color.onMut,
                  lineHeight: 1.55,
                }}>
                  <span style={{
                    fontFamily:    P.font.mono,
                    fontSize:      '.62rem',
                    color:         P.color.gold,
                    flexShrink:    0,
                    marginTop:     '.2rem',
                    letterSpacing: '.06em',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
