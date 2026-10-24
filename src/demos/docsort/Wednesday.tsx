'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { SAMPLES, TEXT, TOGGLE_CARD, fill, type Answer, type Sample } from './data'
import { Letter } from './Letter'
import { TOKEN, catOf, hasType, headLines, hierarchyLines, leaves, nearest, spoken, withType } from './state'
import { Glyph, ResetButton, Steps, useActions, useShared } from './Ui'
import s from './docsort.module.css'

const STEPS = ['Tag', 'Run', 'Reword and run again']
type Run = { n: number; withLine: boolean; resolved: number; running: boolean }
const NO_RUN: Run = { n: 0, withLine: false, resolved: 0, running: false }

const answerFor = (x: Sample, withLine: boolean): Answer | null =>
  'failed' in x.result ? null : withLine && x.rerun ? x.rerun : x.result

export function WednesdayDemo() {
  const shared = useShared()
  const { setShared, say, complete, reduced } = useActions()
  const [expected, setExpected] = useState<Record<string, string>>({})
  const [run, setRun] = useState<Run>(NO_RUN)
  const [line, setLine] = useState(false)
  const [saved, setSaved] = useState(false)
  const timers = useRef<number[]>([])
  const ids = { blocked: useId(), lineOff: useId() }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const tree = shared.tree
  const opts = leaves(tree)
  const exp = (x: Sample) => nearest(tree, expected[x.id] ?? x.expected)
  const blocked = !shared.placeholder
  const firstDone = run.n >= 1 && !run.running
  const canSave = !run.running && run.n >= 2 && run.withLine && !saved
  const step = run.n === 0 ? 0 : saved ? 3 : run.n === 1 && run.running ? 1 : 2
  const changed = run.n > 0 || line || Object.keys(expected).length > 0

  const start = () => {
    if (blocked || run.running) return
    timers.current.forEach(clearTimeout)
    timers.current = []
    const withLine = line
    const n = run.n + 1
    setRun({ n, withLine, resolved: 0, running: true })
    say(fill('wedRunning'))
    // One timeout chain per run: 700ms, then each card in turn 120ms apart.
    const total = SAMPLES.length
    const resolve = (k: number) => {
      setRun(r => ({ ...r, resolved: k, running: k < total }))
      if (k < total) timers.current.push(window.setTimeout(() => resolve(k + 1), reduced() ? 0 : 120))
      else {
        say(SAMPLES.map(x => {
          const a = answerFor(x, withLine)
          return a
            ? fill('wedCard', { file: x.file, expected: spoken(exp(x)), answer: spoken(nearest(tree, a.leaf)), confidence: a.confidence })
            : fill('wedFailed', { file: x.file, reason: (x.result as { failed: string }).failed })
        }).join(' '))
      }
    }
    timers.current.push(window.setTimeout(() => resolve(1), reduced() ? 0 : 700))
  }
  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setRun(NO_RUN); setLine(false); setSaved(false); setExpected({})
    say(fill('reset'))
  }

  return (
    <div className={s.demo} data-demo-day="wed">
      <Steps names={STEPS} current={step} label="Wednesday steps" />
      <div className={s.upload}>
        <p className={s.uploadMain}>Drag your file here or browse</p>
        <p className={s.uploadRule}>JPG, PNG or PDF • less than 5MB • up to 5 files</p>
      </div>
      <ul className={s.samples}>
        {SAMPLES.map((x, i) => {
          const done = run.n > 0 && (!run.running || run.resolved > i)
          const a = done ? answerFor(x, run.withLine) : null
          const failed = done && !a
          const shown = a && nearest(tree, a.leaf)
          const site = !!x.rerun
          return (
            <li key={x.id} className={s.sample} data-site={site || undefined}>
              {site && <span className={s.sampleLetter}><Letter label={shown ? catOf(shown) : undefined} /></span>}
              <div className={s.sampleMain}>
                <p className={s.sampleHead}>
                  <span className={s.mono}>{x.file}</span>
                  <span className={s.status} data-state={failed ? 'failed' : a ? 'ok' : 'pending'}>
                    {failed ? <><Glyph k="cross" /> Failed</> : a ? 'Classified' : 'Pending'}
                  </span>
                </p>
                {run.running && !done && <span className={s.pendingBar} aria-hidden="true" />}
                <div className={s.kv}>
                  <label className={s.k} htmlFor={`${x.id}-exp`}>Expected</label>
                  <select
                    id={`${x.id}-exp`}
                    className={s.select}
                    aria-label={`Expected Class, ${x.file}`}
                    value={exp(x)}
                    onChange={e => setExpected(p => ({ ...p, [x.id]: e.target.value }))}
                  >
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <span className={s.k}>AI answer</span>
                  <span className={s.v}>
                    {failed ? <span className={s.failText}>{(x.result as { failed: string }).failed}</span>
                      : a ? (
                        <span key={`${run.n}-${shown}`} className={s.answer}>
                          <span className={s.answerLeaf}>{shown}</span>
                          <span className={s.conf}>Confidence {a.confidence}</span>
                          <span className={s.reason}>{a.reasoning}</span>
                        </span>
                      ) : <span className={s.muted}>{run.running ? 'Pending' : 'Not run yet'}</span>}
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className={s.wSheet}>
        <p className={s.paneCap}>Template</p>
        {headLines().map(l => <p key={l.key} className={s.pLine}>{l.text}</p>)}
        {line && <p className={`${s.pLine} ${s.pAdded}`}>{TEXT.addedLine}</p>}
        {shared.placeholder ? <p className={`${s.pLine} ${s.pToken}`}>{TOKEN}</p> : <p className={`${s.pLine} ${s.pGone}`} aria-hidden="true" />}
        <div className={s.sheetFoot}>
          {!line ? (
            <>
              <button
                type="button"
                className={s.btnSecondary}
                aria-disabled={!firstDone || undefined}
                aria-describedby={!firstDone ? ids.lineOff : undefined}
                onClick={() => { if (!firstDone) return; setLine(true); say(fill('wedLine')) }}
              >
                Add line
              </button>
              {!firstDone && <span id={ids.lineOff} className={s.hint}>Run the test first.</span>}
            </>
          ) : <span className={s.hint}><Glyph k="check" /> Line added</span>}
        </div>
      </div>

      {blocked && (
        <div className={s.notice} data-tone="danger">
          <p id={ids.blocked}><Glyph k="cross" /> {fill('blocked')}</p>
          <button type="button" className={s.btnText} onClick={() => { setShared(p => ({ ...p, placeholder: true })); say(fill('tueRestored')) }}>Restore placeholder</button>
        </div>
      )}
      {!hasType(tree) && (
        <div className={s.notice}>
          <p>{fill('wedMissing')}</p>
          <button type="button" className={s.btnText} onClick={() => setShared(p => ({ ...p, tree: withType(p.tree, true) }))}>
            Add it under {TOGGLE_CARD.l1}
          </button>
        </div>
      )}

      <div className={s.controls}>
        <button
          type="button"
          className={s.btnPrimary}
          aria-disabled={blocked || run.running || undefined}
          aria-describedby={blocked ? ids.blocked : undefined}
          onClick={start}
        >
          Test Prompt
        </button>
        <button
          type="button"
          className={s.btnSecondary}
          aria-disabled={!canSave || undefined}
          onClick={() => { if (!canSave) return; setSaved(true); complete('wed'); say(fill('wedSaved')) }}
        >
          Save as Draft
        </button>
        {saved && <span className={s.hint}><Glyph k="check" /> Draft saved</span>}
        <ResetButton show={changed} onReset={reset} />
      </div>
    </div>
  )
}

/** The drawer's aside: one prompt, or a Stage 1 prompt plus one prompt per category. */
export function WednesdayAside({ text }: { label?: string; text: string }) {
  const shared = useShared()
  const { say } = useActions()
  const [on, setOn] = useState(true)
  const set = (v: boolean) => { if (v === on) return; setOn(v); say(fill(v ? 'wedTypesOn' : 'wedTypesOff')) }
  return (
    <div className={s.wAside}>
      <p className={s.drawerText}>{text}</p>
      <div className={s.seg} role="group" aria-label="Sorting mode" data-off={!on || undefined}>
        <span className={s.segInd} aria-hidden="true" />
        <button type="button" className={s.segBtn} aria-pressed={on} onClick={() => set(true)}>Document types on</button>
        <button type="button" className={s.segBtn} aria-pressed={!on} onClick={() => set(false)}>Document types off</button>
      </div>
      <div className={s.modes} data-off={!on || undefined}>
        <div className={s.modeSheet}>
          <p className={s.paneCap}>{on ? 'Global Classification Prompt (L1 + L2)' : 'Stage 1'}</p>
          {(on ? hierarchyLines(shared.tree) : hierarchyLines(shared.tree.map(c => ({ ...c, l2: [] })))).map(l => (
            <p key={l.key} className={s.pLine}>{l.text}</p>
          ))}
        </div>
        {!on && (
          <div className={s.modeSmall}>
            {shared.tree.map((c, i) => (
              <div key={c.name} className={s.modeSheet} style={{ animationDelay: `${i * 60}ms` }}>
                <p className={s.paneCap}>{c.name}</p>
                {c.l2.length ? c.l2.map(t => <p key={t} className={s.pLine}>- {t}</p>) : <p className={`${s.pLine} ${s.muted}`}>No document types</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      {!on && <p className={s.cost}>{fill('wedCost')}</p>}
    </div>
  )
}
