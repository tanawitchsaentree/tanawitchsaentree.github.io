'use client'
import type { CSSProperties } from 'react'
import s from './ProfitaCutoff.module.css'

/* A sample cutoff. Real cutoffs differ by fund. */
export const CUTOFF = 15 * 60 + 30
const OPEN = 9 * 60
const CLOSE = 17 * 60
export const TODAY = 'Fri 30 Oct. 2020'
export const NEXT_DAY = 'Mon 02 Nov. 2020'

export const clock = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
export const isAfter = (m: number) => m >= CUTOFF
const pos = (m: number) => (m - OPEN) / (CLOSE - OPEN)

/** Time-of-order control. A native range input, so drag, click and arrow keys all work. */
export function CutoffClock({ minutes, onChange }: { minutes: number; onChange: (m: number) => void }) {
  const after = isAfter(minutes)
  return (
    <div className={s.clock} data-after={after || undefined}>
      <div className={s.readout} aria-hidden="true">
        <span className={s.time}>{clock(minutes)}</span>
        <span className={s.day}>Friday</span>
      </div>
      <div className={s.rail} style={{ '--cut': pos(CUTOFF) } as CSSProperties}>
        <span className={s.inner} aria-hidden="true">
          <span className={s.after} />
          <span className={s.fill} style={{ transform: `scaleX(${pos(minutes)})` }} />
          <span className={s.cutMark}><span>Sample cutoff 15:30</span></span>
        </span>
        <input
          className={s.range}
          type="range"
          min={OPEN}
          max={CLOSE}
          step={5}
          value={minutes}
          onChange={e => onChange(Number(e.target.value))}
          aria-label="Time the order is sent"
          aria-valuetext={`${clock(minutes)}, ${after ? 'after' : 'before'} the 15:30 sample cutoff`}
        />
      </div>
      <div className={s.scale} aria-hidden="true"><span>09:00</span><span>17:00</span></div>
      <div className={s.status}>
        <span className={s.statusWindow}>
          <span className={s.statusRow}>
            <span aria-hidden={after}>Counts for today, {TODAY.slice(0, 10)}</span>
            <span aria-hidden={!after}>Moves to {NEXT_DAY.slice(0, 10)}</span>
          </span>
        </span>
      </div>
    </div>
  )
}
