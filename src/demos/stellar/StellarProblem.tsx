'use client'

import { S } from './tokens'

const PAINS = [
  {
    icon:  '🔁',
    title: 'The same-old rut',
    body:  'Cooking the same handful of meals every week until it feels like a chore, not a pleasure.',
    quote: '"I wish cooking felt less like a chore."',
    accent: S.color.green,
  },
  {
    icon:  '🗑️',
    title: 'Food guilt',
    body:  'Buying groceries, forgetting them, tossing them. Wasted food and wasted money — and it stings.',
    quote: '"It\'s gone bad before I realize."',
    accent: S.color.citrus,
  },
  {
    icon:  '📚',
    title: 'Recipe chaos',
    body:  'Recipes scattered across screenshots, tabs, and bookmarks — never the right one when you need it.',
    quote: '"I can never find the one I saved."',
    accent: S.color.lime,
  },
] as const

export function StellarProblem() {
  return (
    <section
      id="problem"
      style={{ padding: 'clamp(5rem,13vw,11rem) 0' }}
    >
      <div className="stellar-wrap stellar-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)', maxWidth: 740 }}>
          <span style={{ fontFamily: S.font.mono, fontSize: '.78rem', color: S.color.greenDeep, letterSpacing: '.12em', textTransform: 'uppercase', display: 'block', marginBottom: '.6rem' }}>
            Where it starts
          </span>
          <h2 style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: S.size.display, letterSpacing: '-.015em', lineHeight: 1.02, margin: '.7rem 0 1.1rem', color: S.color.ink }}>
            Three frustrations kept <em style={{ fontFamily: S.font.italic, fontStyle: 'italic', fontWeight: 500, color: S.color.greenDeep }}>showing up.</em>
          </h2>
          <p style={{ color: S.color.inkSoft, fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '56ch' }}>
            Talking to home cooks, the same complaints surfaced again and again — clustered into three knots that all trace back to one thing: a full kitchen and no plan.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.1rem' }} className="stellar-pains-grid">
          {PAINS.map(p => (
            <div
              key={p.title}
              style={{
                background:   S.color.onFill,
                border:       `1px solid ${S.alpha.line}`,
                borderRadius: 20,
                padding:      '1.6rem 1.6rem 1.4rem',
                boxShadow:    S.alpha.shadow,
                position:     'relative',
                overflow:     'hidden',
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: p.accent }} />
              <span style={{ fontSize: '1.9rem', display: 'block', marginBottom: '.7rem' }}>{p.icon}</span>
              <h4 style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: '1.15rem', marginBottom: '.4rem', color: S.color.ink }}>
                {p.title}
              </h4>
              <p style={{ fontSize: '1rem', color: S.color.inkSoft, lineHeight: 1.5 }}>
                {p.body}
              </p>
              <span style={{ fontFamily: S.font.italic, fontStyle: 'italic', color: S.color.greenDeep, fontSize: '1rem', marginTop: '.8rem', display: 'block' }}>
                {p.quote}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
