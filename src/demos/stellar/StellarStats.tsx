'use client'

import { useEffect, useRef, useState } from 'react'
import { S } from './tokens'

const STATS = [
  { value: 70, suffix: '%', label: 'wanted recipes from what\'s already in their fridge or pantry' },
  { value: 85, suffix: '%', label: 'found AI suggestions tuned to their diet genuinely helpful' },
  { value: 65, suffix: '%', label: 'said great photos made them far more likely to try a dish' },
  { value: 60, suffix: '%', label: 'would reach for it at least once a week for inspiration' },
] as const

const QUOTES = [
  { name: 'Emily', text: 'help me use leftover ingredients, reduce waste' },
  { name: 'Liam',  text: 'make cooking feel like fun, not a chore' },
  { name: 'Survey',text: '"suggests meals from what\'s in my fridge — a lifesaver!"' },
] as const

function CountStat({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(target)
      return
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !started.current) {
          started.current = true
          let start: number | null = null
          const step = (t: number) => {
            if (!start) start = t
            const p = Math.min((t - start) / 1100, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setVal(Math.round(eased * target))
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
          io.disconnect()
        }
      })
    }, { threshold: 0.6 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [target])

  return (
    <span ref={ref} style={{ fontFamily: S.font.display, fontWeight: 700, fontSize: 'clamp(2.4rem,5.5vw,4rem)', color: S.color.lime, display: 'block', lineHeight: 1 }}>
      {val}{suffix}
    </span>
  )
}

export function StellarStats() {
  return (
    <section id="heard" style={{ padding: 'clamp(5rem,13vw,11rem) 0' }}>
      <div className="stellar-wrap stellar-animate">
        <div style={{
          background:   S.color.ink,
          color:        S.color.paper,
          borderRadius: 30,
          padding:      'clamp(2.5rem,5vw,4rem) clamp(2rem,4vw,3.5rem)',
          position:     'relative',
          overflow:     'hidden',
        }}>
          {/* glow */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(500px 300px at 85% 0,${S.alpha.lime20},transparent 60%)`, pointerEvents: 'none' }} />

          <span className="stellar-label-inv">
            Talking to the people in the kitchen
          </span>
          <h3 style={{ fontFamily: S.font.display, fontWeight: 700, color: S.color.paper, fontSize: S.size.title, margin: '.8rem 0 2rem', maxWidth: '24ch', lineHeight: 1.15 }}>
            I didn&apos;t guess. I asked — then <em style={{ fontFamily: S.font.italic, fontStyle: 'italic', color: S.color.lime }}>counted.</em>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.6rem', position: 'relative', zIndex: 1 }} className="stellar-stats-grid">
            {STATS.map(s => (
              <div key={s.label}>
                <CountStat target={s.value} suffix={s.suffix} />
                <span style={{ fontSize: '1rem', color: S.alpha.paper65, display: 'block', marginTop: '.6rem', lineHeight: 1.45 }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem', marginTop: '2.2rem', position: 'relative', zIndex: 1 }}>
            {QUOTES.map(q => (
              <span
                key={q.name}
                style={{ fontSize: '1rem', background: S.alpha.paper08, border: `1px solid ${S.alpha.paper14}`, padding: '.55rem .95rem', borderRadius: 999, color: S.alpha.paper82 }}
              >
                💬 <b style={{ color: S.color.lime, fontWeight: 600, fontFamily: S.font.display }}>{q.name}:</b> {q.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
