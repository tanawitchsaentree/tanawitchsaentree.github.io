'use client'

import { useEffect, useId, useState, type ReactNode } from 'react'
import { COSTS, DIALOGS, TREE, TREES } from './data'
import { Glyph, useActions } from './Ui'
import s from './docsort.module.css'

/** Notes 02: three teams' trees side by side, drawn on ruled lines. */
export function ThreeTrees() {
  return (
    <div className={s.trees}>
      {TREES.map(t => (
        <figure key={t.l0} className={s.miniTree}>
          <figcaption className={s.miniL0}>{t.l0}</figcaption>
          <ul>
            {t.l1.map(c => (
              <li key={c.name}>
                <span className={s.miniL1}>{c.name}</span>
                {c.l2.length > 0 && <ul>{c.l2.map(d => <li key={d} className={s.miniL2}>{d}</li>)}</ul>}
              </li>
            ))}
          </ul>
          {t.note && <p className={s.miniNote}>{t.note}</p>}
        </figure>
      ))}
    </div>
  )
}

function Cost({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className={s.costRow}>
      <button type="button" className={s.costBtn} aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        <span>What it costs</span><span aria-hidden="true" className={s.drawerGlyph} data-open={open || undefined}>+</span>
      </button>
      <p id={id} className={s.costText} hidden={!open}>{open && <span className={s.costReveal}>{text}</span>}</p>
    </div>
  )
}

/** The toast is drawn in place; the page's one live region reads it out. */
function Toast({ text }: { text: string }) {
  const { say } = useActions()
  useEffect(() => { say(text) }, [say, text])
  return <p className={s.toast}><Glyph k="check" /> {text}</p>
}

/** A miniature of the real dialog: sits on the notes page, the only raised sheet in its column. */
function Mini({ label, children }: { label: string; children: ReactNode }) {
  return <div className={s.mini} role="group" aria-label={label}>{children}</div>
}

function CreateCard() {
  const d = DIALOGS.create
  const [st, setSt] = useState<'form' | 'confirm' | 'done' | 'closed'>('form')
  const [name, setName] = useState(d.field)
  const id = useId()
  return (
    <div className={s.costCard}>
      <p className={s.costName}>Create</p>
      {st === 'closed' && <button type="button" className={s.btnSecondary} onClick={() => setSt('form')}>Add class</button>}
      {st === 'form' && (
        <Mini label={d.title}>
          <p className={s.miniTitle}>{d.title}</p>
          <p className={s.miniSub}>{d.sub}</p>
          <label htmlFor={id} className={s.fieldLabel}>Class name</label>
          <input id={id} className={s.input} value={name} onChange={e => setName(e.target.value)} />
          <p className={s.miniBanner}>{d.banner}</p>
          <div className={s.modalFoot}>
            <button type="button" className={s.btnSecondary} onClick={() => setSt('closed')}>Cancel</button>
            <button type="button" className={s.btnPrimary} aria-disabled={!name.trim() || undefined} onClick={() => name.trim() && setSt('confirm')}>Create</button>
          </div>
        </Mini>
      )}
      {st === 'confirm' && (
        <Mini label={d.title}>
          <p className={s.miniText}>{d.confirm}</p>
          <p className={s.miniText}>{d.ask}</p>
          <div className={s.modalFoot}>
            <button type="button" className={s.btnSecondary} onClick={() => setSt('form')}>Cancel</button>
            <button type="button" className={s.btnPrimary} onClick={() => setSt('done')}>Create</button>
          </div>
        </Mini>
      )}
      {st === 'done' && <><Toast text={d.toast} /><button type="button" className={s.btnText} onClick={() => { setName(d.field); setSt('form') }}>Reset</button></>}
      <Cost text={COSTS.create} />
    </div>
  )
}

function DeleteCard() {
  const d = DIALOGS.delete
  const [st, setSt] = useState<'confirm' | 'done' | 'closed'>('confirm')
  const cat = TREE.l1[TREE.l1.length - 1].name
  return (
    <div className={s.costCard}>
      <p className={s.costName}>Delete</p>
      {st === 'closed' && <button type="button" className={s.btnSecondary} onClick={() => setSt('confirm')}>Delete {cat}</button>}
      {st === 'confirm' && (
        <Mini label={`Delete ${cat}`}>
          <p className={s.miniText}>{d.confirm}</p>
          <p className={s.miniText}>{d.ask}</p>
          <div className={s.modalFoot}>
            <button type="button" className={s.btnSecondary} onClick={() => setSt('closed')}>Cancel</button>
            <button type="button" className={s.btnDanger} onClick={() => setSt('done')}>Delete</button>
          </div>
        </Mini>
      )}
      {st === 'done' && <><Toast text={d.toast} /><button type="button" className={s.btnText} onClick={() => setSt('confirm')}>Reset</button></>}
      <Cost text={COSTS.delete} />
    </div>
  )
}

function RenameCard() {
  const d = DIALOGS.rename
  const [st, setSt] = useState<'form' | 'done' | 'closed'>('form')
  const [name, setName] = useState(d.value)
  const ids = { f: useId(), e: useId() }
  const taken = TREE.l1.some(c => c.name !== d.from && c.name.toLowerCase() === name.trim().toLowerCase())
  return (
    <div className={s.costCard}>
      <p className={s.costName}>Rename</p>
      {st === 'closed' && <button type="button" className={s.btnSecondary} onClick={() => setSt('form')}>{d.title}</button>}
      {st === 'form' && (
        <Mini label={d.title}>
          <p className={s.miniTitle}>{d.title}</p>
          <p className={s.miniSub}>{d.sub}</p>
          <label htmlFor={ids.f} className={s.fieldLabel}>Class name</label>
          <input id={ids.f} className={s.input} value={name} aria-invalid={taken || undefined} aria-describedby={taken ? ids.e : undefined} onChange={e => setName(e.target.value)} />
          {taken && <p id={ids.e} className={s.error}><Glyph k="warn" /> {d.error}</p>}
          <div className={s.modalFoot}>
            <button type="button" className={s.btnSecondary} onClick={() => setSt('closed')}>Cancel</button>
            <button type="button" className={s.btnPrimary} aria-disabled={taken || !name.trim() || undefined} onClick={() => !taken && name.trim() && setSt('done')}>Save</button>
          </div>
        </Mini>
      )}
      {st === 'done' && <><Toast text={d.toast} /><button type="button" className={s.btnText} onClick={() => { setName(d.value); setSt('form') }}>Reset</button></>}
      <Cost text={COSTS.rename} />
    </div>
  )
}

/** Notes 04: create and delete confirm, rename only checks the name. */
export function CostCards() {
  return (
    <div className={s.costs}>
      <CreateCard />
      <DeleteCard />
      <RenameCard />
    </div>
  )
}
