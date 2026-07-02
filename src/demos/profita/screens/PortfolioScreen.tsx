'use client'
import { SC, SW, SH } from './_screenTokens'
import { TabBar } from './_TabBar'

// SVG donut — avoids Chart.js dependency
const SLICES = [
  { name: 'DIY',            pct: 60, color: '#5cb37f' },
  { name: 'Retirement Pl…', pct: 30, color: '#8a6fc0' },
  { name: 'Travel Plan',    pct: 10, color: '#d3ac57' },
]

function Donut({ size = 72 }: { size?: number }) {
  const cx = size / 2, cy = size / 2
  const r  = size * 0.36
  const cut = size * 0.22  // inner radius as ratio

  let cursor = -90  // start from top
  const paths: React.ReactNode[] = []

  SLICES.forEach((s, i) => {
    const deg    = s.pct / 100 * 360
    const large  = deg > 180 ? 1 : 0
    const gap    = 2 // gap degrees between slices
    const start  = cursor + (i === 0 ? 0 : gap / 2)
    const end    = cursor + deg - gap / 2

    const toRad  = (d: number) => (d * Math.PI) / 180
    const x1 = cx + r * Math.cos(toRad(start))
    const y1 = cy + r * Math.sin(toRad(start))
    const x2 = cx + r * Math.cos(toRad(end))
    const y2 = cy + r * Math.sin(toRad(end))

    const xi1 = cx + cut * Math.cos(toRad(end))
    const yi1 = cy + cut * Math.sin(toRad(end))
    const xi2 = cx + cut * Math.cos(toRad(start))
    const yi2 = cy + cut * Math.sin(toRad(start))

    paths.push(
      <path
        key={s.name}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${cut} ${cut} 0 ${large} 0 ${xi2} ${yi2} Z`}
        fill={s.color}
      />
    )
    cursor += deg
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
    </svg>
  )
}

const ITEMS = [
  { color: '#5cb37f', label: 'DIY',            value: '37,375.31', pct: '60%', chg: '+5,005.55 (+15.10%)', up: true },
  { color: '#8a6fc0', label: 'Retirement Plan', value: '9,248.00',  pct: '30%', chg: '-10.2 (-8.10%)',       up: false },
  { color: '#d3ac57', label: 'Travel Plan',     value: '1,248.00',  pct: '10%', chg: '0 (0%)',               up: null },
]

export function PortfolioScreen() {
  return (
    <div style={{ width: SW, height: SH, display: 'flex', flexDirection: 'column', fontFamily: SC.ui, fontSize: 11, background: SC.paper, overflow: 'hidden' }}>
      {/* Navy header */}
      <div style={{ background: SC.navy, padding: '6px 14px 16px', borderRadius: '0 0 18px 18px', flexShrink: 0, textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 13, fontWeight: 700, padding: '4px 0 8px' }}>Portfolio</div>
        <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 9 }}>Latest total value (baht)</div>
        <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-.02em', marginTop: 2 }}>263,476.00</div>
        <div style={{ color: '#5fd39a', fontSize: 10, fontWeight: 700, marginTop: 2 }}>+31,342.21 (+12%)</div>
        <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 8, marginTop: 3 }}>As of 31 Oct. 2020</div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 8px' }}>
        <div style={{ color: SC.ink, fontWeight: 800, fontSize: 10, marginBottom: 8 }}>Overview of investment portfolio</div>

        {/* Donut + legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 12, padding: '12px 12px', boxShadow: '0 3px 12px -7px rgba(0,0,0,.25)' }}>
          <div style={{ flexShrink: 0 }}><Donut size={72} /></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {SLICES.map(s => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: SC.ink }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
                  {s.name}
                </span>
                <strong style={{ fontWeight: 700 }}>{s.pct}%</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Holdings */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: SC.ink, fontWeight: 700, fontSize: 10, marginBottom: 7, paddingBottom: 7, borderBottom: '1px solid #e6e8ec' }}>
            <span>DIY port</span><a style={{ color: SC.navyL, fontWeight: 600, fontSize: 9, textDecoration: 'none' }}>More detail ›</a>
          </div>
          {ITEMS.map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: SC.ink, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                  {item.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: SC.ink, marginTop: 3 }}>{item.value}</div>
                <div style={{ fontSize: 8, color: SC.grey, marginTop: 1 }}>Latest total value (baht)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: SC.grey }}>{item.pct}</div>
                <div style={{ fontSize: 9, fontWeight: 700, marginTop: 2, color: item.up === true ? SC.green : item.up === false ? SC.red : SC.grey }}>{item.chg}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Saving account */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', boxShadow: '0 2px 10px -7px rgba(0,0,0,.25)', marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: SC.ink, fontWeight: 700, fontSize: 10, marginBottom: 6 }}>
            <span>Saving Account</span><a style={{ color: SC.navyL, fontWeight: 600, fontSize: 9, textDecoration: 'none' }}>See all ›</a>
          </div>
          <div style={{ fontSize: 9, color: SC.grey }}>221-1-12345-1 · Saving Account</div>
          <div style={{ color: SC.ink, fontWeight: 800, fontSize: 12, marginTop: 4, textAlign: 'right' }}>1,000,000.00 THB</div>
        </div>
      </div>

      <TabBar active="portfolio" />
    </div>
  )
}
