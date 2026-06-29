'use client'

import { V } from './tokens'

type Step = { k: string; text: string; bad?: boolean; good?: boolean }
const ROUNDS: { n: string; h: string; steps: Step[] }[] = [
  {
    n:    '01',
    h:    'Absolute score → killed',
    steps: [
      { k: 'In',      text: 'A universal 0–100 health score on the watch face.' },
      { k: 'The room',text: 'Clinical vetoed it: implies a medical claim; can falsely reassure.', bad: true },
      { k: 'Forward', text: 'Drop "health." Score momentum vs personal baseline instead.', good: true },
    ],
  },
  {
    n:    '02',
    h:    'Relative score → on-device',
    steps: [
      { k: 'In',      text: 'A baseline-relative score, computed in the cloud for a richer model.' },
      { k: 'The room',text: 'Privacy vetoed the cloud. Eng confirmed a lighter model fits on-device, within sensor budget.', bad: true },
      { k: 'Forward', text: 'All compute on the wrist. Nothing leaves without consent.', good: true },
    ],
  },
  {
    n:    '03',
    h:    'Prototype → cut to one',
    steps: [
      { k: 'In',      text: 'A prototype showing the score plus four contributing sub-scores.' },
      { k: 'Testers', text: "Couldn't read it in 3s — four numbers competed with the one that mattered.", bad: true },
      { k: 'Forward', text: 'One number, one move. Sub-scores collapse to one tap down.', good: true },
    ],
  },
]

export function VitaeLoop() {
  return (
    <section id="loop" style={{ padding: 'clamp(4.5rem,10vw,8rem) 0' }}>
      <div className="vitae-wrap">

        <div className="vitae-animate" style={{ maxWidth: 680, marginBottom: 'clamp(2rem,5vw,3.5rem)' }}>
          <span style={{ fontFamily: V.font.mono, fontSize: V.size.eyebrow, letterSpacing: '.26em', textTransform: 'uppercase', color: V.color.limeDeep, display: 'inline-flex', alignItems: 'center', gap: '.7em' }}>
            <span style={{ display: 'inline-block', width: 26, height: 1.5, background: V.color.limeDeep }} />
            The loop
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
            Every version went around{' '}
            <em style={{ fontStyle: 'italic', color: V.color.limeDeep }}>the same table.</em>
          </h2>
          <p style={{ color: V.color.inkSoft, fontSize: '1.1rem', maxWidth: '56ch', fontFamily: V.font.sans, lineHeight: 1.65 }}>
            No screen shipped on my say-so. Each one came back through the people who could
            veto it — and got quieter each pass.
          </p>
        </div>

        <div>
          {ROUNDS.map((r, ri) => (
            <div
              key={r.n}
              className="vitae-animate"
              style={{
                display:             'grid',
                gridTemplateColumns: 'auto 1fr',
                gap:                 'clamp(1.4rem,4vw,3rem)',
                padding:             '2.2rem 0',
                borderTop:           `1px solid ${V.color.line}`,
                borderBottom:        ri === ROUNDS.length - 1 ? `1px solid ${V.color.line}` : undefined,
              }}
            >
              {/* big number */}
              <div
                style={{
                  fontFamily:  V.font.heading,
                  fontWeight:  700,
                  fontSize:    'clamp(2.2rem,5vw,3.4rem)',
                  letterSpacing:'-.03em',
                  color:        V.color.limeDeep,
                  lineHeight:   1,
                  minWidth:     64,
                }}
              >
                {r.n}
              </div>

              {/* content */}
              <div>
                <h3
                  style={{
                    fontFamily:  V.font.heading,
                    fontWeight:  700,
                    fontSize:    '1.2rem',
                    marginBottom:'1rem',
                    color:       V.color.ink,
                  }}
                >
                  {r.h}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
                  {r.steps.map(s => (
                    <div
                      key={s.k}
                      style={{
                        display:    'flex',
                        gap:        '.8rem',
                        fontSize:   '1rem',
                        color:      V.color.inkSoft,
                        lineHeight: 1.5,
                        fontFamily: V.font.sans,
                      }}
                    >
                      <span
                        style={{
                          fontFamily:    V.font.mono,
                          fontSize:      V.size.micro,
                          letterSpacing: '.1em',
                          textTransform: 'uppercase',
                          color:         s.bad ? V.color.dangerText : s.good ? V.color.limeDeep : V.color.muted,
                          flex:          'none',
                          width:         74,
                          paddingTop:    '.2em',
                        }}
                      >
                        {s.k}
                      </span>
                      <span>{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
