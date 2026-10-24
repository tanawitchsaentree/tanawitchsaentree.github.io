'use client'
import type React from 'react'
import { SC, SW, SH } from './_screenTokens'
import type { PurchaseAccount } from '../ProfitaPhoneScreen'

type Props = {
  amount?: string; account?: PurchaseAccount; onBack?: () => void; onConfirm?: () => void
  /** Optional cutoff demo: when given, the dates and the notice follow the order time. */
  cutoff?: { time: string; cutoff: string; after: boolean; today: string; nextDay: string }
}
const DEFAULT_ACCOUNT = { name: 'Savings account', number: '221-1-12345-1', balance: 40000 }

const slideBox = { position: 'relative', display: 'inline-block', height: 14, overflow: 'hidden', verticalAlign: 'bottom' } as const
const slideRow = (after: boolean) => ({ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', transform: after ? 'translateY(-14px)' : 'none', transition: 'transform .5s cubic-bezier(.65,0,.35,1)' }) as const

export function ConfirmScreen({ amount = '5000', account = DEFAULT_ACCOUNT, onBack, onConfirm, cutoff }: Props = {}) {
  const formattedAmount = Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
  return (
    <div style={{ width: SW, height: SH, display: 'flex', flexDirection: 'column', fontFamily: SC.ui, fontSize: 11, overflow: 'hidden', background: SC.paper }}>
      <style>{'@media (prefers-reduced-motion: reduce) { .pf-slide { transition: none !important; } }'}</style>
      {/* Header */}
      <div style={{ background: SC.navy, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', color: SC.white, padding: '6px 14px 10px' }}>
          <button type="button" aria-label="Back to amount" onClick={onBack} style={{ fontSize: 16, width: 20, background: 'none', border: 'none', padding: 0, margin: 0, color: 'inherit', font: 'inherit', cursor: onBack ? 'pointer' : 'default', textAlign: 'left', lineHeight: 1 }}>←</button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, marginRight: 20 }}>Confirm purchase</span>
        </div>
      </div>
      {/* Warning */}
      <div style={{ background: SC.goldTint, color: SC.goldInk, fontSize: 9, padding: '7px 14px', display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
        {cutoff
          ? (cutoff.after ? `Sent after the ${cutoff.cutoff} cutoff. This order moves to the next business day.` : `Sent before the ${cutoff.cutoff} cutoff. This order counts for today.`)
          : 'Check the fund’s order cutoff before confirming.'}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 8px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {/* Fund block */}
        <div style={{ background: SC.white, borderRadius: 10, padding: '2px 12px', boxShadow: SC.cardShadow }}>
          <div style={{ padding: '9px 0' }}>
            <div style={{ fontSize: 8, color: SC.grey }}>Fund</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: SC.ink, marginTop: 2 }}>LHIP-D | LH Thai property</div>
            <div style={{ fontSize: 9, color: SC.grey, marginTop: 1 }}>LH Thai Property Open Fund</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: SC.ink, marginTop: 6 }}>
              <span style={{ width: 13, height: 13, borderRadius: 3, background: SC.navy, display: 'inline-block', flexShrink: 0 }} />
              Asset Management Company Limited
            </div>
          </div>
        </div>

        {/* Account block */}
        <div style={{ background: SC.white, borderRadius: 10, padding: '2px 12px', boxShadow: SC.cardShadow }}>
          <div style={{ padding: '9px 0' }}>
            <div style={{ fontSize: 8, color: SC.grey }}>Payment account</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: SC.ink, marginTop: 2 }}>{account.number}</div>
            <div style={{ fontSize: 9, color: SC.grey, marginTop: 1 }}>{account.name} · Sample customer</div>
          </div>
        </div>

        {/* Amount block */}
        <div style={{ background: SC.white, borderRadius: 10, padding: '2px 12px', boxShadow: SC.cardShadow }}>
          {[
            { k: 'Amount (THB)',    v: formattedAmount as React.ReactNode, big: true  },
            { k: 'Transaction date', v: cutoff ? `${cutoff.today} · ${cutoff.time}` : '31 Oct. 2020' },
            { k: 'Effective date',   v: cutoff
              ? <span style={slideBox}><span className="pf-slide" style={slideRow(cutoff.after)}><span style={{ height: 14, lineHeight: '14px' }}>{cutoff.today}</span><span style={{ height: 14, lineHeight: '14px' }}>{cutoff.nextDay}</span></span></span>
              : '01 Nov. 2020' },
          ].map((row, i) => (
            <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < 2 ? `1px solid ${SC.paper}` : 'none', fontSize: 10 }}>
              <span style={{ color: SC.grey }}>{row.k}</span>
              <span style={{ color: SC.ink, fontWeight: 700, fontSize: row.big ? 14 : 10 }}>{row.v}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 8, color: SC.grey, lineHeight: 1.55, padding: '2px 2px 0' }}>
          The system will deduct money from your deposit account. Investment payment is made at 11.00 a.m. on the effective date.
        </p>
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, padding: '10px 14px 14px', background: SC.white, borderTop: `1px solid ${SC.hairline}` }}>
        <button type="button" onClick={onConfirm} style={{ width: '100%', background: SC.navy, color: SC.white, border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, fontSize: 12, fontFamily: SC.ui, cursor: 'pointer' }}>
          Confirm
        </button>
      </div>
    </div>
  )
}
