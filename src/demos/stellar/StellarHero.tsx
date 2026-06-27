'use client'

import { useEffect, useRef } from 'react'
import { S } from './tokens'

// 3-layer depth field — far/mid/near
// d > 0 = moves with mouse, d < 0 = counter-moves (visual complexity)
// blur = depth-of-field: far items slightly soft-focus
// amp/freq/phase = idle sinusoidal drift (page feels alive before interaction)
// shadow = color-matched drop shadow (per-produce tint)
const VEGS = [
  // FAR — heavily blurred, "behind everything" depth cue
  { emoji: '🌿', d:  5, blur: 2.2, shadow: '', amp: 6,  freq: 0.00080, phase: 0.0, style: { top: '22%',    left: '-1%',  fontSize: 'clamp(1.1rem,1.8vw,1.7rem)', opacity: 0.65 } },
  { emoji: '🥕', d: -6, blur: 2.8, shadow: '', amp: 5,  freq: 0.00092, phase: 1.2, style: { bottom: '28%', left: '4%',   fontSize: 'clamp(1.1rem,1.8vw,1.6rem)', opacity: 0.55 } },
  // MID — sharp, medium drama
  { emoji: '🍅', d:  15, blur: 0, shadow: 'drop-shadow(0 14px 24px rgba(180,40,20,.22))',                  amp: 10, freq: 0.00068, phase: 2.1, style: { top: '10%',    right: '20%', fontSize: 'clamp(1.7rem,3vw,2.8rem)'   } },
  { emoji: '🥦', d: -15, blur: 0, shadow: 'drop-shadow(0 12px 22px rgba(30,110,30,.20))',                  amp: 9,  freq: 0.00060, phase: 0.7, style: { top: '62%',    right: '29%', fontSize: 'clamp(1.6rem,2.8vw,2.6rem)' } },
  { emoji: '🧅', d:  13, blur: 0, shadow: 'drop-shadow(0 10px 18px rgba(160,120,40,.20))',                 amp: 8,  freq: 0.00105, phase: 3.4, style: { bottom: '30%', left: '15%',  fontSize: 'clamp(1.5rem,2.6vw,2.3rem)' } },
  // NEAR — large, max drama, dual-layer colored shadows
  { emoji: '🍋', d:  27, blur: 0, shadow: 'drop-shadow(0 28px 44px rgba(200,160,0,.28)) drop-shadow(0 8px 18px rgba(200,160,0,.18))',   amp: 16, freq: 0.00050, phase: 1.8, style: { top: '16%',    right: '3%',  fontSize: 'clamp(2.8rem,5.5vw,5rem)'   } },
  { emoji: '🫑', d: -25, blur: 0, shadow: 'drop-shadow(0 24px 38px rgba(20,100,20,.24)) drop-shadow(0 7px 16px rgba(20,100,20,.16))',   amp: 14, freq: 0.00082, phase: 2.9, style: { bottom: '8%',  right: '12%', fontSize: 'clamp(2.5rem,5vw,4.4rem)'   } },
  { emoji: '🧄', d:  21, blur: 0, shadow: 'drop-shadow(0 20px 32px rgba(140,100,60,.22)) drop-shadow(0 6px 14px rgba(140,100,60,.14))', amp: 12, freq: 0.00072, phase: 0.4, style: { top: '48%',    right: '44%', fontSize: 'clamp(2rem,4vw,3.5rem)'     } },
]

