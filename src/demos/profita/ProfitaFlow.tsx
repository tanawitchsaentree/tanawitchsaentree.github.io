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
    head: 'Start from what the money is for',
    desc: 'We asked users what they wanted their money to do, such as travel, retirement or a safety net, and built the entry point around that answer. The fund appears after the goal is set.',
  },
  {
    tab:  'Explore',
    tag:  'Step 02 · Explore',
    head: 'Funds matched to your goal',
    desc: "The app shows 3 to 5 funds that fit the user's timeline and risk tolerance. Funds that don't match the goal stay off the list.",
  },
  {
    tab:  'Compare',
    tag:  'Step 03 · Compare',
    head: 'Side-by-side, plain language',
    desc: 'Returns, risk rating, and who else invests are explained without financial jargon. Users can tap any term for a plain-language tooltip. No glossary detour.',
  },
  {
    tab:  'Set amount',
    tag:  'Step 04 · Set amount',
    head: 'One slider, one number',
    desc: 'There is one input, the amount per month. The app shows the projected value in 5 years as soon as you type, and there is nothing else to fill out.',
  },
  {
    tab:  'Confirm',
    tag:  'Step 05 · Confirm',
    head: 'One tap to start',
    desc: 'The summary screen has one clear action and no fine print hidden in long scrolling text. You can see exactly what you are committing to, and it feels light.',
  },
] as const

// ── Scroll-driven flow stepper ─────────────────────────────────────
// Outer track = (FLOW.length + 1) × 100vh so each step gets exactly 100vh of scroll.
// Sticky viewport locks at top:0 / height:100vh for the whole duration.
// One 100vh sentinel per step, offset by half a viewport, and an IntersectionObserver
// whose root is a thin band across the middle of the viewport. The sentinel under the
// band is the active step: same step boundaries as the old rAF loop, with no
// per-frame layout reads.

const PILL_ON  = { border: P.color.gold, background: P.color.gold, color: P.color.navy900 }
const PILL_OFF = { border: P.alpha.line, background: 'transparent', color: P.color.onMut }

