// Sample readings and the two scoring rules shown on the Vitae case study.
// These are demo values for the page, not Vitae's production model.

export type ScoreMode = 'everyone' | 'personal'
export type ReadingKey = 'sleep' | 'steps' | 'water' | 'hr'

export type Reading = {
  key: ReadingKey
  label: string
  value: number
  /** This person's average over their last 14 days. */
  usual: number
  /** The one-size target the everyone score divides by. */
  target: number
  /** Right end of the bar. */
  max: number
  lowerIsBetter?: boolean
  format: (n: number) => string
}

const hours = (h: number) => {
  const whole = Math.floor(h)
  const mins = Math.round((h - whole) * 60)
  return `${whole}h ${String(mins).padStart(2, '0')}`
}

export const READINGS: Reading[] = [
  { key: 'sleep', label: 'Sleep',   value: 4.83, usual: 4.92, target: 8,     max: 10,    format: hours },
  { key: 'steps', label: 'Steps',   value: 5000, usual: 5300, target: 10000, max: 12000, format: n => `${(n / 1000).toFixed(1)}k` },
  { key: 'water', label: 'Water',   value: 0.9,  usual: 0.95, target: 2,     max: 2.5,   format: n => `${n.toFixed(1)} L` },
  { key: 'hr',    label: 'Rest HR', value: 68,   usual: 67,   target: 60,    max: 90,    lowerIsBetter: true, format: n => `${Math.round(n)}` },
]

/** What the everyone score quietly substitutes for a missing night. */
export const GUESSED_SLEEP = 7

/** A reading within this share of the person's own average counts as usual. */
export const USUAL_BAND = 0.1

export type Missing = ReadingKey | null

export function everyoneScore(missing: Missing) {
  const parts = READINGS.map(r => {
    const v = r.key === missing && r.key === 'sleep' ? GUESSED_SLEEP : r.value
    return Math.min(1, r.lowerIsBetter ? r.target / v : v / r.target)
  })
  const score = Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100)
  const band = score < 65 ? 'Poor' : score < 80 ? 'Fair' : 'Good'
  return { score, band } as const
}

export function personalCheck(missing: Missing) {
  const used = READINGS.filter(r => r.key !== missing)
  const usual = used.filter(r => Math.abs(r.value - r.usual) / r.usual <= USUAL_BAND).length
  return { used: used.length, total: READINGS.length, onTrack: usual === used.length }
}

/** The value a row shows in each mode. The everyone score shows its guess as if it were measured. */
export function shownValue(r: Reading, mode: ScoreMode, missing: Missing): number | null {
  if (r.key !== missing) return r.value
  return mode === 'everyone' && r.key === 'sleep' ? GUESSED_SLEEP : null
}
