'use client'

import { useEffect, useRef } from 'react'
import { V } from './tokens'
import { VitaeAppScreen } from './Reframe/VitaeAppScreen'

// Parse a 6-digit CSS hex token (e.g. "#f6f5ef") into [r, g, b] integers.
// This derives the melt arrays from token values — no magic numbers in the scroll handler.
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}
// Scroll-melt palette: paper → ink → lime → paper (derived from token values)
const T_PAPER = hexToRgb(V.color.paper)   // #f6f5ef
const T_INK   = hexToRgb(V.color.ink)     // #16201a
const T_LIME  = hexToRgb(V.color.lime)    // #aede3d

const SCENES = [
  {
    tag:   'Concept 01',
    h:     <>The first idea was an absolute <em>0–100.</em></>,
    p:     'Product loved it. One universal number, simple to grasp, easy to market. We built it.',
    dark:  false,
  },
  {
    tag:   'Clinical review',
    h:     <>It died in <em>ten minutes.</em></>,
    p:     'An absolute health number implies a medical claim. And a confident "78" on the morning you\'re coming down with something isn\'t simple — it\'s a dangerous lie.',
    dark:  true,
  },
  {
    tag:   'The reframe',
    h:     <>Score the day against <em>your own</em> baseline.</>,
    p:     'Not a population, not a verdict on your health — a read on your momentum versus your last 14 days. Honest, defensible, and still one glanceable number.',
    dark:  false,
  },
] as const

