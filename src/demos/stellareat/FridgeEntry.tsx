'use client'

import { useState, useCallback, useMemo } from 'react'

// ── Stellareat palette ────────────────────────────────────────────────────────
// Category colors are Stellareat product brand, not portfolio accent.
// bg/surface/fg/border defer to portfolio tokens via CSS vars.
const P = {
  bg:              '#FFF8E7',
  surface:         '#F0EBE0',  // warm cream — no pure white
  fg:              '#1F1B16',
  fgMuted:         '#7A7060',
  red:             '#D64545',
  yellow:          '#E8B53A',
  green:           '#87A96B',
  blue:            '#6FA8DC',
  border:          '#E8DFC8',
  accentSelected:  '#5C6B3A',
} as const

// ── Easing ────────────────────────────────────────────────────────────────────
const E = {
  gentle:   'cubic-bezier(0.22, 1, 0.36, 1)',
  decisive: 'cubic-bezier(0.16, 1, 0.3, 1)',
  default:  'cubic-bezier(0.65, 0, 0.35, 1)',
} as const

// ── Steps breadcrumb ──────────────────────────────────────────────────────────
type StepId = 'fridge' | 'equipment' | 'preferences' | 'recipes'
const STEPS: { id: StepId; label: string }[] = [
  { id: 'fridge',      label: 'Fridge' },
  { id: 'equipment',   label: 'Equipment' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'recipes',     label: 'Recipes' },
]

// ── Fridge items ──────────────────────────────────────────────────────────────
type FridgeItem = { id: string; label: string; color: string; svg: React.ReactNode }

