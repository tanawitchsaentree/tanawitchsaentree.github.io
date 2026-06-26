'use client'

import { V } from './tokens'

const META = [
  { label: 'Role',    value: 'UX / UI · Design System' },
  { label: 'Surface', value: 'iOS · 2 key screens'     },
  { label: 'Method',  value: 'Discover → Iterate loop' },
] as const

export function VitaeHero() {
  return (
    <header
      style={{
        padding:    'clamp(8rem,16vw,12rem) 0 clamp(3rem,6vw,5rem)',
        fontFamily: V.font.sans,
      }}
    >
      <div
        className="vitae-wrap"
        style={{
          display:             'grid',
          gridTemplateColumns: 'clamp(300px,55%,700px) 1fr',
          gap:                 'clamp(2rem,5vw,4rem)',
          alignItems:          'center',
        }}
      >
        {/* left — text */}
        <div className="vitae-reveal">
          <span
            style={{
              fontFamily:    V.font.mono,
              fontSize:      V.size.micro,
              letterSpacing: '.22em',
              textTransform: 'uppercase',
              color:         V.color.limeDeep,
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '.6em',
            }}
          >
            <span
              style={{
                display:    'inline-block',
                width:      26,
                height:     1.5,
                background: V.color.limeDeep,
              }}
            />
            Product Design · Case Study
          </span>

          <h1
            style={{
              fontFamily:    V.font.serif,
              fontWeight:    700,
              fontSize:      V.size.hero,
              letterSpacing: '-.01em',
              lineHeight:    1.12,
              margin:        '1.2rem 0 1.4rem',
              color:         V.color.ink,
            }}
          >
            Designing a{' '}
            <em style={{ fontStyle: 'italic', fontWeight: 400, color: V.color.limeDeep }}>glanceable</em>{' '}
            health{' '}
            <span style={{ color: 'transparent', WebkitTextStroke: `1px ${V.color.ink}` }}>
              dashboard
            </span>
          </h1>

          <p
            style={{
              fontFamily: V.font.sans,
              fontSize:   V.size.body,
              color:      V.color.inkSoft,
              maxWidth:   '46ch',
              lineHeight: 1.7,
            }}
          >
            VITAE turns scattered daily health metrics into one motivating story — built
            through a tight six-stage loop, capped at three iterations before ship.
          </p>

          <div
            style={{
              display:     'flex',
              flexWrap:    'wrap',
              gap:         '2rem',
              marginTop:   '2.4rem',
              paddingTop:  '1.8rem',
              borderTop:   `1px solid ${V.color.line}`,
            }}
          >
            {META.map(({ label, value }) => (
              <div key={label}>
                <b
                  style={{
                    display:       'block',
                    fontFamily:    V.font.mono,
                    fontSize:      V.size.micro,
                    letterSpacing: '.16em',
                    textTransform: 'uppercase',
                    color:         V.color.muted,
                    marginBottom:  '.35rem',
                    fontWeight:    400,
                  }}
                >
                  {label}
                </b>
                <span
                  style={{
                    fontFamily: V.font.sans,
                    fontSize:   '1.05rem',
                    color:      V.color.ink,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* right — mini phone */}
        <div
          style={{
            justifySelf: 'center',
            transform:   'rotate(-4deg)',
          }}
        >
          <MiniPhone />
        </div>
      </div>
    </header>
  )
}

function MiniPhone() {
  return (
    <div
      style={{
        width:        230,
        height:       486,
        background:   V.color.phone,
        borderRadius: 46,
        padding:      9,
        boxShadow:    V.shadow.phone,
        position:     'relative',
        flexShrink:   0,
      }}
    >
      <div
        style={{
          width:        '100%',
          height:       '100%',
          background:   V.color.paper2,
          borderRadius: 36,
          overflow:     'hidden',
          position:     'relative',
          fontSize:     10,
          fontFamily:   V.font.sans,
        }}
      >
        {/* notch */}
        <div
          style={{
            position:     'absolute',
            top:          7,
            left:         '50%',
            transform:    'translateX(-50%)',
            width:        74,
            height:       20,
            background:   V.color.phone,
            borderRadius: 16,
            zIndex:       9,
          }}
        />

        <div style={{ padding: '11px 11px 0', height: '100%', overflow: 'hidden' }}>
          {/* status bar */}
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              fontWeight:     700,
              fontSize:       9,
              color:          V.color.ink,
              padding:        '2px 4px 10px',
            }}
          >
            <span>9:41</span>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <StatusBars />
            </span>
          </div>

          {/* hero card */}
          <div
            style={{
              background:    `linear-gradient(120deg,${V.color.limeCard},${V.color.limeSoft})`,
              borderRadius:  18,
              padding:       12,
              position:      'relative',
              overflow:      'hidden',
              marginBottom:  8,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, color: V.color.limeDeep, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 14, height: 14, borderRadius: 5, background: V.color.white, display: 'grid', placeContent: 'center', fontSize: 8 }}>⚡</span>
              Daily intake
            </div>
            <h5 style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 16, lineHeight: 1.15, color: V.color.limeText, maxWidth: 100, margin: 0 }}>
              Your Weekly Progress
            </h5>
            <div
              style={{
                position:    'absolute',
                right:       12,
                top:         '50%',
                transform:   'translateY(-50%)',
                width:       48,
                height:      48,
                borderRadius: '50%',
                background:  `conic-gradient(${V.color.white} 0 78%, ${V.alpha.white35} 78% 100%)`,
                display:     'grid',
                placeContent: 'center',
              }}
            >
              <div
                style={{
                  position:     'absolute',
                  inset:        6,
                  borderRadius: '50%',
                  background:   V.color.limeCard,
                }}
              />
              <span style={{ position: 'relative', textAlign: 'center', lineHeight: 1, color: V.color.limeText }}>
                <b style={{ fontSize: 14, fontWeight: 700, display: 'block' }}>6</b>
                <small style={{ fontSize: 7 }}>days</small>
              </span>
            </div>
          </div>

          {/* stat tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 8 }}>
            {[{ label: 'Step to walk', emoji: '👣', val: '5,500', unit: 'steps' }, { label: 'Drink Water', emoji: '💧', val: '12', unit: 'glass' }].map(t => (
              <div key={t.label} style={{ background: V.color.white, borderRadius: 14, padding: 10, boxShadow: V.shadow.sm }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 9, color: V.color.muted, lineHeight: 1.25, maxWidth: 64 }}>{t.label}</span>
                  <span style={{ width: 20, height: 20, borderRadius: 7, background: V.color.paper2, display: 'grid', placeContent: 'center', fontSize: 11 }}>{t.emoji}</span>
                </div>
                <div style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 15, marginTop: 8 }}>
                  {t.val} <small style={{ fontSize: 9, color: V.color.muted, fontWeight: 400 }}>{t.unit}</small>
                </div>
              </div>
            ))}
          </div>

          {/* calendar */}
          <div style={{ background: V.color.white, borderRadius: 14, padding: 10, boxShadow: V.shadow.sm }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
              <b style={{ fontFamily: V.font.sans, fontWeight: 700, fontSize: 11 }}>August 2025</b>
              <div style={{ display: 'flex', gap: 4 }}>
                {['←','→'].map(a => (
                  <span key={a} style={{ width: 18, height: 18, borderRadius: '50%', background: V.color.paper2, display: 'grid', placeContent: 'center', color: V.color.inkSoft, fontSize: 10 }}>{a}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', gap: 2 }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <span key={i} style={{ fontSize: 9, color: i === 3 ? V.color.limeDeep : V.color.muted, marginBottom: 4, fontWeight: i === 3 ? 700 : 400 }}>{d}</span>
              ))}
              {['07','08','09','10','11','12','13'].map((n, i) => (
                <span key={n} style={{ fontSize: 12, fontWeight: 700, padding: '4px 0', borderRadius: 9, background: i === 3 ? V.color.lime : 'transparent', color: i === 3 ? V.color.limeText : V.color.ink }}>{n}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBars() {
  return (
    <svg width="28" height="10" viewBox="0 0 28 10" fill="none" aria-hidden="true">
      <rect x="0" y="5" width="3" height="5" rx="1" fill="currentColor" opacity=".5" />
      <rect x="4" y="3" width="3" height="7" rx="1" fill="currentColor" opacity=".75" />
      <rect x="8" y="1" width="3" height="9" rx="1" fill="currentColor" />
      <path d="M13 5 Q16.5 2 20 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".9" />
      <rect x="23" y="2" width="5" height="6" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="24" y="3" width="3" height="4" rx=".4" fill="currentColor" opacity=".8" />
    </svg>
  )
}
