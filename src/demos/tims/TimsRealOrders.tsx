'use client'

import { T } from './tokens'

const PERSONAS = [
  { label: 'The commuter regular',         gap: false },
  { label: 'Hockey parent',                gap: false },
  { label: 'Night-shift trucker',           gap: false },
  { label: 'The tea person',               gap: false },
  { label: 'French Vanilla loyalist',      gap: false },
  { label: 'Iced Capp fan',               gap: false },
  { label: 'Health-conscious',             gap: false },
  { label: 'The Québécois "deux-deux"',   gap: false },
  { label: 'Modifier maximalist',          gap: false },
  { label: 'Breakfast combo',             gap: false },
  { label: 'Picky iced',                  gap: false },
  { label: 'The newcomer',               gap: false },
  { label: 'Office "Box of Joe" runner',  gap: true  },
  { label: 'Senior "the usual"',          gap: true  },
  { label: 'Mobile pickup',              gap: true  },
  { label: 'Group spokesperson · 4 drinks', gap: false },
] as const

const COVERAGE = [
  { value: '12 / 20', label: 'handled outright' },
  { value: '~75%',    label: 'once partials are counted' },
  { value: '3',       label: 'gaps that shaped the next round' },
] as const

export function TimsRealOrders() {
  return (
    <section
      id="real"
      style={{ padding: 'clamp(5rem,13vw,11rem) 0', background: T.color.cream2, fontFamily: T.font.sans }}
    >
      <div className="tims-wrap tims-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)' }}>
          <span className="tims-label-section">Does it survive a real rush?</span>
          <h2 style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: T.size.display, letterSpacing: '-.015em', lineHeight: 1.03, margin: '.7rem 0 1.1rem', color: T.color.ink }}>
            I didn&apos;t invent these 20 people. I served them.
          </h2>
          <p style={{ color: T.color.inkSoft, fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '56ch' }}>
            The &ldquo;personas&rdquo; are just regulars I remember — the 5 a.m. commuter, the hockey parent ordering for the whole bench, the guy who changes his mind every time. I ran the build past all twenty, then was honest about what it could and couldn&apos;t do.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.55rem', margin: '1.4rem 0' }}>
          {PERSONAS.map(p => (
            <span
              key={p.label}
              style={{
                fontSize:   '1rem',
                background: T.color.paper,
                border:     `1px solid ${p.gap ? T.alpha.red40 : T.alpha.line}`,
                padding:    '.5rem .85rem',
                borderRadius: 10,
                color:      p.gap ? T.color.red : T.color.inkSoft,
              }}
            >
              {p.label}
            </span>
          ))}
        </div>

        <p style={{ color: T.color.inkSoft, maxWidth: '56ch', marginTop: '1.4rem', marginBottom: '1.2rem', lineHeight: 1.65 }}>
          Running through them surfaced the gaps that matter:{' '}
          <strong style={{ color: T.color.ink, fontWeight: 600 }}>fractions weren&apos;t supported, blends weren&apos;t possible, customers who change their mind got lost, and &ldquo;fast&rdquo; was only a feeling — never measured.</strong>{' '}
          The patterns in red are the ones a first build quietly fails.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.4rem' }}>
          {COVERAGE.map(c => (
            <div key={c.value} style={{ fontFamily: T.font.mono, fontSize: '1rem', color: T.color.inkSoft }}>
              <b style={{ fontFamily: T.font.display, fontSize: '1.6rem', color: T.color.ink, display: 'block', fontWeight: 500 }}>{c.value}</b>
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
