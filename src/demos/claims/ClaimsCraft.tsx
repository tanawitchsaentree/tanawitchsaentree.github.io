'use client'

import { useEffect, useRef } from 'react'
import { C } from './tokens'

const METRICS = [
  { n: 47,   u: '',  k: 'components',      p: 'Design-system parts only — no rogue markup.' },
  { n: 0,    u: '',  k: 'build errors',    p: 'Strict TypeScript, enforced end to end.' },
  { n: 100,  u: '%', k: 'audited',         p: 'A scripted audit suite, run on every change.' },
  { n: 1,    u: '',  k: 'source of truth', p: 'One project doc; a new session onboards in an hour.' },
]

export function ClaimsCraft() {
  const refs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        io.unobserve(e.target)
        const el = e.target as HTMLSpanElement
        const target = parseInt(el.dataset.count ?? '0', 10)
        if (reduce || target === 0 || target === 1) { el.textContent = String(target); return }
        let start: number | null = null
        const tick = (ts: number) => {
          if (!start) start = ts
          const p = Math.min((ts - start) / 1000, 1)
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
    }, { threshold: .5 })
    refs.current.forEach(el => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section id="craft" style={{ padding: 'clamp(3.4rem,8vw,6.5rem) 0', borderTop: `1px solid ${C.color.line}` }}>
      <div className="claims-wrap">
        <div className="claims-animate" style={{ marginBottom: '2.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.1rem' }}>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.live }}>07</span>
            <span style={{ color: C.color.txFaint }}>/</span>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', letterSpacing: '.2em', textTransform: 'uppercase', color: C.color.txDim, marginLeft: '.4rem' }}>Build summary</span>
          </div>
          <h2 style={{ fontFamily: C.font.display, fontWeight: 700, fontSize: 'clamp(1.7rem,3.8vw,2.8rem)', lineHeight: 1.08, letterSpacing: '-.02em', color: C.color.txHi, maxWidth: '24ch', margin: 0 }}>
            Owning the prototype means{' '}
            <span style={{ color: C.color.live }}>owning the codebase.</span>
          </h2>
        </div>

        <div className="claims-animate claims-d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: `1px solid ${C.color.line}`, borderRadius: 8, overflow: 'hidden' }}>
          {METRICS.map((m, i) => (
            <div key={m.k} style={{ padding: '1.3rem', borderRight: i < 3 ? `1px solid ${C.color.line}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '.1rem' }}>
                <span
                  ref={el => { refs.current[i] = el }}
                  data-count={m.n}
                  style={{ fontFamily: C.font.display, fontWeight: 700, fontSize: 'clamp(1.9rem,4vw,2.6rem)', color: C.color.txHi, lineHeight: 1, letterSpacing: '-.02em' }}
                >
                  0
                </span>
                {m.u && <span style={{ color: C.color.live, fontSize: '.55em', fontWeight: 600 }}>{m.u}</span>}
              </div>
              <div style={{ fontFamily: C.font.mono, fontSize: '.66rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.color.txDim, margin: '.6rem 0 .35rem' }}>{m.k}</div>
              <p style={{ fontSize: '.875rem', color: C.color.txDim, lineHeight: 1.45, margin: 0 }}>{m.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
