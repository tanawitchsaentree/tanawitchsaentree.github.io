'use client'

import type { Entry } from './useInvitrace'
import s from './invitrace.module.css'

export function LogEntry({ e, onRecord }: { e: Entry; onRecord?: (record: string) => void }) {
  return (
    <li className={s.entry} data-blocked={e.blocked || undefined}>
      <div className={s.entryTop}>
        <span className={s.entryN}>#{e.n}</span>
        {e.blocked && <span className={s.entryBadge}>✕ Blocked</span>}
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
      <p className={s.entryWhy}>{e.why}{e.rule && <> <a href={e.rule.href} className={s.entryRule} onClick={ev => { const rec = e.rule!.href.startsWith('#ix-rec-') ? e.rule!.href.slice(8) : null; if (rec && onRecord) { ev.preventDefault(); onRecord(rec) } }}>{e.rule.label}</a></>}</p>
      {e.figma && <p className={s.entryFigma}><span className={s.entryKey}>Design file</span> {e.figma}</p>}
      {e.code && (
        <pre className={s.entryCode} aria-label="Token diff"><code>{e.code.map((l, i) => (
          <span key={i} className={l.startsWith('+') ? s.add : l.startsWith('-') ? s.del : undefined}>{l}{'\n'}</span>
        ))}</code></pre>
      )}
    </li>
  )
}

/** The persistent change log beside the console (desktop) and the full list at the end. */
export function ChangeLog({ log, id, latestOnly, onRecord }: { log: Entry[]; id?: string; latestOnly?: boolean; onRecord?: (record: string) => void }) {
  const shown = latestOnly ? log.slice(0, 1) : log
  return (
    <div className={latestOnly ? s.logLatest : s.log} id={id} data-count={log.length}>
      {!latestOnly && <div className={s.logHead}><span>Change log</span><span>{log.length} {log.length === 1 ? 'entry' : 'entries'}</span></div>}
      {shown.length === 0
        ? <p className={s.logEmpty}>Nothing changed yet. Every control on this page writes an entry here.</p>
        : <ol className={s.logList} reversed>{shown.map(e => <LogEntry key={e.n} e={e} onRecord={onRecord} />)}</ol>}
    </div>
  )
}
