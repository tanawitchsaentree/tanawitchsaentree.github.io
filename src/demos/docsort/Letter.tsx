import { LETTER } from './data'
import s from './docsort.module.css'

/**
 * The printed routing label strip across a letter's top edge: a flat rectangle, mono text,
 * a perforation at each end. Never a stamp. Only Friday's copy uses the accent.
 * A new label wipes in left to right (keyed on the text).
 */
export function LabelStrip({ label, accent, className }: { label?: string; accent?: boolean; className?: string }) {
  return (
    <span className={`${s.strip} ${className ?? ''}`} data-accent={accent || undefined} data-empty={!label || undefined}>
      <span className={s.perf} aria-hidden="true" />
      <span key={label ?? ''} className={s.stripText}>{label ?? ''}</span>
      <span className={s.perf} aria-hidden="true" />
    </span>
  )
}

/** site-visit.pdf: one paper, the same size and first two lines wherever it appears. */
export function Letter({ label, accent, describe = true }: { label?: string; accent?: boolean; describe?: boolean }) {
  const name = `${LETTER.file}${label ? `, label ${label}` : ''}`
  return (
    <span className={s.letter} role={describe ? 'img' : undefined} aria-label={describe ? name : undefined} aria-hidden={describe ? undefined : true}>
      <LabelStrip label={label} accent={accent} />
      <span className={s.letterBody}>
        <span className={s.letterFile}>{LETTER.file}</span>
        <span className={s.letterTitle}>{LETTER.lines[0]}</span>
        <span className={s.letterLine}>{LETTER.lines[1]}</span>
        <span className={s.letterBars} aria-hidden="true"><i /><i /><i /><i /><i /></span>
      </span>
    </span>
  )
}

/** Small paper shapes for the week spread, stacked with a fixed offset (no counts). */
export function PaperStack({ n, tray }: { n: number; tray: string }) {
  return (
    <span className={s.tray} aria-hidden="true">
      <span className={s.trayPapers}>
        {Array.from({ length: n }, (_, i) => <i key={i} style={{ transform: `translate(${i * 5}px, ${-i * 4}px)` }} />)}
      </span>
      <span className={s.trayLabel}>{tray}</span>
    </span>
  )
}
