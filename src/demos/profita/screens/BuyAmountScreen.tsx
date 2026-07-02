'use client'
import { useState } from 'react'
import { SC, SW, SH } from './_screenTokens'

const KEYS = ['1','2','3','4','5','6','7','8','9','000','0','⌫']
const QUICK = ['5,000','10,000','50,000']

function fmt(n: string) {
  const num = parseInt(n || '0', 10)
  return num === 0 ? '0' : num.toLocaleString()
}

export function BuyAmountScreen() {
  const [digits, setDigits] = useState('5000')

  function tap(k: string) {
    setDigits(prev => {
      if (k === '⌫') return prev.slice(0, -1)
      if (k === '000') return prev === '' || prev === '0' ? '' : prev + '000'
      const next = (prev === '0' ? '' : prev) + k
      return next.length > 9 ? prev : next
    })
  }

  const amount = parseInt(digits || '0', 10)
  const valid = amount >= 5000

  return (
    <div style={{ width: SW, height: SH, display: 'flex', flexDirection: 'column', fontFamily: SC.ui, fontSize: 11, overflow: 'hidden', background: SC.paper }}>
      {/* Header */}
      <div style={{ background: SC.navy, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#fff', padding: '6px 14px 10px' }}>
          <span style={{ fontSize: 16, width: 20 }}>←</span>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700, marginRight: 20 }}>Buy</span>
        </div>
        <div style={{ color: '#fff', padding: '0 14px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800 }}>LHIP-D | LH Thai property</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>LH Thai Property Open Fund</div>
        </div>
      </div>

      {/* Amount display */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: SC.paper }}>
        <div style={{ textAlign: 'center', padding: '20px 14px 14px' }}>
          <div style={{ fontSize: 9, color: SC.grey }}>Amount</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: SC.ink, letterSpacing: '-.02em', marginTop: 4, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
            {fmt(digits)}
            <span style={{ fontSize: 13, color: SC.grey, fontWeight: 600 }}>THB</span>
            <span style={{ display: 'inline-block', width: 2, height: 28, background: SC.gold, marginLeft: 2, animation: 'prof-blink 1s step-end infinite' }} />
          </div>
          <div style={{ fontSize: 9, color: SC.grey, marginTop: 6 }}>Minimum first buy 5,000.00 THB</div>
        </div>

        {/* Quick amounts */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '0 14px 12px' }}>
          {QUICK.map(q => (
            <button key={q} type="button" onClick={() => setDigits(q.replace(/,/g, ''))}
              style={{ border: '1px solid #d5d9e0', color: SC.navy, borderRadius: 20, padding: '5px 10px', fontSize: 10, fontWeight: 700, background: '#fff', cursor: 'pointer', fontFamily: SC.ui }}>
              {q}
            </button>
          ))}
        </div>

        {/* Debit account */}
        <div style={{ margin: '0 14px 10px', background: '#fff', borderRadius: 10, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 10px -7px rgba(0,0,0,.2)' }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(33,58,94,.1)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: SC.ink }}>Irregular savings</div>
            <div style={{ fontSize: 8, color: SC.grey }}>221-1-12345-1 · 40,000.00 THB</div>
          </div>
          <span style={{ fontSize: 10, color: SC.navyL, fontWeight: 600 }}>Change ›</span>
        </div>

        {/* Keypad */}
        <div style={{ marginTop: 'auto', background: '#e7e9ee', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {KEYS.map(k => (
            <button key={k} type="button" onClick={() => tap(k)}
              style={{ background: '#f6f7f9', textAlign: 'center', padding: '14px 0', fontSize: 17, fontWeight: 600, color: SC.ink, cursor: 'pointer', userSelect: 'none', border: 'none', fontFamily: SC.ui }}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, padding: '10px 14px 14px', background: '#fff' }}>
        <button style={{ width: '100%', background: valid ? SC.navy : SC.greyL, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, fontSize: 12, fontFamily: SC.ui, cursor: valid ? 'pointer' : 'not-allowed' }}>
          Next
        </button>
      </div>
    </div>
  )
}
