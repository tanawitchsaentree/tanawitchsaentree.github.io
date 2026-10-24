'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { ARCHETYPES, FIELD, GOVERNANCE, HOSPITALS, LINES, PRESETS, SAMPLE_COLOURS, SECTIONS, XRAY, type LineTpl, type RequestId } from './data'
import type { Fork } from './drift'
import { COLUMNS, driftSummary, forkName } from './drift'
import { TIER_LABEL, lineage, propagate, propagationLines, tokenGraph, type Propagation, type Tier } from './lineage'
import { GOV_DEFAULT, RAW, checkBrand, diffLines, resolve, slug, type ArchetypeId, type Gov, type Hospital, type Layout, type Preset, type PresetId } from './model'

/** One change-log entry. Every control on the page writes one. */
export type Entry = {
  n: number
  /** When it was written, for the tape's timestamp. */
  t?: number
  did: string                 // (a) what the visitor did
  tier: string                // (b) which tier changed …
  tokens: string[]            //     … and the token names
  followed: string[]          // (c) components that followed
  held: string[]              //     components that didn't, and why in a word
  why: string                 // (d) why the system behaves this way
  rule?: { href: string; label: string } //   the governance rule it links to
  figma?: string              // (e) the same change in the design file …
  code?: string[]             //     … and as a token diff
  blocked?: boolean
  /** Tier-by-tier path: a lineage pick, a theme change propagating, or the drift columns converging. */
  trace?: { label: string; lines: string[] }
  /** The part of the console the change touched; the console scrolls it into its window. */
  region?: 'header' | 'alert' | 'actions' | 'field' | 'table' | 'doctor'
}

/** One line of the clinic's theme file. Struck lines are requests the clinic didn't get. */
export type FileLine = { sign: ' ' | '+' | '−'; key: string; value: string; note?: string; struck: boolean }
export type Answer = { outcome: 'yes' | 'no'; lines: FileLine[]; meta?: Record<string, string> }
const fill = (t: LineTpl, vars: Record<string, string> = {}, struck = false): FileLine => {
  const f = (x = '') => x.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
  return { sign: t.sign, key: t.key, value: f(t.value), note: t.note ? f(t.note) : undefined, struck }
}

export type Instance = { id: number; kind: 'bound' | 'detach' | 'copy' | 'invent' | 'prop'; color: string }
export type Edge = 'none' | 'long' | 'empty'


