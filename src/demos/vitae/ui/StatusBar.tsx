'use client'

import { V } from '../tokens'

export function StatusBar({ light = false }: { light?: boolean }) {
  const c = light ? V.color.white : V.color.ink

  return (
    <div
      style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        padding:        '10px 18px 6px',
        flexShrink:     0,
        color:          c,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>9:41</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Signal bars */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
          <rect x="0"  y="7" width="3" height="5" rx=".8" fill={c} opacity=".35" />
          <rect x="5"  y="4.5" width="3" height="7.5" rx=".8" fill={c} opacity=".6" />
          <rect x="10" y="2" width="3" height="10" rx=".8" fill={c} opacity=".85" />
          <rect x="15" y="0" width="3" height="12" rx=".8" fill={c} />
        </svg>

        {/* Wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
          <path d="M8 9.5 L8 11.5" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <path d="M5.2 7 Q8 4.5 10.8 7" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M2.5 4.5 Q8 0 13.5 4.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".5" />
        </svg>

        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke={c} strokeWidth="1" />
          <rect x="22" y="3.5" width="2.5" height="5" rx="1" fill={c} opacity=".4" />
          <rect x="2" y="2" width="15" height="8" rx="1.5" fill={c} />
        </svg>
      </div>
    </div>
  )
}
