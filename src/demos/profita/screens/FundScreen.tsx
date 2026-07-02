'use client'
import { SC, SW, SH } from './_screenTokens'
import { TabBar } from './_TabBar'

const FUNDS = [
  { code: 'LHGOLDH-E', desc: 'LH Gold Hedge Open Fund', tag: 'Commodity', stars: 5, risk: 8, pct: '+10.10%', up: true,  owned: false },
  { code: 'LHIP-D',    desc: 'LH Thai Property Open Fund',tag: 'Property', stars: 5, risk: 5, pct: '+10.10%', up: true,  owned: true,  hold: '37,375.31' },
  { code: 'KT-BRAIN-A',desc: 'Krungthai AI Brain Open Fund',tag: 'Foreign',stars: 3, risk: 6, pct: '-4.10%',  up: false, owned: false },
  { code: 'LHDEBT-A',  desc: 'LH Fixed Income Fund',      tag: 'Fixed',   stars: 4, risk: 4, pct: '+2.30%',  up: true,  owned: true,  hold: '9,248.00' },
]

function Stars({ n }: { n: number }) {
  return <span style={{ letterSpacing: -1, fontSize: 7 }}>{Array.from({ length: 5 }, (_, i) => i < n ? '★' : '☆').join('')}</span>
}

export function FundScreen() {
  return (
    <div style={{ width: SW, height: SH, display: 'flex', flexDirection: 'column', fontFamily: SC.ui, fontSize: 11, overflow: 'hidden', background: SC.paper }}>
      {/* Header */}
      <div style={{ background: SC.navy, padding: '6px 0 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '6px 14px 10px' }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Fund</span>
          <div style={{ position: 'absolute', right: 14, display: 'flex', gap: 10 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 7h11M4 12h7M4 17h4M17 5v11m0 0l-3-3m3 3l3-3"/></svg>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, padding: '0 14px', color: 'rgba(255,255,255,.6)', fontSize: 10, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,.12)' }}>
          {['All (99)', 'Property', 'Foreign', 'Fixed'].map((t, i) => (
            <div key={t} style={{ padding: '6px 0 8px', position: 'relative', whiteSpace: 'nowrap', color: i === 0 ? '#fff' : 'rgba(255,255,255,.55)', borderBottom: i === 0 ? '2px solid #fff' : 'none' }}>
              {t}
            </div>
          ))}
        </div>
        {/* Chips */}
        <div style={{ display: 'flex', gap: 6, padding: '8px 14px 10px', overflowX: 'auto' }}>
          {['👍 Recommended', '🌱 Dividend', 'Morningstar'].map(c => (
            <div key={c} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, border: `1px solid ${SC.gold}`, color: SC.goldL, borderRadius: 20, padding: '4px 8px', fontSize: 9, fontWeight: 600 }}>
              {c} <span style={{ opacity: .7 }}>✕</span>
            </div>
          ))}
        </div>
      </div>

      {/* Segmented — pulled up */}
      <div style={{ display: 'flex', background: SC.paper, borderRadius: 10, margin: '0 14px', padding: 3, transform: 'translateY(-10px)', boxShadow: '0 4px 12px -6px rgba(0,0,0,.3)', flexShrink: 0 }}>
        {['All','Follow','Owned'].map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: 'center', padding: '5px', fontSize: 10, fontWeight: 700, color: i === 0 ? SC.ink : SC.grey, borderRadius: 8, background: i === 0 ? '#fff' : 'transparent', boxShadow: i === 0 ? '0 1px 4px -1px rgba(0,0,0,.2)' : 'none' }}>{s}</div>
        ))}
      </div>

      {/* Fund list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0 7px', color: SC.grey, fontSize: 9, fontWeight: 600 }}>
          <span style={{ padding: '2px 6px', borderRadius: 6, background: SC.goldL, color: SC.ink, fontWeight: 700 }}>1Y</span>
          {['YTD','1W','1M','3M','6M','3Y','5Y'].map(r => <span key={r} style={{ padding: '2px 2px' }}>{r}</span>)}
        </div>
        <div style={{ textAlign: 'right', color: SC.ink, fontWeight: 800, fontSize: 11, marginBottom: 8 }}><strong>99</strong> Funds</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {FUNDS.map(f => (
            <div key={f.code} style={{ background: '#fff', borderRadius: 11, padding: '11px 12px', boxShadow: '0 3px 12px -7px rgba(0,0,0,.18)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: SC.ink, fontWeight: 800, fontSize: 10, lineHeight: 1.25 }}>{f.code}</div>
                  <div style={{ color: SC.grey, fontSize: 8, marginTop: 2, lineHeight: 1.3 }}>{f.desc}</div>
                  {f.owned && f.hold && <div style={{ display: 'inline-block', background: 'rgba(33,58,94,.08)', color: SC.navy, fontSize: 8, fontWeight: 800, borderRadius: 4, padding: '1px 5px', marginTop: 4 }}>Holding {f.hold} THB</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: SC.navyL, fontSize: 8, fontWeight: 700 }}>{f.tag}</div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: f.up ? SC.green : SC.red, marginTop: 2 }}>{f.pct}</div>
                  <div style={{ color: SC.grey, fontSize: 7 }}>Past 1-year return</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                <div style={{ border: '1px solid #e3e6ea', borderRadius: 5, height: 20, display: 'flex', alignItems: 'center', padding: '0 5px', color: SC.gold, fontSize: 8 }}>👍</div>
                <div style={{ border: '1px solid #e3e6ea', borderRadius: 5, height: 20, display: 'flex', alignItems: 'center', padding: '0 5px', color: SC.gold, fontSize: 8 }}>🌱</div>
                <div style={{ border: '1px solid #e3e6ea', borderRadius: 5, height: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 5px', color: SC.gold }}>
                  <Stars n={f.stars} />
                  <span style={{ fontSize: 5, color: SC.grey }}>MORNINGSTAR</span>
                </div>
                <div style={{ border: '1px solid #e3e6ea', borderRadius: 5, height: 20, display: 'flex', alignItems: 'center', padding: '0 5px', fontSize: 9, color: SC.ink, fontWeight: 600 }}>
                  Risk <strong style={{ background: SC.goldL, borderRadius: '50%', width: 12, height: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, marginLeft: 2 }}>{f.risk}</strong>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: SC.ink, fontWeight: 700 }}>
                  <span style={{ width: 13, height: 13, borderRadius: 4, background: SC.navy, display: 'inline-block' }} />LH Fund
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compare sticky */}
        <div style={{ position: 'sticky', bottom: 4, background: SC.navy, color: '#fff', borderRadius: 16, padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontWeight: 700, fontSize: 10, boxShadow: '0 10px 20px -10px rgba(0,0,0,.5)', marginTop: 8, width: '100%' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,#4a8fd0,#2f6ba8)', flexShrink: 0 }} />
          Compare funds
        </div>
      </div>

      <TabBar active="fund" />
    </div>
  )
}
