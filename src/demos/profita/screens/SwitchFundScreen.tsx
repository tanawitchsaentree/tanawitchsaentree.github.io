'use client'
import { useState } from 'react'
import { SC, SW, SH } from './_screenTokens'

const INTER_BAHT = 3421.22

export function SwitchFundScreen() {
  const [mode, setMode] = useState<'THB' | 'Unit'>('THB')
  const [pct, setPct]   = useState<number | null>(null)

  const baht = pct ? INTER_BAHT * (pct / 100) : 0
  const NAV  = 12.5
  const interStr = mode === 'THB' ? INTER_BAHT.toFixed(2) + ' THB' : (INTER_BAHT / NAV).toFixed(2) + ' Unit'
  const totalStr = mode === 'THB' ? baht.toFixed(2) + ' THB' : (baht / NAV).toFixed(2) + ' Unit'

  return (
    <div style={{ width: SW, height: SH, display: 'flex', flexDirection: 'column', fontFamily: SC.ui, fontSize: 11, overflow: 'hidden', background: SC.paper }}>
      {/* Header */}
      <div style={{ background: SC.navy, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#fff', padding: '6px 14px 10px' }}>
          <span style={{ fontSize: 16, width: 20 }}>←</span>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, marginRight: 20 }}>Switch Fund</span>
        </div>
      </div>
      <div style={{ background: '#faf1dc', color: '#9a7b2e', fontSize: 9, padding: '7px 14px', display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
        ⏱ Closing time for orders is 12:30 (every business day)
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 8px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: SC.ink, marginBottom: 7 }}>Switch-out funds</div>
        <div style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', marginBottom: 10, boxShadow: '0 2px 10px -7px rgba(0,0,0,.2)' }}>
          <div style={{ fontSize: 8, color: SC.grey }}>Fund</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: SC.ink, marginTop: 2 }}>LHIP-D | LH Thai property</div>
          <div style={{ fontSize: 9, color: SC.grey, marginTop: 1 }}>LH Thai Property Open Fund</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: SC.ink, marginTop: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: SC.navy, display: 'inline-block', flexShrink: 0 }} />
            Asset Management Company Limited
          </div>
          {[
            { k: 'Unitholder number',    v: '2442140921' },
            { k: 'Interchangeable value', v: interStr },
          ].map(row => (
            <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginTop: 7, paddingTop: 7, borderTop: '1px solid #f3f4f6' }}>
              <span style={{ color: SC.grey }}>{row.k}</span>
              <span style={{ color: SC.ink, fontWeight: 700 }}>{row.v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, fontWeight: 800, color: SC.ink, marginBottom: 7 }}>
          <span>Switch-in fund</span>
          <button type="button" style={{ color: SC.navyL, fontWeight: 600, fontSize: 9, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: SC.ui }}>Change funds</button>
        </div>
        <div style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', marginBottom: 12, boxShadow: '0 2px 10px -7px rgba(0,0,0,.2)' }}>
          <div style={{ fontSize: 8, color: SC.grey }}>Fund</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: SC.ink, marginTop: 2 }}>LHDEBT-A | LH Thai property</div>
          <div style={{ fontSize: 9, color: SC.grey, marginTop: 1 }}>LH Fixed Income Fund, Accumulated Value Type</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginTop: 7, paddingTop: 7, borderTop: '1px solid #f3f4f6' }}>
            <span style={{ color: SC.grey }}>Unitholder number</span>
            <span style={{ color: SC.ink, fontWeight: 700 }}>1111111111</span>
          </div>
        </div>

        {/* Specify amount */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, fontWeight: 700, color: SC.ink, marginBottom: 8 }}>
          <span>Specify amount</span>
          <div style={{ display: 'flex', background: '#eceef2', borderRadius: 8, padding: 2 }}>
            {(['THB', 'Unit'] as const).map(m => (
              <button key={m} type="button" onClick={() => setMode(m)} style={{ padding: '4px 10px', fontSize: 10, fontWeight: 700, borderRadius: 6, background: mode === m ? '#fff' : 'transparent', color: mode === m ? SC.ink : SC.grey, cursor: 'pointer', border: 'none', fontFamily: SC.ui }}>{m}</button>
            ))}
          </div>
        </div>

        {/* Quick % */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[25, 50, 100].map(p => (
            <button key={p} type="button" onClick={() => setPct(pct === p ? null : p)} style={{ border: `1px solid ${pct === p ? SC.navy : '#d5d9e0'}`, color: pct === p ? '#fff' : SC.navy, borderRadius: 20, padding: '4px 10px', fontSize: 10, fontWeight: 700, background: pct === p ? SC.navy : '#fff', cursor: 'pointer', fontFamily: SC.ui }}>
              {p === 100 ? 'All' : p + '%'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '9px 0', borderTop: '1px solid #e6e8ec' }}>
          <span style={{ color: SC.grey }}>Total</span>
          <span style={{ fontWeight: 800, color: SC.ink }}>{totalStr}</span>
        </div>
        <div style={{ fontSize: 9, color: SC.grey, display: 'flex', gap: 4, alignItems: 'center' }}>
          • Minimum switch-out value ({mode}) 500.00
        </div>
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, padding: '10px 14px 14px', background: '#fff', borderTop: '1px solid #eef0f3' }}>
        <button style={{ width: '100%', background: SC.navy, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, fontSize: 12, fontFamily: SC.ui, cursor: 'pointer' }}>Next</button>
      </div>
    </div>
  )
}