export function useInvitrace() {
  const [hospitals, setHospitals] = useState<Hospital[]>(() => HOSPITALS.map(h => ({ ...h })))
  // The story's subject is the Specialty clinic; other hospitals appear as read-only slices.
  const [active] = useState<string>(() => (HOSPITALS.find(h => h.id === 'specialty') ?? HOSPITALS[0]).id)
  const [preset, setPreset] = useState<PresetId | null>(null)
  const [govs, setGovs] = useState<Record<string, Gov>>({})
  const [edge, setEdge] = useState<Edge>('none')
  const [drift, setDrift] = useState<'idle' | 'drifted' | 'one'>('idle')
  const [master, setMaster] = useState(() => SAMPLE_COLOURS.masters[0])
  const [instances, setInstances] = useState<Instance[]>(() => [{ id: 1, kind: 'bound', color: SAMPLE_COLOURS.masters[0] }])
  const [shortcut, setShortcut] = useState(false)
  const [log, setLog] = useState<Entry[]>([])
  const [recordsOpen, setRecordsOpen] = useState(false)
  const [recordPrim, setRecordPrim] = useState<'button' | 'field' | 'table'>('field')
  const [pick, setPick] = useState('button.background')
  // The Patient ID field starts neutral; the error state appears only when a demo triggers it.
  const [fieldError, setFieldError] = useState(false)
  // What the reader has tried, keyed by request. Feeds the hero answer column and the theme file.
  const [tried, setTried] = useState<Partial<Record<RequestId, Answer>>>({})
  const record = (id: RequestId, a: Answer, merge = false) => setTried(t => ({ ...t, [id]: merge && t[id] ? { outcome: a.outcome, lines: [...t[id]!.lines.filter(l => !a.lines.some(n => n.key === l.key)), ...a.lines] } : a }))
  const sentRef = useRef<string | null>(null)
  const [pulse, setPulse] = useState<(Propagation & { n: number }) | null>(null)
  const n = useRef(0)
  const nextId = useRef(2)

  const hospital = hospitals.find(h => h.id === active) ?? hospitals[0]
  const gov = govs[active] ?? GOV_DEFAULT
  const presetObj = preset ? PRESETS.find(p => p.id === preset) ?? null : null
  const resolved = useMemo(() => resolve(hospital, presetObj, gov), [hospital, presetObj, gov])

  const write = useCallback((e: Omit<Entry, 'n'>) => {
    const entry = { ...e, n: ++n.current, t: Date.now() }
    setLog(l => [entry, ...l])
    return entry.n
  }, [])

  // ── Token graph: the same definitions the console renders from ──
  const graphFor = (h: Hospital, p: Preset | null, g: Gov) => tokenGraph(h, p, g, {
    touchWhy: GOVERNANCE.find(r => r.id === 'touch')![h.archetype].short,
    ringWhy: XRAY.reasons.ring, forkWhy: XRAY.reasons.fork,
    forks: drift === 'one' ? [] : [{ id: 'fork.admitButtons', value: SAMPLE_COLOURS.drift[0].bg }],
    detached: instances.filter(i => i.kind === 'detach' || i.kind === 'copy' || i.kind === 'invent')
      .map(i => ({ id: `instance.${i.kind}${i.id}`, value: i.color, why: SECTIONS.rot.kinds[i.kind as "detach"].short })),
  })
  const graph = useMemo(() => graphFor(hospital, presetObj, gov), [hospital, presetObj, gov, drift, instances]) // eslint-disable-line react-hooks/exhaustive-deps
  /** A theme change: work out what it reaches, write the entry with the path, start the pulse. */
  const writeTheme = (e: Omit<Entry, 'n'>, h: Hospital, p: Preset | null, g: Gov) => {
    const after = graphFor(h, p, g)
    const prop = propagate(graph, after)
    const lines = propagationLines(after, prop)
    const nn = write(lines.length ? { ...e, trace: { label: 'Propagation', lines } } : e)
    if (prop.edges.length) setPulse({ ...prop, n: nn })
  }

  const archLabel = (a: ArchetypeId) => ARCHETYPES[a].label
  // A control that changes nothing still says so, so every interaction leaves an entry.
  const same = (did: string) => write({ did, tier: 'No change', tokens: [], followed: [], held: [], why: 'Already set.' })

  // ── The problem: drift → one component ──
  const showDrift = () => {
    setDrift('drifted')
    write({ did: 'Showed forked Admit buttons', tier: 'No shared tier', tokens: ['padding, radius and fill hard-coded per fork'],
      followed: [], held: ['Each fork keeps its own values'], why: 'Hard-coded per fork. Each fix is made once per fork.' })
  }
  const consolidate = (forks: Fork[] = SAMPLE_COLOURS.drift, ref?: string) => {
    setDrift('one')
    const canon = { pad: '0 16px', r: hospital.radius, bg: ref ?? hospital.primary, weight: 600, label: 'Admit patient', h: parseInt(resolved.component['button.minHeight']) }
    const sum = driftSummary(forks, canon)
    record('copy', { outcome: 'no', lines: [fill(LINES.copy)] })
    const lines = [...sum.converged.map(c => `${c.col.label} converged. ${c.forks} of ${forks.length} forks changed.`),
      `${forkName(sum.most.i)} changed most, ${sum.most.n} of ${COLUMNS.length} properties.`]
    write({ trace: { label: 'Converged', lines }, did: 'Consolidated forks into one Button', tier: 'Component', tokens: ['button.background → color.primary', 'button.radius → brand.radius'],
      followed: ['Admit button in every hospital theme'], held: [], why: 'One component, themed per hospital.',
      code: ['components/button.json', '+ "button.background": "{color.primary}"', '+ "button.radius": "{brand.radius}"'] })
  }

  // ── Hospital theme (Tier 2) ──
  const pickHospital = (id: string) => {
    const h = hospitals.find(x => x.id === id); if (!h) return
    if (id === active) { same(`${h.name} is already on the console`); return }
    writeTheme({ did: `Hospital: ${h.name}`, tier: 'Theme', tokens: ['brand.primary', 'brand.radius', 'brand.density', 'brand.layout'],
      followed: ['Admit button', 'Patient table', 'Doctor card layout', 'Field'], region: 'header', held: ['Critical alert, which reads raw.critical'],
      why: `Theme tier only. ${archLabel(h.archetype)} rules apply.`,
      rule: { href: '#ix-governance', label: `${archLabel(h.archetype)} rules` } }, h, presetObj, govs[id] ?? GOV_DEFAULT)
  }
  const setPrimary = (hex: string) => {
    const c = checkBrand(hex)
    if (!c.ok) {
      sentRef.current = hex.toUpperCase()
      write({ did: `Brand colour ${hex} refused`, region: 'actions', tier: 'Theme (blocked)', tokens: ['brand.primary'], blocked: true,
        followed: [], held: ['Admit button keeps its current colour'],
        why: `Blocked: contrast ${c.ratio.toFixed(2)}:1, needs 4.5:1. Nearest pass ${c.nearest}.`,
        rule: { href: '#ix-tiers', label: 'Brand contrast check' } })
      return c
    }
    const from = hospital.primary
    const sent = sentRef.current ?? hex.toUpperCase(); sentRef.current = null
    record('colour', { outcome: 'yes', lines: [fill(LINES.colour, { applied: hex.toUpperCase(), sent, r: c.ratio.toFixed(2) })], meta: { applied: hex.toUpperCase(), sent } })
    if (from.toUpperCase() === hex.toUpperCase()) { same(`${hex.toUpperCase()} is already the brand colour`); return c }
    setHospitals(hs => hs.map(h => h.id === active ? { ...h, primary: hex.toUpperCase() } : h))
    const d = diffLines(hospital.id, 'brand.primary', from, hex.toUpperCase())
    writeTheme({ did: `Brand colour set to ${hex.toUpperCase()}`, region: 'actions', tier: 'Theme', tokens: ['brand.primary', 'color.primary', 'button.background'],
      followed: ['Admit button', 'Doctor card action', 'Selected row marker'], held: ['Critical alert (status skips the theme tier)', 'Text colour (follows the surface)'],
      why: `Contrast ${c.ratio.toFixed(2)}:1 with white text. The alert keeps its raw colour.`,
      rule: { href: '#ix-tiers', label: 'Status skips the theme tier' }, figma: d.figma, code: d.code }, { ...hospital, primary: hex.toUpperCase() }, presetObj, gov)
    return c
  }
  const stepRadius = (delta: number) => {
    const to = Math.max(0, Math.min(24, hospital.radius + delta))
    if (to === hospital.radius) { write({ did: `Radius limit ${to}px`, tier: 'Theme (limit)', tokens: ['brand.radius'], blocked: true, followed: [], held: ['Radius stays at its limit'], why: 'brand.radius range: 0 to 24px.' }); return }
    setHospitals(hs => hs.map(h => h.id === active ? { ...h, radius: to } : h))
    const d = diffLines(hospital.id, 'brand.radius', `${hospital.radius}px`, `${to}px`)
    writeTheme({ did: `Corner radius set to ${to}px`, region: 'actions', tier: 'Theme', tokens: ['brand.radius', 'button.radius', 'card.radius'],
      followed: ['Admit button', 'Field', 'Doctor card', 'Alert'], held: ['Focus ring offset (locked)'],
      why: 'brand.radius is a flexible theme value.', figma: d.figma, code: d.code }, { ...hospital, radius: to }, presetObj, gov)
  }
  const tryAlertColour = () => {
    record('alert', { outcome: 'no', lines: [fill(LINES.alert, {}, true)] })
    write({ did: 'Critical alert recolour refused', region: 'alert', tier: 'Raw (locked)', tokens: ['color.critical → raw.critical'], blocked: true,
      followed: [], held: ['Critical alert, same in every hospital'],
      why: 'Status colours read raw values and skip the theme tier.',
      rule: { href: '#ix-tiers', label: 'Status skips the theme tier' } })
  }

  // ── Governance ──
  /** Try a governance setting, on the clinic or (hid) on another hospital's slice. */
  const tryGov = (id: string, hid?: string) => {
    const rule = GOVERNANCE.find(r => r.id === id); if (!rule) return
    const H = (hid && hospitals.find(x => x.id === hid)) || hospital
    const G = govs[H.id] ?? GOV_DEFAULT
    const RES = H.id === active ? resolved : resolve(H, presetObj, G)
    const clinic = H.id === active
    if (clinic && (id === 'sort' || id === 'density') && rule[H.archetype].state === 'locked') record('sort', { outcome: 'no', lines: [fill(id === 'sort' ? LINES.sort : LINES.density, {}, true)] }, true)
    if (clinic && id === 'touch' && rule[H.archetype].state !== 'flexible') record('small', { outcome: 'no', lines: [fill(LINES.small, {}, true)] })
    const r = rule[H.archetype]
    const key = ({ labels: 'labelsFloat', touch: 'touch36', icons: 'iconOnly', bedcol: 'hideBed' } as const)[id as 'labels']
    const region = ({ labels: 'field', errors: 'field', touch: 'actions', icons: 'actions', density: 'table', risk: 'table', bedcol: 'table', sort: 'table' } as const)[id as 'labels']
    const link = { href: `#ix-rec-${r.record}`, label: `${archLabel(H.archetype)} ${rule.primitive.toLowerCase()} record` }
    const on = key ? !G[key] : true
    if (id === 'density' && r.state !== 'locked') {
      const current = RES.theme['brand.density']
      const next = current === 'compact' ? 'regular' : 'compact'
      setGovs(g => ({ ...g, [H.id]: { ...G, density: next } }))
      if (presetObj) {
        write({ did: `Density set to ${next}`, tier: 'Theme (held by preset)', tokens: ['brand.density'], region,
          followed: [], held: [`Patient table spacing (${presetObj.label} preset sets density)`],
          why: 'The ward preset overrides theme density until it is removed.', rule: link,
          code: [`themes/${H.id}.json`, `+ "brand.density": "${next}"`, `presets/${presetObj.id}.json wins`] })
        return
      }
      writeTheme({ did: `Density set to ${next}`, tier: 'Theme', tokens: ['brand.density', 'space.pad'], region,
        followed: ['Patient table spacing', 'Field padding'], held: ['Touch targets (locked size)'], why: r.short, rule: link,
        code: [`themes/${H.id}.json`, `- "brand.density": "${current}"`, `+ "brand.density": "${next}"`] }, H, presetObj, { ...G, density: next })
      return
    }
    if (r.state === 'locked' || !key || (r.state === 'flag' && !G.desktopFlag)) {
      const needFlag = r.state === 'flag' && !G.desktopFlag
      if (id === 'errors') {
        setFieldError(true)
        write({ did: 'Patient ID error shown', tier: 'Component (locked)', tokens: ['field.error', 'field.border'], blocked: true, region: 'field',
          followed: ['Patient ID field: error rule and message'], held: ['Error message stays until the field is fixed'], why: r.short, rule: link })
        return
      }
      write({ did: `${rule.label}: refused`, tier: 'Component (locked)', tokens: [componentToken(id)], blocked: true,
        followed: [], held: [`${rule.primitive}, ${archLabel(H.archetype)} contract`],
        why: needFlag ? `${r.short} Set the desktop-locked flag first.` : r.short, rule: link, region })
      return
    }
    setGovs(g => ({ ...g, [H.id]: { ...G, [key]: on } }))
    write({ did: `${rule.label}: ${on ? 'on' : 'off'}`, tier: 'Component', tokens: [componentToken(id)],
      followed: [followerOf(id)], held: id === 'bedcol' ? ['Risk column (never hidden)'] : [],
      why: r.short, rule: link, region, code: [`themes/${H.id}.json`, `${on ? '+' : '-'} "${componentToken(id)}": "${valueOf(id)}"`] })
  }
  const toggleFlag = (hid?: string) => {
    const H = (hid && hospitals.find(x => x.id === hid)) || hospital
    const G = govs[H.id] ?? GOV_DEFAULT
    if (H.archetype !== 'large') {
      write({ did: 'Desktop-locked flag refused', tier: 'Environment (locked)', tokens: ['env.desktopLocked'], blocked: true,
        followed: [], held: ['Touch targets stay at 44px'], why: `Locked: ${archLabel(H.archetype)} screens are touch devices. 44px stays.`, region: 'actions',
        rule: { href: '#ix-governance', label: 'Touch target rule' } })
      return
    }
    const on = !G.desktopFlag
    setGovs(g => ({ ...g, [H.id]: { ...G, desktopFlag: on, touch36: on ? G.touch36 : false } }))
    write({ did: `Desktop-locked flag ${on ? 'on' : 'off'}`, tier: 'Environment', tokens: ['env.desktopLocked'],
      followed: on ? ['36px targets become possible'] : ['Touch targets back to 44px'], held: [],
      why: on ? '36px targets now allowed on this screen.' : 'Touch targets back to 44px.', rule: { href: '#ix-rec-field-large', label: 'Teaching field record' } })
  }

  // ── Detach, copy, invent ──
  const addInstance = (kind: 'detach' | 'copy' | 'invent' | 'prop') => {
    const id = nextId.current++
    const color = kind === 'invent' ? SAMPLE_COLOURS.invent : master
    setInstances(is => [...is, { id, kind, color }])
    const k = SECTIONS.rot.kinds[kind]
    write({ did: `Added ${k.name.toLowerCase()}`, tier: kind === 'prop' ? 'Component' : 'None (outside the system)', tokens: kind === 'prop' ? ['button.contrastMode = high', 'button.background → color.primary'] : ['Values copied by hand'],
      followed: kind === 'prop' ? ['Stays bound to the master'] : [], held: kind === 'prop' ? [] : [`${k.name} is no longer bound to the master`],
      why: k.short, rule: { href: '#ix-rot', label: 'Detaching and copying' } })
  }
  const changeMaster = () => {
    const M = SAMPLE_COLOURS.masters
    const to = M[(M.indexOf(master) + 1) % M.length]
    const from = master
    setMaster(to)
    setInstances(is => is.map(i => (i.kind === 'bound' || i.kind === 'prop' ? { ...i, color: to } : i)))
    const names = (k: Instance['kind']) => instances.filter(i => i.kind === k).length
    const held = (['detach', 'copy', 'invent'] as const).filter(k => names(k)).map(k => `${SECTIONS.rot.kinds[k].name}, frozen at its old value`)
    write({ did: `Master colour set to ${to}`, tier: 'Raw and semantic (library master)', tokens: ['color/primary'],
      followed: ['Bound instance', ...(names('prop') ? ['Instance with contrast prop'] : [])], held,
      why: held.length ? 'Bound instances follow. Detached ones keep their old value.' : 'All instances are bound and follow.',
      rule: { href: '#ix-rot', label: 'Detaching and copying' }, figma: `Library › color/primary  ${from} → ${to}`, code: ['tokens/master.json', `- "color.primary": "${from}"`, `+ "color.primary": "${to}"`] })
  }
  const resetInstances = () => {
    setInstances([{ id: 1, kind: 'bound', color: master }]); nextId.current = 2
    write({ did: 'Reset to one bound instance', tier: 'Component', tokens: ['button.background → color.primary'], followed: ['Bound instance'], held: [], why: 'The instance reads the master.' })
  }

  // ── Slots ──
  const setLayout = (layout: Layout, hid?: string) => {
    const H = (hid && hospitals.find(x => x.id === hid)) || hospital
    const clinic = H.id === active
    // The clinic's screen keeps HeroDoctorCard: choosing it records the answer instead of a no-op.
    if (clinic && H.layout === 'hero' && layout === 'hero') {
      record('doctor', { outcome: 'yes', lines: [fill(LINES.doctorYes)] })
      write({ did: 'HeroDoctorCard kept', region: 'doctor', tier: 'Component (separate)', tokens: ['heroDoctorCard'], followed: ['HeroDoctorCard'], held: [], why: 'One doctor per screen on specialty screens.' })
      return
    }
    if (clinic && H.layout === 'hero') record('doctor', { outcome: 'no', lines: [fill(LINES.doctorNo, { choice: layout }, true)] })
    if (layout === H.layout) { same(`${layout} layout is already set`); return }
    if (H.layout === 'hero' || layout === 'hero') {
      const toHero = layout === 'hero'
      write({ did: `${toHero ? 'HeroDoctorCard' : layout + ' layout'} refused`, tier: 'Component (separate)', tokens: ['heroDoctorCard', 'doctorCard.layout'], blocked: true, region: 'doctor',
        followed: [], held: [toHero ? 'DoctorCard with slots stays' : 'HeroDoctorCard stays'],
        why: toHero ? 'HeroDoctorCard is a separate component, not a layout value.' : 'Specialty uses HeroDoctorCard. Slot layouts don’t apply.',
        rule: { href: '#ix-slots', label: 'DoctorCard slots' } })
      return
    }
    const from = H.layout
    setHospitals(hs => hs.map(h => h.id === H.id ? { ...h, layout } : h))
    const d = diffLines(H.id, 'brand.layout', from, layout)
    write({ did: `DoctorCard layout set to ${layout}`, region: 'doctor', tier: 'Theme', tokens: ['brand.layout', 'doctorCard.layout'],
      followed: ['DoctorCard slots rearrange'], held: ['Data contract unchanged'], why: 'brand.layout is a theme token. Slots rearrange.', figma: d.figma, code: d.code })
  }
  const tryFork = () => {
    write({ did: 'Fork DoctorCard-HospitalB refused', region: 'doctor', tier: 'None (fork declined)', tokens: ['doctorCard.*'], blocked: true,
      followed: [], held: ['Single DoctorCard stays'], why: 'A fork copies the data contract. Use a slot layout.', rule: { href: '#ix-slots', label: 'DoctorCard slots' } })
  }

  // ── Presets and edge cases ──
  const pickPreset = (id: PresetId | null) => {
    if (id === preset) { same(id ? 'Preset already on' : 'No preset was on'); return }
    const p = id ? PRESETS.find(x => x.id === id)! : null
    setPreset(id)
    if (!p) {
      writeTheme({ did: 'Ward preset removed', tier: 'Theme', tokens: ['brand.density', 'brand.surface', 'brand.text'], followed: ['Console on the hospital theme'], held: [], why: 'Hospital theme restored.' }, hospital, null, gov)
      return
    }
    const changes = [`brand.density = ${p.density}`, `brand.textScale = ${p.textScale}`, `brand.surface = ${p.surface}`, ...(p.contrast === 'high' ? ['brand.text = high contrast ink'] : []), ...(p.surface === 'dark' ? ['brand.text = light, through the theme tier'] : [])]
    writeTheme({ did: `Preset: ${p.label}`, region: 'table', tier: 'Theme (preset)', tokens: changes,
      followed: ['Patient table spacing', 'All text', ...(p.surface === 'dark' ? ['Surfaces and cards'] : [])],
      held: ['Critical alert colour', 'Brand colour', 'Locked contracts (44px target)'],
      why: p.who, rule: { href: '#ix-edges', label: 'Ward presets' },
      code: [`presets/${p.id}.json`, ...changes.map(c => `+ ${c}`)] }, hospital, p, gov)
  }
  const pickEdge = (e: Edge) => {
    if (e === edge) { same('That content is already showing'); return }
    setEdge(e)
    write({ did: e === 'none' ? 'Patient list: usual content' : e === 'long' ? 'Patient list: long name' : 'Patient list: empty',
      tier: 'Content rule', tokens: e === 'long' ? ['table.name.overflow = wrap', 'doctorCard.meta.overflow = truncate'] : e === 'empty' ? ['table.emptyState'] : [], region: 'table',
      followed: e === 'none' ? [] : ['Patient table'], held: [], why: e === 'long' ? 'Names wrap, never truncate.' : e === 'empty' ? 'Empty state names what is empty.' : 'Sample data restored.', rule: { href: '#ix-edges', label: 'Ward presets' } })
  }

  // ── What didn't work ──
  const toggleShortcut = () => {
    const on = !shortcut; setShortcut(on)
    write({ did: on ? 'Shortcut layer added to patient list' : 'Shortcut layer removed', tier: on ? 'Outside the component contract' : 'Component', tokens: ['table.keyboard', 'focus.ring'], region: 'table',
      followed: on ? [] : ['Focus ring and Tab order (contract)'], held: on ? ['Focus ring on patient rows'] : [],
      why: on ? 'The layer handles Tab first. Focus ring lost.' : 'Keyboard behaviour back on the shared contract.', rule: { href: '#ix-failed', label: 'Keyboard shortcut layers' } })
  }

  // ── Views, decisions, onboarding ──
  const note = (did: string, why: string, extra: Partial<Omit<Entry, 'n' | 'did' | 'why'>> & { tier: string }) =>
    write({ did, why, tokens: [], followed: [], held: [], ...extra })

  // Keyboard focus into the console's patient list (the What didn't work demo).
  const focusList = (root?: HTMLElement | null) => {
    write({ did: 'Focus moved to patient list', tier: shortcut ? 'Outside the component contract' : 'Component (keyboard)', tokens: ['table.keyboard', 'focus.ring'], region: 'table',
      followed: shortcut ? [] : ['Row focus ring'], held: shortcut ? ['Row focus ring (taken by the shortcut layer)'] : [],
      why: shortcut ? 'The layer handles Tab first. The focused row has no ring.' : 'Rows are in the Tab order with the shared focus ring. Tab moves between them.',
      rule: { href: '#ix-failed', label: 'Keyboard shortcut layers' } })
    requestAnimationFrame(() => (root ?? document).querySelector<HTMLElement>('[data-ix-row]')?.focus())
  }
  // Log links to a variant record open the records and switch to that component.
  const openRecord = (record: string) => {
    const prim = record.split('-')[0] as 'button' | 'field' | 'table'
    setRecordPrim(prim); setRecordsOpen(true)
    requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(`ix-rec-${prim}-${hospital.archetype}`)?.scrollIntoView({ block: 'start' })))
  }

  const addHospital = (h: Omit<Hospital, 'id'>) => {
    const id = `${slug(h.name)}-${nextId.current++}`
    const hosp: Hospital = { ...h, id, custom: true }
    setHospitals(hs => [...hs, hosp])
    writeTheme({ did: `Added ${h.name}`, region: 'header', tier: 'Theme (new file)', tokens: ['brand.primary', 'brand.radius', 'brand.density', 'brand.layout'],
      followed: ['Every shared component, with the new theme'], held: [`${archLabel(h.archetype)} locked settings (inherited)`],
      why: `Inherits ${archLabel(h.archetype)} locked settings.`,
      rule: { href: '#ix-governance', label: `${archLabel(h.archetype)} rules` },
      code: [`themes/${id}.json`, `+ "brand.primary": "${h.primary}"`, `+ "brand.radius": "${h.radius}px"`, `+ "brand.density": "${h.density}"`, `+ "brand.layout": "${h.layout}"`, `+ "archetype": "${h.archetype}"`] }, hosp, presetObj, GOV_DEFAULT)
  }

  // ── Lineage X-ray ──
  const REGION: Record<string, Entry['region']> = { button: 'actions', alert: 'alert', risk: 'table', table: 'table', focus: 'table', field: 'field', card: 'doctor', doctorCard: 'doctor', header: 'header', console: 'header' }
  const lineageLines = (id: string) => {
    const l = lineage(graph, id)
    const lines = (['component', 'semantic', 'theme', 'raw'] as Tier[]).map(t => {
      const node = l.at(t)
      if (node) return `${TIER_LABEL[t]} ${node.id} ${node.value}${node.source ? `, set in ${node.source}` : ''}`
      return t === 'theme' && l.skipsTheme ? `${TIER_LABEL[t]} skipped` : `${TIER_LABEL[t]} none`
    })
    const node = graph.nodes[id]
    const why = node.stop ?? (l.status ? XRAY.notes.status : l.skipsTheme ? XRAY.notes.shared : l.chain.some(c => c.id === 'brand.text' || c.id === 'brand.textMuted') ? XRAY.notes.text : l.literal ? XRAY.notes.literal : XRAY.notes.plain)
    return { l, lines, why }
  }
  const pickLineage = (id: string) => {
    setPick(id)
    const el = XRAY.elements.find(e => e.id === id)
    const { l, lines, why } = lineageLines(id)
    write({ did: `Traced ${el ? el.label.toLowerCase() : id}`, tier: 'Lineage', tokens: l.chain.map(c => c.id), followed: [], held: [], why,
      region: REGION[id.split('.')[0]], trace: { label: 'Path', lines }, rule: { href: '#ix-tiers', label: 'Token tiers' } })
  }
  const explode = (on: boolean) => {
    write({ did: on ? 'Tiers separated' : 'Tiers stacked', tier: 'Lineage', tokens: [], followed: [], held: [],
      why: on ? XRAY.intro : 'Back to the console view.' })
  }
  const stepTier = (t: Tier) => {
    const { l } = lineageLines(pick)
    const node = l.at(t)
    write({ did: `Tier: ${TIER_LABEL[t]}`, tier: 'Lineage', tokens: node ? [node.id] : [], followed: [], held: [],
      why: node ? `${node.id} = ${node.value}` : t === 'theme' && l.skipsTheme ? (l.status ? XRAY.notes.status : XRAY.notes.shared) : 'No token on this tier for this part.' })
  }

  // ── Contrast field ──
  /** A drop outside the pass region: the theme tier refuses it, then the nearest passing point applies. */
  const snapPrimary = (tried: string, ratio: number, snapped: string) => {
    write({ did: `Brand colour ${tried} refused`, region: 'actions', tier: 'Theme (refused)', tokens: ['brand.primary'], blocked: true,
      followed: [`Snapped to ${snapped}, same hue, 4.5:1`], held: [`${tried}, contrast ${ratio.toFixed(2)}:1`],
      why: FIELD.refused, rule: { href: '#ix-tiers', label: 'Brand contrast check' } })
    setPrimary(snapped)
  }

  const clearLog = () => { setLog([]); n.current = 0 }

  return {
    hospitals, hospital, active, preset, presetObj, gov, edge, drift, master, instances, shortcut, log, resolved, recordsOpen, recordPrim, graph, pick, pulse, fieldError, tried, govs,
    actions: { showDrift, consolidate, pickHospital, setPrimary, stepRadius, tryAlertColour, tryGov, toggleFlag, addInstance, changeMaster, resetInstances,
      setLayout, tryFork, pickPreset, pickEdge, toggleShortcut, note, addHospital, clearLog, focusList, openRecord, setRecordsOpen, setRecordPrim,
      pickLineage, explode, stepTier, snapPrimary, lineageLines },
  }
}

function componentToken(id: string) {
  return ({ labels: 'field.label', errors: 'field.error', touch: 'button.minHeight', icons: 'button.label', density: 'brand.density', risk: 'table.riskColumn', bedcol: 'table.bedColumn', sort: 'table.sort' } as Record<string, string>)[id] ?? id
}
function valueOf(id: string) {
  return ({ labels: 'floating', touch: '36px', icons: 'icon-only', density: 'compact', bedcol: 'hidden-for-role' } as Record<string, string>)[id] ?? 'on'
}
function followerOf(id: string) {
  return ({ labels: 'Patient name field', touch: 'Admit button height', icons: 'Admit button label', density: 'Patient table spacing', bedcol: 'Bed column for this role' } as Record<string, string>)[id] ?? 'Console'
}

export type Store = ReturnType<typeof useInvitrace>
export { RAW }
