'use client'

import { memo, useCallback, useRef } from 'react'
import type { Entry } from './useInvitrace'
import s from './invitrace.module.css'

// Entries never change once written, so each renders once; a long log costs nothing per action.
export const LogEntry = memo(function LogEntry({ e, onRecord }: { e: Entry; onRecord?: (record: string) => void }) {
  return (
    <li className={s.entry} data-blocked={e.blocked || undefined}>
      <div className={s.entryTop}>
        <span className={s.entryN}>{String(e.n).padStart(3, '0')}</span>
        {e.t && <time className={s.entryTime} dateTime={new Date(e.t).toISOString()}>{new Date(e.t).toTimeString().slice(0, 8)}</time>}
        {e.blocked && <span className={s.entryBadge}><svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg> Blocked</span>}
        {!e.blocked && e.held.length > 0 && <span className={s.entryBadgeHeld}>Held back</span>}
        <span className={s.entryTier}>{e.tier}</span>
      </div>
      <p className={s.entryDid}>{e.did}</p>
      {e.tokens.length > 0 && <p className={s.entryTokens}>{e.tokens.join(' · ')}</p>}
      {(e.followed.length > 0 || e.held.length > 0) && (
        <div className={s.entryFollow}>
          {e.followed.length > 0 && <p><span className={s.entryKey}>Followed</span> {e.followed.join('. ')}.</p>}
          {e.held.length > 0 && <p className={s.entryHeld}><span className={s.entryKey}>Held back</span> {e.held.join('. ')}.</p>}
        </div>
      )}
      {e.trace && (
        <div className={s.entryTrace}><span className={s.entryKey}>{e.trace.label}</span>
          <ol>{e.trace.lines.map((l, i) => <li key={i}>{l}</li>)}</ol>
        </div>
      )}
      <p className={s.entryWhy}>{e.why}{e.rule && <> <a href={e.rule.href} className={s.entryRule} onClick={ev => { const rec = e.rule!.href.startsWith('#ix-rec-') ? e.rule!.href.slice(8) : null; if (rec && onRecord) { ev.preventDefault(); onRecord(rec) } }}>{e.rule.label}</a></>}</p>
      {e.figma && <p className={s.entryFigma}><span className={s.entryKey}>Design file</span> {e.figma}</p>}
      {e.code && (
        <pre className={s.entryCode} aria-label="Token diff"><code>{e.code.map((l, i) => (
          <span key={i} className={l.startsWith('+') ? s.add : l.startsWith('-') ? s.del : undefined}>{l}{'\n'}</span>
        ))}</code></pre>
      )}
    </li>
  )
}, (a, b) => a.e === b.e && !!a.onRecord === !!b.onRecord)

/** The persistent change log beside the console (desktop) and the full list at the end. */
export function ChangeLog({ log, id, latestOnly, onRecord }: { log: Entry[]; id?: string; latestOnly?: boolean; onRecord?: (record: string) => void }) {
  const shown = latestOnly ? log.slice(0, 1) : log
  // A stable handler, so memoised entries still reach the latest store action.
  const latest = useRef(onRecord); latest.current = onRecord
  const record = useCallback((r: string) => latest.current?.(r), [])
  return (
    <div className={latestOnly ? s.logLatest : s.log} id={id} data-count={log.length}>
      {!latestOnly && <div className={s.logHead}><span>Change log</span><span>{log.length} {log.length === 1 ? 'entry' : 'entries'}</span></div>}
      {shown.length === 0
        ? <p className={s.logEmpty}>Nothing changed yet. Every control on this page writes an entry here.</p>
        : <ol className={s.logList} reversed>{shown.map(e => <LogEntry key={e.n} e={e} onRecord={onRecord ? record : undefined} />)}</ol>}
    </div>
  )
}
