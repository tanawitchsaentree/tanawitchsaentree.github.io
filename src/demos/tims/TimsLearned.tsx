'use client'

import { T } from './tokens'

const PRINCIPLES = [
  {
    title: 'Make the constraint a number.',
    body: '"Fast" is an opinion. Forty seconds is a brief. A measurable constraint turns design taste into design decisions.',
  },
  {
    title: 'Design for the distribution.',
    body: 'Optimise the order that happens ten thousand times, not the one that happens twice. Presets first; everything else is an escape hatch.',
  },
  {
    title: 'Reversible is what makes fast safe.',
    body: 'Speed only helps if mistakes cost nothing. Undo, live preview, edit-in-place — these are speed features, not nice-to-haves.',
  },
  {
    title: 'The ticket never hides.',
    body: "The order is the single source of truth between two people. Don't ever cover it — especially while they're changing their mind.",
  },
] as const

export function TimsLearned() {
  return (
    <section
      id="learned"
      style={{ padding: 'clamp(5rem,13vw,11rem) 0', background: T.color.cream2, fontFamily: T.font.sans }}
    >
      <div className="tims-wrap tims-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)' }}>
          <span className="tims-label-section">What stuck with me</span>
          <h2 style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: T.size.display, letterSpacing: '-.015em', lineHeight: 1.03, margin: '.7rem 0', color: T.color.ink }}>
            Four things two years of mornings taught me.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.2rem', marginTop: '1.6rem' }} className="tims-princ-grid">
          {PRINCIPLES.map(p => (
            <div key={p.title} style={{ borderTop: `2px solid ${T.color.red}`, paddingTop: '1rem' }}>
              <b style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: '1.15rem', letterSpacing: '-.015em', display: 'block', marginBottom: '.4rem', color: T.color.ink }}>
                {p.title}
              </b>
              <span style={{ fontSize: '1rem', color: T.color.inkSoft, lineHeight: 1.65 }}>
                {p.body}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
