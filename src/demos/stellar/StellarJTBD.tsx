'use client'

import { S } from './tokens'

const JOBS = [
  {
    when:  'WHEN I have a random assortment of ingredients',
    want:  'I want to discover something delicious without endless scrolling.',
    num:   '01',
    style: { background: `linear-gradient(150deg,${S.color.green},${S.color.greenDeep})`, color: S.color.onFill },
  },
  {
    when:  'WHEN I\'m uninspired or in a cooking rut',
    want:  'I want to be surprised with creative ideas that match my taste.',
    num:   '02',
    style: { background: `linear-gradient(150deg,${S.color.ink},${S.color.greenMid})`, color: S.color.onFill },
  },
  {
    when:  'WHEN I\'m trying to eat healthier',
    want:  'I want recipes that fit my diet without sacrificing flavour.',
    num:   '03',
    style: { background: `linear-gradient(150deg,${S.color.lime},${S.color.limeMid})`, color: S.color.ink },
  },
  {
    when:  'WHEN I\'m hosting or want to impress',
    want:  'I want dishes I can confidently pull off for guests.',
    num:   '04',
    style: { background: `linear-gradient(150deg,${S.color.citrus},${S.color.citrusDk})`, color: S.color.onFill },
  },
  {
    when:  'WHEN I\'m short on time',
    want:  'I want simple recipes from what I have, done in 30 minutes.',
    num:   '05',
    style: { background: `linear-gradient(150deg,${S.color.greenDark},${S.color.inkForest})`, color: S.color.onFill },
  },
] as const

export function StellarJTBD() {
  return (
    <section style={{ padding: 'clamp(5rem,13vw,11rem) 0' }}>
      <div className="stellar-wrap stellar-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)', maxWidth: 740 }}>
          <span style={{ fontFamily: S.font.mono, fontSize: '.78rem', color: S.color.greenDeep, letterSpacing: '.12em', textTransform: 'uppercase', display: 'block', marginBottom: '.6rem' }}>
            Jobs to be done
          </span>
          <h2 style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: S.size.display, letterSpacing: '-.015em', lineHeight: 1.02, margin: '.7rem 0 1.1rem', color: S.color.ink }}>
            What are they really <em style={{ fontFamily: S.font.italic, fontStyle: 'italic', fontWeight: 500, color: S.color.greenDeep }}>hiring</em> an app to do?
          </h2>
          <p style={{ color: S.color.inkSoft, fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '56ch' }}>
            Drag through the moments people described. Each one is a job the product has to nail.
          </p>
        </div>
      </div>

      <div
        className="stellar-jtbd-scroll"
        style={{
          display:        'flex',
          gap:            '1rem',
          overflowX:      'auto',
          padding:        `1rem clamp(1.2rem,5vw,3rem) 1.6rem`,
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
        }}
      >
        {JOBS.map(j => (
          <div
            key={j.num}
            style={{
              flex:            '0 0 280px',
              scrollSnapAlign: 'start',
              borderRadius:    22,
              padding:         '1.6rem',
              minHeight:       230,
              display:         'flex',
              flexDirection:   'column',
              position:        'relative',
              ...j.style,
            }}
          >
            <span style={{ fontFamily: S.font.mono, fontSize: '1rem', opacity: .8, marginBottom: '.3rem' }}>
              {j.when}
            </span>
            <span style={{ fontWeight: 600, fontSize: '1.02rem', lineHeight: 1.4 }}>
              {j.want}
            </span>
            <span style={{ fontFamily: S.font.display, fontWeight: 800, fontSize: '2.4rem', opacity: .25, marginTop: 'auto', alignSelf: 'flex-end' }}>
              {j.num}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
