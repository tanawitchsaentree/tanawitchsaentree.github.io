'use client'

import { useRef } from 'react'
import { S } from './tokens'

const FEATURES = [
  {
    tag:   'Keep them coming back',
    title: 'Personalized Recipe Book',
    body:  'Suggestions that learn from cooking history and taste.',
    pills: ['Recommendations', 'Habit analysis', 'Recipe evolution'],
    star:  false,
  },
  {
    tag:   '★ The heart',
    title: 'Recipe Generator',
    body:  'A surprise-me engine that invents new, unexpected combinations from what you have.',
    pills: ['Ingredient randomizer', 'Cuisine explorer', 'Dietary twist', 'Flavour profiler'],
    star:  true,
  },
  {
    tag:   'Cook from your kitchen',
    title: 'Smart Ingredient Suggestions',
    body:  'Track your pantry and get recipes from what\'s actually on the shelf.',
    pills: ['Pantry tracker', 'Substitute finder', 'Shopping list'],
    star:  false,
  },
] as const

export function StellarFeatures() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleMove = (e: React.MouseEvent, i: number) => {
    const card = cardRefs.current[i]
    if (!card) return
    const r = card.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top)  / r.height - 0.5
    card.style.transform = `perspective(700px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-4px)`
  }
  const handleLeave = (i: number) => {
    const card = cardRefs.current[i]
    if (card) card.style.transform = ''
  }

  return (
    <section id="idea" style={{ padding: 'clamp(5rem,13vw,11rem) 0' }}>
      <div className="stellar-wrap stellar-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)', maxWidth: 740 }}>
          <span style={{ fontFamily: S.font.mono, fontSize: '.78rem', color: S.color.greenDeep, letterSpacing: '.12em', textTransform: 'uppercase', display: 'block', marginBottom: '.6rem' }}>
            The bet, in three features
          </span>
          <h2 style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: S.size.display, letterSpacing: '-.015em', lineHeight: 1.02, margin: '.7rem 0 1.1rem', color: S.color.ink }}>
            One idea did the heavy lifting.
          </h2>
          <p style={{ color: S.color.inkSoft, fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '56ch' }}>
            Everything pointed at generation, not just search. Three features, but the middle one is the heart of Stellar.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.2rem' }} className="stellar-feats-grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              ref={el => { cardRefs.current[i] = el }}
              onMouseMove={e => handleMove(e, i)}
              onMouseLeave={() => handleLeave(i)}
              style={{
                background:     f.star ? `linear-gradient(160deg,${S.color.lime},${S.color.greenStar})` : S.color.onFill,
                border:         f.star ? 'none' : `1px solid ${S.alpha.line}`,
                borderRadius:   22,
                padding:        '1.7rem',
                position:       'relative',
                overflow:       'hidden',
                boxShadow:      f.star ? S.alpha.shadowFeat : 'none',
                transition:     `transform .3s ${S.ease.expo}`,
                transformStyle: 'preserve-3d',
              }}
            >
              <span style={{ fontFamily: S.font.mono, fontSize: '.75rem', letterSpacing: '.14em', textTransform: 'uppercase', color: f.star ? S.color.forest1 : S.color.greenDeep }}>
                {f.tag}
              </span>
              <h4 style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: '1.3rem', margin: '.5rem 0 .6rem', color: S.color.ink }}>
                {f.title}
              </h4>
              <p style={{ fontSize: '1rem', color: f.star ? S.color.forest2 : S.color.inkSoft, lineHeight: 1.5, marginBottom: '1.1rem' }}>
                {f.body}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.45rem' }}>
                {f.pills.map(pill => (
                  <span
                    key={pill}
                    style={{
                      fontSize:     '.78rem',
                      letterSpacing: '.08em',
                      textTransform: 'uppercase' as const,
                      background:   f.star ? S.alpha.inkDark10 : S.color.paper2,
                      border:       f.star ? 'none' : `1px solid ${S.alpha.line}`,
                      padding:      '.42rem .75rem',
                      borderRadius: 999,
                      color:        f.star ? S.color.forest3 : S.color.inkSoft,
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
