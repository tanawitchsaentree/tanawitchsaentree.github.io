'use client'

import type { ReactNode } from 'react'
import { V } from './tokens'
import { PhoneShell } from './ui/PhoneShell'
import { StatusBar }  from './ui/StatusBar'
import { TabBar }     from './ui/TabBar'

/* ── Avatar ─────────────────────────────────────────── */
function Avatar() {
  return (
    <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${V.color.avatarBase},${V.color.avatarDeep})`, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
      <span style={{ position: 'absolute', left: '50%', top: 8,  transform: 'translateX(-50%)', width: 13, height: 13, borderRadius: '50%', background: V.color.avatarSkin, display: 'block' }} />
      <span style={{ position: 'absolute', left: '50%', bottom: -8, transform: 'translateX(-50%)', width: 24, height: 20, borderRadius: '50% 50% 0 0', background: V.color.avatarHair, display: 'block' }} />
    </div>
  )
}

/* ── Icon button ─────────────────────────────────────── */
function IconBtn({ children }: { children: ReactNode }) {
  return (
    <span style={{ width: 34, height: 34, borderRadius: '50%', background: V.color.white, display: 'grid', placeContent: 'center', boxShadow: V.shadow.sm, color: V.color.inkSoft, flexShrink: 0 }}>
      {children}
    </span>
  )
}

/* ── Top bar ─────────────────────────────────────────── */
function TopBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 16px 12px' }}>
      <Avatar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <small style={{ color: V.color.muted, fontSize: 11, display: 'block', lineHeight: 1 }}>Good morning!</small>
        <b style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 15, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Sajibur Rahman</b>
      </div>
      <IconBtn>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      </IconBtn>
      <IconBtn>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      </IconBtn>
    </div>
  )
}

/* ── Weekly progress card ────────────────────────────── */
function WeeklyProgressCard() {
  return (
    <div style={{ margin: '0 14px 10px', background: `linear-gradient(120deg,${V.color.limeCard},${V.color.limeSoft})`, borderRadius: 22, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: V.color.limeDeep, marginBottom: 6 }}>
        <span style={{ width: 18, height: 18, borderRadius: 6, background: V.alpha.white70, display: 'grid', placeContent: 'center' }}>⚡</span>
        Daily intake
      </div>
      <h5 style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 20, lineHeight: 1.2, color: V.color.limeText, maxWidth: 140, margin: 0 }}>
        Your Weekly<br />Progress
      </h5>
      {/* Ring */}
      <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 60, height: 60, borderRadius: '50%', background: `conic-gradient(${V.color.white} 0 78%, ${V.alpha.white30} 78% 100%)`, display: 'grid', placeContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', background: V.color.limeCard }} />
        <span style={{ position: 'relative', textAlign: 'center', lineHeight: 1, color: V.color.limeText }}>
          <b style={{ fontSize: 17, fontWeight: 700, display: 'block' }}>6</b>
          <small style={{ fontSize: 9 }}>days</small>
        </span>
      </div>
    </div>
  )
}

/* ── Stat tile ───────────────────────────────────────── */
function StatTile({ label, emoji, value, unit }: { label: string; emoji: string; value: string; unit: string }) {
  return (
    <div style={{ background: V.color.white, borderRadius: 18, padding: '12px 13px', boxShadow: V.shadow.sm }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 11, color: V.color.muted, lineHeight: 1.3, maxWidth: 64 }}>{label}</span>
        <span style={{ width: 26, height: 26, borderRadius: 9, background: V.color.paper2, display: 'grid', placeContent: 'center', fontSize: 13 }}>{emoji}</span>
      </div>
      <div style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 20, marginTop: 12 }}>
        {value} <small style={{ fontSize: 11, color: V.color.muted, fontWeight: 400 }}>{unit}</small>
      </div>
    </div>
  )
}

/* ── Calendar ────────────────────────────────────────── */
function CalendarCard() {
  const days  = ['S','M','T','W','T','F','S']
  const dates = ['07','08','09','10','11','12','13']
  const todayIdx = 3

  return (
    <div style={{ margin: '0 14px', background: V.color.white, borderRadius: 18, padding: '12px 14px', boxShadow: V.shadow.sm }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <b style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 14 }}>August 2025</b>
        <div style={{ display: 'flex', gap: 6 }}>
          {['←','→'].map(a => (
            <span key={a} style={{ width: 24, height: 24, borderRadius: '50%', background: V.color.paper2, display: 'grid', placeContent: 'center', color: V.color.inkSoft, fontSize: 12, cursor: 'pointer' }}>{a}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', gap: 2 }}>
        {days.map((d, i) => (
          <span key={i} style={{ fontSize: 10, color: i === todayIdx ? V.color.limeDeep : V.color.muted, marginBottom: 6, fontWeight: i === todayIdx ? 700 : 400 }}>{d}</span>
        ))}
        {dates.map((n, i) => (
          <span key={n} style={{ fontSize: 13, fontWeight: 700, padding: '5px 0', borderRadius: 11, background: i === todayIdx ? V.color.lime : 'transparent', color: i === todayIdx ? V.color.limeText : V.color.ink }}>{n}</span>
        ))}
      </div>
    </div>
  )
}

/* ── Meal row ────────────────────────────────────────── */
function MealCard({ name, kcal, gradient }: { name: string; kcal: string; gradient: string }) {
  return (
    <div style={{ margin: '0 14px', background: V.color.white, borderRadius: 18, padding: '11px 13px', boxShadow: V.shadow.sm, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 13, display: 'block' }}>{name}</b>
        <span style={{ fontSize: 12, color: V.color.inkSoft, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          🔥 {kcal} <span style={{ color: V.color.muted }}>kcal</span>
        </span>
      </div>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: gradient, display: 'block', flexShrink: 0 }} />
      <span style={{ width: 26, height: 26, borderRadius: 9, background: V.color.paper2, display: 'grid', placeContent: 'center', color: V.color.inkSoft, fontSize: 15, flexShrink: 0, cursor: 'pointer' }}>+</span>
    </div>
  )
}

/* ── Dashboard screen ────────────────────────────────── */
export function DashboardScreen() {
  return (
    <PhoneShell>
      <StatusBar />
      <TopBar />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <WeeklyProgressCard />

        {/* Stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '0 14px' }}>
          <StatTile label="Step to walk" emoji="👣" value="5,500" unit="steps" />
          <StatTile label="Drink Water"  emoji="💧" value="12"    unit="glass" />
        </div>

        <CalendarCard />

        <MealCard
          name="Breakfast"
          kcal="456–512"
          gradient={`linear-gradient(135deg,${V.color.mealA1},${V.color.mealA2} 60%,${V.color.mealA3})`}
        />
        <MealCard
          name="Lunch time"
          kcal="456–512"
          gradient={`linear-gradient(135deg,${V.color.mealB1},${V.color.mealB2} 60%,${V.color.mealB3})`}
        />

        <div style={{ height: 8 }} />
      </div>

      <TabBar active="home" />
    </PhoneShell>
  )
}
