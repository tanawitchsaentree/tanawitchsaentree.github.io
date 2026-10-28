'use client'

import type { CSSProperties } from 'react'
import { T } from './tokens'
import { BEATS, CAR, DISCLAIMER, PRESET_LINES, WINDOW, type Zone } from './story'
import s from './TimsTicket.module.css'

const ZONE: Record<Zone, string> = {
  fresh: T.color.green,
  late:  T.color.amber,
  done:  T.color.ink,
}

// Tokens reach the CSS module as custom properties, so the stylesheet never holds a literal color.
const VARS = {
  '--t-paper':      T.color.ticket,
  '--t-ink':        T.color.ink,
  '--t-ink-soft':   T.color.inkSoft,
  '--t-red':        T.color.red,
  '--t-rule':       T.alpha.ink18,
  '--t-rule-soft':  T.alpha.ink10,
  '--t-shadow-a':   T.alpha.ink10,
  '--t-shadow-b':   T.alpha.ink18,
  '--ease-expo':    T.ease.expo,
  '--ease-smooth':  T.ease.smooth,
  '--ease-snap':    T.ease.spring,
} as CSSProperties

/** The order this page follows. `moment` is the section currently in the middle of the screen. */
export function TimsTicket({ moment }: { moment: number }) {
  const beat = BEATS[Math.min(Math.max(moment, 0), BEATS.length - 1)]
  const p = Math.min(beat.at / WINDOW, 1)

  return (
    // Decorative echo of the prose; the same facts are in the page text.
    <aside className={s.rail} data-on={beat.show} aria-hidden="true" style={VARS}>
      <div className={s.paper}>
        <div className={s.slip} style={{ '--z': ZONE[beat.zone], '--p': p, '--preset-lines': PRESET_LINES } as CSSProperties}>
          <p className={s.head}>{CAR.header}</p>
          <p className={s.car}>{CAR.car}</p>

          <div className={s.linesWrap}>
            <span className={s.preset} data-on={beat.preset} />
            <ul className={s.lines}>
            {beat.lines.map((l, i) => {
              const size = i === 0
              return (
                <li key={l.text} className={`${s.line} ${l.custom ? s.custom : ''}`}>
                  {size && beat.changed
                    ? <><span className={s.struck}>{l.text}</span><span className={s.swap}>Medium</span></>
                    : l.text}
                </li>
              )
            })}
            </ul>
          </div>
          <p className={s.presetTag} data-on={beat.preset}>
            First {PRESET_LINES} lines · one tap
          </p>

          <div className={s.ruler}>
            <div className={s.rulerHead}><span>0</span><span>{WINDOW}s window · illustrated</span></div>
            <div className={s.track}>
              <div className={s.trackClip}><div className={s.mark} /></div>
              <div className={s.tickWrap}><span className={s.tick} /></div>
            </div>
          </div>

          <p className={s.status}><span className={s.dot} />{beat.status}</p>
          <p className={s.note}>{beat.note}</p>
          <p className={s.fine}>{DISCLAIMER}</p>

          <span className={s.stamp} data-on={beat.stamp !== ''}>{beat.stamp || 'Served'}</span>
        </div>
      </div>
    </aside>
  )
}
