'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ARCHETYPES, DECISIONS, DRIFT, GOVERNANCE, PRESETS, RECORDS, SAMPLE_COLOURS, SECTIONS, SWATCHES } from './data'
import { COLUMNS, cell, flag, forkName, outlier, type ButtonProps, type Column, type Fork } from './drift'
import { ContrastField } from './ContrastField'
import { LineageTable, XRay } from './XRay'
import { BRAND_MIN, RAW, checkBrand, isHex, resolve, GOV_DEFAULT, type ArchetypeId, type Density, type Layout } from './model'
import { ChangeLog } from './ChangeLog'
import { IconChevron, IconLock } from './Icons'
import type { Store } from './useInvitrace'
import s from './invitrace.module.css'

// ── Small shared pieces ──
export function Section({ id, n, title, body, children }: { id: string; n: string; title: string; body: string[]; children?: ReactNode }) {
  return (
    <section id={id} className={s.section} aria-labelledby={`${id}-h`}>
      <p className={s.eyebrow} aria-hidden="true">{n}</p>
      <h2 id={`${id}-h`} className={s.h2}>{title}</h2>
      {body.map(p => <p key={p} className={s.body}>{p}</p>)}
      {children}
    </section>
  )
}
/** A segmented control with a sliding indicator. The indicator's box is read from the pressed
    button on change and resize only; it travels on the system curve. */
