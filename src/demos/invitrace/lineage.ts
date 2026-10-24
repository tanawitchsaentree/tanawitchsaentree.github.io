// Token lineage: the four tiers as a dependency graph, computed from the same definitions the
// console renders from (model.ts). Each node names the token it reads; values resolve by
// following those names. Pure; no DOM.
import { DENSITY_PAD, RAW, type Density, type Gov, type Hospital, type Preset } from './model'

export type Tier = 'raw' | 'theme' | 'semantic' | 'component'
export const TIER_ORDER: Tier[] = ['component', 'semantic', 'theme', 'raw']
export const TIER_LABEL: Record<Tier, string> = { raw: 'Raw', theme: 'Theme', semantic: 'Semantic', component: 'Component' }

export type TokenNode = {
  id: string
  tier: Tier
  /** The token this one reads. Null for raw values and for theme literals. */
  ref: string | null
  value: string
  /** Where a literal is set (theme file or preset). */
  source?: string
  /** A pulse from above stops here: locked axes and detached copies. */
  stop?: string
  /** True when the node holds a colour, so the X-ray shows a swatch. */
  colour?: boolean
}
export type Graph = { nodes: Record<string, TokenNode>; children: Record<string, string[]> }

const SIZE: Record<Density, number> = { compact: 36, regular: 44, comfortable: 48 }

export type GraphCtx = {
  /** Reasons a pulse stops, in my words (gated content). */
  touchWhy: string
  ringWhy: string
  forkWhy: string
  forks: { id: string; value: string }[]
  detached: { id: string; value: string; why: string }[]
}

export function tokenGraph(h: Hospital, preset: Preset | null, gov: Gov, ctx: GraphCtx): Graph {
  const dark = preset?.surface === 'dark'
  const high = preset?.contrast === 'high'
  const density: Density = preset?.density ?? gov.density ?? h.density
  const file = `themes/${h.id}.json`
  const list: (Omit<TokenNode, 'value'> & { value?: string })[] = []
  const add = (id: string, tier: Tier, ref: string | null, extra: Partial<TokenNode> = {}) => list.push({ id, tier, ref, ...extra })

  // Tier 1: raw values shared by every hospital.
  for (const [k, v] of Object.entries(RAW)) add(`raw.${k}`, 'raw', null, { value: v, colour: true })

  // Tier 2: theme. Literals come from the hospital file or a preset; surface-dependent values read raw.
  add('brand.primary', 'theme', null, { value: h.primary, source: file, colour: true })
  add('brand.radius', 'theme', null, { value: `${h.radius}px`, source: file })
  add('brand.density', 'theme', null, { value: density, source: preset ? `presets/${preset.id}.json` : file })
  add('brand.surface', 'theme', dark ? 'raw.night' : 'raw.paper')
  add('brand.card', 'theme', dark ? 'raw.nightCard' : 'raw.card')
  add('brand.text', 'theme', dark ? 'raw.nightText' : high ? 'raw.inkHigh' : 'raw.ink')
  add('brand.textMuted', 'theme', dark ? 'raw.nightMuted' : high ? 'raw.inkMutedHigh' : 'raw.inkMuted')
  add('brand.line', 'theme', dark ? 'raw.nightLine' : high ? 'raw.lineHigh' : 'raw.line')

  // Tier 3: semantic names. Status reads raw directly and skips the theme.
  add('color.primary', 'semantic', 'brand.primary')
  add('color.onPrimary', 'semantic', 'raw.white')
  add('color.surface', 'semantic', 'brand.surface')
  add('color.card', 'semantic', 'brand.card')
  add('color.text', 'semantic', 'brand.text')
  add('color.textMuted', 'semantic', 'brand.textMuted')
  add('color.line', 'semantic', 'brand.line')
  add('color.critical', 'semantic', 'raw.critical')
  add('color.warning', 'semantic', 'raw.warning')
  add('color.ok', 'semantic', 'raw.ok')
  add('radius.control', 'semantic', 'brand.radius')
  add('space.pad', 'semantic', 'brand.density', { value: `${DENSITY_PAD[density]}px` })
  add('size.control', 'semantic', 'brand.density', { value: `${SIZE[density]}px` })

  // Tier 4: component tokens alias semantic names only.
  const target = gov.touch36 && gov.desktopFlag ? 36 : 44
  add('console.surface', 'component', 'color.surface')
  add('header.stripe', 'component', 'color.primary')
  add('alert.background', 'component', 'color.critical')
  add('button.background', 'component', 'color.primary')
  add('button.text', 'component', 'color.onPrimary')
  add('button.radius', 'component', 'radius.control')
  add('button.minHeight', 'component', 'size.control', { value: `${target}px`, stop: ctx.touchWhy })
  add('field.label', 'component', 'color.textMuted')
  add('field.border', 'component', 'color.critical')
  add('table.text', 'component', 'color.text')
  add('table.rowPad', 'component', 'space.pad')
  add('table.line', 'component', 'color.line')
  add('focus.ring', 'component', 'color.text')
  add('focus.ringOffset', 'component', 'radius.control', { value: '-3px', stop: ctx.ringWhy })
  add('risk.high', 'component', 'color.critical')
  add('risk.medium', 'component', 'color.warning')
  add('risk.low', 'component', 'color.ok')
  add('card.background', 'component', 'color.card')
  add('card.radius', 'component', 'radius.control')
  add('doctorCard.action', 'component', 'color.primary')
  for (const f of ctx.forks) add(f.id, 'component', 'color.primary', { value: f.value, stop: ctx.forkWhy, colour: true })
  for (const d of ctx.detached) add(d.id, 'component', 'color.primary', { value: d.value, stop: d.why, colour: true })

  const nodes: Record<string, TokenNode> = {}
  for (const n of list) nodes[n.id] = { ...n, value: n.value ?? '' }
  const val = (id: string): string => { const n = nodes[id]; if (n.value) return n.value; const v = n.ref ? val(n.ref) : ''; n.value = v; return v }
  const isColour = (id: string): boolean => { const n = nodes[id]; return n.colour ?? (n.ref ? isColour(n.ref) : false) }
  const children: Record<string, string[]> = {}
  for (const n of Object.values(nodes)) {
    val(n.id); n.colour = isColour(n.id)
    if (n.ref) (children[n.ref] ??= []).push(n.id)
  }
  return { nodes, children }
}

