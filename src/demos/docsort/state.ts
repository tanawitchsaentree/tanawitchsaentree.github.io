import { PROMPT_HEAD, TOGGLE_CARD, TREE, type L1 } from './data'

export type VersionStatus = 'Draft' | 'Approved' | 'Deployed'
export type Version = { n: number; status: VersionStatus; active: boolean }

/** Shared across the week: the Claims tree Ana edits and the prompt's placeholder. */
export type Shared = { tree: L1[]; placeholder: boolean }

/** Built on first render (after unlock): it reads the gated tree. */
export const initialShared = (): Shared => ({
  tree: TREE.l1.map(c => ({ name: c.name, l2: [...c.l2] })),
  placeholder: true,
})

export const leafOf = (l1: string, l2?: string) => (l2 ? `${l1} > ${l2}` : l1)
export const catOf = (leaf: string) => leaf.split(' > ')[0]
/** "Vehicle > Assessor report" read aloud as "Vehicle, Assessor report". */
export const spoken = (leaf: string) => leaf.replace(' > ', ', ')

/** Classes a document can be filed under: each document type, or the bare category if it has none. */
export function leaves(l1s: L1[]): string[] {
  return l1s.flatMap(c => (c.l2.length ? c.l2.map(d => leafOf(c.name, d)) : [c.name]))
}

/** The nearest class that exists in the current tree (a leaf, else its category). */
export function nearest(l1s: L1[], leaf: string) {
  const opts = leaves(l1s)
  if (opts.includes(leaf)) return leaf
  const c = catOf(leaf)
  return opts.find(o => o === c || o.startsWith(`${c} > `)) ?? opts[0]
}

export const hasType = (l1s: L1[], l1 = TOGGLE_CARD.l1, l2 = TOGGLE_CARD.l2) =>
  l1s.some(c => c.name === l1 && c.l2.includes(l2))

export const withType = (l1s: L1[], on: boolean, l1 = TOGGLE_CARD.l1, l2 = TOGGLE_CARD.l2): L1[] =>
  l1s.map(c => (c.name !== l1 ? c : { ...c, l2: on ? (c.l2.includes(l2) ? c.l2 : [...c.l2, l2]) : c.l2.filter(t => t !== l2) }))

export type PromptLine = { key: string; text: string; hier?: boolean }

/** The tree as the tool writes it into {{CLASSIFICATION_HIERARCHY}}. */
export function hierarchyLines(l1s: L1[]): PromptLine[] {
  const out: PromptLine[] = [{ key: 'cats', text: 'Document categories:', hier: true }]
  for (const c of l1s) out.push({ key: `c:${c.name}`, text: `- ${c.name}`, hier: true })
  if (l1s.some(c => c.l2.length)) {
    out.push({ key: 'types', text: 'Document types:', hier: true })
    for (const c of l1s) for (const d of c.l2) out.push({ key: `t:${c.name}>${d}`, text: `- ${c.name} > ${d}`, hier: true })
  }
  return out
}

export const headLines = (): PromptLine[] => PROMPT_HEAD.map((text, i) => ({ key: `h${i}`, text }))

export const TOKEN = '{{CLASSIFICATION_HIERARCHY}}'

export const initialVersions = (): Version[] => [
  { n: 6, status: 'Draft', active: false },
  { n: 5, status: 'Deployed', active: true },
  { n: 4, status: 'Draft', active: false },
  { n: 3, status: 'Draft', active: false },
  { n: 2, status: 'Draft', active: false },
  { n: 1, status: 'Approved', active: false },
]

// ── Tuesday's fixed geometry (mirrors .tStage in docsort.module.css) ──
// Every row has a fixed height so the connector from the new card to its prompt line is
// computed, never measured.
export const TG = {
  treeW: 200, gap: 24, sheetPad: 14,
  l0H: 32, cardGap: 8, l1H: 36, l2H: 28, addH: 40,
  sheetHead: 52, lineH: 22, blockGap: 8,
}

/** y of the middle of the tree row for l1 > l2 (Tuesday's stage). */
export function cardMidY(l1s: L1[], l1: string, l2: string) {
  let y = TG.l0H + TG.cardGap
  for (const c of l1s) {
    if (c.name === l1) {
      const i = c.l2.indexOf(l2)
      return y + TG.l1H + i * TG.l2H + TG.l2H / 2
    }
    y += TG.l1H + c.l2.length * TG.l2H + (c.name === TOGGLE_CARD.l1 ? TG.addH : 0) + TG.cardGap
  }
  return y
}

/** y of the middle of a filled prompt line (Tuesday's preview pane). */
export function lineMidY(l1s: L1[], key: string) {
  const head = PROMPT_HEAD.length
  const i = hierarchyLines(l1s).findIndex(l => l.key === key)
  // +1 line for the pane caption (Template / Preview).
  return TG.sheetHead + TG.sheetPad + (head + 1) * TG.lineH + TG.blockGap + i * TG.lineH + TG.lineH / 2
}
