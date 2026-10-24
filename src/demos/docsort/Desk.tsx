'use client'

import { useId, useRef, useState, type RefObject } from 'react'
import { COPY, FIELDS, QUEUES, QUEUE_DOCS, SAMPLES, SHAPES, SHAPE_ORDER, TOGGLE_CARD, type Shape } from './data'
import { G, layoutTree, leafOf, leaves, pendingVersion, promptLines, shownTree, type DeskState, type Row } from './state'
import s from './docsort.module.css'

export type DeskActions = {
  setShape: (sh: Shape) => void
  toggleCard: () => void
  togglePlaceholder: () => void
  toggleL2: () => void
  setExpected: (id: string, leaf: string) => void
  runTest: () => void
  /** Moment 2's Test: run the test and jump to moment 4 to watch it. */
  testFromPrompt: () => void
  approve: () => void
  deploy: () => void
  copyVersion: () => void
  deleteVersion: (n: number) => void
  renameL1: (from: string, to: string) => void
  deleteL1: (name: string) => void
  createL1: (name: string) => void
  openDoc: (id: string) => void
  sendDoc: (id: string, queue: string) => void
  completeDoc: (id: string) => void
}

export const hasToggleCard = (st: DeskState) => st.tree.some(c => c.name === TOGGLE_CARD.l1 && c.l2.includes(TOGGLE_CARD.l2))

/** Expected class for a sample in the current mode (L1 only when document types are off). */
export function expectedFor(st: DeskState, id: string) {
  const opts = leaves(st.tree, st.l2On)
  const want = st.expected[id] ?? SAMPLES.find(x => x.id === id)!.expected
  const mapped = st.l2On ? want : want.split(' > ')[0]
  if (opts.includes(mapped)) return mapped
  const l1 = mapped.split(' > ')[0]
  return opts.find(o => o === l1 || o.startsWith(`${l1} > `)) ?? opts[0]
}
export const predictedFor = (st: DeskState, sample: (typeof SAMPLES)[number]) =>
  'failed' in sample.result ? null : st.l2On ? sample.result.leaf : sample.result.leaf.split(' > ')[0]

export function Desk({ state, actions, connectorKey, testRef }: {
  state: DeskState; actions: DeskActions; connectorKey: number; testRef: RefObject<HTMLButtonElement>
}) {
  const m = state.active
  const tree = shownTree(state)
  const rows = m === 0 ? [] : layoutTree(tree, m >= 3 ? state.l2On : true)
  return (
    <div className={s.stage}>
      {m < 6 ? (
        <>
          <div className={s.treeArea}>
            {m === 1 && <ShapeSwitch value={state.shape} onChange={actions.setShape} />}
            {m === 0 && <div className={s.emptyTree}>Filing tree</div>}
            {rows.map(r => <Card key={r.key} row={r} />)}
            {m === 1 && tree.note && <div className={s.treeNote} style={{ transform: `translateY(${rows[rows.length - 1].y + 50}px)` }}>{tree.note}</div>}
            {m === 2 && (
              <button type="button" className={s.btn} style={{ transform: `translateY(${rows[rows.length - 1].y + rows[rows.length - 1].h + 14}px)` }} onClick={actions.toggleCard}>
                {hasToggleCard(state) ? `Remove “${TOGGLE_CARD.l2}”` : `Add “${TOGGLE_CARD.l2}” under ${TOGGLE_CARD.l1}`}
              </button>
            )}
            {m === 4 && <Pile state={state} rows={rows} />}
            {m === 5 && <CardEditor state={state} rows={rows} actions={actions} />}
          </div>
          <div className={s.sheetArea}>
            {m <= 2 && <PromptSheet state={state} actions={actions} testRef={testRef} hero={m === 0} />}
            {m === 3 && <SplitSheets state={state} actions={actions} />}
            {m === 4 && <TestSheet state={state} actions={actions} />}
            {m === 5 && <VersionShelf state={state} actions={actions} />}
          </div>
          {m === 2 && connectorKey > 0 && <Connector key={connectorKey} state={state} rows={rows} />}
        </>
      ) : (
        <OperatorView state={state} actions={actions} />
      )}
      {state.toast && <div key={state.toast.n} className={s.toast} aria-hidden="true">{state.toast.text}</div>}
    </div>
  )
}