const FRIDGE_ITEMS: FridgeItem[] = [
  {
    id: 'chicken', label: 'Chicken', color: P.red,
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <path d="M32 40 C32 34 30 28 22 16" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <path d="M32 40 C32 34 34 28 42 16" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <line x1="32" y1="40" x2="32" y2="50" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <circle cx="22" cy="15" r="2.5" fill="#1F1B16"/>
        <circle cx="42" cy="15" r="2.5" fill="#1F1B16"/>
        <circle cx="32" cy="50" r="2.5" fill="#1F1B16"/>
      </svg>
    ),
  },
  {
    id: 'onion', label: 'Onion', color: P.red,
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <circle cx="32" cy="30" r="16" stroke="#1F1B16" strokeWidth="1.75" fill="none"/>
        <path d="M20 30 A12 12 0 0 1 44 30" stroke="#1F1B16" strokeWidth="1.75" fill="none" strokeLinecap="round"/>
        <path d="M24 30 A8 8 0 0 1 40 30" stroke="#1F1B16" strokeWidth="1.75" fill="none" strokeLinecap="round"/>
        <path d="M28 30 A4 4 0 0 1 36 30" stroke="#1F1B16" strokeWidth="1.25" fill="none" strokeLinecap="round"/>
        <line x1="29" y1="46" x2="27" y2="51" stroke="#1F1B16" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="32" y1="46" x2="32" y2="52" stroke="#1F1B16" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="35" y1="46" x2="37" y2="51" stroke="#1F1B16" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'tomato', label: 'Tomato', color: P.red,
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <path d="M 49 36 A 17 17 0 1 1 45 25" stroke="#1F1B16" strokeWidth="1.75" fill="none" strokeLinecap="round"/>
        <line x1="49" y1="36" x2="32" y2="36" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <line x1="45" y1="25" x2="32" y2="36" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <path d="M 44 27 A 9 9 0 0 1 47 36" stroke="#1F1B16" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.55"/>
        <line x1="32" y1="19" x2="32" y2="13" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <line x1="32" y1="19" x2="26" y2="15" stroke="#1F1B16" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="32" y1="19" x2="28" y2="13" stroke="#1F1B16" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="32" y1="19" x2="36" y2="13" stroke="#1F1B16" strokeWidth="1.4" strokeLinecap="round"/>
        <line x1="32" y1="19" x2="38" y2="15" stroke="#1F1B16" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'eggs', label: 'Eggs', color: P.yellow,
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <ellipse cx="27" cy="30" rx="12" ry="16" stroke="#1F1B16" strokeWidth="1.75" fill="#FFF8E7"/>
        <ellipse cx="37" cy="32" rx="12" ry="16" stroke="#1F1B16" strokeWidth="1.75" fill="#FFF8E7"/>
        <path d="M31 32 A6 5 0 0 1 43 32" stroke="#1F1B16" strokeWidth="1.25" fill="none" strokeLinecap="round" opacity="0.45"/>
      </svg>
    ),
  },
  {
    id: 'lemon', label: 'Lemon', color: P.yellow,
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <path d="M32 14 A18 18 0 0 1 32 50 Z" stroke="#1F1B16" strokeWidth="1.75" fill="none" strokeLinejoin="round"/>
        <line x1="32" y1="14" x2="32" y2="50" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <line x1="32" y1="32" x2="46" y2="20" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.65"/>
        <line x1="32" y1="32" x2="50" y2="32" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.65"/>
        <line x1="32" y1="32" x2="46" y2="44" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.65"/>
        <circle cx="32" cy="32" r="2" fill="#1F1B16"/>
        <path d="M32 17 A15 15 0 0 1 32 47" stroke="#1F1B16" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="2 3"/>
      </svg>
    ),
  },
  {
    id: 'garlic', label: 'Garlic', color: P.yellow,
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <path d="M27 13 C17 14 12 22 12 31 C12 41 17 51 27 53 C36 53 40 45 40 35 C41 23 36 12 27 13 Z" stroke="#1F1B16" strokeWidth="1.75" fill="#FFF8E7"/>
        <line x1="27" y1="13" x2="27" y2="7" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <path d="M14 27 C16 25 21 25 23 27" stroke="#1F1B16" strokeWidth="1" fill="none" opacity="0.3" strokeLinecap="round"/>
        <path d="M13 35 C15 33 20 33 22 35" stroke="#1F1B16" strokeWidth="1" fill="none" opacity="0.25" strokeLinecap="round"/>
        <path d="M49 21 C55 22 57 28 55 36 C53 43 49 47 46 46 C43 45 43 40 44 32 C45 25 45 20 49 21 Z" stroke="#1F1B16" strokeWidth="1.75" fill="#FFF8E7"/>
      </svg>
    ),
  },
  {
    id: 'butter', label: 'Butter', color: P.yellow,
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <rect x="16" y="22" width="32" height="22" stroke="#1F1B16" strokeWidth="1.75" fill="none" rx="1"/>
        <line x1="28" y1="22" x2="28" y2="44" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.4" strokeDasharray="2 3"/>
        <path d="M16 22 L22 16 L54 16 L48 22" stroke="#1F1B16" strokeWidth="1.75" fill="none" strokeLinejoin="round"/>
        <line x1="38" y1="16" x2="44" y2="22" stroke="#1F1B16" strokeWidth="1.5" strokeLinecap="round" opacity="0.55"/>
      </svg>
    ),
  },
  {
    id: 'cheese', label: 'Cheese', color: P.yellow,
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <path d="M10 48 L54 48 L54 26 L10 48 Z" stroke="#1F1B16" strokeWidth="1.75" fill="none" strokeLinejoin="round"/>
        <circle cx="36" cy="38" r="3.5" stroke="#1F1B16" strokeWidth="1.5" fill="none"/>
        <circle cx="46" cy="42" r="2.5" stroke="#1F1B16" strokeWidth="1.5" fill="none"/>
        <line x1="51" y1="26" x2="51" y2="48" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.38"/>
      </svg>
    ),
  },
  {
    id: 'spinach', label: 'Spinach', color: P.green,
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <ellipse cx="23" cy="28" rx="6.5" ry="11" stroke="#1F1B16" strokeWidth="1.75" fill="#FFF8E7" transform="rotate(-28 23 28)"/>
        <line x1="17" y1="22" x2="29" y2="34" stroke="#1F1B16" strokeWidth="1" strokeLinecap="round" opacity="0.4" transform="rotate(-28 23 28)"/>
        <ellipse cx="41" cy="28" rx="6.5" ry="11" stroke="#1F1B16" strokeWidth="1.75" fill="#FFF8E7" transform="rotate(28 41 28)"/>
        <line x1="35" y1="22" x2="47" y2="34" stroke="#1F1B16" strokeWidth="1" strokeLinecap="round" opacity="0.4" transform="rotate(28 41 28)"/>
        <ellipse cx="32" cy="24" rx="7" ry="13" stroke="#1F1B16" strokeWidth="1.75" fill="#FFF8E7"/>
        <line x1="32" y1="12" x2="32" y2="36" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.45"/>
        <line x1="32" y1="37" x2="32" y2="50" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <line x1="32" y1="50" x2="27" y2="56" stroke="#1F1B16" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="32" y1="50" x2="32" y2="57" stroke="#1F1B16" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="32" y1="50" x2="37" y2="56" stroke="#1F1B16" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'bellpepper', label: 'Bell Pepper', color: P.green,
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <path d="M32 8 C48 8 56 20 56 36 C56 52 48 62 32 62 C16 62 8 52 8 36 C8 20 16 8 32 8 Z" stroke="#1F1B16" strokeWidth="1.75" fill="none"/>
        <ellipse cx="32" cy="36" rx="5" ry="5" stroke="#1F1B16" strokeWidth="1.25" fill="none"/>
        <line x1="32" y1="31" x2="32" y2="10" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.55"/>
        <line x1="36" y1="39" x2="52" y2="58" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.55"/>
        <line x1="28" y1="39" x2="12" y2="58" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.55"/>
        <circle cx="32" cy="20" r="2" fill="#1F1B16" opacity="0.5"/>
        <circle cx="48" cy="52" r="2" fill="#1F1B16" opacity="0.5"/>
        <circle cx="16" cy="52" r="2" fill="#1F1B16" opacity="0.5"/>
        <line x1="32" y1="8" x2="32" y2="3" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'milk', label: 'Milk', color: P.blue,
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <rect x="18" y="28" width="28" height="24" stroke="#1F1B16" strokeWidth="1.75" fill="none"/>
        <path d="M18 28 L32 14 L46 28" stroke="#1F1B16" strokeWidth="1.75" fill="none" strokeLinejoin="round"/>
        <line x1="29" y1="17" x2="35" y2="17" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.45"/>
        <path d="M32 14 L40 20" stroke="#1F1B16" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
        <line x1="22" y1="38" x2="42" y2="38" stroke="#1F1B16" strokeWidth="1" strokeLinecap="round" opacity="0.28"/>
      </svg>
    ),
  },
  {
    id: 'rice', label: 'Leftover Rice', color: P.blue,
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <ellipse cx="32" cy="28" rx="18" ry="5" stroke="#1F1B16" strokeWidth="1.75" fill="#FFF8E7"/>
        <path d="M14 28 Q14 50 32 50 Q50 50 50 28" stroke="#1F1B16" strokeWidth="1.75" fill="none"/>
        <line x1="9" y1="37" x2="52" y2="20" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <line x1="11" y1="43" x2="54" y2="26" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <circle cx="32" cy="29" r="3" fill="#FFF8E7"/>
        <circle cx="32" cy="29" r="1.5" stroke="#1F1B16" strokeWidth="1" fill="none"/>
      </svg>
    ),
  },
]

