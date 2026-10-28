'use client'

import { useState, useEffect, useRef } from 'react'
import { T } from './tokens'
import { HeroPolaroids } from './HeroPolaroids'

const META = [
  { label: 'Role',    value: 'Design + front-end build' },
  { label: 'Origin',  value: '2 yrs · counter + drive-thru' },
  { label: 'Type',    value: 'Concept · built on weekends' },
  { label: 'Surface', value: 'iPad · cashier terminal' },
  { label: 'Year',    value: '2026' },
] as const

// ── Live countdown: the headline number. Kept in its own component so the
// once-a-second tick re-renders only this <em>, never the hero or the photo deck.
function HeroCountdown({ rootRef }: { rootRef: React.RefObject<HTMLElement> }) {
  const [elapsed, setElapsed] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReduced(reduce)
    if (reduce) return
    const root = rootRef.current
    if (!root) return

    // Ticks only while the hero is in view; paused once scrolled past or the tab is hidden.
    let id: ReturnType<typeof setInterval> | null = null
    let visible = false
    const start = () => { if (!id && visible && !document.hidden) id = setInterval(() => setElapsed(e => e >= 40 ? 0 : e + 1), 1000) }
    const stop  = () => { if (id) { clearInterval(id); id = null } }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start(); else stop()
    }, { threshold: 0 })
    const onVis = () => { if (document.hidden) stop(); else start() }
    io.observe(root)
    document.addEventListener('visibilitychange', onVis)

    return () => { stop(); io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [rootRef])

  const remaining    = 40 - elapsed
  const headingColor = elapsed >= 37 ? T.color.red
                     : elapsed >= 28 ? T.color.amber
                     : T.color.red

  return (
    <em
      style={{
        fontStyle:          'normal',
        color:              headingColor,
        fontVariantNumeric: 'tabular-nums',
        display:            'inline-block',
        minWidth:           '2.1ch',
        transition:         `color .5s cubic-bezier(.65,0,.35,1)`,
      }}
    >
      {/* No aria-live: announcing a number every second drowned out the page for screen readers. */}
      {reduced ? '40' : remaining}
    </em>
  )
}

// ── Main hero ──────────────────────────────────────────────────────────
export function TimsHero() {
  const rootRef = useRef<HTMLElement>(null)

  return (
    <header
      ref={rootRef}
      id="hero"
      data-m={0}
      style={{ padding: 'clamp(8rem,17vw,13rem) 0 clamp(3rem,7vw,6rem)', fontFamily: T.font.sans }}
    >
      <div className="tims-wrap tims-wrap-wide">

        {/* ── TOP ROW: 70/30 heading | card ─────────────────────── */}
        <div className="tims-hero-grid" style={{
          display:             'grid',
          gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)',
          gap:                 'clamp(2rem,4vw,4rem)',
          alignItems:          'start',
        }}>

          {/* LEFT: label + headline only */}
          <div className="tims-reveal">
            <span className="tims-label">Built for fun · by a former Tims employee</span>

            <h1 style={{
              fontFamily:    T.font.display,
              fontWeight:    700,
              fontSize:      T.size.hero,
              letterSpacing: '-.02em',
              lineHeight:    1.03,
              marginBottom:  0,
              color:         T.color.ink,
            }}>
              {/* The number IS the live countdown */}
              <HeroCountdown rootRef={rootRef} />
              <span style={{ color: T.color.ink }}> seconds.</span>
              <span style={{
                display:       'block',
                fontSize:      'clamp(1.1rem,2.4vw,1.7rem)',
                fontWeight:    500,
                color:         T.color.inkSoft,
                letterSpacing: '-.01em',
                marginTop:     '1.1rem',
                maxWidth:      '28ch',
              }}>
                I spent two years behind a Tim Hortons counter. Then I redesigned the POS I had to use at 5&nbsp;a.m.
              </span>
            </h1>
          </div>

          {/* ── RIGHT: polaroid deck, no background, floats on page ── */}
          <div className="tims-reveal" style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                position:       'relative',
                minHeight:      360,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                overflow:       'visible',
              }}
            >
              <HeroPolaroids />
            </div>
          <figure style={{ margin: '1.6rem 0 0', maxWidth: '22rem' }}>
            <figcaption style={{ fontFamily: T.font.mono, fontSize: '.75rem', letterSpacing: '.16em', textTransform: 'uppercase', color: T.color.mutedLt, marginBottom: '.6rem' }}>
              8:02 a.m. The speaker crackles.
            </figcaption>
            <blockquote style={{ margin: 0, fontFamily: T.font.display, fontWeight: 600, fontSize: 'clamp(1.15rem,2vw,1.4rem)', lineHeight: 1.3, letterSpacing: '-.01em', color: T.color.ink, borderLeft: `3px solid ${T.color.red}`, paddingLeft: '1.1rem' }}>
              &ldquo;Large double-double, extra hot, and a 10-pack of Timbits.&rdquo;
            </blockquote>
            <p style={{ margin: '.9rem 0 0', fontSize: '.95rem', color: T.color.inkSoft, lineHeight: 1.55 }}>
              I made this order up. The trouble it runs into is what I lived. The page follows it to the window.
            </p>
          </figure>
          </div>

        </div>{/* end top 2-col grid */}

        {/* ── BOTTOM: full-width paragraph + meta ──────────────── */}
        <div className="tims-reveal" style={{ marginTop: 'clamp(2rem,4vw,3rem)' }}>
          <p style={{ fontSize: '1.15rem', color: T.color.inkSoft, maxWidth: '60ch', lineHeight: 1.65 }}>
            Forty seconds is roughly how long a Tims order takes. I know, because I was the one getting timed.
            This is a weekend concept. I took what the drive-thru taught me and built the point-of-sale terminal I always wished I&apos;d had.
          </p>


          <div style={{
            display:    'flex',
            flexWrap:   'wrap',
            gap:        '2.4rem',
            marginTop:  '2.8rem',
            paddingTop: '1.8rem',
            borderTop:  `1px solid ${T.alpha.line}`,
          }}>
            {META.map(({ label, value }) => (
              <div key={label}>
                <b style={{ display: 'block', fontFamily: T.font.mono, fontSize: '.75rem', letterSpacing: '.16em', textTransform: 'uppercase', color: T.color.mutedLt, marginBottom: '.4rem', fontWeight: 400 }}>
                  {label}
                </b>
                <span style={{ fontFamily: T.font.display, fontWeight: 500, fontSize: '1.02rem', color: T.color.ink }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </header>
  )
}
