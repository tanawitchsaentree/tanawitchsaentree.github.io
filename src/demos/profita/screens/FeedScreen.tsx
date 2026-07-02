'use client'
// Feed screen — static render, 300×650 logical px, scales via parent transform
import { SC, SW, SH } from './_screenTokens'
import { TabBar } from './_TabBar'

const FUND_CARDS = [
  { code: 'LHTPROP', pct: '5.60%', sub: 'Past 1-year return', cat: 'Property',      bg: SC.navy,     fg: '#fff' },
  { code: 'LHFL',    pct: '10.60%',sub: 'Past 1-year return', cat: 'Foreign funds', bg: SC.goldCard, fg: '#3a3220' },
  { code: 'LHMSFL-A',pct: '5.60%', sub: 'Past 1-year return', cat: 'Fixed Income',  bg: '#fff',      fg: SC.ink },
]

const REC_CARDS = [
  { code: 'LHTPROP', pct: '5.60%', cat: 'Property', bg: SC.goldL,  fg: '#3a3220' },
  { code: 'LHIP-D',  pct: '4.20%', cat: 'Property', bg: SC.navyD,  fg: '#fff'     },
]

export function FeedScreen() {
  return (
    <div style={{
      width: SW, height: SH,
      display: 'flex', flexDirection: 'column',
      fontFamily: SC.ui, fontSize: 11, lineHeight: 1.3,
      background: SC.paper, overflow: 'hidden',
    }}>
      {/* Navy header */}
      <div style={{
        background: SC.navy, padding: '6px 16px 16px',
        borderRadius: '0 0 0 32px',
        boxShadow: '0 8px 16px -10px rgba(12,25,48,.45)',
        flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', color: '#fff', fontWeight: 600, letterSpacing: '.18em', fontSize: 13, padding: '2px 0' }}>
          LH <strong style={{ fontWeight: 800 }}>BANK</strong>
          <div style={{ width: 32, height: 4, margin: '3px auto 0', background: 'repeating-linear-gradient(90deg,#fff 0 3px,transparent 3px 5px)' }} />
        </div>
        {/* Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7d6b58,#4a3e33)', flexShrink: 0, boxShadow: '0 0 0 2px rgba(255,255,255,.15)' }} />
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, flex: 1 }}>Hi there, Tony</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity=".9"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
        </div>
        {/* Ticker */}
        <div style={{ marginTop: 10, background: 'rgba(255,255,255,.10)', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', color: '#fff' }}>
          <span style={{ fontSize: 11, color: SC.goldL }}>📣</span>
          <span style={{ flex: 1, fontSize: 10, color: 'rgba(255,255,255,.92)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>The CAD dollar weakens as…</span>
          <span style={{ fontSize: 10, color: '#fff', whiteSpace: 'nowrap', fontWeight: 600 }}>Read ›</span>
        </div>
        {/* Robo promo */}
        <div style={{ marginTop: 10, background: '#fff', borderRadius: 16, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center', boxShadow: '0 8px 16px -10px rgba(0,0,0,.5)' }}>
          <div style={{ width: 52, height: 44, borderRadius: 8, background: 'radial-gradient(circle at 40% 40%,#f3ead4,#e9dcc0)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 11, bottom: 7, width: 9, height: 16, background: '#5b7a54', borderRadius: 2 }} />
            <div style={{ position: 'absolute', right: 9, bottom: 6, width: 12, height: 14, background: SC.navy, borderRadius: 2 }} />
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ color: SC.ink, fontWeight: 800, fontSize: 10, letterSpacing: '.02em', borderLeft: `3px solid ${SC.gold}`, paddingLeft: 6, display: 'inline-block' }}>ROBO ADVISOR</div>
            <div style={{ color: '#4a5867', fontSize: 9, marginTop: 3, lineHeight: 1.35 }}>Automatic mutual fund portfolio creation service.</div>
            <div style={{ color: SC.ink, fontWeight: 700, fontSize: 10, marginTop: 5 }}>Start at <strong style={{ color: SC.gold, fontWeight: 800 }}>5,000 THB</strong> →</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0 4px' }}>
        {/* Section: Highest return */}
        <div style={{ padding: '0 14px', marginBottom: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: SC.ink, fontWeight: 800, fontSize: 11 }}>Highest return fund</span>
          <span style={{ color: SC.navyL, fontSize: 10, fontWeight: 600 }}>See more ›</span>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '2px 14px', overflowX: 'auto' }}>
          {FUND_CARDS.map(fc => (
            <div key={fc.code} style={{
              flexShrink: 0, width: 94, borderRadius: 10, padding: '10px 10px 10px', background: fc.bg,
              color: fc.fg, border: fc.bg === '#fff' ? '1px solid #eceef1' : 'none', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', right: -14, top: -8, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
              <div style={{ fontSize: 9, fontWeight: 600, opacity: .85 }}>{fc.code}</div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.02em', marginTop: 1 }}>{fc.pct}</div>
              <div style={{ fontSize: 8, opacity: .72, marginTop: 1 }}>{fc.sub}</div>
              <div style={{ fontSize: 9, fontWeight: 800, marginTop: 14 }}>{fc.cat}</div>
            </div>
          ))}
        </div>
        {/* Dots */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 8 }}>
          <div style={{ width: 16, height: 5, borderRadius: 999, background: SC.navy }} />
          <div style={{ width: 5,  height: 5, borderRadius: 999, background: SC.greyL }} />
          <div style={{ width: 5,  height: 5, borderRadius: 999, background: SC.greyL }} />
        </div>

        {/* Section: Recommended */}
        <div style={{ padding: '0 14px', marginTop: 12, marginBottom: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: SC.ink, fontWeight: 800, fontSize: 11 }}>Recommended funds</span>
          <span style={{ color: SC.navyL, fontSize: 10, fontWeight: 600 }}>See more ›</span>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '2px 14px', overflowX: 'auto' }}>
          {REC_CARDS.map(rc => (
            <div key={rc.code} style={{ flexShrink: 0, width: 160, borderRadius: 10, padding: '11px 12px', background: rc.bg, color: rc.fg }}>
              <div style={{ fontWeight: 800, fontSize: 11 }}>{rc.code} <span style={{ float: 'right', fontSize: 12 }}>{rc.pct}</span></div>
              <div style={{ fontSize: 9, opacity: .8 }}>{rc.cat} <span style={{ float: 'right', fontWeight: 500 }}>Past 1-year return</span></div>
            </div>
          ))}
        </div>
      </div>

      <TabBar active="feed" />
    </div>
  )
}
