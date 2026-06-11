'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useReducedMotion } from 'framer-motion'

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace"

// ── Silt palette ──────────────────────────────────────────────────────────────
const SILT = {
  bg:       '#EDEAE3',
  surface:  '#E2DDD4',
  fg:       '#18160F',
  fgMuted:  '#6E6A60',
  accent:   '#5C6B3A',
  border:   '#C8C4BA',
} as const

// ── Recipe data ───────────────────────────────────────────────────────────────
type Step = {
  n: number
  text: string
  subSteps?: string[]
}

const RECIPE_STEPS: Step[] = [
  {
    n: 1,
    text: 'Pat chicken thighs completely dry with paper towels. Season aggressively with salt and pepper on both sides.',
  },
  {
    n: 2,
    text: 'Heat neutral oil in a heavy skillet over medium-high. Lay chicken skin-side down. Don\'t move it for 8 minutes, until skin is deeply golden.',
    subSteps: [
      'Heat oil until it shimmers.',
      'Lay chicken skin-side down.',
      "Don't move it. 8 minutes.",
    ],
  },
  {
    n: 3,
    text: 'Flip chicken and cook flesh-side down for 4 more minutes. Transfer to a plate.',
  },
  {
    n: 4,
    text: 'Reduce heat to medium. Add garlic cloves and thyme sprigs to the pan. Toss in preserved lemon rind. Spoon the brown butter over the chicken.',
    subSteps: [
      'Flip chicken.',
      'Add garlic, thyme, preserved lemon rind.',
      'Spoon brown butter over the top.',
    ],
  },
  {
    n: 5,
    text: 'Return chicken skin-side up. Baste continuously for 2 minutes until butter is nutty and fragrant.',
  },
  {
    n: 6,
    text: 'Rest 5 minutes off heat. The carry-over matters here.',
  },
  {
    n: 7,
    text: 'Plate with pan juices and a final squeeze of preserved lemon.',
  },
]

