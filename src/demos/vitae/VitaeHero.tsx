'use client'

import { useEffect, useRef } from 'react'
import { V } from './tokens'

export function VitaeHero() {
  const h1Ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return
    const spans = h1Ref.current?.querySelectorAll<HTMLElement>('.v-ln i')
    spans?.forEach((el, i) => {
      const step  = parseFloat(V.motion.durationStagger)
      const base  = parseFloat(V.motion.durationHeroDelay)
      el.style.animationDelay = `${(i * step * 1.25 + base - step).toFixed(3)}s`
    })
  }, [])

  return (
    <header
      style={{
        minHeight:     '100vh',
        display:       'flex',
        flexDirection: 'column',
        justifyContent:'center',
        padding:       '8rem 0 4rem',
        position:      'relative',
        overflow:      'hidden',
      }}
    >
      <div className="vitae-wrap">
        <span
          className="v-eb"
          style={{
            fontFamily:    V.font.mono,
            fontSize:      V.size.eyebrow,
            letterSpacing: '.26em',
            textTransform: 'uppercase',
            color:         V.color.limeDeep,
            display:       'inline-flex',
            alignItems:    'center',
            gap:           '.7em',
            marginBottom:  '2rem',
            opacity:       0,
            animation:     `v-fade ${V.motion.durationBase} ${V.ease.expo} ${V.motion.durationHeroDelay} forwards`,
          }}
        >
          <span style={{ display: 'inline-block', width: 26, height: 1.5, background: V.color.limeDeep }} />
          Vitae · daily health score · product design
        </span>

        <h1
          ref={h1Ref}
          style={{
            fontFamily:    V.font.serif,
            fontWeight:    300,
            fontSize:      V.size.hero,
            lineHeight:    1,
            letterSpacing: '-.025em',
            maxWidth:      '17ch',
            margin:        0,
          }}
        >
          <span className="v-ln"><i>A score is a</i></span>
          <span className="v-ln"><i><em style={{ fontStyle: 'italic', color: V.color.limeDeep }}>promise.</em> Break it</i></span>
          <span className="v-ln"><i>and trust is gone.</i></span>
        </h1>

        <div
          style={{
            display:   'flex',
            gap:       '2.4rem',
            flexWrap:  'wrap',
            marginTop: '2.6rem',
            opacity:   0,
            animation: `v-fade ${V.motion.durationBase} ${V.ease.expo} calc(${V.motion.durationHeroDelay} * 3.5) forwards`,
            maxWidth:  '62ch',
          }}
        >
          <p
            style={{
              margin:     0,
              color:      V.color.inkSoft,
              fontSize:   '1.14rem',
              maxWidth:   '40ch',
              lineHeight: 1.65,
              fontFamily: V.font.sans,
            }}
          >
            Vitae reads a watch&apos;s raw signals into one daily number. The hard part was
            never the number — it was earning the right to put it on screen.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
            {[
              { k: 'My role',       v: 'Lead product designer · with 1 PM, 1 clinical advisor, 2 engineers' },
              { k: 'Surface · year', v: 'watchOS + iOS · 2025' },
            ].map(({ k, v }) => (
              <div key={k}>
                <b style={{ display: 'block', fontFamily: V.font.mono, fontSize: V.size.micro, letterSpacing: '.16em', textTransform: 'uppercase', color: V.color.muted, fontWeight: 400, marginBottom: '.3rem' }}>{k}</b>
                <span style={{ fontFamily: V.font.heading, fontWeight: 600, fontSize: '1rem', color: V.color.ink, display: 'block', maxWidth: '18ch' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