export function ProfitaFlow() {
  const trackRef    = useRef<HTMLDivElement>(null)
  const tabRefs     = useRef<(HTMLButtonElement | null)[]>([])
  const phoneRefs   = useRef<(HTMLDivElement | null)[]>([])
  const contentRefs = useRef<(HTMLDivElement | null)[]>([])
  const dotRefs     = useRef<(HTMLDivElement | null)[]>([])
  const sentinelRefs = useRef<(HTMLDivElement | null)[]>([])
  const prevStep    = useRef(0)
  const vw = useContainerWidth()
  const narrow = vw > 0 && vw < 768
  // Floor at 150px (scale 0.5) so mockup text stays legible on narrow phones.
  const flowTargetW = narrow ? Math.max(150, Math.round(vw * 0.42)) : 220

  useEffect(() => {
    // Initial state: only step 0's phone is reachable.
    phoneRefs.current.forEach((el, i) => {
      if (!el) return
      el.inert = i !== 0
      el.setAttribute('aria-hidden', i === 0 ? 'false' : 'true')
    })
    const applyStep = (step: number) => {
      if (step === prevStep.current) return
      prevStep.current = step

      tabRefs.current.forEach((el, i) => {
        if (!el) return
        const on = i === step
        const c = on ? PILL_ON : PILL_OFF
        el.style.borderColor = c.border
        el.style.background  = c.background
        el.style.color       = c.color
        el.setAttribute('aria-current', on ? 'step' : 'false')
      })

      phoneRefs.current.forEach((el, i) => {
        if (!el) return
        const on = i === step
        el.style.opacity   = on ? '1' : '0'
        el.style.transform = on ? 'none'
          : i < step ? 'translateY(-12px) scale(0.96)' : 'translateY(12px) scale(0.96)'
        // Hidden phones still hold real buttons (keypad, back); keep them out of focus and the a11y tree.
        el.inert = !on
        el.setAttribute('aria-hidden', on ? 'false' : 'true')
      })

      contentRefs.current.forEach((el, i) => {
        if (!el) return
        const on = i === step
        el.style.opacity   = on ? '1' : '0'
        el.style.transform = on ? 'none'
          : i < step ? 'translateY(-10px)' : 'translateY(10px)'
        el.setAttribute('aria-hidden', on ? 'false' : 'true')
      })

      dotRefs.current.forEach((el, i) => {
        if (!el) return
        // scaleX keeps the active-dot stretch on the compositor (base width 24px).
        el.style.transform  = i === step ? 'scaleX(1)' : 'scaleX(.25)'
        el.style.background = i <= step ? P.color.gold : P.alpha.gold35
      })
    }

    const inBand = new Set<number>()
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const i = Number((e.target as HTMLElement).dataset.step)
        if (e.isIntersecting) inBand.add(i); else inBand.delete(i)
      })
      if (inBand.size) applyStep(Math.max(...Array.from(inBand)))
    }, { rootMargin: '-50% 0px -49% 0px', threshold: 0 })
    sentinelRefs.current.forEach(el => { if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])

  const goTo = (i: number) => {
    const track = trackRef.current
    if (!track) return
    const top = track.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + i * window.innerHeight + 2, behavior: 'smooth' })
  }

  return (
    <section
      id="flow"
      data-demo="profita"
      style={{ fontFamily: P.font.body }}
    >
      {/* Section intro: heading + lead in normal flow, above the scroll track, so the
          stepper's sentinels and sticky viewport keep their exact geometry. */}
      <div className="prof-wrap prof-animate" style={{ paddingTop: 'clamp(4rem,9vw,7rem)' }}>
        <h2 style={{
          fontFamily:    P.font.disp,
          fontWeight:    400,
          fontSize:      'clamp(1.8rem,4vw,3.2rem)',
          lineHeight:    1.12,
          letterSpacing: '-.02em',
          color:         P.color.on,
          maxWidth:      '20ch',
          margin:        '0 0 1.2rem',
        }}>
          Five steps from a goal to{' '}
          <em style={{ fontStyle: 'italic', color: P.color.gold }}>a first order.</em>
        </h2>
        <p style={{ fontSize: '1.05rem', color: P.color.onMut, lineHeight: 1.65, maxWidth: '52ch', margin: 0 }}>
          The flow starts from what the money is for and ends on one confirm screen, which shows
          the transaction date and the effective date before anyone pays.
        </p>
      </div>

      <div
        ref={trackRef}
        style={{
          position: 'relative',
          height:   `${(FLOW.length + 1) * 100}vh`,
        }}
      >
      {FLOW.map((_, i) => (
        <div
          key={`s${i}`}
          ref={el => { sentinelRefs.current[i] = el }}
          data-step={i}
          aria-hidden="true"
          style={{ position: 'absolute', left: 0, width: 1, top: `${i * 100 + 50}vh`, height: '100vh', pointerEvents: 'none' }}
        />
      ))}

      {/* ── Sticky viewport ── */}
      <div style={{
        position:       'sticky',
        top:            0,
        height:         '100vh',
        overflow:       'hidden',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        padding:        narrow ? '1.5rem 0' : 'clamp(4rem,9vw,7rem) 0',
      }}>
        <div className="prof-wrap">

          <p className="prof-kick" style={{ marginBottom: narrow ? '1rem' : '2.5rem' }}>
            04 · The signature flow
          </p>

          {/* Tab pills */}
          <div style={{
            display: 'flex', gap: 4, marginBottom: narrow ? '1.2rem' : '2.8rem',
            flexWrap: narrow ? 'nowrap' : 'wrap', overflowX: narrow ? 'auto' : undefined,
            scrollbarWidth: 'none', marginInline: narrow ? '-.25rem' : undefined, padding: narrow ? '0 .25rem' : undefined,
          }}>
            {FLOW.map((f, i) => (
              <button
                key={f.tab}
                type="button"
                ref={el => { tabRefs.current[i] = el }}
                onClick={() => goTo(i)}
                aria-current={i === 0 ? 'step' : 'false'}
                style={{
                  flexShrink:    0,
                  fontFamily:    P.font.mono,
                  fontSize:      '.72rem',
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  padding:       '.5rem 1rem',
                  borderRadius:  8,
                  // Initial: step 0 active. Active = solid gold fill, others = neutral hairline.
                  border:        `1px solid ${i === 0 ? PILL_ON.border : PILL_OFF.border}`,
                  background:    i === 0 ? PILL_ON.background : PILL_OFF.background,
                  color:         i === 0 ? PILL_ON.color : PILL_OFF.color,
                  cursor:        'pointer',
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
            gridTemplateColumns: narrow ? '1fr' : 'auto 1fr',
            gap:                 narrow ? '1rem' : 'clamp(2rem,5vw,5rem)',
            alignItems:          'center',
          }}>

            {/* Phones — stacked, one visible at a time */}
            <div style={{
              position:       'relative',
              display:        'flex',
              justifyContent: narrow ? 'center' : 'flex-start',
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
            <div style={{ position: 'relative', minHeight: narrow ? 190 : 260 }}>
              {FLOW.map((f, i) => (
                <div
                  key={i}
                  ref={el => { contentRefs.current[i] = el }}
                  aria-hidden={i === 0 ? 'false' : 'true'}
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
          <div aria-hidden="true" style={{ display: 'flex', gap: 8, marginTop: narrow ? '1rem' : '2rem' }}>
            {FLOW.map((_, i) => (
              <div
                key={i}
                ref={el => { dotRefs.current[i] = el }}
                style={{
                  width:        '24px',
                  height:       '6px',
                  borderRadius: 999,
                  transformOrigin: 'left center',
                  transform:    i === 0 ? 'scaleX(1)' : 'scaleX(.25)',
                  background:   i === 0 ? P.color.gold : P.alpha.gold35,
                  transition:   `transform .35s ${P.ease.expo}, background .35s ${P.ease.expo}`,
                }}
              />
            ))}
          </div>

        </div>
      </div>
      </div>
    </section>
  )
}
