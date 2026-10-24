'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { DIALOGS, TOGGLE_CARD, TREE, fill } from './data'
import { TG, TOKEN, cardMidY, headLines, hierarchyLines, lineMidY } from './state'
import { Glyph, ResetButton, Steps, useActions, useShared } from './Ui'
import s from './docsort.module.css'

const STEPS = ['Add the document type', 'Watch the prompt', 'Delete the placeholder']

export function TuesdayDemo() {
  const shared = useShared()
  const { setShared, say, complete, jump } = useActions()
  const [preview, setPreview] = useState(true)
  const [previewed, setPreviewed] = useState(false)
  const [deletedOnce, setDeletedOnce] = useState(false)
  const [modal, setModal] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState(false)
  const [fresh, setFresh] = useState<{ l2: string; n: number } | null>(null)
  const [shake, setShake] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const addBtn = useRef<HTMLButtonElement>(null)
  const ids = { name: useId(), err: useId(), title: useId(), blocked: useId() }

  const property = shared.tree.find(c => c.name === TOGGLE_CARD.l1)!
  const added = property.l2.length > 0
  const step = !added ? 0 : !(previewed || deletedOnce) ? 1 : !deletedOnce ? 2 : 3
  const changed = added || !shared.placeholder || !preview

  useEffect(() => { if (step === 3) complete('tue') }, [step, complete])

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (modal && !d.open) d.showModal()
    // Closing restores focus natively, which forces a style pass: give it its own frame.
    if (!modal && d.open) requestAnimationFrame(() => d.open && d.close())
  }, [modal])

  const openModal = () => { setName(TOGGLE_CARD.l2); setError(false); setModal(true) }
  // Focus returns on the next frame, so the dialog leaving the top layer and React's render
  // don't share one task with a forced style recalc.
  const closeModal = () => { setModal(false); requestAnimationFrame(() => requestAnimationFrame(() => addBtn.current?.focus())) }
  const add = () => {
    const n = name.trim()
    if (!n) return
    if (property.l2.some(t => t.toLowerCase() === n.toLowerCase())) { setError(true); return }
    setShared(p => ({ ...p, tree: p.tree.map(c => (c.name === TOGGLE_CARD.l1 ? { ...c, l2: [...c.l2, n] } : c)) }))
    setFresh(f => ({ l2: n, n: (f?.n ?? 0) + 1 }))
    say(fill('tueAdded', { l1: TOGGLE_CARD.l1, l2: n }))
    closeModal()
  }
  const togglePlaceholder = () => {
    const next = !shared.placeholder
    setShared(p => ({ ...p, placeholder: next }))
    say(fill(next ? 'tueRestored' : 'tueDeleted'))
    if (!next) setDeletedOnce(true)
  }
  const test = () => {
    if (!shared.placeholder) { setShake(k => k + 1); say(fill('blocked')); return }
    say(fill('tueTestOk'))
    jump('wed')
  }
  const reset = () => {
    setShared(p => ({ ...p, tree: p.tree.map(c => (c.name === TOGGLE_CARD.l1 ? { ...c, l2: [...(TREE.l1.find(x => x.name === c.name)?.l2 ?? [])] } : c)), placeholder: true }))
    setPreview(true); setFresh(null); setPreviewed(false); setDeletedOnce(false)
    say(fill('reset'))
  }

  const head = headLines()
  const hier = hierarchyLines(shared.tree)
  const freshKey = fresh && `t:${TOGGLE_CARD.l1}>${fresh.l2}`
  const showConnector = !!fresh && preview && shared.placeholder && property.l2.includes(fresh.l2)
  let x1 = TG.treeW, y1 = 0, x2 = TG.treeW + TG.gap + TG.sheetPad, y2 = 0
  if (showConnector) { y1 = cardMidY(shared.tree, TOGGLE_CARD.l1, fresh.l2); y2 = lineMidY(shared.tree, freshKey!) }
  x1 -= 6; x2 -= 4

  return (
    <div className={s.demo} data-demo-day="tue">
      <Steps names={STEPS} current={step} label="Tuesday steps" />
      <div className={s.tStage}>
        <div className={s.tTree}>
          <p className={s.tL0}><span className={s.lvl}>L0</span>{TREE.l0}</p>
          {shared.tree.map(c => (
            <div key={c.name} className={s.tCard}>
              <p className={s.tL1}><span className={s.lvl}>L1</span>{c.name}</p>
              {c.l2.map(t => (
                <p key={t} className={s.tL2} data-fresh={fresh && c.name === TOGGLE_CARD.l1 && t === fresh.l2 ? fresh.n : undefined}>
                  <span className={s.lvl}>L2</span>{t}
                </p>
              ))}
              {c.name === TOGGLE_CARD.l1 && (
                <button ref={addBtn} type="button" className={s.tAdd} onClick={openModal} aria-haspopup="dialog">+ Add Type</button>
              )}
            </div>
          ))}
        </div>
        <div className={s.tSheet}>
          <div className={s.tSheetHead}>
            <span className={s.badge} data-bad={!shared.placeholder || undefined}>
              <Glyph key={String(shared.placeholder)} k={shared.placeholder ? 'check' : 'cross'} /> {shared.placeholder ? 'Placeholder detected' : 'Placeholder missing'}
            </span>
            <button
              type="button"
              className={s.btnQuiet}
              aria-pressed={preview}
              onClick={() => { setPreview(p => !p); setPreviewed(true); say(fill(preview ? 'tuePreviewOff' : 'tuePreviewOn')) }}
            >
              Preview
            </button>
          </div>
          <div className={s.tViewport}>
            <div className={s.tTrack} data-preview={preview || undefined}>
              <div className={s.tPane} aria-hidden={preview} data-pane="template">
                <p className={s.paneCap}>Template</p>
                {head.map(l => <p key={l.key} className={s.pLine}>{l.text}</p>)}
                {shared.placeholder ? <p className={`${s.pLine} ${s.pToken}`}>{TOKEN}</p> : <p className={`${s.pLine} ${s.pGone}`} aria-hidden="true" />}
              </div>
              <div className={s.tPane} aria-hidden={!preview} data-pane="preview">
                <p className={s.paneCap}>Preview</p>
                {head.map(l => <p key={l.key} className={s.pLine}>{l.text}</p>)}
                <div className={s.pBlock} data-collapsed={!shared.placeholder || undefined}>
                  {hier.map(l => (
                    <p key={l.key + (l.key === freshKey ? fresh!.n : '')} className={s.pLine} data-fresh={l.key === freshKey || undefined}>{l.text}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={s.sheetFoot}>
            <button type="button" className={s.btnSecondary} onClick={togglePlaceholder}>
              {shared.placeholder ? 'Delete placeholder line' : 'Restore placeholder'}
            </button>
            <button
              key={shake}
              type="button"
              className={s.btnPrimary}
              data-shake={shake > 0 || undefined}
              aria-disabled={!shared.placeholder || undefined}
              aria-describedby={!shared.placeholder ? ids.blocked : undefined}
              onClick={test}
            >
              Test Prompt
            </button>
            {!shared.placeholder && <span id={ids.blocked} className={s.hint}>{fill('blocked')}</span>}
          </div>
        </div>
        {showConnector && (
          <svg key={fresh.n} className={s.connector} aria-hidden="true" width={x2 + 8} height={Math.max(y1, y2) + 8}>
            <path d={`M ${x1} ${y1} C ${x1 + 18} ${y1}, ${x2 - 18} ${y2}, ${x2} ${y2}`} pathLength={1} />
            <circle cx={x1} cy={y1} r={2.5} />
          </svg>
        )}
      </div>
      <div className={s.controls}>
        <ResetButton show={changed} onReset={reset} />
      </div>

      <dialog
        ref={dialog}
        className={s.modal}
        aria-labelledby={ids.title}
        onClose={() => { if (modal) closeModal() }}
        onCancel={e => { e.preventDefault(); closeModal() }}
      >
        <form method="dialog" className={s.modalBody} onSubmit={e => { e.preventDefault(); add() }}>
          <p id={ids.title} className={s.modalTitle}>{DIALOGS.addType.title}</p>
          <label htmlFor={ids.name} className={s.fieldLabel}>Document type name</label>
          <input
            id={ids.name}
            className={s.input}
            value={name}
            autoComplete="off"
            aria-invalid={error || undefined}
            aria-describedby={error ? ids.err : undefined}
            onChange={e => { setName(e.target.value); setError(false) }}
          />
          {error && <p id={ids.err} className={s.error} role="alert"><Glyph k="warn" /> {DIALOGS.addType.error}</p>}
          <div className={s.modalFoot}>
            <button type="button" className={s.btnSecondary} onClick={closeModal}>Cancel</button>
            <button type="submit" className={s.btnPrimary} aria-disabled={!name.trim() || undefined}>Add</button>
          </div>
        </form>
      </dialog>
    </div>
  )
}
