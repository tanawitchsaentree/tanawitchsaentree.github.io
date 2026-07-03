'use client'

import { useEffect } from 'react'
import { V } from '@/demos/vitae/tokens'
import { VitaeNav }     from '@/demos/vitae/VitaeNav'
import { VitaeHero }    from '@/demos/vitae/VitaeHero'
import { VitaeRoom }    from '@/demos/vitae/VitaeRoom'
import { VitaeReframe } from '@/demos/vitae/VitaeReframe'
import { VitaeLoop }    from '@/demos/vitae/VitaeLoop'
import { VitaeCalls }   from '@/demos/vitae/VitaeCalls'
import { VitaeKilled }  from '@/demos/vitae/VitaeKilled'
import { VitaeHowItWorks } from '@/demos/vitae/VitaeHowItWorks'
import { VitaeDevices } from '@/demos/vitae/VitaeDevices'
import { VitaeOutcome } from '@/demos/vitae/VitaeOutcome'

export function VitaeClient() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=DM+Sans:opsz,wght@9..40,300..600&family=Fraunces:ital,opsz,wght@1,9..144,300..600&family=Space+Mono:wght@400;700&display=swap');

        .vitae-wrap { max-width:80rem; width:100%; margin:0 auto; padding:0 clamp(1.4rem,5vw,7.5rem) }

        /* reveal */
        .vitae-animate { opacity:0; transform:translateY(${V.motion.distanceReveal}px); transition:opacity ${V.motion.durationBase} ${V.ease.expo},transform ${V.motion.durationBase} ${V.ease.expo} }
        .vitae-animate.vis { opacity:1; transform:none }

        /* hero line-rise */
        .v-ln { display:block; overflow:hidden }
        .v-ln i { display:inline-block; font-style:normal; transform:translateY(110%); animation:v-rise ${V.motion.durationHero} ${V.ease.expo} forwards }
        .v-ln:nth-child(2) i { animation-delay:${V.motion.durationStagger} }
        .v-ln:nth-child(3) i { animation-delay:calc(${V.motion.durationStagger} * 2.5) }
        @keyframes v-rise { to { transform:none } }
        @keyframes v-fade { to { opacity:1 } }

        /* reframe stage responsive */
        @media(max-width:880px) {
          .vitae-reframe-stage { grid-template-columns:1fr!important; justify-items:center; text-align:center; padding:3rem 1.4rem!important }
          .vitae-reframe-stage > div:first-child { height:auto!important; min-height:42vh; width:100% }
          .vitae-reframe-stage > div:last-child { margin-top:2rem }
        }

        /* voices grid */
        .vitae-voices-grid { grid-template-columns:repeat(2,1fr) }
        @media(max-width:760px) { .vitae-voices-grid { grid-template-columns:1fr!important } }

        /* forks grid */
        .vitae-forks-grid { grid-template-columns:repeat(3,1fr) }
        @media(max-width:820px) { .vitae-forks-grid { grid-template-columns:1fr!important } }

        /* how-it-works grid (old — kept for compat) */
        .vitae-how-grid { grid-template-columns:1fr 1fr }
        @media(max-width:760px) { .vitae-how-grid { grid-template-columns:1fr!important } }

        /* the one we killed */
        .vitae-killed-grid { grid-template-columns:.9fr 1fr }
        @media(max-width:860px) { .vitae-killed-grid { grid-template-columns:1fr!important } }
        @media(max-width:860px) { .vitae-killed-phone { justify-self:center!important; margin-top:2rem } }

        /* how it works new */
        .vitae-hiw-grid { grid-template-columns:1fr .9fr }
        @media(max-width:860px) { .vitae-hiw-grid { grid-template-columns:1fr!important } }
        @media(max-width:860px) { .vitae-hiw-phone { justify-self:center!important; margin-top:2rem } }

        /* vitals grid */
        .vitae-vitals-grid { grid-template-columns:repeat(3,1fr) }
        @media(max-width:760px) { .vitae-vitals-grid { grid-template-columns:1fr!important; gap:2.2rem!important } }

        /* nav */
        @media(max-width:640px) { .vitae-nav-links { display:none!important } }

        ::selection { background:${V.color.lime}; color:${V.color.ink} }
        ::-webkit-scrollbar { width:10px }
        ::-webkit-scrollbar-thumb { background:${V.alpha.ink18}; border-radius:5px }

        @media(prefers-reduced-motion:reduce) {
          .vitae-animate { transition:none }
          .v-ln i { animation:none!important; transform:none!important }
        }
      ` }} />

      <div
        data-demo="vitae"
        style={{
          background:      V.color.paper,
          color:           V.color.ink,
          fontFamily:      V.font.sans,
          fontSize:        V.size.body,
          lineHeight:      1.65,
          overflowX:       'clip',
          backgroundImage: `
            radial-gradient(900px 600px at 12% -5%, ${V.alpha.lime20}, transparent 55%),
            radial-gradient(800px 600px at 95% 8%,  ${V.alpha.lime10}, transparent 55%)
          `,
          minHeight: '100vh',
        }}
      >
        <VitaeNav />
        <VitaeHero />
        <VitaeRoom />
        <VitaeReframe />
        <VitaeLoop />
        <VitaeCalls />
        <VitaeKilled />
        <VitaeHowItWorks />
        <VitaeDevices />
        <VitaeOutcome />
      </div>

      <VitaeRevealScript />
    </>
  )
}

function VitaeRevealScript() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target) }
      }),
      { threshold: 0.06, rootMargin: '0px 0px 80px 0px' }
    )
    document.querySelectorAll('.vitae-animate').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
