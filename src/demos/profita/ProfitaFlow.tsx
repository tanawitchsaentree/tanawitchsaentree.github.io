'use client'

import React, { useEffect, useRef } from 'react'
import { P } from './tokens'
import { ProfitaPhoneScreen, PROFITA_PHONE_W, PROFITA_PHONE_H, type ScreenName } from './ProfitaPhoneScreen'
import { useContainerWidth } from './useContainerWidth'

const FLOW_SCREENS: ScreenName[] = ['feed', 'fund', 'funddetail', 'buyamount', 'confirm']

function FlowScreen({ index, targetW }: { index: number; targetW: number }) {
  const screen = FLOW_SCREENS[index]
  if (!screen) return null
  const scale = targetW / PROFITA_PHONE_W
  return (
    <div style={{
      width:     targetW,
      height:    PROFITA_PHONE_H * scale,
      flexShrink:0,
      position:  'relative',
    }}>
      <div style={{
        position:        'absolute',
        top:             0,
        left:            0,
        transform:       `scale(${scale})`,
        transformOrigin: 'top left',
        width:           PROFITA_PHONE_W,
        height:          PROFITA_PHONE_H,
      }}>
        <ProfitaPhoneScreen screen={screen} />
      </div>
    </div>
  )
}

const FLOW = [
  {
    tab:  'Discover',
    tag:  'Step 01 · Discover',
    head: 'Start from a goal, not a ticker',
    desc: 'We asked users what they wanted their money to do — travel, retirement, a safety net — and built the entry point around that answer. The fund appears after the goal is set.',
  },
  {
    tab:  'Explore',
    tag:  'Step 02 · Explore',
    head: 'Funds matched to your goal',
    desc: "The app surfaces 3–5 fund options filtered to the user's timeline and risk tolerance. No overwhelming catalogue — only what's relevant to their stated goal.",
  },
  {
    tab:  'Compare',
    tag:  'Step 03 · Compare',
    head: 'Side-by-side, plain language',
    desc: 'Returns, risk rating, and who else invests — explained without financial jargon. Users can tap any term for a plain-language tooltip. No glossary detour.',
  },
  {
    tab:  'Set amount',
    tag:  'Step 04 · Set amount',
    head: 'One slider, one number',
    desc: 'A single input: how much per month? The app shows projected value in 5 years instantly. No forms, no nested conditions, no confusion.',
  },
  {
    tab:  'Confirm',
    tag:  'Step 05 · Confirm',
    head: 'One tap to start',
    desc: 'Summary screen with a clear, single action. No fine print buried in scrollable walls of text. The commitment is visible and feels light.',
  },
] as const

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

// ── Scroll-driven flow stepper ─────────────────────────────────────
// Outer track = (FLOW.length + 1) × 100vh so each step gets exactly 100vh of scroll.
// Sticky viewport locks at top:0 / height:100vh for the whole duration.
// RAF loop reads getBoundingClientRect() → works with Lenis (no native scroll event needed).

