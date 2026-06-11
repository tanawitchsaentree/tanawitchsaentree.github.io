'use client'

import { useState, useEffect, useRef } from 'react'

// ── Stellareat palette ────────────────────────────────────────────────────────
const C = {
  bg:      '#FFF8E7',
  fg:      '#1F1B16',
  fgMuted: '#7A7060',
  accent:  '#5C6B3A',
  red:     '#D64545',
  green:   '#87A96B',
  border:  '#E8DFC8',
} as const

// ── Design tokens ─────────────────────────────────────────────────────────────
const EASE_GENTLE  = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_DEFAULT = 'cubic-bezier(0.65, 0, 0.35, 1)'
const MONO_FAMILY  = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace"

// ── Types ─────────────────────────────────────────────────────────────────────

type DiffKind = 'base' | 'removed' | 'added' | 'changed'

interface DiffToken {
  kind:         DiffKind
  text:         string
  replacement?: string  // only for 'changed'
}

interface IngredientLine {
  id:     string
  tokens: DiffToken[]
}

interface StepLine {
  n:      number
  tokens: DiffToken[]
}

interface Cook {
  handle:       string
  name:         string
  location:     string
  note:         string
  changedCount: number
  ingredients:  IngredientLine[]
  steps:        StepLine[]
}

// ── Base recipe ───────────────────────────────────────────────────────────────

const BASE_INGREDIENTS: IngredientLine[] = [
  { id: 'i1', tokens: [{ kind: 'base', text: '4 bone-in, skin-on chicken thighs' }] },
  { id: 'i2', tokens: [{ kind: 'base', text: 'Flaky sea salt + black pepper' }] },
  { id: 'i3', tokens: [{ kind: 'base', text: '2 tbsp neutral oil' }] },
  { id: 'i4', tokens: [{ kind: 'base', text: '4 garlic cloves, unpeeled' }] },
  { id: 'i5', tokens: [{ kind: 'base', text: '4 thyme sprigs' }] },
  { id: 'i6', tokens: [{ kind: 'base', text: '1 preserved lemon, rind only' }] },
  { id: 'i7', tokens: [{ kind: 'base', text: '2 tbsp unsalted butter' }] },
]

// ── Cooks data ────────────────────────────────────────────────────────────────

