// Allianz case study. All story text and sample data live in content/gated/docsort.json and
// ship only as an encrypted blob (scripts/encrypt-gated.mjs). These exports are live views
// that read the decrypted blob at render time; see src/lib/gated.ts.
import { gated } from '@/lib/gated'

const G = 'docsort'

export type L1 = { name: string; l2: string[] }
export type Tree = { l0: string; l1: L1[]; note?: string }
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'
export type Entry = { who: string; time: string; paras: string[]; aside?: { label: string; text: string } }
export type Day = { heading: string; entries: Entry[]; how: string[]; howAside?: { label: string; text: string } }
export type Answer = { leaf: string; confidence: number; reasoning: string }
export type Sample = { id: string; file: string; expected: string; result: Answer | { failed: string }; rerun?: Answer }
export type Row = { id: string; date: string; sender: string; status: 'Available' | 'Locked'; category: string; queue: string; signature?: boolean }
type Note = { heading: string; paras: string[]; how?: string[] }

export const HERO = gated<{ eyebrow: string; title: string; intro: string; caption: string; spreadLabel: string }>(G, 'HERO')
export const SPREAD = gated<{ ana: { label: string; lines: string[] }; theo: { label: string; lines: string[] }; trayFrom: string; trayTo: string }>(G, 'SPREAD')
export const DAYS = gated<Record<DayKey, Day>>(G, 'DAYS')
export const NOTES = gated<{ n02: Note; n04: Note; n08: Note }>(G, 'NOTES')
export const LETTER = gated<{ file: string; lines: string[] }>(G, 'LETTER')
/** Monday's Claims tree: Assessor report only under Vehicle, Property empty. */
export const TREE = gated<Tree>(G, 'TREE')
/** The document type Ana adds on Tuesday. */
export const TOGGLE_CARD = gated<{ l1: string; l2: string }>(G, 'TOGGLE_CARD')
/** Three teams, three tree shapes (notes page 02). */
export const TREES = gated<Tree[]>(G, 'TREES')
export const PROMPT_HEAD = gated<string[]>(G, 'PROMPT_HEAD')
export const SAMPLES = gated<Sample[]>(G, 'SAMPLES')
export const QUEUES = gated<string[]>(G, 'QUEUES')
export const ROWS = gated<Row[]>(G, 'ROWS')
export const DETAIL = gated<{
  outline: { group: string; doc: string; pages: string[] }
  lobs: string[]
  datapoints: { field: string; value: string }[]
  columns: string[]
  rows: string[][]
  redCells: [number, number][]
}>(G, 'DETAIL')
export const DIALOGS = gated<{
  create: { title: string; sub: string; banner: string; confirm: string; ask: string; toast: string; field: string }
  delete: { confirm: string; ask: string; toast: string }
  rename: { title: string; sub: string; error: string; toast: string; from: string; value: string }
  addType: { title: string; error: string }
}>(G, 'DIALOGS')
export const COSTS = gated<{ create: string; delete: string; rename: string }>(G, 'COSTS')
export const UI = gated<Record<string, string>>(G, 'UI')
export const ECHO = gated<{ labels: string[]; caption: string; accent?: boolean }[]>(G, 'ECHO')
export const TEXT = gated<{ addedLine: string; credit: string }>(G, 'TEXT')

/** Fill {name} slots in a UI string. */
export const fill = (key: string, vars: Record<string, string | number> = {}) =>
  UI[key].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''))
