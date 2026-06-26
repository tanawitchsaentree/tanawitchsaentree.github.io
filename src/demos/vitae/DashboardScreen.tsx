'use client'

import { PhoneFrame, StatusBar } from './PhoneFrame'
import { V } from './tokens'

export function DashboardScreen() {
  return (
    <PhoneFrame>
      <div style={{ padding: '14px 15px 0', height: '100%', overflow: 'hidden' }}>
        <StatusBar />

        {/* topbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <div
            style={{
              width:      38,
              height:     38,
              borderRadius: '50%',
              background: `linear-gradient(135deg,${V.color.avatarBase},${V.color.avatarDeep})`,
              flexShrink: 0,
              position:   'relative',
              overflow:   'hidden',
            }}
          >
            <span style={{ position: 'absolute', left: '50%', top: 9, transform: 'translateX(-50%)', width: 14, height: 14, borderRadius: '50%', background: V.color.avatarSkin, display: 'block' }} />
            <span style={{ position: 'absolute', left: '50%', bottom: -8, transform: 'translateX(-50%)', width: 26, height: 22, borderRadius: '50% 50% 0 0', background: V.color.avatarHair, display: 'block' }} />
          </div>
          <div>
            <small style={{ color: V.color.muted, fontSize: 11, display: 'block', lineHeight: 1 }}>Good morning!</small>
            <b style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 15 }}>Sajibur Rahman</b>
          </div>
          <span style={{ marginLeft: 'auto', width: 34, height: 34, borderRadius: '50%', background: V.color.white, display: 'grid', placeContent: 'center', boxShadow: V.shadow.sm, color: V.color.inkSoft }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </span>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: V.color.white, display: 'grid', placeContent: 'center', boxShadow: V.shadow.sm, color: V.color.inkSoft }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9" opacity=".3"/></svg>
          </span>
        </div>

        {/* hero card — weekly progress ring */}
        <div
          style={{
            background:    `linear-gradient(120deg,${V.color.limeCard},${V.color.limeSoft})`,
            borderRadius:  22,
            padding:       16,
            position:      'relative',
            overflow:      'hidden',
            marginBottom:  11,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: V.color.limeDeep, marginBottom: 6 }}>
            <span style={{ width: 18, height: 18, borderRadius: 6, background: V.color.white, display: 'grid', placeContent: 'center', color: V.color.limeDeep }}>⚡</span>
            Daily intake
          </div>
          <h5 style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 21, lineHeight: 1.15, color: V.color.limeText, maxWidth: 140, margin: 0 }}>
            Your Weekly Progress
          </h5>
          {/* conic ring */}
          <div
            style={{
              position:     'absolute',
              right:        16,
              top:          '50%',
              transform:    'translateY(-50%)',
              width:        62,
              height:       62,
              borderRadius: '50%',
              background:   `conic-gradient(${V.color.white} 0 78%, ${V.alpha.white35} 78% 100%)`,
              display:      'grid',
              placeContent: 'center',
            }}
          >
            <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', background: V.color.limeCard }} />
            <span style={{ position: 'relative', textAlign: 'center', lineHeight: 1, color: V.color.limeText }}>
              <b style={{ fontSize: 18, fontWeight: 700, display: 'block' }}>6</b>
              <small style={{ fontSize: 9 }}>days</small>
            </span>
          </div>
        </div>

        {/* stat tiles — white bg + neutral hairline, NO tint-bg+hue-stroke */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 11 }}>
          {[
            { label: 'Step to walk', emoji: '👣', val: '5,500', unit: 'steps' },
            { label: 'Drink Water',  emoji: '💧', val: '12',    unit: 'glass' },
          ].map(t => (
            <div key={t.label} style={{ background: V.color.white, borderRadius: 18, padding: 13, boxShadow: V.shadow.sm }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, color: V.color.muted, lineHeight: 1.25, maxWidth: 64 }}>{t.label}</span>
                <span style={{ width: 26, height: 26, borderRadius: 9, background: V.color.paper2, display: 'grid', placeContent: 'center', fontSize: 13 }}>{t.emoji}</span>
              </div>
              <div style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 21, marginTop: 14 }}>
                {t.val} <small style={{ fontSize: 11, color: V.color.muted, fontWeight: 400 }}>{t.unit}</small>
              </div>
            </div>
          ))}
        </div>

        {/* calendar */}
        <div style={{ background: V.color.white, borderRadius: 18, padding: 14, boxShadow: V.shadow.sm, marginBottom: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <b style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 14 }}>August 2025</b>
            <div style={{ display: 'flex', gap: 6 }}>
              {['←','→'].map(a => (
                <span key={a} style={{ width: 24, height: 24, borderRadius: '50%', background: V.color.paper2, display: 'grid', placeContent: 'center', color: V.color.inkSoft, fontSize: 12 }}>{a}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', gap: 2 }}>
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <span key={i} style={{ fontSize: 9, color: i === 3 ? V.color.limeDeep : V.color.muted, marginBottom: 6, fontWeight: i === 3 ? 700 : 400 }}>{d}</span>
            ))}
            {['07','08','09','10','11','12','13'].map((n, i) => (
              <span key={n} style={{ fontSize: 12, fontWeight: 700, padding: '5px 0', borderRadius: 11, background: i === 3 ? V.color.lime : 'transparent', color: i === 3 ? V.color.limeText : V.color.ink }}>{n}</span>
            ))}
          </div>
        </div>

        {/* meal cards */}
        {[
          { name: 'Breakfast',  kcal: '456–512', bg: `linear-gradient(135deg,${V.color.mealA1},${V.color.mealA2} 60%,${V.color.mealA3})` },
          { name: 'Lunch time', kcal: '456–512', bg: `linear-gradient(135deg,${V.color.mealB1},${V.color.mealB2} 60%,${V.color.mealB3})` },
        ].map(m => (
          <div key={m.name} style={{ background: V.color.white, borderRadius: 18, padding: '12px 13px', boxShadow: V.shadow.sm, display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
            <div>
              <b style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 13, display: 'block' }}>{m.name}</b>
              <span style={{ fontSize: 12, color: V.color.inkSoft, display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                <span style={{ color: V.color.coral }}>🔥</span>
                {m.kcal} <span style={{ color: V.color.muted }}>kcal</span>
              </span>
            </div>
            <span style={{ width: 42, height: 42, borderRadius: 12, marginLeft: 'auto', background: m.bg, display: 'block', flexShrink: 0 }} />
            <span style={{ width: 26, height: 26, borderRadius: 9, background: V.color.paper2, display: 'grid', placeContent: 'center', color: V.color.inkSoft, fontSize: 15, flexShrink: 0 }}>+</span>
          </div>
        ))}
      </div>

      {/* tab bar */}
      <div
        style={{
          position:       'absolute',
          left:           11,
          right:          11,
          bottom:         11,
          height:         60,
          background:     V.color.white,
          borderRadius:   '0 0 34px 34px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-around',
          boxShadow:      `0 -6px 20px ${V.alpha.ink06}`,
          fontSize:       9,
          color:          V.color.muted,
          fontFamily:     V.font.sans,
        }}
      >
        {[
          { icon: '⌂', label: 'Home',     active: true  },
          { icon: '◔', label: 'Progress', active: false },
        ].map(t => (
          <div key={t.label} style={{ display: 'grid', justifyItems: 'center', gap: 3, color: t.active ? V.color.ink : V.color.muted }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            {t.label}
          </div>
        ))}
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: V.color.lime, display: 'grid', placeContent: 'center', color: V.color.limeText, boxShadow: `0 8px 18px ${V.alpha.lime25}`, marginTop: -22, fontSize: 18 }}>
          ⛶
        </div>
        {[
          { icon: '☆', label: 'Rewards' },
          { icon: '▦', label: 'Menu'    },
        ].map(t => (
          <div key={t.label} style={{ display: 'grid', justifyItems: 'center', gap: 3, color: V.color.muted }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            {t.label}
          </div>
        ))}
      </div>
    </PhoneFrame>
  )
}
