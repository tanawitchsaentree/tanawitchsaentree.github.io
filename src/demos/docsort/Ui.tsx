'use client'

import { createContext, useContext, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { DayKey } from './data'
import type { Shared } from './state'
import s from './docsort.module.css'

// ── Page context, split so a change re-renders only its readers ──
// Actions are stable for the page's life. The shared tree and the spread's done flags each
// have their own context, and the live region keeps its own state (see LiveRegion).
export type Actions = {
  setShared: (f: (p: Shared) => Shared) => void
  say: (text: string) => void
  complete: (d: DayKey) => void
  reduced: () => boolean
  jump: (d: DayKey) => void
}
export const ActionsCtx = createContext<Actions | null>(null)
export const SharedCtx = createContext<Shared | null>(null)
export const DoneCtx = createContext<Record<DayKey, boolean> | null>(null)
export const useActions = () => useContext(ActionsCtx)!
export const useShared = () => useContext(SharedCtx)!
export const useDone = () => useContext(DoneCtx)!

/** The page's one polite live region. Its text lives here, so announcing re-renders nothing else. */
export function LiveRegion({ bind }: { bind: (set: (t: string) => void) => void }) {
  const [said, setSaid] = useState('')
  // A trailing no-break space makes a repeated message count as a change.
  useEffect(() => bind(t => setSaid(p => (p === t ? `${t}\u00a0` : t))), [bind])
  return <div className={s.srOnly} aria-live="polite">{said}</div>
}

// ── One IntersectionObserver for the page: each demo mounts once, 200px early, never unmounts ──
let io: IntersectionObserver | null = null
const pending = new Map<Element, () => void>()
function watch(el: Element, cb: () => void) {
  if (!io) {
    io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const f = pending.get(e.target)
        if (f) { pending.delete(e.target); io?.unobserve(e.target); f() }
      }
    }, { rootMargin: '200px 0px' })
  }
  pending.set(el, cb)
  io.observe(el)
  return () => { pending.delete(el); io?.unobserve(el) }
}

/** Renders children once the slot comes within 200px of the viewport. */
export function MountOnce({ children, minH }: { children: ReactNode; minH: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => (ref.current ? watch(ref.current, () => setOn(true)) : undefined), [])
  return <div ref={ref} className={s.mount} style={on ? undefined : { minHeight: minH }}>{on ? children : null}</div>
}

// ── How it works: a full-width disclosure, revealed with a clip-path wipe ──
export function Drawer({ items, children }: { items: string[]; children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className={s.drawer}>
      <button type="button" className={s.drawerBtn} aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        <span>How it works</span>
        <span aria-hidden="true" className={s.drawerGlyph} data-open={open || undefined}>+</span>
      </button>
      <div id={id} className={s.drawerPanel} hidden={!open}>
        {open && (
          <div className={s.drawerBody}>
            <ul className={s.drawerList}>{items.map(t => <li key={t}>{t}</li>)}</ul>
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tour steps: the reader advances them; nothing auto-advances ──
export function Steps({ names, current, label }: { names: string[]; current: number; label: string }) {
  return (
    <ol className={s.steps} aria-label={label}>
      {names.map((n, i) => (
        <li key={n} className={s.step} aria-current={i === current ? 'step' : undefined} data-done={i < current || undefined}>
          <span className={s.stepNum} aria-hidden="true">{i < current ? <Glyph k="check" /> : i + 1}</span>
          <span>{n}</span>
          {i < current && <span className={s.srOnly}> (done)</span>}
        </li>
      ))}
    </ol>
  )
}

// ── Send to queue: a button that opens a short picker ──
export function QueuePicker({ queues, current, onPick, label = 'Send to queue', quiet }: {
  queues: string[]; current?: string; onPick: (q: string) => void; label?: string; quiet?: boolean
}) {
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const id = useId()
  useEffect(() => {
    if (!open) return
    menu.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const away = (e: PointerEvent) => {
      if (!menu.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])
  const close = () => { setOpen(false); btn.current?.focus() }
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Escape') { e.stopPropagation(); close() }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const items = [...(menu.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
      const i = items.indexOf(e.currentTarget)
      items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus()
    }
  }
  return (
    <div className={s.picker}>
      <button ref={btn} type="button" className={quiet ? s.btnQuiet : s.btnSecondary} aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        {label}
      </button>
      {open && (
        <div
          ref={menu}
          id={id}
          className={s.pickerMenu}
          role="group"
          aria-label={label}
        >
          {queues.map(q => (
            <button key={q} type="button" className={s.pickerItem} aria-current={q === current ? 'true' : undefined} onKeyDown={onKey} onClick={() => { onPick(q); close() }}>
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ResetButton({ show, onReset, id }: { show: boolean; onReset: () => void; id?: string }) {
  if (!show) return null
  return <button id={id} type="button" className={s.btnText} onClick={onReset}>Reset</button>
}

// ── Glyphs as inline SVG: the faces have no ✓ ✕ ⚠ ←, and a font fallback lookup on first
// use costs a long task on a throttled phone. ──
const PATHS = {
  check: 'M3.5 8.5l3 3 6-7',
  cross: 'M4 4l8 8M12 4l-8 8',
  warn: 'M8 2.2L14.6 13.5H1.4Z M8 6.5v3.2 M8 11.6v.1',
  back: 'M13.5 8H3 M7 4L3 8l4 4',
}
export function Glyph({ k, className }: { k: keyof typeof PATHS; className?: string }) {
  return (
    <svg className={`${s.glyph} ${className ?? ''}`} viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
      <path d={PATHS[k]} />
    </svg>
  )
}
