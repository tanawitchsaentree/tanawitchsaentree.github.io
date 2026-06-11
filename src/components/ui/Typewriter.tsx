'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * Typewriter — mechanical character reveal for the typewriter direction.
 *
 * Deliberately NOT GSAP/split-type: a character reveal with an irregular
 * setTimeout cadence is lighter and fully controllable. Unrevealed characters
 * render at opacity 0 so there is zero layout shift — text never reflows as it
 * types. A block caret sits at the leading edge while typing, then blinks at rest.
 *
 * Accessibility: full text is exposed to screen readers via an sr-only span;
 * the animated glyphs are aria-hidden. Honors prefers-reduced-motion (instant).
 */

export interface TypeSegment {
  text: string
  /** Render this run in the muted foreground (matches the hero's <em>). */
  muted?: boolean
}

interface TypewriterProps {
  /** Each inner array is one line; lines stack as block elements (replaces <br/>). */
  lines: TypeSegment[][]
  className?: string
  /** ms before the first character appears. */
  startDelay?: number
  /** Base ms between characters (jitter is applied on top). */
  speed?: number
}

// Flattened character model — keeps render and timing in lockstep.
interface FlatChar {
  ch: string
  line: number
  muted: boolean
}

function flatten(lines: TypeSegment[][]): { chars: FlatChar[]; plain: string } {
  const chars: FlatChar[] = []
  const plainLines: string[] = []
  lines.forEach((segments, line) => {
    let lineText = ''
    segments.forEach(seg => {
      for (const ch of seg.text) {
        chars.push({ ch, line, muted: !!seg.muted })
        lineText += ch
      }
    })
    plainLines.push(lineText)
  })
  return { chars, plain: plainLines.join(' ') }
}

// Irregular cadence: real typewriters aren't metronomic. Spaces and the gaps
// between lines get a longer dwell; everything else jitters around `speed`.
function delayFor(prev: FlatChar | undefined, next: FlatChar, speed: number): number {
  if (!prev) return speed
  if (prev.line !== next.line) return speed * 7   // carriage return + line feed
  if (next.ch === ' ') return speed * 1.8         // word gap
  const jitter = 0.6 + Math.random() * 0.9        // 0.6×–1.5× the base
  return speed * jitter
}

export function Typewriter({
  lines,
  className,
  startDelay = 350,
  speed = 42,
}: TypewriterProps) {
  const { chars, plain } = useMemo(() => flatten(lines), [lines])
  const [revealed, setRevealed] = useState(0)
  const reducedRef = useRef(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    reducedRef.current = reduced
    if (reduced) {
      setRevealed(chars.length)
      return
    }

    let i = 0
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      i += 1
      setRevealed(i)
      if (i >= chars.length) return
      timer = setTimeout(tick, delayFor(chars[i - 1], chars[i], speed))
    }

    timer = setTimeout(tick, startDelay)
    return () => clearTimeout(timer)
  }, [chars, speed, startDelay])

  const done = revealed >= chars.length

  // Group flattened chars back into lines for block rendering, tracking the
  // global index so the caret lands exactly at the leading edge.
  const grouped = useMemo(() => {
    const out: { line: number; chars: { gi: number; fc: FlatChar }[] }[] = []
    chars.forEach((fc, gi) => {
      const last = out[out.length - 1]
      if (!last || last.line !== fc.line) out.push({ line: fc.line, chars: [{ gi, fc }] })
      else last.chars.push({ gi, fc })
    })
    return out
  }, [chars])

  const caret = (
    <span
      className={cn('tw-caret', done && 'tw-caret--rest')}
      aria-hidden="true"
    />
  )

  return (
    <>
      <span className="sr-only">{plain}</span>
      <span aria-hidden="true" className={className}>
        {grouped.map(({ line, chars: lineChars }) => (
          <span key={line} className="block">
            {lineChars.map(({ gi, fc }) => (
              <span key={gi}>
                {/* caret sits immediately before the next char to type */}
                {gi === revealed && caret}
                <span
                  style={{
                    opacity: gi < revealed ? 1 : 0,
                    color: fc.muted ? 'var(--fg-muted)' : undefined,
                  }}
                >
                  {fc.ch === ' ' ? ' ' : fc.ch}
                </span>
              </span>
            ))}
            {/* caret rests at the very end once typing completes */}
            {done && line === grouped[grouped.length - 1].line && caret}
          </span>
        ))}
      </span>
    </>
  )
}
