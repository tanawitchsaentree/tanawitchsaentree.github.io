'use client'

import { useId, useState } from 'react'
import s from '../casefile.module.css'

// "How it works": closed by default; the panel only enters the DOM when opened.
// Reveal is clip-path + transform (keyframe on mount), never height.
export function Drawer({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className={s.drawer}>
      <button type="button" className={s.drawerBtn} data-edge aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        <span aria-hidden="true" className={s.drawerGlyph}>{open ? '−' : '+'}</span> How it works
      </button>
      {open && (
        <ul id={id} className={s.drawerPanel} data-edge data-drawer>
          {items.map(t => <li key={t}>{t}</li>)}
        </ul>
      )}
    </div>
  )
}