export function ShapeSwitch({ value, onChange }: { value: Shape; onChange: (s: Shape) => void }) {
  return (
    <div className={s.switch} role="group" aria-label="Show the tree for">
      {SHAPE_ORDER.map(k => (
        <button key={k} type="button" aria-pressed={value === k} className={`${s.switchBtn} ${value === k ? s.switchOn : ''}`} onClick={() => onChange(k)}>
          {SHAPES[k].label}
        </button>
      ))}
    </div>
  )
}

export function Card({ row }: { row: Row }) {
  const cls = row.kind === 'l0' ? s.cardL0 : row.kind === 'l1' ? s.cardL1 : s.cardL2
  return (
    <div className={`${s.card} ${cls} ${row.tucked ? s.tucked : ''}`} style={{ transform: `translateY(${row.y}px)`, height: row.h }} aria-hidden={row.tucked}>
      <span className={s.cardLevel}>{row.kind.toUpperCase()}</span>
      <span className={s.cardName}>{row.label}</span>
    </div>
  )
}

export function PromptSheet({ state, actions, testRef, hero }: { state: DeskState; actions: DeskActions; testRef: RefObject<HTMLButtonElement>; hero: boolean }) {
  const tree = shownTree(state)
  const lines = hero ? promptLines([], true, false) : promptLines(tree.l1, true, state.placeholder)
  const editable = state.active === 2
  return (
    <div key={`sheet-${state.active}-${state.shape}`} className={s.sheet}>
      <div className={s.sheetHead}>
        <span className={s.label}>{state.active >= 1 ? 'Prompt · preview' : 'Prompt template'}</span>
        {!hero && (
          <span className={`${s.badge} ${state.placeholder ? s.badgeOk : s.badgeMissing}`}>
            {state.placeholder ? '✓ Placeholder detected' : '✗ Placeholder missing'}
          </span>
        )}
      </div>
      <div className={s.lines}>
        {lines.map(l => <div key={l.key} className={`${s.line} ${l.hier ? s.lineHier : ''}`}>{l.text}</div>)}
        {hero && <div className={`${s.line} ${s.token}`}>{'{{HIERARCHY}}'}</div>}
        {!hero && !state.placeholder && <div className={`${s.line} ${s.lineGone}`}>(placeholder removed)</div>}
      </div>
      {!hero && state.placeholder && <div className={s.tokenMark} style={{ transform: `translateY(${G.lineTop + 3 * G.lineH}px)` }} aria-hidden="true">{'{{HIERARCHY}}'}</div>}
      {editable && (
        <div className={s.sheetFoot}>
          <button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={actions.togglePlaceholder}>
            {state.placeholder ? 'Delete the placeholder' : 'Restore the placeholder'}
          </button>
          <button ref={testRef} type="button" className={`${s.btn} ${s.btnPrimary}`} aria-disabled={!state.placeholder} aria-describedby={state.placeholder ? undefined : 'docsort-missing'} onClick={() => { if (state.placeholder) actions.testFromPrompt() }}>Test</button>
          {!state.placeholder && <span id="docsort-missing" className={s.srOnly}>Testing is blocked until the placeholder is back.</span>}
        </div>
      )}
    </div>
  )
}

