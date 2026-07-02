'use client'

import { useState } from 'react'
import { P } from './tokens'

const NEWCOMER = [
  '"I don\'t know where to start."',
  '"What if I lose all my money?"',
  '"I need an expert — this isn\'t for me."',
  '"All these numbers. I don\'t understand."',
]

const EXPERIENCED = [
  'Show me my portfolio performance immediately.',
  'I need real-time NAV data.',
  'Give me fund comparison tools.',
  'I want control over rebalancing.',
]

const PROCESS = [
  'Mapped 34 user journeys across both segments',
  'Tested 3 IA variations with 8 participants each',
  'Settled on progressive disclosure — simple surface, depth available on demand',
]

export function ProfitaTension() {
  const [open, setOpen] = useState(false)

  return (
    <section
      id="tension"
      className="prof-animate"
      style={{ padding: 'clamp(4rem,9vw,7rem) 0', fontFamily: P.font.body }}
    >
      <div className="prof-wrap">
        <p className="prof-kick">02 · The tension</p>

        <h2 style={{
          fontFamily:    P.font.disp,
          fontWeight:    400,
          fontSize:      'clamp(1.8rem,4vw,3.2rem)',
          lineHeight:    1.12,
          letterSpacing: '-.02em',
          color:         P.color.on,
          maxWidth:      '22ch',
          marginBottom:  '.8rem',
        }}>
          One app. Two very different users.
        </h2>

        <p style={{ color: P.color.onMut, maxWidth: '52ch', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          We were designing for beginners — but the existing LH Bank customers were experienced
          investors who needed depth. The tension defined every decision.
        </p>

        {/* Two-column tension grid */}
        <div className="prof-grid-2" style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 '1px',
          background:          P.alpha.line,
          border:              `1px solid ${P.alpha.line}`,
          borderRadius:        16,
          overflow:            'hidden',
          marginBottom:        '1.5rem',
          maxWidth:            760,
        }}>
          {/* Newcomer column */}
          <div style={{ background: P.alpha.white07, padding: '1.8rem 1.6rem' }}>
            <p style={{
              fontFamily:    P.font.mono,
              fontSize:      '.65rem',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color:         P.color.gold,
              marginBottom:  '1.2rem',
            }}>
              Newcomer
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
              {NEWCOMER.map((line, i) => (
                <p key={i} style={{
                  fontFamily: P.font.disp,
                  fontStyle:  'italic',
                  fontWeight: 400,
                  fontSize:   '1rem',
                  color:      P.color.onMut,
                  lineHeight: 1.5,
                  margin:     0,
                }}>{line}</p>
              ))}
            </div>
          </div>

          {/* Experienced column */}
          <div style={{ background: P.alpha.white06, padding: '1.8rem 1.6rem' }}>
            <p style={{
              fontFamily:    P.font.mono,
              fontSize:      '.65rem',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color:         P.color.onFaint,
              marginBottom:  '1.2rem',
            }}>
              Experienced investor
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
              {EXPERIENCED.map((line, i) => (
                <p key={i} style={{
                  fontSize:   '.94rem',
                  color:      P.color.onMut,
                  lineHeight: 1.55,
                  margin:     0,
                }}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Italic resolution note */}
        <p style={{
          fontFamily:  P.font.disp,
          fontStyle:   'italic',
          fontSize:    '1.05rem',
          color:       P.color.onFaint,
          maxWidth:    '50ch',
          lineHeight:  1.65,
          marginBottom:'2rem',
        }}>
          The answer wasn&rsquo;t to simplify for one and exclude the other.
          It was to make the simple surface undeniably good, and hide the depth
          where it wouldn&rsquo;t scare anyone.
        </p>

        {/* Collapsible process */}
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
            marginTop:     '1.2rem',
            listStyle:     'none',
            padding:       0,
            display:       'flex',
            flexDirection: 'column',
            gap:           '.75rem',
          }}>
            {PROCESS.map((item, i) => (
              <li key={i} style={{
                display:    'flex',
                gap:        '1rem',
                fontSize:   '.92rem',
                color:      P.color.onMut,
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
    </section>
  )
}