const INGREDIENTS = [
  '4 bone-in, skin-on chicken thighs',
  'Flaky sea salt + black pepper',
  '2 tbsp neutral oil',
  '4 garlic cloves, unpeeled',
  '4 thyme sprigs',
  '1 preserved lemon, rind only',
  '2 tbsp unsalted butter',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function getSubStepCount(step: Step): number {
  return step.subSteps ? step.subSteps.length : 1
}

function getTotalSubSteps(): number {
  return RECIPE_STEPS.reduce((acc, s) => acc + getSubStepCount(s), 0)
}

type CookPos = { stepIdx: number; subIdx: number }

function nextCookPos(pos: CookPos): CookPos | null {
  const step = RECIPE_STEPS[pos.stepIdx]
  const subCount = getSubStepCount(step)
  if (pos.subIdx < subCount - 1) return { stepIdx: pos.stepIdx, subIdx: pos.subIdx + 1 }
  if (pos.stepIdx < RECIPE_STEPS.length - 1) return { stepIdx: pos.stepIdx + 1, subIdx: 0 }
  return null
}

function prevCookPos(pos: CookPos): CookPos | null {
  if (pos.subIdx > 0) return { stepIdx: pos.stepIdx, subIdx: pos.subIdx - 1 }
  if (pos.stepIdx > 0) {
    const prevStep = RECIPE_STEPS[pos.stepIdx - 1]
    return { stepIdx: pos.stepIdx - 1, subIdx: getSubStepCount(prevStep) - 1 }
  }
  return null
}

function getStepLabel(pos: CookPos): string {
  const step = RECIPE_STEPS[pos.stepIdx]
  const hasSubSteps = !!step.subSteps
  const totalSteps = RECIPE_STEPS.length
  if (hasSubSteps) {
    return `${step.n}.${pos.subIdx + 1} / ${totalSteps}`
  }
  return `${step.n} / ${totalSteps}`
}

function getStepText(pos: CookPos): string {
  const step = RECIPE_STEPS[pos.stepIdx]
  if (step.subSteps) return step.subSteps[pos.subIdx]
  return step.text
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CookModeShift() {
  const [mode, setMode] = useState<'browse' | 'cook'>('browse')
  const [cookPos, setCookPos] = useState<CookPos>({ stepIdx: 1, subIdx: 0 })
  const [transitioning, setTransitioning] = useState(false)
  const [stage, setStage] = useState<number>(0)
  const prefersReduced = useReducedMotion()

  // Refs for FLIP
  const stepRefs = useRef<(HTMLElement | null)[]>([])
  const cookTextRef = useRef<HTMLDivElement>(null)
  const flipOriginRef = useRef<{ top: number; left: number; width: number; height: number; fontSize: number } | null>(null)

  const enterCookMode = useCallback(() => {
    if (transitioning) return

    // Capture FLIP origin — bounding box of the active step text in browse mode
    const stepEl = stepRefs.current[cookPos.stepIdx]
    if (stepEl) {
      const rect = stepEl.getBoundingClientRect()
      const containerEl = stepEl.closest('.cook-demo-container')
      const containerRect = containerEl?.getBoundingClientRect()
      flipOriginRef.current = {
        top:      rect.top - (containerRect?.top ?? 0),
        left:     rect.left - (containerRect?.left ?? 0),
        width:    rect.width,
        height:   rect.height,
        fontSize: parseFloat(getComputedStyle(stepEl).fontSize),
      }
    }

    setTransitioning(true)
    setMode('cook')
    setStage(1)
  }, [transitioning, cookPos])

  const exitCookMode = useCallback(() => {
    if (transitioning) return
    setTransitioning(true)
    // Reverse: start from stage 6 and collapse
    setStage(0)
    setTimeout(() => {
      setMode('browse')
      setTransitioning(false)
    }, prefersReduced ? 300 : 840)
  }, [transitioning, prefersReduced])

  // Stage sequencing on enter
  useEffect(() => {
    if (mode !== 'cook' || stage === 0) return
    if (prefersReduced) {
      setStage(6)
      setTransitioning(false)
      return
    }
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setStage(2), 200))
    timers.push(setTimeout(() => setStage(3), 300))
    timers.push(setTimeout(() => setStage(4), 500))
    timers.push(setTimeout(() => setStage(5), 700))
    timers.push(setTimeout(() => setStage(6), 1100))
    timers.push(setTimeout(() => setTransitioning(false), 1200))
    return () => timers.forEach(clearTimeout)
  }, [mode, stage === 1, prefersReduced]) // eslint-disable-line

  const handleNext = () => {
    const next = nextCookPos(cookPos)
    if (next) setCookPos(next)
  }

  const handlePrev = () => {
    const prev = prevCookPos(cookPos)
    if (prev) setCookPos(prev)
  }

  // ── Browse mode (active step for FLIP source tracking)
  const activeBrowseStepIdx = cookPos.stepIdx

  const easeDefault  = 'cubic-bezier(0.65, 0, 0.35, 1)'
  const easeDecisive = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const easeSnap     = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

  const dur = (ms: number) => `${prefersReduced ? Math.min(ms * 0.25, 150) : ms}ms`

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="cook-demo-container"
      style={{
        background:   SILT.bg,
        color:        SILT.fg,
        fontFamily:   MONO,
        minHeight:    '80vh',
        position:     'relative',
        overflow:     'hidden',
        borderRadius: 0,
        border:       `1px solid ${SILT.border}`,
      }}
    >
      {/* ── BROWSE MODE ─────────────────────────────────────────────────── */}
      <div
        aria-hidden={mode === 'cook'}
        style={{
          position:   'absolute',
          inset:      0,
          opacity:    mode === 'browse' ? 1 : 0,
          pointerEvents: mode === 'browse' ? 'auto' : 'none',
          transition: prefersReduced
            ? `opacity 300ms ${easeDefault}`
            : mode === 'browse'
              ? `opacity 200ms ${easeDefault} 600ms`
              : `opacity 160ms ${easeDefault}`,
        }}
      >
        <div style={{ padding: '48px 40px 80px', maxWidth: 720, margin: '0 auto' }}>

          {/* Header */}
          <div style={{
            opacity:    mode === 'cook' ? 0 : (stage >= 4 ? 0 : 1),
            transform:  stage >= 4 && !prefersReduced ? 'translateY(-20px) scale(0.95)' : 'none',
            transition: stage >= 4 ? `opacity ${dur(400)} ${easeDefault}, transform ${dur(400)} ${easeDefault}` : 'none',
          }}>
            <p style={{
              fontSize:      11,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color:         SILT.fgMuted,
              marginBottom:  8,
            }}>
              Recipe
            </p>
            <h2 style={{
              fontFamily:    MONO,
              fontWeight:    400,
              fontSize:      'clamp(22px, 3vw, 36px)',
              letterSpacing: '-0.02em',
              lineHeight:    1.2,
              marginBottom:  4,
            }}>
              Brown Butter Roast Chicken Thighs
              <br />
              <span style={{ color: SILT.fgMuted }}>with Preserved Lemon</span>
            </h2>
            <p style={{ fontSize: 13, color: SILT.fgMuted, marginTop: 8 }}>
              45 min · Serves 4 · Intermediate
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: `1px solid ${SILT.border}`, margin: '28px 0' }} />

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 40 }}>

            {/* Ingredients — exits LEFT on stage 2 */}
            <div style={{
              opacity:    stage >= 2 && !prefersReduced ? 0 : 1,
              transform:  stage >= 2 && !prefersReduced ? 'translateX(-30px)' : 'none',
              transition: stage >= 2 ? `opacity ${dur(400)} ${easeDefault}, transform ${dur(400)} ${easeDefault}` : 'none',
            }}>
              <p style={{
                fontSize:      11,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color:         SILT.fgMuted,
                marginBottom:  16,
              }}>
                Ingredients
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {INGREDIENTS.map((ing, i) => (
                  <li key={i} style={{ fontSize: 14, color: SILT.fgMuted, lineHeight: 1.5 }}>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Method — exits RIGHT on stage 3 */}
            <div style={{
              opacity:    stage >= 3 && !prefersReduced ? 0 : 1,
              transform:  stage >= 3 && !prefersReduced ? 'translateX(30px)' : 'none',
              transition: stage >= 3 ? `opacity ${dur(400)} ${easeDefault}, transform ${dur(400)} ${easeDefault}` : 'none',
            }}>
              <p style={{
                fontSize:      11,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color:         SILT.fgMuted,
                marginBottom:  16,
              }}>
                Method
              </p>
              <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {RECIPE_STEPS.map((step, i) => (
                  <li
                    key={step.n}
                    ref={el => { stepRefs.current[i] = el }}
                    style={{
                      display:    'grid',
                      gridTemplateColumns: '24px 1fr',
                      gap:        12,
                      alignItems: 'start',
                      background: i === activeBrowseStepIdx ? SILT.surface : 'transparent',
                      padding:    i === activeBrowseStepIdx ? '10px 12px' : '0',
                      margin:     i === activeBrowseStepIdx ? '-10px -12px' : '0',
                      transition: `background 300ms ${easeDefault}`,
                    }}
                  >
                    <span style={{
                      fontSize:      11,
                      color:         i === activeBrowseStepIdx ? SILT.accent : SILT.fgMuted,
                      letterSpacing: '0.05em',
                      paddingTop:    3,
                      fontWeight:    i === activeBrowseStepIdx ? 600 : 400,
                      transition:    `color 300ms ${easeDefault}`,
                    }}>
                      {step.n}
                    </span>
                    <p style={{
                      fontSize:   15,
                      lineHeight: 1.65,
                      color:      i === activeBrowseStepIdx ? SILT.fg : SILT.fgMuted,
                      transition: `color 300ms ${easeDefault}`,
                    }}>
                      {step.text}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Cook → button */}
        <button
          onClick={enterCookMode}
          style={{
            position:      'absolute',
            bottom:        32,
            right:         40,
            fontFamily:    MONO,
            fontSize:      13,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            background:    'transparent',
            border:        `1px solid ${SILT.fg}`,
            color:         SILT.fg,
            padding:       '10px 20px',
            cursor:        'pointer',
            borderRadius:  0,
            transition:    `background 200ms ${easeDefault}, color 200ms ${easeDefault}`,
          }}
          onMouseEnter={e => {
            const t = e.currentTarget
            t.style.background = SILT.fg
            t.style.color = SILT.bg
          }}
          onMouseLeave={e => {
            const t = e.currentTarget
            t.style.background = 'transparent'
            t.style.color = SILT.fg
          }}
        >
          Cook →
        </button>
      </div>

      {/* ── COOK MODE ───────────────────────────────────────────────────── */}
      <div
        aria-hidden={mode === 'browse'}
        style={{
          position:      'absolute',
          inset:         0,
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          justifyContent:'center',
          padding:       '64px 40px',
          opacity:       mode === 'cook' && stage >= 5 ? 1 : 0,
          pointerEvents: mode === 'cook' ? 'auto' : 'none',
          transition:    prefersReduced
            ? `opacity 300ms ${easeDefault}`
            : `opacity 200ms ${easeDefault}`,
        }}
      >
        {/* Step counter — Stage 1: appears first */}
        <div style={{
          fontFamily:    MONO,
          fontSize:      12,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color:         SILT.accent,
          marginBottom:  32,
          opacity:       stage >= 1 ? 1 : 0,
          transform:     stage >= 6 ? 'translateY(0)' : 'translateY(-8px)',
          transition:    stage >= 6
            ? `opacity ${dur(100)} ${easeDefault}, transform ${dur(100)} ${easeDefault}`
            : stage >= 1
              ? `opacity ${dur(200)} ${easeDefault}`
              : 'none',
        }}>
          {getStepLabel(cookPos)}
        </div>

        {/* Step text — Stage 5: THE moment — FLIP grow from source */}
        <div
          ref={cookTextRef}
          style={{
            fontFamily:    MONO,
            fontWeight:    400,
            fontSize:      'clamp(28px, 4.4vw, 52px)',
            letterSpacing: '-0.02em',
            lineHeight:    1.2,
            textAlign:     'center',
            maxWidth:      '16ch',
            color:         SILT.fg,
            opacity:       stage >= 5 ? 1 : 0,
            transform:     stage >= 5 && !prefersReduced
              ? 'scale(1)'
              : prefersReduced ? 'none' : 'scale(0.85)',
            transition:    stage >= 5
              ? prefersReduced
                ? `opacity 300ms ${easeDefault}`
                : `opacity ${dur(400)} ${easeDefault}, transform ${dur(400)} ${easeSnap}`
              : 'none',
          }}
        >
          {getStepText(cookPos)}
        </div>

        {/* Nav controls */}
        <div style={{
          display:    'flex',
          gap:        24,
          marginTop:  48,
          opacity:    stage >= 6 ? 1 : 0,
          transition: `opacity ${dur(200)} ${easeDefault}`,
        }}>
          <button
            onClick={handlePrev}
            disabled={prevCookPos(cookPos) === null}
            style={{
              fontFamily:    MONO,
              fontSize:      13,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background:    'transparent',
              border:        `1px solid ${SILT.border}`,
              color:         prevCookPos(cookPos) === null ? SILT.border : SILT.fgMuted,
              padding:       '10px 24px',
              cursor:        prevCookPos(cookPos) === null ? 'default' : 'pointer',
              borderRadius:  0,
              transition:    `color 200ms ${easeDefault}, border-color 200ms ${easeDefault}`,
            }}
            onMouseEnter={e => {
              if (prevCookPos(cookPos) !== null) {
                e.currentTarget.style.color = SILT.fg
                e.currentTarget.style.borderColor = SILT.fg
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = prevCookPos(cookPos) === null ? SILT.border : SILT.fgMuted
              e.currentTarget.style.borderColor = SILT.border
            }}
          >
            ← Prev
          </button>

          <button
            onClick={handleNext}
            disabled={nextCookPos(cookPos) === null}
            style={{
              fontFamily:    MONO,
              fontSize:      13,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background:    nextCookPos(cookPos) === null ? 'transparent' : SILT.accent,
              border:        `1px solid ${nextCookPos(cookPos) === null ? SILT.border : SILT.accent}`,
              color:         nextCookPos(cookPos) === null ? SILT.border : SILT.bg,
              padding:       '10px 24px',
              cursor:        nextCookPos(cookPos) === null ? 'default' : 'pointer',
              borderRadius:  0,
              transition:    `opacity 200ms ${easeDefault}`,
            }}
            onMouseEnter={e => {
              if (nextCookPos(cookPos) !== null) e.currentTarget.style.opacity = '0.8'
            }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            Next →
          </button>
        </div>

        {/* ← Back to recipe */}
        <button
          onClick={exitCookMode}
          style={{
            position:      'absolute',
            top:           32,
            left:          40,
            fontFamily:    MONO,
            fontSize:      12,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background:    'transparent',
            border:        'none',
            color:         SILT.fgMuted,
            cursor:        'pointer',
            padding:       0,
            opacity:       stage >= 6 ? 1 : 0,
            transition:    `opacity ${dur(200)} ${easeDefault}, color 150ms ${easeDefault}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = SILT.fg }}
          onMouseLeave={e => { e.currentTarget.style.color = SILT.fgMuted }}
        >
          ← Back to recipe
        </button>
      </div>

      {/* Reduced-motion crossfade overlay */}
      {prefersReduced && (
        <div style={{
          position:      'absolute',
          inset:         0,
          background:    SILT.bg,
          opacity:       transitioning ? 1 : 0,
          pointerEvents: 'none',
          transition:    `opacity 150ms ${easeDefault}`,
        }} />
      )}
    </div>
  )
}