// ── Equipment items ───────────────────────────────────────────────────────────
type EquipItem = { id: string; label: string; svg: React.ReactNode }

const EQUIP_ITEMS: EquipItem[] = [
  {
    id: 'oven', label: 'Oven',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <rect x="10" y="10" width="44" height="44" stroke="#1F1B16" strokeWidth="1.75" fill="none" rx="2"/>
        <circle cx="32" cy="32" r="10" stroke="#1F1B16" strokeWidth="1.5" fill="none"/>
        <line x1="14" y1="45" x2="50" y2="45" stroke="#1F1B16" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
        <line x1="14" y1="50" x2="50" y2="50" stroke="#1F1B16" strokeWidth="1" strokeLinecap="round" opacity="0.25"/>
      </svg>
    ),
  },
  {
    id: 'stovetop', label: 'Stovetop',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <rect x="8" y="18" width="48" height="28" stroke="#1F1B16" strokeWidth="1.75" fill="none" rx="2"/>
        <circle cx="22" cy="32" r="7" stroke="#1F1B16" strokeWidth="1.5" fill="none"/>
        <circle cx="22" cy="32" r="3.5" stroke="#1F1B16" strokeWidth="1" fill="none" opacity="0.5"/>
        <circle cx="42" cy="32" r="7" stroke="#1F1B16" strokeWidth="1.5" fill="none"/>
        <circle cx="42" cy="32" r="3.5" stroke="#1F1B16" strokeWidth="1" fill="none" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: 'microwave', label: 'Microwave',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <rect x="8" y="18" width="48" height="28" stroke="#1F1B16" strokeWidth="1.75" fill="none" rx="2"/>
        <rect x="12" y="22" width="28" height="20" stroke="#1F1B16" strokeWidth="1.25" fill="none" rx="1"/>
        <path d="M22 32 A6 6 0 0 1 34 32" stroke="#1F1B16" strokeWidth="1.25" fill="none" strokeLinecap="round" opacity="0.55"/>
        <circle cx="50" cy="30" r="2.5" stroke="#1F1B16" strokeWidth="1.25" fill="none"/>
        <circle cx="50" cy="38" r="2.5" stroke="#1F1B16" strokeWidth="1.25" fill="none"/>
      </svg>
    ),
  },
  {
    id: 'airfryer', label: 'Air Fryer',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <path d="M20 16 Q20 12 32 12 Q44 12 44 16 L46 52 Q46 56 32 56 Q18 56 18 52 Z" stroke="#1F1B16" strokeWidth="1.75" fill="none"/>
        <ellipse cx="32" cy="22" rx="10" ry="4" stroke="#1F1B16" strokeWidth="1.25" fill="none" opacity="0.5"/>
        <line x1="28" y1="40" x2="36" y2="40" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
  },
  {
    id: 'castiron', label: 'Cast Iron',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <circle cx="26" cy="34" r="16" stroke="#1F1B16" strokeWidth="1.75" fill="none"/>
        <line x1="42" y1="34" x2="58" y2="34" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'pot', label: 'Pot',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <path d="M16 28 Q16 52 32 52 Q48 52 48 28" stroke="#1F1B16" strokeWidth="1.75" fill="none"/>
        <line x1="16" y1="28" x2="48" y2="28" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <path d="M10 28 Q8 26 10 24 L14 26" stroke="#1F1B16" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M54 28 Q56 26 54 24 L50 26" stroke="#1F1B16" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M22 28 Q28 18 32 18 Q36 18 42 28" stroke="#1F1B16" strokeWidth="1.25" fill="none" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: 'wok', label: 'Wok',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
        <path d="M10 28 Q10 52 32 52 Q54 52 54 28" stroke="#1F1B16" strokeWidth="1.75" fill="none"/>
        <line x1="10" y1="28" x2="54" y2="28" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <line x1="54" y1="28" x2="62" y2="18" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <line x1="58" y1="28" x2="62" y2="23" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
  },
]