/** The chain from a component token up to where it bottoms out, one node per tier. */
export function lineage(g: Graph, id: string) {
  const chain: TokenNode[] = []
  for (let n: TokenNode | undefined = g.nodes[id]; n; n = n.ref ? g.nodes[n.ref] : undefined) chain.push(n)
  const at = (t: Tier) => chain.find(n => n.tier === t) ?? null
  const skipsTheme = !at('theme') && !!at('raw')
  return { chain, at, skipsTheme, status: skipsTheme && /^raw\.(critical|warning|ok)$/.test(at('raw')!.id), literal: chain[chain.length - 1].tier === 'theme' }
}

export type Propagation = {
  roots: { id: string; from: string; to: string }[]
  /** Edges the pulse travels, parent → child, with depth for the stagger. */
  edges: { from: string; to: string; depth: number }[]
  reached: string[]
  stopped: { id: string; why: string }[]
}

/** Which theme values changed, and the dependents that actually change as a result. */
export function propagate(before: Graph, after: Graph): Propagation {
  const roots = Object.values(after.nodes)
    .filter(n => n.tier === 'theme' && before.nodes[n.id] && before.nodes[n.id].value !== n.value)
    .map(n => ({ id: n.id, from: before.nodes[n.id].value, to: n.value }))
  const edges: Propagation['edges'] = [], reached: string[] = [], stopped: Propagation['stopped'] = []
  const seen = new Set<string>()
  let frontier = roots.map(r => r.id), depth = 0
  while (frontier.length) {
    const next: string[] = []
    for (const p of frontier) for (const c of after.children[p] ?? []) {
      if (seen.has(c)) continue
      const n = after.nodes[c]
      if (n.stop) { seen.add(c); edges.push({ from: p, to: c, depth }); stopped.push({ id: c, why: n.stop }); continue }
      if (before.nodes[c]?.value === n.value) continue
      seen.add(c); edges.push({ from: p, to: c, depth }); reached.push(c); next.push(c)
    }
    frontier = next; depth++
  }
  return { roots, edges, reached, stopped }
}

/** Tier-by-tier lines for the change log. */
export function propagationLines(g: Graph, p: Propagation) {
  const lines: string[] = []
  for (const r of p.roots) {
    lines.push(`Theme ${r.id} ${r.from} → ${r.to}`)
    const sem = p.edges.filter(e => e.from === r.id && g.nodes[e.to].tier === 'semantic' && !g.nodes[e.to].stop).map(e => e.to)
    if (sem.length) lines.push(`Semantic ${sem.join(', ')}`)
    const comp = p.edges.filter(e => (e.from === r.id || sem.includes(e.from)) && g.nodes[e.to].tier === 'component' && !g.nodes[e.to].stop).map(e => e.to)
    if (comp.length) lines.push(`Component ${comp.join(', ')}`)
  }
  for (const s of p.stopped) lines.push(`Stopped at ${s.id}. ${s.why}`)
  return lines
}
