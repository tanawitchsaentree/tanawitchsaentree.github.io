'use client'

import { S } from './tokens'

const ROW_A = [
  { icon: '✨', title: 'Magic Mode',      desc: 'type ingredients →\nAI generates a recipe' },
  { icon: '🔎', title: 'Recipe Discovery', desc: 'search, mood,\ntrending, top chefs' },
  { icon: '🎛️', title: 'Custom Filter',   desc: 'cuisine · diet ·\nnutrition · flavour' },
] as const

const ROW_B = [
  { icon: '💬', title: 'AI Consult',          desc: 'chat, then\nescalate to chefs' },
  { icon: '🥫', title: 'What\'s in your Pantry', desc: 'track & cook\nfrom the shelf' },
  { icon: '📖', title: 'Recipe Detail',       desc: 'ingredients,\nsteps, timing' },
] as const

function Slot({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      border:        `2px dashed ${S.alpha.line}`,
      borderRadius:  22,
      background:    `repeating-linear-gradient(135deg,${S.alpha.ink03} 0 14px,transparent 14px 28px),${S.color.paper2}`,
      aspectRatio:   '9/17',
      display:       'grid',
      placeContent:  'center',
      textAlign:     'center',
      padding:       '1rem',
      position:      'relative',
      overflow:      'hidden',
    }}>
      <div>
        <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '.5rem' }}>{icon}</span>
        <b style={{ fontFamily: S.font.display, fontSize: '1rem', color: S.color.ink, display: 'block', marginBottom: '.3rem', letterSpacing: '-.01em' }}>
          {title}
        </b>
        <small style={{ fontFamily: S.font.mono, fontSize: '.78rem', letterSpacing: '.1em', textTransform: 'uppercase', color: S.color.greenDeep, lineHeight: 1.6, whiteSpace: 'pre-line', fontStyle: 'normal', display: 'block' }}>
          {desc}
        </small>
      </div>
    </div>
  )
}

export function StellarBuild() {
  return (
    <section
      id="build"
      style={{ padding: 'clamp(5rem,13vw,11rem) 0', background: S.color.paper2, borderRadius: 40 }}
    >
      <div className="stellar-wrap stellar-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)', maxWidth: 740 }}>
          <span style={{ fontFamily: S.font.mono, fontSize: '.78rem', color: S.color.greenDeep, letterSpacing: '.12em', textTransform: 'uppercase', display: 'block', marginBottom: '.6rem' }}>
            The build
          </span>
          <h2 style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: S.size.display, letterSpacing: '-.015em', lineHeight: 1.02, margin: '.7rem 0 1.1rem', color: S.color.ink }}>
            From insight to <em style={{ fontFamily: S.font.italic, fontStyle: 'italic', fontWeight: 500, color: S.color.greenDeep }}>screens.</em>
          </h2>
          <p style={{ color: S.color.inkSoft, fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '56ch' }}>
            The high-fidelity flows live here. Slots are reserved — the app mockups drop in next.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1.1rem' }} className="stellar-shots-feat-grid">
          {ROW_A.map(s => <Slot key={s.title} {...s} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.1rem', marginTop: '1.1rem' }} className="stellar-shots-grid">
          {ROW_B.map(s => <Slot key={s.title} {...s} />)}
        </div>

        <p style={{ color: S.color.inkSoft, maxWidth: '56ch', marginTop: '1.6rem', fontSize: '1.1rem', lineHeight: 1.65 }}>
          The interface stayed dark and photo-forward on purpose —{' '}
          <strong style={{ color: S.color.ink, fontWeight: 600 }}>65% said visuals drive whether they&apos;ll cook a dish</strong>,
          {' '}so food imagery leads and chrome gets out of the way.
        </p>
      </div>
    </section>
  )
}
