'use client'

import { V } from './tokens'

const CALLS = [
  {
    ix:   'Call 01',
    q:    'Absolute, or relative?',
    lose: 'A universal number',
    win:  'Relative to your baseline',
    why:  'Served the clinical line — it makes no medical claim it can\'t stand behind.',
    cost: 'Cost: lost the clean "everyone\'s a 90" marketing story.',
  },
  {
    ix:   'Call 02',
    q:    'Hide doubt, or show it?',
    lose: 'Always a confident score',
    win:  'A quiet "low confidence" note',
    why:  'On sparse-data days the score says so. Trust comes from admitting the gaps.',
    cost: 'Cost: a less tidy screen. Worth it.',
  },
  {
    ix:   'Call 03',
    q:    'Cloud, or on-device?',
    lose: 'A richer cloud model',
    win:  'Everything on the wrist',
    why:  'Privacy was non-negotiable, so the model had to be small enough to run locally.',
    cost: 'Cost: a simpler model. Privacy outranked precision.',
  },
] as const


export function VitaeCalls() {
  return (
    <>
      {/* ── HARD CALLS ── */}
      <section id="forks" style={{ padding: 'clamp(4.5rem,10vw,8rem) 0' }}>
        <div className="vitae-wrap">

          <div className="vitae-animate">
            <span style={{ fontFamily: V.font.mono, fontSize: V.size.eyebrow, letterSpacing: '.26em', textTransform: 'uppercase', color: V.color.limeDeep, display: 'inline-flex', alignItems: 'center', gap: '.7em' }}>
              <span style={{ display: 'inline-block', width: 26, height: 1.5, background: V.color.limeDeep }} />
              The hard calls
            </span>
            <h2
              style={{
                fontFamily:    V.font.serif,
                fontWeight:    300,
                fontSize:      V.size.display,
                letterSpacing: '-.02em',
                lineHeight:    1.06,
                margin:        '1.1rem 0 0',
                maxWidth:      '22ch',
                color:         V.color.ink,
              }}
            >
              Three decisions, each with a{' '}
              <em style={{ fontStyle: 'italic', color: V.color.limeDeep }}>price.</em>
            </h2>
          </div>

          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(3,1fr)',
              gap:                 '1.4rem',
              marginTop:           '2.4rem',
            }}
            className="vitae-forks-grid"
          >
            {CALLS.map((c, i) => (
              <div
                key={c.ix}
                className="vitae-animate"
                style={{ borderTop: `2px solid ${V.color.ink}`, paddingTop: '1.3rem', transitionDelay: `calc(${i} * ${V.motion.durationStagger})` }}
              >
                <div style={{ fontFamily: V.font.mono, fontSize: V.size.micro, letterSpacing: '.14em', color: V.color.limeDeep, marginBottom: '1rem' }}>{c.ix}</div>
                <div style={{ fontFamily: V.font.heading, fontWeight: 700, fontSize: '1.18rem', lineHeight: 1.2, marginBottom: '1.1rem', color: V.color.ink }}>{c.q}</div>
                <div style={{ fontSize: '1rem', color: V.color.muted, textDecoration: 'line-through', textDecorationColor: V.color.line, marginBottom: '.4rem', fontFamily: V.font.sans }}>{c.lose}</div>
                <div style={{ fontSize: '1rem', color: V.color.ink, fontWeight: 600, display: 'flex', gap: '.5rem', alignItems: 'flex-start', marginBottom: '.9rem', fontFamily: V.font.sans }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={V.color.limeDeep} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '.15em' }}>
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                  {c.win}
                </div>
                <p style={{ fontSize: '1rem', color: V.color.inkSoft, lineHeight: 1.55, fontFamily: V.font.sans, margin: 0 }}>{c.why}</p>
                <p style={{ fontSize: '1rem', color: V.color.muted, marginTop: '.7rem', fontStyle: 'italic', fontFamily: V.font.sans }}>{c.cost}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

    </>
  )
}
