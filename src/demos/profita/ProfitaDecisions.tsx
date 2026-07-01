'use client'

import { useEffect, useRef } from 'react'
import { P } from './tokens'
import { PhoneFrame } from './PhoneFrame'

// ── helpers ────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

// ── decision cards ─────────────────────────────────────────────────
const DECISIONS = [
  {
    num:       '01',
    title:     'Robo Advisor is the front door',
    body:      'New users land on the Robo Advisor flow, not a fund catalogue. It asks "what is your goal?" before showing any numbers. The fund appears after the goal is set.',
    traded:    'Browsing freedom for expert users',
    bought:    'Zero-to-invested in under 5 minutes',
  },
  {
    num:       '02',
    title:     'Decide in one screen — no jargon',
    body:      'Fund selection, risk level, and projected return all live on one screen. No modals. No glossary walls. Plain-language labels replace every financial term.',
    traded:    'Detailed fund spec sheets',
    bought:    'Clarity for first-timers',
  },
  {
    num:       '03',
    title:     'The dashboard says where you stand',
    body:      'Portfolio view leads with "You\'re up ฿X this month" — not NAV deltas. Gains and losses are framed as progress toward goals, not market performance.',
    traded:    'Raw portfolio data at a glance',
    bought:    'Emotional safety for new investors',
  },
] as const

// ── Piece config: [startX%, startY%, homeX%, homeY%] (relative to viewport center) ──
const PIECES = [
  { type: 'phone', label: 'Feed',        s: [-70,-46], e: [-30,-4]  },
  { type: 'phone', label: 'Advisor',     s: [ 72, 40], e: [ 31, 6]  },
  { type: 'phone', label: 'Portfolio',   s: [ 60,-52], e: [ 20,-30] },
  { type: 'card',  label: '+12.4% YTD',  s: [-64, 52], e: [-26, 30] },
  { type: 'card',  label: '฿48,000',     s: [ 30, 64], e: [ 14, 34] },
] as const

// ── Stat card piece ────────────────────────────────────────────────
function StatCard({ label }: { label: string }) {
  return (
    <div style={{
      background:   P.color.navy700,
      border:       `1px solid ${P.alpha.gold35}`,
      borderRadius: 14,
      padding:      '1rem 1.3rem',
      width:        130,
      flexShrink:   0,
    }}>
      <p style={{
        fontFamily:    P.font.mono,
        fontSize:      '.65rem',
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color:         P.color.onFaint,
        margin:        '0 0 .4rem',
      }}>Stat</p>
      <p style={{
        fontFamily: P.font.disp,
        fontStyle:  'italic',
        fontSize:   '1.5rem',
        color:      P.color.gold,
        margin:     0,
      }}>{label}</p>
    </div>
  )
}

// ── Scroll collage ─────────────────────────────────────────────────
function ScrollCollage() {
  const trackRef  = useRef<HTMLDivElement>(null)
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const tick = () => {
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const vh   = window.innerHeight
      // t: 0 when track top hits viewport top, 1 when track bottom hits viewport bottom
      const raw  = -rect.top / (rect.height - vh)
      const t    = clamp(raw, 0, 1)

      pieceRefs.current.forEach((el, i) => {
        if (!el) return
        const piece = PIECES[i]
        const x = lerp(piece.s[0], piece.e[0], t)
        const y = lerp(piece.s[1], piece.e[1], t)
        el.style.transform = `translate(calc(${x}vw - 50%), calc(${y}vh - 50%))`
        el.style.opacity   = String(lerp(0.4, 1, clamp(t * 2, 0, 1)))
      })
    }

    window.addEventListener('scroll', tick, { passive: true })
    tick()
    return () => window.removeEventListener('scroll', tick)
  }, [])

  return (
    <div
      ref={trackRef}
      style={{ height: '300vh', position: 'relative' }}
    >
      {/* Sticky viewport */}
      <div style={{
        position:   'sticky',
        top:        0,
        height:     '100vh',
        overflow:   'hidden',
      }}>

        {/* Center text */}
        <div style={{
          position:       'absolute',
          inset:          0,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          textAlign:      'center',
          zIndex:         10,
          pointerEvents:  'none',
        }}>
          <p className="prof-kick" style={{ marginBottom: '.8rem' }}>03 · How it works</p>
          <h2 style={{
            fontFamily:    P.font.disp,
            fontWeight:    400,
            fontSize:      'clamp(1.8rem,4.5vw,3.5rem)',
            letterSpacing: '-.02em',
            lineHeight:    1.1,
            color:         P.color.on,
            maxWidth:      '16ch',
            margin:        0,
          }}>
            Three decisions that{' '}
            <em style={{ fontStyle: 'italic', color: P.color.gold }}>
              carried the app.
            </em>
          </h2>
          <p style={{
            fontFamily:    P.font.mono,
            fontSize:      '.7rem',
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            color:         P.color.onFaint,
            marginTop:     '2rem',
          }}>
            Scroll to assemble
          </p>
        </div>

        {/* Floating pieces */}
        {PIECES.map((piece, i) => (
          <div
            key={i}
            ref={el => { pieceRefs.current[i] = el }}
            style={{
              position:  'absolute',
              top:       '50%',
              left:      '50%',
              opacity:   0,
              transform: `translate(calc(${piece.s[0]}vw - 50%), calc(${piece.s[1]}vh - 50%))`,
              zIndex:    5,
              '--pw':    '148px',
            } as React.CSSProperties}
          >
            {piece.type === 'phone'
              ? <PhoneFrame label={piece.label} />
              : <StatCard label={piece.label} />
            }
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────
export function ProfitaDecisions() {
  return (
    <section id="decisions" style={{ fontFamily: P.font.body }}>

      {/* Part A: Scroll collage */}
      <ScrollCollage />

      {/* Part B: Decision readout */}
      <div className="prof-animate" style={{
        background: P.color.navy800,
        padding:    'clamp(4rem,8vw,7rem) 0',
      }}>
        <div className="prof-wrap">
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap:                 'clamp(1rem,2vw,1.5rem)',
          }}>
            {DECISIONS.map(d => (
              <div key={d.num} style={{
                background:   P.alpha.white07,
                border:       `1px solid ${P.alpha.line}`,
                borderRadius: 16,
                padding:      '2rem 1.8rem',
                display:      'flex',
                flexDirection:'column',
                gap:          '.9rem',
              }}>
                <span style={{
                  fontFamily:    P.font.mono,
                  fontSize:      '.65rem',
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color:         P.color.gold,
                }}>
                  Decision {d.num}
                </span>
                <h3 style={{
                  fontFamily:    P.font.disp,
                  fontWeight:    400,
                  fontSize:      '1.3rem',
                  lineHeight:    1.25,
                  letterSpacing: '-.01em',
                  color:         P.color.on,
                  margin:        0,
                }}>
                  {d.title}
                </h3>
                <p style={{
                  fontSize:   '.92rem',
                  color:      P.color.onMut,
                  lineHeight: 1.65,
                  margin:     0,
                  flex:       1,
                }}>
                  {d.body}
                </p>
                <div style={{
                  paddingTop:  '.9rem',
                  borderTop:   `1px solid ${P.alpha.line}`,
                  fontSize:    '.8rem',
                  fontFamily:  P.font.mono,
                  lineHeight:  1.6,
                }}>
                  <span style={{ color: P.color.onFaint }}>Traded </span>
                  <span style={{ color: P.color.onMut }}>{d.traded}</span>
                  <br />
                  <span style={{ color: P.color.onFaint }}>Bought </span>
                  <span style={{ color: P.color.goldSoft }}>{d.bought}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
