// Invitrace ward console: the token model behind the demo. Pure functions; no DOM.
import { hexToOklch, oklchToHex } from './oklch'
// Tier 1 raw → Tier 2 theme (the only tier a hospital edits) → Tier 3 semantic → Tier 4 component.

export type ArchetypeId = 'medium' | 'large' | 'specialty'
export type Density = 'compact' | 'regular' | 'comfortable'
export type Layout = 'row' | 'column' | 'hero'
export type Surface = 'light' | 'dark'
export type Hospital = { id: string; archetype: ArchetypeId; name: string; primary: string; radius: number; density: Density; layout: Layout; custom?: boolean }
export type PresetId = 'compact' | 'accessible' | 'night'
export type Preset = { id: PresetId; label: string; who: string; density: Density; textScale: number; contrast: 'standard' | 'high'; surface: Surface }
export type GovState = 'flexible' | 'locked' | 'flag'
export type GovRule = { id: string; primitive: string; label: string } & Record<ArchetypeId, { state: GovState; record: string; why: string; short: string }>

/** Tier 1: raw values shared by every hospital. Status colours live here and nowhere else. */
export const RAW = {
  white: '#FEFEFF',   // near-white: text on brand and status fills (no pure #FFF)
  critical: '#A8433A',
  criticalDeep: '#8A342D',
  warning: '#8A6116',
  ok: '#3E7458',
} as const

/** Tier 1 palettes. Each hospital type has a soft ramp; the night ramp serves every hospital.
    Steps: 25 raised card · 50 base surface (60%) · 200 band (30%) · 300 rule · 500 strong rule ·
    600 secondary text · 900 text · 950 high-contrast text. Night runs the other way. */
export type PaletteId = 'sage' | 'fog' | 'plum'
export type Ramp = { '25': string; '50': string; '200': string; '300': string; '500': string; '600': string; '900': string; '950': string }
export const PALETTES: Record<PaletteId, Ramp> = {
  sage: { '25': '#F9FAF7', '50': '#F3F5F1', '200': '#DDE6DE', '300': '#C6D1C8', '500': '#7C8A80', '600': '#4F5D55', '900': '#23302A', '950': '#141C18' },
  fog:  { '25': '#F8F9FB', '50': '#F2F4F7', '200': '#DCE3EC', '300': '#C5CFDB', '500': '#7A8799', '600': '#4B5767', '900': '#1F2A37', '950': '#121A24' },
  plum: { '25': '#FBF9F8', '50': '#F7F3F2', '200': '#EADFDD', '300': '#D8C8C5', '500': '#8D7B78', '600': '#5C4B4F', '900': '#2E2326', '950': '#1C1517' },
}
export const NIGHT = { '900': '#1B1F25', '850': '#222830', '800': '#262C34', '700': '#353C46', '400': '#7D8794', '300': '#AEB5BF', '100': '#E6E9EE', '50': '#F4F6F9' } as const
export const ARCH_PALETTE: Record<ArchetypeId, PaletteId> = { medium: 'sage', large: 'fog', specialty: 'plum' }

// ── Colour maths (WCAG 2.x) ──
const toRgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number]
const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
export const luminance = (hex: string) => { const [r, g, b] = toRgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
export const contrast = (a: string, b: string) => { const la = luminance(a), lb = luminance(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05) }
export const isHex = (s: string) => /^#[0-9a-fA-F]{6}$/.test(s)

function rgbToHsl([r, g, b]: [number, number, number]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h / 6, s, l]
}
function hslToHex(h: number, s: number, l: number) {
  const f = (n: number) => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)) }
  return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase()
}
/** The nearest colour with the same hue and saturation that reaches `min` against `on`. */
export function nearestPassing(hex: string, on: string = RAW.white, min = 4.5) {
  const [h, s, l0] = rgbToHsl(toRgb(hex))
  for (let l = l0; l >= 0; l -= 0.005) { const c = hslToHex(h, s, l); if (contrast(c, on) >= min) return c }
  return PALETTES.sage['950']
}

/** The brand colour carries white button text, so it must reach AA (4.5:1) against white. */
export const BRAND_MIN = 4.5
/** The brand colour on a dark surface: lifted in lightness while white text still reaches 4.6:1. */
export function liftForDark(hex: string) {
  const o = hexToOklch(hex)
  let best = hex
  for (let d = 0.01; d <= 0.08; d += 0.01) { const c = oklchToHex(o.L + d, o.C, o.h); if (contrast(c, RAW.white) >= 4.6) best = c; else break }
  return best
}

export const checkBrand = (hex: string) => { const r = contrast(hex, RAW.white); return { ratio: r, ok: r >= BRAND_MIN, nearest: r >= BRAND_MIN ? hex : nearestPassing(hex) } }

