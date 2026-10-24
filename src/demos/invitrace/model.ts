// Invitrace ward console: the token model behind the demo. Pure functions; no DOM.
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
  white: '#FEFEFF',   // near-white: button text and cards (no pure #FFF)
  ink: '#1D1A26',
  inkHigh: '#0B0A10',
  inkMuted: '#5B5670',
  inkMutedHigh: '#3A3548',
  paper: '#FBFAFE',
  card: '#FEFEFF',
  line: '#E2DDEC',
  lineHigh: '#8C849E',
  night: '#15131C',
  nightCard: '#211E2B',
  nightText: '#F3F0FA',
  nightMuted: '#C2BBD3',
  nightLine: '#3A3548',
  critical: '#B42318',
  warning: '#A15C07',
  ok: '#067647',
} as const

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
  return RAW.ink
}

/** The brand colour carries white button text, so it must reach AA (4.5:1) against white. */
export const BRAND_MIN = 4.5
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

const DENSITY_PAD: Record<Density, number> = { compact: 6, regular: 10, comfortable: 14 }

export function resolve(h: Hospital, preset: Preset | null, gov: Gov): Resolved {
  const surface: Surface = preset?.surface ?? 'light'
  const high = preset?.contrast === 'high'
  const density: Density = preset?.density ?? gov.density ?? h.density
  const scale = preset?.textScale ?? 1
  // Tier 2: what a hospital (or a ward preset) may change. Text routes through here because
  // it depends on the surface.
  const theme: Record<string, string> = {
    'brand.primary': h.primary,
    'brand.radius': `${h.radius}px`,
    'brand.density': density,
    'brand.layout': h.layout,
    'brand.surface': surface === 'dark' ? RAW.night : RAW.paper,
    'brand.card': surface === 'dark' ? RAW.nightCard : RAW.card,
    'brand.text': surface === 'dark' ? RAW.nightText : high ? RAW.inkHigh : RAW.ink,
    'brand.textMuted': surface === 'dark' ? RAW.nightMuted : high ? RAW.inkMutedHigh : RAW.inkMuted,
    'brand.line': surface === 'dark' ? RAW.nightLine : high ? RAW.lineHigh : RAW.line,
    'brand.textScale': String(scale),
  }
  // Tier 3: names by intent. Status skips Tier 2 and reads Tier 1 directly.
  const semantic: Record<string, string> = {
    'color.primary': '{brand.primary}',
    'color.onPrimary': '{raw.white}',
    'color.surface': '{brand.surface}',
    'color.card': '{brand.card}',
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
    '--ix-primary': h.primary,
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