/** L2 on: one global sheet. L2 off: it splits into a stage-1 sheet plus one sheet per category. */
export function SplitSheets({ state, actions, mainTop = 52, subStart = 272, subStep = 96 }: { state: DeskState; actions: DeskActions; mainTop?: number; subStart?: number; subStep?: number }) {
  const split = !state.l2On
  const l2Id = useId()
  const cats = state.tree.map(c => c.name)
  const lines = promptLines(state.tree, true, state.placeholder)
  return (
    <>
      <div className={s.modeRow}>
        <span className={s.label} id={l2Id}>Document types (L2)</span>
        <button type="button" role="switch" aria-checked={state.l2On} aria-labelledby={l2Id} className={`${s.toggle} ${state.l2On ? s.toggleOn : ''}`} onClick={actions.toggleL2}>
          <span className={s.toggleKnob} aria-hidden="true" />
          <span>{state.l2On ? 'On' : 'Off'}</span>
        </button>
      </div>
      {cats.map((c, i) => (
        <div key={c} className={`${s.sheet} ${s.subSheet}`} aria-hidden={!split}
          style={{ transform: split ? `translateY(${subStart + i * subStep}px) rotate(${i % 2 ? 0.6 : -0.6}deg)` : `translateY(${mainTop}px)` }}>
          <div className={s.label}>Stage 2 · {c} prompt</div>
          <div className={s.line}>Sort post that stage 1 filed as {c}.</div>
        </div>
      ))}
      <div className={`${s.sheet} ${s.mainSheet} ${split ? s.mainSplit : ''}`} style={{ top: mainTop }}>
        <div className={s.label}>{split ? 'Stage 1 · category prompt' : 'One global prompt · L1 + L2'}</div>
        <div className={s.lines}>
          {split
            ? [...lines.slice(0, 3).map(l => l.text), 'Document categories:', ...cats.map(c => `- ${c}`)].map(t => <div key={`s1:${t}`} className={s.line}>{t}</div>)
            : lines.map(l => <div key={l.key} className={`${s.line} ${l.hier ? s.lineHier : ''}`}>{l.text}</div>)}
        </div>
      </div>
    </>
  )
}

function Pile({ state, rows }: { state: DeskState; rows: Row[] }) {
  const counts: Record<string, number> = {}
  return (
    <>
      <div className={s.pileLabel} aria-hidden="true">Sample post</div>
      {SAMPLES.map((x, i) => {
        const p = predictedFor(state, x)
        const target = p && rows.find(r => !r.tucked && (r.kind === 'l2' ? leafOf(r.parent!, r.label) : r.label) === p && r.kind !== 'l0')
        const landed = state.run !== 'idle' && target
        const k = target ? (counts[target.key] = (counts[target.key] ?? 0) + 1) - 1 : 0
        const x0 = 8 + i * 6, y0 = 548 - i * 5
        const tx = landed ? G.treeW - G.chipW - 4 - k * G.chipStep : x0
        const ty = landed ? target.y + (target.h - G.chipH) / 2 : y0
        const ok = p && p === expectedFor(state, x.id)
        return (
          <div key={x.id} className={s.chip} aria-hidden="true"
            style={{ transform: `translate(${tx}px, ${ty}px) rotate(${landed ? 0 : (i - 1.5) * 3}deg)`, transitionDelay: state.run === 'running' ? `${i * 120}ms` : '0ms' }}>
            {state.run === 'done' ? ('failed' in x.result ? '✕ failed' : `${ok ? '✓' : '✕'} ${x.result.confidence}%`) : `doc ${i + 1}`}
          </div>
        )
      })}
    </>
  )
}

export function TestSheet({ state, actions }: { state: DeskState; actions: DeskActions }) {
  const opts = leaves(state.tree, state.l2On)
  return (
    <div className={s.sheet}>
      <div className={s.sheetHead}><span className={s.label}>Test · sample post</span></div>
      <ol className={s.samples}>
        {SAMPLES.map(x => {
          const exp = expectedFor(state, x.id)
          const p = predictedFor(state, x)
          const status = state.run === 'idle' ? null : state.run === 'running' ? 'Pending' : 'failed' in x.result ? 'Failed' : 'Classified'
          return (
            <li key={x.id} className={s.sample}>
              <div className={s.sampleTop}>
                <span className={s.mono}>{x.file}</span>
                {status && <span className={`${s.status} ${status === 'Failed' ? s.statusBad : status === 'Classified' ? s.statusOk : ''}`}>{status}</span>}
              </div>
              <label className={s.expected}>
                <span className={s.label}>Expected class</span>
                <select value={exp} disabled={state.run === 'running'} onChange={e => actions.setExpected(x.id, e.target.value)}>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              {state.run === 'done' && (
                'failed' in x.result
                  ? <div className={s.result}><span className={`${s.dot} ${s.dotBad}`} aria-hidden="true" />✕ {x.result.failed}</div>
                  : <div className={s.result}>
                      <span className={`${s.dot} ${p === exp ? s.dotOk : s.dotBad}`} aria-hidden="true" />
                      {p === exp ? '✓' : '✕'} {p} · {x.result.confidence}% · <span className={s.muted}>{x.result.reasoning}</span>
                    </div>
              )}
            </li>
          )
        })}
      </ol>
      <div className={s.sheetFoot}>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={actions.runTest} disabled={state.run === 'running' || !state.placeholder}>
          {state.run === 'done' ? 'Run again' : state.run === 'running' ? 'Running…' : 'Run'}
        </button>
        {!state.placeholder && <span className={s.muted}>✗ Placeholder missing. Restore it to test.</span>}
      </div>
    </div>
  )
}

