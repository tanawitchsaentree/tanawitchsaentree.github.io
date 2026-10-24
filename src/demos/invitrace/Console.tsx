'use client'

import { memo, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { ARCHETYPES, DOCTOR, PATIENTS, TEXT } from './data'
import { IconAlert, IconErr, IconPlus } from './Icons'
import { GOV_DEFAULT, resolve, type Gov, type Hospital, type Preset } from './model'
import type { Edge, Store } from './useInvitrace'
import s from './invitrace.module.css'

const RISK: Record<string, string> = { High: 'var(--ix-critical)', Medium: 'var(--ix-warning)', Low: 'var(--ix-ok)' }
export type Region = 'full' | 'header' | 'actions' | 'field' | 'table' | 'doctor'

type Props = {
  hospital: Hospital; preset: Preset | null; gov: Gov; edge: Edge; fieldError: boolean
  region: Region; shortcut?: boolean; showTarget?: boolean; label?: string
}

/** A slice of the ward console for any hospital, rendered from its own resolved tiers. The
    story places slices next to the prose; each one is a single surface with no inner boxes. */
export const ConsoleSlice = memo(function ConsoleSlice({ hospital, preset, gov, edge, fieldError, region, shortcut, showTarget, label }: Props) {
  const resolved = resolve(hospital, preset, gov)
  const comp = resolved.component
  const root = useRef<HTMLDivElement>(null)
  const show = (r: Exclude<Region, 'full'>) => region === 'full' || region === r
  const rows = edge === 'empty' ? [] : PATIENTS.map((p, i) => (edge === 'long' && i === 0 ? { ...p, name: TEXT.LONG_NAME } : p))
  // Doctor card layout changes morph with FLIP (transform only), measured on the layout change only.
  const prev = useRef<Record<string, DOMRect>>({})
  useLayoutEffect(() => {
    const el = root.current; if (!el || !show('doctor')) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const next: Record<string, DOMRect> = {}
    el.querySelectorAll<HTMLElement>('[data-flip]').forEach(n => {
      const r = n.getBoundingClientRect(), k = n.dataset.flip!, p = prev.current[k]
      next[k] = r
      if (p && !reduced && (p.left !== r.left || p.top !== r.top)) n.animate([{ transform: `translate(${p.left - r.left}px, ${p.top - r.top}px)` }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' })
    })
    prev.current = next
  }, [hospital.layout]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={root} className={s.slice} data-region={region} style={resolved.css as CSSProperties} role="group" aria-label={label ?? `${hospital.name} console`}>
      <div className={s.console} data-density={resolved.theme['brand.density']} data-dark={preset?.surface === 'dark' || undefined} data-shortcut={shortcut || undefined}>
        <div className={s.consoleBody}>
          {show('header') && (
            <div className={s.cHead} data-ix-region="header">
              <span className={s.cStripe} aria-hidden="true" />
              <div>
                <div className={s.cName}>{hospital.name}</div>
                <div className={s.cMeta}>Ward 4 · {ARCHETYPES[hospital.archetype].label} rules{preset ? ` · ${preset.label}` : ''}</div>
              </div>
            </div>
          )}
          {region === 'full' && <div className={s.cAlert} data-ix-region="alert"><span className={s.cAlertIcon}><IconAlert size={16} /></span><span>{TEXT.ALERT}</span></div>}
          {show('actions') && (
            <div className={s.cActions} data-ix-region="actions">
              <span className={s.cBtn} data-icon={comp['button.label'] === 'icon-only' || undefined}>
                <IconPlus size={14} />
                <span className={comp['button.label'] === 'icon-only' ? s.srOnly : undefined}>Admit patient</span>
              </span>
              <span className={s.cBtn2}>Transfer</span>
              {(showTarget ?? true) && <span className={s.cTarget}>{comp['button.minHeight']} target</span>}
            </div>
          )}
          {show('field') && (
            <div className={s.cField} data-ix-region="field" data-float={comp['field.label'] === 'floating' || undefined} data-error={fieldError || undefined}>
              <span className={s.cLabel}>Patient ID</span>
              <span className={s.cInput}>{comp['field.label'] === 'floating' ? 'HN 2025-0418' : ''}</span>
              {fieldError && <span className={s.cError}><IconErr size={13} /> Enter the full hospital number.</span>}
            </div>
          )}
          {show('table') && (
            <div className={s.cTable} role="table" aria-label="Sample admissions" data-ix-region="table" data-nobed={comp['table.bedColumn'] === 'hidden-for-role' || undefined}>
              <div className={s.cRow} role="row" data-head>
                {comp['table.bedColumn'] !== 'hidden-for-role' && <span role="columnheader">Bed</span>}
                <span role="columnheader">Patient</span><span role="columnheader">Risk</span><span role="columnheader">Status</span>
              </div>
              {rows.length === 0 ? (
                <div className={s.cEmpty} role="row"><span role="cell">No admissions waiting. Every current patient has a bed.</span></div>
              ) : rows.map(p => (
                <div key={p.bed} className={s.cRow} role="row" tabIndex={0} data-ix-row>
                  {comp['table.bedColumn'] !== 'hidden-for-role' && <span role="cell" className={s.cMono}>{p.bed}</span>}
                  <span role="cell" className={s.cPatient}>{p.name}</span>
                  <span role="cell" className={s.cRisk}><i aria-hidden="true" style={{ background: RISK[p.risk] }} />{p.risk}</span>
                  <span role="cell" className={s.cStatus}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
          {show('table') && shortcut && <div className={s.cBroken}>! Focus ring missing on the patient rows. The shortcut layer handles Tab before the component does.</div>}
          {show('doctor') && (
            <div className={s.cDoctor} data-layout={hospital.layout} data-ix-region="doctor">
              {hospital.layout === 'hero' ? (
                <>
                  <span className={s.cHeroTag} data-flip="tag">HeroDoctorCard</span>
                  <div className={s.cDocName} data-flip="name">{DOCTOR.name}</div>
                  <div className={s.cDocMeta} data-flip="meta">{DOCTOR.role} · <span className={s.cLive}>On call now</span></div>
                  <span className={s.cDocAction} data-flip="action">{DOCTOR.action}</span>
                </>
              ) : (
                <>
                  <span className={s.cAvatar} aria-hidden="true" data-flip="avatar">SW</span>
                  <div className={s.cDocText} data-flip="name">
                    <div className={s.cDocName}>{DOCTOR.name}</div>
                    <div className={s.cDocMeta}>{DOCTOR.role} · {DOCTOR.where}</div>
                  </div>
                  <span className={s.cDocAction} data-flip="action">{DOCTOR.action}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

/** Convenience: a slice for a hospital in the store (the clinic by default). */
export function ConsoleView({ st, region, hospitalId, shortcut, showTarget, label }: { st: Store; region: Region; hospitalId?: string; shortcut?: boolean; showTarget?: boolean; label?: string }) {
  const h = (hospitalId && st.hospitals.find(x => x.id === hospitalId)) || st.hospital
  return <ConsoleSlice hospital={h} preset={st.presetObj} gov={st.govs[h.id] ?? GOV_DEFAULT} edge={st.edge} fieldError={h.id === st.hospital.id && st.fieldError}
    region={region} shortcut={shortcut} showTarget={showTarget} label={label} />
}
