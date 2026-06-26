'use client'

import { useState, useEffect, useRef } from 'react'
import { T } from './tokens'
import { HeroPolaroids } from './HeroPolaroids'

const META = [
  { label: 'Role',    value: 'Design + front-end build' },
  { label: 'Origin',  value: '2 yrs · counter + drive-thru' },
  { label: 'Type',    value: 'Concept · built on weekends' },
  { label: 'Surface', value: 'iPad · cashier terminal' },
  { label: 'Year',    value: '2026' },
] as const

const SCENE_LABELS = ['01 · pressure', '02 · the problem', '03 · the build'] as const

// ── Scene 0: live 40s pressure meter ──────────────────────────────────
function ScenePressure({ elapsed }: { elapsed: number }) {
  const pct    = Math.min(elapsed / 40, 1)
  const urgent = elapsed >= 28
  const danger = elapsed >= 37
  const numCol = danger ? T.color.red : urgent ? T.color.amber : T.color.ink
  const barCol = danger ? T.color.red : urgent ? T.color.amberDk : T.color.green

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '.9rem', flex: 1 }}>
      <div>
        <div style={{
          fontFamily:         T.font.mono,
          fontWeight:         700,
          fontSize:           'clamp(4rem,7.5vw,6rem)',
          lineHeight:         1,
          color:              numCol,
          transition:         `color .5s cubic-bezier(.65,0,.35,1)`,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {String(elapsed).padStart(2, '0')}
          <span style={{ fontSize: '.38em', color: T.color.muted, fontWeight: 400, marginLeft: '.2em' }}>s</span>
        </div>
        <div style={{ height: 5, background: T.alpha.line, borderRadius: 999, marginTop: '1rem', overflow: 'hidden' }}>
          <div style={{
            height:       '100%',
            width:        `${pct * 100}%`,
            background:   barCol,
            borderRadius: 999,
            transition:   `width 1s cubic-bezier(.65,0,.35,1), background .5s cubic-bezier(.65,0,.35,1)`,
          }} />
        </div>
      </div>
      <div>
        <p style={{
          fontFamily: T.font.mono, fontSize: '.7rem', letterSpacing: '.14em',
          textTransform: 'uppercase', color: danger ? T.color.red : T.color.muted, margin: 0,
          transition: `color .4s cubic-bezier(.65,0,.35,1)`,
        }}>
          {danger ? '⚠ target exceeded' : urgent ? '↑ approaching limit' : '● live · avg order window'}
        </p>
        <p style={{ fontSize: '.92rem', color: T.color.inkSoft, marginTop: '.5rem', lineHeight: 1.55 }}>
          The cashier has{' '}
          <b style={{ color: numCol, transition: `color .5s cubic-bezier(.65,0,.35,1)` }}>
            {Math.max(0, 40 - elapsed)}s
          </b>{' '}
          left. The drive-thru queue is not waiting.
        </p>
      </div>
    </div>
  )
}

