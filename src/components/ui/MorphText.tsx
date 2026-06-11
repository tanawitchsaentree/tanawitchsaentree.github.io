'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * MorphText — hover-driven character morph.
 *
 * At rest the text is completely static. When `active` flips true, each character
 * "rolls" through a short cycle of monospace glyphs (case-matched, so x-height
 * stays put) and then locks back to the real character, resolving left-to-right.
 * Releasing mid-roll resolves the rest quickly so it never gets stuck scrambled.
 *
 * This is the "alive under the calm" moment: nothing moves until you point at it,
 * then the word reassembles itself like a split-flap board. Monospace keeps every
 * frame the same width, so there is zero layout shift.
 *
 * Accessibility: the real string is always the DOM text / accessible name; we only
 * swap the visual textContent. prefers-reduced-motion disables the roll entirely.
 */

const UPPER  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER  = 'abcdefghijklmnopqrstuvwxyz'
const DIGIT  = '0123456789'
const SYMBOL = '/\\<>=+*^?#$%&@'

function rollGlyph(real: string): string {
  if (/[a-z]/.test(real)) return LOWER[Math.floor(Math.random() * LOWER.length)]
  if (/[A-Z]/.test(real)) return UPPER[Math.floor(Math.random() * UPPER.length)]
  if (/[0-9]/.test(real)) return DIGIT[Math.floor(Math.random() * DIGIT.length)]
  if (real === ' ') return ' '
  return SYMBOL[Math.floor(Math.random() * SYMBOL.length)]
}

interface MorphTextProps {
  text: string
  active: boolean
  className?: string
  /** ms each character spends rolling before it locks. */
  charDuration?: number
  /** ms of stagger between adjacent characters locking. */
  stagger?: number
}

export function MorphText({
  text,
  active,
  className,
  charDuration = 220,
  stagger = 26,
}: MorphTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number | null>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    // At rest, or releasing — make sure we always end on the true text.
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      el.textContent = text
      return
    }

    const chars = Array.from(text)
    // Each char starts rolling at i*stagger and locks charDuration later.
    const lockAt = chars.map((_, i) => i * stagger + charDuration)

    let startTs = 0
    const frame = (ts: number) => {
      if (!startTs) startTs = ts
      const elapsed = ts - startTs

      let out = ''
      let allLocked = true
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i]
        if (ch === ' ') { out += ' '; continue }
        // not started rolling yet → still show the real char (keeps left edge calm)
        if (elapsed < i * stagger) { out += ch; continue }
        if (elapsed >= lockAt[i]) { out += ch; continue }
        allLocked = false
        out += rollGlyph(ch)
      }
      el.textContent = out
      if (allLocked) { el.textContent = text; return }
      rafRef.current = requestAnimationFrame(frame)
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active, text, reduced, charDuration, stagger])

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}
