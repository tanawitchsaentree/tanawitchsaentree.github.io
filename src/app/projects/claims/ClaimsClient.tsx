'use client'

import { ClaimsStory } from '@/components/case-study/CompactStories'


import '@fontsource/onest/400.css'
import '@fontsource/onest/500.css'
import '@fontsource/onest/600.css'
import { useEffect } from 'react'
import { C } from '@/demos/claims/tokens'

// Fonts are self-hosted: Onest from @fontsource (the weights the case file uses), IBM Plex
// Mono from @fontsource in the root layout. No request goes to Google Fonts.
const GLOBAL_CSS = `

  [data-demo="claims"] {
    font-family: var(--c-font-body);
    background: var(--cf-desk);
    color: var(--cf-desk-fg);
    font-size: 16.5px;
    line-height: 1.62;
    -webkit-font-smoothing: antialiased;
    overflow-x: clip;
    min-height: 100dvh;
  }
  [data-demo="claims"] ::selection { background: var(--cf-desk-fg); color: var(--cf-desk); }
  [data-demo="claims"] b, [data-demo="claims"] strong { font-weight: 600; color: var(--c-tx-hi); }

  .claims-wrap {
    max-width: 1060px;
    margin: 0 auto;
    padding: 0 clamp(1.1rem, 4vw, 2.4rem);
    position: relative;
    z-index: 1;
  }

  /* scroll reveal */
  .claims-animate {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity .7s cubic-bezier(.4,0,.2,1), transform .7s cubic-bezier(.16,1,.3,1);
  }
  .claims-animate.claims-in { opacity: 1; transform: none; }
  .claims-animate.claims-d1 { transition-delay: .07s; }
  .claims-animate.claims-d2 { transition-delay: .14s; }
  .claims-animate.claims-d3 { transition-delay: .21s; }

  /* hero responsive */
  @media (max-width: 880px) {
    [data-demo="claims"] .claims-hero-grid { grid-template-columns: 1fr !important; }
  }

  /* limits + craft responsive */
  @media (max-width: 680px) {
    [data-demo="claims"] .claims-animate[style*="repeat(4"] { grid-template-columns: 1fr 1fr !important; }
    [data-demo="claims"] .claims-animate[style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
  }

  /* shift grid responsive */
  @media (max-width: 860px) {
    [data-demo="claims"] [style*="1fr 60px 1fr"] { grid-template-columns: 1fr !important; gap: .9rem !important; }
    [data-demo="claims"] [style*="1fr 60px 1fr"] > :nth-child(2) { transform: rotate(90deg); height: 34px; }
  }

  /* ripple grid responsive */
  @media (max-width: 820px) {
    [data-demo="claims"] [style*="1fr 1fr"][style*="align-items:start"] { grid-template-columns: 1fr !important; }
  }

  /* schema fade-in keyframe */
  @keyframes claims-fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

  @media (prefers-reduced-motion: reduce) {
    .claims-animate { transition-duration: .01ms !important; }
  }
`

export function ClaimsClient() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('claims-in'); io.unobserve(e.target) }
      }),
      { threshold: .06, rootMargin: '0px 0px 80px 0px' }
    )
    document.querySelectorAll('[data-demo="claims"] .claims-animate').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  const rootVars = {
    '--c-bg':        C.color.bg,
    '--c-tx':        C.color.tx,
    '--c-tx-hi':     C.color.txHi,
    '--c-live':      C.color.live,
    '--c-font-body': C.font.body,
  } as React.CSSProperties

  return (
    <div data-demo="claims" style={rootVars}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
        <ClaimsStory />
    </div>
  )
}
