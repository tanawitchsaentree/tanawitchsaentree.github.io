import { PROMPT_HEAD, QUEUE_DOCS, SHAPES, TOGGLE_CARD, type L1, type Shape } from './data'

export type VersionStatus = 'Draft' | 'Approved' | 'Deployed'
export type Version = { n: number; label: string; status: VersionStatus; active: boolean }
export type QueueRow = { id: string; status: 'Available' | 'Locked' | 'Done'; queue: string }

export type DeskState = {
  /** 0 = hero, 1–6 = moments. Set by one IntersectionObserver. */
  active: number
  shape: Shape
  /** The editable Claims tree used from moment 2 on. */
  tree: L1[]
  placeholder: boolean
  l2On: boolean
  expected: Record<string, string>
  run: 'idle' | 'running' | 'done'
  versions: Version[]
  rows: QueueRow[]
  openDoc: string | null
  toast: { n: number; text: string } | null
}

export const baseTree = (): L1[] =>
  SHAPES.claims.l1.map(c => ({ name: c.name, l2: c.l2.filter(t => !(c.name === TOGGLE_CARD.l1 && t === TOGGLE_CARD.l2)) }))

/** Built on first render (after unlock): it reads the gated tree and queue. */
export const initialState = (): DeskState => ({
  active: 0, shape: 'claims', tree: baseTree(), placeholder: true, l2On: true,
  expected: {}, run: 'idle',
  versions: [
    { n: 1, label: 'Version 1', status: 'Deployed', active: true },
    { n: 2, label: 'Version 2', status: 'Draft', active: false },
  ],
  rows: QUEUE_DOCS.map(d => ({ id: d.id, status: 'Available', queue: d.queue })),
  openDoc: null, toast: null,
})

/** Moment 1 shows the chosen shape; from moment 2 the editable Claims tree. */
export function shownTree(s: DeskState): { l0: string; l1: L1[]; note?: string } {
  if (s.active <= 1) return SHAPES[s.shape]
  return { l0: SHAPES.claims.l0, l1: s.tree }
}

// ── Fixed geometry (mirrors docsort.module.css) ──
export const G = {
  stageW: 600, stageH: 620,
  treeW: 216, sheetX: 240,
  treeTop: 52, l0H: 34, l1H: 38, l2H: 30, gap: 6,
  lineTop: 92, lineH: 20,
  chipW: 52, chipH: 22, chipStep: 56,
}

/** Phone stage: 340 × 520, everything stacked. */
export const PG = { stageW: 340, stageH: 520, treeTop: 44, l0H: 28, l1H: 30, l2H: 22, gap: 3, lineH: 16 }

type TreeGeo = { treeTop: number; l0H: number; l1H: number; l2H: number; gap: number }
export type Row = { key: string; kind: 'l0' | 'l1' | 'l2'; label: string; y: number; h: number; tucked: boolean; parent?: string }

/** Card rows. With document types off, L2 cards tuck under their category card. */
export function layoutTree(t: { l0: string; l1: L1[] }, l2On: boolean, geo: TreeGeo = G): Row[] {
  const rows: Row[] = [{ key: `l0:${t.l0}`, kind: 'l0', label: t.l0, y: geo.treeTop, h: geo.l0H, tucked: false }]
  let y = geo.treeTop + geo.l0H + geo.gap
  for (const c of t.l1) {
    const cy = y
    rows.push({ key: `l1:${c.name}`, kind: 'l1', label: c.name, y: cy, h: geo.l1H, tucked: false })
    y += geo.l1H + geo.gap
    for (const d of c.l2) {
      rows.push({ key: `l2:${c.name}>${d}`, kind: 'l2', label: d, y: l2On ? y : cy + 4, h: geo.l2H, tucked: !l2On, parent: c.name })
      if (l2On) y += geo.l2H + geo.gap
    }
  }
  return rows
}

export const leafOf = (l1: string, l2?: string) => (l2 ? `${l1} > ${l2}` : l1)

/** Classes a document can be sorted into. */
export function leaves(l1s: L1[], l2On: boolean): string[] {
  return l1s.flatMap(c => (l2On && c.l2.length ? c.l2.map(d => leafOf(c.name, d)) : [c.name]))
}

/** The prompt as the tool fills it in. Lines are keyed so new ones type in. */
export function promptLines(l1s: L1[], l2On: boolean, placeholder: boolean): { key: string; text: string; hier?: boolean }[] {
  type Line = { key: string; text: string; hier?: boolean }
  const out: Line[] = PROMPT_HEAD.map((text, i) => ({ key: `h${i}`, text }))
  if (!placeholder) return out
  out.push({ key: 'cats', text: 'Document categories:', hier: true })
  for (const c of l1s) out.push({ key: `c:${c.name}`, text: `- ${c.name}`, hier: true })
  if (l2On && l1s.some(c => c.l2.length)) {
    out.push({ key: 'types', text: 'Document types:', hier: true })
    for (const c of l1s) for (const d of c.l2) out.push({ key: `t:${c.name}>${d}`, text: `- ${c.name} > ${d}`, hier: true })
  }
  return out
}

export const pendingVersion = (s: DeskState) => s.versions.find(v => !v.active && v.status !== 'Deployed')
