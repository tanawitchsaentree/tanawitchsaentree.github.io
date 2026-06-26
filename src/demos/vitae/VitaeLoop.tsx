'use client'

import { V } from './tokens'

const NODES = [
  { label: 'Discover', cx: 100,   cy: 22,  lx: 100,  ly: 4,   anchor: 'middle' },
  { label: 'Ideate',   cx: 167.5, cy: 61,  lx: 188,  ly: 58,  anchor: 'start'  },
  { label: 'Plan',     cx: 167.5, cy: 139, lx: 188,  ly: 142, anchor: 'start'  },
  { label: 'Execute',  cx: 100,   cy: 178, lx: 100,  ly: 197, anchor: 'middle' },
  { label: 'Review',   cx: 32.5,  cy: 139, lx: 12,   ly: 142, anchor: 'end'    },
  { label: 'Iterate',  cx: 32.5,  cy: 61,  lx: 12,   ly: 58,  anchor: 'end'    },
] as const

export function VitaeLoop() {
  return (
    <section
      id="loop"
      style={{ padding: 'clamp(5rem,12vw,10rem) 0', fontFamily: V.font.sans }}
    >
      <div className="vitae-wrap">
        <div
          className="vitae-animate"
          style={{
            background:   V.color.ink,
            color:        V.color.paper,
            borderRadius: 34,
            padding:      'clamp(2.4rem,5vw,4rem)',
            position:     'relative',
            overflow:     'hidden',
          }}
        >
          {/* lime radial glow */}
          <div
            aria-hidden="true"
            style={{
              position:   'absolute',
              inset:      0,
              background: `radial-gradient(600px 360px at 78% 12%,${V.alpha.lime20},transparent 60%)`,
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'minmax(200px,1fr) minmax(200px,430px)',
              gap:                 'clamp(2rem,5vw,4rem)',
              alignItems:          'center',
              position:            'relative',
              zIndex:              1,
            }}
          >
            {/* left — copy */}
            <div>
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
                The Working Loop
              </span>

              <h2
                style={{
                  fontFamily:    V.font.serif,
                  fontWeight:    500,
                  fontSize:      V.size.display,
                  letterSpacing: '-.02em',
                  lineHeight:    1.04,
                  color:         V.color.paper,
                  margin:        '.9rem 0 1.2rem',
                }}
              >
                Six stages,<br />
                <em style={{ fontStyle: 'italic', color: V.color.lime }}>three turns</em> max.
              </h2>

              <p style={{ color: V.alpha.paper72, lineHeight: 1.65, maxWidth: '52ch' }}>
                Every screen passed through the same circuit. Discovery framed the goal,
                ideation widened options, planning made them buildable, execution shipped
                pixels, review found what hurt — and iteration fixed it. The rule that kept
                it honest:{' '}
                <b style={{ color: V.color.lime }}>never loop more than three times</b>{' '}
                before committing.
              </p>

              <div
                style={{
                  display:      'inline-flex',
                  alignItems:   'center',
                  gap:          '.55rem',
                  marginTop:    '1.6rem',
                  fontFamily:   V.font.mono,
                  fontSize:     V.size.cap,
                  background:   V.alpha.lime14,
                  border:       `1px solid ${V.alpha.lime40}`,
                  color:        V.color.lime,
                  padding:      '.5rem .9rem',
                  borderRadius: 999,
                }}
              >
                {[true, true, true].map((on, i) => (
                  <span
                    key={i}
                    style={{
                      width:        8,
                      height:       8,
                      borderRadius: '50%',
                      background:   on ? V.color.lime : V.color.limeDeep,
                      opacity:      on ? 1 : 0.4,
                      boxShadow:    on ? `0 0 0 3px ${V.alpha.lime25}` : undefined,
                    }}
                  />
                ))}
                {' '}iteration budget · 3 / 3 used
              </div>
            </div>

            {/* right — SVG ring */}
            <div style={{ width: '100%', maxWidth: 430, aspectRatio: '1', margin: '0 auto', position: 'relative' }}>
              <svg viewBox="0 0 200 200" width="100%" height="100%" overflow="visible" aria-label="Six-stage design loop">
                <style>{`
                  @keyframes vitae-orbit {
                    to { stroke-dashoffset: -374 }
                  }
                  .vitae-orbit-path {
                    animation: vitae-orbit 1.2s cubic-bezier(.65,0,.35,1) infinite;
                  }
                  @media (prefers-reduced-motion: reduce) {
                    .vitae-orbit-path { animation: none }
                  }
                  .vitae-node circle {
                    transition: fill .3s cubic-bezier(.34,1.56,.64,1);
                  }
                  .vitae-node:hover circle { fill: ${V.color.lime} }
                  .vitae-node:hover .vitae-num { fill: ${V.color.ink} }
                `}</style>
                <circle cx="100" cy="100" r="78" fill="none" stroke={V.alpha.paper12} strokeWidth="2" />
                <circle
                  className="vitae-orbit-path"
                  cx="100" cy="100" r="78"
                  fill="none"
                  stroke={V.color.lime}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="14 360"
                />
                {NODES.map((n, i) => (
                  <g key={n.label} className="vitae-node" style={{ cursor: 'default' }}>
                    <circle cx={n.cx} cy={n.cy} r="17" fill={V.color.ink} stroke={V.alpha.paper22} strokeWidth="1.5" />
                    <text
                      className="vitae-num"
                      x={n.cx} y={n.cy}
                      fontFamily={V.font.mono}
                      fontSize="13"
                      fill={V.color.lime}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontWeight="700"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </text>
                    <text
                      x={n.lx} y={n.ly}
                      fontFamily={V.font.mono}
                      fontSize="9"
                      fill={V.alpha.paper60}
                      textAnchor={n.anchor}
                      dominantBaseline="central"
                      fontWeight="400"
                      letterSpacing=".12em"
                    >
                      {n.label.toUpperCase()}
                    </text>
                  </g>
                ))}
              </svg>
              {/* center label */}
              <div
                aria-hidden="true"
                style={{
                  position:      'absolute',
                  inset:         0,
                  display:       'grid',
                  placeContent:  'center',
                  textAlign:     'center',
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    fontFamily:    V.font.mono,
                    fontSize:      V.size.micro,
                    letterSpacing: '.2em',
                    textTransform: 'uppercase',
                    color:         V.color.lime,
                    display:       'block',
                  }}
                >
                  loop
                </span>
                <b
                  style={{
                    fontFamily: V.font.serif,
                    fontStyle:  'italic',
                    fontSize:   '1.5rem',
                    color:      V.color.paper,
                    display:    'block',
                  }}
                >
                  repeat
                </b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
