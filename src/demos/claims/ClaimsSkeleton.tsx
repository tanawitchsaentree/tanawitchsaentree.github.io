'use client'

import { useState, useCallback } from 'react'
import { C } from './tokens'

const POLICIES = [
  { id: 1, name: 'Marine Cargo · NW-4471',  meta: 'Northwind Logistics · 09/2025–09/2026', ok: true  },
  { id: 2, name: 'Property · NW-2210',       meta: 'Northwind Logistics · 01/2024–01/2025', ok: false, reason: 'Loss date outside policy period' },
  { id: 3, name: 'Fleet · ACME-8890',        meta: 'Acme Foods · 06/2025–06/2026',           ok: false, reason: 'Different client' },
]

const EASE = C.ease.spring

export function ClaimsSkeleton() {
  const [view, setView] = useState<'old' | 'new'>('old')
  const [oldConverted, setOldConverted] = useState(false)
  const [whyVisible, setWhyVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [peeked, setPeeked] = useState<number | null>(null)
  const [converted, setConverted] = useState(false)

  const resetOld = useCallback(() => { setOldConverted(false); setWhyVisible(false) }, [])
  const resetNew = useCallback(() => { setModalOpen(false); setSelected(null); setPeeked(null); setConverted(false) }, [])

  const switchView = (v: 'old' | 'new') => {
    setView(v)
    resetOld(); resetNew()
  }

  const cap = view === 'old'
    ? oldConverted
      ? 'old flow — the view jumped to Policies, the skeleton is gone, and Continue is dead with no reason.'
      : "old flow — open the skeleton's menu and convert. watch what happens."
    : 'redesigned — convert keeps the skeleton in view and shows why each policy fits or doesn\'t.'

  const SkelRow = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.8rem .9rem', border: `1px dashed ${C.color.line}`, borderRadius: 8, marginBottom: '.55rem', background: C.color.inset }}>
      <span style={{ width: 32, height: 32, borderRadius: 7, background: C.color.bg2, border: `1px solid ${C.color.line2}`, display: 'grid', placeContent: 'center', color: C.color.txDim, flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4"/></svg>
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: C.font.display, fontWeight: 600, fontSize: '.95rem', color: C.color.txHi, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          Northwind Logistics
          <span style={{ fontFamily: C.font.mono, fontSize: '.56rem', letterSpacing: '.08em', textTransform: 'uppercase', padding: '.2em .5em', borderRadius: 4, border: `1px solid ${C.color.line2}`, color: C.color.txDim }}>skeleton</span>
        </div>
        <div style={{ fontSize: '.78rem', color: C.color.txDim, fontFamily: C.font.mono }}>escape of water · loss 12 Mar 2026</div>
      </div>
      <button
        onClick={view === 'old' ? () => setOldConverted(true) : () => setModalOpen(true)}
        style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.color.line2}`, background: C.color.bg2, cursor: 'pointer', display: 'grid', placeContent: 'center', color: C.color.tx, transition: `color .18s ${C.ease.std}, background .18s ${C.ease.std}, border-color .18s ${C.ease.std}` }}
        title="Convert"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>
      </button>
    </div>
  )

  const PolicyRow = ({ p }: { p: typeof POLICIES[0] }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.8rem .9rem', border: `1px solid ${C.color.line}`, borderRadius: 8, marginBottom: '.55rem', background: C.color.inset }}>
      <span style={{ width: 32, height: 32, borderRadius: 7, background: C.color.bg2, border: `1px solid ${C.color.line2}`, display: 'grid', placeContent: 'center', color: C.color.txDim, flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: C.font.display, fontWeight: 600, fontSize: '.95rem', color: C.color.txHi }}>{p.name}</div>
        <div style={{ fontSize: '.78rem', color: C.color.txDim, fontFamily: C.font.mono }}>{p.meta}</div>
      </div>
    </div>
  )

  return (
    <section id="skeleton" style={{ padding: 'clamp(3.4rem,8vw,6.5rem) 0', borderTop: `1px solid ${C.color.line}` }}>
      <div className="claims-wrap">
        <div className="claims-animate" style={{ marginBottom: '2.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.1rem' }}>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.live }}>03</span>
            <span style={{ color: C.color.txFaint }}>/</span>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', letterSpacing: '.2em', textTransform: 'uppercase', color: C.color.txDim, marginLeft: '.4rem' }}>Skeleton conversion</span>
          </div>
          <h2 style={{ fontFamily: C.font.display, fontWeight: 700, fontSize: 'clamp(1.7rem,3.8vw,2.8rem)', lineHeight: 1.08, letterSpacing: '-.02em', color: C.color.txHi, maxWidth: '20ch', margin: 0 }}>
            The wrong primitive{' '}
            <span style={{ color: C.color.live }}>hid the decision.</span>
          </h2>
          <p style={{ fontSize: 'clamp(1rem,1.5vw,1.12rem)', color: C.color.tx, maxWidth: '60ch', marginTop: '1.1rem', lineHeight: 1.66 }}>
            A handler converts a <b style={{ fontWeight: 600, color: C.color.txHi }}>skeleton</b> claim into a real one. The old flow switched tabs and the skeleton vanished; the confirm button sat disabled with no reason. Toggle the two flows:
          </p>
        </div>

        <div className="claims-animate claims-d1" style={{ background: C.color.panel, border: `1px solid ${C.color.line}`, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '.2rem', padding: '.5rem .6rem', borderBottom: `1px solid ${C.color.line}`, background: C.color.inset2 }}>
            {(['old','new'] as const).map(v => (
              <button
                key={v}
                onClick={() => switchView(v)}
                style={{
                  fontFamily: C.font.mono, fontSize: '.74rem',
                  color: view === v ? C.color.txHi : C.color.txDim,
                  background: view === v ? C.color.panel : 'transparent',
                  border: `1px solid ${view === v ? C.color.line2 : 'transparent'}`,
                  padding: '.42rem .85rem', borderRadius: 6, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '.5em', transition: `color .18s ${C.ease.std}, background .18s ${C.ease.std}, border-color .18s ${C.ease.std}`,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: v === 'old' ? C.color.fail : C.color.live, display: 'block' }} />
                {v === 'old' ? 'old flow — what shipped' : 'redesigned'}
              </button>
            ))}
          </div>

          {/* Caption */}
          <div style={{ fontFamily: C.font.mono, fontSize: '.72rem', color: C.color.txDim, padding: '.6rem .95rem', borderBottom: `1px solid ${C.color.line}`, background: C.color.inset }}>
            <b style={{ color: C.color.txHi }}>{view === 'old' ? (oldConverted ? 'old flow' : 'old flow') : 'redesigned'}</b> — {cap.split(' — ').slice(1).join(' — ')}
          </div>

          {/* Body */}
          <div style={{ padding: '1rem', minHeight: 280 }}>
            <div style={{ fontFamily: C.font.mono, fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase', color: C.color.txDim, marginBottom: '.7rem' }}>
              {view === 'old' && oldConverted ? 'policies — converting (skeleton not shown)' : '1 skeleton awaiting conversion'}
            </div>

            {view === 'old' && !oldConverted && <SkelRow />}

            {view === 'old' && oldConverted && (
              <>
                {POLICIES.map(p => <PolicyRow key={p.id} p={p} />)}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <span
                    onClick={() => setWhyVisible(true)}
                    style={{ fontFamily: C.font.mono, fontSize: '.7rem', color: C.color.fail, opacity: whyVisible ? 1 : 0, transition: `opacity .3s ${C.ease.std}`, marginRight: 'auto', cursor: 'default', maxWidth: '60%' }}
                  >
                    why disabled? you can't even see the skeleton you're matching against
                  </span>
                  <button
                    onClick={() => setWhyVisible(true)}
                    style={{ fontFamily: C.font.mono, fontSize: '.78rem', color: C.color.tx, background: C.color.bg2, border: `1px solid ${C.color.line2}`, padding: '.5rem .9rem', borderRadius: 6, cursor: 'pointer', opacity: .6 }}
                  >
                    Register skeleton
                  </button>
                  <button disabled style={{ fontFamily: C.font.mono, fontSize: '.78rem', color: C.color.txFaint, background: C.color.bg2, border: `1px solid ${C.color.line}`, padding: '.5rem .9rem', borderRadius: 6, cursor: 'not-allowed' }}>
                    Continue conversion
                  </button>
                </div>
              </>
            )}

            {view === 'new' && !converted && <SkelRow />}
            {view === 'new' && converted && (
              <div style={{ textAlign: 'center', padding: '2rem', fontFamily: C.font.mono, fontSize: '.82rem', color: C.color.live }}>
                ✓ Conversion complete
                <br />
                <button onClick={resetNew} style={{ marginTop: '.8rem', fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.txDim, background: 'none', border: `1px solid ${C.color.line2}`, padding: '.4rem .8rem', borderRadius: 6, cursor: 'pointer' }}>reset</button>
              </div>
            )}
          </div>

          {/* New flow modal */}
          {view === 'new' && (
            <div
              onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
              style={{
                position: 'absolute', inset: 0,
                background: C.color.overlay,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.1rem',
                opacity: modalOpen ? 1 : 0, pointerEvents: modalOpen ? 'auto' : 'none',
                transition: `opacity .26s ${C.ease.std}`, backdropFilter: 'blur(2px)',
              }}
            >
              <div style={{
                background: C.color.bg2, border: `1px solid ${C.color.line2}`, borderRadius: 10,
                width: '100%', maxWidth: 500, maxHeight: '100%', overflow: 'auto',
                transform: modalOpen ? 'none' : 'translateY(12px)', transition: `transform .3s ${EASE}`,
              }}>
                {/* Modal head */}
                <div style={{ padding: '.95rem 1.1rem', borderBottom: `1px solid ${C.color.line}`, background: C.color.inset, position: 'sticky', top: 0 }}>
                  <div style={{ fontFamily: C.font.mono, fontSize: '.64rem', letterSpacing: '.1em', textTransform: 'uppercase', color: C.color.live, marginBottom: '.6rem', display: 'flex', alignItems: 'center', gap: '.5em' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4"/></svg>
                    converting this skeleton — stays in view
                  </div>
                  <div style={{ display: 'flex', gap: '1.3rem', flexWrap: 'wrap' }}>
                    {[['client','Northwind Logistics'],['cause','Escape of water'],['loss date','12 Mar 2026']].map(([k,v]) => (
                      <div key={k} style={{ fontSize: '.84rem', color: C.color.txHi }}>
                        <b style={{ display: 'block', fontFamily: C.font.mono, fontSize: '.56rem', letterSpacing: '.08em', textTransform: 'uppercase', color: C.color.txDim, marginBottom: '.2rem', fontWeight: 400 }}>{k}</b>
                        {v}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Policy list */}
                <div style={{ padding: '1rem 1.1rem' }}>
                  <div style={{ fontFamily: C.font.mono, fontSize: '.64rem', letterSpacing: '.1em', textTransform: 'uppercase', color: C.color.txDim, marginBottom: '.7rem' }}>eligible policies — pick one</div>
                  {POLICIES.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (!p.ok) { setPeeked(peeked === p.id ? null : p.id); return }
                        setSelected(p.id); setPeeked(null)
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '.75rem',
                        padding: '.75rem .85rem', border: `1px solid ${selected === p.id ? C.color.live : C.color.line2}`,
                        borderRadius: 8, marginBottom: '.5rem',
                        cursor: p.ok ? 'pointer' : 'not-allowed',
                        background: selected === p.id ? C.alpha.liveSoft : C.color.inset,
                        transition: `color .18s ${C.ease.std}, background .18s ${C.ease.std}, border-color .18s ${C.ease.std}`, opacity: p.ok ? 1 : .82,
                      }}
                    >
                      <span style={{
                        width: 17, height: 17, borderRadius: '50%',
                        border: `2px solid ${selected === p.id ? C.color.live : C.color.lineBri}`,
                        flexShrink: 0, display: 'grid', placeContent: 'center',
                      }}>
                        {selected === p.id && <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.color.live, display: 'block' }} />}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: C.font.display, fontWeight: 600, fontSize: '.9rem', color: p.ok ? C.color.txHi : C.color.txDim }}>{p.name}</div>
                        <div style={{ fontSize: '.74rem', color: C.color.txDim, fontFamily: C.font.mono }}>{p.meta}</div>
                      </div>
                      {!p.ok && p.reason && (
                        <span style={{
                          fontFamily: C.font.mono, fontSize: '.62rem', color: C.color.fail,
                          background: C.alpha.failSoft,
                          border: `1px solid color-mix(in srgb,${C.color.fail} 30%,transparent)`,
                          padding: '.3em .55em', borderRadius: 5, flexShrink: 0,
                          maxWidth: peeked === p.id ? 230 : 0, overflow: 'hidden', whiteSpace: 'nowrap',
                          opacity: peeked === p.id ? 1 : 0, transition: `opacity .32s ${C.ease.spring}, max-width .32s ${C.ease.spring}`,
                        }}>
                          {p.reason}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Modal footer */}
                <div style={{ padding: '.85rem 1.1rem', borderTop: `1px solid ${C.color.line}`, display: 'flex', gap: '.6rem', justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: C.color.inset }}>
                  <button onClick={() => setModalOpen(false)} style={{ fontFamily: C.font.mono, fontSize: '.78rem', color: C.color.tx, background: C.color.bg2, border: `1px solid ${C.color.line2}`, padding: '.5rem .9rem', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                  <button
                    disabled={!selected}
                    onClick={() => { if (!selected) return; setConverted(true); setTimeout(() => setModalOpen(false), 700) }}
                    style={{
                      fontFamily: C.font.mono, fontSize: '.78rem', fontWeight: 700,
                      color: selected ? C.color.txOnLive : C.color.txFaint,
                      background: selected ? C.color.live : C.color.bg2,
                      border: `1px solid ${selected ? 'transparent' : C.color.line}`,
                      padding: '.5rem .9rem', borderRadius: 6, cursor: selected ? 'pointer' : 'not-allowed',
                      transition: `color .18s ${C.ease.std}, background .18s ${C.ease.std}, border-color .18s ${C.ease.std}`,
                    }}
                  >
                    Continue conversion
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="claims-animate claims-d2" style={{ fontSize: '.95rem', color: C.color.tx, maxWidth: '64ch', marginTop: '1.6rem', lineHeight: 1.6, paddingLeft: '.9rem', borderLeft: `2px solid ${C.color.live}` }}>
          <b style={{ color: C.color.txHi }}>the detail that only exists in a real build:</b> policy #2 matches the client but its date is out of period. without it, the date rule is never demonstrated — the client check short-circuits first. that decision doesn't fit in a Figma file.
        </p>
      </div>
    </section>
  )
}