// ── Preferences ───────────────────────────────────────────────────────────────
type PrefGroup = { id: string; label: string; options: string[] }

const PREF_GROUPS: PrefGroup[] = [
  {
    id: 'nutrition',
    label: 'Nutrition focus',
    options: ['High protein', 'Balanced', 'Low carb', 'No restriction'],
  },
  {
    id: 'cuisine',
    label: 'Cuisine mood',
    options: ['Thai', 'Western', 'Asian fusion', 'Surprise me'],
  },
  {
    id: 'meal',
    label: 'Meal type',
    options: ['Quick (15 min)', 'Hearty', 'Fancy', 'Leftover-friendly'],
  },
]

// ── Recipes ───────────────────────────────────────────────────────────────────
const RECIPES = [
  {
    id: 'brown-butter-chicken',
    name: 'Brown Butter Roast Chicken',
    description: 'Oven-finished with garlic and lemon pan drippings. Skin crisps slowly; butter goes nutty.',
    time: '45 min',
    difficulty: 'Intermediate',
  },
  {
    id: 'thai-garlic-chicken',
    name: 'Thai Garlic Chicken Stir-Fry',
    description: 'Hot wok, fish sauce, a little sugar. The garlic chars just enough to turn sweet.',
    time: '20 min',
    difficulty: 'Quick',
  },
  {
    id: 'lemon-butter-pasta',
    name: 'Lemon Butter Pasta with Wilted Greens',
    description: 'Bright and fast. Spinach wilts into the pasta water; lemon cuts the richness of butter.',
    time: '25 min',
    difficulty: 'Quick',
  },
]

// ── Shared style constants (module-level — not recreated per render) ──────────
const MONO = "'Inter Variable', 'Inter', sans-serif"

const PANEL_TITLE: React.CSSProperties = {
  fontFamily:    MONO,
  fontWeight:    400,
  fontSize:      'clamp(21px, 3vw, 30px)',
  letterSpacing: '-0.02em',
  lineHeight:    1.2,
  color:         P.fg,
  marginBottom:  28,
}

