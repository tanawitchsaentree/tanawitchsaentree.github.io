'use client'

import { useEffect } from 'react'
import { V } from '@/demos/vitae/tokens'
import { VitaeNav } from '@/demos/vitae/VitaeNav'
import { VitaeHero } from '@/demos/vitae/VitaeHero'
import { VitaeLoop } from '@/demos/vitae/VitaeLoop'
import { VitaePhases } from '@/demos/vitae/VitaePhases'
import { VitaeDevices } from '@/demos/vitae/VitaeDevices'
import { VitaeOutcome } from '@/demos/vitae/VitaeOutcome'

export function VitaeClient() {
  return (
    <>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');
        .vitae-wrap{max-width:80rem;width:100%;margin:0 auto;padding:0 clamp(1.2rem,5vw,7.5rem)}
        .vitae-animate{opacity:0;transform:translateY(34px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
        .vitae-animate.vis{opacity:1;transform:none}
        .vitae-reveal>*{opacity:0;transform:translateY(26px);animation:vitae-fadeup .9s cubic-bezier(.16,1,.3,1) forwards}
        .vitae-reveal>*:nth-child(1){animation-delay:.05s}
        .vitae-reveal>*:nth-child(2){animation-delay:.15s}
        .vitae-reveal>*:nth-child(3){animation-delay:.25s}
        .vitae-reveal>*:nth-child(4){animation-delay:.35s}
        .vitae-reveal>*:nth-child(5){animation-delay:.45s}
        @keyframes vitae-fadeup{to{opacity:1;transform:none}}
        @media(prefers-reduced-motion:reduce){.vitae-animate{transition:none}.vitae-reveal>*{animation:none;opacity:1;transform:none}}
        @media(max-width:880px){.vitae-hero-grid{grid-template-columns:1fr!important}}
        @media(max-width:840px){.vitae-loop-grid{grid-template-columns:1fr!important}}
        @media(max-width:680px){.vitae-phase-grid{grid-template-columns:1fr!important;gap:1.2rem!important}}
        @media(max-width:640px){.vitae-nav-links{display:none!important}.vitae-results{grid-template-columns:1fr 1fr!important}}
        @media(max-width:680px){.vitae-phone{transform:scale(.92)}.vitae-phone-2{margin-top:0!important}}
        ::selection{background:${V.color.lime};color:${V.color.ink}}
      ` }} />

      {/* page shell */}
      <div
        data-demo="vitae"
        style={{
          background:      V.color.paper,
          color:           V.color.ink,
          fontFamily:      V.font.sans,
          fontSize:        V.size.body,
          lineHeight:      1.65,
          overflowX:       'hidden',
          backgroundImage: `
            radial-gradient(900px 500px at 88% -8%, ${V.alpha.lime20}, transparent 60%),
            radial-gradient(700px 460px at -6% 30%, ${V.alpha.lime10}, transparent 55%)
          `,
          minHeight:       '100vh',
        }}
      >
        <VitaeNav />
        <VitaeHero />
        <VitaeLoop />
        <VitaePhases />
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
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.vitae-animate').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