export function VersionShelf({ state, actions }: { state: DeskState; actions: DeskActions }) {
  const pending = pendingVersion(state)
  const last = state.versions.length === 1
  return (
    <div className={s.sheet}>
      <div className={s.sheetHead}><span className={s.label}>Prompt versions</span></div>
      <ul className={s.versions}>
        {state.versions.map(v => (
          <li key={v.n} className={`${s.version} ${v.active ? s.versionActive : ''}`}>
            <div className={s.sampleTop}>
              <span>{v.label}</span>
              <span className={`${s.status} ${v.status === 'Deployed' ? s.statusOk : v.status === 'Approved' ? s.statusInfo : ''}`}>{v.status}{v.active ? ' · active' : ''}</span>
            </div>
            <div className={s.row}>
              {v === pending && v.status === 'Draft' && <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={actions.approve}>Approve</button>}
              {v === pending && <button type="button" className={`${s.btn} ${v.status === 'Approved' ? s.btnPrimary : ''}`} disabled={v.status !== 'Approved'} onClick={actions.deploy} title={v.status !== 'Approved' ? 'Approve first' : undefined}>Deploy</button>}
              <button type="button" className={`${s.btn} ${s.btnDanger}`} disabled={v.active || last} onClick={() => actions.deleteVersion(v.n)}>Delete</button>
            </div>
            {(v.active || last) && <div className={s.muted}>{v.active ? 'The active version can’t be deleted.' : 'The last version can’t be deleted.'}</div>}
          </li>
        ))}
      </ul>
      <div className={s.sheetFoot}><button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={actions.copyVersion}>Copy the active version</button></div>
    </div>
  )
}

