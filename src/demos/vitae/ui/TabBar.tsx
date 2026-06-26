'use client'

import { V } from '../tokens'

interface Tab {
  id:     string
  label:  string
  icon:   React.ReactNode
  active?: boolean
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12L12 3l9 9" />
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function ScanIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="5" height="5" rx="1" />
      <rect x="16" y="3" width="5" height="5" rx="1" />
      <rect x="3" y="16" width="5" height="5" rx="1" />
      <line x1="16" y1="16" x2="21" y2="16" />
      <line x1="16" y1="20" x2="21" y2="20" />
      <line x1="16" y1="16" x2="16" y2="21" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export function TabBar({ active = 'home' }: { active?: string }) {
  const tabs: Tab[] = [
    { id: 'home',     label: 'Home',     icon: <HomeIcon active={active === 'home'} /> },
    { id: 'progress', label: 'Progress', icon: <ChartIcon /> },
  ]

  return (
    <div
      style={{
        flexShrink:     0,
        height:         72,
        background:     V.color.white,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-around',
        paddingBottom:  8,
        borderTop:      `1px solid ${V.color.line}`,
        position:       'relative',
      }}
    >
      {/* Left tabs */}
      {tabs.map(t => (
        <button
          key={t.id}
          style={{
            display:    'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap:        3,
            color:      active === t.id ? V.color.limeDeep : V.color.muted,
            fontSize:   10,
            fontFamily: V.font.sans,
            fontWeight: active === t.id ? 600 : 400,
            border:     'none',
            background: 'none',
            cursor:     'pointer',
            minWidth:   52,
            paddingTop: 8,
          }}
        >
          {t.icon}
          {t.label}
        </button>
      ))}

      {/* Centre FAB — lifted */}
      <div
        style={{
          width:        52,
          height:       52,
          borderRadius: '50%',
          background:   V.color.lime,
          display:      'grid',
          placeContent: 'center',
          color:        V.color.limeText,
          boxShadow:    `0 6px 20px ${V.alpha.lime40}`,
          marginTop:    -28,
          flexShrink:   0,
          border:       `3px solid ${V.color.paper2}`,
        }}
      >
        <ScanIcon />
      </div>

      {/* Right tabs */}
      {[
        { id: 'rewards', label: 'Rewards', icon: <StarIcon /> },
        { id: 'menu',    label: 'Menu',    icon: <MenuIcon /> },
      ].map(t => (
        <button
          key={t.id}
          style={{
            display:    'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap:        3,
            color:      V.color.muted,
            fontSize:   10,
            fontFamily: V.font.sans,
            fontWeight: 400,
            border:     'none',
            background: 'none',
            cursor:     'pointer',
            minWidth:   52,
            paddingTop: 8,
          }}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  )
}
