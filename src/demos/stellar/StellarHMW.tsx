'use client'

import { S } from './tokens'

export function StellarHMW() {
  return (
    <section style={{ padding: 'clamp(5rem,13vw,11rem) 0' }}>
      <div className="stellar-wrap" style={{ maxWidth: 780 }}>
        <div
          className="stellar-animate"
          style={{
            textAlign:    'center',
            background:   S.color.limeSoft,
            borderRadius: 26,
            padding:      'clamp(2.5rem,6vw,4.5rem) clamp(1.5rem,4vw,3rem)',
          }}
        >
          <span className="stellar-label" style={{ justifyContent: 'center', color: S.color.greenDeep }}>
            The question that pointed the way
          </span>
          <p style={{
            fontFamily:  S.font.display,
            fontWeight:  600,
            fontSize:    'clamp(1.5rem,3.4vw,2.6rem)',
            lineHeight:  1.3,
            maxWidth:    '22ch',
            margin:      '1rem auto 0',
            color:       S.color.ink,
          }}>
            How might we <em style={{ fontFamily: S.font.italic, fontStyle: 'italic', fontWeight: 500, color: S.color.greenDeep }}>build a recipe generator</em> that creates new dishes from the ingredients people already have?
          </p>
        </div>
      </div>
    </section>
  )
}
