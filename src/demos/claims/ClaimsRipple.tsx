'use client'

import { useState } from 'react'
import { C } from './tokens'

const BLOCKERS = [
  {
    id: 'lit',
    label: 'Litigation',
    count: '3 open',
    items: [
      { ref: 'case #LT-2231', detail: 'updated 2d ago'  },
      { ref: 'case #LT-2240', detail: 'owner: legal'    },
      { ref: 'case #LT-2255', detail: 'hearing 14 Apr'  },
    ],
  },
  {
    id: 'res',
    label: 'Reserves',
    count: '€ 1.24M',
    items: [
      { ref: 'indemnity line', detail: '€ 1.10M' },
      { ref: 'expense line',   detail: '€ 0.14M' },
    ],
  },
]

const SCHEMA_BASE = `"blockers": [{
  "domain": "litigation",
  "count": 3`

const SCHEMA_RICH_EXTRA = `,
  "items": [{ ref, owner, updated }],
  "lastUpdated": "2026-…"`

export function ClaimsRipple() {
  const [open, setOpen] = useState<string | null>(null)

  const toggle = (id: string) => setOpen(open === id ? null : id)
  const hasOpen = open !== null

  return (
    <section id="ripple" style={{ padding: 'clamp(3.4rem,8vw,6.5rem) 0', borderTop: `1px solid ${C.color.line}` }}>
      <div className="claims-wrap">
        <div className="claims-animate" style={{ marginBottom: '2.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.1rem' }}>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.live }}>05</span>
            <span style={{ color: C.color.txFaint }}>/</span>
            <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', letterSpacing: '.2em', textTransform: 'uppercase', color: C.color.txDim, marginLeft: '.4rem' }}>The ripple</span>
          </div>
          <h2 style={{ fontFamily: C.font.display, fontWeight: 700, fontSize: 'clamp(1.7rem,3.8vw,2.8rem)', lineHeight: 1.08, letterSpacing: '-.02em', color: C.color.txHi, maxWidth: '20ch', margin: 0 }}>
            The prototype became{' '}
            <span style={{ color: C.color.live }}>the contract.</span>
          </h2>
          <p style={{ fontSize: 'clamp(1rem,1.5vw,1.12rem)', color: C.color.tx, maxWidth: '60ch', marginTop: '1.1rem', lineHeight: 1.66 }}>
            Once it existed, everything downstream pointed at it. Backend designed API schemas from what the prototype showed. Expand a blocker on the left — watch the schema on the right reshape to match.
          </p>
        </div>

        <div className="claims-animate claims-d1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
          {/* Blocker list */}
          <div style={{ background: C.color.panel, border: `1px solid ${C.color.line}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.62rem .9rem', borderBottom: `1px solid ${C.color.line}`, background: C.color.inset, fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.txDim }}>
              <span style={{ color: C.color.txHi }}>prototype · closure blockers</span>
              <span style={{ marginLeft: 'auto', fontFamily: C.font.mono, fontSize: '.62rem', padding: '.22em .55em', borderRadius: 5, border: `1px solid ${C.color.line2}`, color: C.color.txDim }}>interactive</span>
            </div>
            <div style={{ padding: '1rem' }}>
              {BLOCKERS.map(b => (
                <div
                  key={b.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggle(b.id)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggle(b.id)}
                  style={{
                    border: `1px solid ${open === b.id ? C.color.live : C.color.line}`,
                    borderRadius: 8, marginBottom: '.5rem', background: C.color.inset,
                    cursor: 'pointer', overflow: 'hidden',
                    transition: `border-color .2s ${C.ease.std}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem .9rem', fontFamily: C.font.display, fontWeight: 600, fontSize: '.9rem', color: C.color.txHi }}>
                    <span>{b.label}</span>
                    <span style={{ fontFamily: C.font.mono, fontSize: '.74rem', color: b.id === 'res' ? C.color.warn : C.color.fail }}>
                      {b.count} ▸
                    </span>
                  </div>
                  <div style={{
                    maxHeight: open === b.id ? 170 : 0,
                    overflow: 'hidden',
                    transition: `max-height .35s ${C.ease.std}`,
                    fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.txDim,
                  }}>
                    {b.items.map(item => (
                      <div key={item.ref} style={{ display: 'flex', justifyContent: 'space-between', padding: '.4rem .9rem', borderTop: `1px solid ${C.color.line}` }}>
                        <span>{item.ref}</span>
                        <span style={{ color: C.color.tx }}>{item.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ fontFamily: C.font.mono, fontSize: '.72rem', color: C.color.txDim, marginTop: '.6rem' }}>
                <span style={{ color: C.color.live }}>▸</span> expand a blocker
              </div>
            </div>
          </div>

          {/* Schema */}
          <div style={{ background: C.color.panel, border: `1px solid ${C.color.line}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.62rem .9rem', borderBottom: `1px solid ${C.color.line}`, background: C.color.inset, fontFamily: C.font.mono, fontSize: '.74rem', color: C.color.txDim }}>
              <span style={{ color: C.color.txHi }}>GET /claim/&#123;id&#125;/blockers</span>
              <span style={{ marginLeft: 'auto', fontFamily: C.font.mono, fontSize: '.62rem', padding: '.22em .55em', borderRadius: 5, border: `1px solid ${hasOpen ? `color-mix(in srgb,${C.color.live} 38%,transparent)` : C.color.line2}`, color: hasOpen ? C.color.live : C.color.txDim, background: hasOpen ? C.alpha.liveSoft : 'transparent', transition: `color .3s ${C.ease.std}, background .3s ${C.ease.std}, border-color .3s ${C.ease.std}` }}>
                {hasOpen ? 'rich · driven by prototype' : 'generic'}
              </span>
            </div>
            <div style={{ fontFamily: C.font.mono, fontSize: '.8rem', lineHeight: 1.85, padding: '1rem 1.1rem', background: C.color.inset }}>
              {SCHEMA_BASE.split('\n').map((line, i) => (
                <div key={i} style={{ whiteSpace: 'pre' }}>
                  {line.includes('"') ? (
                    line.split(/"([^"]+)"/).map((part, j) =>
                      j % 2 === 1
                        ? <span key={j} style={{ color: line.trim().startsWith('"domain"') || line.trim().startsWith('"count"') ? C.color.info : C.color.live }}>&quot;{part}&quot;</span>
                        : <span key={j}>{part}</span>
                    )
                  ) : line}
                </div>
              ))}
              {hasOpen && SCHEMA_RICH_EXTRA.split('\n').map((line, i) => (
                <div key={`extra-${i}`} style={{ whiteSpace: 'pre', color: C.color.live, opacity: 0, animation: `claims-fadein .3s ${C.ease.std} forwards` }}>
                  {line}
                </div>
              ))}
              {!hasOpen && <div style={{ whiteSpace: 'pre', color: C.color.txFaint }}>{'  // nothing to drill into'}</div>}
              <div style={{ whiteSpace: 'pre' }}>{'}'}{']'}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
