'use client'

import { useId, useState } from 'react'
import { QUEUES, TOGGLE_CARD, TREE, fill } from './data'
import { Letter } from './Letter'
import { catOf, leafOf, leaves } from './state'
import { QueuePicker, ResetButton, useActions } from './Ui'
import s from './docsort.module.css'

/** Ana's tree as it stands on Monday, with the one Assessor report outlined. */
export function TreeCard({ mark }: { mark?: string }) {
  return (
    <div className={s.treeCard}>
      <p className={s.treeL0}><span className={s.lvl}>L0</span>{TREE.l0}</p>
      <ul className={s.treeL1s}>
        {TREE.l1.map(c => (
          <li key={c.name}>
            <span className={s.treeL1}>{c.name}</span>
            {c.l2.length ? (
              <ul className={s.treeL2s}>
                {c.l2.map(t => <li key={t} className={s.treeL2} data-mark={leafOf(c.name, t) === mark || undefined}>{t}</li>)}
              </ul>
            ) : <span className={s.treeEmpty}>No document types</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Monday's only Assessor report: under the first category (Vehicle). */
const START_LEAF = () => leafOf(TREE.l1[0].name, TOGGLE_CARD.l2)

export function MondayDemo() {
  const { say, complete } = useActions()
  const [leaf, setLeaf] = useState(START_LEAF)
  const [queue, setQueue] = useState(() => QUEUES[0])
  const selId = useId()
  const cat = catOf(leaf)
  const changed = leaf !== START_LEAF() || queue !== QUEUES[0]
  const i = Math.max(0, QUEUES.indexOf(queue))

  const check = (l: string, q: string) => { if (catOf(l) === TOGGLE_CARD.l1 && q === QUEUES[1]) complete('mon') }

  return (
    <div className={s.demo} data-demo-day="mon">
      <TreeCard mark={START_LEAF()} />
      <div className={s.desks} style={{ ['--i' as string]: i }}>
        {QUEUES.map(q => (
          <div key={q} className={s.desk} data-here={q === queue || undefined}>
            <span className={s.deskLabel}>{q}</span>
          </div>
        ))}
        <span className={s.deskPaper}><Letter label={cat} /></span>
      </div>
      <div className={s.controls}>
        <div className={s.field}>
          <label htmlFor={selId} className={s.fieldLabel}>Document type</label>
          <select
            id={selId}
            className={s.select}
            value={leaf}
            onChange={e => {
              const l = e.target.value
              setLeaf(l)
              say(fill('monType', { leaf: l.replace(' > ', ', '), cat: catOf(l) }))
              check(l, queue)
            }}
          >
            {leaves(TREE.l1).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <QueuePicker
          queues={QUEUES}
          current={queue}
          onPick={q => { setQueue(q); say(fill('monSent', { queue: q, cat })); check(leaf, q) }}
        />
        <ResetButton show={changed} onReset={() => { setLeaf(START_LEAF()); setQueue(QUEUES[0]); say(fill('reset')) }} />
      </div>
    </div>
  )
}
