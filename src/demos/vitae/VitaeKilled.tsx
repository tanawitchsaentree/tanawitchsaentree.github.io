'use client'

import { V } from './tokens'
import { VitaeKilledScreen } from './KilledScreen/VitaeKilledScreen'

const PTS = [
  {
    type: 'no' as const,
    text: <><b style={{ color: V.color.ink, fontWeight: 600 }}>Rejected:</b> an absolute number implies a medical claim and can falsely reassure.</>,
  },
  {
    type: 'yes' as const,
    text: <><b style={{ color: V.color.ink, fontWeight: 600 }}>Shipped:</b> the same glance, scored against your own baseline — honest, and defensible.</>,
  },
]

const FLAG_RED = V.color.dangerRed
const FLAG_BG  = V.color.dangerBg

export function VitaeKilled() {
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
            gridTemplateColumns: '.9fr 1fr',
            gap:                 'clamp(2rem,6vw,5rem)',
            alignItems:          'center',
          }}
          className="vitae-killed-grid"
        >

          {/* ── copy column ── */}
          <div className="vitae-animate">
            <span style={{
              fontFamily:    V.font.mono,
              fontSize:      V.size.eyebrow,
              letterSpacing: '.26em',
              textTransform: 'uppercase',
              color:         FLAG_RED,
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '.7em',
            }}>
              <span style={{ display: 'inline-block', width: 26, height: 1.5, background: FLAG_RED }} />
              The one we killed
            </span>

            <h2 style={{
              fontFamily:    V.font.serif,
              fontWeight:    300,
              fontSize:      'clamp(1.9rem,4.2vw,3.2rem)',
              letterSpacing: '-.02em',
              lineHeight:    1.06,
              margin:        '1.1rem 0 1.3rem',
              maxWidth:      '17ch',
              color:         V.color.ink,
            }}>
              The cleaner screen was the{' '}
              <em style={{ fontStyle: 'italic', color: V.color.ink }}>dangerous</em>{' '}
              one.
            </h2>

            <p style={{
              color:      V.color.inkSoft,
              fontSize:   '1.06rem',
              maxWidth:   '46ch',
              margin:     '0 0 1.6rem',
              fontFamily: V.font.sans,
              lineHeight: 1.65,
            }}>
              An absolute &ldquo;health score&rdquo; looked sharper and product loved it.
              Clinical killed it in one review: a confident number that{' '}
              <b style={{ color: V.color.ink, fontWeight: 600 }}>
                can&rsquo;t tell a great day from a sickening one
              </b>{' '}
              is a lie dressed as simplicity.
            </p>

            <div style={{ display: 'grid', gap: '.7rem' }}>
              {PTS.map((pt, i) => (
                <div
                  key={i}
                  style={{
                    display:    'flex',
                    gap:        '.7rem',
                    fontSize:   '1rem',
                    color:      V.color.inkSoft,
                    lineHeight: 1.5,
                    fontFamily: V.font.sans,
                  }}
                >
                  <span style={{
                    width:        18,
                    height:       18,
                    borderRadius: '50%',
                    flexShrink:   0,
                    display:      'grid',
                    placeContent: 'center',
                    marginTop:    '.15em',
                    background:   pt.type === 'no' ? FLAG_BG : V.color.limeCard,
                    color:        pt.type === 'no' ? FLAG_RED : V.color.limeText,
                  }}>
                    {pt.type === 'no'
                      ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    }
                  </span>
                  <span>{pt.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── phone column ── */}
          <div
            className="vitae-animate vitae-killed-phone"
            style={{
              justifySelf:     'center',
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
                <VitaeKilledScreen />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
