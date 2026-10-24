'use client'

import { useId } from 'react'
import { PAYMENT_MAX, PAYMENT_STEP, fmtMoney } from '../data'
import s from '../casefile.module.css'

// Sits on the payment slip.
export function PaymentSlider({ amount, reserve, onAmount }: { amount: number; reserve: number; onAmount: (v: number) => void }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className={s.slipTitle}>Payment amount</label>
      <input
        id={id} type="range" className={s.range}
        min={0} max={PAYMENT_MAX} step={PAYMENT_STEP} value={amount}
        aria-valuetext={`${fmtMoney(amount)}${amount > reserve ? ', over the reserve' : ''}`}
        onChange={e => onAmount(Number(e.target.value))}
      />
    </div>
  )
}
