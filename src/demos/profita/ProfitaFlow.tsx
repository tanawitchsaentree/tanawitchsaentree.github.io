'use client'

import { useState } from 'react'
import { P } from './tokens'
import { PhoneFrame } from './PhoneFrame'

const FLOW = [
  {
    tab:  'Discover',
    tag:  'Step 01 · Discover',
    head: 'Start from a goal, not a ticker',
    desc: 'We asked users what they wanted their money to do — travel, retirement, a safety net — and built the entry point around that answer. The fund appears after the goal is set.',
  },
  {
    tab:  'Explore',
    tag:  'Step 02 · Explore',
    head: 'Funds matched to your goal',
    desc: 'The app surfaces 3–5 fund options filtered to the user\'s timeline and risk tolerance. No overwhelming catalogue — only what\'s relevant to their stated goal.',
  },
  {
    tab:  'Compare',
    tag:  'Step 03 · Compare',
    head: 'Side-by-side, plain language',
    desc: 'Returns, risk rating, and who else invests — explained without financial jargon. Users can tap any term for a plain-language tooltip. No glossary detour.',
  },
  {
    tab:  'Set amount',
    tag:  'Step 04 · Set amount',
    head: 'One slider, one number',
    desc: 'A single input: how much per month? The app shows projected value in 5 years instantly. No forms, no nested conditions, no confusion.',
  },
  {
    tab:  'Confirm',
    tag:  'Step 05 · Confirm',
    head: 'One tap to start',
    desc: 'Summary screen with a clear, single action. No fine print buried in scrollable walls of text. The commitment is visible and feels light.',
  },
] as const

export function ProfitaFlow() {
  const [active, setActive] = useState(0)
  const step = FLOW[active]

  return (
    <section
      id="flow"
      className="prof-animate"
      style={{ padding: 'clamp(4rem,9vw,7rem) 0', fontFamily: P.font.body }}
    >
      <div className="prof-wrap">
        <p className="prof-kick" style={{ marginBottom: '2.5rem' }}>
          04 · The signature flow
        </p>

        {/* Tab row */}
        <div style={{
          display:      'flex',
          gap:          4,
          marginBottom: '2.8rem',
          flexWrap:     'wrap',
        }}>
          {FLOW.map((f, i) => (
            <button
              key={f.tab}
              type="button"
              onClick={() => setActive(i)}
              style={{
                fontFamily:    P.font.mono,
                fontSize:      '.72rem',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                padding:       '.5rem 1rem',
                borderRadius:  8,
                border:        `1px solid ${i === active ? P.alpha.gold35 : P.alpha.line}`,
                background:    i === active ? P.alpha.gold14 : P.alpha.white07,
                color:         i === active ? P.color.gold : P.color.onMut,
                cursor:        'pointer',
                transition:    [
                  `background .25s ${P.ease.expo}`,
                  `color .25s ${P.ease.expo}`,
                  `border-color .25s ${P.ease.expo}`,
                ].join(', '),
              }}
              aria-pressed={i === active}
            >
              {f.tab}
            </button>
          ))}
        </div>

        {/* Content: phone left + description right */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'auto 1fr',
          gap:                 'clamp(2rem,5vw,5rem)',
          alignItems:          'center',
        }}>
          {/* Phone */}
          <div style={{ '--pw': '172px' } as React.CSSProperties}>
            <PhoneFrame label={step.tab} />
          </div>

          {/* Description */}
          <div>
            <p style={{
              fontFamily:    P.font.mono,
              fontSize:      '.65rem',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color:         P.color.gold,
              marginBottom:  '.9rem',
            }}>
              {step.tag}
            </p>
            <h3 style={{
              fontFamily:    P.font.disp,
              fontWeight:    400,
              fontSize:      'clamp(1.5rem,3.5vw,2.5rem)',
              lineHeight:    1.15,
              letterSpacing: '-.02em',
              color:         P.color.on,
              marginBottom:  '1.2rem',
            }}>
              {step.head}
            </h3>
            <p style={{
              fontSize:   '1rem',
              color:      P.color.onMut,
              lineHeight: 1.7,
              maxWidth:   '44ch',
            }}>
              {step.desc}
            </p>

            {/* Step indicators */}
            <div style={{
              display:    'flex',
              gap:        8,
              marginTop:  '2rem',
            }}>
              {FLOW.map((_, i) => (
                <div key={i} style={{
                  width:        i === active ? 24 : 6,
                  height:       6,
                  borderRadius: 999,
                  background:   i === active ? P.color.gold : P.alpha.gold35,
                  transition:   `width .35s ${P.ease.expo}, background .25s ${P.ease.expo}`,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
