'use client'
import Link from 'next/link'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { ProjectHero } from './ProjectHero'
import s from './StoryShell.module.css'

/* One polite live region per page. Demos call useAnnounce() instead of
   rendering their own role="status". */
const AnnounceContext = createContext<(message: string) => void>(() => {})
export const useAnnounce = () => useContext(AnnounceContext)

type ShellProps = {
  company: string
  period: string
  title: string
  intro: string
  details: readonly (readonly [string, ReactNode])[]
  limits?: string
  children: ReactNode
}

export function StoryShell({ company, period, title, intro, details, limits, children }: ShellProps) {
  const [message, setMessage] = useState('')
  // A trailing no-break space makes a repeated message count as a change.
  const announce = useCallback((next: string) => setMessage(prev => (prev === next ? `${next} ` : next)), [])
  return (
    <AnnounceContext.Provider value={announce}>
      <main className={s.story}>
        <Link className={s.back} href="/">← Portfolio</Link>
        <ProjectHero company={company} period={period} title={title} intro={intro} details={details} />
        {children}
        {limits && <p className={s.limits}>{limits}</p>}
        <footer className={s.footer}><Link href="/">← Back to selected work</Link></footer>
        <p className={s.srOnly} role="status" aria-live="polite">{message}</p>
      </main>
    </AnnounceContext.Provider>
  )
}

type SectionProps = {
  id: string
  title: string
  text: string
  /** Controls and drawers that sit under the section text. */
  aside?: ReactNode
  /** The demo. */
  children: ReactNode
  /** Put the demo on the left. Sections alternate so the eye lands on a different side. */
  flip?: boolean
  /** Text above a full-width demo. */
  stacked?: boolean
}

export function StorySection({ id, title, text, aside, children, flip, stacked }: SectionProps) {
  return (
    <section className={s.section} aria-labelledby={`${id}-title`} data-flip={flip || undefined} data-stacked={stacked || undefined}>
      <div className={s.text}>
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{text}</p>
        {aside}
      </div>
      <div className={s.figure}>{children}</div>
    </section>
  )
}

/** Optional technical notes under a demo. Closed by default, mono, clip-path reveal. */
export function HowItWorks({ id, children }: { id: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={s.how}>
      <button type="button" className={s.howToggle} aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        How it works<span className={s.howIcon} aria-hidden="true" />
      </button>
      <div id={id} className={s.howPanel} hidden={!open}>{children}</div>
    </div>
  )
}

/** Two-option switch built from real buttons with aria-pressed. The thumb slides with transform. */
export function Segmented<T extends string>({ label, options, value, onChange }: {
  label: string
  options: readonly [readonly [T, string], readonly [T, string]]
  value: T
  onChange: (next: T) => void
}) {
  const index = options.findIndex(([v]) => v === value)
  return (
    <div className={s.segmented} role="group" aria-label={label}>
      <span className={s.thumb} style={{ transform: `translateX(${index * 100}%)` }} aria-hidden="true" />
      {options.map(([v, text]) => (
        <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>{text}</button>
      ))}
    </div>
  )
}

/** A single on/off control. */
export function ToggleButton({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={s.toggle} aria-pressed={pressed} onClick={onClick}>
      <span className={s.toggleBox} aria-hidden="true" />{children}
    </button>
  )
}

/** Layout helpers for story files (e.g. the .controls stack under section text). */
export const shellStyles = s
