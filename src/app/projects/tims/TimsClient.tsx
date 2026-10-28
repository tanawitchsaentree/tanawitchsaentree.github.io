'use client'

import { useEffect, useState } from 'react'
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
import { TimsTicket }     from '@/demos/tims/TimsTicket'


export function TimsClient() {
  // The page follows one order. The section in the middle band of the screen is the active moment;
  // the ticket pinned beside the page reads it. One observer, no scroll listener.
  const [moment, setMoment] = useState(0)
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setMoment(Number((e.target as HTMLElement).dataset.m)) }),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    document.querySelectorAll('[data-demo="tims"] [data-m]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `

        /* The ticket takes the right-hand rail on wide screens; sections where it steps aside use tims-wrap-wide. */
        [data-demo="tims"] { --rail:0px }
        @media(min-width:1180px) { [data-demo="tims"] { --rail:16rem } }
        .tims-wrap { max-width:80rem; width:100%; margin:0 auto; padding:0 calc(clamp(1.2rem,5vw,7.5rem) + var(--rail)) 0 clamp(1.2rem,5vw,7.5rem) }
        .tims-wrap.tims-wrap-wide { padding-right:clamp(1.2rem,5vw,7.5rem) }

        .tims-narrow { max-width:760px }

        .tims-label {
          font-family:${T.font.mono}; font-size:.75rem; letter-spacing:.22em;
          text-transform:uppercase; color:${T.color.red}; display:inline-flex;
          align-items:center; gap:.7em; margin-bottom:1.6rem;
        }
        .tims-label::before { content:""; width:26px; height:1.5px; background:${T.color.red} }

        .tims-label-section {
          font-family:${T.font.mono}; font-size:.82rem; color:${T.color.mutedLt}; letter-spacing:.12em;
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

        /* nav link underline */
        .tims-nav-link { position:relative }
        .tims-nav-link::after { content:""; position:absolute; left:0; bottom:-2px; width:100%; height:1.5px; background:${T.color.red}; transform:scaleX(0); transform-origin:left center; transition:transform .35s cubic-bezier(.16,1,.3,1) }
        .tims-nav-link:hover::after, .tims-nav-link:focus-visible::after { transform:scaleX(1) }

        /* responsive */
        @media(max-width:720px) { .tims-nav-links{display:none!important} }
        @media(max-width:480px) { .tims-label{letter-spacing:.14em} }
        @media(max-width:760px) { .tims-scene-grid{grid-template-columns:1fr!important} }
        @media(max-width:900px) { .tims-hero-grid{grid-template-columns:1fr!important} }
        @media(max-width:680px) { .tims-takes-grid{grid-template-columns:1fr!important} .tims-princ-grid{grid-template-columns:1fr!important} }
        @media(max-width:560px) { .tims-iter{grid-template-columns:1fr!important;gap:.7rem!important} }

        /* stat strip responsive */
        @media(max-width:720px) { .tims-strip-grid{grid-template-columns:1fr 1fr!important} }

        [data-demo="tims"] ::selection { background:${T.color.red}; color:${T.color.onAccent} }
        /* Overscroll shows the page colour, not the shell grey; the style tag unmounts with the page. */
        html { background-color:${T.color.cream} }

        @media(prefers-reduced-motion:reduce){
          .tims-animate,.tims-reveal>*{transition:none!important;animation:none!important;opacity:1!important;transform:none!important}
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
          ['--case-focus' as string]: T.color.red,
        }}
      >
        <TimsNav />
        <TimsTicket moment={moment} />
        <TimsHero />
        <TimsCounter />
        <TimsProblem />
        <TimsIdea />
        <TimsDemo />
        <TimsRealOrders />
        <TimsFixed />
        <TimsLearned />
        <TimsStatStrip />
        <TimsFooter />
      </div>
    </>
  )
}
