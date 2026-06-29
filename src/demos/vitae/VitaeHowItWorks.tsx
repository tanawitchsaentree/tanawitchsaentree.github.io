'use client'

import { V } from './tokens'
import { VitaeTrendsScreen } from './HowItWorks/VitaeTrendsScreen'

const STEPS = [
  { n: '01', text: <><b style={{ color: 'inherit', fontWeight: 600 }}>Steps, sleep, water, resting HR</b> — read on the wrist, normalised to your baseline.</> },
  { n: '02', text: <>A weighted sum maps to 0–100 and picks a plain <b style={{ color: 'inherit', fontWeight: 600 }}>verdict word.</b></> },
  { n: '03', text: <>Too few signals? It flags <b style={{ color: 'inherit', fontWeight: 600 }}>low confidence</b> rather than inventing a score.</> },
] as const

export function VitaeHowItWorks() {
  return (
    <section
      style={{
        background:   V.color.paper2,
        borderRadius: 36,
        margin:       '0 clamp(.8rem,2vw,2rem)',
        overflow:     'hidden',
      }}
    >
      <div
        style={{
          maxWidth: '80rem',
          margin:   '0 auto',
          padding:  'clamp(4rem,9vw,7rem) clamp(1.4rem,5vw,7.5rem)',
        }}
      >
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: '1fr .9fr',
            gap:                 'clamp(2rem,6vw,5rem)',
            alignItems:          'center',
          }}
          className="vitae-hiw-grid"
        >

          {/* ── copy column ── */}
          <div className="vitae-animate">
            <span style={{
              fontFamily:    V.font.mono,
              fontSize:      V.size.eyebrow,
              letterSpacing: '.26em',
              textTransform: 'uppercase',
              color:         V.color.limeDeep,
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '.7em',
            }}>
              <span style={{ display: 'inline-block', width: 26, height: 1.5, background: V.color.limeDeep }} />
              How it works
            </span>

            <h2 style={{
              fontFamily:    V.font.serif,
              fontWeight:    300,
              fontSize:      'clamp(1.9rem,4.2vw,3.2rem)',
              letterSpacing: '-.02em',
              lineHeight:    1.06,
              margin:        '1.1rem 0 1.3rem',
              maxWidth:      '18ch',
              color:         V.color.ink,
            }}>
              It says{' '}
              <em style={{ fontStyle: 'italic', color: V.color.limeDeep }}>&ldquo;I&rsquo;m not sure&rdquo;</em>{' '}
              before it says the wrong thing.
            </h2>

            <p style={{
              color:      V.color.inkSoft,
              fontSize:   '1.06rem',
              maxWidth:   '48ch',
              margin:     '0 0 1.8rem',
              fontFamily: V.font.sans,
              lineHeight: 1.65,
            }}>
              The score reads four on-device signals against your own 14-day baseline.
              On a normal day it lands a confident number. On a thin-data day — a missed
              night, a travel morning — it{' '}
              <b style={{ color: V.color.ink, fontWeight: 600 }}>shows its uncertainty instead of guessing.</b>{' '}
              That restraint is what let it pass clinical review.
            </p>

            <div style={{ display: 'grid', gap: '.2rem' }}>
              {STEPS.map(s => (
                <div key={s.n} style={{
                  display:      'flex',
                  gap:          '.9rem',
                  padding:      '.7rem 0',
                  borderBottom: `1px solid ${V.alpha.ink06}`,
                }}>
                  <span style={{
                    fontFamily: V.font.mono,
                    fontSize:   V.size.eyebrow,
                    color:      V.color.limeDeep,
                    flex:       'none',
                    width:      26,
                    paddingTop: '.2em',
                  }}>
                    {s.n}
                  </span>
                  <span style={{ fontSize: '1rem', color: V.color.inkSoft, lineHeight: 1.5, fontFamily: V.font.sans }}>
                    {s.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── phone column ── */}
          <div
            className="vitae-animate vitae-hiw-phone"
            style={{
              justifySelf:    'center',
              transitionDelay: V.motion.durationStagger,
            }}
          >
            <div style={{
              width:        'clamp(232px, 27vw, 300px)',
              aspectRatio:  '9 / 19.3',
              borderRadius: '13% / 6.5%',
              padding:      '2.6%',
              background:   V.gradient.phoneShell,
              boxShadow:    V.shadow.phoneRing,
              flexShrink:   0,
              position:     'relative',
            }}>
              <div style={{
                width:        '100%',
                height:       '100%',
                borderRadius: '11% / 5.6%',
                overflow:     'hidden',
                position:     'relative',
                background:   V.color.screenBg,
              }}>
                <VitaeTrendsScreen />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
