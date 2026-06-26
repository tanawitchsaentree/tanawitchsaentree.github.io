'use client'

import { S } from './tokens'

const QUADS = [
  {
    icon:  '🧠',
    title: 'Think & feel',
    items: [
      'Tired of cooking the same recipes every week.',
      'Wish there was more time to plan and shop.',
      'Worried about wasting food and money.',
    ],
  },
  {
    icon:  '👀',
    title: 'See',
    items: [
      'No easy way to plan meals around what\'s at home.',
      'Grocery trips that don\'t match what gets cooked.',
    ],
  },
  {
    icon:  '👂',
    title: 'Hear',
    items: [
      'Food bloggers and influencers everywhere.',
      'Cookbooks and sites — but none personal.',
    ],
  },
  {
    icon:  '🗣️',
    title: 'Say & do',
    items: [
      'Throw away expired ingredients, then feel bad.',
      'Want more confidence in the kitchen.',
    ],
  },
] as const

export function StellarEmpathy() {
  return (
    <section style={{ padding: 'clamp(5rem,13vw,11rem) 0' }}>
      <div className="stellar-wrap stellar-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)', maxWidth: 740 }}>
          <span style={{ fontFamily: S.font.mono, fontSize: '.78rem', color: S.color.greenDeep, letterSpacing: '.12em', textTransform: 'uppercase', display: 'block', marginBottom: '.6rem' }}>
            Inside their head
          </span>
          <h2 style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: S.size.display, letterSpacing: '-.015em', lineHeight: 1.02, color: S.color.ink }}>
            An empathy map made the <em style={{ fontFamily: S.font.italic, fontStyle: 'italic', fontWeight: 500, color: S.color.greenDeep }}>feeling</em> concrete.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }} className="stellar-empathy-grid">
          {QUADS.map(q => (
            <div
              key={q.title}
              style={{
                background:   S.color.onFill,
                border:       `1px solid ${S.alpha.line}`,
                borderRadius: 20,
                padding:      '1.5rem',
                boxShadow:    `0 14px 34px ${S.alpha.ink06}`,
              }}
            >
              <div style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: '1.2rem', color: S.color.greenDeep, marginBottom: '.7rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                {q.icon} {q.title}
              </div>
              <ul style={{ listStyle: 'none', display: 'grid', gap: '.5rem' }}>
                {q.items.map(item => (
                  <li
                    key={item}
                    style={{ fontSize: '1rem', color: S.color.inkSoft, paddingLeft: '1.1rem', position: 'relative', lineHeight: 1.45 }}
                  >
                    <span aria-hidden style={{ position: 'absolute', left: 0, top: '.6em', width: 6, height: 6, borderRadius: '50%', background: S.color.lime, display: 'inline-block' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
