'use client'

import { Fragment, useId, useState } from 'react'
import { DETAIL, QUEUES, ROWS, TOGGLE_CARD, fill } from './data'
import { Letter } from './Letter'
import { Glyph, QueuePicker, ResetButton, Steps, useActions, useShared } from './Ui'
import s from './docsort.module.css'

const STEPS = ['Open', 'Fill a red cell', 'Complete']
const COLS = ['IngestionDate', 'Sender', 'Status', 'Document Category', 'Queue']
type RowState = { status: 'Available' | 'Locked' | 'Done'; queue: string }

const initialRows = () => Object.fromEntries(ROWS.map(r => [r.id, { status: r.status, queue: r.queue } as RowState]))
const initialCells = () => DETAIL.rows.map(r => [...r])

export function FridayDemo() {
  const shared = useShared()
  const { say, complete } = useActions()
  const [rows, setRows] = useState<Record<string, RowState>>(initialRows)
  const [open, setOpen] = useState<string | null>(null)
  const [lockedMsg, setLockedMsg] = useState<string | null>(null)
  const [cells, setCells] = useState(initialCells)
  const [cleared, setCleared] = useState(0)
  const [view, setView] = useState<'outline' | 'thumbs'>('outline')
  const [outlineOpen, setOutlineOpen] = useState(false)
  const [docType, setDocType] = useState(TOGGLE_CARD.l2)
  const [lob, setLob] = useState(() => DETAIL.lobs[0])
  const [opened, setOpened] = useState(false)
  const ids = { type: useId(), lob: useId(), red: useId(), outline: useId(), only: useId() }

  const sig = ROWS.find(r => r.signature)!
  const sigState = rows[sig.id]
  const doneRow = sigState.status === 'Done' || sigState.queue !== sig.queue
  const step = !opened ? 0 : cleared === 0 ? 1 : doneRow ? 3 : 2
  const changed = opened || !!lockedMsg
  const types = [...new Set(shared.tree.flatMap(c => c.l2).concat(TOGGLE_CARD.l2))]
  const isRed = (r: number, c: number) => DETAIL.redCells.some(([a, b]) => a === r && b === c) && !cells[r][c].trim()

  const openRow = (id: string) => {
    if (rows[id].status === 'Locked' && open !== id) { setLockedMsg(id); say(fill('friLocked')); return }
    setLockedMsg(null)
    if (open === id) return
    setOpen(id); setOpened(true)
    setRows(p => ({ ...p, [id]: { ...p[id], status: 'Locked' } }))
    say(fill('friOpened'))
  }
  const finish = (patch: Partial<RowState>, msg: string) => {
    if (!open) return
    const id = open
    setRows(p => ({ ...p, [id]: { ...p[id], status: 'Done', ...patch } }))
    setOpen(null)
    if (id === sig.id) complete('fri')
    say(msg)
    requestAnimationFrame(() => (document.getElementById(`fri-open-${id}`) ?? document.getElementById('fri-reset'))?.focus())
  }
  const reset = () => {
    setRows(initialRows()); setOpen(null); setLockedMsg(null); setCells(initialCells()); setCleared(0)
    setView('outline'); setDocType(TOGGLE_CARD.l2); setLob(DETAIL.lobs[0]); setOpened(false)
    say(fill('reset'))
  }

  return (
    <div className={s.demo} data-demo-day="fri">
      <Steps names={STEPS} current={step} label="Friday steps" />
      <p className={s.listTitle}>Document list</p>
      <span id={ids.only} className={s.srOnly}>{fill('friOnly')}</span>
      <table className={s.qTable}>
        <thead>
          <tr>{COLS.map(c => <th key={c} scope="col">{c}</th>)}<th scope="col"><span className={s.srOnly}>Open</span></th></tr>
        </thead>
        <tbody>
          {ROWS.map(r => {
            const st = rows[r.id]
            const mine = open === r.id
            const statusText = mine ? 'Locked · you' : st.status
            return (
              <Fragment key={r.id}>
                <tr className={s.qRow} data-open={mine || undefined} data-sig={r.signature || undefined}>
                  <td data-label={COLS[0]} className={s.mono}>{r.date}</td>
                  <td data-label={COLS[1]}>{r.sender}</td>
                  <td data-label={COLS[2]}>
                    <span className={s.qStatus} data-status={mine ? 'mine' : st.status}>
                      {st.status === 'Done' && <Glyph k="check" />}{statusText}
                    </span>
                  </td>
                  <td data-label={COLS[3]}>{r.category}</td>
                  <td data-label={COLS[4]}>{st.queue}</td>
                  <td className={s.qOpenCell}>
                    {st.status !== 'Done' && (
                      <button
                        id={`fri-open-${r.id}`}
                        type="button"
                        className={s.eye}
                        aria-expanded={r.signature ? mine : undefined}
                        aria-label={`Open, ${r.date}, ${r.sender}`}
                        aria-disabled={!r.signature && r.status !== 'Locked' ? true : undefined}
                        aria-describedby={!r.signature && r.status !== 'Locked' ? ids.only : undefined}
                        onClick={() => (r.signature || r.status === 'Locked' ? openRow(r.id) : say(fill('friOnly')))}
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                      </button>
                    )}
                  </td>
                </tr>
                {lockedMsg === r.id && (
                  <tr className={s.qMsgRow}><td colSpan={6}><p className={s.qMsg}>{fill('friLocked')}</p></td></tr>
                )}
                {mine && (
                  <tr className={s.qExpandRow}>
                    <td colSpan={6}>
                      <div className={s.detail}>
                        <div className={s.detailBar}>
                          <QueuePicker queues={QUEUES} current={st.queue} onPick={q => finish({ queue: q, status: 'Available' }, fill('friSent', { queue: q }))} />
                          <button type="button" className={s.btnPrimary} onClick={() => finish({}, fill('friDone'))}>Complete</button>
                        </div>
                        <div className={s.panes}>
                          <div className={s.paneFields}>
                            <div className={s.fieldRow}>
                              <div className={s.field}>
                                <label htmlFor={ids.type} className={s.fieldLabel}>Document type</label>
                                <select id={ids.type} className={s.select} value={docType} onChange={e => setDocType(e.target.value)}>
                                  {types.map(t => <option key={t}>{t}</option>)}
                                </select>
                              </div>
                              <div className={s.field}>
                                <label htmlFor={ids.lob} className={s.fieldLabel}>Line of business</label>
                                <select id={ids.lob} className={s.select} value={lob} onChange={e => setLob(e.target.value)}>
                                  {DETAIL.lobs.map(t => <option key={t}>{t}</option>)}
                                </select>
                              </div>
                            </div>
                            <p className={s.paneHead}>DataPoints</p>
                            <dl className={s.points}>
                              {DETAIL.datapoints.map(d => <div key={d.field}><dt>{d.field}</dt><dd className={s.mono}>{d.value}</dd></div>)}
                            </dl>
                            <p className={s.paneHead}>Tables</p>
                            <span id={ids.red} className={s.srOnly}>Marked in red</span>
                            <div className={s.cellTableWrap}>
                              <table className={s.cellTable}>
                                <thead><tr>{DETAIL.columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
                                <tbody>
                                  {cells.map((row, ri) => (
                                    <tr key={ri}>
                                      {row.map((v, ci) => {
                                        const red = isRed(ri, ci)
                                        return (
                                          <td key={ci} data-red={red || undefined}>
                                            <input
                                              className={s.cell}
                                              value={v}
                                              aria-label={`${DETAIL.columns[ci]}, row ${ri + 1}`}
                                              aria-describedby={red ? ids.red : undefined}
                                              onChange={e => {
                                                const val = e.target.value
                                                const wasRed = red
                                                setCells(p => p.map((rr, a) => (a !== ri ? rr : rr.map((cc, b) => (b === ci ? val : cc)))))
                                                if (wasRed && val.trim()) { setCleared(c => c + 1); say(fill('friFilled')) }
                                              }}
                                            />
                                            {red && <span className={s.warn} aria-hidden="true"><Glyph k="warn" /></span>}
                                          </td>
                                        )
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <button type="button" className={s.btnText} onClick={() => setCells(p => [...p, DETAIL.columns.map(() => '')])}>+ Add row</button>
                          </div>
                          <div className={s.paneOutline} data-open={outlineOpen || undefined}>
                            <button type="button" className={s.outlineToggle} aria-expanded={outlineOpen} aria-controls={ids.outline} onClick={() => setOutlineOpen(o => !o)}>
                              Page outline
                            </button>
                            <div id={ids.outline} className={s.outlineBody}>
                              <div className={s.segSmall} role="group" aria-label="Page view">
                                <button type="button" aria-pressed={view === 'outline'} onClick={() => setView('outline')}>Outline view</button>
                                <button type="button" aria-pressed={view === 'thumbs'} onClick={() => setView('thumbs')}>Thumbnails</button>
                              </div>
                              <div className={s.outlineViewport}>
                                <div className={s.outlineTrack} data-thumbs={view === 'thumbs' || undefined}>
                                  <ul className={s.outline} aria-hidden={view !== 'outline'}>
                                    <li>{DETAIL.outline.group}
                                      <ul><li>{DETAIL.outline.doc}
                                        <ul>{DETAIL.outline.pages.map(p => <li key={p}>{p}</li>)}</ul>
                                      </li></ul>
                                    </li>
                                  </ul>
                                  <ul className={s.thumbs} aria-hidden={view !== 'thumbs'}>
                                    {DETAIL.outline.pages.map(p => <li key={p}><span className={s.thumb} />{p}</li>)}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={s.paneViewer}>
                            <Letter label={r.category} accent={!!r.signature} />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
      <div className={s.controls}>
        <ResetButton id="fri-reset" show={changed} onReset={reset} />
      </div>
    </div>
  )
}
