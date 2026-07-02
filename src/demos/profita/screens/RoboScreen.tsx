'use client'
import { SC, SW, SH } from './_screenTokens'
import { TabBar } from './_TabBar'

const PLANS = [
  { dot: '#6b8cc4', name: 'Early retirement plan', value: '6,374.40', chg: '+893.42 ฿ (+30%)', tag: 'Long term growth plan' },
  { dot: SC.gold,   name: 'Travel plan',           value: '14,873.60',chg: '+1,487.36 ฿ (+10%)',tag: 'Travel plan' },
]

const RECS = [
  { name: 'First home',    desc: 'Plan for your life goals', min: '5,000', bg: 'linear-gradient(135deg,#9db98f,#6f8f74)' },
  { name: 'First million', desc: 'Having your first million', min: '10,000', bg: 'linear-gradient(135deg,#c8b98f,#a68f5f)' },
]

export function RoboScreen() {
  return (
    <div style={{ width: SW, height: SH, display: 'flex', flexDirection: 'column', fontFamily: SC.ui, fontSize: 11, background: SC.paper, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: SC.navy, padding: '6px 14px 0', borderRadius: '0 0 18px 18px', flexShrink: 0, position: 'relative', zIndex: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', padding: '4px 2px 2px' }}>
          <span style={{ fontSize: 16 }}>←</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Robo - Advisor</span>
          <span style={{ fontSize: 16 }}>+</span>
        </div>
        <div style={{ textAlign: 'center', marginTop: 2, paddingBottom: 5 }}>
          <span style={{ background: 'rgba(8,18,32,.5)', color: '#fff', fontSize: 9, fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>Your risk level 5/5</span>
        </div>
        {/* Total value card */}
        <div style={{
          background: '#fff', borderRadius: 12, margin: '10px 4px -40px', padding: '12px 10px',
          textAlign: 'center', boxShadow: '0 12px 24px -12px rgba(0,0,0,.5)', position: 'relative', zIndex: 3,
        }}>
          <div style={{ color: SC.grey, fontSize: 9 }}>Latest total value (baht)</div>
          <div style={{ color: SC.ink, fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginTop: 2 }}>21,248.00</div>
          <div style={{ color: SC.green, fontSize: 10, fontWeight: 700, marginTop: 2 }}>+42.1 (+10%)</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '52px 14px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: SC.ink, fontWeight: 700, fontSize: 10, marginBottom: 8 }}>
          <span>All plans</span><span style={{ color: SC.grey, fontWeight: 600 }}>2 plans</span>
        </div>

        {PLANS.map(plan => (
          <div key={plan.name} style={{ background: '#fff', borderRadius: 10, padding: '10px 11px', marginBottom: 8, boxShadow: '0 2px 10px -7px rgba(0,0,0,.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: SC.ink, fontWeight: 600 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: plan.dot, display: 'inline-block', flexShrink: 0 }} />
              {plan.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: SC.ink, lineHeight: 1 }}>{plan.value}</div>
                <div style={{ fontSize: 8, color: SC.grey, marginTop: 2 }}>Latest total value (baht)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: SC.green }}>{plan.chg}</div>
                <div style={{ fontSize: 8, color: SC.grey, marginTop: 2 }}>{plan.tag}</div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ color: SC.ink, fontWeight: 800, fontSize: 11, margin: '8px 0 8px' }}>Recommended plan</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {RECS.map(r => (
            <div key={r.name} style={{ flexShrink: 0, width: 120, background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 3px 12px -7px rgba(0,0,0,.3)' }}>
              <div style={{ height: 58, background: r.bg }} />
              <div style={{ padding: '8px 9px' }}>
                <div style={{ fontWeight: 800, fontSize: 11, color: SC.ink }}>{r.name}</div>
                <div style={{ fontSize: 8, color: SC.grey, marginTop: 1 }}>{r.desc}</div>
                <div style={{ fontSize: 9, color: SC.ink, marginTop: 5 }}>Starting at <strong style={{ color: SC.gold }}>{r.min}</strong> THB</div>
                <div style={{ marginTop: 6, background: SC.navy, color: '#fff', textAlign: 'center', borderRadius: 6, padding: '5px', fontSize: 9, fontWeight: 700 }}>Invest now</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TabBar active="robo" />
    </div>
  )
}