export function VitaeReframe() {
  const filmRef  = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const film   = filmRef.current
    const stage  = stageRef.current
    const phone  = phoneRef.current
    if (!film || !stage || !phone) return

    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches
    if (reduce) {
      sceneRefs.current.forEach((s, i) => {
        if (s) s.style.opacity = i === 0 ? '1' : '0'
      })
      return
    }

    // Token-derived — no magic numbers here
    const BG = [T_PAPER, T_INK,   T_LIME,  T_PAPER]
    const FG = [T_INK,   T_PAPER, T_INK,   T_INK  ]
    const ST = [0, 0.28, 0.55, 0.90]

    const lerp  = (a: number, b: number, t: number) => a + (b - a) * t
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
    const lerpC = (c1: number[], c2: number[], t: number) => c1.map((v, i) => Math.round(lerp(v, c2[i], t)))
    const rgb   = (a: number[]) => `rgb(${a[0]},${a[1]},${a[2]})`

    function samp(p: number, arr: number[][]) {
      for (let i = 0; i < ST.length - 1; i++) {
        if (p <= ST[i + 1]) {
          const t = (p - ST[i]) / (ST[i + 1] - ST[i])
          return lerpC(arr[i], arr[i + 1], t)
        }
      }
      return arr[arr.length - 1]
    }

    const PY1 = V.motion.distanceReveal * 0.35  // -12px phone parallax mid (~12)
    const PY2 = V.motion.distanceReveal * 0.18  // -6px  phone parallax end (~6)
    const PHONE_KF = [
      { at: 0,    x: 0,  y: 0,    s: 1,    r: 0    },
      { at: 0.45, x: -5, y: -PY1, s: 1.04, r: -1.5 },
      { at: 1,    x: 0,  y: -PY2, s: 0.95, r: 1    },
    ]
    function sampPhone(p: number) {
      for (let i = 0; i < PHONE_KF.length - 1; i++) {
        const a = PHONE_KF[i], b = PHONE_KF[i + 1]
        if (p <= b.at) {
          const t = (p - a.at) / (b.at - a.at)
          return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s, b.s, t), r: lerp(a.r, b.r, t) }
        }
      }
      return PHONE_KF[PHONE_KF.length - 1]
    }

    const n     = sceneRefs.current.length
    const filmEl  = film
    const stageEl = stage
    const phoneEl = phone

    function render() {
      const rect  = filmEl.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const p     = clamp(-rect.top / total, 0, 1)

      const bg = samp(p, BG)
      const fg = samp(p, FG)
      stageEl.style.background = rgb(bg)
      stageEl.style.color       = rgb(fg)

      sceneRefs.current.forEach((sc, i) => {
        if (!sc) return
        const center = (i + 0.5) / n
        const dist   = Math.abs(p - center) / (0.6 / n)
        const opacity = clamp(1 - dist, 0, 1)
        sc.style.opacity   = String(opacity)
        sc.style.transform = `translateY(${(p - center) * -V.motion.reframeParallax}px)`
      })

      const k = sampPhone(p)
      phoneEl.style.transform = `translate(${k.x}%,${k.y}px) scale(${k.s}) rotate(${k.r}deg)`
    }

    window.addEventListener('scroll', render, { passive: true })
    window.addEventListener('resize', render)
    render()
    return () => {
      window.removeEventListener('scroll', render)
      window.removeEventListener('resize', render)
    }
  }, [])

  return (
    <div
      ref={filmRef}
      id="reframe"
      style={{ position: 'relative', height: '460vh' }}
    >
      <div
        ref={stageRef}
        style={{
          position:      'sticky',
          top:           0,
          height:        '100vh',
          overflow:      'hidden',
          display:       'grid',
          gridTemplateColumns: '1.05fr .95fr',
          alignItems:    'center',
          gap:           'clamp(2rem,5vw,5rem)',
          padding:       '0 clamp(1.4rem,5vw,7.5rem)',
          transition:    `background ${V.motion.durationFast} ${V.ease.smoothInOut}, color ${V.motion.durationFast} ${V.ease.smoothInOut}`,
        }}
        className="vitae-reframe-stage"
      >
        {/* scenes column */}
        <div style={{ position: 'relative', height: '58vh' }}>
          {SCENES.map((sc, i) => (
            <div
              key={sc.tag}
              ref={el => { sceneRefs.current[i] = el }}
              style={{
                position:      'absolute',
                inset:         0,
                display:       'flex',
                flexDirection: 'column',
                justifyContent:'center',
                willChange:    'opacity,transform',
                opacity:       i === 0 ? 1 : 0,
              }}
            >
              <div
                style={{
                  fontFamily:    V.font.mono,
                  fontSize:      V.size.eyebrow,
                  letterSpacing: '.22em',
                  textTransform: 'uppercase',
                  marginBottom:  '1.2rem',
                  opacity:       0.75,
                }}
              >
                {sc.tag}
              </div>
              <h2
                style={{
                  fontFamily:    V.font.serif,
                  fontWeight:    300,
                  fontSize:      'clamp(2rem,4.6vw,3.8rem)',
                  lineHeight:    1.04,
                  letterSpacing: '-.022em',
                  maxWidth:      '15ch',
                  margin:        '0 0 1.3rem',
                }}
              >
                {sc.h}
              </h2>
              <p
                style={{
                  fontFamily: V.font.sans,
                  fontSize:   '1.08rem',
                  maxWidth:   '40ch',
                  lineHeight: 1.65,
                  margin:     0,
                  opacity:    0.75,
                }}
              >
                {sc.p}
              </p>
            </div>
          ))}
        </div>

        {/* phone column — shell + animated app screen */}
        <div ref={phoneRef} style={{ justifySelf: 'center', willChange: 'transform' }}>
          <div
            style={{
              width:        'clamp(228px, 26vw, 300px)',
              aspectRatio:  '9 / 19.3',
              borderRadius: '13% / 6.5%',
              padding:      '2.6%',
              background:   V.gradient.phoneShell,
              boxShadow:    V.shadow.phoneRing,
              flexShrink:   0,
              position:     'relative',
            }}
          >
            <div
              style={{
                width:        '100%',
                height:       '100%',
                borderRadius: '11% / 5.6%',
                overflow:     'hidden',
                position:     'relative',
                background:   V.color.screenBg,
              }}
            >
              <VitaeAppScreen />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

