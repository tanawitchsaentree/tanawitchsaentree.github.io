'use client'
import { useState } from 'react'
import { SC, SW, SH } from './_screenTokens'
import type { PurchaseAccount } from '../ProfitaPhoneScreen'

const ACCOUNTS = [
  { id: 0, name: 'Savings account', number: '221-1-12345-1', balance: 40000 },
  { id: 1, name: 'e-Saving', number: '221-1-98765-4', balance: 75000 },
]

export function BuyAccountScreen({ account, onBack, onConfirm }: { account?: PurchaseAccount; onBack?: () => void; onConfirm?: (account: PurchaseAccount) => void } = {}) {
  const initial = Math.max(0, ACCOUNTS.findIndex(item => item.number === account?.number))
  const [selected, setSelected] = useState(initial)
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div style={{ width: SW, height: SH, display: 'flex', flexDirection: 'column', fontFamily: SC.ui, fontSize: 11, overflow: 'hidden', background: SC.paper }}>
      {/* Header */}
      <div style={{ background: SC.navy, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#fff', padding: '6px 14px 10px' }}>
          <button type="button" aria-label="Back to amount" onClick={onBack} style={{ fontSize: 16, width: 20, background: 'none', border: 'none', padding: 0, margin: 0, color: 'inherit', font: 'inherit', cursor: onBack ? 'pointer' : 'default', textAlign: 'left', lineHeight: 1 }}>←</button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, marginRight: 20 }}>Select account</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 8px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: SC.ink, marginBottom: 10 }}>Payment account</div>

        {ACCOUNTS.map(acct => (
          <button
            key={acct.id}
            type="button"
            onClick={() => { setSelected(acct.id); setConfirmed(false) }}
            style={{
              background: '#fff', borderRadius: 10, padding: '11px 12px', marginBottom: 9,
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
              boxShadow: '0 2px 10px -7px rgba(0,0,0,.2)',
              border: `1.5px solid ${selected === acct.id ? SC.navy : 'transparent'}`,
              cursor: 'pointer',
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(33,58,94,.1)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: SC.ink }}>{acct.name}</div>
              <div style={{ fontSize: 9, color: SC.grey, marginTop: 2 }}>{acct.number}</div>
              <div style={{ fontSize: 9, color: SC.grey, marginTop: 2 }}>Available <strong style={{ color: SC.ink, fontWeight: 800 }}>{acct.balance.toLocaleString()}.00 THB</strong></div>
            </div>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: `2px solid ${selected === acct.id ? SC.navy : '#cfd4db'}`,
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selected === acct.id && <div style={{ width: 9, height: 9, borderRadius: '50%', background: SC.navy }} />}
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, padding: '10px 14px 14px', background: '#fff', borderTop: '1px solid #eef0f3' }}>
        <button type="button" onClick={() => { if (onConfirm) onConfirm(ACCOUNTS[selected]); else setConfirmed(true) }} style={{ width: '100%', background: confirmed ? SC.green : SC.navy, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, fontSize: 12, fontFamily: SC.ui, cursor: 'pointer' }}>
          {confirmed ? `Selected · ${ACCOUNTS[selected].name}` : `Confirm · ${ACCOUNTS[selected].name}`}
        </button>
      </div>
    </div>
  )
}