function Seg<T extends string>({ label, value, options, onPick }: { label: string; value: T | null; options: { id: T; label: string }[]; onPick: (v: T) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  // Read in the next frame, after the browser's own layout, so a click never forces one.
  useEffect(() => {
    const el = ref.current; if (!el) return
    const read = () => {
      const b = el.querySelector<HTMLElement>('button[aria-pressed="true"]')
      const next = b ? { x: b.offsetLeft, y: b.offsetTop, w: b.offsetWidth, h: b.offsetHeight } : null
      setBox(prev => (prev && next && prev.x === next.x && prev.y === next.y && prev.w === next.w && prev.h === next.h ? prev : next))
    }
    const id = requestAnimationFrame(read)
    const ro = new ResizeObserver(read); ro.observe(el)
    return () => { cancelAnimationFrame(id); ro.disconnect() }
  }, [value, options.length])
  return (
    <div ref={ref} className={s.seg} role="group" aria-label={label}>
      {box && <span className={s.segInd} aria-hidden="true" style={{ transform: `translate(${box.x}px, ${box.y}px)`, width: box.w, height: box.h }} />}
      {options.map(o => <button key={o.id} type="button" className={s.segBtn} aria-pressed={value === o.id} onClick={() => onPick(o.id)}>{o.label}</button>)}
    </div>
  )
}
/** Closed by default; the content mounts on open (clip-path reveal) and the toggle is logged. */
function Disclosure({ label, children, onToggle, open: controlled }: { label: [string, string]; children: ReactNode; onToggle: (open: boolean) => void; open?: boolean }) {
  const [own, setOwn] = useState(false)
  const open = controlled ?? own
  const id = useId()
  return (
    <div className={s.disclosure}>
      <button type="button" className={s.disclosureBtn} aria-expanded={open} aria-controls={id} onClick={() => { setOwn(!open); onToggle(!open) }}><IconChevron size={12} />{open ? label[1] : label[0]}</button>
      {open && <div id={id} className={s.disclosureBody}>{children}</div>}
    </div>
  )
}
const Lock = () => <IconLock size={14} />
const Panel = ({ children, label }: { children: ReactNode; label: string }) => <div className={s.panel} role="group" aria-label={label}>{children}</div>

// ── 1 · The problem ──
const STEP = 420
export function Problem({ st }: { st: Store }) {
  const t = SECTIONS.problem
  const one = st.drift === 'one'
  const forks = SAMPLE_COLOURS.drift
  const canon: ButtonProps = { pad: '0 16px', r: st.hospital.radius, bg: st.hospital.primary, weight: 600, label: 'Admit patient', h: parseInt(st.resolved.component['button.minHeight']) }
  // Rows are corrected one at a time, like a reviewer going down a printed sheet: the old
  // value is struck through and the reference value written beside it.
  const [conv, setConv] = useState(0)
  useEffect(() => {
    if (st.drift !== 'one') { setConv(0); return }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setConv(COLUMNS.length); return }
    let k = 0
    setConv(1)
    const id = window.setInterval(() => { k = Math.min(COLUMNS.length, k + 1); setConv(k + 1); if (k + 1 >= COLUMNS.length) window.clearInterval(id) }, STEP)
    return () => window.clearInterval(id)
  }, [st.drift])
  const done = (c: Column) => conv > COLUMNS.findIndex(x => x.id === c)
  const shown = (f: Fork): ButtonProps => ({
    pad: done('pad') ? canon.pad : f.pad, r: done('r') ? canon.r : f.r, bg: done('contrast') ? canon.bg : f.bg,
    weight: done('weight') ? canon.weight : f.weight, label: done('label') ? canon.label : f.label, h: done('h') ? canon.h : f.h,
  })
  const settled = one && conv >= COLUMNS.length
  // Each landed column takes a share of the drift out, so the buttons straighten as the table converges.
  const lean = one ? 1 - conv / COLUMNS.length : 1
  return (
    <Section id="ix-problem" n="01" title={t.title} body={t.body}>
      <Panel label="Forked buttons">
        <div className={s.row}>
          <button type="button" className={st.drift === 'idle' ? s.btn : s.btnQuiet} onClick={st.actions.showDrift} aria-pressed={st.drift === 'drifted'}>Show forks</button>
          <button type="button" className={s.btnQuiet} onClick={st.actions.consolidate} disabled={st.drift === 'idle'} aria-pressed={one}>Consolidate</button>
        </div>
        {st.drift !== 'idle' && (
          <div className={s.drift} data-one={settled || undefined}>
            {forks.map((f, i) => {
              const b = shown(f)
              return (
                <span key={i} className={s.driftItem} aria-hidden="true">
                  <span className={s.driftBtn}
                    style={{ padding: b.pad, borderRadius: b.r, background: b.bg, fontWeight: b.weight, height: b.h, transform: settled ? undefined : `translate(${f.x * lean}px, ${f.y * lean}px) rotate(${f.rot * lean}deg)` }}>
                    {b.label}
                  </span>
                  <span className={s.driftTag}>{forkName(i)}</span>
                </span>
              )
            })}
          </div>
        )}
        {st.drift !== 'idle' && <p className={s.note}>{one ? t.consolidated : t.drifted}</p>}
        {st.drift !== 'idle' && (
          // A sideways-scrolling region must be reachable by keyboard (WCAG 2.1.1).
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          <div className={s.tableWrap} data-sheet tabIndex={0} role="region" aria-label="Fork property matrix, scrolls sideways">
            <table className={s.matrix}>
              <caption>{DRIFT.caption}</caption>
              <thead><tr><th scope="col">Property</th>{forks.map((_, fi) => <th key={fi} scope="col">{forkName(fi)}</th>)}<th scope="col" data-ref>Reference</th></tr></thead>
              <tbody>
                {COLUMNS.map(c => {
                  const d = done(c.id)
                  return (
                    <tr key={c.id} data-conv={d || undefined}>
                      <th scope="row">{c.label}</th>
                      {forks.map((f, fi) => {
                        const v = cell(f, c.id), ref = cell(canon, c.id)
                        const out = outlier(f, canon, c.id)
                        const fl = out ? flag(f, canon, c.id) : null
                        const fail = !d && c.id === 'contrast' && !checkBrand(f.bg).ok
                        return (
                          <td key={fi} data-out={(!d && out) || undefined} data-fail={fail || undefined} data-fixed={(d && out) || undefined}>
                            {d && out
                              ? <><del className={s.mOld}>{v}</del> <ins className={s.mFix}>{ref}</ins></>
                              : <>{v}{fl && <sup className={s.mFlag}>{fl}<span className={s.srOnly}>{fl === 'H' ? ', above reference' : fl === 'L' ? ', below reference' : ', differs from reference'}</span></sup>}</>}
                          </td>
                        )
                      })}
                      <td data-ref>{cell(canon, c.id)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {st.drift !== 'idle' && <p className={s.sample}>{DRIFT.legend}</p>}
      </Panel>
    </Section>
  )
}

// ── 2 · Token tiers ──
export function Tiers({ st }: { st: Store }) {
  const t = SECTIONS.tiers
  const [custom, setCustom] = useState('')
  const [check, setCheck] = useState<ReturnType<typeof checkBrand> | null>(null)
  const id = useId()
  const r = st.resolved
  const apply = (hex: string) => setCheck(st.actions.setPrimary(hex))
  return (
    <Section id="ix-tiers" n="02" title={t.title} body={t.body}>
      <ol className={s.tiers} aria-label="Where the brand colour resolves">
        <li><span className={s.tierName}>Raw</span><span className={s.mono}>raw.white {RAW.white} · raw.critical {RAW.critical}</span></li>
        <li><span className={s.tierName}>Theme</span><span className={s.mono}>brand.primary {r.theme['brand.primary']} · brand.text {r.theme['brand.text']}</span></li>
        <li><span className={s.tierName}>Semantic</span><span className={s.mono}>color.primary → brand.primary · color.critical → raw.critical</span></li>
        <li><span className={s.tierName}>Component</span><span className={s.mono}>button.background → color.primary · alert.background → color.critical</span></li>
      </ol>
      <XRay st={st} />
      <Disclosure label={['Show lineage table', 'Hide lineage table']}
        onToggle={o => { if (o) st.actions.note('Lineage table opened', 'Every console part, tier by tier, from the X-ray graph.', { tier: 'Lineage' }) }}>
        <LineageTable st={st} />
      </Disclosure>
      <Panel label="Hospital theme">
        <p className={s.panelLabel} id={`${id}-h`}>Hospital</p>
        <Seg label="Hospital" value={st.active} options={st.hospitals.map(h => ({ id: h.id, label: h.name }))} onPick={st.actions.pickHospital} />
        <p className={s.panelLabel}>Brand colour <span className={s.muted}>checked against white button text, {BRAND_MIN}:1</span></p>
        <div className={s.swatches} role="group" aria-label="Brand colour">
          {SWATCHES.map(hex => {
            const c = checkBrand(hex)
            return (
              <button key={hex} type="button" className={s.swatch} data-fail={!c.ok || undefined} style={{ background: hex }} aria-pressed={st.hospital.primary === hex}
                aria-label={`${hex}, ${c.ratio.toFixed(1)} to 1${c.ok ? '' : ', fails'}`} onClick={() => apply(hex)}>
                {!c.ok && <span aria-hidden="true">✕</span>}
              </button>
            )
          })}
        </div>
        <form className={s.row} onSubmit={e => { e.preventDefault(); if (isHex(custom)) apply(custom) }}>
          <label htmlFor={`${id}-hex`} className={s.srOnly}>Custom brand colour, hex</label>
          <input id={`${id}-hex`} className={s.input} placeholder="#1D4ED8" value={custom} onChange={e => setCustom(e.target.value.trim())} maxLength={7} aria-invalid={custom !== '' && !isHex(custom)} />
          <button type="submit" className={s.btnQuiet} disabled={!isHex(custom)}>Check and apply</button>
        </form>
        {check && !check.ok && (
          <div className={s.blocked} role="group" aria-label="Contrast check">
            <p>✕ Blocked: contrast {check.ratio.toFixed(2)}:1 with white text, needs {BRAND_MIN}:1</p>
            <button type="button" className={s.btnQuiet} onClick={() => apply(check.nearest)}>
              <span className={s.dot} style={{ background: check.nearest }} aria-hidden="true" /> Use {check.nearest}, nearest pass
            </button>
          </div>
        )}
        <p className={s.panelLabel}>Contrast field</p>
        <ContrastField st={st} />
        <p className={s.panelLabel}>Corner radius <span className={s.mono}>{st.hospital.radius}px</span></p>
        <div className={s.row}>
          <button type="button" className={s.btnQuiet} onClick={() => st.actions.stepRadius(-2)} aria-label="Smaller radius">− 2px</button>
          <button type="button" className={s.btnQuiet} onClick={() => st.actions.stepRadius(2)} aria-label="Larger radius">+ 2px</button>
        </div>
        <p className={s.panelLabel}>Status colours</p>
        <button type="button" className={s.btnQuiet} onClick={st.actions.tryAlertColour}>Recolour critical alert</button>
      </Panel>
    </Section>
  )
}

// ── 3 · Governance ──
export function Governance({ st }: { st: Store }) {
  const t = SECTIONS.governance
  const a = st.hospital.archetype
  const prim = st.recordPrim
  // The last rule you tried: its full reason, in my words from the variant record, shows under the list.
  const [tried, setTried] = useState<string | null>(null)
  const triedRule = tried ? GOVERNANCE.find(g => g.id === tried) : undefined
  const key = (id: string) => ({ labels: 'labelsFloat', touch: 'touch36', icons: 'iconOnly', bedcol: 'hideBed' } as const)[id as 'labels']
  const nextDensity = st.resolved.theme['brand.density'] === 'compact' ? 'regular' : 'compact'
  const rec = RECORDS[`${prim}-${a}`]
  return (
    <Section id="ix-governance" n="03" title={t.title} body={t.body}>
      <Panel label="Locked and flexible axes">
        <p className={s.panelLabel}>{ARCHETYPES[a].label} rules · <span className={s.muted}>{ARCHETYPES[a].who}</span></p>
        <ul className={s.govList}>
          {GOVERNANCE.map(rule => {
            const r = rule[a]
            const k = key(rule.id)
            const on = k ? st.gov[k] : false
            const state = r.state === 'flag' ? (st.gov.desktopFlag ? 'flexible' : 'needs flag') : r.state
            return (
              <li key={rule.id} className={s.govItem}>
                <button type="button" className={s.govBtn} aria-pressed={rule.id === 'density' ? undefined : on} data-state={state} onClick={() => { st.actions.tryGov(rule.id); setTried(rule.id) }}>
                  <span className={s.govState} aria-hidden="true">{state === 'locked' ? <Lock /> : on ? '●' : '○'}</span>
                  <span>{rule.id === 'density' ? `Switch to ${nextDensity} density` : rule.label}</span>
                  <span className={s.govTag}>{state === 'locked' ? 'Locked' : state === 'needs flag' ? 'Needs flag' : 'Flexible'}</span>
                </button>
              </li>
            )
          })}
          <li className={s.govItem}>
            <button type="button" className={s.govBtn} aria-pressed={st.gov.desktopFlag} data-state={a === 'large' ? 'flexible' : 'locked'} onClick={() => { st.actions.toggleFlag(); setTried('touch') }}>
              <span className={s.govState} aria-hidden="true">{a === 'large' ? (st.gov.desktopFlag ? '●' : '○') : <Lock />}</span>
              <span>Desktop-locked screen flag</span>
              <span className={s.govTag}>{a === 'large' ? 'Environment flag' : 'Locked'}</span>
            </button>
          </li>
        </ul>
        {triedRule && (
          <div key={`${tried}-${a}`} className={triedRule[a].state === 'locked' || (triedRule[a].state === 'flag' && !st.gov.desktopFlag) ? s.blocked : s.reason}>
            <p className={s.recHead}>{triedRule.label} · {ARCHETYPES[a].label} · {triedRule[a].state === 'locked' ? 'locked' : triedRule[a].state === 'flag' ? 'behind a flag' : 'flexible'}</p>
            <p>{triedRule[a].why}</p>
          </div>
        )}
      </Panel>
      <Disclosure label={[`Show ${ARCHETYPES[a].label} variant records`, 'Hide variant records']} open={st.recordsOpen}
        onToggle={o => { st.actions.setRecordsOpen(o); if (o) st.actions.note(`${ARCHETYPES[a].label} variant records opened`, `A ${ARCHETYPES[a].label} theme changes flexible settings only. Locked settings come with the hospital type.`, { tier: 'Component rules' }) }}>
      <Panel label="Variant records">
        <p className={s.panelLabel}>The {ARCHETYPES[a].label} record for each component</p>
        <Seg label="Component" value={prim} options={[{ id: 'button', label: 'Button' }, { id: 'field', label: 'Field' }, { id: 'table', label: 'Table' }]}
          onPick={p => { st.actions.setRecordPrim(p); st.actions.note(`${ARCHETYPES[a].label} ${p} record`, `Locked ${p} settings come with this hospital type.`, { tier: 'Component rules', rule: { href: `#ix-rec-${p}-${a}`, label: 'Variant record' } }) }} />
        {rec && (
          <div className={s.records} id={`ix-rec-${prim}-${a}`}>
            <div><p className={s.recHead}>Flexible</p><ul>{rec.flexible.map(x => <li key={x}>{x}</li>)}</ul></div>
            <div><p className={s.recHead}>Locked</p><ul>{rec.locked.map(x => <li key={x}><Lock /> {x}</li>)}</ul></div>
          </div>
        )}
      </Panel>
      </Disclosure>
      <h3 className={s.h3}>{t.whyTitle}</h3>
      {t.why.map(p => <p key={p} className={s.body}>{p}</p>)}
    </Section>
  )
}

// ── 4 · Detach, copy, invent ──
export function Rot({ st }: { st: Store }) {
  const t = SECTIONS.rot
  return (
    <Section id="ix-rot" n="04" title={t.title} body={t.body}>
      <Panel label="Library demo">
        <div className={s.master}>
          <span className={s.dotLg} style={{ background: st.master }} aria-hidden="true" />
          <span><span className={s.panelLabel}>Master token</span><span className={s.mono}> color/primary {st.master}</span></span>
          <button type="button" className={s.btnQuiet} onClick={st.actions.changeMaster}>Change master colour</button>
        </div>
        <ul className={s.instances}>
          {st.instances.map(i => (
            <li key={i.id} className={s.instance} data-kind={i.kind}>
              <span className={s.instBtn} style={{ background: i.color, borderRadius: i.kind === 'invent' ? 2 : undefined }} aria-hidden="true">Admit</span>
              <span className={s.instName}>{i.kind === 'bound' ? 'Bound instance' : t.kinds[i.kind].name}</span>
              <span className={s.instState}>{i.kind === 'bound' || i.kind === 'prop' ? 'Follows the master' : 'Frozen'}</span>
            </li>
          ))}
        </ul>
        <div className={s.row}>
          {(['detach', 'copy', 'invent', 'prop'] as const).map(k => <button key={k} type="button" className={s.btnQuiet} onClick={() => st.actions.addInstance(k)}>{t.kinds[k].label}</button>)}
          <button type="button" className={s.btnQuiet} onClick={st.actions.resetInstances}>Reset</button>
        </div>
      </Panel>
      <div className={s.cards3}>
        {(['detach', 'copy', 'invent'] as const).map(k => (
          <div key={k} className={s.card}><p className={s.cardTitle}>{t.kinds[k].name}</p><p>{t.kinds[k].why}</p></div>
        ))}
      </div>
      <p className={s.quote}>{t.principle}</p>
    </Section>
  )
}

// ── 5 · Slots ──
export function Slots({ st }: { st: Store }) {
  const t = SECTIONS.slots
  return (
    <Section id="ix-slots" n="05" title={t.title} body={t.body}>
      <Panel label="Doctor card layout">
        <p className={s.panelLabel}>brand.layout for {st.hospital.name}</p>
        <Seg<Layout> label="Doctor card layout" value={st.hospital.layout} options={[{ id: 'row', label: 'Row' }, { id: 'column', label: 'Column with footer' }, { id: 'hero', label: 'HeroDoctorCard' }]} onPick={st.actions.setLayout} />
        <button type="button" className={s.btnQuiet} onClick={st.actions.tryFork}>Fork as DoctorCard-HospitalB</button>
      </Panel>
      <pre className={s.code} aria-label="DoctorCard compound component"><code>{`// DoctorCard owns the data contract; slots decide layout
<DoctorCard data={doctor} layout={brand.layout}>
  <DoctorCard.SlotAvatar position={brand.layout.avatarPosition} />
  <DoctorCard.SlotInfo showSpecialty={brand.layout.showSpecialty} />
  <DoctorCard.SlotAction variant={brand.layout.actionVariant} />
</DoctorCard>

// ${st.hospital.name}: brand.layout = "${st.hospital.layout}"`}</code></pre>
    </Section>
  )
}

// ── 6 · Presets and edge cases ──
export function Edges({ st }: { st: Store }) {
  const t = SECTIONS.edges
  return (
    <Section id="ix-edges" n="06" title={t.title} body={t.body}>
      <Panel label="Ward presets">
        <p className={s.panelLabel}>Preset</p>
        <Seg label="Ward preset" value={st.preset ?? 'none'} options={[{ id: 'none', label: 'None' }, ...PRESETS.map(p => ({ id: p.id, label: p.label }))]}
          onPick={v => st.actions.pickPreset(v === 'none' ? null : (v as typeof PRESETS[number]['id']))} />
        {st.presetObj && <p className={s.note}>{st.presetObj.who}</p>}
      </Panel>
      <Panel label="Edge cases">
        <p className={s.panelLabel}>Patient list content</p>
        <Seg label="Edge case" value={st.edge} options={[{ id: 'none', label: 'Usual' }, { id: 'long', label: 'Long name' }, { id: 'empty', label: 'No admissions' }]} onPick={st.actions.pickEdge} />
        {st.edge === 'long' && <p className={s.note}>{t.longRule}</p>}
        {st.edge === 'empty' && <p className={s.note}>{t.emptyRule}</p>}
      </Panel>
    </Section>
  )
}

// ── 7 · Keyboard shortcut layers ──
export function Failed({ st }: { st: Store }) {
  const t = SECTIONS.failed
  return (
    <Section id="ix-failed" n="07" title={t.title} body={t.body}>
      <Panel label="Shortcut layer demo">
        <p className={s.note}>{t.demoNote}</p>
        <div className={s.row}>
          <button type="button" className={s.btnQuiet} aria-pressed={st.shortcut} onClick={st.actions.toggleShortcut}>{st.shortcut ? 'Remove shortcut layer' : 'Add shortcut layer'}</button>
          <button type="button" className={s.btnQuiet} onClick={st.actions.focusList}>Focus patient list</button>
        </div>
      </Panel>
    </Section>
  )
}

// ── 8 · Decisions ──
export function Decisions({ st }: { st: Store }) {
  const t = SECTIONS.decisions
  const [open, setOpen] = useState<number | null>(null)
  return (
    <Section id="ix-decisions" n="08" title={t.title} body={t.body}>
      <ol className={s.decisions}>
        {DECISIONS.map((d, i) => (
          <li key={d.title} className={s.decision}>
            <h3 className={s.h3}>{d.title}</h3>
            <p>{d.problem}</p>
            <button type="button" className={s.btnQuiet} aria-expanded={open === i} aria-controls={`ix-dec-${i}`}
              onClick={() => { const opening = open !== i; setOpen(opening ? i : null); if (opening) st.actions.note(`Decision record: ${d.title}`, `Chose ${d.chosen}. Cost: ${d.cost}`, { tier: 'Decision record' }) }}>
              {open === i ? 'Hide options' : 'Show options and cost'}
            </button>
            {open === i && (
              <div id={`ix-dec-${i}`} className={s.decBody}>
                <ul className={s.options}>{d.options.map(o => <li key={o.key} data-chosen={o.key === d.chosen || undefined}><span className={s.mono}>{o.key}</span> {o.text}{o.key === d.chosen ? <span className={s.chosen}> ✓ chosen</span> : null}</li>)}</ul>
                <p>{d.rationale}</p>
                <p className={s.cost}><span className={s.recHead}>Cost</span> {d.cost}</p>
              </div>
            )}
          </li>
        ))}
      </ol>
    </Section>
  )
}

// ── 9 · Role views ──
export function Views({ st }: { st: Store }) {
  const t = SECTIONS.views
  const [view, setView] = useState<'designer' | 'engineer' | 'pm'>('designer')
  const r = st.resolved
  const h = st.hospital
  const locked = GOVERNANCE.filter(g => g[h.archetype].state === 'locked').map(g => g.label.toLowerCase())
  return (
    <Section id="ix-views" n="09" title={t.title} body={t.body}>
      <Disclosure label={['Show role views', 'Hide role views']}
        onToggle={o => { if (o) st.actions.note(`Role views opened for ${h.name}`, 'Each view is generated from the same resolved theme tier.', { tier: 'Theme (read only)' }) }}>
      <Seg label="Role" value={view} options={[{ id: 'designer', label: 'Designer' }, { id: 'engineer', label: 'Engineer' }, { id: 'pm', label: 'Product manager' }]}
        onPick={v => { setView(v); st.actions.note(`Role view: ${v === 'pm' ? 'product manager' : v}`, v === 'designer' ? 'Tokens listed tier by tier.' : v === 'engineer' ? 'Component tokens, aliasing semantic names only.' : 'Summary written from the theme file the build reads.', { tier: 'Theme (read only)' }) }} />
      <div className={s.viewBox}>
        {view === 'designer' && (
          <table className={s.table}><caption className={s.panelLabel}>Tokens for {h.name}</caption>
            <thead><tr><th scope="col">Tier</th><th scope="col">Token</th><th scope="col">Value</th></tr></thead>
            <tbody>
              {Object.entries(r.theme).map(([k, v]) => <tr key={k}><td>Theme</td><td className={s.mono}>{k}</td><td className={s.mono}>{v}</td></tr>)}
              {Object.entries(r.semantic).filter(([k]) => k.startsWith('color.')).map(([k, v]) => <tr key={k}><td>Semantic</td><td className={s.mono}>{k}</td><td className={s.mono}>{v}</td></tr>)}
            </tbody>
          </table>
        )}
        {view === 'engineer' && (
          <table className={s.table}><caption className={s.panelLabel}>Component props for {h.name}</caption>
            <thead><tr><th scope="col">Component</th><th scope="col">Prop or token</th><th scope="col">Value</th></tr></thead>
            <tbody>
              {Object.entries(r.component).map(([k, v]) => <tr key={k}><td>{k.split('.')[0]}</td><td className={s.mono}>{k.split('.')[1]}</td><td className={s.mono}>{v}</td></tr>)}
            </tbody>
          </table>
        )}
        {view === 'pm' && (
          <div className={s.summary}>
            <p>{h.name} follows the {ARCHETYPES[h.archetype].label} rules. {ARCHETYPES[h.archetype].who}</p>
            <p>Its brand colour is {h.primary}, which reaches {checkBrand(h.primary).ratio.toFixed(1)}:1 against white button text. Corners are {h.radius}px and density is {r.theme['brand.density']}.{st.presetObj ? ` The ${st.presetObj.label} preset is on.` : ''}</p>
            <p>The hospital can’t change {locked.join(', ')}. Critical alerts look the same as in every other hospital.</p>
          </div>
        )}
      </div>
      </Disclosure>
    </Section>
  )
}

// ── 10 · Onboarding a hospital ──
export function Onboarding({ st }: { st: Store }) {
  const t = SECTIONS.onboarding
  const [step, setStep] = useState(1)
  const [arch, setArch] = useState<ArchetypeId>('medium')
  const [name, setName] = useState('Riverside hospital')
  const [primary, setPrimary] = useState(() => SAMPLE_COLOURS.onboardingStart)
  const [radius, setRadius] = useState(10)
  const [density, setDensity] = useState<Density>('regular')
  const id = useId()
  const c = checkBrand(primary)
  const preview = resolve({ id: 'preview', archetype: arch, name, primary: c.ok ? primary : c.nearest, radius, density, layout: arch === 'specialty' ? 'hero' : 'row' }, null, GOV_DEFAULT)
  const go = (n: number, did: string, why: string) => { setStep(n); st.actions.note(did, why, { tier: 'Onboarding' }) }
  const back = (n: number) => setStep(n)
  return (
    <Section id="ix-onboarding" n="10" title={t.title} body={t.body}>
      <ol className={s.steps} aria-label="Steps">
        {['Hospital type', 'Theme', 'Contrast check', 'Preview'].map((x, i) => <li key={x} aria-current={step === i + 1 ? 'step' : undefined} data-done={step > i + 1 || undefined}>{i + 1}. {x}</li>)}
      </ol>
      <Panel label="New hospital">
        {step === 1 && (
          <>
            <p className={s.panelLabel}>Hospital type</p>
            <Seg label="Hospital type" value={arch} options={(['medium', 'large', 'specialty'] as const).map(a => ({ id: a, label: ARCHETYPES[a].label }))}
              onPick={a => { setArch(a); if (a === 'specialty') setDensity('regular'); st.actions.note(`Onboarding: ${ARCHETYPES[a].label} rules`, ARCHETYPES[a].who, { tier: 'Onboarding' }) }} />
            <p className={s.note}>{ARCHETYPES[arch].who}</p>
            <button type="button" className={s.btn} onClick={() => go(2, 'Onboarding: theme step', `A ${ARCHETYPES[arch].label} theme changes ${ARCHETYPES[arch].label} flexible settings only.`)}>Next</button>
          </>
        )}
        {step === 2 && (
          <>
            <label className={s.panelLabel} htmlFor={`${id}-n`}>Hospital name</label>
            <input id={`${id}-n`} className={s.input} value={name} onChange={e => setName(e.target.value)} maxLength={40} />
            <p className={s.panelLabel}>Brand colour</p>
            <div className={s.swatches} role="group" aria-label="New hospital brand colour">
              {SWATCHES.map(hex => <button key={hex} type="button" className={s.swatch} style={{ background: hex }} aria-pressed={primary === hex} aria-label={hex} onClick={() => { setPrimary(hex); st.actions.note(`Onboarding: brand colour ${hex}`, 'Contrast is checked on the next step.', { tier: 'Onboarding' }) }} />)}
            </div>
            <p className={s.panelLabel}>Corners <span className={s.mono}>{radius}px</span></p>
            <div className={s.row}>
              <button type="button" className={s.btnQuiet} onClick={() => { const r = Math.max(0, radius - 2); setRadius(r); st.actions.note(r === radius ? 'Onboarding: corners at 0px minimum' : `Onboarding: corners ${r}px`, r === radius ? 'brand.radius range: 0 to 24px.' : 'brand.radius in the new theme file.', { tier: 'Onboarding', blocked: r === radius }) }} aria-label="Smaller radius">− 2px</button>
              <button type="button" className={s.btnQuiet} onClick={() => { const r = Math.min(24, radius + 2); setRadius(r); st.actions.note(r === radius ? 'Onboarding: corners at 24px maximum' : `Onboarding: corners ${r}px`, r === radius ? 'brand.radius range: 0 to 24px.' : 'brand.radius in the new theme file.', { tier: 'Onboarding', blocked: r === radius }) }} aria-label="Larger radius">+ 2px</button>
            </div>
            <p className={s.panelLabel}>Density</p>
            <Seg<Density> label="Density" value={density} options={[{ id: 'compact', label: 'Compact' }, { id: 'regular', label: 'Regular' }]}
              onPick={d => { if (arch === 'specialty' && d !== 'regular') { st.actions.note('Onboarding: compact density refused for Specialty', GOVERNANCE.find(g => g.id === 'density')!.specialty.why, { tier: 'Onboarding (locked)', blocked: true }); return } setDensity(d); st.actions.note(`Onboarding: density ${d}`, 'brand.density in the new theme file.', { tier: 'Onboarding' }) }} />
            <div className={s.row}>
              <button type="button" className={s.btnQuiet} onClick={() => back(1)}>Back</button>
              <button type="button" className={s.btn} disabled={!name.trim()} onClick={() => go(3, `Onboarding: theme set for ${name.trim()}`, `brand.primary is checked against white text at ${BRAND_MIN}:1.`)}>Next</button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <p className={s.panelLabel}>Contrast check</p>
            <p className={c.ok ? s.passed : s.blockedText}>{c.ok ? '✓' : '✕'} {primary}: contrast {c.ratio.toFixed(2)}:1 with white text, {c.ok ? 'passes' : `needs ${BRAND_MIN}:1`}</p>
            {!c.ok && <button type="button" className={s.btnQuiet} onClick={() => { setPrimary(c.nearest); st.actions.note(`Onboarding: brand colour ${c.nearest}`, `Same hue, reaches ${BRAND_MIN}:1.`, { tier: 'Onboarding' }) }}>
              <span className={s.dot} style={{ background: c.nearest }} aria-hidden="true" /> Use {c.nearest}
            </button>}
            <div className={s.row}>
              <button type="button" className={s.btnQuiet} onClick={() => back(2)}>Back</button>
              <button type="button" className={s.btn} aria-disabled={!c.ok} onClick={() => {
                if (!c.ok) { st.actions.note('Onboarding: blocked at contrast check', `Blocked: brand.primary needs ${BRAND_MIN}:1 before review.`, { tier: 'Onboarding (blocked)', blocked: true }); return }
                go(4, 'Onboarding: contrast check passed', 'Ready for review as a file diff.')
              }}>Next</button>
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <p className={s.panelLabel}>Preview of {name.trim()}</p>
            <div className={s.miniPreview} style={preview.css as React.CSSProperties}>
              <span className={s.cBtn}>Admit patient</span>
              <span className={s.cRisk}><i aria-hidden="true" style={{ background: 'var(--ix-critical)' }} />High</span>
              <span className={s.mono}>{ARCHETYPES[arch].label} rules · {density} · {radius}px</span>
            </div>
            <div className={s.row}>
              <button type="button" className={s.btnQuiet} onClick={() => back(3)}>Back</button>
              <button type="button" className={s.btn} onClick={() => { st.actions.addHospital({ archetype: arch, name: name.trim(), primary, radius, density, layout: arch === 'specialty' ? 'hero' : 'row' }); setStep(1) }}>Add to console</button>
            </div>
          </>
        )}
      </Panel>
    </Section>
  )
}

// ── 11 · The full log ──
export function LogSection({ st }: { st: Store }) {
  const t = SECTIONS.log
  return (
    <Section id="ix-log" n="11" title={t.title} body={t.body}>
      <button type="button" className={s.btnQuiet} onClick={st.actions.clearLog} disabled={st.log.length === 0}>Clear log</button>
      <ChangeLog log={st.log} onRecord={st.actions.openRecord} />
    </Section>
  )
}
