'use client'

import React, { useEffect, useRef } from 'react'
import { P } from './tokens'
import { ProfitaPhoneScreen, PROFITA_PHONE_W, PROFITA_PHONE_H, type ScreenName } from './ProfitaPhoneScreen'
import { useContainerWidth } from './useContainerWidth'

const LABEL_TO_SCREEN: Record<string, ScreenName> = {
  Feed:      'feed',
  Advisor:   'robo',
  Portfolio: 'portfolio',
}

function PiecePhone({ label, targetW }: { label: string; targetW: number }) {
  const screen = LABEL_TO_SCREEN[label]
  if (!screen) return null
  const scale = targetW / PROFITA_PHONE_W
  return (
    <div style={{
      width:     targetW,
      height:    PROFITA_PHONE_H * scale,
      flexShrink:0,
      position:  'relative',
    }}>
      <div style={{
        position:        'absolute',
        top:             0,
        left:            0,
        transform:       `scale(${scale})`,
        transformOrigin: 'top left',
        width:           PROFITA_PHONE_W,
        height:          PROFITA_PHONE_H,
      }}>
        <ProfitaPhoneScreen screen={screen} />
      </div>
    </div>
  )
}

// ── collage motion (CSS) ───────────────────────────────────────────
// Start pose → assembled pose, driven by scroll where supported. Opacity reaches
// 1 halfway through, matching the old lerp(0.4, 1, t * 2).
const START = 'translate(calc(var(--sx) - 50%), calc(var(--sy) - 50%)) scale(var(--s0)) rotate(var(--rot))'
const END   = 'translate(calc(var(--ex) - 50%), calc(var(--ey) - 50%)) scale(var(--s1)) rotate(0deg)'
const COLLAGE_CSS = `
.prof-collage { view-timeline: --prof-collage block; }
.prof-piece { transform: ${START}; opacity: .4; will-change: transform; }
@keyframes prof-assemble {
  0%   { transform: ${START}; opacity: .4 }
  50%  { opacity: 1 }
  100% { transform: ${END}; opacity: 1 }
}
@supports (animation-timeline: view()) {
  .prof-piece {
    animation: prof-assemble auto cubic-bezier(.45,0,.55,1) both;
    animation-timeline: --prof-collage;
    animation-range: contain 0% contain 100%;
  }
}
@supports not (animation-timeline: view()) {
  .prof-piece { transition: transform 1.2s cubic-bezier(.16,1,.3,1), opacity 1.2s cubic-bezier(.16,1,.3,1); }
  .prof-collage.is-in .prof-piece { transform: ${END}; opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .prof-piece, .prof-collage.is-in .prof-piece { animation: none !important; transition: none !important; transform: ${END}; opacity: 1; }
}
`

// ── decision cards ─────────────────────────────────────────────────
const DECISIONS = [
  {
    num:       '01',
    title:     'Robo Advisor is the front door',
    body:      'New users land on the Robo Advisor flow before they see the fund catalogue. It asks "what is your goal?" before showing any numbers, and the fund appears after the goal is set.',
    traded:    'Browsing freedom for expert users',
    bought:    'Zero-to-invested in under 5 minutes',
  },
  {
    num:       '02',
    title:     'One screen. No jargon.',
    body:      'Fund selection, risk level, and projected return all live on one screen. No modals. No glossary walls. Plain-language labels replace every financial term.',
    traded:    'Detailed fund spec sheets',
    bought:    'Clarity for first-timers',
  },
  {
    num:       '03',
    title:     'The dashboard says where you stand',
    body:      'The portfolio view opens with "You\'re up ฿X this month" in place of a raw NAV delta. Gains and losses read as progress toward a goal.',
    traded:    'Raw portfolio data at a glance',
    bought:    'Emotional safety for new investors',
  },
] as const

