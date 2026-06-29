// VITAE case study design tokens — Fraunces/Bricolage Grotesque/DM Sans/Space Mono, lime palette.
// Scoped to the demo surface (data-demo="vitae"), NOT portfolio shell tokens.
// Type override: Vitae is an editorial demo surface with its own type stack — intentional exception to the mono-only portfolio rule.

// ── atomic alpha strings (resolved hex) ─────────────────────────────────────────
const _a = {
  lime20:  'rgba(174,222,61,.20)',
  lime14:  'rgba(174,222,61,.14)',
  lime40:  'rgba(174,222,61,.40)',
  lime25:  'rgba(174,222,61,.25)',
  lime28:  'rgba(174,222,61,.28)',
  lime10:  'rgba(174,222,61,.10)',
  paper72: 'rgba(246,245,239,.72)',
  paper82: 'rgba(246,245,239,.82)',
  paper60: 'rgba(246,245,239,.60)',
  paper50: 'rgba(246,245,239,.50)',
  paper14: 'rgba(246,245,239,.14)',
  paper12: 'rgba(246,245,239,.12)',
  paper22: 'rgba(246,245,239,.22)',
  ink04:   'rgba(22,32,26,.04)',
  ink05:   'rgba(22,32,26,.05)',
  ink06:   'rgba(22,32,26,.06)',
  ink10:   'rgba(22,32,26,.10)',
  ink12:   'rgba(22,32,26,.12)',
  ink14:   'rgba(22,32,26,.14)',
  ink16:   'rgba(22,32,26,.16)',
  ink18:   'rgba(22,32,26,.18)',
  ink22:   'rgba(22,32,26,.22)',
  ink72:   'rgba(22,32,26,.72)',
  white10: 'rgba(255,255,255,.10)',
  white30: 'rgba(255,255,255,.30)',
  white35: 'rgba(255,255,255,.35)',
  white70: 'rgba(255,255,255,.70)',
} as const

// ── phone shell color stops ───────────────────────────────────────────────────────
const _ph = {
  shell1:      '#2a2d30',
  shell2:      '#0c0d0e',
  shell3:      '#1a1c1e',
  ring1:       '#3c4044',
  ring2:       '#141618',
  buttonEdge:  '#2a2a2a',
} as const

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
    limeText:   '#243010',
    coral:      '#ff6b4a',
    blue:       '#3aa0e8',
    // device
    phone:         '#0b0f0c',
    phoneShell1:   _ph.shell1,
    phoneShell2:   _ph.shell2,
    phoneShell3:   _ph.shell3,
    phoneRing1:       _ph.ring1,
    phoneRing2:       _ph.ring2,
    phoneButtonEdge:  _ph.buttonEdge,
    // tile badge backgrounds
    tileExerciseBg: '#e7f3cf',
    tileBpmBg:      '#ffe3da',
    tileWeightBg:   '#ffe9d4',
    tileWeightFg:   '#e08a2c',
    tileWaterBg:    '#d6ecfb',
    // avatar
    avatarBase: '#bcae9b',
    avatarDeep: '#7c6c58',
    avatarSkin: '#f1e7da',
    avatarHair: '#2a2118',
    // misc
    hatchStripe: '#e4e3d8',
    mealA1: '#f3b36b', mealA2: '#d98a3d', mealA3: '#b5652a',
    mealB1: '#c98b5a', mealB2: '#8a4f2e', mealB3: '#5e3017',
    line:        '#e8e7df',
    dangerText:  '#b4452f',
    dangerRed:   '#c0492f',   // "The one we killed" eyebrow + bullet icons
    dangerBg:    '#fbe9e4',   // danger icon background tint
    screenBg:    '#fbfdf7',   // phone screen inner background
    amber:       '#d8902e',   // low-confidence indicator (Trends screen)
  },
  alpha: _a,
  shadow: {
    sm:        `0 1px 2px ${_a.ink05},0 6px 16px ${_a.ink06}`,
    md:        `0 2px 4px ${_a.ink05},0 20px 50px ${_a.ink12}`,
    phone:     `0 30px 80px ${_a.ink22},0 8px 24px ${_a.ink14}`,
    voiceCard: `0 1px 2px ${_a.ink04},0 16px 36px -20px ${_a.ink16}`,
    // phone illustration ring: ring1/ring2 are near-black chrome, white10 = inset glow, ink72 = depth shadow
    phoneRing: `0 0 0 2px ${_ph.ring1},0 0 0 5px ${_ph.ring2},inset 0 0 1px 1px ${_a.white10},0 60px 110px -30px ${_a.ink72}`,
  },
  gradient: {
    // shell1 → shell2 → shell2 (no #000) → shell3
    phoneShell: `linear-gradient(145deg,${_ph.shell1},${_ph.shell2} 42%,${_ph.shell2} 72%,${_ph.shell3})`,
  },
  ease: {
    expo:        'cubic-bezier(.16,1,.3,1)',
    quart:       'cubic-bezier(.25,1,.5,1)',
    spring:      'cubic-bezier(.34,1.56,.64,1)',
    smoothInOut: 'cubic-bezier(.65,0,.35,1)',
    // decelerate-to-stop; used for ghost finger travel across screen
    glide:       'cubic-bezier(.5,0,.2,1)',
  },
  motion: {
    // duration tokens — no hardcoded ms values in components
    durationFast:       '0.35s',
    durationBase:       '0.9s',
    durationHero:       '1.1s',
    durationNav:        '0.4s',
    durationStagger:    '0.08s',  // stagger step for multi-item reveals
    durationHeroDelay:  '0.2s',   // first hero eyebrow fade-in delay
    // distance tokens — no hardcoded px values in components
    distanceReveal:     34,   // translateY offset for vitae-animate entrance (px)
    reframeParallax:    80,   // scroll-melt scene parallax coefficient (px)
    // ghost-finger choreography timing (ms) — sync with CSS transition durations
    fingerMoveMs:   820,  // CSS .vhf transition duration (must match)
    fingerPressMs:  165,  // tap hold duration
    fingerSettleMs: 440,  // post-tap settle before next action
    fingerDwellMs:  1400, // extended pause on the "low confidence" bar reveal
    fingerAppearMs: 500,  // delay after finger becomes visible before first move
    fingerIdleMs:   750,  // short idle between taps
    fingerPreExitMs:700,  // idle before hiding finger at end of loop
    fingerExitMs:   800,  // pause after finger hides before loop restart
    killedRejectDwellMs: 1700, // dwell on the rejected "dangerous" screen
    killedShippedDwellMs:1300, // dwell on the shipped screen before cycle ends
  },
  font: {
    /** Display — editorial italic serif (Fraunces) */
    serif:   "'Fraunces', serif",
    /** Bold numerals + headings */
    heading: "'Bricolage Grotesque', sans-serif",
    /** Body copy */
    sans:    "'DM Sans', sans-serif",
    /** Eyebrows, labels, meta */
    mono:    "'Space Mono', monospace",
  },
  size: {
    hero:    'clamp(2.4rem,5.8vw,5rem)',
    display: 'clamp(1.8rem,3.2vw,2.8rem)',
    title:   'clamp(1.1rem,1.6vw,1.4rem)',
    body:    'clamp(1rem,1.1vw,1.05rem)',
    cap:     '0.8125rem',
    eyebrow: '0.72rem',    // section eyebrow labels — between micro and cap
    micro:   '0.6875rem',
  },
} as const