const EYEBROW: React.CSSProperties = {
  fontFamily:    MONO,
  fontSize:      11,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color:         P.fgMuted,
  marginBottom:  12,
}

const ROW_SPREAD: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  marginTop:      4,
}

// ── Ghost background (food illustrations at low opacity — required for glass) ─
function GhostBackground() {
  return (
    <div
      aria-hidden
      style={{
        position:      'absolute',
        inset:         0,
        overflow:      'hidden',
        pointerEvents: 'none',
        zIndex:        0,
      }}
    >
      {/* Chicken wishbone — top right */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position:  'absolute',
          top:       '-6%',
          right:     '8%',
          width:     220,
          height:    220,
          opacity:   0.12,
          transform: 'rotate(22deg)',
        }}
      >
        <path d="M32 40 C32 34 30 28 22 16" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <path d="M32 40 C32 34 34 28 42 16" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <line x1="32" y1="40" x2="32" y2="50" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <circle cx="22" cy="15" r="2.5" fill="#1F1B16"/>
        <circle cx="42" cy="15" r="2.5" fill="#1F1B16"/>
        <circle cx="32" cy="50" r="2.5" fill="#1F1B16"/>
      </svg>

      {/* Lemon half — bottom left */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position:  'absolute',
          bottom:    '4%',
          left:      '2%',
          width:     260,
          height:    260,
          opacity:   0.1,
          transform: 'rotate(-15deg)',
        }}
      >
        <path d="M32 14 A18 18 0 0 1 32 50 Z" stroke="#1F1B16" strokeWidth="1.75" fill="none" strokeLinejoin="round"/>
        <line x1="32" y1="14" x2="32" y2="50" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <line x1="32" y1="32" x2="46" y2="20" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.65"/>
        <line x1="32" y1="32" x2="50" y2="32" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.65"/>
        <line x1="32" y1="32" x2="46" y2="44" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.65"/>
        <circle cx="32" cy="32" r="2" fill="#1F1B16"/>
        <path d="M32 17 A15 15 0 0 1 32 47" stroke="#1F1B16" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="2 3"/>
      </svg>

      {/* Garlic — mid left edge */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position:  'absolute',
          top:       '30%',
          left:      '-3%',
          width:     180,
          height:    180,
          opacity:   0.09,
          transform: 'rotate(8deg)',
        }}
      >
        <path d="M27 13 C17 14 12 22 12 31 C12 41 17 51 27 53 C36 53 40 45 40 35 C41 23 36 12 27 13 Z" stroke="#1F1B16" strokeWidth="1.75" fill="none"/>
        <line x1="27" y1="13" x2="27" y2="7" stroke="#1F1B16" strokeWidth="1.75" strokeLinecap="round"/>
        <path d="M49 21 C55 22 57 28 55 36 C53 43 49 47 46 46 C43 45 43 40 44 32 C45 25 45 20 49 21 Z" stroke="#1F1B16" strokeWidth="1.75" fill="none"/>
      </svg>

      {/* Butter stick — bottom right */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position:  'absolute',
          bottom:    '10%',
          right:     '-2%',
          width:     200,
          height:    200,
          opacity:   0.11,
          transform: 'rotate(-10deg)',
        }}
      >
        <rect x="16" y="22" width="32" height="22" stroke="#1F1B16" strokeWidth="1.75" fill="none" rx="1"/>
        <line x1="28" y1="22" x2="28" y2="44" stroke="#1F1B16" strokeWidth="1.25" strokeLinecap="round" opacity="0.4" strokeDasharray="2 3"/>
        <path d="M16 22 L22 16 L54 16 L48 22" stroke="#1F1B16" strokeWidth="1.75" fill="none" strokeLinejoin="round"/>
        <line x1="38" y1="16" x2="44" y2="22" stroke="#1F1B16" strokeWidth="1.5" strokeLinecap="round" opacity="0.55"/>
      </svg>

      {/* Onion rings — top right mid */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position:  'absolute',
          top:       '18%',
          right:     '-4%',
          width:     160,
          height:    160,
          opacity:   0.08,
          transform: 'rotate(45deg)',
        }}
      >
        <circle cx="32" cy="30" r="16" stroke="#1F1B16" strokeWidth="1.75" fill="none"/>
        <path d="M20 30 A12 12 0 0 1 44 30" stroke="#1F1B16" strokeWidth="1.75" fill="none" strokeLinecap="round"/>
        <path d="M24 30 A8 8 0 0 1 40 30" stroke="#1F1B16" strokeWidth="1.75" fill="none" strokeLinecap="round"/>
        <path d="M28 30 A4 4 0 0 1 36 30" stroke="#1F1B16" strokeWidth="1.25" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
