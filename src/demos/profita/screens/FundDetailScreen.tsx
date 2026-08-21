'use client'
import { useState } from 'react'
import { SC, SW, SH } from './_screenTokens'

type Row = { k: string; v: string; help?: string }

const ROWS: { group: string; items: Row[] }[] = [
  { group: 'Minimum Trade', items: [
    { k: 'Minimum first time buy (THB)', v: '5,000.00', help: 'The smallest amount you can invest the first time you buy into this fund.' },
    { k: 'Minimum buy after (THB)',      v: '5,000.00' },
  ]},
  { group: 'Open for trade', items: [
    { k: 'Order cut-off time',        v: '3:00 pm' },
    { k: 'Sales order closing time',  v: '3:00 pm', help: "Orders placed after this time use tomorrow's price, not today's." },
  ]},
  { group: 'Trade Fee', items: [
    { k: 'Fee buy',   v: '1.07%', help: 'What you pay to place the order. It comes out of your investment automatically — no separate bill.' },
    { k: 'Fee Sales', v: '0.00%' },
  ]},
  { group: 'Fund Fee', items: [
    { k: 'Fee buy',   v: '0.75%' },
    { k: 'Fee Sales', v: '0.00%' },
  ]},
]

export function FundDetailScreen() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div style={{ width: SW, height: SH, display: 'flex', flexDirection: 'column', fontFamily: SC.ui, fontSize: 11, overflow: 'hidden', background: SC.paper }}>
      {/* Header */}
      <div style={{ background: SC.navy, padding: '6px 14px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', padding: '4px 0 10px' }}>
          <button type="button" aria-label="Back" style={{ fontSize: 16, background: 'none', border: 'none', padding: 0, margin: 0, color: 'inherit', font: 'inherit', cursor: 'pointer', lineHeight: 1 }}>←</button>
          <span style={{ fontSize: 13, fontWeight: 800 }}>LHFUND-01</span>
          <span style={{ fontSize: 8, border: '1px solid rgba(255,255,255,.4)', borderRadius: 20, padding: '3px 7px', display: 'flex', gap: 3, alignItems: 'center', color: 'rgba(255,255,255,.9)' }}>⊕ Compare</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: SC.goldL }}>Save</span>
        </div>
        <div style={{ display: 'flex', gap: 14, color: 'rgba(255,255,255,.55)', fontSize: 10, fontWeight: 600 }}>
          {['Performance', 'Policy', 'Trading information'].map((t, i) => (
            <div key={t} style={{ paddingBottom: 8, position: 'relative', whiteSpace: 'nowrap', color: i === 2 ? '#fff' : 'rgba(255,255,255,.55)' }}>
              {t}
              {i === 2 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: SC.gold }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ROWS.map(group => (
          <div key={group.group} style={{ background: '#fff', borderRadius: 10, padding: '2px 12px', boxShadow: '0 2px 10px -7px rgba(0,0,0,.2)' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: SC.ink, padding: '9px 0 6px', borderBottom: '1px solid #eef0f3' }}>{group.group}</div>
            {group.items.map((row, ri) => {
              const id = `${group.group}-${row.k}`
              const isOpen = openId === id
              return (
                <div key={row.k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 10, borderBottom: ri < group.items.length - 1 && !isOpen ? '1px solid #f3f4f6' : 'none' }}>
                    {row.help ? (
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : id)}
                        aria-expanded={isOpen}
                        aria-label={`${row.k}: what this means`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          color: SC.grey, background: 'none', border: 'none', padding: 0,
                          fontFamily: SC.ui, fontSize: 10, cursor: 'pointer',
                          textDecoration: 'underline', textDecorationStyle: 'dotted', textDecorationColor: SC.greyL,
                        }}
                      >
                        {row.k}
                        <span aria-hidden="true" style={{
                          fontSize: 7, width: 11, height: 11, borderRadius: '50%',
                          border: `1px solid ${SC.grey}`, display: 'inline-flex', alignItems: 'center',
                          justifyContent: 'center', color: SC.grey, flexShrink: 0,
                        }}>?</span>
                      </button>
                    ) : (
                      <span style={{ color: SC.grey }}>{row.k}</span>
                    )}
                    <span style={{ color: SC.ink, fontWeight: 700 }}>{row.v}</span>
                  </div>
                  {row.help && isOpen && (
                    <p style={{
                      margin: '0 0 8px', padding: '6px 8px', background: '#f7f4ea',
                      borderRadius: 6, fontSize: 9, lineHeight: 1.5, color: SC.ink,
                      borderBottom: ri < group.items.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}>
                      {row.help}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 7, padding: '10px 14px 14px', background: '#fff', borderTop: '1px solid #eef0f3' }}>
        <button style={{ flex: 1, border: 'none', borderRadius: 10, padding: '11px', fontFamily: SC.ui, fontWeight: 800, fontSize: 11, background: SC.navy, color: '#fff', cursor: 'pointer' }}>Buy</button>
        <button style={{ flex: 1, border: `1.5px solid ${SC.navy}`, borderRadius: 10, padding: '11px', fontFamily: SC.ui, fontWeight: 800, fontSize: 11, background: '#fff', color: SC.navy, cursor: 'pointer' }}>Sell</button>
        <button style={{ flex: 1, border: 'none', borderRadius: 10, padding: '11px', fontFamily: SC.ui, fontWeight: 800, fontSize: 11, background: SC.gold, color: '#3a3018', cursor: 'pointer' }}>Switch</button>
      </div>
    </div>
  )
}
