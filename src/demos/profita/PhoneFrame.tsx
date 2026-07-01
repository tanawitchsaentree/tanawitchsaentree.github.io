'use client'

import React from 'react'
import { P } from './tokens'

interface PhoneFrameProps {
  label:    string
  caption?: string
  children?: React.ReactNode
}

export function PhoneFrame({ label, caption, children }: PhoneFrameProps) {
  return (
    <div style={{
      width:        'var(--pw, 168px)',
      aspectRatio:  '9/19.5',
      borderRadius: 28,
      background:   P.color.navy800,
      border:       `1px solid ${P.alpha.line}`,
      boxShadow:    `0 32px 64px ${P.alpha.dark45}, inset 0 1px 0 ${P.alpha.white10}`,
      display:      'flex',
      flexDirection:'column',
      overflow:     'hidden',
      position:     'relative',
      flexShrink:   0,
    }}>
      {/* notch */}
      <div style={{
        width:        60,
        height:       18,
        borderRadius: '0 0 12px 12px',
        background:   P.color.navy900,
        margin:       '0 auto',
        flexShrink:   0,
      }} />

      {/* sheen overlay */}
      <div style={{
        position:     'absolute',
        inset:        0,
        pointerEvents:'none',
        background:   `linear-gradient(135deg, ${P.alpha.white08} 0%, transparent 50%)`,
        borderRadius: 'inherit',
      }} />

      {/* screen content */}
      <div style={{
        flex:          1,
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        justifyContent:'center',
        padding:       '12px 10px',
        gap:           8,
      }}>
        {children ?? (
          <span style={{
            fontSize:      11,
            fontFamily:    P.font.mono,
            color:         P.color.gold,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign:     'center',
            padding:       '4px 10px',
            border:        `1px solid ${P.alpha.gold35}`,
            borderRadius:  6,
          }}>
            {label}
          </span>
        )}
      </div>

      {/* caption bar */}
      {caption && (
        <div style={{
          padding:    '6px 10px 10px',
          fontSize:   10,
          fontFamily: P.font.mono,
          color:      P.color.onFaint,
          textAlign:  'center',
        }}>
          {caption}
        </div>
      )}
    </div>
  )
}
