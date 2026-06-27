'use client'

import { useEffect } from 'react'
import { S } from '@/demos/stellar/tokens'
import { StellarNav }      from '@/demos/stellar/StellarNav'
import { StellarHero }     from '@/demos/stellar/StellarHero'
import { StellarMarquee }  from '@/demos/stellar/StellarMarquee'
import { StellarProblem }  from '@/demos/stellar/StellarProblem'
import { StellarStats }    from '@/demos/stellar/StellarStats'
import { StellarEmpathy }  from '@/demos/stellar/StellarEmpathy'
import { StellarJTBD }     from '@/demos/stellar/StellarJTBD'
import { StellarHMW }      from '@/demos/stellar/StellarHMW'
import { StellarFeatures } from '@/demos/stellar/StellarFeatures'
import { StellarBuild }        from '@/demos/stellar/StellarBuild'
import { StellarRecipeCards }  from '@/demos/stellar/StellarRecipeCards'
import { StellarLearned }  from '@/demos/stellar/StellarLearned'
import { StellarFooter }   from '@/demos/stellar/StellarFooter'


export function StellareatClient() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('stellar-vis'); io.unobserve(e.target) }
      }),
      { threshold: 0.14, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.stellar-animate').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=DM+Sans:opsz,wght@9..40,300..600&family=Fraunces:ital,opsz,wght@1,9..144,400..600&family=Space+Mono:wght@400;700&display=swap');

        .stellar-wrap { max-width:80rem; width:100%; margin:0 auto; padding:0 clamp(1.2rem,5vw,7.5rem) }

        /* scroll reveal */
        .stellar-animate { opacity:0; transform:translateY(36px); transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1) }
        .stellar-animate.stellar-vis { opacity:1; transform:none }

        /* hero line-rise */
        .stellar-hero-h1 { font-family:'Bricolage Grotesque',sans-serif; font-weight:700; letter-spacing:-.02em; line-height:1.02; font-size:${S.size.hero}; position:relative; z-index:2 }
        .stellar-l1 { display:block; overflow:hidden }
        .stellar-l1 span { display:inline-block; transform:translateY(110%); animation:stellar-rise 1s cubic-bezier(.16,1,.3,1) forwards }
        .stellar-l1:nth-child(2) span { animation-delay:.12s }
        .stellar-l1:nth-child(3) span { animation-delay:.24s }
        .stellar-l1:nth-child(4) span { animation-delay:.36s }
        @keyframes stellar-rise { to { transform:none } }

        /* veg pop-in — 8 depth-layered produce items, far→mid→near stagger */
        .stellar-veg-1,.stellar-veg-2,.stellar-veg-3,.stellar-veg-4,.stellar-veg-5,.stellar-veg-6,.stellar-veg-7,.stellar-veg-8 { opacity:0; animation:stellar-pop-veg .8s cubic-bezier(.34,1.56,.64,1) forwards }
        .stellar-veg-1 { animation-delay:.50s }
        .stellar-veg-2 { animation-delay:.58s }
        .stellar-veg-3 { animation-delay:.66s }
        .stellar-veg-4 { animation-delay:.72s }
        .stellar-veg-5 { animation-delay:.78s }
        .stellar-veg-6 { animation-delay:.82s }
        .stellar-veg-7 { animation-delay:.86s }
        .stellar-veg-8 { animation-delay:.90s }
        @keyframes stellar-pop-veg { from{opacity:0;transform:scale(.4) rotate(-20deg)} to{opacity:1;transform:none} }

        /* hero lead + meta fade */
        .stellar-hero-lead { font-size:1.22rem; color:${S.color.inkSoft}; max-width:50ch; margin-top:2rem; opacity:0; animation:stellar-fade 1s cubic-bezier(.16,1,.3,1) .5s forwards; position:relative; z-index:2; line-height:1.65 }
        .stellar-meta { display:flex; flex-wrap:wrap; gap:2.2rem; margin-top:2.6rem; padding-top:1.8rem; border-top:1px solid ${S.alpha.line}; opacity:0; animation:stellar-fade 1s cubic-bezier(.16,1,.3,1) .7s forwards; position:relative; z-index:2 }
        .stellar-meta b { display:block; font-family:'Space Mono'; font-size:.75rem; letter-spacing:.16em; text-transform:uppercase; color:${S.color.muted}; margin-bottom:.35rem; font-weight:400 }
        .stellar-meta span { font-family:'Bricolage Grotesque'; font-weight:600; font-size:1rem }
        @keyframes stellar-fade { to { opacity:1 } }

        /* label variants */
        .stellar-label { font-family:'Space Mono',monospace; font-size:.75rem; letter-spacing:.22em; text-transform:uppercase; color:${S.color.greenDeep}; display:inline-flex; align-items:center; gap:.7em }
        .stellar-label::before { content:""; width:24px; height:1.5px; background:${S.color.greenDeep} }
        .stellar-label-inv { font-family:'Space Mono',monospace; font-size:.75rem; letter-spacing:.22em; text-transform:uppercase; color:${S.color.lime}; display:inline-flex; align-items:center; gap:.7em }
        .stellar-label-inv::before { content:""; width:24px; height:1.5px; background:${S.color.lime} }

        /* marquee — scroll driven by JS RAF (no CSS duration) */
        .stellar-marquee-track { display:flex; gap:2.5rem; white-space:nowrap; width:max-content; will-change:transform }
        .stellar-marquee-item { display:inline-flex; align-items:center; gap:.6rem }
        .stellar-marquee-item::after { content:"●"; color:${S.color.lime}; font-size:.75rem }

        /* JTBD scrollbar */
        .stellar-jtbd-scroll::-webkit-scrollbar { height:6px }
        .stellar-jtbd-scroll::-webkit-scrollbar-track { background: transparent }
        .stellar-jtbd-scroll::-webkit-scrollbar-thumb { background: rgba(27,43,24,.18); border-radius:99px }

        /* responsive */
        @media(max-width:720px){ .stellar-nav-links{display:none!important} }
        @media(max-width:760px){ .stellar-pains-grid{grid-template-columns:1fr!important} .stellar-empathy-grid{grid-template-columns:1fr!important} .stellar-stats-grid{grid-template-columns:1fr 1fr!important} }
        @media(max-width:820px){ .stellar-feats-grid{grid-template-columns:1fr!important} }
        @media(max-width:680px){ .stellar-princ-grid{grid-template-columns:1fr!important} }
        @media(max-width:760px){ .stellar-shots-feat-grid{grid-template-columns:1fr!important} .stellar-shots-grid{grid-template-columns:1fr 1fr!important} }

        ::selection { background:${S.color.green}; color:${S.color.onFill} }
        ::-webkit-scrollbar { width:10px }
        ::-webkit-scrollbar-thumb { background:${S.alpha.ink25}; border-radius:5px }

        @media (prefers-reduced-motion:reduce) {
          .stellar-animate { transition:none!important }
          .stellar-l1 span,.stellar-veg-1,.stellar-veg-2,.stellar-veg-3,.stellar-veg-4,.stellar-veg-5,.stellar-veg-6,.stellar-veg-7,.stellar-veg-8,.stellar-hero-lead,.stellar-meta { animation:none!important; opacity:1!important; transform:none!important }
          .stellar-marquee-track { animation:none!important }
        }
      ` }} />

      <div
        data-demo="stellar"
        style={{
          background:      S.color.paper,
          color:           S.color.ink,
          fontFamily:      S.font.body,
          fontSize:        S.size.body,
          lineHeight:      1.65,
          overflowX:       'hidden',
          position:        'relative',
          minHeight:       '100vh',
        }}
      >
        {/* grain + mesh */}
        <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: -2, background: `radial-gradient(900px 600px at 12% -5%,${S.alpha.lime40},transparent 55%),radial-gradient(800px 600px at 95% 8%,${S.alpha.green18},transparent 55%),radial-gradient(700px 500px at 60% 100%,${S.alpha.citrus10},transparent 60%)`, pointerEvents: 'none' }} />

        <StellarNav />
        <StellarHero />
        <StellarMarquee />
        <StellarProblem />
        <StellarStats />
        <StellarEmpathy />
        <StellarJTBD />
        <StellarHMW />
        <StellarFeatures />
        <StellarBuild />
        <StellarRecipeCards />
        <StellarLearned />
        <StellarFooter />
      </div>
    </>
  )
}
