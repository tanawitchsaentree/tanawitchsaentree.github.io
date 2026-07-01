'use client'

import { P } from './tokens'

const SWATCHES = [
  { name: 'Navy',  sub: 'Primary',   hex: P.color.navy900, bg: P.color.navy900,  text: P.color.on      },
  { name: 'Gold',  sub: 'Accent',    hex: P.color.gold,    bg: P.color.gold,     text: P.color.navy900 },
  { name: 'Paper', sub: 'Surface',   hex: P.color.paper,   bg: P.color.paper,    text: P.color.navy900 },
  { name: 'Ink',   sub: 'On-navy',   hex: P.color.on,      bg: P.alpha.white10,  text: P.color.on      },
] as const

const TYPE_WEIGHTS = [
  { w: '400', label: 'Regular' },
  { w: '500', label: 'Medium'  },
  { w: '600', label: 'SemiBold'},
  { w: '700', label: 'Bold'    },
] as const

export function ProfitaSystem() {
  return (
    <section
      id="system"
      className="prof-animate"
      style={{
        padding:    'clamp(4rem,9vw,7rem) 0',
        background: P.color.navy800,
        fontFamily: P.font.body,
      }}
    >
      <div className="prof-wrap">
        <p className="prof-kick">05 · The system</p>

        <h2 style={{
          fontFamily:    P.font.disp,
          fontWeight:    400,
          fontSize:      'clamp(1.8rem,4vw,3.2rem)',
          lineHeight:    1.12,
          letterSpacing: '-.02em',
          color:         P.color.on,
          maxWidth:      '20ch',
          marginBottom:  '3rem',
        }}>
          Modern{' '}
          <em style={{ fontStyle: 'italic', color: P.color.gold }}>Naval Blue.</em>
        </h2>

        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 'clamp(2rem,4vw,4rem)',
          alignItems:          'start',
        }}>

          {/* Color swatches */}
          <div>
            <p style={{
              fontFamily:    P.font.mono,
              fontSize:      '.65rem',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color:         P.color.onFaint,
              marginBottom:  '1.2rem',
            }}>
              Colour palette
            </p>
            <div style={{
              display:             'grid',
              gridTemplateColumns: '1fr 1fr',
              gap:                 12,
            }}>
              {SWATCHES.map(sw => (
                <div key={sw.name} style={{
                  borderRadius: 12,
                  overflow:     'hidden',
                  border:       `1px solid ${P.alpha.line}`,
                }}>
                  <div style={{
                    height:     72,
                    background: sw.bg,
                  }} />
                  <div style={{
                    padding:    '.7rem .9rem',
                    background: P.alpha.white06,
                  }}>
                    <p style={{
                      fontFamily:  P.font.body,
                      fontWeight:  600,
                      fontSize:    '.88rem',
                      color:       P.color.on,
                      margin:      '0 0 .15rem',
                    }}>{sw.name}</p>
                    <p style={{
                      fontFamily:    P.font.mono,
                      fontSize:      '.6rem',
                      letterSpacing: '.08em',
                      color:         P.color.onFaint,
                      margin:        0,
                    }}>{sw.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Type specimen */}
          <div>
            <p style={{
              fontFamily:    P.font.mono,
              fontSize:      '.65rem',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color:         P.color.onFaint,
              marginBottom:  '1.2rem',
            }}>
              Typography
            </p>

            {/* Big Aa */}
            <div style={{
              background:   P.alpha.white07,
              border:       `1px solid ${P.alpha.line}`,
              borderRadius: 16,
              padding:      '2rem 2rem 1.5rem',
              marginBottom: 12,
            }}>
              <p style={{
                fontFamily:    P.font.disp,
                fontStyle:     'italic',
                fontSize:      'clamp(3.5rem,8vw,6rem)',
                lineHeight:    1,
                letterSpacing: '-.02em',
                color:         P.color.on,
                margin:        '0 0 .8rem',
              }}>Aa</p>
              <p style={{
                fontFamily:    P.font.body,
                fontSize:      '.8rem',
                color:         P.color.onFaint,
                margin:        '0 0 1.2rem',
                letterSpacing: '.04em',
              }}>
                Instrument Serif · Plus Jakarta Sans · IBM Plex Mono
              </p>

              {/* Weight row */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {TYPE_WEIGHTS.map(tw => (
                  <div key={tw.w}>
                    <p style={{
                      fontFamily: P.font.body,
                      fontWeight: tw.w,
                      fontSize:   '1rem',
                      color:      P.color.on,
                      margin:     '0 0 .15rem',
                    }}>Invest</p>
                    <p style={{
                      fontFamily:    P.font.mono,
                      fontSize:      '.58rem',
                      letterSpacing: '.08em',
                      color:         P.color.onFaint,
                      margin:        0,
                    }}>{tw.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mono number row */}
            <div style={{
              background:   P.alpha.white07,
              border:       `1px solid ${P.alpha.line}`,
              borderRadius: 12,
              padding:      '1.1rem 1.5rem',
              display:      'flex',
              gap:          '2rem',
              alignItems:   'baseline',
            }}>
              {['฿48,000', '+12.4%', '5Y proj.'].map(n => (
                <p key={n} style={{
                  fontFamily:    P.font.mono,
                  fontSize:      '1.1rem',
                  fontWeight:    700,
                  color:         P.color.gold,
                  margin:        0,
                  letterSpacing: '-.01em',
                }}>{n}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
