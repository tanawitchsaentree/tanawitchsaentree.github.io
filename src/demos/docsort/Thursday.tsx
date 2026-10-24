'use client'

import { useId, useRef, useState } from 'react'
import { fill } from './data'
import { initialVersions, type Version } from './state'
import { ResetButton, Steps, useActions } from './Ui'
import s from './docsort.module.css'

const STEPS = ['Approve', 'Deploy']
const SUBJECT = 6

export function ThursdayDemo() {
  const { say, complete } = useActions()
  const [versions, setVersions] = useState<Version[]>(initialVersions)
  const list = useRef<HTMLUListElement>(null)
  const ids = { deployOff: useId(), live: useId() }
  const v6 = versions.find(v => v.n === SUBJECT)!
  const approved = v6.status !== 'Draft'
  const deployed = v6.status === 'Deployed'
  const step = !approved ? 0 : !deployed ? 1 : 2
  const changed = approved || versions.length !== initialVersions().length

  const approve = () => {
    if (approved) return
    setVersions(p => p.map(v => (v.n === SUBJECT ? { ...v, status: 'Approved' } : v)))
    say(fill('thuApproved', { n: SUBJECT }))
  }
  const deploy = () => {
    if (!approved) { say(fill('thuDeployOff')); return }
    if (deployed) return
    const prev = versions.find(v => v.active)!
    setVersions(p => p.map(v => (v.n === SUBJECT ? { ...v, status: 'Deployed', active: true } : v.active ? { ...v, status: 'Approved', active: false } : v)))
    complete('thu')
    say(fill('thuDeployed', { n: SUBJECT, prev: prev.n }))
  }
  const remove = (n: number) => {
    const i = versions.findIndex(v => v.n === n)
    setVersions(p => p.filter(v => v.n !== n))
    say(fill('thuDeleted', { n }))
    // Keep focus in the list: the next row's Delete, else the list itself.
    requestAnimationFrame(() => {
      const btns = list.current?.querySelectorAll<HTMLButtonElement>('[data-del]')
      const next = btns?.[Math.min(i - 2, (btns?.length ?? 1) - 1)] ?? btns?.[0]
      ;(next ?? list.current)?.focus()
    })
  }
  const deletable = (v: Version) => !v.active && v.status === 'Draft' && v.n !== SUBJECT && versions.length > 1

  return (
    <div className={s.demo} data-demo-day="thu">
      <Steps names={STEPS} current={step} label="Thursday steps" />
      <p className={s.listTitle}>Model versions</p>
      <ul ref={list} className={s.versions} tabIndex={-1} aria-label="Model versions">
        {versions.map(v => (
          <li key={v.n} className={s.version} data-subject={v.n === SUBJECT || undefined}>
            <span className={s.vName}>Version {v.n}</span>
            <span key={v.status} className={s.pill} data-status={v.status}>{v.status}</span>
            <span className={s.vMeta}>
              {v.active && (
                <span className={s.activeTag}>
                  Active version
                  <button type="button" className={s.info} aria-describedby={ids.live} aria-label="Why there is no Delete">i</button>
                  <span id={ids.live} role="tooltip" className={s.tip}>{fill('thuLive')}</span>
                </span>
              )}
            </span>
            {deletable(v) ? (
              <button type="button" className={s.btnText} data-del aria-label={`Delete Version ${v.n}`} onClick={() => remove(v.n)}>Delete</button>
            ) : <span />}
          </li>
        ))}
      </ul>
      <div className={s.controls}>
        <span className={s.mono}>Version {SUBJECT}</span>
        <button type="button" className={!approved ? s.btnPrimary : s.btnSecondary} aria-disabled={approved || undefined} onClick={approve}>Approve</button>
        <button
          type="button"
          className={approved && !deployed ? s.btnPrimary : s.btnSecondary}
          aria-disabled={!approved || deployed || undefined}
          aria-describedby={!approved ? ids.deployOff : undefined}
          onClick={deploy}
        >
          Deploy
        </button>
        {!approved && <span id={ids.deployOff} className={s.hint}>{fill('thuDeployOff')}</span>}
        <ResetButton show={changed} onReset={() => { setVersions(initialVersions()); say(fill('reset')) }} />
      </div>
    </div>
  )
}
