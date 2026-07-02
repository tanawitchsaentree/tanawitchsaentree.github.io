'use client'
import { SW, SH } from './_screenTokens'

interface Props {
  children: React.ReactNode
  /** Rendered width in px. Screen is always 300×650 logical; scales to fit. Default 172. */
  pw?: number
}

export function ScreenWrapper({ children, pw = 172 }: Props) {
  const scale = pw / SW
  return (
    <div style={{
      width:      pw,
      height:     SH * scale,
      overflow:   'hidden',
      flexShrink: 0,
      position:   'relative',
    }}>
      <div style={{
        transform:       `scale(${scale})`,
        transformOrigin: 'top left',
        width:           SW,
        height:          SH,
        flexShrink:      0,
      }}>
        {children}
      </div>
    </div>
  )
}
