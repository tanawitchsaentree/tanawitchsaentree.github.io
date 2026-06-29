'use client'

import { V } from './tokens'

const VITALS = [
  { n: '3',   unit: 's',   k: 'to a confident read',    p: 'Down from ~14s on the four-sub-score prototype.' },
  { n: '0',   unit: '',    k: 'clinical-safety flags',   p: 'The relative, low-confidence-honest model cleared review clean.' },
  { n: '100', unit: '%',   k: 'on-device',               p: 'No health signal ever left the wrist.' },
] as const

export function VitaeOutcome() {
  return (
    <>
      {/* ── WHAT MOVED ── */}
      <section id="moved" style={{ padding: 'clamp(4.5rem,10vw,8rem) 0' }}>
        <div className="vitae-wrap">

          <div className="vitae-animate" style={{ maxWidth: 680, marginBottom: 'clamp(2rem,5vw,3.5rem)' }}>
            <span style={{ fontFamily: V.font.mono, fontSize: V.size.eyebrow, letterSpacing: '.26em', textTransform: 'uppercase', color: V.color.limeDeep, display: 'inline-flex', alignItems: 'center', gap: '.7em' }}>
              <span style={{ display: 'inline-block', width: 26, height: 1.5, background: V.color.limeDeep }} />
              What moved
            </span>
            <h2
              style={{
                fontFamily:    V.font.serif,
                fontWeight:    300,
                fontSize:      V.size.display,
                letterSpacing: '-.02em',
                lineHeight:    1.06,
                margin:        '1.1rem 0 1.4rem',
                maxWidth:      '22ch',
                color:         V.color.ink,
              }}
            >
              The proudest number wasn&apos;t{' '}
              <em style={{ fontStyle: 'italic', color: V.color.limeDeep }}>engagement.</em>
            </h2>
            <p style={{ color: V.color.inkSoft, fontSize: '1.1rem', maxWidth: '50ch', fontFamily: V.font.sans, lineHeight: 1.65 }}>
              It was that the clinical advisor signed off with <b style={{ color: V.color.ink }}>zero caveats</b> — because
              the design never claims more than it knows.
            </p>
          </div>

          {/* vitals row */}
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap:                 'clamp(1.4rem,4vw,3rem)',
            }}
            className="vitae-vitals-grid"
          >
            {VITALS.map((v, i) => (
              <div
                key={v.k}
                className="vitae-animate"
                style={{ borderTop: `2px solid ${V.color.ink}`, transitionDelay: `calc(${i} * 0.1s)` }}
              >
                <div
                  style={{
                    fontFamily:    V.font.heading,
                    fontWeight:    700,
                    fontSize:      'clamp(2.6rem,6vw,4.6rem)',
                    lineHeight:    1,
                    letterSpacing: '-.03em',
                    paddingTop:    '1rem',
                    color:         V.color.ink,
                  }}
                >
                  {v.n}
                  <small style={{ fontSize: '.4em', color: V.color.limeDeep }}>{v.unit}</small>
                </div>
                <div style={{ fontFamily: V.font.mono, fontSize: V.size.cap, letterSpacing: '.14em', textTransform: 'uppercase', color: V.color.muted, marginTop: '.7rem' }}>{v.k}</div>
                <p style={{ color: V.color.inkSoft, fontSize: '1rem', margin: '.7rem 0 0', maxWidth: '30ch', fontFamily: V.font.sans }}>{v.p}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── REFLECTION ── */}
      <section style={{ padding: 'clamp(4.5rem,10vw,8rem) 0' }}>
        <div className="vitae-wrap">
          <div className="vitae-animate" style={{ maxWidth: 760 }}>
            <blockquote
              style={{
                fontFamily:    V.font.serif,
                fontWeight:    300,
                fontStyle:     'italic',
                fontSize:      'clamp(1.8rem,4.4vw,3.2rem)',
                lineHeight:    1.18,
                letterSpacing: '-.02em',
                margin:        0,
                maxWidth:      '22ch',
                color:         V.color.ink,
              }}
            >
              The best thing I designed never shipped —{' '}
              <b style={{ fontStyle: 'normal', fontWeight: 600, color: V.color.limeDeep }}>the absolute score we killed.</b>
            </blockquote>
            <p
              style={{
                marginTop:  '2.4rem',
                fontSize:   V.size.cap,
                color:      V.color.muted,
                maxWidth:   '64ch',
                lineHeight: 1.6,
                borderTop:  `1px solid ${V.color.line}`,
                paddingTop: '1.4rem',
                fontFamily: V.font.sans,
              }}
            >
              Case-study presentation of a product-design project. The score logic, stakeholder tensions,
              and decisions reflect the real work; figures (3s, review outcomes) come from the project&apos;s
              own usability testing and review notes and are shown as directional, not published metrics.
              Vitae is not a medical device and does not provide medical advice — a framing that itself
              drove the relative-score decision above.
            </p>
          </div>
        </div>
      </section>

      {/* ── CODA ── */}
      <footer
        id="outcome"
        style={{
          background:   V.color.ink,
          color:        V.color.paper,
          padding:      'clamp(4.5rem,10vw,8rem) 0 3.5rem',
          borderRadius: '40px 40px 0 0',
          fontFamily:   V.font.sans,
        }}
      >
        <div className="vitae-wrap vitae-animate">
          <h2
            style={{
              fontFamily:    V.font.serif,
              fontWeight:    300,
              fontSize:      V.size.display,
              letterSpacing: '-.02em',
              lineHeight:    1.06,
              maxWidth:      '17ch',
              color:         V.color.paper,
              margin:        0,
            }}
          >
            Restraint wasn&apos;t the style. It was{' '}
            <em style={{ fontStyle: 'italic', color: V.color.lime }}>the safety mechanism.</em>
          </h2>

          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              flexWrap:       'wrap',
              gap:            '1.4rem',
              marginTop:      '3rem',
              paddingTop:     '2rem',
              borderTop:      `1px solid ${V.alpha.paper14}`,
            }}
          >
            <small style={{ fontFamily: V.font.mono, fontSize: V.size.micro, letterSpacing: '.1em', color: V.alpha.paper50, lineHeight: 1.8, display: 'block', textTransform: 'uppercase' }}>
              VITAE · DAILY HEALTH SCORE<br />
              LEAD PRODUCT DESIGNER · WATCHOS + IOS · 2025
            </small>
            <small style={{ fontFamily: V.font.mono, fontSize: V.size.micro, letterSpacing: '.1em', color: V.alpha.paper50, lineHeight: 1.8, display: 'block', textTransform: 'uppercase' }}>
              CASE STUDY<br />
              STAKEHOLDER LOOP → REFRAME → ON-DEVICE SHIP
            </small>
          </div>
        </div>
      </footer>
    </>
  )
}
