'use client'
import { useState } from 'react'
import { SC, SW, SH } from './_screenTokens'

const ACCOUNTS = [
  {
    name: 'Irregular savings', active: false, no: '221-1-12345-1',
    meta: 'Interest 1.10% · Accumulated interest 100.00',
    avail: '40,000.00', current: '50,000.00',
    txs: [
      { d: '31 Oct · Fund purchase', a: '-5,000.00', pos: false },
      { d: '28 Oct · Interest',      a: '+45.20',     pos: true  },
      { d: '25 Oct · Transfer in',   a: '+10,000.00', pos: true  },
    ],
  },
  {
    name: 'e-Saving', active: true, no: '221-1-12345-1',
    meta: 'Interest 1.10% · Accumulated interest 100.00',
    avail: '40,000.00', current: '50,000.00',
    txs: [
      { d: '30 Oct · Deposit',   a: '+20,000.00', pos: true  },
      { d: '27 Oct · Interest',  a: '+38.10',     pos: true  },
    ],
  },
]

export function SavingsAccountScreen() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ width: SW, height: SH, display: 'flex', flexDirection: 'column', fontFamily: SC.ui, fontSize: 11, overflow: 'hidden', background: SC.paper }}>
      {/* Header */}
      <div style={{ background: SC.navy, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#fff', padding: '6px 14px 10px' }}>
          <span style={{ fontSize: 16, width: 20 }}>←</span>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, marginRight: 20 }}>Savings account</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: SC.ink, fontWeight: 700, marginBottom: 10 }}>
          <span>Available account</span>
          <span style={{ color: SC.grey, fontWeight: 500, fontSize: 9 }}>01 Jan. 2020 16:30</span>
        </div>

        {ACCOUNTS.map((acct, idx) => (
          <div key={acct.name} style={{ background: '#fff', borderRadius: 10, padding: '11px 12px', marginBottom: 10, boxShadow: '0 2px 10px -7px rgba(0,0,0,.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: SC.ink, display: 'flex', alignItems: 'center', gap: 5 }}>
                {acct.name}
                {acct.active && <span style={{ fontSize: 7, fontWeight: 700, color: '#fff', background: SC.green, borderRadius: 3, padding: '1px 4px' }}>Active</span>}
              </div>
              <div style={{ fontSize: 9, color: SC.grey }}>{acct.no}</div>
            </div>
            <div style={{ fontSize: 9, color: SC.grey, marginTop: 4 }}>{acct.meta}</div>

            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
              {[
                { k: 'Available balance (THB)', v: acct.avail },
                { k: 'Current balance (THB)',   v: acct.current },
              ].map(row => (
                <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '2px 0' }}>
                  <span style={{ color: SC.grey }}>{row.k}</span>
                  <span style={{ color: SC.ink, fontWeight: 800 }}>{row.v}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid #f3f4f6', fontSize: 10, fontWeight: 600 }}>
              <button type="button" onClick={() => setOpen(open === idx ? null : idx)} style={{ color: SC.grey, cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontSize: 10, fontWeight: 600, fontFamily: SC.ui }}>
                Transaction history ›
              </button>
              <span style={{ color: SC.navyL }}>Transfer ›</span>
            </div>

            {/* Expandable transactions */}
            {open === idx && (
              <div>
                {acct.txs.map(tx => (
                  <div key={tx.d} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, padding: '6px 0', borderTop: '1px solid #f3f4f6' }}>
                    <span style={{ color: SC.grey }}>{tx.d}</span>
                    <span style={{ fontWeight: 700, color: tx.pos ? SC.green : SC.red }}>{tx.a}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{ textAlign: 'center', fontSize: 9, color: SC.grey, lineHeight: 1.55, marginTop: 6 }}>
          To view account statements or make other transactions<br />Please download <strong style={{ color: SC.navy, fontWeight: 700 }}>M Choice</strong>
        </div>
      </div>
    </div>
  )
}
