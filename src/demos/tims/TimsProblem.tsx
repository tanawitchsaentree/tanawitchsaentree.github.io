'use client'

import { useEffect, useRef, useState } from 'react'
import { T } from './tokens'

const ORDERS = [
  { e: '☕', t: 'L double-double' },
  { e: '🍵', t: 'M steeped tea, 2 milk' },
  { e: '☕', t: 'XL triple-triple, extra hot', hard: true },
  { e: '🥤', t: 'L Iced Capp' },
  { e: '☕', t: '½ coffee · ½ FV', hard: true },
  { e: '🍩', t: 'Box of Joe + dozen' },
] as const

function LiveBoard() {
  const [sec, setSec] = useState(0)
  const [orders, setOrders] = useState<Array<{ e: string; t: string; hard?: boolean }>>([])
  const played = useRef(false)
  const boardRef = useRef<HTMLDivElement>(null)
  const noMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSec(52)
      setOrders(ORDERS.slice(-4) as unknown as Array<{ e: string; t: string; hard?: boolean }>)
      return
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !played.current) {
          played.current = true
          // timer
          let s = 0
          const timer = setInterval(() => {
            s++
            setSec(s)
            if (s >= 52) clearInterval(timer)
          }, 90)
          // streaming orders
          ORDERS.forEach((o, i) => {
            setTimeout(() => {
              setOrders(prev => {
                const next = [...prev, o]
                return next.length > 4 ? next.slice(1) : next
              })
            }, 420 * i + 300)
          })
          io.disconnect()
        }
      })
    }, { threshold: 0.3 })
    if (boardRef.current) io.observe(boardRef.current)
    return () => io.disconnect()
  }, [])

  const pct = Math.min(sec / 40 * 100, 100)
  const over = sec > 40

  return (
    <div
      ref={boardRef}
      style={{
        background:   T.color.espresso,
        color:        T.color.cream,
        borderRadius: 22,
        padding:      '1.5rem 1.6rem',
        position:     'relative',
        overflow:     'hidden',
        boxShadow:    T.alpha.shadowLg,
      }}
    >
      {/* glow */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(400px 200px at 80% 0,${T.alpha.gold16},transparent 60%)`, pointerEvents: 'none' }} />

      <div style={{ fontFamily: T.font.mono, fontSize: '.75rem', letterSpacing: '.16em', textTransform: 'uppercase', color: T.alpha.cream60, display: 'flex', alignItems: 'center', gap: '.55em' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.color.red, display: 'inline-block', animation: noMotion ? undefined : `tims-blink 1.1s ${T.ease.smooth} infinite` }} />
        SERVICE TIME
      </div>

      <div style={{ fontFamily: T.font.mono, fontWeight: 700, fontSize: '3.6rem', lineHeight: 1, color: T.color.gold, margin: '.4rem 0', letterSpacing: '-.02em' }}>
        {String(sec).padStart(2, '0')}<small style={{ fontSize: '1rem', color: T.alpha.cream55, marginLeft: '.3rem' }}>sec</small>
      </div>

      <div style={{ height: 7, borderRadius: 4, background: T.alpha.lineDk, overflow: 'hidden' }}>
        <div style={{
          display:    'block',
          height:     '100%',
          width:      `${pct}%`,
          borderRadius: 4,
          background:  over
            ? `linear-gradient(90deg,${T.color.gold},${T.color.red})`
            : `linear-gradient(90deg,${T.color.green},${T.color.gold})`,
          transition: `width .3s ${T.ease.smooth}`,
        }} />
      </div>

      <div style={{ fontFamily: T.font.mono, fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase', color: T.alpha.cream55, marginTop: '.7rem' }}>
        target <b style={{ color: T.color.cream }}>40s</b> · the number on the wall
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 96 }}>
        {orders.map((o, i) => (
          <div
            key={`${o.t}-${i}`}
            style={{
              fontSize:       '1rem',
              background:     T.alpha.cream07,
              border:         `1px solid ${o.hard ? T.alpha.red40 : T.alpha.lineDk}`,
              borderRadius:   9,
              padding:        '.5rem .7rem',
              color:          T.alpha.cream70,
              display:        'flex',
              alignItems:     'center',
              gap:            '.5rem',
              animation:      noMotion ? undefined : 'tims-ordIn .5s cubic-bezier(.34,1.56,.64,1) both',
              fontFamily:     T.font.sans,
            }}
          >
            <span style={{ fontSize: '.95rem' }}>{o.e}</span>
            {o.t}
          </div>
        ))}
      </div>
    </div>
  )
}

const TAKES = [
  { icon: '“ ”', title: 'The language is the product.', body: '“Large triple-triple, extra hot, half steeped tea” — I had to turn that into taps, fast.' },
  { icon: '⏱',         title: "Speed isn’t an opinion.",     body: 'It was a glowing number on the wall, judging me every single car.' },
  { icon: '\u{1F501}',      title: 'One waffler taxes everyone.',      body: '“Make it medium… no, iced.” On a slow screen, the whole line pays.' },
] as const

export function TimsProblem() {
  return (
    <section
      id="problem"
      style={{ padding: 'clamp(5rem,13vw,11rem) 0', background: T.color.cream2, fontFamily: T.font.sans }}
    >
      <div className="tims-wrap tims-animate">
        <div style={{ marginBottom: 'clamp(2.4rem,6vw,4rem)' }}>
          <span className="tims-label-section">What the job taught me</span>
          <h2 style={{ fontFamily: T.font.display, fontWeight: 600, fontSize: T.size.display, letterSpacing: '-.015em', lineHeight: 1.03, margin: '.7rem 0 1.1rem', color: T.color.ink }}>
            8 a.m. The line is eight cars deep.
          </h2>
          <p style={{ color: T.color.inkSoft, fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '56ch' }}>
            This is the moment a POS earns its keep — or quietly loses you the timer.
          </p>
        </div>

        {/* scene grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.4rem' }} className="tims-scene-grid">
          {/* image placeholder — swap in a real photo */}
          <figure
            style={{
              position:     'relative',
              borderRadius: 22,
              overflow:     'hidden',
              minHeight:    300,
              background:   `linear-gradient(160deg,${T.color.smoke1},${T.color.smoke2} 60%,${T.color.smoke3})`,
              boxShadow:    `inset 0 0 0 1px ${T.alpha.ink06}, 0 18px 40px ${T.alpha.ink10}`,
              display:      'flex',
              alignItems:   'flex-end',
            }}
            aria-label="Drive-thru morning rush — image placeholder"
          >
            <span style={{
              position: 'absolute', top: 14, left: 14, zIndex: 3,
              fontFamily: T.font.mono, fontSize: '.75rem', letterSpacing: '.12em', textTransform: 'uppercase',
              background: T.alpha.ink55, color: T.color.cream, padding: '.45rem .8rem', borderRadius: 999, backdropFilter: 'blur(4px)',
            }}>
              📷 drive-thru · morning rush
            </span>
            <figcaption style={{ position: 'relative', zIndex: 3, width: '100%', textAlign: 'center', padding: 12, fontFamily: T.font.mono, fontSize: '.75rem', textTransform: 'uppercase', color: T.alpha.ink55, letterSpacing: '.1em' }}>
              Image placeholder
            </figcaption>
          </figure>

          <LiveBoard />
        </div>

        {/* takeaways */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', margin: '1.4rem 0' }} className="tims-takes-grid">
          {TAKES.map((tk, i) => (
            <div
              key={tk.title}
              className="tims-take"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span style={{ display: 'inline-grid', placeContent: 'center', width: 34, height: 34, borderRadius: 10, background: T.color.cream2, color: T.color.red, fontSize: 16, marginBottom: '.7rem' }}>
                {tk.icon}
              </span>
              <p style={{ fontSize: '1rem', color: T.color.inkSoft, lineHeight: 1.5 }}>
                <b style={{ color: T.color.ink }}>{tk.title}</b> {tk.body}
              </p>
            </div>
          ))}
        </div>

        <p
          className="tims-animate"
          style={{ fontFamily: T.font.display, fontWeight: 500, fontSize: 'clamp(1.15rem,2.4vw,1.6rem)', lineHeight: 1.35, color: T.color.ink, maxWidth: '30ch', marginTop: '.4rem' }}
        >
          The thing that makes Tims <em style={{ fontStyle: 'normal', color: T.color.red }}>Tims</em> — order it your exact weird way — is the same thing that fought me on the clock.{' '}
          <strong style={{ color: T.color.red }}>That&apos;s the whole problem.</strong>
        </p>
      </div>
    </section>
  )
}
