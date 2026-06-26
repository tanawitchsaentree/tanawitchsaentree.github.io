'use client'

import React from 'react'
import { V } from '../tokens'

/** Outer phone chassis — notch style (no dynamic island) */
export function PhoneShell({
  children,
  offset = false,
  width  = 300,
  height = 632,
}: {
  children: React.ReactNode
  offset?:  boolean
  width?:   number
  height?:  number
}) {
  return (
    <div
      style={{
        width,
        height,
        background:   V.color.phone,
        borderRadius: 44,
        padding:      11,
        boxShadow:    V.shadow.phone,
        position:     'relative',
        flexShrink:   0,
        marginTop:    offset ? 34 : 0,
        userSelect:   'none',
      }}
    >
      {/* Notch — centred pill */}
      <div
        style={{
          position:     'absolute',
          top:          9,
          left:         '50%',
          transform:    'translateX(-50%)',
          width:        88,
          height:       22,
          background:   V.color.phone,
          borderRadius: 12,
          zIndex:       10,
        }}
        aria-hidden
      />

      {/* Side buttons */}
      <div style={{ position: 'absolute', left: -3, top: 100, width: 3, height: 32, background: '#2a2a2a', borderRadius: '2px 0 0 2px' }} aria-hidden />
      <div style={{ position: 'absolute', left: -3, top: 144, width: 3, height: 56, background: '#2a2a2a', borderRadius: '2px 0 0 2px' }} aria-hidden />
      <div style={{ position: 'absolute', left: -3, top: 212, width: 3, height: 56, background: '#2a2a2a', borderRadius: '2px 0 0 2px' }} aria-hidden />
      <div style={{ position: 'absolute', right: -3, top: 160, width: 3, height: 80, background: '#2a2a2a', borderRadius: '0 2px 2px 0' }} aria-hidden />

      {/* Screen */}
      <div
        style={{
          width:        '100%',
          height:       '100%',
          background:   V.color.paper2,
          borderRadius: 34,
          overflow:     'hidden',
          position:     'relative',
          fontSize:     13,
          fontFamily:   V.font.sans,
          display:      'flex',
          flexDirection:'column',
        }}
      >
        {children}
      </div>
    </div>
  )
}
