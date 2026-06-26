'use client'

import { V } from './tokens'
import { PhoneShell } from './ui/PhoneShell'
import { StatusBar }  from './ui/StatusBar'
import { TabBar }     from './ui/TabBar'

const BARS = [
  { pct: '44%',  h: 42,  day: 'Mon', hatch: true,  peak: false },
  { pct: '34%',  h: 33,  day: 'Tue', hatch: false, peak: false },
  { pct: '110%', h: 100, day: 'Wed', hatch: false, peak: true  },
  { pct: '47%',  h: 45,  day: 'Thu', hatch: false, peak: false },
  { pct: '32%',  h: 31,  day: 'Fri', hatch: true,  peak: false },
  { pct: '79%',  h: 74,  day: 'Sat', hatch: false, peak: false },
  { pct: '24%',  h: 24,  day: 'Sun', hatch: true,  peak: false },
] as const

const EQ_HEIGHTS = [30, 55, 80, 45, 95, 60, 40, 75, 50, 88, 35, 65]

/* ── Stat nav bar ────────────────────────────────────── */
function StatNavBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 12px' }}>
      <span style={{ width: 32, height: 32, borderRadius: '50%', background: V.color.white, display: 'grid', placeContent: 'center', boxShadow: V.shadow.sm, color: V.color.inkSoft, fontSize: 16, cursor: 'pointer' }}>‹</span>
      <b style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 16 }}>Statistic</b>
      <span style={{ width: 32, height: 32, borderRadius: '50%', background: V.color.white, display: 'grid', placeContent: 'center', boxShadow: V.shadow.sm, color: V.color.inkSoft, fontSize: 16, cursor: 'pointer' }}>···</span>
    </div>
  )
}

/* ── Calorie header ──────────────────────────────────── */
function CalorieHeader() {
  return (
    <div style={{ padding: '0 16px 4px' }}>
      <div style={{ fontSize: 12, color: V.color.inkSoft, marginBottom: 2 }}>Calories</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
        <b style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 38, lineHeight: 1 }}>1250</b>
        <span style={{ fontSize: 13, color: V.color.inkSoft }}>Kcal</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: V.color.muted }}>
          Target: <b style={{ fontSize: 11, color: V.color.ink, fontWeight: 700 }}>1920 Kcal</b>
        </span>
      </div>
    </div>
  )
}

/* ── Bar chart ───────────────────────────────────────── */
function BarChart() {
  return (
    <div style={{ padding: '0 16px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 5, height: 130, paddingTop: 18 }}>
        {BARS.map(bar => (
          <div key={bar.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 4 }}>
            <span style={{ fontSize: 8, color: bar.peak ? V.color.limeDeep : V.color.muted, fontWeight: 700 }}>{bar.pct}</span>
            <div
              style={{
                width:        10,
                height:       `${bar.h}%`,
                borderRadius: 6,
                background:   bar.peak
                  ? V.color.limeDeep
                  : bar.hatch
                  ? `repeating-linear-gradient(135deg,${V.color.paper2},${V.color.paper2} 3px,${V.color.hatchStripe} 3px,${V.color.hatchStripe} 6px)`
                  : V.color.limeBright,
              }}
            />
            <span style={{ fontSize: 8, color: bar.peak ? V.color.ink : V.color.muted, fontWeight: bar.peak ? 700 : 400 }}>{bar.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Metric tile ─────────────────────────────────────── */
function MetricTile({ icon, label, bg, color, children }: {
  icon: string; label: string; bg: string; color: string; children: React.ReactNode
}) {
  return (
    <div style={{ background: V.color.white, borderRadius: 18, padding: '12px 13px', boxShadow: V.shadow.sm }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: V.color.inkSoft, marginBottom: 8 }}>
        <span style={{ width: 24, height: 24, borderRadius: 8, background: bg, color, display: 'grid', placeContent: 'center', fontSize: 13 }}>{icon}</span>
        {label}
      </div>
      {children}
    </div>
  )
}

/* ── Statistics screen ───────────────────────────────── */
export function StatisticsScreen() {
  return (
    <PhoneShell offset>
      <StatusBar />
      <StatNavBar />

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <CalorieHeader />
        <BarChart />

        {/* 2×2 metric grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 14px', marginBottom: 8 }}>

          <MetricTile icon="🏋" label="Exercise" bg={V.color.tileExerciseBg} color={V.color.limeDeep}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 24, marginBottom: 6 }}>
              {EQ_HEIGHTS.map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: V.color.limeDeep, borderRadius: 2 }} />
              ))}
            </div>
            <div style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 18 }}>
              2.0 <small style={{ fontSize: 11, color: V.color.muted, fontWeight: 400 }}>hours</small>
            </div>
          </MetricTile>

          <MetricTile icon="♥" label="BPM" bg={V.color.tileBpmBg} color={V.color.coral}>
            <svg viewBox="0 0 110 30" style={{ width: '100%', height: 26, marginBottom: 6 }} aria-hidden>
              <path d="M0 15 H18 l4 -9 l5 18 l5 -22 l5 22 l4 -9 H62 l4 -9 l5 18 l5 -22 l5 22 l4 -9 H110" fill="none" stroke={V.color.coral} strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <div style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 18 }}>
              86 <small style={{ fontSize: 11, color: V.color.muted, fontWeight: 400 }}>bpm</small>
            </div>
          </MetricTile>

          <MetricTile icon="⚖" label="Weight" bg={V.color.tileWeightBg} color={V.color.tileWeightFg}>
            <div style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 18, marginTop: 8 }}>
              68.5 <small style={{ fontSize: 11, color: V.color.muted, fontWeight: 400 }}>kg</small>
            </div>
          </MetricTile>

          <MetricTile icon="💧" label="Water" bg={V.color.tileWaterBg} color={V.color.blue}>
            <div style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 18, marginTop: 8 }}>
              2.4 <small style={{ fontSize: 11, color: V.color.muted, fontWeight: 400 }}>L</small>
            </div>
          </MetricTile>

        </div>
      </div>

      <TabBar active="progress" />
    </PhoneShell>
  )
}
