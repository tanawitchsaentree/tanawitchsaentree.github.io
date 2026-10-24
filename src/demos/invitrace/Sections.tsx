'use client'

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ARCHETYPES, GOVERNANCE, PRESETS, RECORDS, SAMPLE_COLOURS, SECTIONS, SWATCHES } from './data'
import { BRAND_MIN, checkBrand, isHex, resolve, GOV_DEFAULT, type ArchetypeId, type Density } from './model'
import { IconChevron, IconLock } from './Icons'
import type { Store } from './useInvitrace'
import s from './invitrace.module.css'

// ── Small shared pieces ──
/** A segmented control with a sliding indicator. The indicator's box is read from the pressed
    button on change and resize only; it travels on the system curve. */
export function Seg<T extends string>({ label, value, options, onPick }: { label: string; value: T | null; options: { id: T; label: string }[]; onPick: (v: T) => void }) {
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
export function Disclosure({ label, children, onToggle, open: controlled }: { label: [string, string]; children: ReactNode; onToggle: (open: boolean) => void; open?: boolean }) {
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
export const Lock = () => <IconLock size={14} />
export const Panel = ({ children, label }: { children: ReactNode; label: string }) => <div className={s.panel} role="group" aria-label={label}>{children}</div>

// ── Locked and flexible settings (S3 disclosure) ──
export function GovernanceBlock({ st }: { st: Store }) {
  const a = st.hospital.archetype
  const prim = st.recordPrim
  // The last rule you tried: its full reason, in my words from the variant record, shows under the list.
  const [tried, setTried] = useState<string | null>(null)
  const triedRule = tried ? GOVERNANCE.find(g => g.id === tried) : undefined
  const key = (id: string) => ({ labels: 'labelsFloat', touch: 'touch36', icons: 'iconOnly', bedcol: 'hideBed' } as const)[id as 'labels']
  const nextDensity = st.resolved.theme['brand.density'] === 'compact' ? 'regular' : 'compact'
  const rec = RECORDS[`${prim}-${a}`]
  return (
    <>
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
    </>
  )
}

// ── How copies went stale (S2 disclosure) ──
export function RotBlock({ st }: { st: Store }) {
  const t = SECTIONS.rot
  return (
    <>
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
    </>
  )
}

// ── Ward presets and edge cases (S3 disclosure) ──
export function EdgesBlock({ st }: { st: Store }) {
  const t = SECTIONS.s3
  return (
    <>
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
    </>
  )
}

// ── Show the component (S6 disclosure) ──
export function DoctorCodeBlock({ st }: { st: Store }) {
  return (
    <>
      <pre className={s.code} aria-label="DoctorCard compound component"><code>{`// DoctorCard owns the data contract; slots decide layout
<DoctorCard data={doctor} layout={brand.layout}>
  <DoctorCard.SlotAvatar position={brand.layout.avatarPosition} />
  <DoctorCard.SlotInfo showSpecialty={brand.layout.showSpecialty} />
  <DoctorCard.SlotAction variant={brand.layout.actionVariant} />
</DoctorCard>

// Specialty screens use a separate component
<HeroDoctorCard data={doctor} />`}</code></pre>
      <p className={s.note}>{SECTIONS.s6.forkWhy}</p>
      <button type="button" className={s.btnQuiet} onClick={st.actions.tryFork}>Fork as DoctorCard-HospitalB</button>
    </>
  )
}

// ── Add another hospital (S10 disclosure) ──
export function OnboardingBlock({ st }: { st: Store }) {
  const [hex, setHex] = useState('')
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
    <>
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
            <form className={s.row} onSubmit={e => { e.preventDefault(); if (isHex(hex)) { setPrimary(hex.toUpperCase()); st.actions.note(`Onboarding: brand colour ${hex.toUpperCase()}`, 'Contrast is checked on the next step.', { tier: 'Onboarding' }) } }}>
              <label htmlFor={`${id}-hex`} className={s.srOnly}>Custom brand colour, hex</label>
              <input id={`${id}-hex`} className={s.input} placeholder="#1D4ED8" value={hex} onChange={e => setHex(e.target.value.trim())} maxLength={7} aria-invalid={hex !== '' && !isHex(hex)} />
              <button type="submit" className={s.btnQuiet} disabled={!isHex(hex)}>Use hex</button>
            </form>
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
            <div className={s.miniPreview} style={preview.css as CSSProperties}>
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
    </>
  )
}