// ── Scene 1: the problem ───────────────────────────────────────────────
function SceneProblem() {
  const rows = [
    { action: 'Order a Double-Double', old: '12 taps',       fix: '1 tap'   },
    { action: 'Add oat milk',          old: '4 sub-menus',   fix: '1 chip'  },
    { action: 'Fix a wrong item',      old: 'void + restart',fix: 'qty −'   },
    { action: 'Custom blend coffee',   old: 'not possible',  fix: '3 taps'  },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '.85rem', flex: 1 }}>
      <div>
        <p style={{ fontFamily: T.font.mono, fontSize: '.7rem', letterSpacing: '.14em', textTransform: 'uppercase', color: T.color.muted }}>
          The system I had to use
        </p>
        <p style={{ fontFamily: T.font.display, fontWeight: 700, fontSize: '1.05rem', color: T.color.ink, marginTop: '.3rem', lineHeight: 1.25 }}>
          Every common action was buried.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
        {rows.map(r => (
          <div key={r.action} style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto',
            alignItems: 'center', gap: '.5rem',
            padding: '.4rem .65rem', background: T.alpha.ink06, borderRadius: 9,
          }}>
            <span style={{ fontSize: '.84rem', color: T.color.inkSoft }}>{r.action}</span>
            <span style={{ fontFamily: T.font.mono, fontSize: '.68rem', color: T.color.red, textDecoration: 'line-through', opacity: .75 }}>{r.old}</span>
            <span style={{ fontFamily: T.font.mono, fontSize: '.68rem', color: T.color.green, fontWeight: 700 }}>{r.fix}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Scene 2: the build ─────────────────────────────────────────────────
function SceneBuild() {
  const stats = [
    { num: '1',   unit: 'tap',     desc: 'add any food item'          },
    { num: '3',   unit: 'taps',    desc: 'fully customise a coffee'   },
    { num: '0',   unit: 'lookups', desc: 'all items visible at once'  },
    { num: '40s', unit: 'target',  desc: 'order · customise · pay'    },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '.85rem', flex: 1 }}>
      <div>
        <p style={{ fontFamily: T.font.mono, fontSize: '.7rem', letterSpacing: '.14em', textTransform: 'uppercase', color: T.color.muted }}>
          What I shipped
        </p>
        <p style={{ fontFamily: T.font.display, fontWeight: 700, fontSize: '1.05rem', color: T.color.ink, marginTop: '.3rem', lineHeight: 1.25 }}>
          Speed as the design constraint.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.45rem' }}>
        {stats.map(s => (
          <div key={s.desc} style={{ background: T.alpha.ink06, borderRadius: 12, padding: '.65rem .75rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '.25em' }}>
              <span style={{ fontFamily: T.font.mono, fontWeight: 700, fontSize: '1.55rem', color: T.color.red }}>{s.num}</span>
              <span style={{ fontFamily: T.font.mono, fontSize: '.65rem', color: T.color.muted }}>{s.unit}</span>
            </div>
            <p style={{ fontSize: '.78rem', color: T.color.inkSoft, marginTop: '.15rem', lineHeight: 1.35 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main hero ──────────────────────────────────────────────────────────
export function TimsHero() {
  const [elapsed, setElapsed] = useState(0)
  const [reduced, setReduced] = useState(false)
  const reducedRef            = useRef(false)

  useEffect(() => {
    const v = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    reducedRef.current = v
    setReduced(v)
  }, [])

  // Live 40s loop — drives the heading number colour
  useEffect(() => {
    if (reducedRef.current) return
    const id = setInterval(() => setElapsed(e => e >= 40 ? 0 : e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining    = 40 - elapsed
  const headingColor = elapsed >= 37 ? T.color.red
                     : elapsed >= 28 ? T.color.amber
                     : T.color.red

  return (
    <header
      id="hero"
      style={{ padding: 'clamp(8rem,17vw,13rem) 0 clamp(3rem,7vw,6rem)', fontFamily: T.font.sans }}
    >
      <div className="tims-wrap">

        {/* ── TOP ROW: 70/30 heading | card ─────────────────────── */}
        <div className="tims-hero-grid" style={{
          display:             'grid',
          gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)',
          gap:                 'clamp(2rem,4vw,4rem)',
          alignItems:          'start',
        }}>

          {/* LEFT: label + headline only */}
          <div className="tims-reveal">
            <span className="tims-label">Built for fun · by a former Tims employee</span>

            <h1 style={{
              fontFamily:    T.font.display,
              fontWeight:    700,
              fontSize:      T.size.hero,
              letterSpacing: '-.02em',
              lineHeight:    1.03,
              marginBottom:  0,
              color:         T.color.ink,
            }}>
              {/* The number IS the live countdown */}
              <em
                style={{
                  fontStyle:          'normal',
                  color:              headingColor,
                  fontVariantNumeric: 'tabular-nums',
                  display:            'inline-block',
                  minWidth:           '2.1ch',
                  transition:         `color .5s cubic-bezier(.65,0,.35,1)`,
                }}
                aria-live="polite"
                aria-label={`${remaining} seconds`}
              >
                {reduced ? '40' : remaining}
              </em>
              <span style={{ color: T.color.ink }}> seconds.</span>
              <span style={{
                display:       'block',
                fontSize:      'clamp(1.1rem,2.4vw,1.7rem)',
                fontWeight:    500,
                color:         T.color.inkSoft,
                letterSpacing: '-.01em',
                marginTop:     '1.1rem',
                maxWidth:      '28ch',
              }}>
                I spent two years behind a Tim Hortons counter. Then I redesigned the POS I had to use at 5&nbsp;a.m.
              </span>
            </h1>
          </div>

          {/* ── RIGHT: polaroid deck — no background, floats on page ── */}
          <div
            className="tims-reveal"
            style={{
              position:       'relative',
              minHeight:      360,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              overflow:       'visible',
            }}
          >
            <HeroPolaroids />
          </div>

        </div>{/* end top 2-col grid */}

        {/* ── BOTTOM: full-width paragraph + meta ──────────────── */}
        <div className="tims-reveal" style={{ marginTop: 'clamp(2rem,4vw,3rem)' }}>
          <p style={{ fontSize: '1.15rem', color: T.color.inkSoft, maxWidth: '60ch', lineHeight: 1.65 }}>
            Forty seconds is roughly how long a Tims order takes — I know, because I was the one getting timed.
            This is a weekend concept: take everything the drive-thru taught me, and build the point-of-sale terminal I always wished I&apos;d had.
          </p>

          <div style={{
            display:    'flex',
            flexWrap:   'wrap',
            gap:        '2.4rem',
            marginTop:  '2.8rem',
            paddingTop: '1.8rem',
            borderTop:  `1px solid ${T.alpha.line}`,
          }}>
            {META.map(({ label, value }) => (
              <div key={label}>
                <b style={{ display: 'block', fontFamily: T.font.mono, fontSize: '.75rem', letterSpacing: '.16em', textTransform: 'uppercase', color: T.color.muted, marginBottom: '.4rem', fontWeight: 400 }}>
                  {label}
                </b>
                <span style={{ fontFamily: T.font.display, fontWeight: 500, fontSize: '1.02rem', color: T.color.ink }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </header>
  )
}
