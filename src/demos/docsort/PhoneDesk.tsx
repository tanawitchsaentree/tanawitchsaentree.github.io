'use client'

import type { RefObject } from 'react'
import { TOGGLE_CARD } from './data'
import { Card, CardEditor, OperatorView, PromptSheet, ShapeSwitch, SplitSheets, TestSheet, VersionShelf, hasToggleCard, type DeskActions } from './Desk'
import { PG, layoutTree, promptLines, shownTree, type DeskState, type Row } from './state'
import s from './docsort.module.css'

// Phone layout (below the width where the desk object would scale under 0.6): one
// 340 × 520 stage, stacked, showing only the part each moment needs. Same discrete state
// and the same actions as the desk; geometry is computed from PG, never measured.
export function PhoneDesk({ state, actions, connectorKey, testRef }: {
  state: DeskState; actions: DeskActions; connectorKey: number; testRef: RefObject<HTMLButtonElement>
}) {
  const m = state.active
  const tree = shownTree(state)
  const rows = m === 1 || m === 2 ? layoutTree(tree, true, PG) : m === 5 ? layoutTree(tree, false, { ...PG, treeTop: 8 }) : []
  return (
    <div className={`${s.stage} ${s.phoneStage}`}>
      {m === 0 && <div className={s.phoneFull}><PromptSheet state={state} actions={actions} testRef={testRef} hero /></div>}

      {m === 1 && (
        <div className={s.phoneTree}>
          <ShapeSwitch value={state.shape} onChange={actions.setShape} />
          {rows.map(r => <Card key={r.key} row={r} />)}
          {tree.note && <div className={s.treeNote} style={{ transform: `translateY(${rows[rows.length - 1].y + 40}px)` }}>{tree.note}</div>}
        </div>
      )}

      {m === 2 && <PhoneFiling state={state} actions={actions} rows={rows} connectorKey={connectorKey} testRef={testRef} />}

      {m === 3 && <div className={s.phoneFull}><SplitSheets state={state} actions={actions} mainTop={48} subStart={232} subStep={96} /></div>}

      {m === 4 && <div className={s.phoneFull}><TestSheet state={state} actions={actions} /></div>}

      {m === 5 && (
        <>
          <div className={s.phoneTree} style={{ height: 290 }}>
            {rows.map(r => <Card key={r.key} row={r} />)}
            <CardEditor state={state} rows={rows} actions={actions} />
          </div>
          <div className={s.phoneShelf}><VersionShelf state={state} actions={actions} /></div>
        </>
      )}

      {m === 6 && <div className={s.phoneFull}><OperatorView state={state} actions={actions} /></div>}

      {state.toast && <div key={state.toast.n} className={s.toast} aria-hidden="true">{state.toast.text}</div>}
    </div>
  )
}

/** Moment 2 on a phone: controls on top, the tree, and the prompt's hierarchy lines under it. */
function PhoneFiling({ state, actions, rows, connectorKey, testRef }: {
  state: DeskState; actions: DeskActions; rows: Row[]; connectorKey: number; testRef: RefObject<HTMLButtonElement>
}) {
  const last = rows[rows.length - 1]
  const panelTop = last.y + last.h + 8
  const lines = promptLines(state.tree, true, state.placeholder).filter(l => l.hier)
  const card = rows.find(r => r.key === `l2:${TOGGLE_CARD.l1}>${TOGGLE_CARD.l2}`)
  const idx = lines.findIndex(l => l.key === `t:${TOGGLE_CARD.l1}>${TOGGLE_CARD.l2}`)
  const lineY = panelTop + 30 + idx * PG.lineH + PG.lineH / 2
  return (
    <>
      <div className={s.phoneBar}>
        <button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={actions.toggleCard}>{hasToggleCard(state) ? 'Remove card' : 'Add card'}</button>
        <button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={actions.togglePlaceholder}>{state.placeholder ? 'Delete placeholder' : 'Restore placeholder'}</button>
        <button ref={testRef} type="button" className={`${s.btn} ${s.btnPrimary}`} aria-disabled={!state.placeholder} aria-describedby={state.placeholder ? undefined : 'docsort-missing-phone'} onClick={() => { if (state.placeholder) actions.testFromPrompt() }}>Test</button>
        {!state.placeholder && <span id="docsort-missing-phone" className={s.srOnly}>Testing is blocked until the placeholder is back.</span>}
      </div>
      <div className={s.phoneTree}>{rows.map(r => <Card key={r.key} row={r} />)}</div>
      <div className={s.phoneLines} style={{ top: panelTop }}>
        <span className={`${s.badge} ${state.placeholder ? s.badgeOk : s.badgeMissing}`}>{state.placeholder ? '✓ Placeholder detected' : '✗ Placeholder missing'}</span>
        <div className={s.phoneLineList}>
          {state.placeholder ? lines.map(l => <div key={l.key} className={s.line}>{l.text}</div>) : <div className={`${s.line} ${s.lineGone}`}>(placeholder removed)</div>}
        </div>
      </div>
      {connectorKey > 0 && card && idx >= 0 && state.placeholder && (
        <svg key={connectorKey} className={s.connector} width={PG.stageW} height={PG.stageH} aria-hidden="true">
          <path d={`M${PG.stageW - 10} ${card.y + card.h / 2} C ${PG.stageW - 2} ${card.y + card.h / 2}, ${PG.stageW - 2} ${lineY}, ${PG.stageW - 20} ${lineY}`} />
        </svg>
      )}
    </>
  )
}
