// Profita — LH Bank · navy + gold palette
// Scoped to the demo surface (data-demo="profita"). NOT portfolio shell tokens.

export const P = {
  color: {
    navy900:    '#0c1c33',
    navy900Rgb: '12,28,51',
    navy800:  '#112443',
    navy700:  '#182f52',
    navy600:  '#213a5e',
    navy500:  '#33517a',
    gold:     '#d3ac57',
    goldSoft: '#e7cf96',
    goldDeep: '#b98f3c',
    paper:    '#f5f2ea',
    white:    '#ffffff',
    on:       'rgba(255,255,255,.92)',
    onMut:    'rgba(255,255,255,.60)',
    onFaint:  'rgba(255,255,255,.38)',
    // Light-surface variants — used by the paper-white "Behind this" modals,
    // which read as a distinct light reading surface against the dark shell.
    paperInk:    '#1f2733', // primary text on paper surfaces
    paperMuted:  '#8a93a0', // meta / caption text on paper surfaces
    paperIcon:   '#55606e', // icon-weight text on paper surfaces (e.g. close button)
    paperSurface: '#faf9f6', // warm card/callout background on paper
    paperLine:    '#eef0f3', // hairline border on paper
    paperLineHi:  '#d7dbe0', // slightly stronger hairline (scrollbar thumb)
  },
  alpha: {
    gold35: 'rgba(211,172,87,.35)',
    gold10: 'rgba(211,172,87,.10)',
    gold14: 'rgba(211,172,87,.14)',
    gold20: 'rgba(211,172,87,.20)',
    gold50: 'rgba(211,172,87,.50)',
    white08: 'rgba(255,255,255,.08)',
    white10: 'rgba(255,255,255,.10)',
    white07: 'rgba(255,255,255,.07)',
    white06: 'rgba(255,255,255,.06)',
    white15: 'rgba(255,255,255,.15)',
    white94: 'rgba(255,255,255,.94)',
    line:    'rgba(255,255,255,.10)',
    lineHi:  'rgba(255,255,255,.16)',
    dark12:      'rgba(0,0,0,.12)',
    dark30:      'rgba(0,0,0,.30)',
    dark45:      'rgba(0,0,0,.45)',
    dark55:      'rgba(0,0,0,.55)',
    navy700_70:  'rgba(24,47,82,.70)',
    navyScrim82: 'rgba(6,13,26,.82)', // dark modal backdrop, one step darker than navy900
  },
  font: {
    disp: "'Instrument Serif', serif",
    body: "'Plus Jakarta Sans', sans-serif",
    mono: "'IBM Plex Mono', monospace",
  },
  ease: {
    expo:   'cubic-bezier(.16,1,.3,1)',
    quart:  'cubic-bezier(.25,1,.5,1)',
    spring: 'cubic-bezier(.34,1.4,.64,1)',
    smooth: 'cubic-bezier(.65,0,.35,1)',
  },
} as const

// Alpha-tint helper — derives an rgba() string from a stored "r,g,b" tuple
// (e.g. P.color.navy900Rgb) instead of hand-decoding hex to decimal at the
// call site. Keeps every tint traceable back to its base token.
export function rgbaFrom(rgbTuple: string, alpha: number) {
  return `rgba(${rgbTuple},${alpha})`
}