const COOKS: Cook[] = [
  // ── Cook 1: Marta, Helsinki ─────────────────────────────────────────────────
  {
    handle:       '@marta.cooks',
    name:         'Marta',
    location:     'Helsinki',
    note:         "I don't have preserved lemon so I use 2 tsp capers + lemon zest",
    changedCount: 4,
    ingredients: [
      { id: 'i1', tokens: [{ kind: 'base', text: '4 bone-in, skin-on chicken thighs' }] },
      { id: 'i2', tokens: [
        { kind: 'base', text: 'Flaky sea salt + black pepper' },
        { kind: 'added', text: ' + 1 tsp smoked paprika' },
      ]},
      { id: 'i3', tokens: [{ kind: 'base', text: '2 tbsp neutral oil' }] },
      { id: 'i4', tokens: [{ kind: 'base', text: '4 garlic cloves, unpeeled' }] },
      { id: 'i5', tokens: [{ kind: 'changed', text: '4 thyme sprigs', replacement: '2 rosemary sprigs + 1 tsp dried oregano' }] },
      { id: 'i6', tokens: [{ kind: 'changed', text: '1 preserved lemon, rind only', replacement: '2 tsp capers + lemon zest' }] },
      { id: 'i7', tokens: [{ kind: 'base', text: '2 tbsp unsalted butter' }] },
    ],
    steps: [
      {
        n: 1,
        tokens: [
          { kind: 'base', text: 'Pat chicken thighs completely dry. Season aggressively with salt and pepper' },
          { kind: 'added', text: ' and smoked paprika' },
          { kind: 'base', text: ' on both sides.' },
        ],
      },
      {
        n: 2,
        tokens: [
          { kind: 'base', text: "Heat neutral oil in a heavy skillet over medium-high. Lay chicken skin-side down. Don't move it for " },
          { kind: 'changed', text: '8 minutes', replacement: '12 minutes' },
          { kind: 'base', text: ', until skin is deeply golden.' },
        ],
      },
      { n: 3, tokens: [{ kind: 'base', text: 'Flip chicken and cook flesh-side down for 4 more minutes. Transfer to a plate.' }] },
      {
        n: 4,
        tokens: [
          { kind: 'base', text: 'Reduce heat to medium. Add garlic cloves and ' },
          { kind: 'changed', text: 'thyme sprigs', replacement: 'rosemary sprigs and oregano' },
          { kind: 'base', text: ' to the pan. Toss in ' },
          { kind: 'changed', text: 'preserved lemon rind', replacement: 'capers + lemon zest' },
          { kind: 'base', text: '. Spoon the brown butter over the chicken.' },
        ],
      },
      { n: 5, tokens: [{ kind: 'base', text: 'Return chicken skin-side up. Baste continuously for 2 minutes until butter is nutty and fragrant.' }] },
      { n: 6, tokens: [{ kind: 'base', text: 'Rest 5 minutes off heat. The carry-over matters here.' }] },
      { n: 7, tokens: [{ kind: 'base', text: 'Plate with pan juices and a final squeeze of preserved lemon.' }] },
    ],
  },

  // ── Cook 2: James, Toronto ─────────────────────────────────────────────────
  {
    handle:       '@james.kitchen',
    name:         'James',
    location:     'Toronto',
    note:         'Fish sauce gives the same umami hit as preserved lemon but I always have it',
    changedCount: 4,
    ingredients: [
      { id: 'i1', tokens: [{ kind: 'base', text: '4 bone-in, skin-on chicken thighs' }] },
      { id: 'i2', tokens: [{ kind: 'base', text: 'Flaky sea salt + black pepper' }] },
      { id: 'i3', tokens: [{ kind: 'base', text: '2 tbsp neutral oil' }] },
      { id: 'i4', tokens: [{ kind: 'changed', text: '4 garlic cloves, unpeeled', replacement: '3 shallots, halved' }] },
      { id: 'i5', tokens: [{ kind: 'base', text: '4 thyme sprigs' }] },
      { id: 'i6', tokens: [{ kind: 'changed', text: '1 preserved lemon, rind only', replacement: 'fresh lemon + 1 tbsp fish sauce' }] },
      { id: 'i7', tokens: [{ kind: 'base', text: '2 tbsp unsalted butter' }] },
    ],
    steps: [
      { n: 1, tokens: [{ kind: 'base', text: 'Pat chicken thighs completely dry. Season aggressively with salt and pepper on both sides.' }] },
      { n: 2, tokens: [{ kind: 'base', text: "Heat neutral oil in a heavy skillet over medium-high. Lay chicken skin-side down. Don't move it for 8 minutes, until skin is deeply golden." }] },
      { n: 3, tokens: [{ kind: 'base', text: 'Flip chicken and cook flesh-side down for 4 more minutes. Transfer to a plate.' }] },
      {
        n: 4,
        tokens: [
          { kind: 'base', text: 'Reduce heat to medium. Add ' },
          { kind: 'changed', text: 'garlic cloves', replacement: 'shallots' },
          { kind: 'base', text: ' and thyme sprigs to the pan. Toss in ' },
          { kind: 'changed', text: 'preserved lemon rind', replacement: 'fresh lemon squeeze + fish sauce' },
          { kind: 'base', text: '. Spoon the brown butter over the chicken.' },
        ],
      },
      { n: 5, tokens: [{ kind: 'base', text: 'Return chicken skin-side up. Baste continuously for 2 minutes until butter is nutty and fragrant.' }] },
      {
        n: 6,
        tokens: [
          { kind: 'base', text: 'Rest ' },
          { kind: 'changed', text: '5 minutes', replacement: '8 minutes' },
          { kind: 'base', text: ' off heat. The carry-over matters here.' },
        ],
      },
      { n: 7, tokens: [{ kind: 'base', text: 'Plate with pan juices and a final squeeze of preserved lemon.' }] },
    ],
  },

  // ── Cook 3: Nadia, Bangkok ─────────────────────────────────────────────────
  {
    handle:       '@nadia_eats',
    name:         'Nadia',
    location:     'Bangkok',
    note:         'Thai spin — the coconut cream makes it slightly sweet which balances the lemon',
    changedCount: 4,
    ingredients: [
      { id: 'i1', tokens: [{ kind: 'base', text: '4 bone-in, skin-on chicken thighs' }] },
      { id: 'i2', tokens: [{ kind: 'base', text: 'Flaky sea salt + black pepper' }] },
      { id: 'i3', tokens: [{ kind: 'base', text: '2 tbsp neutral oil' }] },
      { id: 'i4', tokens: [{ kind: 'base', text: '4 garlic cloves, unpeeled' }] },
      { id: 'i5', tokens: [{ kind: 'base', text: '4 thyme sprigs' }] },
      { id: 'i6', tokens: [{ kind: 'base', text: '1 preserved lemon, rind only' }] },
      { id: 'i7', tokens: [{ kind: 'base', text: '2 tbsp unsalted butter' }] },
      { id: 'i8', tokens: [{ kind: 'added', text: '2 lemongrass stalks, bruised' }] },
      { id: 'i9', tokens: [{ kind: 'added', text: '1 tbsp oyster sauce' }] },
    ],
    steps: [
      { n: 1, tokens: [{ kind: 'base', text: 'Pat chicken thighs completely dry. Season aggressively with salt and pepper on both sides.' }] },
      {
        n: 2,
        tokens: [
          { kind: 'base', text: 'Heat neutral oil in a heavy skillet over medium-high. ' },
          { kind: 'added', text: 'Brush chicken with oyster sauce. ' },
          { kind: 'base', text: "Lay chicken skin-side down. Don't move it for 8 minutes, until skin is deeply golden." },
        ],
      },
      { n: 3, tokens: [{ kind: 'base', text: 'Flip chicken and cook flesh-side down for 4 more minutes. Transfer to a plate.' }] },
      {
        n: 4,
        tokens: [
          { kind: 'base', text: 'Reduce heat to medium. Add garlic cloves and thyme sprigs' },
          { kind: 'added', text: ' and lemongrass stalks' },
          { kind: 'base', text: ' to the pan. Toss in preserved lemon rind. Spoon the brown butter over the chicken.' },
        ],
      },
      {
        n: 5,
        tokens: [
          { kind: 'base', text: 'Return chicken skin-side up. ' },
          { kind: 'added', text: 'Add 2 tbsp coconut cream to the basting butter. ' },
          { kind: 'base', text: 'Baste continuously for 2 minutes until butter is nutty and fragrant.' },
        ],
      },
      { n: 6, tokens: [{ kind: 'base', text: 'Rest 5 minutes off heat. The carry-over matters here.' }] },
      { n: 7, tokens: [{ kind: 'base', text: 'Plate with pan juices and a final squeeze of preserved lemon.' }] },
    ],
  },

  // ── Cook 4: Tom, London ────────────────────────────────────────────────────
  {
    handle:       '@tom_food',
    name:         'Tom',
    location:     'London',
    note:         "I didn't change the recipe. I changed how seriously I took it.",
    changedCount: 3,
    ingredients: BASE_INGREDIENTS,
    steps: [
      { n: 1, tokens: [{ kind: 'base', text: 'Pat chicken thighs completely dry. Season aggressively with salt and pepper on both sides.' }] },
      {
        n: 2,
        tokens: [
          { kind: 'base', text: "Heat neutral oil in a heavy skillet over medium-high. Lay chicken skin-side down. Don't move it for " },
          { kind: 'changed', text: '8 minutes', replacement: '10 minutes. The patience is the technique.' },
          { kind: 'base', text: ' Until skin is deeply golden.' },
        ],
      },
      { n: 3, tokens: [{ kind: 'base', text: 'Flip chicken and cook flesh-side down for 4 more minutes. Transfer to a plate.' }] },
      { n: 4, tokens: [{ kind: 'base', text: 'Reduce heat to medium. Add garlic cloves and thyme sprigs to the pan. Toss in preserved lemon rind. Spoon the brown butter over the chicken.' }] },
      {
        n: 5,
        tokens: [
          { kind: 'base', text: 'Return chicken skin-side up. Baste continuously for ' },
          { kind: 'changed', text: '2 minutes', replacement: '4 minutes. Brown butter should be very dark.' },
          { kind: 'base', text: ' Until butter is nutty and fragrant.' },
        ],
      },
      { n: 6, tokens: [{ kind: 'base', text: 'Rest 5 minutes off heat. The carry-over matters here.' }] },
      { n: 7, tokens: [{ kind: 'removed', text: 'Plate with pan juices and a final squeeze of preserved lemon.' }] },
    ],
  },
]

