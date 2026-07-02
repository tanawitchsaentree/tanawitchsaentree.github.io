'use client'
import { SC, SW, SH } from './_screenTokens'

export function ConfirmScreen() {
  return (
    <div style={{ width: SW, height: SH, display: 'flex', flexDirection: 'column', fontFamily: SC.ui, fontSize: 11, overflow: 'hidden', background: SC.paper }}>
      {/* Header */}
      <div style={{ background: SC.navy, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#fff', padding: '6px 14px 10px' }}>
          <span style={{ fontSize: 16, width: 20 }}>←</span>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, marginRight: 20 }}>Confirm purchase</span>
        </div>
      </div>
      {/* Warning */}
      <div style={{ background: '#faf1dc', color: '#9a7b2e', fontSize: 9, padding: '7px 14px', display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
        ⚠ Closing time for orders is 3:30 p.m. (every business day)
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 8px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {/* Fund block */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '2px 12px', boxShadow: '0 2px 10px -7px rgba(0,0,0,.2)' }}>
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
        <div style={{ background: '#fff', borderRadius: 10, padding: '2px 12px', boxShadow: '0 2px 10px -7px rgba(0,0,0,.2)' }}>
          <div style={{ padding: '9px 0' }}>
            <div style={{ fontSize: 8, color: SC.grey }}>Debited account</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: SC.ink, marginTop: 2 }}>221-1-12345-1</div>
            <div style={{ fontSize: 9, color: SC.grey, marginTop: 1 }}>Irregular savings · John Doe</div>
          </div>
        </div>

        {/* Amount block */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '2px 12px', boxShadow: '0 2px 10px -7px rgba(0,0,0,.2)' }}>
          {[
            { k: 'Amount (Baht)',    v: '5,000.00', big: true  },
            { k: 'Transaction date', v: '31 Oct. 2020' },
            { k: 'Effective date',   v: '01 Nov. 2020' },
          ].map((row, i) => (
            <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none', fontSize: 10 }}>
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
      <div style={{ flexShrink: 0, padding: '10px 14px 14px', background: '#fff', borderTop: '1px solid #eef0f3' }}>
        <button style={{ width: '100%', background: SC.navy, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, fontSize: 12, fontFamily: SC.ui, cursor: 'pointer' }}>
          Confirm
        </button>
      </div>
    </div>
  )
}