export function ProfitaFlow() {
  const trackRef    = useRef<HTMLDivElement>(null)
  const tabRefs     = useRef<(HTMLButtonElement | null)[]>([])
  const phoneRefs   = useRef<(HTMLDivElement | null)[]>([])
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotRefs     = useRef<(HTMLDivElement | null)[]>([])
  const prevStep    = useRef(-1)
  const vw = useContainerWidth()
  const flowTargetW = vw > 0 && vw < 768 ? Math.round(vw * 0.42) : 220

  useEffect(() => {
    const STEPS = FLOW.length

    const applyStep = (step: number) => {
      if (step === prevStep.current) return
      prevStep.current = step

      tabRefs.current.forEach((el, i) => {
        if (!el) return
        const on = i === step
        el.style.border     = `1px solid ${on ? P.alpha.gold35 : P.alpha.line}`
        el.style.background = on ? P.alpha.gold14 : P.alpha.white07
        el.style.color      = on ? P.color.gold   : P.color.onMut
      })

      phoneRefs.current.forEach((el, i) => {
        if (!el) return
        const on = i === step
        el.style.opacity   = on ? '1' : '0'
        el.style.transform = on ? 'none'
          : i < step ? 'translateY(-12px) scale(0.96)' : 'translateY(12px) scale(0.96)'
      })

      contentRefs.current.forEach((el, i) => {
        if (!el) return
        const on = i === step
        el.style.opacity   = on ? '1' : '0'
        el.style.transform = on ? 'none'
          : i < step ? 'translateY(-10px)' : 'translateY(10px)'
      })

      dotRefs.current.forEach((el, i) => {
        if (!el) return
        el.style.width      = i === step ? '24px' : '6px'
        el.style.background = i <= step ? P.color.gold : P.alpha.gold35
      })
    }

    let rafId: number

    const tick = () => {
      const track = trackRef.current
      if (track) {
        const rect = track.getBoundingClientRect()
        const vh   = window.innerHeight
        // t: 0 → 1 across (STEPS × vh) of usable scroll
        const raw  = -rect.top / (rect.height - vh)
        const t    = clamp(raw, 0, 1)
        const step = clamp(Math.floor(t * STEPS), 0, STEPS - 1)
        applyStep(step)
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <section
      id="flow"
      ref={trackRef}
      data-demo="profita"
      style={{
        position:   'relative',
        height:     `${(FLOW.length + 1) * 100}vh`,
        fontFamily: P.font.body,
      }}
    >
      {/* ── Sticky viewport ── */}
      <div style={{
        position:       'sticky',
        top:            0,
        height:         '100vh',
        overflow:       'hidden',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        padding:        'clamp(4rem,9vw,7rem) 0',
      }}>
        <div className="prof-wrap">

          <p className="prof-kick" style={{ marginBottom: '2.5rem' }}>
            04 · The signature flow
          </p>

          {/* Tab pills */}
          <div style={{ display: 'flex', gap: 4, marginBottom: '2.8rem', flexWrap: 'wrap' }}>
            {FLOW.map((f, i) => (
              <button
                key={f.tab}
                type="button"
                ref={el => { tabRefs.current[i] = el }}
                style={{
                  fontFamily:    P.font.mono,
                  fontSize:      '.72rem',
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  padding:       '.5rem 1rem',
                  borderRadius:  8,
                  // Initial: step 0 active
                  border:        `1px solid ${i === 0 ? P.alpha.gold35 : P.alpha.line}`,
                  background:    i === 0 ? P.alpha.gold14 : P.alpha.white07,
                  color:         i === 0 ? P.color.gold   : P.color.onMut,
                  cursor:        'default',
                  transition: [
                    `background .3s ${P.ease.expo}`,
                    `color .3s ${P.ease.expo}`,
                    `border-color .3s ${P.ease.expo}`,
                  ].join(', '),
                }}
              >
                {f.tab}
              </button>
            ))}
          </div>

          {/* Layout: side-by-side ≥768px, stacked <768px */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: vw > 0 && vw < 768 ? '1fr' : 'auto 1fr',
            gap:                 vw > 0 && vw < 768 ? '1.5rem' : 'clamp(2rem,5vw,5rem)',
            alignItems:          'center',
          }}>

            {/* Phones — stacked, one visible at a time */}
            <div style={{
              position:       'relative',
              display:        'flex',
              justifyContent: vw > 0 && vw < 768 ? 'center' : 'flex-start',
            }}>
              {FLOW.map((f, i) => (
                <div
                  key={i}
                  ref={el => { phoneRefs.current[i] = el }}
                  style={{
                    position:   i === 0 ? 'relative' : 'absolute',
                    top:        i === 0 ? undefined : 0,
                    left:       i === 0 ? undefined : 0,
                    opacity:    i === 0 ? 1 : 0,
                    transition: `opacity .4s ${P.ease.expo}, transform .4s ${P.ease.expo}`,
                  }}
                >
                  <FlowScreen index={i} targetW={flowTargetW} />
                </div>
              ))}
            </div>

            {/* Descriptions — all absolutely stacked */}
            <div style={{ position: 'relative', minHeight: vw > 0 && vw < 768 ? 200 : 260 }}>
              {FLOW.map((f, i) => (
                <div
                  key={i}
                  ref={el => { contentRefs.current[i] = el }}
                  style={{
                    position:   'absolute',
                    top:        0,
                    left:       0,
                    right:      0,
                    opacity:    i === 0 ? 1 : 0,
                    transition: `opacity .4s ${P.ease.expo}, transform .4s ${P.ease.expo}`,
                  }}
                >
                  <p style={{
                    fontFamily:    P.font.mono,
                    fontSize:      '12px',
                    letterSpacing: '.14em',
                    textTransform: 'uppercase',
                    color:         P.color.gold,
                    marginBottom:  '.9rem',
                  }}>
                    {f.tag}
                  </p>
                  <h3 style={{
                    fontFamily:    P.font.disp,
                    fontWeight:    400,
                    fontSize:      'clamp(1.4rem,3.5vw,2.5rem)',
                    lineHeight:    1.15,
                    letterSpacing: '-.02em',
                    color:         P.color.on,
                    marginBottom:  '1rem',
                  }}>
                    {f.head}
                  </h3>
                  <p style={{
                    fontSize:   '1rem',
                    color:      P.color.onMut,
                    lineHeight: 1.7,
                    maxWidth:   '44ch',
                  }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* Step dots */}
          <div style={{ display: 'flex', gap: 8, marginTop: '2rem' }}>
            {FLOW.map((_, i) => (
              <div
                key={i}
                ref={el => { dotRefs.current[i] = el }}
                style={{
                  width:        i === 0 ? '24px' : '6px',
                  height:       '6px',
                  borderRadius: 999,
                  background:   i === 0 ? P.color.gold : P.alpha.gold35,
                  transition:   `width .35s ${P.ease.expo}, background .35s ${P.ease.expo}`,
                }}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
