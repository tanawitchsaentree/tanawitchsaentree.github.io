'use client'
import type { CSSProperties } from 'react'
import { V } from '../tokens'
import { PhoneShell } from '../ui/PhoneShell'
import { READINGS, everyoneScore, personalCheck, shownValue, type Missing, type ScoreMode } from './scoreModel'
import s from './VitaeScore.module.css'

/* Vitae palette handed to the CSS module as custom properties, scoped to this surface. */
const VARS = {
  '--v-ink': V.color.ink,
  '--v-ink-soft': V.color.inkSoft,
  '--v-muted': V.color.muted,
  '--v-paper': V.color.paper2,
  '--v-screen': V.color.screenBg,
  '--v-lime': V.color.limeDeep,
  '--v-line': V.alpha.ink10,
  '--v-danger': V.color.dangerText,
  '--v-amber': V.color.amber,
} as CSSProperties

const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
const IconDown = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
const IconDash = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>

function Hero({ mode, missing, compact }: { mode: ScoreMode; missing: Missing; compact?: boolean }) {
  const abs = everyoneScore(missing)
  const own = personalCheck(missing)
  return (
    <div className={s.heroWindow} data-compact={compact || undefined}>
      <div className={s.heroPanel} data-active={mode === 'everyone' || undefined} data-from="up" aria-hidden={mode !== 'everyone'}>
        <div className={s.score} data-band={abs.band}>
          <span className={s.num}>{abs.score}</span><span className={s.den}>/100</span>
        </div>
        <div className={s.band} data-band={abs.band}>{abs.band === 'Good' ? <IconCheck /> : abs.band === 'Fair' ? <IconDash /> : <IconDown />}{abs.band}</div>
        <div className={s.basis}>Scored against daily targets</div>
      </div>
      <div className={s.heroPanel} data-active={mode === 'personal' || undefined} data-from="down" aria-hidden={mode !== 'personal'}>
        <div className={s.verdict}><span className={s.verdictIcon} data-off={!own.onTrack || undefined}>{own.onTrack ? <IconCheck /> : <IconDash />}</span>{own.onTrack ? 'On track for you' : 'Off your usual'}</div>
        <div className={s.count} data-partial={own.used < own.total || undefined}>{own.used} of {own.total} readings today</div>
        <div className={s.basis}>Against your last 14 days</div>
      </div>
    </div>
  )
}

function Inputs({ mode, missing, only }: { mode: ScoreMode; missing: Missing; only?: string }) {
  const rows = only ? READINGS.filter(r => r.key === only) : READINGS
  return (
    <div className={s.inputs}>
      {rows.map(r => {
        const v = shownValue(r, mode, missing)
        const mark = mode === 'everyone' ? r.target : r.usual
        return (
          <div key={r.key} className={s.row}>
            <span className={s.label}>{r.label}</span>
            <span className={s.track}>
              <i className={s.fill} style={{ transform: `scaleX(${v === null ? 0 : Math.min(1, v / r.max)})` }} />
              <span className={s.tick} style={{ transform: `translateX(${(mark / r.max) * 100}%)` }} aria-hidden="true" />
            </span>
            <span className={s.value} data-none={v === null || undefined}>{v === null ? 'No reading' : r.format(v)}</span>
          </div>
        )
      })}
      {!only && <div className={s.legend}><span className={s.legendTick} aria-hidden="true" />{mode === 'everyone' ? 'Daily target' : 'Your usual'}</div>}
    </div>
  )
}

/** The Vitae phone with both scoring rules. Controlled by the case study. */
export function VitaeScorePhone({ mode, missing }: { mode: ScoreMode; missing: Missing }) {
  return (
    <div className={s.phoneFit}>
      <PhoneShell>
        <div className={s.screen} style={VARS}>
          <div className={s.top}>
            <div><div className={s.date}>Sun · Aug 10</div><div className={s.greet}>Morning, Sam</div></div>
          </div>
          <Hero mode={mode} missing={missing} />
          <Inputs mode={mode} missing={missing} />
          <div className={s.context}>Sample readings</div>
        </div>
      </PhoneShell>
    </div>
  )
}

/** One small card per rule, side by side, for the missing-reading section. */
export function VitaeScoreCard({ mode, missing, title }: { mode: ScoreMode; missing: Missing; title: string }) {
  const guessed = mode === 'everyone' && missing === 'sleep'
  return (
    <figure className={s.cardFigure}>
      <figcaption className={s.cardTitle}>{title}</figcaption>
      <div className={s.card} style={VARS}>
        <Hero mode={mode} missing={missing} compact />
        <Inputs mode={mode} missing={missing} only="sleep" />
      </div>
      <p className={s.note} data-show={guessed || undefined} aria-hidden={!guessed}>Filled in with 7h 00. The screen doesn&apos;t say so.</p>
    </figure>
  )
}