// ── Tier resolution ──
/** Per-hospital overrides of flexible axes. `density` overrides the theme's density; a ward preset still sits above it. */
export type Gov = { labelsFloat: boolean; touch36: boolean; desktopFlag: boolean; iconOnly: boolean; density: Density | null; hideBed: boolean }
export const GOV_DEFAULT: Gov = { labelsFloat: false, touch36: false, desktopFlag: false, iconOnly: false, density: null, hideBed: false }

export type Resolved = {
  theme: Record<string, string>
  semantic: Record<string, string>
  component: Record<string, string>
  css: Record<string, string>
}

export const DENSITY_PAD: Record<Density, number> = { compact: 6, regular: 10, comfortable: 14 }

export function resolve(h: Hospital, preset: Preset | null, gov: Gov): Resolved {
  const surface: Surface = preset?.surface ?? 'light'
  const high = preset?.contrast === 'high'
  const density: Density = preset?.density ?? gov.density ?? h.density
  const scale = preset?.textScale ?? 1
  // Tier 2: what a hospital (or a ward preset) may change. Text routes through here because
  // it depends on the surface.
  const ramp = PALETTES[ARCH_PALETTE[h.archetype]]
  const dark = surface === 'dark'
  const theme: Record<string, string> = {
    'brand.primary': dark ? liftForDark(h.primary) : h.primary,
    'brand.radius': `${h.radius}px`,
    'brand.density': density,
    'brand.layout': h.layout,
    'brand.surface': dark ? NIGHT['900'] : ramp['50'],
    'brand.card': dark ? NIGHT['850'] : ramp['25'],
    'brand.band': dark ? NIGHT['800'] : ramp['200'],
    'brand.text': dark ? NIGHT['100'] : high ? ramp['950'] : ramp['900'],
    'brand.textMuted': dark ? NIGHT['300'] : high ? ramp['900'] : ramp['600'],
    'brand.line': dark ? NIGHT['700'] : high ? ramp['500'] : ramp['300'],
    'brand.textScale': String(scale),
  }
  // Tier 3: names by intent. Status skips Tier 2 and reads Tier 1 directly.
  const semantic: Record<string, string> = {
    'color.primary': '{brand.primary}',
    'color.onPrimary': '{raw.white}',
    'color.surface': '{brand.surface}',
    'color.card': '{brand.card}',
    'color.band': '{brand.band}',
    'color.text': '{brand.text}',
    'color.textMuted': '{brand.textMuted}',
    'color.critical': '{raw.critical}',
    'color.warning': '{raw.warning}',
    'color.ok': '{raw.ok}',
    'space.pad': `${DENSITY_PAD[density]}px`,
  }
  const target = gov.touch36 && gov.desktopFlag ? 36 : 44
  // Tier 4: component tokens alias semantic names only.
  const component: Record<string, string> = {
    'button.background': '{color.primary}',
    'button.text': '{color.onPrimary}',
    'button.radius': '{brand.radius}',
    'button.minHeight': `${target}px`,
    'button.label': gov.iconOnly ? 'icon-only' : 'text',
    'field.label': gov.labelsFloat ? 'floating' : 'always-visible',
    'field.error': 'persistent',
    'table.riskColumn': 'locked-visible',
    'table.bedColumn': gov.hideBed ? 'hidden-for-role' : 'visible',
    'alert.background': '{color.critical}',
    'doctorCard.layout': '{brand.layout}',
  }
  const css: Record<string, string> = {
    '--ix-primary': theme['brand.primary'],
    '--ix-band': theme['brand.band'],
    '--ix-critical-deep': RAW.criticalDeep,
    '--ix-on-primary': RAW.white,
    '--ix-surface': theme['brand.surface'],
    '--ix-card': theme['brand.card'],
    '--ix-text': theme['brand.text'],
    '--ix-muted': theme['brand.textMuted'],
    '--ix-line': theme['brand.line'],
    '--ix-radius': theme['brand.radius'],
    '--ix-pad': semantic['space.pad'],
    '--ix-target': `${target}px`,
    '--ix-scale': String(scale),
    '--ix-critical': RAW.critical,
    '--ix-warning': RAW.warning,
    '--ix-ok': RAW.ok,
  }
  return { theme, semantic, component, css }
}

/** A design-file line and a code diff line for one token change. */
export function diffLines(hospital: string, token: string, from: string, to: string, file = `themes/${hospital}.json`) {
  const cssName = `--${token.replace(/\./g, '-')}`
  return {
    figma: `Variables › Theme › ${hospital} › ${token.replace('.', '/')}  ${from} → ${to}`,
    code: [`${file}`, `- "${token}": "${from}"`, `+ "${token}": "${to}"`, `css: ${cssName}`],
  }
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'new-hospital'
