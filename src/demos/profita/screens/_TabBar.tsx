'use client'
import { SC } from './_screenTokens'

type TabName = 'feed' | 'portfolio' | 'fund' | 'robo' | 'notif'

const ICONS: Record<TabName, JSX.Element> = {
  feed: (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2.5L2 9.5V18h5.5v-5h5v5H18V9.5L10 2.5z"/>
    </svg>
  ),
  portfolio: (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <rect x="2" y="12" width="3" height="6" rx="1"/>
      <rect x="8.5" y="7" width="3" height="11" rx="1"/>
      <rect x="15" y="3" width="3" height="15" rx="1"/>
    </svg>
  ),
  fund: (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <ellipse cx="10" cy="7" rx="7" ry="2.5"/>
      <path d="M3 7v3c0 1.38 3.13 2.5 7 2.5S17 11.38 17 10V7c0 1.38-3.13 2.5-7 2.5S3 8.38 3 7z" opacity=".7"/>
      <path d="M3 10v3c0 1.38 3.13 2.5 7 2.5S17 14.38 17 13v-3c0 1.38-3.13 2.5-7 2.5S3 11.38 3 10z" opacity=".4"/>
    </svg>
  ),
  robo: (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <rect x="3" y="7" width="14" height="10" rx="3"/>
      <rect x="7" y="3" width="6" height="5" rx="1.5" opacity=".7"/>
      <circle cx="7.5" cy="12" r="1.5" fill={SC.navyD}/>
      <circle cx="12.5" cy="12" r="1.5" fill={SC.navyD}/>
      <rect x="7" y="15" width="6" height="1.5" rx=".75" fill={SC.navyD} opacity=".5"/>
    </svg>
  ),
  notif: (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a1 1 0 011 1v.5A5.5 5.5 0 0116.5 9v3.5l1.5 2H2l1.5-2V9A5.5 5.5 0 019 3.5V3a1 1 0 011-1z"/>
      <path d="M8 15.5a2 2 0 004 0H8z" opacity=".7"/>
    </svg>
  ),
}

const TABS: { key: TabName; label: string }[] = [
  { key: 'feed',      label: 'Feed'  },
  { key: 'portfolio', label: 'Port.' },
  { key: 'fund',      label: 'Fund'  },
  { key: 'robo',      label: 'ROBO'  },
  { key: 'notif',     label: 'Notif.'},
]

export function TabBar({ active }: { active: TabName }) {
  return (
    <div style={{
      flexShrink:      0,
      background:      SC.navyD,
      display:         'flex',
      justifyContent:  'space-around',
      padding:         '7px 4px 11px',
      borderRadius:    0,
    }}>
      {TABS.map(t => {
        const on = t.key === active
        return (
          <div key={t.key} style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:            3,
            color:          on ? SC.goldL : 'rgba(255,255,255,.4)',
            fontSize:       8,
            fontWeight:     on ? 700 : 500,
            minWidth:       32,
          }}>
            {ICONS[t.key]}
            {t.label}
          </div>
        )
      })}
    </div>
  )
}
