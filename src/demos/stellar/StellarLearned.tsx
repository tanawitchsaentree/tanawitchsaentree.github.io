'use client'

import { S } from './tokens'

const PRINCIPLES = [
  {
    title: 'Design from the leftover ingredient.',
    body:  'One tester scrolled past six generated recipes to search "random fridge things" by hand. That moment reset the priority list: design for the three items already wilting in her drawer, not for infinite choice.',
  },
  {
    title: 'Numbers turn opinions into a brief.',
    body:  '"People want it" is weak. "70% want fridge-based suggestions" is a roadmap.',
  },
  {
    title: 'Generation beats search for the uninspired.',
    body:  'When someone\'s stuck, a blank search bar is the enemy. Surprise them instead.',
  },
  {
    title: 'Photos decide whether someone taps.',
    body:  '65% of respondents said a bad photo was reason enough to skip a recipe. After that, the image system got the same design attention as the recommendation logic.',
  },
] as const

export function StellarLearned() {
  return (
    <section id="learned" style={{ padding: 'clamp(5rem,13vw,11rem) 0' }}>
      <div className="stellar-wrap stellar-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)', maxWidth: 740 }}>
          <span style={{ fontFamily: S.font.mono, fontSize: '.78rem', color: S.color.greenDeep, letterSpacing: '.12em', textTransform: 'uppercase', display: 'block', marginBottom: '.6rem' }}>
            What stuck with me
          </span>
          <h2 style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: S.size.display, letterSpacing: '-.015em', lineHeight: 1.02, color: S.color.ink }}>
            Four things this taught me.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.3rem' }} className="stellar-princ-grid">
          {PRINCIPLES.map(p => (
            <div
              key={p.title}
              style={{ borderTop: `2px solid ${S.color.green}`, paddingTop: '1rem' }}
            >
              <b style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: '1.18rem', display: 'block', marginBottom: '.4rem', color: S.color.ink }}>
                {p.title}
              </b>
              <span style={{ fontSize: '1rem', color: S.color.inkSoft, lineHeight: 1.65 }}>
                {p.body}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
