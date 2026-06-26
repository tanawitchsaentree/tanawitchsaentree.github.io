'use client'

import { T } from './tokens'
import { TimsiPadMockup } from './TimsiPadMockup'

const HINTS = [
  { prompt: 'Large double-double', detail: 'count the taps & seconds' },
  { prompt: 'one order, four different drinks', detail: 'does the ticket keep up?' },
  { prompt: 'change your mind 5 times', detail: 'the ticket never hides' },
] as const

export function TimsDemo() {
  return (
    <section
      id="demo"
      style={{ padding: 'clamp(5rem,13vw,11rem) 0', background: T.color.espresso, color: T.color.cream, fontFamily: T.font.sans }}
    >
      <div className="tims-wrap tims-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)' }}>
          <span style={{ fontFamily: T.font.mono, fontSize: '.75rem', letterSpacing: '.22em', textTransform: 'uppercase', color: T.color.gold, display: 'inline-flex', alignItems: 'center', gap: '.7em' }}>
            <span style={{ width: 26, height: 1.5, background: T.color.gold, display: 'inline-block' }} />
            The build
          </span>
          <h2 style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: T.size.display, letterSpacing: '-.015em', lineHeight: 1.03, margin: '.7rem 0 1.1rem', color: T.color.cream }}>
            The terminal, running.
          </h2>
          <p style={{ color: T.alpha.cream62, fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '56ch' }}>
            Built in front-end code, not screenshots — every tap responds instantly, and the order ticket stays live the whole time.
          </p>
        </div>

        {/* live iPad prototype */}
        <TimsiPadMockup />

        {/* try hints */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.7rem', marginTop: '2.2rem', justifyContent: 'center' }}>
          {HINTS.map(h => (
            <span
              key={h.prompt}
              style={{ fontFamily: T.font.mono, fontSize: '1rem', background: T.alpha.cream07, border: `1px solid ${T.alpha.lineDk}`, padding: '.6rem 1rem', borderRadius: 11, color: T.alpha.cream70 }}
            >
              Try: <b style={{ color: T.color.gold }}>{h.prompt}</b> — {h.detail}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
