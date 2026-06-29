'use client'

import { useState, useCallback } from 'react'
import { C } from './tokens'

type StepKey = 's1' | 's2' | 'cl' | 'ret'
type StepState = { cls: string; txt: string }

const INIT: Record<StepKey, StepState> = {
  s1:  { cls: 'open',  txt: 'open' },
  s2:  { cls: 'open',  txt: 'open' },
  cl:  { cls: 'open',  txt: 'open' },
  ret: { cls: 'muted', txt: '—'    },
}

const EASE = C.ease.spring

function StatusBadge({ cls, txt }: { cls: string; txt: string }) {
  const colorMap: Record<string, { color: string; bg: string; border: string }> = {
    open:        { color: C.color.txDim,  bg: 'transparent',      border: C.color.line2 },
    closing:     { color: C.color.warn,   bg: `color-mix(in srgb,${C.color.warn} 10%,transparent)`,  border: `color-mix(in srgb,${C.color.warn} 35%,transparent)` },
    closed:      { color: C.color.live,   bg: C.alpha.liveSoft,   border: `color-mix(in srgb,${C.color.live} 38%,transparent)` },
    'auto-closed':{ color: C.color.live,  bg: C.alpha.liveSoft,   border: `color-mix(in srgb,${C.color.live} 38%,transparent)` },
    date:        { color: C.color.live,   bg: C.alpha.liveSoft,   border: `color-mix(in srgb,${C.color.live} 38%,transparent)` },
    muted:       { color: C.color.txFaint,bg: 'transparent',      border: C.color.line2 },
  }
  const s = colorMap[cls] ?? colorMap.open
  return (
    <span style={{
      fontFamily: C.font.mono, fontSize: '.62rem', letterSpacing: '.03em',
      padding: '.22em .5em', borderRadius: 5, border: `1px solid ${s.border}`,
      color: s.color, background: s.bg, whiteSpace: 'nowrap', flexShrink: 0,
      transition: `color .3s ${EASE}, background .3s ${EASE}, border-color .3s ${EASE}`,
    }}>
      {cls === 'closed' || cls === 'auto-closed' || cls === 'date' ? '✓ ' : ''}{txt}
    </span>
  )
}

