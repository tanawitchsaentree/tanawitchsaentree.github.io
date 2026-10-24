'use client'
import { useCallback, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import Image from 'next/image'
import { T } from './tokens'
import { TimsiPadMockup, type PosLine, type PosMessage } from './TimsiPadMockup'
import s from './TimsOrderSlip.module.css'

/* The called-out order and the change the customer makes. Matching reads the ticket the POS
   posts to the page, so the slip ticks itself off as the order is rung in. */
type Want = { key: string; label: string; iced: boolean; cream: number; sugar: number }
const BLACK: Want = { key: 'black', label: 'XL coffee, black', iced: false, cream: 0, sugar: 0 }
const TT: Want = { key: 'tt', label: 'XL coffee, triple-triple', iced: false, cream: 3, sugar: 3 }
const ICED_BLACK: Want = { key: 'iced', label: 'XL iced coffee, black', iced: true, cream: 0, sugar: 0 }
const FIRST = [BLACK, TT]
const SECOND = [ICED_BLACK, TT]

const HOT_COFFEE = ['hot-1', 'hot-2', 'hot-3']
const ICED_COFFEE = ['iced-1']

const fits = (l: PosLine, w: Want) =>
  l.size === 'XL' && l.cream === w.cream && l.sugar === w.sugar &&
  (w.iced ? ICED_COFFEE : HOT_COFFEE).includes(l.id ?? '')

function check(lines: PosLine[], wants: Want[]) {
  const units = lines.flatMap(l => Array.from({ length: l.qty }, () => l))
  const pool = [...units]
  const have = wants.map(w => {
    const i = pool.findIndex(l => fits(l, w))
    if (i < 0) return false
    pool.splice(i, 1)
    return true
  })
  return { have, done: have.every(Boolean) && units.length === wants.length }
}

const NARROW = '(max-width: 567px)'
const subscribe = (cb: () => void) => { const m = matchMedia(NARROW); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) }
// null on the server and during hydration, so neither the iframe nor the poster mounts until the width is known.
const useNarrow = () => useSyncExternalStore<boolean | null>(subscribe, () => matchMedia(NARROW).matches, () => null)
const taps = (n: number) => `${n} tap${n === 1 ? '' : 's'}`

const IconCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>

function Lines({ wants, have, plain }: { wants: Want[]; have: boolean[]; plain?: boolean }) {
  return (
    <ul className={s.lines}>
      {wants.map((w, i) => (
        <li key={w.key} data-have={have[i] || undefined}>
          {!plain && <span className={s.box}>{have[i] && <IconCheck />}</span>}
          <span>1 × {w.label}</span>
          {!plain && <span className={s.srOnly}>{have[i] ? ', on the ticket' : ', not on the ticket yet'}</span>}
        </li>
      ))}
    </ul>
  )
}

export function TimsOrderDemo({ announce }: { announce: (message: string) => void }) {
  const narrow = useNarrow()
  const [lines, setLines] = useState<PosLine[]>([])
  const [tapCount, setTaps] = useState(0)
  const [stage, setStage] = useState<0 | 1 | 2>(0)
  const [rung, setRung] = useState({ first: 0, second: 0 })
  const [resetKey, setResetKey] = useState(0)

  const first = check(lines, FIRST)
  const second = check(lines, SECOND)

  // Refs mirror state so the message handler reads current values without stale closures.
  const live = useRef({ stage: 0 as 0 | 1 | 2, taps: 0, first: 0 })

  const onPosMessage = useCallback((m: PosMessage) => {
    const now = live.current
    if (m.type === 'taps') { now.taps = m.taps; setTaps(m.taps); return }
    if (m.type === 'paid') { announce(`Paid. ${taps(m.taps)} on this order.`); return }
    if (m.type === 'reset') {
      // A cleared ticket starts the slip again. A paid ticket keeps a finished slip on screen.
      if (m.reason === 'paid' && now.stage === 2) return
      const had = now.stage > 0
      live.current = { stage: 0, taps: 0, first: 0 }
      setStage(0); setLines([]); setRung({ first: 0, second: 0 })
      if (had) announce('Ticket cleared. The slip is back to two XL coffees.')
      return
    }
    setLines(m.lines)
    if (now.stage === 0 && check(m.lines, FIRST).done) {
      now.stage = 1; now.first = now.taps
      setStage(1); setRung({ first: now.taps, second: 0 })
      announce(`Rung in with ${taps(now.taps)}. The customer wants the black one iced.`)
    } else if (now.stage === 1 && check(m.lines, SECOND).done) {
      now.stage = 2
      const more = now.taps - now.first
      setStage(2); setRung({ first: now.first, second: more })
      announce(`Changed in ${more} more tap${more === 1 ? '' : 's'}.`)
    }
  }, [announce])

  const startOver = () => {
    live.current = { stage: 0, taps: 0, first: 0 }
    setStage(0); setLines([]); setTaps(0); setRung({ first: 0, second: 0 }); setResetKey(k => k + 1)
    announce('New order. The slip is back to two XL coffees.')
  }

  return (
    <div className={s.demo} data-demo="tims" style={{ '--tims-red': T.color.red } as CSSProperties}>
      <div className={s.ipad}>
        {narrow === null ? <div className={s.scaler} /> : narrow ? (
          <div className={s.poster}>
            <Image src="/images/timhortons/tims-pos-poster.jpg" alt="The Tims POS on an iPad, with the drink grid in the middle and the ticket on the right" width={1280} height={800} sizes="100vw" />
            <a href="/demos/tims-pos.html" target="_blank" rel="noopener noreferrer">Open the terminal full screen ↗</a>
          </div>
        ) : (
          <div className={s.scaler}><div><TimsiPadMockup onPosMessage={onPosMessage} resetKey={resetKey} /></div></div>
        )}
      </div>

      <div className={s.slips}>
        <article className={s.slip} aria-labelledby="tims-slip-1">
          <h3 id="tims-slip-1" className={s.slipHead}>{narrow ? 'Order to ring in' : 'Order slip'}</h3>
          <p className={s.call}>Two XL coffees. One black, one triple-triple.</p>
          <Lines wants={FIRST} have={stage === 0 ? first.have : [true, true]} plain={narrow !== false} />
          {stage > 0 && <p className={s.stamp}>Rung in · {taps(rung.first)}</p>}
        </article>

        {narrow === false && (
          <article className={s.slip} data-second aria-labelledby="tims-slip-2" hidden={stage === 0}>
            <h3 id="tims-slip-2" className={s.slipHead}>Customer changes it</h3>
            <p className={s.call}>Make the black one iced.</p>
            <Lines wants={SECOND} have={stage === 2 ? [true, true] : second.have} />
            {stage === 2 && <p className={s.stamp}>Changed · {rung.second} more tap{rung.second === 1 ? '' : 's'}</p>}
          </article>
        )}

        {narrow === false && (
          <div className={s.counter}>
            <span className={s.counterLabel}>Taps in the POS</span>
            <span className={s.counterNum}>{tapCount}</span>
            <button type="button" className={s.again} onClick={startOver}>Start over</button>
          </div>
        )}
      </div>
    </div>
  )
}