export function StellarHero() {
  const vegRefs  = useRef<(HTMLSpanElement | null)[]>([])
  const h1Ref    = useRef<HTMLHeadingElement>(null)
  const lightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let mx = 0.5, my = 0.5, sy = 0

    // Per-item spring state
    const sp = VEGS.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }))
    // H1 micro-tilt spring
    let htx = 0, hty = 0, hvx = 0, hvy = 0

    const onMove   = (e: MouseEvent) => { mx = e.clientX / window.innerWidth; my = e.clientY / window.innerHeight }
    const onScroll = () => { sy = window.scrollY }

    window.addEventListener('mousemove', onMove,   { passive: true })
    window.addEventListener('scroll',    onScroll, { passive: true })

    let raf: number

    const frame = (t: number) => {
      const nmx = mx - 0.5   // –0.5 → 0.5
      const nmy = my - 0.5

      VEGS.forEach(({ d, amp, freq, phase }, i) => {
        const ad = Math.abs(d)

        // Spring calibrated by depth:
        // near items = snappier + lighter damping = personality overshoot
        // far items  = sluggish + heavy damping  = dreamy lag
        const stiff = 0.040 + ad * 0.0015
        const damp  = 0.892 - ad * 0.0018

        // Target: mouse × depth × scale  +  idle sine drift  +  scroll offset
        const tx = nmx * d * 2.8 + Math.sin(t * freq + phase) * amp
        const ty = nmy * d * 1.8
                 + Math.cos(t * freq * 0.73 + phase + 1) * amp * 0.65
                 - Math.min(sy, 600) * ad * 0.032

        sp[i].vx += (tx - sp[i].x) * stiff;  sp[i].vx *= damp;  sp[i].x += sp[i].vx
        sp[i].vy += (ty - sp[i].y) * stiff;  sp[i].vy *= damp;  sp[i].y += sp[i].vy

        const el = vegRefs.current[i]
        if (!el) return

        // Velocity-driven rotation: moving fast → lean in direction
        const rot   = sp[i].vx * 0.30
        // Velocity-driven scale: moving fast → very slightly larger (kinetic energy)
        const speed = Math.min(Math.abs(sp[i].vx) + Math.abs(sp[i].vy), 9)
        const sc    = 1 + speed * 0.0013

        el.style.transform = `translate(${sp[i].x}px,${sp[i].y}px) rotate(${rot}deg) scale(${sc})`
      })

      // Headline micro-tilt — whole h1 leans into cursor like a physical slab
      hvx += (nmx * 3.2 - htx) * 0.034;  hvx *= 0.868;  htx += hvx
      hvy += (nmy * 2.0 - hty) * 0.034;  hvy *= 0.868;  hty += hvy
      if (h1Ref.current) {
        h1Ref.current.style.transform =
          `perspective(1100px) rotateY(${htx * 0.006}deg) rotateX(${-hty * 0.004}deg)`
      }

      // Ambient bloom — soft radial light follows cursor
      if (lightRef.current) {
        lightRef.current.style.background =
          `radial-gradient(ellipse 65% 55% at ${mx * 100}% ${my * 100}%,` +
          `rgba(154,216,78,.11) 0%, rgba(63,161,74,.04) 42%, transparent 68%)`
      }

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll',    onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <header
      className="stellar-hero"
      style={{
        minHeight:    '100vh',
        display:      'grid',
        alignContent: 'center',
        position:     'relative',
        padding:      '7rem 0 3rem',
        overflow:     'hidden',
      }}
    >
      {/* Ambient cursor bloom */}
      <div
        ref={lightRef}
        aria-hidden
        style={{
          position:    'absolute',
          inset:       0,
          zIndex:      0,
          pointerEvents: 'none',
          background:  'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(154,216,78,.11) 0%, transparent 68%)',
        }}
      />

      {/* Floating produce — 3-layer depth field */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        {VEGS.map((v, i) => (
          <span
            key={v.emoji}
            ref={el => { vegRefs.current[i] = el }}
            className={`stellar-veg stellar-veg-${i + 1}`}
            style={{
              position:   'absolute',
              display:    'block',
              filter:     v.blur > 0 ? `blur(${v.blur}px)` : v.shadow,
              willChange: 'transform',
              ...v.style,
            }}
          >
            {v.emoji}
          </span>
        ))}
      </div>

      <div className="stellar-wrap" style={{ position: 'relative', zIndex: 2 }}>
        <span className="stellar-label" style={{ marginBottom: '1.4rem' }}>
          Mobile · AI cooking app · sole designer
        </span>

        <h1
          ref={h1Ref}
          className="stellar-hero-h1"
          style={{ transformOrigin: 'left center', willChange: 'transform' }}
        >
          <span className="stellar-l1"><span>Your fridge is</span></span>
          <span className="stellar-l1"><span><em style={{ fontFamily: S.font.italic, fontStyle: 'italic', fontWeight: 500, color: S.color.greenDeep }}>full.</em> Dinner</span></span>
          <span className="stellar-l1"><span>still feels</span></span>
          <span className="stellar-l1"><span>impossible.</span></span>
        </h1>

        <p className="stellar-hero-lead">
          Stellar is an AI cooking companion built around one stubborn truth: people waste food they own and still don&apos;t know what to make. So I designed an app that cooks from what&apos;s already in your kitchen.
        </p>

        <div className="stellar-meta">
          <div><b>Role</b><span>Sole designer · UX/UI</span></div>
          <div><b>Scope</b><span>End-to-end · mobile</span></div>
          <div><b>Grounded in</b><span>6 interviews · 20+ surveyed</span></div>
          <div><b>Year</b><span>2024</span></div>
        </div>
      </div>
    </header>
  )
}