/** Category editing in moment 5: create (confirm), rename (inline duplicate check), delete (confirm, red). */
export function CardEditor({ state, rows, actions }: { state: DeskState; rows: Row[]; actions: DeskActions }) {
  const [mode, setMode] = useState<{ kind: 'rename' | 'delete'; name: string } | { kind: 'create'; step: 1 | 2 } | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  // Close the editor and hand focus to the control that makes sense next (the editor unmounts).
  const close = (focus: { label: string } | 'new') => {
    setMode(null)
    requestAnimationFrame(() => editorRef.current?.parentElement?.querySelector<HTMLElement>(
      focus === 'new' ? '[data-new-category]' : `[aria-label="${CSS.escape(focus.label)}"]`)?.focus())
  }
  const [value, setValue] = useState('')
  const id = useId()
  const names = state.tree.map(c => c.name.toLowerCase())
  const shown = rows.filter(r => !r.tucked)
  const last = shown[shown.length - 1]
  const top = last.y + last.h + 12
  const dup = (v: string, self?: string) => names.includes(v.trim().toLowerCase()) && v.trim().toLowerCase() !== self?.toLowerCase()
  const l1Rows = rows.filter(r => r.kind === 'l1')
  return (
    <>
      {l1Rows.map(r => (
        <div key={`act-${r.label}`} className={s.cardActions} style={{ transform: `translateY(${r.y + 6}px)` }}>
          <button type="button" className={s.iconBtn} aria-label={`Rename ${r.label}`} onClick={() => { setMode({ kind: 'rename', name: r.label }); setValue(r.label) }}>✎</button>
          <button type="button" className={s.iconBtn} aria-label={`Delete ${r.label}`} disabled={state.tree.length === 1} onClick={() => setMode({ kind: 'delete', name: r.label })}>✕</button>
        </div>
      ))}
      <div ref={editorRef} className={s.editor} style={{ transform: `translateY(${top}px)` }}>
        {!mode && (
          <>
            <button type="button" data-new-category className={`${s.btn} ${s.btnQuiet}`} aria-disabled={state.tree.length >= 5} onClick={() => { if (state.tree.length >= 5) return; setMode({ kind: 'create', step: 1 }); setValue('') }}>+ New category</button>
            {state.tree.length === 1 && <div className={s.muted}>The last category can’t be deleted.</div>}
          </>
        )}
        {mode?.kind === 'rename' && (
          <form onSubmit={e => { e.preventDefault(); if (value.trim() && !dup(value, mode.name)) { actions.renameL1(mode.name, value.trim()); close({ label: `Rename ${value.trim()}` }) } }}>
            <label htmlFor={`${id}-r`} className={s.label}>Rename {mode.name}</label>
            <input id={`${id}-r`} className={s.input} value={value} onChange={e => setValue(e.target.value)} aria-invalid={dup(value, mode.name)} aria-describedby={dup(value, mode.name) ? `${id}-e` : undefined} />
            {dup(value, mode.name) && <div id={`${id}-e`} className={s.error}>✕ {COPY.duplicateError}</div>}
            <div className={s.row}><button type="submit" className={s.btn} disabled={!value.trim() || dup(value, mode.name)}>Save</button><button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={() => close({ label: `Rename ${mode.name}` })}>Cancel</button></div>
          </form>
        )}
        {mode?.kind === 'delete' && (() => {
          const n = state.tree.find(c => c.name === mode.name)?.l2.length ?? 0
          return (
            <div role="group" aria-label="Confirm delete">
              <div>Delete “{mode.name}”{n ? ` and its ${n} document type${n > 1 ? 's' : ''}` : ''}?</div>
              <div className={s.row}><button type="button" className={`${s.btn} ${s.btnRed}`} onClick={() => { actions.deleteL1(mode.name); close('new') }}>Delete</button><button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={() => close({ label: `Delete ${mode.name}` })}>Cancel</button></div>
            </div>
          )
        })()}
        {mode?.kind === 'create' && (
          <form onSubmit={e => { e.preventDefault(); if (mode.step === 1) { if (value.trim() && !dup(value)) setMode({ kind: 'create', step: 2 }) } else { actions.createL1(value.trim()); close('new') } }}>
            {mode.step === 1 ? (
              <>
                <label htmlFor={`${id}-c`} className={s.label}>New category</label>
                <input id={`${id}-c`} className={s.input} value={value} onChange={e => setValue(e.target.value)} aria-invalid={dup(value)} aria-describedby={dup(value) ? `${id}-ce` : undefined} />
                {dup(value) && <div id={`${id}-ce`} className={s.error}>✕ {COPY.duplicateError}</div>}
                <div className={s.row}><button type="submit" className={s.btn} disabled={!value.trim() || dup(value)}>Next</button><button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={() => close('new')}>Cancel</button></div>
              </>
            ) : (
              <>
                <div className={s.banner}>A v1 Draft prompt will be created for “{value.trim()}”.</div>
                <div className={s.row}><button type="submit" className={s.btn}>Create</button><button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={() => close('new')}>Cancel</button></div>
              </>
            )}
          </form>
        )}
      </div>
    </>
  )
}

