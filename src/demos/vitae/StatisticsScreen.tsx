'use client'

import { PhoneFrame, StatusBar } from './PhoneFrame'
import { V } from './tokens'

const BARS = [
  { pct: '44%',  h: '42%',  day: 'Mon', hatch: true,  peak: false },
  { pct: '34%',  h: '33%',  day: 'Tue', hatch: false, peak: false },
  { pct: '110%', h: '100%', day: 'Wed', hatch: false, peak: true  },
  { pct: '47%',  h: '45%',  day: 'Thu', hatch: false, peak: false },
  { pct: '32%',  h: '31%',  day: 'Fri', hatch: true,  peak: false },
  { pct: '79%',  h: '74%',  day: 'Sat', hatch: false, peak: false },
  { pct: '24%',  h: '24%',  day: 'Sun', hatch: true,  peak: false },
] as const

const EQ_HEIGHTS = [30, 55, 80, 45, 95, 60, 40, 75, 50, 88, 35, 65]

export function StatisticsScreen() {
  return (
    <PhoneFrame offset>
      <div style={{ padding: '14px 15px 0', height: '100%', overflow: 'hidden' }}>
        <StatusBar />

        {/* stat header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: V.color.white, display: 'grid', placeContent: 'center', boxShadow: V.shadow.sm, color: V.color.inkSoft, fontSize: 14 }}>‹</span>
          <b style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 15 }}>Statistic</b>
          <span style={{ width: 32, height: 32, borderRadius: '50%', background: V.color.white, display: 'grid', placeContent: 'center', boxShadow: V.shadow.sm, color: V.color.inkSoft, fontSize: 14 }}>⋯</span>
        </div>

        {/* calorie block */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 12, color: V.color.inkSoft, marginBottom: 2 }}>Calories</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
            <b style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 40, lineHeight: 1 }}>1250</b>
            <span style={{ fontSize: 13, color: V.color.inkSoft }}>Kcal</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: V.color.muted }}>
              Target: <b style={{ fontSize: 11, color: V.color.ink, fontWeight: 700 }}>1920 Kcal</b>
            </span>
          </div>
        </div>

        {/* bar chart */}
        <div
          style={{
            display:        'flex',
            alignItems:     'flex-end',
            justifyContent: 'space-between',
            gap:            6,
            height:         188,
            margin:         '18px 0 4px',
            paddingTop:     20,
          }}
        >
          {BARS.map(bar => (
            <div
              key={bar.day}
              style={{
                flex:          1,
                display:       'flex',
                flexDirection: 'column',
                alignItems:    'center',
                justifyContent:'flex-end',
                height:        '100%',
                gap:           6,
              }}
            >
              <span style={{ fontSize: 9, color: bar.peak ? V.color.limeDeep : V.color.muted, fontWeight: 700 }}>{bar.pct}</span>
              <div
                style={{
                  width:        11,
                  height:       bar.h,
                  borderRadius: 7,
                  background:   bar.peak
                    ? V.color.limeDeep
                    : bar.hatch
                    ? `repeating-linear-gradient(135deg,${V.color.paper2},${V.color.paper2} 3px,${V.color.hatchStripe} 3px,${V.color.hatchStripe} 6px)`
                    : V.color.limeBright,
                }}
              />
              <span style={{ fontSize: 9, color: bar.peak ? V.color.ink : V.color.muted, fontWeight: bar.peak ? 700 : 400 }}>{bar.day}</span>
            </div>
          ))}
        </div>

        {/* metric tiles 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>

          {/* Exercise */}
          <div style={{ background: V.color.white, borderRadius: 18, padding: 13, boxShadow: V.shadow.sm }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: V.color.inkSoft, marginBottom: 9 }}>
              <span style={{ width: 24, height: 24, borderRadius: 8, background: V.color.tileExerciseBg, color: V.color.limeDeep, display: 'grid', placeContent: 'center', fontSize: 12 }}>🏋</span>
              Exercise
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 26, marginBottom: 6 }}>
              {EQ_HEIGHTS.map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: V.color.limeDeep, borderRadius: 2, opacity: .85 }} />
              ))}
            </div>
            <div style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 19 }}>
              2.0 <small style={{ fontSize: 11, color: V.color.muted, fontWeight: 400 }}>hours</small>
            </div>
          </div>

          {/* BPM */}
          <div style={{ background: V.color.white, borderRadius: 18, padding: 13, boxShadow: V.shadow.sm }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: V.color.inkSoft, marginBottom: 9 }}>
              <span style={{ width: 24, height: 24, borderRadius: 8, background: V.color.tileBpmBg, color: V.color.coral, display: 'grid', placeContent: 'center', fontSize: 12 }}>♥</span>
              BPM
            </div>
            <svg viewBox="0 0 110 30" style={{ width: '100%', height: 28, marginBottom: 6 }} aria-hidden="true">
              <path d="M0 15 H18 l4 -9 l5 18 l5 -22 l5 22 l4 -9 H62 l4 -9 l5 18 l5 -22 l5 22 l4 -9 H110" fill="none" stroke={V.color.coral} strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <div style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 19 }}>
              86 <small style={{ fontSize: 11, color: V.color.muted, fontWeight: 400 }}>bpm</small>
            </div>
          </div>

          {/* Weight */}
          <div style={{ background: V.color.white, borderRadius: 18, padding: 13, boxShadow: V.shadow.sm }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: V.color.inkSoft, marginBottom: 9 }}>
              <span style={{ width: 24, height: 24, borderRadius: 8, background: V.color.tileWeightBg, color: V.color.tileWeightFg, display: 'grid', placeContent: 'center', fontSize: 12 }}>⚖</span>
              Weight
            </div>
            <div style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 19 }}>
              68.5 <small style={{ fontSize: 11, color: V.color.muted, fontWeight: 400 }}>kg</small>
            </div>
          </div>

          {/* Water */}
          <div style={{ background: V.color.white, borderRadius: 18, padding: 13, boxShadow: V.shadow.sm }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: V.color.inkSoft, marginBottom: 9 }}>
              <span style={{ width: 24, height: 24, borderRadius: 8, background: V.color.tileWaterBg, color: V.color.blue, display: 'grid', placeContent: 'center', fontSize: 12 }}>💧</span>
              Water
            </div>
            <div style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 19 }}>
              2.4 <small style={{ fontSize: 11, color: V.color.muted, fontWeight: 400 }}>L</small>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  )
}
