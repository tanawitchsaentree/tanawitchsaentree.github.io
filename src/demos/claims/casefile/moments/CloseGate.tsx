'use client'

import { CLOSE_STEPS } from '../data'
import s from '../casefile.module.css'

// Sits on the closing slip: three checks that unlock in order.
export function CloseGate({ step, blocked, reason, onStep, onReset }: {
  step: number; blocked: boolean; reason: string; onStep: (next: number) => void; onReset: () => void
}) {
  return (
    <>
      <ol className={s.steps}>
        {CLOSE_STEPS.map((label, i) => (
          <li key={label}>
            {step > i ? (
              <span className={s.stepDone}>✓ {label}</span>
            ) : (
              <button type="button" className={s.paperBtn} disabled={step !== i || (i === 0 && blocked)} onClick={() => onStep(i + 1)}>
                {i + 1}. {i === 2 ? `${label}: ${reason}` : label}
              </button>
            )}
          </li>
        ))}
      </ol>
      {blocked && step === 0 && <p className={s.muted} style={{ margin: 0 }}>! A rejection request is still waiting. Turn the corner to decide it on the approver side.</p>}
      {step === 3 && <div className={s.slipFoot}><button type="button" className={`${s.paperBtn} ${s.paperBtnQuiet}`} onClick={onReset}>Reset the file</button></div>}
    </>
  )
}
