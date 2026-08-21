'use client'

import { P } from './tokens'

export function ProfitaReflection() {
  return (
    <section
      id="reflection"
      className="prof-animate"
      style={{
        padding:    'clamp(6rem,14vw,12rem) 0',
        textAlign:  'center',
        position:   'relative',
        overflow:   'hidden',
        fontFamily: P.font.body,
      }}
    >
      {/* Gold glow blob */}
      <div aria-hidden="true" style={{
        position:     'absolute',
        inset:        0,
        pointerEvents:'none',
        display:      'flex',
        alignItems:   'center',
        justifyContent:'center',
        zIndex:       0,
      }}>
        <div style={{
          width:        '60vw',
          height:       '60vw',
          maxWidth:     700,
          maxHeight:    700,
          borderRadius: '50%',
          background:   `radial-gradient(circle, ${P.alpha.gold10} 0%, transparent 70%)`,
        }} />
      </div>

      <div className="prof-wrap" style={{ position: 'relative', zIndex: 1 }}>

        <p className="prof-kick" style={{ justifyContent: 'center' }}>
          07 · Reflection
        </p>

        <blockquote style={{
          fontFamily:    P.font.disp,
          fontWeight:    400,
          fontSize:      'clamp(1.6rem,4vw,3rem)',
          lineHeight:    1.25,
          letterSpacing: '-.02em',
          color:         P.color.on,
          maxWidth:      '28ch',
          margin:        '0 auto 2.5rem',
        }}>
          Getting someone to start investing is,{' '}
          <span style={{ color: P.color.gold }}>
            at its core, a fear problem.
          </span>
        </blockquote>

        <p style={{
          fontSize:   '1rem',
          color:      P.color.onMut,
          maxWidth:   '52ch',
          margin:     '0 auto 1.2rem',
          lineHeight: 1.72,
        }}>
          Profita was the project where I understood that UX design and emotional design
          are the same thing. Every decision, from the onboarding copy to the colour of
          a number, was a decision about how someone would feel about money.
        </p>

        <p style={{
          fontSize:   '1rem',
          color:      P.color.onMut,
          maxWidth:   '52ch',
          margin:     '0 auto 1.2rem',
          lineHeight: 1.72,
        }}>
          The award mattered less than the number underneath it. In testing, new users
          reached their first confirmed investment in under five minutes, with zero
          jargon required to get there.
        </p>

        <p style={{
          fontFamily:    P.font.mono,
          fontSize:      '.78rem',
          letterSpacing: '.06em',
          color:         P.color.onFaint,
          maxWidth:      '52ch',
          margin:        '0 auto',
          lineHeight:    1.6,
        }}>
          <strong style={{ color: P.color.gold, fontWeight: 600 }}>
            Best App for Customer Experience
          </strong>
          {' '}— Retail Banker International Asia Trailblazer Awards, 2023
          <br />
          <span style={{ opacity: .8 }}>
            (awarded three years after launch, following several redesign iterations)
          </span>
        </p>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop:     'clamp(4rem,8vw,7rem)',
        paddingTop:    '2rem',
        borderTop:     `1px solid ${P.alpha.line}`,
        textAlign:     'center',
        fontFamily:    P.font.mono,
        fontSize:      '.68rem',
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        color:         P.color.onFaint,
      }}>
        Profita · LH Bank · 2020 · Case study
      </footer>
    </section>
  )
}
