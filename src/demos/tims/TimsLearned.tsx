'use client'

import { T } from './tokens'

const PRINCIPLES = [
  {
    title: 'Make the constraint a number.',
    body: 'Forty seconds gave me a target I could test every layout against. Before that, every choice came down to my opinion of what felt fast.',
  },
  {
    title: 'Design for the common order.',
    body: 'Most orders were the same handful. Presets come first, and anything unusual goes through the custom door.',
  },
  {
    title: 'Undo makes speed safe.',
    body: 'Speed only helps when a mistake is cheap to fix. I count undo, live preview and edit-in-place as speed features.',
  },
  {
    title: 'The ticket never hides.',
    body: "The order is the one record both people rely on. Nothing should cover it, especially while the customer is changing their mind.",
  },
] as const

export function TimsLearned() {
  return (
    <section
      id="learned"
      data-m={7}
      style={{ padding: 'clamp(5rem,13vw,11rem) 0', background: T.color.cream2, fontFamily: T.font.sans }}
    >
      <div className="tims-wrap tims-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)' }}>
          <span className="tims-label-section">What stuck with me</span>
          <h2 style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: T.size.display, letterSpacing: '-.015em', lineHeight: 1.03, margin: '.7rem 0', color: T.color.ink }}>
            Four things two years of mornings taught me.
          </h2>
          <p style={{ color: T.color.inkSoft, fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '56ch', marginTop: '1rem' }}>
            Car one pulls away from the window. Each of these shows up somewhere in the build above, from the timer to the order that never hides.
          </p>
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
