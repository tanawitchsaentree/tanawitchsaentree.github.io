'use client'

import { S } from './tokens'

// Post-it palette — warm paper tones, each with a slight tint
const JOBS = [
  {
    when: 'WHEN I have a random assortment of ingredients',
    want: 'I want to discover something delicious without endless scrolling.',
    num:  '01',
    bg:   '#f9f2a8', // classic yellow sticky
    ink:  '#2d2800',
    rot:  '-1.6deg',
    tx:   '-2px',
  },
  {
    when: "WHEN I'm uninspired or in a cooking rut",
    want: 'I want to be surprised with creative ideas that match my taste.',
    num:  '02',
    bg:   '#b8e8c0', // mint green
    ink:  '#0e2e14',
    rot:  '1.2deg',
    tx:   '1px',
  },
  {
    when: "WHEN I'm trying to eat healthier",
    want: 'I want recipes that fit my diet without sacrificing flavour.',
    num:  '03',
    bg:   '#ffd6a5', // peach
    ink:  '#3a1400',
    rot:  '-0.8deg',
    tx:   '-1px',
  },
  {
    when: "WHEN I'm hosting or want to impress",
    want: 'I want dishes I can confidently pull off for guests.',
    num:  '04',
    bg:   '#c9e2ff', // sky blue
    ink:  '#07213a',
    rot:  '1.8deg',
    tx:   '2px',
  },
  {
    when: "WHEN I'm short on time",
    want: 'I want simple recipes from what I have, done in 30 minutes.',
    num:  '05',
    bg:   '#f9c4d2', // blush pink
    ink:  '#3a0c18',
    rot:  '-1.2deg',
    tx:   '-1px',
  },
] as const

export function StellarJTBD() {
  return (
    <section style={{ padding: 'clamp(5rem,13vw,11rem) 0', overflow: 'hidden' }}>

      {/* header — inside stellar-wrap = guaranteed grid alignment */}
      <div className="stellar-wrap stellar-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)', maxWidth: 740 }}>
          <span style={{ fontFamily: S.font.mono, fontSize: '.78rem', color: S.color.greenDeep, letterSpacing: '.12em', textTransform: 'uppercase', display: 'block', marginBottom: '.6rem' }}>
            Jobs to be done
          </span>
          <h2 style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: S.size.display, letterSpacing: '-.015em', lineHeight: 1.02, margin: '.7rem 0 1.1rem', color: S.color.ink }}>
            What are they really{' '}
            <em style={{ fontFamily: S.font.italic, fontStyle: 'italic', fontWeight: 500, color: S.color.greenDeep }}>hiring</em>{' '}
            an app to do?
          </h2>
          <p style={{ color: S.color.inkSoft, fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '56ch', fontFamily: S.font.body }}>
            Drag through the moments people described. Each one is a job the product has to nail.
          </p>
        </div>
      </div>

      {/* scroll rail — left-pad mirrors stellar-wrap exactly using margin trick */}
      <div className="stellar-wrap" style={{ overflow: 'visible', paddingRight: 0 }}>
        <div
          className="stellar-jtbd-scroll"
          style={{
            display:        'flex',
            gap:            '1.4rem',
            overflowX:      'auto',
            paddingTop:     '1.4rem',
            paddingBottom:  '2.4rem',
            paddingRight:   'clamp(1.2rem,5vw,7.5rem)',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
          }}
        >
          {JOBS.map(j => (
            <div
              key={j.num}
              style={{
                flex:            '0 0 260px',
                scrollSnapAlign: 'start',
                // Post-it structure
                position:        'relative',
                background:      j.bg,
                borderRadius:    '3px 3px 3px 3px',
                padding:         '2rem 1.5rem 1.4rem',
                minHeight:       240,
                display:         'flex',
                flexDirection:   'column',
                transform:       `rotate(${j.rot}) translateX(${j.tx})`,
                transformOrigin: 'center 20%',
                // Layered shadows: subtle lift + direction shadow mimicking pin
                boxShadow:
                  `0 1px 1px rgba(0,0,0,.10),
                   0 4px 8px rgba(0,0,0,.10),
                   0 12px 28px rgba(0,0,0,.12),
                   inset 0 -2px 0 rgba(0,0,0,.06)`,
                transition:      'transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .35s cubic-bezier(.16,1,.3,1)',
                cursor:          'grab',
              }}
              onMouseEnter={e => {
                const t = e.currentTarget
                t.style.transform = `rotate(0deg) translateX(0) scale(1.04) translateY(-6px)`
                t.style.boxShadow = `0 2px 2px rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.12), 0 22px 44px rgba(0,0,0,.15), inset 0 -2px 0 rgba(0,0,0,.06)`
              }}
              onMouseLeave={e => {
                const t = e.currentTarget
                t.style.transform = `rotate(${j.rot}) translateX(${j.tx})`
                t.style.boxShadow = `0 1px 1px rgba(0,0,0,.10), 0 4px 8px rgba(0,0,0,.10), 0 12px 28px rgba(0,0,0,.12), inset 0 -2px 0 rgba(0,0,0,.06)`
              }}
            >
              {/* tape strip at top */}
              <div style={{
                position: 'absolute', top: -10, left: '50%',
                transform: 'translateX(-50%)',
                width: 52, height: 20,
                background: 'rgba(255,255,255,.55)',
                borderRadius: 2,
                boxShadow: '0 1px 2px rgba(0,0,0,.10)',
                backdropFilter: 'blur(2px)',
              }} />

              {/* fold corner bottom-right */}
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 22, height: 22,
                background: `linear-gradient(225deg, rgba(0,0,0,.12) 50%, transparent 50%)`,
                borderRadius: '0 0 3px 0',
              }} />

              <span style={{
                fontFamily:    S.font.mono,
                fontSize:      '.72rem',
                letterSpacing: '.08em',
                color:         j.ink,
                opacity:       0.55,
                marginBottom:  '.7rem',
                lineHeight:    1.4,
              }}>
                {j.when}
              </span>
              <span style={{
                fontFamily:  S.font.body,
                fontWeight:  700,
                fontSize:    '1rem',
                lineHeight:  1.45,
                color:       j.ink,
                flex:        1,
              }}>
                {j.want}
              </span>
              <span style={{
                fontFamily:  S.font.display,
                fontWeight:  800,
                fontSize:    '2.2rem',
                opacity:     0.14,
                alignSelf:   'flex-end',
                lineHeight:  1,
                marginTop:   '1.2rem',
                color:       j.ink,
              }}>
                {j.num}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
