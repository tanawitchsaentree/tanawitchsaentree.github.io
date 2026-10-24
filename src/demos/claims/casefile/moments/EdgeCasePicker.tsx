'use client'

import { useId } from 'react'
import { EDGE_CASES, type EdgeCase } from '../data'
import s from '../casefile.module.css'

// Sits on the skeleton sheet.
export function EdgeCasePicker({ value, onPick }: { value: EdgeCase | null; onPick: (e: EdgeCase) => void }) {
  const name = useId()
  return (
    <fieldset className={s.fieldset}>
      <legend className={s.slipTitle} style={{ marginBottom: 4 }}>Try an edge case</legend>
      {EDGE_CASES.map(c => (
        <label key={c.id} className={s.choice}>
          <input type="radio" name={name} checked={value === c.id} onChange={() => onPick(c.id)} />
          {c.label}
        </label>
      ))}
    </fieldset>
  )
}
