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
          06 · Reflection
        </p>

        <blockquote style={{
          fontFamily:    P.font.disp,
          fontStyle:     'italic',
          fontWeight:    400,
          fontSize:      'clamp(1.6rem,4vw,3rem)',
          lineHeight:    1.25,
          letterSpacing: '-.02em',
          color:         P.color.on,
          maxWidth:      '28ch',
          margin:        '0 auto 2.5rem',
        }}>
          Getting someone to start investing isn&rsquo;t a feature problem.{' '}
          <em style={{ color: P.color.gold }}>
            It&rsquo;s a fear problem.
          </em>
        </blockquote>

        <p style={{
          fontSize:   '1rem',
          color:      P.color.onMut,
          maxWidth:   '52ch',
          margin:     '0 auto 1.2rem',
          lineHeight: 1.72,
        }}>
          Profita was the project where I understood that UX design and emotional design
          are the same thing. Every decision — from the onboarding copy to the colour of
          a number — was a decision about how someone would feel about money.
        </p>

        <p style={{
          fontSize:   '1rem',
          color:      P.color.onMut,
          maxWidth:   '52ch',
          margin:     '0 auto',
          lineHeight: 1.72,
        }}>
          The award was a nice signal. But the real proof was watching users in testing
          go from &ldquo;I could never do this&rdquo; to &ldquo;Wait, I already did it?&rdquo;
          in four minutes.
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
        Profita · LH Bank · 2020 — case study
      </footer>
    </section>
  )
}
