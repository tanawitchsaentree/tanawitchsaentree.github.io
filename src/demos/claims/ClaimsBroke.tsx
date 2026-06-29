'use client'

import { useState } from 'react'
import { C } from './tokens'

const ROWS = [
  { key: 0,  type: 'normal', rn: 'round 1',  rt: 'spacing fix → gap drifts down'           },
  { key: 1,  type: 'normal', rn: 'round 2',  rt: 'spacing fix → gap drifts right'          },
  { key: 2,  type: 'normal', rn: 'round 3',  rt: 'negative margins → gap reappears above'  },
  { key: 3,  type: 'normal', rn: 'round 4',  rt: 'spacing fix → toggle row misaligns'      },
  { key: 4,  type: 'normal', rn: 'round 5',  rt: 'spacing fix → gap moves to the list'     },
  { key: 5,  type: 'root',   rn: 'round 6',  rt: 'root cause: nx-formfield reserves label + error space, always' },
  { key: 6,  type: 'commit', rn: 'commit',   rt: '+ skill: nx-formfield-spacing-trap.md (fix + 6 failed attempts logged)' },
]

export function ClaimsBroke() {
  const [shown, setShown] = useState(1)

  const isLast = shown >= ROWS.length
  const isDone = shown >= ROWS.length

  const chip = isDone ? { label: 'resolved', color: C.color.live }
    : shown === 6      ? { label: 'root cause', color: C.color.warn }
    : { label: 'chasing', color: C.color.txDim }

  return (
    <section id="broke" style={{ padding: 'clamp(3.4rem,8vw,6.5rem) 0', borderTop: `1px solid ${C.color.line}` }}>
      <div className="claims-wrap">
        <div className="claims-animate" style={{ marginBottom: '2.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.1rem' }}>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.live }}>04</span>
            <span style={{ color: C.color.txFaint }}>/</span>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', letterSpacing: '.2em', textTransform: 'uppercase', color: C.color.txDim, marginLeft: '.4rem' }}>When the loop broke</span>
          </div>
          <h2 style={{ fontFamily: C.font.display, fontWeight: 700, fontSize: 'clamp(1.7rem,3.8vw,2.8rem)', lineHeight: 1.08, letterSpacing: '-.02em', color: C.color.txHi, maxWidth: '20ch', margin: 0 }}>
            Six rounds chasing{' '}
            <span style={{ color: C.color.live }}>a gap that kept moving.</span>
          </h2>
          <p style={{ fontSize: 'clamp(1rem,1.5vw,1.12rem)', color: C.color.tx, maxWidth: '60ch', marginTop: '1.1rem', lineHeight: 1.66 }}>
            A card with a toggle, a dropdown, an access list. Each round I pushed a spacing fix and the gap moved somewhere else. Step through it:
          </p>
        </div>

        <div className="claims-animate claims-d1" style={{ background: C.color.panel, border: `1px solid ${C.color.line}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.62rem .9rem', borderBottom: `1px solid ${C.color.line}`, background: C.color.inset, fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.txDim }}>
            <span style={{ display: 'flex', gap: '.34rem' }}>{['','',''].map((_,i) => <i key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: C.color.line2, display: 'block' }} />)}</span>
            <span style={{ color: C.color.txHi }}>iteration.log</span>
            <span style={{ marginLeft: 'auto', fontFamily: C.font.mono, fontSize: '.62rem', padding: '.22em .55em', borderRadius: 5, border: `1px solid ${C.color.line2}`, color: chip.color }}>
              {chip.label}
            </span>
          </div>

          <div style={{ fontFamily: C.font.mono, fontSize: '.82rem' }}>
            {ROWS.map(row => {
              const visible = row.key < shown
              const isRoot   = row.type === 'root'
              const isCommit = row.type === 'commit'
              return (
                <div
                  key={row.key}
                  style={{
                    display: 'flex', gap: '.9rem', alignItems: 'baseline',
                    padding: '.5rem 1rem',
                    borderBottom: `1px solid ${C.color.line}`,
                    opacity: visible ? 1 : .32,
                    transition: `opacity .35s ${C.ease.std}`,
                    background: isCommit ? C.alpha.liveSoft : isRoot ? C.color.inset : 'transparent',
                  }}
                >
                  <span style={{ color: isCommit ? C.color.live : isRoot ? C.color.info : C.color.txFaint, flexShrink: 0, width: '6rem', fontSize: '.82rem' }}>
                    {row.rn}
                  </span>
                  <span style={{ color: C.color.tx }}>
                    {isRoot   ? <><b style={{ color: C.color.txHi }}>{row.rt.split(':')[0]}:</b>{row.rt.split(':').slice(1).join(':')}</> :
                     isCommit ? <><b style={{ color: C.color.live }}>{row.rt.split(' ')[0]} {row.rt.split(' ')[1]}:</b> {row.rt.split(' ').slice(2).join(' ')}</> :
                     row.rt.includes('→') ? (
                       <>
                         {row.rt.split(' → ')[0]} →{' '}
                         <span style={{ color: C.color.warn }}>{row.rt.split(' → ')[1]}</span>
                       </>
                     ) : row.rt}
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.9rem', padding: '.75rem 1rem', borderTop: `1px solid ${C.color.line}`, background: C.color.inset }}>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.txDim }}>
              revealed <b style={{ color: C.color.txHi }}>{shown}</b> / {ROWS.length}
            </span>
            <span style={{ flex: 1, height: 4, background: C.color.bg, borderRadius: 99, overflow: 'hidden' }}>
              <span style={{
                display: 'block', height: '100%',
                width: `${(shown / ROWS.length) * 100}%`,
                background: isDone ? C.color.live : C.color.warn,
                transition: `width .4s ${C.ease.std}`,
                borderRadius: 99,
              }} />
            </span>
            <button
              onClick={() => setShown(isLast ? 1 : shown + 1)}
              style={{
                fontFamily: C.font.mono, fontSize: '.78rem', fontWeight: 700,
                color: C.color.txOnLive, background: C.color.live,
                border: '1px solid transparent', padding: '.5rem .9rem', borderRadius: 6, cursor: 'pointer',
              }}
            >
              {isLast ? 'Reset' : shown === 6 ? 'Commit the fix' : 'Next round'}
            </button>
          </div>
        </div>

        <p className="claims-animate claims-d2" style={{ fontFamily: C.font.display, fontWeight: 600, fontSize: 'clamp(1.05rem,2.1vw,1.45rem)', color: C.color.txHi, marginTop: '1.5rem', letterSpacing: '-.015em' }}>
          Pain → extract the pattern → write the skill → <span style={{ color: C.color.live }}>never hit it again.</span>
        </p>
      </div>
    </section>
  )
}
