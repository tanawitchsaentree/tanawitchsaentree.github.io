// VITAE case study design tokens — JetBrains Mono at 300/400/500/700, lime palette.
// Scoped to the demo surface (data-demo="vitae"), NOT portfolio shell tokens.

export const V = {
  color: {
    paper:      '#f6f5ef',
    paper2:     '#efeee6',
    ink:        '#16201a',
    inkSoft:    '#3a4640',
    muted:      '#838b81',
    white:      '#ffffff',
    lime:       '#aede3d',
    limeBright: '#b9e64a',
    limeSoft:   '#d6ee8f',
    limeCard:   '#c9e873',
    limeDeep:   '#6f9a26',
    limeText:   '#243010',   // dark text on lime surfaces
    coral:      '#ff6b4a',
    blue:       '#3aa0e8',
    // device palette
    phone:      '#0b0f0c',   // phone shell / notch
    // tile badge backgrounds
    tileExerciseBg: '#e7f3cf',
    tileBpmBg:      '#ffe3da',
    tileWeightBg:   '#ffe9d4',
    tileWeightFg:   '#e08a2c',
    tileWaterBg:    '#d6ecfb',
    // avatar skin tones
    avatarBase:     '#bcae9b',
    avatarDeep:     '#7c6c58',
    avatarSkin:     '#f1e7da',
    avatarHair:     '#2a2118',
    // hatch stripe for greyed chart bars
    hatchStripe:    '#e4e3d8',
    // meal colours
    mealA1:         '#f3b36b',
    mealA2:         '#d98a3d',
    mealA3:         '#b5652a',
    mealB1:         '#c98b5a',
    mealB2:         '#8a4f2e',
    mealB3:         '#5e3017',
    // warm hairline border for VITAE surfaces
    line:           '#e8e7df',
  },
  alpha: {
    // named alpha variants — use these instead of raw rgba() strings
    lime20:     'rgba(174,222,61,.20)',
    lime14:     'rgba(174,222,61,.14)',
    lime40:     'rgba(174,222,61,.40)',
    lime25:     'rgba(174,222,61,.25)',
    lime28:     'rgba(174,222,61,.28)',
    lime10:     'rgba(174,222,61,.10)',
    paper72:    'rgba(246,245,239,.72)',
    paper82:    'rgba(246,245,239,.82)',
    paper60:    'rgba(246,245,239,.60)',
    paper50:    'rgba(246,245,239,.50)',
    paper14:    'rgba(246,245,239,.14)',
    paper12:    'rgba(246,245,239,.12)',
    paper22:    'rgba(246,245,239,.22)',
    ink05:      'rgba(22,32,26,.05)',
    ink06:      'rgba(22,32,26,.06)',
    ink10:      'rgba(22,32,26,.10)',
    ink12:      'rgba(22,32,26,.12)',
    ink14:      'rgba(22,32,26,.14)',
    ink22:      'rgba(22,32,26,.22)',
    white35:    'rgba(255,255,255,.35)',  // conic ring ghost arc on lime backgrounds
  },
  shadow: {
    sm:    '0 1px 2px rgba(22,32,26,.05),0 6px 16px rgba(22,32,26,.06)',
    md:    '0 2px 4px rgba(22,32,26,.05),0 20px 50px rgba(22,32,26,.12)',
    phone: '0 30px 80px rgba(22,32,26,.22),0 8px 24px rgba(22,32,26,.14)',
  },
  ease: {
    expo:        'cubic-bezier(.16,1,.3,1)',
    quart:       'cubic-bezier(.25,1,.5,1)',
    spring:      'cubic-bezier(.34,1.56,.64,1)',
    smoothInOut: 'cubic-bezier(.65,0,.35,1)',
  },
  font: {
    /** Display headings — editorial geometric */
    serif: "'Syne', sans-serif",
    /** Body copy — clean readable */
    sans:  "'DM Sans', sans-serif",
    /** Eyebrows, labels, meta — mono accent only */
    mono:  "'JetBrains Mono', ui-monospace, monospace",
  },
  size: {
    hero:    'clamp(1.9rem,3.2vw,3rem)',
    display: 'clamp(1.5rem,2.4vw,2.2rem)',
    title:   'clamp(1.1rem,1.6vw,1.4rem)',
    body:    'clamp(0.95rem,1.1vw,1.05rem)',
    cap:     '0.8125rem',
    micro:   '0.6875rem',
  },
} as const
