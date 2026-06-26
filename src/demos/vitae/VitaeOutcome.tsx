'use client'

import { V } from './tokens'

const RESULTS = [
  { value: '4.1s', label: 'median time-to-insight — goal was under 5s' },
  { value: '2',    label: 'screens, one shared design language'          },
  { value: '7',    label: 'reusable components locked into tokens'       },
  { value: '3/3',  label: 'iterations — cap respected, loop closed'     },
] as const

export function VitaeOutcome() {
  return (
    <footer
      id="outcome"
      style={{
        background: V.color.ink,
        color:      V.color.paper,
        padding:    'clamp(3.5rem,8vw,6rem) 0',
        fontFamily: V.font.sans,
      }}
    >
      <div className="vitae-wrap vitae-animate">
        <span
          style={{
            fontFamily:    V.font.mono,
            fontSize:      V.size.micro,
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            color:         V.color.lime,
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '.6em',
          }}
        >
          <span style={{ display: 'inline-block', width: 26, height: 1.5, background: V.color.lime }} />
          Outcome
        </span>

        <h2
          style={{
            fontFamily:    V.font.serif,
            fontWeight:    500,
            fontSize:      V.size.display,
            letterSpacing: '-.02em',
            lineHeight:    1.04,
            color:         V.color.paper,
            margin:        '1rem 0 1.1rem',
          }}
        >
          Calm on the surface,<br />
          <em style={{ fontStyle: 'italic', color: V.color.lime }}>momentum</em> underneath.
        </h2>

        <p style={{ color: V.alpha.paper72, maxWidth: '50ch', lineHeight: 1.65 }}>
          Three loops is what it took. Three loops is also where we stopped. The cap turned
          &ldquo;make it perfect&rdquo; into &ldquo;make it ship&rdquo; — and the shipped version hit 4.1 seconds.
        </p>

        {/* results strip */}
        <div
          className="vitae-results"
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap:                 '1.4rem',
            marginTop:           '2.6rem',
          }}
        >
          {RESULTS.map(r => (
            <div key={r.value}>
              <b
                style={{
                  fontFamily:  V.font.serif,
                  fontWeight:  400,
                  fontSize:    'clamp(2.2rem,5vw,3.4rem)',
                  color:       V.color.lime,
                  lineHeight:  1,
                  display:     'block',
                }}
              >
                {r.value}
              </b>
              <span
                style={{
                  fontFamily:    V.font.mono,
                  fontSize:      V.size.micro,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color:         V.alpha.paper60,
                  display:       'block',
                  marginTop:     '.5rem',
                }}
              >
                {r.label}
              </span>
            </div>
          ))}
        </div>

        {/* foot row */}
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'flex-end',
            flexWrap:       'wrap',
            gap:            '2rem',
            marginTop:      '3rem',
            paddingTop:     '2rem',
            borderTop:      `1px solid ${V.alpha.paper14}`,
          }}
        >
          <small style={{ fontFamily: V.font.mono, fontSize: V.size.micro, letterSpacing: '.14em', textTransform: 'uppercase', color: V.alpha.paper50 }}>
            VITAE · Health Dashboard Case Study
          </small>
          <small style={{ fontFamily: V.font.mono, fontSize: V.size.micro, letterSpacing: '.14em', textTransform: 'uppercase', color: V.alpha.paper50 }}>
            Discover → Ideate → Plan → Execute → Review → Iterate ⟳
          </small>
        </div>
      </div>
    </footer>
  )
}
