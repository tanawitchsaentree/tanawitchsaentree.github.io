'use client'
import { SC, SW, SH } from './_screenTokens'

const RECEIPT = [
  { k: 'Purchase',         v: 'LHIP-D\nLH Thai property' },
  { k: 'Fund company',     v: 'Asset Management Co., Ltd.' },
  { k: 'Saving account',   v: '221-1-12345-1' },
  { k: 'Total (THB)',      v: '5,000.00' },
  { k: 'Transaction date', v: '31 Oct. 2020' },
  { k: 'Effective date',   v: '01 Nov. 2020' },
]

export function OrderSuccessScreen() {
  return (
    <div style={{ width: SW, height: SH, display: 'flex', flexDirection: 'column', fontFamily: SC.ui, fontSize: 11, overflow: 'hidden', background: '#fff' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 8px', textAlign: 'center' }}>
        <div style={{ fontWeight: 600, letterSpacing: '.2em', color: SC.navy, fontSize: 11, marginTop: 4 }}>LH BANK</div>

        {/* Check circle */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%', background: SC.green,
          margin: '16px auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 22,
          animation: 'prof-pop .55s cubic-bezier(.34,1.56,.64,1) both',
        }}>✓</div>

        <div style={{ fontSize: 12, fontWeight: 800, color: SC.green, lineHeight: 1.3 }}>
          The order was completed<br />successfully. <span style={{ fontWeight: 600 }}>(pending)</span>
        </div>
        <div style={{ fontSize: 9, color: SC.grey, marginTop: 4 }}>31 Oct. 2020 | 10:20 a.m.</div>
        <div style={{ fontSize: 8, color: SC.grey, marginTop: 2 }}>Reference number 20200102010203320…</div>

        {/* Receipt */}
        <div style={{ textAlign: 'left', border: '1px dashed #d5d9e0', borderRadius: 10, padding: '2px 12px', marginTop: 14 }}>
          {RECEIPT.map((row, i) => (
            <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < RECEIPT.length - 1 ? '1px solid #f3f4f6' : 'none', fontSize: 10 }}>
              <span style={{ color: SC.grey, whiteSpace: 'nowrap' }}>{row.k}</span>
              <span style={{ color: SC.ink, fontWeight: 700, textAlign: 'right' }}>{row.v.split('\n').map((l, j) => <span key={j} style={{ display: 'block' }}>{l}</span>)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ flexShrink: 0, display: 'flex', padding: '10px 14px 14px', gap: 24, justifyContent: 'center', background: '#fff', borderTop: '1px solid #eef0f3' }}>
        {[
          { label: 'Share receipt' },
          { label: 'Save to Album' },
        ].map(a => (
          <div key={a.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: SC.navy, fontSize: 9, fontWeight: 600 }}>
            <div style={{ width: 16, height: 16, borderRadius: 3, background: 'rgba(33,58,94,.15)' }} />
            {a.label}
          </div>
        ))}
      </div>
    </div>
  )
}
