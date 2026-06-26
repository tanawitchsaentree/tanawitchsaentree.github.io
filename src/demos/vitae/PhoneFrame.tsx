'use client'

import { V } from './tokens'

interface PhoneFrameProps {
  children: React.ReactNode
  offset?: boolean
}

export function PhoneFrame({ children, offset }: PhoneFrameProps) {
  return (
    <div
      style={{
        width:        300,
        height:       632,
        background:   V.color.phone,
        borderRadius: 46,
        padding:      11,
        boxShadow:    V.shadow.phone,
        position:     'relative',
        flexShrink:   0,
        marginTop:    offset ? 34 : 0,
      }}
    >
      {/* notch */}
      <div
        style={{
          position:     'absolute',
          top:          9,
          left:         '50%',
          transform:    'translateX(-50%)',
          width:        96,
          height:       26,
          background:   V.color.phone,
          borderRadius: 16,
          zIndex:       9,
        }}
      />
      <div
        style={{
          width:        '100%',
          height:       '100%',
          background:   V.color.paper2,
          borderRadius: 36,
          overflow:     'hidden',
          position:     'relative',
          fontSize:     13,
          fontFamily:   V.font.sans,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function StatusBar() {
  return (
    <div
      style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        fontWeight:     700,
        fontSize:       12,
        color:          V.color.ink,
        padding:        '4px 6px 12px',
      }}
    >
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="32" height="11" viewBox="0 0 32 11" fill="none" aria-hidden="true">
          <rect x="0" y="6" width="3.5" height="5" rx="1" fill="currentColor" opacity=".4" />
          <rect x="4.5" y="4" width="3.5" height="7" rx="1" fill="currentColor" opacity=".7" />
          <rect x="9" y="1" width="3.5" height="10" rx="1" fill="currentColor" />
          <path d="M14.5 5.5 Q18 2.5 21.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <rect x="25" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <rect x="26.2" y="3.2" width="4.6" height="4.6" rx=".6" fill="currentColor" opacity=".9" />
        </svg>
      </span>
    </div>
  )
}