export function ClaimsShift() {
  const [steps, setSteps] = useState<Record<StepKey, StepState>>(INIT)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const reduce = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

  const set = useCallback((r: StepKey, cls: string, txt: string) => {
    setSteps(prev => ({ ...prev, [r]: { cls, txt } }))
  }, [])

  const reset = useCallback(() => {
    setSteps(INIT)
    setDone(false)
    setRunning(false)
  }, [])

  const run = useCallback(() => {
    if (running) return
    setRunning(true)
    const sequence: Array<() => void> = [
      () => set('s1', 'closing', 'closing'),
      () => set('s1', 'closed',  'closed'),
      () => set('s2', 'closed',  'closed'),
      () => set('cl', 'auto-closed', 'auto-closed'),
      () => set('ret','date',    'until 12 Mar 2036'),
      () => { setDone(true); setRunning(false) },
    ]
    if (reduce) { sequence.forEach(s => s()); return }
    sequence.forEach((s, i) => setTimeout(s, 320 + i * 430))
  }, [running, set, reduce])

  return (
    <section id="shift" style={{ padding: 'clamp(3.4rem,8vw,6.5rem) 0', borderTop: `1px solid ${C.color.line}` }}>
      <div className="claims-wrap">
        <div className="claims-animate" style={{ marginBottom: '2.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.1rem' }}>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.live }}>01</span>
            <span style={{ color: C.color.txFaint }}>/</span>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', letterSpacing: '.2em', textTransform: 'uppercase', color: C.color.txDim, marginLeft: '.4rem' }}>The shift</span>
          </div>
          <h2 style={{ fontFamily: C.font.display, fontWeight: 700, fontSize: 'clamp(1.7rem,3.8vw,2.8rem)', lineHeight: 1.08, letterSpacing: '-.02em', color: C.color.txHi, maxWidth: '20ch', margin: 0 }}>
            The requirement arrives as a ticket.{' '}
            <span style={{ color: C.color.live }}>It leaves as a feature.</span>
          </h2>
          <p style={{ fontSize: 'clamp(1rem,1.5vw,1.12rem)', color: C.color.tx, maxWidth: '60ch', marginTop: '1.1rem', lineHeight: 1.66 }}>
            Same day. What used to be a Figma hand-off is now the working feature — built straight from the ticket and verified against its acceptance criteria. Trigger the payment event on the right.
          </p>
        </div>

        {/* ticket → feature grid */}
        <div className="claims-animate claims-d1" style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', alignItems: 'stretch', gap: 0 }}>
          {/* Ticket */}
          <div style={{ border: `1px solid ${C.color.line}`, borderRadius: 10, background: C.color.panel, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: C.shadow.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.55rem .8rem', borderBottom: `1px solid ${C.color.line}`, fontFamily: C.font.mono, fontSize: '.7rem', color: C.color.txDim, background: C.color.inset }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: C.color.info }}><path d="M11.5 2 21 11.5 11.5 21 2 11.5z" opacity=".85"/></svg>
              issue · CLM-4437
              <span style={{ marginLeft: 'auto', fontFamily: C.font.mono, fontSize: '.62rem', padding: '.22em .55em', borderRadius: 5, border: `1px solid ${C.color.line2}`, color: C.color.txDim }}>JIRA</span>
            </div>
            <div style={{ padding: '.95rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
              <div style={{ display: 'flex', gap: '.45rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: C.font.mono, fontSize: '.62rem', padding: '.22em .55em', borderRadius: 5, border: `1px solid ${C.color.line2}`, color: C.color.txDim }}>Epic</span>
                <span style={{ fontFamily: C.font.mono, fontSize: '.62rem', padding: '.22em .55em', borderRadius: 5, border: `1px solid color-mix(in srgb,${C.color.fail} 35%,transparent)`, color: C.color.fail }}>● P2 Critical</span>
              </div>
              <div style={{ fontFamily: C.font.display, fontWeight: 700, fontSize: '1.04rem', color: C.color.txHi, lineHeight: 1.2 }}>Closure of Claims — Last Payment</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.32rem', fontFamily: C.font.mono, fontSize: '.72rem', color: C.color.tx }}>
                {[['status','In Progress'],['component','Claims Management'],['increment','PI 2026.3']].map(([k,v]) => (
                  <span key={k}><b style={{ color: C.color.txDim, fontWeight: 400, display: 'inline-block', width: '5.6rem' }}>{k}</b>{v}</span>
                ))}
              </div>
              <div style={{ borderTop: `1px solid ${C.color.line}`, paddingTop: '.75rem', marginTop: 'auto' }}>
                <div style={{ fontFamily: C.font.mono, fontSize: '.6rem', letterSpacing: '.1em', textTransform: 'uppercase', color: C.color.txDim, marginBottom: '.55rem' }}>acceptance criteria</div>
                {['All conditions met → section auto-closed; if last section → claim auto-closed','Default retention date assigned automatically on auto-closure'].map((t, i) => (
                  <div key={i} style={{ fontSize: '.78rem', color: C.color.tx, lineHeight: 1.42, paddingLeft: '.95rem', position: 'relative', marginBottom: '.42rem' }}>
                    <span style={{ position: 'absolute', left: 0, top: '.55em', width: 5, height: 5, borderRadius: '50%', background: C.color.lineBri, display: 'block' }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.45rem' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.color.live} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            <span style={{ fontFamily: C.font.mono, fontSize: '.54rem', letterSpacing: '.1em', textTransform: 'uppercase', color: C.color.txDim, textAlign: 'center', lineHeight: 1.3 }}>same<br/>day</span>
          </div>

          {/* Feature */}
          <div style={{ border: `1px solid ${C.color.line}`, borderRadius: 10, background: C.color.panel, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: C.shadow.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.55rem .8rem', borderBottom: `1px solid ${C.color.line}`, fontFamily: C.font.mono, fontSize: '.7rem', color: C.color.txDim, background: C.color.inset }}>
              <span style={{ display: 'flex', gap: '.3rem' }}>{['','',''].map((_,i) => <i key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: C.color.line2, display: 'block' }} />)}</span>
              claim · NW-4471
              <span style={{ marginLeft: 'auto', fontFamily: C.font.mono, fontSize: '.62rem', padding: '.22em .55em', borderRadius: 5, border: `1px solid color-mix(in srgb,${C.color.live} 38%,transparent)`, color: C.color.live, background: C.alpha.liveSoft }}>● live</span>
            </div>
            <div style={{ padding: '.95rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
              <button
                onClick={done ? reset : run}
                disabled={running}
                style={{
                  width: '100%', textAlign: 'center',
                  fontFamily: C.font.mono, fontSize: '.78rem',
                  color: done || running ? C.color.txFaint : C.color.txOnLive,
                  background: done || running ? C.color.bg2 : C.color.live,
                  border: `1px solid ${done || running ? C.color.line : 'transparent'}`,
                  padding: '.5rem .9rem', borderRadius: 6, cursor: running ? 'not-allowed' : 'pointer',
                  transition: `color .3s ${EASE}, background .3s ${EASE}, border-color .3s ${EASE}`,
                }}
              >
                {done ? '↻ reset' : running ? 'processing event…' : '▶ Final payment received'}
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                {(['s1','s2','cl','ret'] as StepKey[]).map(key => {
                  const labels: Record<StepKey,string> = { s1: 'Section · Property loss', s2: 'Section · Liability', cl: 'Claim NW-4471', ret: 'Retention date' }
                  const isDone = steps[key].cls === 'closed' || steps[key].cls === 'auto-closed' || steps[key].cls === 'date'
                  return (
                    <div key={key} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem',
                      padding: '.5rem .65rem', border: `1px solid ${isDone ? `color-mix(in srgb,${C.color.live} 32%,transparent)` : C.color.line}`,
                      borderRadius: 7, fontSize: '.82rem', color: C.color.txHi, background: C.color.bg2,
                      transition: `border-color .3s ${EASE}`,
                      fontWeight: key === 'cl' ? 600 : 400,
                    }}>
                      <span>{labels[key]}</span>
                      <StatusBadge cls={steps[key].cls} txt={steps[key].txt} />
                    </div>
                  )
                })}
              </div>
              <div style={{
                fontFamily: C.font.mono, fontSize: '.72rem', color: C.color.live,
                opacity: done ? 1 : 0, transition: `opacity .4s ${EASE}`,
                textAlign: 'center',
              }}>
                ✓ matches both acceptance criteria
              </div>
            </div>
          </div>
        </div>

        <p className="claims-animate claims-d2" style={{ fontFamily: C.font.mono, fontSize: '.76rem', color: C.color.txDim, marginTop: '1.1rem', lineHeight: 1.6 }}>
          Left: the requirement, as it arrives. Right: the same requirement, <b style={{ color: C.color.txHi }}>shipped as a working feature</b> — the deliverable that used to be a hand-off.
        </p>
      </div>
    </section>
  )
}
