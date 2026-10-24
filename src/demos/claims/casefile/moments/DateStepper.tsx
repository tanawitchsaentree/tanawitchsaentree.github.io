'use client'

import { useId } from 'react'
import { fmtLoss } from '../data'
import s from '../casefile.module.css'

// Sits on the change-summary slip.
export function DateStepper({ shift, onStep }: { shift: number; onStep: (delta: number) => void }) {
  const id = useId()
  return (
    <div role="group" aria-labelledby={id}>
      <div id={id} className={s.slipTitle} style={{ marginBottom: 8 }}>Loss date</div>
      <div className={s.row}>
        <button type="button" className={`${s.paperBtn} ${s.paperBtnQuiet}`} onClick={() => onStep(-1)} disabled={shift <= -11} aria-label="One day earlier">− 1 day</button>
        <output className={s.value}>{fmtLoss(shift)}</output>
        <button type="button" className={`${s.paperBtn} ${s.paperBtnQuiet}`} onClick={() => onStep(1)} disabled={shift >= 19} aria-label="One day later">+ 1 day</button>
      </div>
    </div>
  )
}
