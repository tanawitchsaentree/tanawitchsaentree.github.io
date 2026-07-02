'use client'
/**
 * ProfitaPhone — fixed 300×650 phone shell, same approach as Vitae PhoneShell.
 * Parent is responsible for scaling down via CSS transform if needed.
 */
import React from 'react'
import { P } from './tokens'
import { SW, SH } from './screens/_screenTokens'

interface ProfitaPhoneProps {
  children: React.ReactNode
  label?:   string
}

const SHELL_W  = SW + 20   // 320 — 10px padding each side
const SHELL_H  = SH + 40   // 690 — 20px notch + 10px bottom pad
const RADIUS   = 36

export function ProfitaPhone({ children, label }: ProfitaPhoneProps) {
  return (
    <div style={{
      width:        SHELL_W,
      height:       SHELL_H,
      borderRadius: RADIUS,
      background:   P.color.navy800,
      border:       `1px solid rgba(255,255,255,.10)`,
      boxShadow:    `0 32px 64px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.10)`,
      position:     'relative',
      flexShrink:   0,
      display:      'flex',
      flexDirection:'column',
      overflow:     'hidden',
    }}>
      {/* Notch */}
      <div style={{
        width:        60,
        height:       20,
        borderRadius: '0 0 12px 12px',
        background:   P.color.navy900,
        margin:       '0 auto',
        flexShrink:   0,
      }} />

      {/* Sheen */}
      <div style={{
        position:     'absolute',
        inset:        0,
        pointerEvents:'none',
        background:   `linear-gradient(135deg, rgba(255,255,255,.08) 0%, transparent 50%)`,
        borderRadius: 'inherit',
        zIndex:       10,
      }} />

      {/* Screen area */}
      <div style={{
        flex:         1,
        margin:       '0 10px 10px',
        borderRadius: 24,
        overflow:     'hidden',
        background:   '#f3f4f6',
        display:      'flex',
        flexDirection:'column',
      }}>
        {children ?? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{
              fontSize:      11,
              fontFamily:    P.font.mono,
              color:         P.color.gold,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding:       '4px 10px',
              border:        `1px solid rgba(211,172,87,.35)`,
              borderRadius:  6,
            }}>
              {label}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/** Width/height of the shell at full size — use for scale calculations in parent */
export const PROFITA_PHONE_W = SHELL_W
export const PROFITA_PHONE_H = SHELL_H
