'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { ARCHETYPES, GOVERNANCE, HOSPITALS, PRESETS, SAMPLE_COLOURS, SECTIONS } from './data'
import { GOV_DEFAULT, RAW, checkBrand, diffLines, resolve, slug, type ArchetypeId, type Gov, type Hospital, type Layout, type PresetId } from './model'

/** One change-log entry. Every control on the page writes one. */
export type Entry = {
  n: number
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
  /** The part of the console the change touched; the console scrolls it into its window. */
  region?: 'header' | 'alert' | 'actions' | 'field' | 'table' | 'doctor'
}

export type Instance = { id: number; kind: 'bound' | 'detach' | 'copy' | 'invent' | 'prop'; color: string }
export type Edge = 'none' | 'long' | 'empty'


export function useInvitrace() {
  const [hospitals, setHospitals] = useState<Hospital[]>(() => HOSPITALS.map(h => ({ ...h })))
  const [active, setActive] = useState<string>(() => HOSPITALS[0].id)
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
  const n = useRef(0)
  const nextId = useRef(2)

  const hospital = hospitals.find(h => h.id === active) ?? hospitals[0]
  const gov = govs[active] ?? GOV_DEFAULT
  const presetObj = preset ? PRESETS.find(p => p.id === preset) ?? null : null
  const resolved = useMemo(() => resolve(hospital, presetObj, gov), [hospital, presetObj, gov])

  const write = useCallback((e: Omit<Entry, 'n'>) => {
    const entry = { ...e, n: ++n.current }
    setLog(l => [entry, ...l])
  }, [])

  const archLabel = (a: ArchetypeId) => ARCHETYPES[a].label
  // A control that changes nothing still says so, so every interaction leaves an entry.
  const same = (did: string) => write({ did, tier: 'No change', tokens: [], followed: [], held: [], why: 'The value you picked is the one already in place.' })

  // ── The problem: drift → one component ──
  const showDrift = () => {
    setDrift('drifted')
    write({ did: 'You showed the forked Admit buttons.', tier: 'No shared tier', tokens: ['padding, radius and fill hard-coded per fork'],
      followed: [], held: ['Every fork keeps its own values'], why: 'One fix has to be made once per fork.' })
  }
  const consolidate = () => {
    setDrift('one')
    write({ did: 'You brought the forks back to one Admit button.', tier: 'Component', tokens: ['button.background → color.primary', 'button.radius → brand.radius'],
      followed: ['Admit button in every hospital theme'], held: [], why: 'One component, themed per hospital.',
      code: ['components/button.json', '+ "button.background": "{color.primary}"', '+ "button.radius": "{brand.radius}"'] })
  }

  // ── Hospital theme (Tier 2) ──
  const pickHospital = (id: string) => {
    const h = hospitals.find(x => x.id === id); if (!h) return
    if (id === active) { same(`You picked ${h.name}, which is already on the console.`); return }
    setActive(id)
    write({ did: `You switched the console to ${h.name}.`, tier: 'Theme', tokens: ['brand.primary', 'brand.radius', 'brand.density', 'brand.layout'],
      followed: ['Admit button', 'Patient table', 'Doctor card layout', 'Field'], region: 'header', held: ['Critical alert, which reads raw.critical'],
      why: `Only the theme tier differs. ${h.name} follows the ${archLabel(h.archetype)} rules.`,
      rule: { href: '#ix-governance', label: `${archLabel(h.archetype)} rules` } })
  }
  const setPrimary = (hex: string) => {
    const c = checkBrand(hex)
    if (!c.ok) {
      write({ did: `You tried ${hex} as the ${hospital.name} brand colour.`, region: 'actions', tier: 'Theme (blocked)', tokens: ['brand.primary'], blocked: true,
        followed: [], held: ['Admit button keeps its current colour'],
        why: `${c.ratio.toFixed(2)}:1 against white text. Buttons need 4.5:1, and ${c.nearest} is the nearest that passes.`,
        rule: { href: '#ix-tiers', label: 'Brand contrast check' } })
      return c
    }
    const from = hospital.primary
    if (from.toUpperCase() === hex.toUpperCase()) { same(`You picked ${hex.toUpperCase()}, the colour ${hospital.name} already uses.`); return c }
    setHospitals(hs => hs.map(h => h.id === active ? { ...h, primary: hex.toUpperCase() } : h))
    const d = diffLines(hospital.id, 'brand.primary', from, hex.toUpperCase())
    write({ did: `You set the ${hospital.name} brand colour to ${hex.toUpperCase()}.`, region: 'actions', tier: 'Theme', tokens: ['brand.primary', 'color.primary', 'button.background'],
      followed: ['Admit button', 'Doctor card action', 'Selected row marker'], held: ['Critical alert, because status colours skip the theme tier', 'Text colour, which depends on the surface'],
      why: `Passes at ${c.ratio.toFixed(2)}:1. Status colours skip the theme tier, so the alert stays the same.`,
      rule: { href: '#ix-tiers', label: 'Status skips the theme tier' }, figma: d.figma, code: d.code })
    return c
  }
  const stepRadius = (delta: number) => {
    const to = Math.max(0, Math.min(24, hospital.radius + delta))
    if (to === hospital.radius) { write({ did: `You tried to take the radius past ${to}px.`, tier: 'Theme (limit)', tokens: ['brand.radius'], blocked: true, followed: [], held: ['Radius stays at its limit'], why: 'Theme radius runs from 0 to 24px, so every component keeps a readable shape.' }); return }
    setHospitals(hs => hs.map(h => h.id === active ? { ...h, radius: to } : h))
    const d = diffLines(hospital.id, 'brand.radius', `${hospital.radius}px`, `${to}px`)
    write({ did: `You changed the ${hospital.name} corner radius to ${to}px.`, region: 'actions', tier: 'Theme', tokens: ['brand.radius', 'button.radius', 'card.radius'],
      followed: ['Admit button', 'Field', 'Doctor card', 'Alert'], held: ['Focus ring offset, which is locked'],
      why: 'Radius is a flexible theme value.', figma: d.figma, code: d.code })
  }
  const tryAlertColour = () => {
    write({ did: `You tried to recolour the critical alert for ${hospital.name}.`, region: 'alert', tier: 'Raw (locked)', tokens: ['color.critical → raw.critical'], blocked: true,
      followed: [], held: ['Critical alert stays the same in every hospital'],
      why: 'Status colours read raw values and skip the theme tier.',
      rule: { href: '#ix-tiers', label: 'Status skips the theme tier' } })
  }

  // ── Governance ──
  const tryGov = (id: string) => {
    const rule = GOVERNANCE.find(r => r.id === id); if (!rule) return
    const r = rule[hospital.archetype]
    const key = ({ labels: 'labelsFloat', touch: 'touch36', icons: 'iconOnly', bedcol: 'hideBed' } as const)[id as 'labels']
    const region = ({ labels: 'field', errors: 'field', touch: 'actions', icons: 'actions', density: 'table', risk: 'table', bedcol: 'table', sort: 'table' } as const)[id as 'labels']
    const link = { href: `#ix-rec-${r.record}`, label: `${archLabel(hospital.archetype)} ${rule.primitive.toLowerCase()} record` }
    const on = key ? !gov[key] : true
    if (id === 'density' && r.state !== 'locked') {
      const current = resolved.theme['brand.density']
      const next = current === 'compact' ? 'regular' : 'compact'
      setGovs(g => ({ ...g, [active]: { ...gov, density: next } }))
      if (presetObj) {
        write({ did: `You switched ${hospital.name} to ${next} density.`, tier: 'Theme (held by preset)', tokens: ['brand.density'], region,
          followed: [], held: [`Patient table spacing, because the ${presetObj.label} preset sets density`],
          why: 'A ward preset sits above the hospital theme, so its density wins until the preset is off.', rule: link,
          code: [`themes/${hospital.id}.json`, `+ "brand.density": "${next}"`, `presets/${presetObj.id}.json wins`] })
        return
      }
      write({ did: `You switched ${hospital.name} to ${next} density.`, tier: 'Theme', tokens: ['brand.density', 'space.pad'], region,
        followed: ['Patient table spacing', 'Field padding'], held: ['Touch targets, which keep their locked size'], why: r.short, rule: link,
        code: [`themes/${hospital.id}.json`, `- "brand.density": "${current}"`, `+ "brand.density": "${next}"`] })
      return
    }
    if (r.state === 'locked' || !key || (r.state === 'flag' && !gov.desktopFlag)) {
      const needFlag = r.state === 'flag' && !gov.desktopFlag
      write({ did: `You tried "${rule.label}" on ${hospital.name}.`, tier: 'Component (locked)', tokens: [componentToken(id)], blocked: true,
        followed: [], held: [`${rule.primitive} keeps its ${archLabel(hospital.archetype)} contract`],
        why: needFlag ? `${r.short} Mark the screen as desktop-locked first.` : r.short, rule: link, region })
      return
    }
    setGovs(g => ({ ...g, [active]: { ...gov, [key]: on } }))
    write({ did: `You ${on ? 'turned on' : 'turned off'} "${rule.label}" for ${hospital.name}.`, tier: 'Component', tokens: [componentToken(id)],
      followed: [followerOf(id)], held: id === 'bedcol' ? ['Risk column, which can never be hidden'] : [],
      why: r.short, rule: link, region, code: [`themes/${hospital.id}.json`, `${on ? '+' : '-'} "${componentToken(id)}": "${valueOf(id)}"`] })
  }
  const toggleFlag = () => {
    if (hospital.archetype !== 'large') {
      write({ did: `You tried to mark a ${hospital.name} screen as desktop-locked.`, tier: 'Environment (locked)', tokens: ['env.desktopLocked'], blocked: true,
        followed: [], held: ['Touch targets stay at 44px'], why: `${archLabel(hospital.archetype)} screens are touch devices, so 44px stays.`, region: 'actions',
        rule: { href: '#ix-governance', label: 'Touch target rule' } })
      return
    }
    const on = !gov.desktopFlag
    setGovs(g => ({ ...g, [active]: { ...gov, desktopFlag: on, touch36: on ? gov.touch36 : false } }))
    write({ did: `You ${on ? 'marked' : 'unmarked'} this ${hospital.name} screen as desktop-locked.`, tier: 'Environment', tokens: ['env.desktopLocked'],
      followed: on ? ['36px targets become possible'] : ['Touch targets back to 44px'], held: [],
      why: on ? '36px targets are now possible on this screen.' : 'Touch targets are back to 44px.', rule: { href: '#ix-rec-field-large', label: 'Teaching field record' } })
  }

  // ── Detach, copy, invent ──
  const addInstance = (kind: 'detach' | 'copy' | 'invent' | 'prop') => {
    const id = nextId.current++
    const color = kind === 'invent' ? SAMPLE_COLOURS.invent : master
    setInstances(is => [...is, { id, kind, color }])
    const k = SECTIONS.rot.kinds[kind]
    write({ did: `You added a ${k.name.toLowerCase()}.`, tier: kind === 'prop' ? 'Component' : 'None (outside the system)', tokens: kind === 'prop' ? ['button.contrastMode = high', 'button.background → color.primary'] : ['Values copied by hand'],
      followed: kind === 'prop' ? ['Stays bound to the master'] : [], held: kind === 'prop' ? [] : [`${k.name} is no longer bound to the master`],
      why: k.short, rule: { href: '#ix-rot', label: 'Detach, copy and invent' } })
  }
  const changeMaster = () => {
    const M = SAMPLE_COLOURS.masters
    const to = M[(M.indexOf(master) + 1) % M.length]
    const from = master
    setMaster(to)
    setInstances(is => is.map(i => (i.kind === 'bound' || i.kind === 'prop' ? { ...i, color: to } : i)))
    const names = (k: Instance['kind']) => instances.filter(i => i.kind === k).length
    const held = (['detach', 'copy', 'invent'] as const).filter(k => names(k)).map(k => `${SECTIONS.rot.kinds[k].name}, frozen at its old value`)
    write({ did: `You changed the master colour to ${to}.`, tier: 'Raw and semantic (library master)', tokens: ['color/primary'],
      followed: ['Bound instance', ...(names('prop') ? ['Instance with contrast prop'] : [])], held,
      why: held.length ? 'Bound instances follow. The others froze when they left the system.' : 'Every instance is bound, so all of them follow.',
      rule: { href: '#ix-rot', label: 'Detach, copy and invent' }, figma: `Library › color/primary  ${from} → ${to}`, code: ['tokens/master.json', `- "color.primary": "${from}"`, `+ "color.primary": "${to}"`] })
  }
  const resetInstances = () => {
    setInstances([{ id: 1, kind: 'bound', color: master }]); nextId.current = 2
    write({ did: 'You reset the library demo to one bound instance.', tier: 'Component', tokens: ['button.background → color.primary'], followed: ['Bound instance'], held: [], why: 'Every instance reads the master again.' })
  }

  // ── Slots ──
  const setLayout = (layout: Layout) => {
    if (layout === hospital.layout) { same(`You picked the ${layout} layout, which ${hospital.name} already uses.`); return }
    if (hospital.layout === 'hero' || layout === 'hero') {
      const toHero = layout === 'hero'
      write({ did: `You tried to give ${hospital.name} the ${toHero ? 'HeroDoctorCard' : layout + ' layout'}.`, tier: 'Component (separate)', tokens: ['heroDoctorCard', 'doctorCard.layout'], blocked: true, region: 'doctor',
        followed: [], held: [toHero ? `${hospital.name} keeps DoctorCard with slots` : 'Specialty keeps HeroDoctorCard'],
        why: toHero ? 'HeroDoctorCard is a separate component for a screen with one hero card, so it is not a layout value.' : 'Specialty uses its own HeroDoctorCard, so slot layouts don’t apply.',
        rule: { href: '#ix-slots', label: 'When a variant earns its own component' } })
      return
    }
    const from = hospital.layout
    setHospitals(hs => hs.map(h => h.id === active ? { ...h, layout } : h))
    const d = diffLines(hospital.id, 'brand.layout', from, layout)
    write({ did: `You switched the ${hospital.name} doctor card to the ${layout} layout.`, region: 'doctor', tier: 'Theme', tokens: ['brand.layout', 'doctorCard.layout'],
      followed: ['DoctorCard slots rearrange'], held: ['Data contract unchanged'], why: 'Layout is a theme token, so the slots rearrange.', figma: d.figma, code: d.code })
  }
  const tryFork = () => {
    write({ did: 'You tried to fork the card as DoctorCard-HospitalB.', region: 'doctor', tier: 'None (fork declined)', tokens: ['doctorCard.*'], blocked: true,
      followed: [], held: ['One DoctorCard stays the only card'], why: 'A fork copies the data contract, and a slot layout keeps it in one place.', rule: { href: '#ix-slots', label: 'Slots instead of forks' } })
  }

  // ── Presets and edge cases ──
  const pickPreset = (id: PresetId | null) => {
    if (id === preset) { same(id ? 'You picked the preset that is already on.' : 'You picked no preset, and none was on.'); return }
    const p = id ? PRESETS.find(x => x.id === id)! : null
    setPreset(id)
    if (!p) {
      write({ did: 'You removed the ward preset.', tier: 'Theme', tokens: ['brand.density', 'brand.surface', 'brand.text'], followed: ['Console back to the hospital theme'], held: [], why: 'The hospital theme is back as it was.' })
      return
    }
    const changes = [`brand.density = ${p.density}`, `brand.textScale = ${p.textScale}`, `brand.surface = ${p.surface}`, ...(p.contrast === 'high' ? ['brand.text = high contrast ink'] : []), ...(p.surface === 'dark' ? ['brand.text = light, through the theme tier'] : [])]
    write({ did: `You applied the ${p.label} preset to ${hospital.name}.`, region: 'table', tier: 'Theme (preset)', tokens: changes,
      followed: ['Patient table spacing', 'All text', ...(p.surface === 'dark' ? ['Surfaces and cards'] : [])],
      held: ['Critical alert colour', 'Brand colour', 'Locked contracts such as the 44px target'],
      why: p.who, rule: { href: '#ix-edges', label: 'Ward presets' },
      code: [`presets/${p.id}.json`, ...changes.map(c => `+ ${c}`)] })
  }
  const pickEdge = (e: Edge) => {
    if (e === edge) { same('You picked the patient list content that is already showing.'); return }
    setEdge(e)
    write({ did: e === 'none' ? 'You returned the patient list to its usual content.' : e === 'long' ? 'You gave a patient a very long name.' : 'You emptied the admissions list.',
      tier: 'Content rule', tokens: e === 'long' ? ['table.name.overflow = wrap', 'doctorCard.meta.overflow = truncate'] : e === 'empty' ? ['table.emptyState'] : [], region: 'table',
      followed: e === 'none' ? [] : ['Patient table'], held: [], why: e === 'long' ? 'Patient names wrap and are never cut short.' : e === 'empty' ? 'An empty list says what is empty.' : 'Sample data restored.', rule: { href: '#ix-edges', label: 'Edge-case rules' } })
  }

  // ── What didn't work ──
  const toggleShortcut = () => {
    const on = !shortcut; setShortcut(on)
    write({ did: on ? 'You added a hospital keyboard shortcut layer to the patient list.' : 'You removed the shortcut layer.', tier: on ? 'Outside the component contract' : 'Component', tokens: ['table.keyboard', 'focus.ring'], region: 'table',
      followed: on ? [] : ['Focus ring and Tab order back to the contract'], held: on ? ['Focus ring on the patient rows'] : [],
      why: on ? 'The layer handled Tab first, so the focus ring disappeared.' : 'Keyboard behaviour is the shared contract again.', rule: { href: '#ix-failed', label: 'What didn’t work' } })
  }

  // ── Views, decisions, onboarding ──
  const note = (did: string, why: string, extra: Partial<Omit<Entry, 'n' | 'did' | 'why'>> & { tier: string }) =>
    write({ did, why, tokens: [], followed: [], held: [], ...extra })

  // Keyboard focus into the console's patient list (the What didn't work demo).
  const focusList = () => {
    write({ did: 'You moved keyboard focus to the patient list.', tier: shortcut ? 'Outside the component contract' : 'Component (keyboard)', tokens: ['table.keyboard', 'focus.ring'], region: 'table',
      followed: shortcut ? [] : ['Row focus ring'], held: shortcut ? ['Row focus ring, swallowed by the shortcut layer'] : [],
      why: shortcut ? 'The layer handles Tab first, so the focused row shows no ring.' : 'Rows are in the Tab order and show the shared focus ring. Press Tab to move between them.',
      rule: { href: '#ix-failed', label: 'What didn’t work' } })
    requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-ix-row]')?.focus())
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
    setHospitals(hs => [...hs, hosp]); setActive(id)
    write({ did: `You added ${h.name} to the console.`, region: 'header', tier: 'Theme (new file)', tokens: ['brand.primary', 'brand.radius', 'brand.density', 'brand.layout'],
      followed: ['Every shared component, with the new theme'], held: [`${archLabel(h.archetype)} locked axes, inherited as they are`],
      why: `It inherits the ${archLabel(h.archetype)} locked axes.`,
      rule: { href: '#ix-governance', label: `${archLabel(h.archetype)} rules` },
      code: [`themes/${id}.json`, `+ "brand.primary": "${h.primary}"`, `+ "brand.radius": "${h.radius}px"`, `+ "brand.density": "${h.density}"`, `+ "brand.layout": "${h.layout}"`, `+ "archetype": "${h.archetype}"`] })
  }

  const clearLog = () => { setLog([]); n.current = 0 }

  return {
    hospitals, hospital, active, preset, presetObj, gov, edge, drift, master, instances, shortcut, log, resolved, recordsOpen, recordPrim,
    actions: { showDrift, consolidate, pickHospital, setPrimary, stepRadius, tryAlertColour, tryGov, toggleFlag, addInstance, changeMaster, resetInstances,
      setLayout, tryFork, pickPreset, pickEdge, toggleShortcut, note, addHospital, clearLog, focusList, openRecord, setRecordsOpen, setRecordPrim },
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
