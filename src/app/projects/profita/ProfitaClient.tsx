'use client'

import { useEffect } from 'react'
import { P }                  from '@/demos/profita/tokens'
import { ProfitaNav }         from '@/demos/profita/ProfitaNav'
import { ProfitaHero }        from '@/demos/profita/ProfitaHero'
import { ProfitaProblem }     from '@/demos/profita/ProfitaProblem'
import { ProfitaTension }     from '@/demos/profita/ProfitaTension'
import { ProfitaDecisions }   from '@/demos/profita/ProfitaDecisions'
import { ProfitaFlow }        from '@/demos/profita/ProfitaFlow'
import { ProfitaSystem }        from '@/demos/profita/ProfitaSystem'
import { ProfitaScreenGallery } from '@/demos/profita/ProfitaScreenGallery'
import { ProfitaReflection }    from '@/demos/profita/ProfitaReflection'

export function ProfitaClient() {
  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('prof-vis'); io.unobserve(e.target) }
      }),
      { threshold: 0.06, rootMargin: '0px 0px 80px 0px' }
    )
    document.querySelectorAll('.prof-animate').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap');

        [data-demo="profita"] {
          --pw: 168px;
        }

        [data-demo="profita"] .prof-wrap {
          max-width: 80rem;
          width: 100%;
          margin: 0 auto;
          padding: 0 clamp(1.2rem, 5vw, 7.5rem);
        }

        /* Scroll reveal */
        [data-demo="profita"] .prof-animate {
          opacity: 0;
          transform: translateY(24px);
          transition:
            opacity  .6s ${P.ease.expo},
            transform .6s ${P.ease.expo};
        }
        [data-demo="profita"] .prof-animate.prof-vis {
          opacity: 1;
          transform: none;
        }

        /* Gold overline kick label */
        [data-demo="profita"] .prof-kick {
          font-family: 'IBM Plex Mono', monospace;
          font-size: .72rem;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: ${P.color.gold};
          display: inline-flex;
          align-items: center;
          gap: .7em;
          margin-bottom: 1.2rem;
        }
        [data-demo="profita"] .prof-kick::before {
          content: "";
          display: inline-block;
          width: 22px;
          height: 1.5px;
          background: ${P.color.gold};
          flex-shrink: 0;
        }

        /* Scroll cue dot pulse */
        @keyframes prof-scrollcue {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.6); opacity: .5; }
        }
        [data-demo="profita"] .prof-scrollcue {
          animation: prof-scrollcue 2s ${P.ease.smooth} infinite;
        }

        /* Text selection */
        [data-demo="profita"] ::selection {
          background: ${P.color.gold};
          color: ${P.color.navy900};
        }

        /* Responsive — use class names, not style-string matching */
        @media (max-width: 760px) {
          [data-demo="profita"] .prof-grid-2,
          [data-demo="profita"] .prof-grid-3,
          [data-demo="profita"] .prof-grid-auto {
            grid-template-columns: 1fr !important;
          }
          [data-demo="profita"] .prof-grid-4 {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-demo="profita"] .prof-animate,
          [data-demo="profita"] .prof-scrollcue {
            transition: none !important;
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      ` }} />

      <div
        data-demo="profita"
        style={{
          background:  P.color.navy900,
          color:       P.color.on,
          fontFamily:  P.font.body,
          fontSize:    '1rem',
          lineHeight:  1.6,
          overflowX:   'clip',
          minHeight:   '100vh',
        }}
      >
        <ProfitaNav />
        <ProfitaHero />
        <ProfitaProblem />
        <ProfitaTension />
        <ProfitaDecisions />
        <ProfitaFlow />
        <ProfitaSystem />
        <ProfitaScreenGallery />
        <ProfitaReflection />
      </div>
    </>
  )
}