// ── Diff token renderer ───────────────────────────────────────────────────────

function DiffSpan({ token }: { token: DiffToken }) {
  switch (token.kind) {
    case 'base':
      return <span style={{ color: C.fgMuted }}>{token.text}</span>

    case 'removed':
      return (
        <span style={{
          color:               `${C.red}99`,
          textDecoration:      'line-through',
          textDecorationColor: `${C.red}66`,
        }}>
          {token.text}
        </span>
      )

    case 'added':
      return (
        <span style={{
          color:               C.green,
          textDecoration:      'underline',
          textDecorationColor: `${C.green}66`,
          textUnderlineOffset: '3px',
        }}>
          {token.text}
        </span>
      )

    case 'changed':
      return (
        <>
          <span style={{
            color:               `${C.red}99`,
            textDecoration:      'line-through',
            textDecorationColor: `${C.red}66`,
            marginRight:         4,
          }}>
            {token.text}
          </span>
          <span style={{
            color:               C.green,
            textDecoration:      'underline',
            textDecorationColor: `${C.green}66`,
            textUnderlineOffset: '3px',
          }}>
            {token.replacement}
          </span>
        </>
      )

    default:
      return null
  }
}

// ── Recipe content with animated fade ────────────────────────────────────────

function RecipeContent({ cook, visible }: { cook: Cook; visible: boolean }) {
  return (
    <div
      style={{
        opacity:       visible ? 1 : 0,
        transition:    `opacity 200ms ${EASE_GENTLE}`,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Ingredients */}
      <section style={{ marginBottom: 32 }}>
        <p style={{
          fontSize:      11,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color:         C.fgMuted,
          marginBottom:  12,
          fontFamily:    MONO_FAMILY,
        }}>
          Ingredients
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cook.ingredients.map(ing => (
            <li
              key={ing.id}
              style={{
                fontSize:   15,
                lineHeight: 1.55,
                fontFamily: MONO_FAMILY,
                display:    'flex',
                alignItems: 'baseline',
                gap:        8,
              }}
            >
              <span style={{ color: `${C.fgMuted}55`, fontSize: 10, flexShrink: 0 }}>—</span>
              <span>
                {ing.tokens.map((t, ti) => <DiffSpan key={ti} token={t} />)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Method */}
      <section>
        <p style={{
          fontSize:      11,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color:         C.fgMuted,
          marginBottom:  12,
          fontFamily:    MONO_FAMILY,
        }}>
          Method
        </p>
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {cook.steps.map(step => {
            const hasChange = step.tokens.some(t => t.kind !== 'base')
            return (
              <li
                key={step.n}
                style={{
                  display:             'grid',
                  gridTemplateColumns: '20px 1fr',
                  gap:                 12,
                  alignItems:          'start',
                }}
              >
                <span style={{
                  fontSize:      11,
                  letterSpacing: '0.05em',
                  color:         hasChange ? C.accent : `${C.fgMuted}66`,
                  paddingTop:    3,
                  fontFamily:    MONO_FAMILY,
                  fontWeight:    hasChange ? 600 : 400,
                  transition:    `color 180ms ${EASE_DEFAULT}`,
                }}>
                  {step.n}
                </span>
                <p style={{
                  fontSize:   15,
                  lineHeight: 1.65,
                  margin:     0,
                  fontFamily: MONO_FAMILY,
                }}>
                  {step.tokens.map((t, ti) => <DiffSpan key={ti} token={t} />)}
                </p>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

// ── Diff legend ───────────────────────────────────────────────────────────────

const LEGEND_ITEMS = [
  { label: 'unchanged', color: C.fgMuted,    decoration: 'none'         },
  { label: 'removed',   color: `${C.red}99`, decoration: 'line-through' },
  { label: 'added',     color: C.green,      decoration: 'underline'    },
] as const

function DiffLegend() {
  return (
    <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
      {LEGEND_ITEMS.map(item => (
        <span
          key={item.label}
          style={{
            fontSize:            11,
            letterSpacing:       '0.1em',
            textTransform:       'uppercase',
            color:               item.color,
            textDecoration:      item.decoration,
            textDecorationColor: item.color,
            textUnderlineOffset: '3px',
            fontFamily:          MONO_FAMILY,
          }}
        >
          {item.label}
        </span>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CommunityOwnership() {
  const [activeCook, setActiveCook] = useState(0)
  const [visible,    setVisible]    = useState(true)
  const [seenCount,  setSeenCount]  = useState(1)
  const pendingCookRef = useRef<number | null>(null)

  // Derived: question appears once 2 distinct cooks have been visited
  const questionVisible = seenCount >= 2

  // Cross-fade logic: fade out → swap content → fade in
  function goToCook(idx: number) {
    if (idx === activeCook || idx < 0 || idx >= COOKS.length) return
    setVisible(false)
    pendingCookRef.current = idx
  }

  useEffect(() => {
    if (!visible && pendingCookRef.current !== null) {
      const timer = setTimeout(() => {
        const next = pendingCookRef.current!
        setActiveCook(next)
        setSeenCount(prev => Math.max(prev, next + 1))
        pendingCookRef.current = null
        setVisible(true)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [visible])

  const cook = COOKS[activeCook]

  return (
    <div
      style={{
        background: C.bg,
        color:      C.fg,
        fontFamily: MONO_FAMILY,
        border:     `1px solid ${C.border}`,
        minHeight:  '80vh',
      }}
    >
      {/* ── Cook navigation tabs ──────────────────────────────────────── */}
      <nav
        aria-label="Cook versions"
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding:      '0 32px',
          display:      'flex',
          alignItems:   'center',
          overflowX:    'auto',
        }}
      >
        <span style={{
          fontSize:      11,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color:         C.fgMuted,
          marginRight:   24,
          whiteSpace:    'nowrap',
          flexShrink:    0,
        }}>
          Versions
        </span>

        {COOKS.map((c, i) => {
          const isActive = i === activeCook
          return (
            <button
              key={c.handle}
              onClick={() => goToCook(i)}
              aria-current={isActive ? 'true' : undefined}
              style={{
                fontFamily:    MONO_FAMILY,
                fontSize:      12,
                letterSpacing: '0.05em',
                background:    'transparent',
                border:        'none',
                borderBottom:  isActive
                  ? `2px solid ${C.fg}`
                  : '2px solid transparent',
                color:         isActive ? C.fg : C.fgMuted,
                padding:       '16px 16px 14px',
                cursor:        'pointer',
                whiteSpace:    'nowrap',
                transition:    `color 180ms ${EASE_DEFAULT}, border-color 180ms ${EASE_DEFAULT}`,
                outline:       'none',
              }}
            >
              {c.handle}
            </button>
          )
        })}

        {/* Arrow buttons */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, paddingLeft: 16, flexShrink: 0 }}>
          {([
            { arrow: '←', delta: -1, label: 'Previous version' },
            { arrow: '→', delta:  1, label: 'Next version'     },
          ] as const).map(({ arrow, delta, label }) => {
            const target   = activeCook + delta
            const disabled = target < 0 || target >= COOKS.length
            return (
              <button
                key={arrow}
                onClick={() => goToCook(target)}
                disabled={disabled}
                aria-label={label}
                style={{
                  fontFamily:     MONO_FAMILY,
                  fontSize:       14,
                  background:     'transparent',
                  border:         `1px solid ${disabled ? C.border : C.fgMuted}`,
                  color:          disabled ? C.border : C.fgMuted,
                  width:          32,
                  height:         32,
                  cursor:         disabled ? 'default' : 'pointer',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  transition:     `color 180ms ${EASE_DEFAULT}, border-color 180ms ${EASE_DEFAULT}`,
                  flexShrink:     0,
                }}
                onMouseEnter={e => {
                  if (!disabled) {
                    e.currentTarget.style.color       = C.fg
                    e.currentTarget.style.borderColor = C.fg
                  }
                }}
                onMouseLeave={e => {
                  if (!disabled) {
                    e.currentTarget.style.color       = C.fgMuted
                    e.currentTarget.style.borderColor = C.fgMuted
                  }
                }}
              >
                {arrow}
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── Two-column body ───────────────────────────────────────────── */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'clamp(200px, 38%, 320px) 1fr',
          minHeight:           'calc(80vh - 53px)',
        }}
      >
        {/* Left: cook profile ─────────────────────────────────────────── */}
        <aside
          style={{
            borderRight:   `1px solid ${C.border}`,
            padding:       '32px 28px',
            display:       'flex',
            flexDirection: 'column',
            gap:           20,
          }}
        >
          {/* Handle + location */}
          <div
            style={{
              opacity:    visible ? 1 : 0,
              transition: `opacity 200ms ${EASE_GENTLE}`,
            }}
          >
            <p style={{
              fontSize:      12,
              letterSpacing: '0.08em',
              color:         C.accent,
              fontWeight:    500,
              marginBottom:  4,
              fontFamily:    MONO_FAMILY,
            }}>
              {cook.handle}
            </p>
            <p style={{
              fontSize:      11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color:         C.fgMuted,
              fontFamily:    MONO_FAMILY,
            }}>
              {cook.location}
            </p>
          </div>

          {/* Their note */}
          <div
            style={{
              opacity:    visible ? 1 : 0,
              transition: `opacity 200ms ${EASE_GENTLE} 40ms`,
            }}
          >
            <p style={{
              fontSize:      11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color:         C.fgMuted,
              marginBottom:  10,
              fontFamily:    MONO_FAMILY,
            }}>
              Their note
            </p>
            <p style={{
              fontFamily:  MONO_FAMILY,
              fontWeight:  400,
              fontSize:    16,
              lineHeight:  1.6,
              color:       C.fg,
              maxWidth:    '30ch',
            }}>
              &ldquo;{cook.note}&rdquo;
            </p>
          </div>

          {/* Changed count */}
          <div
            style={{
              opacity:    visible ? 1 : 0,
              transition: `opacity 200ms ${EASE_GENTLE} 60ms`,
              marginTop:  'auto',
              paddingTop: 16,
              borderTop:  `1px solid ${C.border}`,
            }}
          >
            <p style={{
              fontSize:      11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color:         C.fgMuted,
              fontFamily:    MONO_FAMILY,
            }}>
              Changed{' '}
              <span style={{ color: C.accent, fontWeight: 600 }}>
                {cook.changedCount}
              </span>
              {' '}thing{cook.changedCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Dot indicator */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {COOKS.map((_, i) => (
              <button
                key={i}
                onClick={() => goToCook(i)}
                aria-label={`Go to ${COOKS[i].name}'s version`}
                style={{
                  width:        i === activeCook ? 20 : 6,
                  height:       6,
                  borderRadius: 3,
                  background:   i === activeCook ? C.accent : C.border,
                  border:       'none',
                  cursor:       'pointer',
                  padding:      0,
                  transition:   `width 250ms ${EASE_GENTLE}, background 200ms ${EASE_DEFAULT}`,
                }}
              />
            ))}
          </div>
        </aside>

        {/* Right: recipe with diffs ──────────────────────────────────── */}
        <main style={{ padding: '32px 32px 48px', overflowY: 'auto' }}>
          {/* Title block */}
          <div style={{ marginBottom: 24 }}>
            <p style={{
              fontSize:      11,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color:         C.fgMuted,
              marginBottom:  6,
              fontFamily:    MONO_FAMILY,
            }}>
              Base recipe — diff view
            </p>
            <h2 style={{
              fontFamily:    MONO_FAMILY,
              fontWeight:    400,
              fontSize:      'clamp(19px, 2.4vw, 28px)',
              letterSpacing: '-0.02em',
              lineHeight:    1.2,
              color:         C.fg,
              margin:        0,
            }}>
              Brown Butter Roast Chicken Thighs
              <br />
              <span style={{ color: C.fgMuted, fontSize: '0.85em' }}>with Preserved Lemon</span>
            </h2>
          </div>

          <DiffLegend />

          <RecipeContent cook={cook} visible={visible} />

          {/* Thesis question — appears after 2 cooks seen */}
          <div
            aria-hidden={!questionVisible}
            style={{
              marginTop:  48,
              paddingTop: 32,
              borderTop:  `1px solid ${C.border}`,
              opacity:    questionVisible ? 1 : 0,
              transform:  questionVisible ? 'translateY(0)' : 'translateY(12px)',
              transition: `opacity 600ms ${EASE_GENTLE}, transform 600ms ${EASE_GENTLE}`,
              pointerEvents: questionVisible ? 'auto' : 'none',
            }}
          >
            <p style={{
              fontFamily:    MONO_FAMILY,
              fontWeight:    400,
              fontSize:      'clamp(16px, 2vw, 20px)',
              lineHeight:    1.5,
              color:         C.fgMuted,
              letterSpacing: '-0.02em',
              margin:        0,
            }}>
              Is this still the AI&rsquo;s recipe?
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
