'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * DecodeText — teletype "lock-on" reveal for section headings.
 *
 * When the element scrolls into view, each character cycles through random
 * monospace glyphs and resolves left-to-right, like a telex machine locking
 * onto a signal. Monospace is essential: every glyph occupies the same advance,
 * so the scramble never reflows the layout.
 *
 * Accessibility: the real text is always the element's accessible content
 * (we only swap textContent visually, then restore). Honors prefers-reduced-motion
 * by rendering the final text immediately with no scramble.
 */

// Glyph pools — case-matched so the scramble keeps each character's x-height /
// cap-height. A lowercase letter scrambles through lowercase glyphs, so the
// lock-on reads as clean typing rather than noisy caps-jumping.
const UPPER  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER  = 'abcdefghijklmnopqrstuvwxyz'
const SYMBOL = '!<>-_\\/[]{}—=+*^?#01'

function scrambleGlyph(real: string): string {
  if (/[a-z]/.test(real)) return LOWER[Math.floor(Math.random() * LOWER.length)]
  if (/[A-Z]/.test(real)) return UPPER[Math.floor(Math.random() * UPPER.length)]
  return SYMBOL[Math.floor(Math.random() * SYMBOL.length)]
}

interface DecodeTextProps {
  text: string
  className?: string
  /** ms each character spends scrambling before it locks. */
  duration?: number
}

export function DecodeText({ text, className, duration = 620 }: DecodeTextProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      el.textContent = text
      return
    }

    const chars = Array.from(text)
    // Per-char lock time: staggered left-to-right across `duration`.
    const lockAt = chars.map((_, i) => (i / chars.length) * duration + 120)

    let raf = 0
    let startTs = 0
    let finished = false

    const frame = (ts: number) => {
      if (!startTs) startTs = ts
      const elapsed = ts - startTs

      let output = ''
      let allLocked = true
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i]
        if (ch === ' ') { output += ' '; continue }
        if (elapsed >= lockAt[i]) {
          output += ch
        } else {
          allLocked = false
          output += scrambleGlyph(ch)
        }
      }
      el.textContent = output

      if (allLocked) {
        finished = true
        return
      }
      raf = requestAnimationFrame(frame)
    }

    // Start scrambled so there's no flash of plain text before trigger fires.
    el.textContent = chars
      .map(c => (c === ' ' ? ' ' : scrambleGlyph(c)))
      .join('')

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => { raf = requestAnimationFrame(frame) },
    })

    return () => {
      st.kill()
      if (raf) cancelAnimationFrame(raf)
      if (!finished) el.textContent = text
    }
  }, [text, duration])

  return (
    <span ref={ref} className={className} aria-label={text}>
      {/* SSR / pre-hydration content — real text for crawlers & no-JS. */}
      {text}
    </span>
  )
}