/** A thin blue line from the newest card to the prompt line it typed. Drawn once. */
function Connector({ state, rows }: { state: DeskState; rows: Row[] }) {
  if (!hasToggleCard(state) || !state.placeholder) return null
  const card = rows.find(r => r.key === `l2:${TOGGLE_CARD.l1}>${TOGGLE_CARD.l2}`)
  const lines = promptLines(state.tree, true, true)
  const idx = lines.findIndex(l => l.key === `t:${TOGGLE_CARD.l1}>${TOGGLE_CARD.l2}`)
  if (!card || idx < 0) return null
  const x1 = G.treeW, y1 = card.y + card.h / 2
  const x2 = G.sheetX + 16, y2 = G.lineTop + idx * G.lineH + G.lineH / 2
  return (
    <svg className={s.connector} width={G.stageW} height={G.stageH} aria-hidden="true">
      <path d={`M${x1} ${y1} C ${x1 + 14} ${y1}, ${x2 - 14} ${y2}, ${x2} ${y2}`} />
    </svg>
  )
}

export function OperatorView({ state, actions }: { state: DeskState; actions: DeskActions }) {
  const [queue, setQueue] = useState<string>(QUEUES[0])
  const id = useId()
  const open = QUEUE_DOCS.find(d => d.id === state.openDoc)
  const listRef = useRef<HTMLDivElement>(null)
  // After Send or Complete the document pane closes; move focus to the next open document.
  const finish = (id: string, act: () => void) => {
    const i = QUEUE_DOCS.findIndex(d => d.id === id)
    const rest = [...QUEUE_DOCS.slice(i + 1), ...QUEUE_DOCS.slice(0, i)].filter(d => state.rows.find(r => r.id === d.id)?.status !== 'Done')
    act()
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(rest[0] ? `[data-doc="${rest[0].id}"]` : '[data-docs-label]')?.focus())
  }
  const openRow = state.rows.find(r => r.id === state.openDoc)
  return (
    <div className={s.operator}>
      <div ref={listRef} className={s.queueList}>
        <div className={s.label} tabIndex={-1} data-docs-label>Documents</div>
        <table className={s.table}>
          <thead><tr><th scope="col">Date</th><th scope="col">Sender</th><th scope="col">Status</th><th scope="col">Category</th><th scope="col">Queue</th></tr></thead>
          <tbody>
            {QUEUE_DOCS.map(d => {
              const r = state.rows.find(x => x.id === d.id)!
              return (
                <tr key={d.id} className={state.openDoc === d.id ? s.rowOpen : ''}>
                  <td>{d.date.split(' ')[1]}</td>
                  <td><button type="button" data-doc={d.id} className={s.linkBtn} onClick={() => actions.openDoc(d.id)} disabled={r.status === 'Done'}>{d.sender}</button></td>
                  <td>{r.status === 'Locked' ? 'Locked · you' : r.status}</td>
                  <td>{d.category}</td>
                  <td>{r.queue}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className={s.docPane}>
        {!open ? <div className={s.muted}>Open a document from the list.</div> : (
          <div key={open.id} className={s.docOpen}>
            <div className={s.label}>{open.category} · from {open.sender}</div>
            <div className={s.docBody}>
              <ul className={s.pages} aria-label="Pages"><li className={s.pageOn}>Page 1</li><li>Page 2</li></ul>
              <div className={s.viewer} aria-label="Document viewer, page 1">
                {[90, 70, 84, 40, 76, 60].map((w, i) => <span key={i} className={s.viewerLine} style={{ width: `${w}%` }} />)}
              </div>
            </div>
            <table className={s.fields}>
              <caption className={s.label}>Extracted fields</caption>
              <tbody>
                {FIELDS.map(f => (
                  <tr key={f.field} className={f.flag ? s.flagged : ''}>
                    <th scope="row">{f.field}</th>
                    <td>{f.value}{f.flag && <span className={s.flag}> ! {f.flag}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {openRow?.status !== 'Done' && (
              <div className={s.row}>
                <label htmlFor={`${id}-q`} className={s.srOnly}>Queue</label>
                <select id={`${id}-q`} value={queue} onChange={e => setQueue(e.target.value)}>
                  {QUEUES.map(q => <option key={q}>{q}</option>)}
                </select>
                <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => finish(open.id, () => actions.sendDoc(open.id, queue))}>Send to queue</button>
                <button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={() => finish(open.id, () => actions.completeDoc(open.id))}>Complete</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