function Breadcrumb({ current }: { current: StepId }) {
  const currentIdx = STEPS.findIndex(s => s.id === current)
  return (
    <div
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          8,
        marginBottom: 32,
        fontFamily:   MONO,
        fontSize:     12,
        letterSpacing:'0.05em',
        userSelect:   'none',
      }}
    >
      {STEPS.map((step, i) => {
        const isActive = step.id === current
        const isPast   = currentIdx > i
        return (
          <span key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                color:         isActive ? P.fg : P.fgMuted,
                opacity:       isPast ? 0.4 : 1,
                borderBottom:  isActive ? `1.5px solid ${P.fg}` : '1.5px solid transparent',
                paddingBottom: 2,
                textTransform: 'uppercase',
                transition:    `color 300ms ${E.gentle}, opacity 300ms ${E.gentle}`,
              }}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <span style={{ color: P.fgMuted, opacity: 0.35, fontSize: 10, lineHeight: 1 }}>›</span>
            )}
          </span>
        )
      })}
    </div>
  )
}

// ── Glass panel ───────────────────────────────────────────────────────────────
function GlassPanel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        backdropFilter:       'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        background:           'rgba(244, 241, 234, 0.82)',
        border:               '1px solid rgba(212, 207, 194, 0.6)',
        borderRadius:         20,
        padding:              '40px 40px 36px',
        position:             'relative',
        zIndex:               1,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── Item card (shared for fridge + equipment) ─────────────────────────────────
function ItemCard({
  id,
  label,
  accent,
  svg,
  selected,
  onToggle,
}: {
  id: string
  label: string
  accent: string
  svg: React.ReactNode
  selected: boolean
  onToggle: (id: string) => void
}) {
  return (
    <button
      onClick={() => onToggle(id)}
      aria-pressed={selected}
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            8,
        padding:        '16px 8px 12px',
        background:     selected ? P.surface : 'rgba(240,235,224,0.5)',
        border:         selected ? `1.5px solid ${accent}` : `1px solid ${P.border}`,
        borderRadius:   12,
        cursor:         'pointer',
        outline:        'none',
        boxShadow:      selected ? `0 0 0 3px ${accent}28` : 'none',
        transition:     [
          `background 220ms ${E.gentle}`,
          `border-color 220ms ${E.gentle}`,
          `box-shadow 220ms ${E.gentle}`,
          `transform 160ms ${E.decisive}`,
        ].join(', '),
      }}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.background = 'rgba(240,235,224,0.85)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={e => {
        if (!selected) e.currentTarget.style.background = 'rgba(240,235,224,0.5)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ lineHeight: 0 }}>{svg}</div>
      <span
        style={{
          fontFamily:    MONO,
          fontSize:      12,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color:         selected ? P.fg : P.fgMuted,
          transition:    `color 220ms ${E.gentle}`,
          textAlign:     'center',
        }}
      >
        {label}
      </span>
    </button>
  )
}

// ── Primary action button ─────────────────────────────────────────────────────
function AdvanceButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily:    MONO,
        fontSize:      13,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        background:    P.fg,
        border:        `1px solid ${P.fg}`,
        color:         P.bg,
        padding:       '11px 28px',
        borderRadius:  0,
        cursor:        'pointer',
        marginTop:     28,
        transition:    `opacity 200ms ${E.gentle}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.75' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
    >
      {label}
    </button>
  )
}

// ── Back link ─────────────────────────────────────────────────────────────────
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily:    MONO,
        fontSize:      12,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        background:    'transparent',
        border:        'none',
        color:         P.fgMuted,
        cursor:        'pointer',
        padding:       0,
        marginTop:     28,
        transition:    `color 180ms ${E.gentle}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.color = P.fg }}
      onMouseLeave={e => { e.currentTarget.style.color = P.fgMuted }}
    >
      ← Back
    </button>
  )
}

