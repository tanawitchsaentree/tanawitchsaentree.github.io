'use client'

import { useState } from 'react'
import { C } from './tokens'

const CHECKS = [
  { label: 'save() — error handling', verified: false, evidence: 'try/finally, no catch' },
  { label: 'discard — confirm modal',  verified: true,  evidence: 'catch present'         },
  { label: 'closed claim — locked',    verified: true,  evidence: 'guard verified'         },
]

function pad(s: string) { return (s + ' ').padEnd(30, '.') }

export function ClaimsLoop() {
  const [mode, setMode] = useState<'build' | 'verify'>('build')

  const tabs: Array<{ id: 'build' | 'verify'; label: string }> = [
    { id: 'build',  label: 'builder report'    },
    { id: 'verify', label: 'independent verify' },
  ]

  return (
    <section id="loop" style={{ padding: 'clamp(3.4rem,8vw,6.5rem) 0', borderTop: `1px solid ${C.color.line}` }}>
      <div className="claims-wrap">
        <div className="claims-animate" style={{ marginBottom: '2.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.1rem' }}>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.live }}>02</span>
            <span style={{ color: C.color.txFaint }}>/</span>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', letterSpacing: '.2em', textTransform: 'uppercase', color: C.color.txDim, marginLeft: '.4rem' }}>The loop</span>
          </div>
          <h2 style={{ fontFamily: C.font.display, fontWeight: 700, fontSize: 'clamp(1.7rem,3.8vw,2.8rem)', lineHeight: 1.08, letterSpacing: '-.02em', color: C.color.txHi, maxWidth: '20ch', margin: 0 }}>
            Build and verify{' '}
            <span style={{ color: C.color.live }}>can't be the same prompt.</span>
          </h2>
          <p style={{ fontSize: 'clamp(1rem,1.5vw,1.12rem)', color: C.color.tx, maxWidth: '60ch', marginTop: '1.1rem', lineHeight: 1.66 }}>
            Requirement in → audit what exists → one precise build prompt → a <b style={{ fontWeight: 600, color: C.color.txHi }}>separate</b> verify pass → ship, checked against the acceptance criteria.
          </p>
        </div>

        <div className="claims-animate claims-d1" style={{ background: C.color.panel, border: `1px solid ${C.color.line}`, borderRadius: 8, overflow: 'hidden' }}>
          {/* Panel bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.62rem .9rem', borderBottom: `1px solid ${C.color.line}`, background: C.color.inset, fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.txDim }}>
            <span style={{ display: 'flex', gap: '.34rem' }}>{['','',''].map((_,i) => <i key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: C.color.line2, display: 'block' }} />)}</span>
            <span style={{ color: C.color.txHi }}>verify.log</span>
            <span style={{ marginLeft: 'auto', fontFamily: C.font.mono, fontSize: '.62rem', padding: '.22em .55em', borderRadius: 5, border: `1px solid ${C.color.line2}`, color: mode === 'verify' ? C.color.fail : C.color.txDim }}>
              {mode === 'verify' ? '1 false done' : '3/3 reported'}
            </span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '.2rem', padding: '.5rem .6rem', borderBottom: `1px solid ${C.color.line}`, background: C.color.inset2 }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                style={{
                  fontFamily: C.font.mono, fontSize: '.74rem',
                  color: mode === t.id ? C.color.txHi : C.color.txDim,
                  background: mode === t.id ? C.color.panel : 'transparent',
                  border: `1px solid ${mode === t.id ? C.color.line2 : 'transparent'}`,
                  padding: '.4rem .8rem', borderRadius: 6, cursor: 'pointer',
                  transition: `color .18s ${C.ease.std}, background .18s ${C.ease.std}, border-color .18s ${C.ease.std}`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Terminal */}
          <div style={{ fontFamily: C.font.mono, fontSize: '.82rem', lineHeight: 1.9, padding: '1rem 1.1rem', background: C.color.inset, minHeight: 236 }}>
            <div style={{ color: C.color.txHi }}>
              <span style={{ color: C.color.live, marginRight: '.55em' }}>$</span>
              {mode === 'build' ? 'agent build claim-edit --report' : 'agent verify claim-edit --evidence'}
            </div>

            {mode === 'build' ? (
              <>
                {CHECKS.map(c => (
                  <div key={c.label}>
                    <span style={{ color: C.color.live, marginRight: '.7em' }}>✓</span>
                    {pad(c.label)}<span style={{ color: C.color.txFaint }}>reported </span>done
                  </div>
                ))}
                <div style={{ color: C.color.live, marginTop: '.7rem', borderTop: `1px dashed ${C.color.line}`, paddingTop: '.6rem' }}>
                  → builder says 3/3 complete
                </div>
              </>
            ) : (
              <>
                {CHECKS.filter(c => c.verified).map(c => (
                  <div key={c.label}>
                    <span style={{ color: C.color.live, marginRight: '.7em' }}>✓</span>
                    {pad(c.label)}{c.evidence}
                  </div>
                ))}
                {CHECKS.filter(c => !c.verified).map(c => (
                  <div key={c.label} style={{ color: C.color.fail, background: C.alpha.failSoft, margin: '0 -1.1rem', padding: '0 1.1rem' }}>
                    <span style={{ marginRight: '.7em' }}>✗</span>
                    {pad(c.label)}FAIL — {c.evidence}
                  </div>
                ))}
                <div style={{ color: C.color.fail, marginTop: '.7rem', borderTop: `1px dashed ${C.color.line}`, paddingTop: '.6rem' }}>
                  → 2/3 verified · 1 false-positive caught
                </div>
              </>
            )}
          </div>
        </div>

        <p className="claims-animate claims-d2" style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.txDim, marginTop: '1.2rem', paddingLeft: '.9rem', borderLeft: `2px solid ${C.color.lineBri}`, maxWidth: '58ch', lineHeight: 1.6 }}>
          <b style={{ color: C.color.live, fontWeight: 500 }}>why it matters —</b> ask one agent to "do X and verify X" and you get a self-justifying report. once it claimed save-error-handling done with a <em style={{ fontStyle: 'normal', color: C.color.live }}>try/finally and no catch</em>. a separate verifier reads the evidence instead of the builder's word.
        </p>
      </div>
    </section>
  )
}
