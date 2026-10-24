'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ARCHETYPES, DOCTOR, PATIENTS, TEXT } from './data'
import type { Store } from './useInvitrace'
import s from './invitrace.module.css'

const RISK: Record<string, string> = { High: 'var(--ix-critical)', Medium: 'var(--ix-warning)', Low: 'var(--ix-ok)' }

/** The ward console: every shared component, rendered from the resolved token tiers. */
export function Console({ st }: { st: Store }) {
  const { hospital, resolved, gov, edge, shortcut, presetObj } = st
  const win = useRef<HTMLDivElement>(null)
  const end = useRef<HTMLDivElement>(null)
  // While the end of the console is out of its window, show a hint to scroll inside it.
  const [more, setMore] = useState(false)
  useEffect(() => {
    const w = win.current, e = end.current
    if (!w || !e) return
    const io = new IntersectionObserver(([x]) => setMore(!x.isIntersecting), { root: w })
    io.observe(e)
    return () => io.disconnect()
  }, [])
  const latest = st.log[0]
  // The console renders 1:1 in a scrollable window. After each action, bring the region it
  // touched into view: one offsetTop read per action, never per frame.
  useEffect(() => {
    const w = win.current, region = latest?.region
    if (!w || !region) return
    const el = w.querySelector<HTMLElement>(`[data-ix-region="${region}"]`)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    w.scrollTo({ top: Math.max(0, el.offsetTop - 8), behavior: reduced ? 'auto' : 'smooth' })
  }, [latest?.n, latest?.region])
  const comp = resolved.component
  const rows = edge === 'empty' ? [] : PATIENTS.map((p, i) => (edge === 'long' && i === 0 ? { ...p, name: TEXT.LONG_NAME } : p))
  return (
    // A scrollable region must be reachable by keyboard (WCAG 2.1.1, axe scrollable-region-focusable).
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div ref={win} className={s.consoleWindow} style={resolved.css as CSSProperties} tabIndex={0} role="region" aria-label="Ward console preview. Scroll inside it to see every part.">
    <div className={s.console} data-density={resolved.theme['brand.density']} data-shortcut={shortcut || undefined}>
      {/* key: a hospital switch wipes the body in (clip-path), so the change reads as one event */}
      <div key={hospital.id} className={s.consoleBody}>
        <div className={s.cHead} data-ix-region="header">
          <span className={s.cStripe} aria-hidden="true" />
          <div>
            <div className={s.cName}>{hospital.name}</div>
            <div className={s.cMeta}>Ward 4 · {ARCHETYPES[hospital.archetype].label} rules{presetObj ? ` · ${presetObj.label}` : ''}</div>
          </div>
        </div>

        <div className={s.cAlert} data-ix-region="alert"><span aria-hidden="true">!</span> {TEXT.ALERT}</div>

        <div className={s.cActions} data-ix-region="actions">
          <span className={s.cBtn} data-icon={comp['button.label'] === 'icon-only' || undefined}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            <span className={comp['button.label'] === 'icon-only' ? s.srOnly : undefined}>Admit patient</span>
          </span>
          <span className={s.cTarget}>{comp['button.minHeight']} target</span>
        </div>

        <div className={s.cField} data-ix-region="field" data-float={comp['field.label'] === 'floating' || undefined}>
          <span className={s.cLabel}>Patient ID</span>
          <span className={s.cInput}>{comp['field.label'] === 'floating' ? 'HN 2025-0418' : ''}</span>
          <span className={s.cError}><span aria-hidden="true">✕</span> Enter the full hospital number.</span>
        </div>

        <div className={s.cTable} role="table" aria-label="Sample admissions" data-ix-region="table">
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

        <div className={s.cDoctor} data-layout={hospital.layout} data-ix-region="doctor">
          {hospital.layout === 'hero' ? (
            <>
              <span className={s.cHeroTag}>HeroDoctorCard</span>
              <div className={s.cDocName}>{DOCTOR.name}</div>
              <div className={s.cDocMeta}>{DOCTOR.role} · <span className={s.cLive}>On call now</span></div>
              <span className={s.cDocAction}>{DOCTOR.action}</span>
            </>
          ) : (
            <>
              <span className={s.cAvatar} aria-hidden="true">SW</span>
              <div className={s.cDocText}>
                <div className={s.cDocName}>{DOCTOR.name}</div>
                <div className={s.cDocMeta}>{DOCTOR.role} · {DOCTOR.where}</div>
              </div>
              <span className={s.cDocAction}>{DOCTOR.action}</span>
            </>
          )}
        </div>
        {shortcut && <div className={s.cBroken}>! Focus ring missing on the patient rows. The shortcut layer handles Tab before the component does.</div>}
        <div className={s.cGov} aria-hidden="true">{gov.desktopFlag ? 'Screen marked desktop-locked' : ''}</div>
      </div>
      <div ref={end} className={s.cEnd} aria-hidden="true" />
    </div>
    {more && <div className={s.cScrollHint} aria-hidden="true">Scroll inside the console for more ↓</div>}
    </div>
  )
}
