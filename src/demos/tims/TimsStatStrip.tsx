'use client'

import { T } from './tokens'

const STATS = [
  { value: '~40s', desc: 'per order at the window — the number on the board I got judged by' },
  { value: '2 yrs', desc: 'I actually rang these orders in, headset and all' },
  { value: '≤3',   desc: 'iterations before shipping — a discipline, not a limit' },
  { value: '1 bet', desc: 'preset-first, custom as escape hatch' },
] as const

export function TimsStatStrip() {
  return (
    <div style={{ background: T.color.espresso, color: T.color.cream }}>
      <div
        className="tims-wrap tims-animate"
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          gap:                 '2rem',
          paddingTop:    'clamp(2.4rem,5vw,3.4rem)',
          paddingBottom: 'clamp(2.4rem,5vw,3.4rem)',
        }}
      >
        {STATS.map(s => (
          <div key={s.value}>
            <b style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: 'clamp(2rem,4.4vw,3.1rem)', color: T.color.gold, display: 'block', lineHeight: 1 }}>
              {s.value}
            </b>
            <span style={{ fontSize: '1rem', color: T.alpha.cream62, display: 'block', marginTop: '.6rem', lineHeight: 1.4 }}>
              {s.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
