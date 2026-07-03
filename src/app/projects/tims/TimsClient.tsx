'use client'

import { useEffect } from 'react'
import { T } from '@/demos/tims/tokens'
import { TimsNav }        from '@/demos/tims/TimsNav'
import { TimsHero }       from '@/demos/tims/TimsHero'
import { TimsStatStrip }  from '@/demos/tims/TimsStatStrip'
import { TimsCounter }    from '@/demos/tims/TimsCounter'
import { TimsProblem }    from '@/demos/tims/TimsProblem'
import { TimsIdea }       from '@/demos/tims/TimsIdea'
import { TimsDemo }       from '@/demos/tims/TimsDemo'
import { TimsRealOrders } from '@/demos/tims/TimsRealOrders'
import { TimsFixed }      from '@/demos/tims/TimsFixed'
import { TimsLearned }    from '@/demos/tims/TimsLearned'
import { TimsFooter }     from '@/demos/tims/TimsFooter'


export function TimsClient() {
  // Scroll-reveal for [data-a] equivalents
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('tims-vis'); io.unobserve(e.target) }
      }),
      { threshold: 0.06, rootMargin: '0px 0px 80px 0px' }
    )
    document.querySelectorAll('.tims-animate').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Takeaways pop-in
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('tims-take-in'); io.unobserve(e.target) }
      }),
      { threshold: 0.4 }
    )
    document.querySelectorAll('.tims-take').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=DM+Sans:opsz,wght@9..40,300..600&family=Space+Mono:wght@400;700&display=swap');

        .tims-wrap { max-width:80rem; width:100%; margin:0 auto; padding:0 clamp(1.2rem,5vw,7.5rem) }
        .tims-narrow { max-width:760px }

        .tims-label {
          font-family:'Space Mono',monospace; font-size:.75rem; letter-spacing:.22em;
          text-transform:uppercase; color:${T.color.red}; display:inline-flex;
          align-items:center; gap:.7em; margin-bottom:1.6rem;
        }
        .tims-label::before { content:""; width:26px; height:1.5px; background:${T.color.red} }

        .tims-label-section {
          font-family:'Space Mono',monospace; font-size:.82rem; color:${T.color.muted}; letter-spacing:.12em;
          text-transform:uppercase; display:block; margin-bottom:.7rem;
        }

        /* scroll reveal */
        .tims-animate { opacity:0; transform:translateY(34px); transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1) }
        .tims-animate.tims-vis { opacity:1; transform:none }

        /* hero reveal */
        .tims-reveal>* { opacity:0; transform:translateY(24px); animation:tims-up .9s cubic-bezier(.16,1,.3,1) forwards }
        .tims-reveal>*:nth-child(1){animation-delay:.05s}.tims-reveal>*:nth-child(2){animation-delay:.13s}
        .tims-reveal>*:nth-child(3){animation-delay:.21s}.tims-reveal>*:nth-child(4){animation-delay:.29s}
        .tims-reveal>*:nth-child(5){animation-delay:.37s}
        @keyframes tims-up { to { opacity:1; transform:none } }

        /* live board blink */
        @keyframes tims-blink {
          0%,100% { opacity:1; box-shadow:0 0 0 0 ${T.alpha.red50} }
          50%     { opacity:.5; box-shadow:0 0 0 5px ${T.alpha.red00} }
        }

        /* order chip */
        @keyframes tims-ordIn {
          0%   { opacity:0; transform:translateX(-14px) scale(.9) }
          60%  { transform:translateX(2px) scale(1.02) }
          100% { opacity:1; transform:none }
        }

        /* takeaways */
        .tims-take {
          background:${T.color.paper}; border:1px solid ${T.alpha.line}; border-radius:16px;
          padding:1.2rem 1.3rem; box-shadow:0 1px 2px ${T.alpha.ink05},0 12px 28px ${T.alpha.ink06};
          opacity:0; transform:translateY(22px) scale(.96);
        }
        .tims-take.tims-take-in { animation:tims-pop .6s cubic-bezier(.34,1.56,.64,1) forwards }
        @keyframes tims-pop { to { opacity:1; transform:none } }
        .tims-take:hover { transform:translateY(-4px); transition:transform .2s cubic-bezier(.16,1,.3,1) }

        /* nav link underline */
        .tims-nav-link { position:relative }
        .tims-nav-link::after { content:""; position:absolute; left:0; bottom:-2px; width:0; height:1.5px; background:${T.color.red}; transition:width .35s cubic-bezier(.16,1,.3,1) }
        .tims-nav-link:hover::after { width:100% }

        /* responsive */
        @media(max-width:720px) { .tims-nav-links{display:none!important} }
        @media(max-width:760px) { .tims-scene-grid{grid-template-columns:1fr!important} }
        @media(max-width:900px) { .tims-hero-grid{grid-template-columns:1fr!important} }
        @media(max-width:680px) { .tims-takes-grid{grid-template-columns:1fr!important} .tims-princ-grid{grid-template-columns:1fr!important} }
        @media(max-width:560px) { .tims-iter{grid-template-columns:1fr!important;gap:.7rem!important} }

        /* stat strip responsive */
        @media(max-width:720px) { .tims-strip-grid{grid-template-columns:1fr 1fr!important} }

        ::selection { background:${T.color.red}; color:${T.color.onAccent} }

        @media(prefers-reduced-motion:reduce){
          .tims-animate,.tims-reveal>*,.tims-take{transition:none!important;animation:none!important;opacity:1!important;transform:none!important}
          .tims-take.tims-take-in{animation:none!important;opacity:1!important;transform:none!important}
        }
      ` }} />

      <div
        data-demo="tims"
        style={{
          background:      T.color.cream,
          color:           T.color.ink,
          fontFamily:      T.font.sans,
          fontSize:        T.size.body,
          lineHeight:      1.65,
          overflowX:       'clip',
          backgroundImage: `radial-gradient(900px 480px at 88% -6%, ${T.alpha.red10}, transparent 60%)`,
          minHeight:       '100vh',
        }}
      >
        <TimsNav />
        <TimsHero />
        <TimsStatStrip />
        <TimsCounter />
        <TimsProblem />
        <TimsIdea />
        <TimsDemo />
        <TimsRealOrders />
        <TimsFixed />
        <TimsLearned />
        <TimsFooter />
      </div>
    </>
  )
}