// ── Recipe card ───────────────────────────────────────────────────────────────
function RecipeCard({
  recipe,
  isLast,
}: {
  recipe: typeof RECIPES[number]
  isLast: boolean
}) {
  return (
    <div
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderTopColor = P.fg
        if (isLast) el.style.borderBottomColor = P.fg
        const link = el.querySelector<HTMLElement>('[data-recipe-link]')
        if (link) link.style.color = P.fg
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderTopColor = P.border
        if (isLast) el.style.borderBottomColor = P.border
        const link = el.querySelector<HTMLElement>('[data-recipe-link]')
        if (link) link.style.color = P.fgMuted
      }}
      style={{
        padding:      '22px 0',
        borderTop:    `1px solid ${P.border}`,
        borderBottom: isLast ? `1px solid ${P.border}` : 'none',
        transition:   `border-color 220ms ${E.gentle}`,
      }}
    >
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'flex-start',
          gap:            16,
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontFamily:    MONO,
              fontWeight:    500,
              fontSize:      18,
              letterSpacing: '-0.02em',
              lineHeight:    1.25,
              color:         P.fg,
              marginBottom:  6,
            }}
          >
            {recipe.name}
          </h3>
          <p
            style={{
              fontFamily: MONO,
              fontSize:   13,
              lineHeight: 1.6,
              color:      P.fgMuted,
              maxWidth:   '46ch',
            }}
          >
            {recipe.description}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {[recipe.time, recipe.difficulty].map(tag => (
              <span
                key={tag}
                style={{
                  fontFamily:    MONO,
                  fontSize:      11,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color:         P.fgMuted,
                  border:        `1px solid ${P.border}`,
                  padding:       '3px 8px',
                  borderRadius:  2,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <span
          data-recipe-link
          style={{
            fontFamily:    MONO,
            fontSize:      12,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color:         P.fgMuted,
            transition:    `color 220ms ${E.gentle}`,
            flexShrink:    0,
            paddingTop:    4,
          }}
        >
          View recipe →
        </span>
      </div>
    </div>
  )
}

// ── Toggle factory — shared between fridge and equipment ──────────────────────
function makeToggle(setter: React.Dispatch<React.SetStateAction<Set<string>>>) {
  return (id: string) => {
    setter(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export function FridgeEntry() {
  const [step,      setStep]      = useState<StepId>('fridge')
  const [fridgeSel, setFridgeSel] = useState<Set<string>>(new Set())
  const [equipSel,  setEquipSel]  = useState<Set<string>>(new Set())
  const [prefSel,   setPrefSel]   = useState<Record<string, string>>({})

  const toggleFridge = useCallback(makeToggle(setFridgeSel), []) // eslint-disable-line react-hooks/exhaustive-deps
  const toggleEquip  = useCallback(makeToggle(setEquipSel),  []) // eslint-disable-line react-hooks/exhaustive-deps

  const setPref = useCallback((groupId: string, option: string) => {
    setPrefSel(prev => ({ ...prev, [groupId]: option }))
  }, [])

  const reset = useCallback(() => {
    setStep('fridge')
    setFridgeSel(new Set())
    setEquipSel(new Set())
    setPrefSel({})
  }, [])

  const reasoning = useMemo(() => {
    const selectedFridge = FRIDGE_ITEMS.filter(i => fridgeSel.has(i.id)).map(i => i.label.toLowerCase())
    const selectedEquip  = EQUIP_ITEMS.filter(i => equipSel.has(i.id)).map(i => i.label.toLowerCase())
    const nutrition      = prefSel['nutrition'] ?? 'no restriction'
    const cuisine        = prefSel['cuisine']   ?? 'any cuisine'

    const fridgeStr = selectedFridge.length > 0
      ? selectedFridge.length <= 4
        ? selectedFridge.join(', ')
        : `${selectedFridge.slice(0, 4).join(', ')}, and ${selectedFridge.length - 4} more`
      : 'a mix of pantry staples'

    const equipStr = selectedEquip.length > 0
      ? selectedEquip.slice(0, 2).join(' and ')
      : 'your stovetop'

    return `You have ${fridgeStr}. Your ${equipStr} can handle everything here. You picked ${nutrition.toLowerCase()} and ${cuisine.toLowerCase()} flavors — so I made these three calls.`
  }, [fridgeSel, equipSel, prefSel])

  return (
    <div
      style={{
        background:     P.bg,
        minHeight:      '72vh',
        position:       'relative',
        overflow:       'hidden',
        padding:        '52px 24px 64px',
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'center',
      }}
    >
      <GhostBackground />

      <GlassPanel style={{ width: '100%', maxWidth: 680 }}>
        <Breadcrumb current={step} />

        {step === 'fridge' && (
          <div>
            <h2 style={PANEL_TITLE}>What&apos;s in your fridge?</h2>

            <div
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap:                 10,
              }}
            >
              {FRIDGE_ITEMS.map(item => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  accent={item.color}
                  svg={item.svg}
                  selected={fridgeSel.has(item.id)}
                  onToggle={toggleFridge}
                />
              ))}
            </div>

            <div style={ROW_SPREAD}>
              <span
                style={{
                  fontFamily:    MONO,
                  fontSize:      12,
                  color:         P.fgMuted,
                  letterSpacing: '0.04em',
                }}
              >
                {fridgeSel.size > 0
                  ? `${fridgeSel.size} item${fridgeSel.size === 1 ? '' : 's'} selected`
                  : 'Tap items to select'}
              </span>
              <AdvanceButton label="Equipment →" onClick={() => setStep('equipment')} />
            </div>
          </div>
        )}

        {step === 'equipment' && (
          <div>
            <h2 style={PANEL_TITLE}>What can you cook with?</h2>

            <div
              style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap:                 10,
              }}
            >
              {EQUIP_ITEMS.map(item => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  accent={P.blue}
                  svg={item.svg}
                  selected={equipSel.has(item.id)}
                  onToggle={toggleEquip}
                />
              ))}
            </div>

            <div style={ROW_SPREAD}>
              <BackButton onClick={() => setStep('fridge')} />
              <AdvanceButton label="Preferences →" onClick={() => setStep('preferences')} />
            </div>
          </div>
        )}

        {step === 'preferences' && (
          <div>
            <h2 style={PANEL_TITLE}>How are you eating tonight?</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {PREF_GROUPS.map(group => (
                <div key={group.id}>
                  <p style={EYEBROW}>{group.label}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {group.options.map(option => (
                      <PrefCard
                        key={option}
                        label={option}
                        selected={prefSel[group.id] === option}
                        onClick={() => setPref(group.id, option)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={ROW_SPREAD}>
              <BackButton onClick={() => setStep('equipment')} />
              <AdvanceButton label="See what I can make →" onClick={() => setStep('recipes')} />
            </div>
          </div>
        )}

        {step === 'recipes' && (
          <div>
            <div
              style={{
                borderLeft:   `2px solid ${P.border}`,
                paddingLeft:  20,
                marginBottom: 36,
              }}
            >
              <p style={EYEBROW}>Based on what you have</p>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize:   17,
                  lineHeight: 1.65,
                  color:      P.fgMuted,
                  maxWidth:   '52ch',
                }}
              >
                {reasoning}
              </p>
            </div>

            <div>
              {RECIPES.map((recipe, i) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isLast={i === RECIPES.length - 1}
                />
              ))}
            </div>

            <div style={{ marginTop: 36, textAlign: 'center' }}>
              <button
                onClick={reset}
                style={{
                  fontFamily:    MONO,
                  fontSize:      12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background:    'transparent',
                  border:        'none',
                  color:         P.fgMuted,
                  cursor:        'pointer',
                  padding:       0,
                  transition:    `color 180ms ${E.gentle}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = P.fg }}
                onMouseLeave={e => { e.currentTarget.style.color = P.fgMuted }}
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  )
}

// ── Preference card ───────────────────────────────────────────────────────────
function PrefCard({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      onMouseEnter={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = P.fg
          e.currentTarget.style.color = P.fg
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          e.currentTarget.style.borderColor = P.border
          e.currentTarget.style.color = P.fgMuted
        }
      }}
      style={{
        fontFamily:    MONO,
        fontSize:      13,
        padding:       '10px 16px',
        background:    selected ? P.surface : 'rgba(240,235,224,0.5)',
        border:        `1px solid ${selected ? P.accentSelected : P.border}`,
        borderRadius:  0,
        color:         selected ? P.fg : P.fgMuted,
        cursor:        'pointer',
        letterSpacing: '0.01em',
        transition:    [
          `background 200ms ${E.gentle}`,
          `border-color 200ms ${E.gentle}`,
          `color 200ms ${E.gentle}`,
        ].join(', '),
      }}
    >
      {label}
    </button>
  )
}
