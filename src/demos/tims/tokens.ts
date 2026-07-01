// Tims POS case study design tokens — Bricolage Grotesque + DM Sans + Space Mono
// Scoped to the demo surface (data-demo="tims"). NOT portfolio shell tokens.
// Primary palette: #000000 / #CF162D / #FFFFFF

export const T = {
  color: {
    red:       '#CF162D',  // Tim Hortons brand red
    redDk:     '#9E0E1F',  // 15% darker — hover / gradient end
    espresso:  '#000000',  // pure black — dark section backgrounds
    espresso2: '#111111',  // near-black — card surfaces in dark sections
    cream:     '#FFFFFF',  // pure white — text on dark backgrounds
    cream2:    '#F5F5F5',  // light gray — alternating section backgrounds
    paper:     '#FFFFFF',  // pure white — card backgrounds
    ink:       '#000000',  // pure black — primary text
    inkSoft:   '#555555',  // mid gray — body text
    muted:     '#888888',  // light gray — labels, meta
    gold:      '#CF162D',  // red replaces gold in dark sections
    green:     '#2f9e57',  // functional — KDS timer green zone (keep)
    amber:     '#c4700a',  // functional — KDS timer amber zone (keep)
    amberDk:   '#d98a2b',  // functional — KDS timer amber dark (keep)
    onAccent:  '#FFFFFF',  // white text on red
    smoke1:    '#D0D0D0',
    smoke2:    '#B8B8B8',
    smoke3:    '#A0A0A0',
  },
  alpha: {
    line:    'rgba(0,0,0,.10)',
    lineDk:  'rgba(255,255,255,.12)',
    red10:   'rgba(207,22,45,.10)',
    red40:   'rgba(207,22,45,.40)',
    red00:   'rgba(207,22,45,0)',
    red50:   'rgba(207,22,45,.50)',
    gold16:  'rgba(207,22,45,.16)',
    gold40:  'rgba(207,22,45,.40)',
    gold55:  'rgba(207,22,45,.55)',
    cream70: 'rgba(255,255,255,.70)',
    cream62: 'rgba(255,255,255,.62)',
    cream60: 'rgba(255,255,255,.60)',
    cream55: 'rgba(255,255,255,.55)',
    cream07: 'rgba(255,255,255,.07)',
    cream02: 'rgba(255,255,255,.02)',
    ink05:   'rgba(0,0,0,.05)',
    ink06:   'rgba(0,0,0,.06)',
    ink07:   'rgba(0,0,0,.07)',
    ink10:   'rgba(0,0,0,.10)',
    ink12:   'rgba(0,0,0,.12)',
    ink18:   'rgba(0,0,0,.18)',
    ink55:   'rgba(0,0,0,.55)',
    shadow:  '0 1px 2px rgba(0,0,0,.05), 0 14px 34px rgba(0,0,0,.07)',
    shadowLg:'0 18px 40px rgba(0,0,0,.18)',
  },
  font: {
    display: "'Bricolage Grotesque', sans-serif",
    sans:    "'DM Sans', sans-serif",
    mono:    "'Space Mono', monospace",
  },
  size: {
    hero:    'clamp(3rem,11vw,9rem)',
    display: 'clamp(2rem,5vw,3.6rem)',
    title:   'clamp(1.4rem,3vw,2.1rem)',
    body:    'clamp(1.02rem,1.4vw,1.16rem)',
  },
  ease: {
    expo:   'cubic-bezier(.16,1,.3,1)',
    spring: 'cubic-bezier(.34,1.56,.64,1)',
    smooth: 'cubic-bezier(.65,0,.35,1)',
  },
} as const
