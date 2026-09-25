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
          Helping first-time investors{' '}
          <span style={{ color: P.color.gold }}>
            understand the next step.
          </span>
        </blockquote>

        <p style={{
          fontSize:   '1rem',
          color:      P.color.onMut,
          maxWidth:   '52ch',
          margin:     '0 auto 1.2rem',
          lineHeight: 1.72,
        }}>
          Research shifted our attention from adding features to explaining choices.
          I worked on language, information hierarchy and the purchase flow so people
          could make decisions with less financial jargon.
        </p>

        <p style={{
          fontSize:   '1rem',
          color:      P.color.onMut,
          maxWidth:   '52ch',
          margin:     '0 auto 1.2rem',
          lineHeight: 1.72,
        }}>
          My work on Profita was in 2020. The app continued to evolve before
          LH Bank received recognition for customer experience in 2023.
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
            Highly Commended · Best App for Customer Experience
          </strong>
          {' '}— Retail Banker International Asia Trailblazer Awards, 2023
          <br />
          <span style={{ opacity: .8 }}>
            <a href="https://hs.meed.com/hubfs/MEED/MEED%20Events/Special%20Reports/RBI/RBI%20Special%20Report%202023-1.pdf#page=14" target="_blank" rel="noopener noreferrer">
              Award organizer’s report, page 14 (PDF)
            </a>
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
