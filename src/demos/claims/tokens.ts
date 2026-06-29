// Claims Platform case study tokens — Onest + IBM Plex Mono
// Scoped to the demo surface. NOT portfolio shell tokens.

export const C = {
  color: {
    bg:       '#f6f7f9',
    bg2:      '#ffffff',
    panel:    '#ffffff',
    inset:    '#f0f2f6',
    inset2:   '#e9edf3',
    tx:       '#3b424e',
    txHi:     '#0e1320',
    txDim:    '#697280',
    txFaint:  '#a6adb8',
    live:     '#0c9c68',
    fail:     '#d92d20',
    warn:     '#b3790c',
    info:     '#2563eb',
    line:     '#e3e7ec',
    line2:    '#d2d8e1',
    lineBri:  '#bac1cc',
    txOnLive: '#04150e',   // text on green fills
    overlay:  'rgba(11,17,30,.42)', // modal scrim — warm-dark, not blue-navy
  },
  alpha: {
    liveSoft: 'color-mix(in srgb,#0c9c68 10%,transparent)',
    failSoft: 'color-mix(in srgb,#d92d20  8%,transparent)',
    bg78:     'color-mix(in srgb,#f6f7f9 78%,transparent)',
  },
  font: {
    display: "'Onest', sans-serif",
    body:    "'Onest', sans-serif",
    mono:    "'IBM Plex Mono', monospace",
  },
  ease: {
    std:    'cubic-bezier(.4,0,.2,1)',
    spring: 'cubic-bezier(.16,1,.3,1)',
  },
  shadow: {
    card:   '0 14px 36px -26px rgba(14,19,32,.18)',
    cardLg: '0 14px 40px -20px rgba(14,19,32,.14)',
  },
} as const