// ── Piece config ──────────────────────────────────────────────────────
// s/e: [x%vw, y%vh] start → end positions relative to viewport center
// s0/s1: CSS scale start → end
// rot: initial rotation in degrees → lerps to 0
const PIECES = [
  { type: 'phone', label: 'Feed',        s: [-70,-46], e: [-30,-4],  s0: 0.82, s1: 1.0,  rot:  -8 },
  { type: 'phone', label: 'Advisor',     s: [ 72, 40], e: [ 31, 6],  s0: 0.78, s1: 1.0,  rot:   6 },
  { type: 'phone', label: 'Portfolio',   s: [ 60,-52], e: [ 20,-30], s0: 0.85, s1: 1.0,  rot:  -4 },
  { type: 'card',  label: '+12.4% YTD',  s: [-64, 52], e: [-26, 30], s0: 0.75, s1: 1.0,  rot:  10 },
  { type: 'card',  label: '฿48,000',     s: [ 30, 64], e: [ 14, 34], s0: 0.80, s1: 1.0,  rot:  -6 },
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
  const vw = useContainerWidth()
  // Responsive phone width: 148px desktop, scales down for narrow viewports
  const pieceTargetW = vw > 0 && vw < 640 ? Math.round(vw * 0.36) : 148

  // Scrub: a CSS scroll-driven animation on a view timeline named after the 300vh
  // track (`contain` range = the same 0→1 span the old rAF loop computed from
  // getBoundingClientRect). Zero JS per frame.
  // Fallback (no animation-timeline support): one IntersectionObserver adds
  // `is-in` when the sticky stage is mostly on screen, and the pieces transition
  // from their start pose to the assembled pose once.
  useEffect(() => {
    if (typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()')) return
    const track = trackRef.current
    if (!track) return
    const io = new IntersectionObserver(([e]) => {
      track.classList.toggle('is-in', e.isIntersecting)
    }, { rootMargin: '0px 0px -60% 0px', threshold: 0 })
    io.observe(track)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={trackRef}
      className="prof-collage"
      style={{ height: '300vh', position: 'relative' }}
    >
      <style>{COLLAGE_CSS}</style>
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
            <span style={{ color: P.color.gold }}>
              carried the app.
            </span>
          </h2>
          <p style={{
            fontSize:   '1.05rem',
            color:      P.color.onMut,
            lineHeight: 1.6,
            maxWidth:   '40ch',
            margin:     '1.2rem 0 0',
          }}>
            Each one traded something experts wanted for something first-time investors needed.
          </p>
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
            className="prof-piece"
            style={{
              position:  'absolute',
              top:       '50%',
              left:      '50%',
              zIndex:    5,
              '--sx': `${piece.s[0]}vw`, '--sy': `${piece.s[1]}vh`,
              '--ex': `${piece.e[0]}vw`, '--ey': `${piece.e[1]}vh`,
              '--s0': piece.s0, '--s1': piece.s1, '--rot': `${piece.rot}deg`,
            } as React.CSSProperties}
          >
            {piece.type === 'phone'
              ? <PiecePhone label={piece.label} targetW={pieceTargetW} />
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
          <div className="prof-grid-3" style={{
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
                  fontSize:   '1rem',
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

          {/* The cutoff: the design problem behind the two dates on the confirm screen. */}
          <div style={{
            marginTop:    'clamp(1rem,2vw,1.5rem)',
            background:   P.alpha.white07,
            border:       `1px solid ${P.alpha.line}`,
            borderRadius: 16,
            padding:      '2rem 1.8rem',
            display:      'grid',
            gap:          '.9rem',
          }}>
            <span style={{
              fontFamily:    P.font.mono,
              fontSize:      '.65rem',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color:         P.color.gold,
            }}>
              The cutoff
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
              Paid today, priced later
            </h3>
            <p style={{
              fontSize:   '1rem',
              color:      P.color.onMut,
              lineHeight: 1.65,
              margin:     0,
              maxWidth:   '68ch',
            }}>
              Money leaves the account when the order is confirmed. The fund is priced after
              the cutoff, often on the next business day. I had to make that gap visible before
              people paid. The confirm screen shows the transaction date and the effective date
              together, and the receipt marks the order as received and pending processing,
              because the price comes later.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
