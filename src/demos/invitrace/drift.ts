// Drift as data: each forked Admit button against the shared component, property by property.
import { checkBrand } from './model'

export type Fork = { pad: string; r: number; bg: string; rot: number; x: number; y: number; weight: number; label: string; h: number }
export type ButtonProps = { pad: string; r: number; bg: string; weight: number; label: string; h: number }
export type Column = 'pad' | 'r' | 'weight' | 'contrast' | 'label' | 'h'
export const COLUMNS: { id: Column; label: string }[] = [
  { id: 'contrast', label: 'Contrast' }, { id: 'pad', label: 'Padding' }, { id: 'r', label: 'Radius' },
  { id: 'weight', label: 'Weight' }, { id: 'h', label: 'Height' }, { id: 'label', label: 'Label' },
]
export const forkName = (i: number) => `Fork ${String.fromCharCode(65 + i)}`

export function cell(p: ButtonProps, c: Column) {
  switch (c) {
    case 'pad': return p.pad
    case 'r': return `${p.r}px`
    case 'weight': return String(p.weight)
    case 'contrast': return `${checkBrand(p.bg).ratio.toFixed(2)}:1`
    case 'label': return p.label
    case 'h': return `${p.h}px`
  }
}
/** Numbers inside a cell, for the count-to-target animation. */
export const nums = (s: string) => (s.match(/\d+(\.\d+)?/g) ?? []).map(Number)

/** Does this fork differ from the shared component on this property? Contrast is marked when it fails. */
export function outlier(f: ButtonProps, canon: ButtonProps, c: Column) {
  return c === 'contrast' ? !checkBrand(f.bg).ok : cell(f, c) !== cell(canon, c)
}

export function driftSummary(forks: Fork[], canon: ButtonProps) {
  const per = forks.map((f, i) => ({ i, n: COLUMNS.filter(c => c.id === 'contrast' ? f.bg !== canon.bg : outlier(f, canon, c.id)).length }))
  const most = per.reduce((a, b) => (b.n > a.n ? b : a), per[0])
  const converged = COLUMNS.map(c => ({ col: c, forks: forks.filter(f => (c.id === 'contrast' ? f.bg !== canon.bg : outlier(f, canon, c.id))).length }))
  return { most, converged }
}

/** A lab-report flag for an out-of-range value: H above the reference, L below, ≠ for text. */
export function flag(f: ButtonProps, canon: ButtonProps, c: Column): 'H' | 'L' | '≠' {
  if (c === 'label') return '≠'
  if (c === 'contrast') return 'L'
  const a = nums(cell(f, c)), b = nums(cell(canon, c))
  const sa = a.reduce((x, y) => x + y, 0), sb = b.reduce((x, y) => x + y, 0)
  return sa > sb ? 'H' : sa < sb ? 'L' : '≠'
}
