'use client'

/*
 * ProfitaCover — work grid card cover.
 * Designed at 900×700px native, zoomed to 0.42 in the grid card.
 * Top ~260px is visible in the preview zone.
 */

import { P } from './tokens'
import { PhoneFrame } from './PhoneFrame'

export function ProfitaCover() {
  return (
    <div style={{
      position:   'relative',
      width:      900,
      height:     700,
      overflow:   'hidden',
      background: P.color.navy900,
      fontFamily: P.font.body,
    }}>

      {/* Radial glow top-right */}
      <div aria-hidden="true" style={{
        position:     'absolute',
        top:          -60,
        right:        -60,
        width:        480,
        height:       480,
        borderRadius: '50%',
        background:   `radial-gradient(circle, ${P.alpha.gold14} 0%, transparent 65%)`,
        pointerEvents:'none',
      }} />

      {/* Decorative chart bars — bottom left */}
      {[120, 180, 100, 220].map((h, i) => (
        <div key={i} aria-hidden="true" style={{
          position:     'absolute',
          bottom:       160,
          left:         60 + i * 28,
          width:        14,
          height:       h,
          borderRadius: '4px 4px 0 0',
          background:   `linear-gradient(to top, ${P.alpha.gold35}, ${P.alpha.gold10})`,
        }} />
      ))}

      {/* LH Bank · 2020 label top-left */}
      <p style={{
        position:      'absolute',
        top:           36,
        left:          52,
        fontFamily:    P.font.mono,
        fontSize:      13,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color:         P.color.onFaint,
        margin:        0,
      }}>
        LH Bank · 2020
      </p>

      {/* Profita wordmark bottom-left */}
      <p style={{
        position:      'absolute',
        bottom:        52,
        left:          52,
        fontFamily:    P.font.disp,
        fontStyle:     'italic',
        fontWeight:    400,
        fontSize:      88,
        letterSpacing: '-.02em',
        lineHeight:    1,
        color:         P.color.gold,
        margin:        0,
        opacity:       .92,
      }}>
        Profita
      </p>

      {/* Phone — centered right quadrant */}
      <div style={{
        position:  'absolute',
        right:     110,
        top:       '50%',
        transform: 'translateY(-50%) rotateY(-8deg)',
        '--pw':    '200px',
      } as React.CSSProperties}>
        <PhoneFrame label="Portfolio" />
      </div>

      {/* Subtle grid line overlay */}
      <div aria-hidden="true" style={{
        position:     'absolute',
        inset:        0,
        pointerEvents:'none',
        background:   `linear-gradient(to bottom, transparent 60%, ${P.color.navy900} 100%)`,
      }} />
    </div>
  )
}
