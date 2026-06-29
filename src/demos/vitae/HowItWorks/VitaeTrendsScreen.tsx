'use client'

import { useRef } from 'react'
import { V } from '../tokens'
import { useChartBot, type Bar } from './useChartBot'

const BARS: Bar[] = [
  { day: 'Mon', score: 74, verdict: 'Balanced' },
  { day: 'Tue', score: 81, verdict: 'On track' },
  { day: 'Wed', score: 82, verdict: 'On track' },
  { day: 'Thu', score: 77, verdict: 'Balanced' },
  { day: 'Fri', low: true },
  { day: 'Sat', score: 88, verdict: 'Pushing'  },
  { day: 'Sun', score: 71, verdict: 'Rest'      },
]

// ── scoped CSS ──────────────────────────────────────────────────────────────
const _ms = `${V.motion.fingerMoveMs / 1000}s`
const SCREEN_CSS = `
.vt-root{position:absolute;inset:0;display:flex;flex-direction:column;padding:16px 15px 0;font-family:'DM Sans',sans-serif;color:#14210d;background:#fbfdf7}
.vt-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.vt-title{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:15px}
.vt-range{font-family:'Space Mono',monospace;font-size:8.5px;letter-spacing:.06em;text-transform:uppercase;color:#6fa01c;background:#eef2e4;padding:4px 9px;border-radius:99px}
.vt-avg{display:flex;align-items:baseline;gap:6px;margin-bottom:2px}
.vt-big{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:38px;letter-spacing:-.03em;line-height:1}
.vt-den{font-family:'Space Mono',monospace;font-size:9px;color:#8b9580}
.vt-trend{font-family:'Space Mono',monospace;font-size:9px;color:#6fa01c;margin-left:auto;display:flex;align-items:center;gap:3px}
/* chart */
.vt-chart{display:flex;align-items:flex-end;justify-content:space-between;gap:5px;height:120px;margin:14px 0 6px;padding-top:6px}
.vhb{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px;cursor:pointer;height:100%}
.vhb .col{width:100%;border-radius:6px 6px 3px 3px;background:#eef2e4;position:relative;transition:transform .25s ${V.ease.spring}}
.vhb .col i{position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,#a8e02d,#6fa01c)}
.vhb--sparse .col{background:repeating-linear-gradient(45deg,#eef2e4,#eef2e4 3px,#fff 3px,#fff 6px);border:1px dashed #8b9580}
.vhb--sparse .col i{display:none}
.vhb .dl{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:.04em;text-transform:uppercase;color:#8b9580}
.vhb--on .col{transform:scaleY(1.04)}
.vhb--on .dl{color:#14210d}
.vhb--on .col::after{content:"";position:absolute;left:50%;top:-9px;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:#14210d}
/* detail */
.vhd{margin-top:auto;margin-bottom:16px;border-top:1px solid rgba(20,33,13,.06);padding-top:13px;display:flex;align-items:center;gap:12px;min-height:64px}
.vhd-day{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#8b9580;width:48px;flex:none}
.vhd-score{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:30px;letter-spacing:-.03em;line-height:1;color:#14210d}
.vhd-meta{flex:1}
.vhd-verdict{font-family:'Fraunces',serif;font-style:italic;font-size:14px;color:#6fa01c}
.vhd-note{font-size:9.5px;color:#8b9580;margin-top:2px;line-height:1.35}
.vhd--lowconf .vhd-score,.vhd--lowconf .vhd-verdict{color:#d8902e}
.vhd-badge{display:none;font-family:'Space Mono',monospace;font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:#d8902e;padding:3px 7px;border-radius:99px;margin-bottom:4px}
.vhd--lowconf .vhd-badge{display:inline-block}
/* ghost finger — V.ease.glide for smooth decelerate-to-stop finger travel */
.vhf{position:absolute;top:0;left:0;width:28px;height:28px;z-index:20;pointer-events:none;border-radius:50%;background:radial-gradient(circle at 38% 34%,rgba(20,33,13,.42),rgba(20,33,13,.28));border:1.5px solid rgba(255,255,255,.8);box-shadow:0 4px 14px rgba(20,33,13,.3);transform:translate(120px,300px);transition:transform ${_ms} ${V.ease.glide};opacity:0}
.vhf--show{opacity:1}
.vhf--press{transform:translate(var(--fx),var(--fy)) scale(.78)!important;transition:transform .15s ${V.ease.expo}}
.vhr{position:absolute;top:0;left:0;width:28px;height:28px;z-index:19;pointer-events:none;border-radius:50%;border:2px solid #6fa01c;opacity:0;transform:translate(120px,300px) scale(.3)}
.vhr--go{animation:vha-rip .55s ${V.ease.expo}}
@keyframes vha-rip{0%{opacity:.6;transform:translate(var(--rx),var(--ry)) scale(.4)}100%{opacity:0;transform:translate(var(--rx),var(--ry)) scale(2.3)}}
@media(prefers-reduced-motion:reduce){.vhf,.vhr{display:none}}
`

export function VitaeTrendsScreen() {
  const screenRef  = useRef<HTMLDivElement>(null)
  const fingerRef  = useRef<HTMLDivElement>(null)
  const rippleRef  = useRef<HTMLDivElement>(null)
  const barEls     = useRef<(HTMLDivElement | null)[]>([])
  const detailRef  = useRef<HTMLDivElement>(null)
  const dayRef     = useRef<HTMLSpanElement>(null)
  const scoreRef   = useRef<HTMLSpanElement>(null)
  const verdictRef = useRef<HTMLSpanElement>(null)
  const noteRef    = useRef<HTMLSpanElement>(null)

  useChartBot(BARS, { screenRef, fingerRef, rippleRef, barEls, detailRef,
                      dayRef, scoreRef, verdictRef, noteRef })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SCREEN_CSS }} />

      <div ref={screenRef} className="vt-root">

        {/* top */}
        <div className="vt-top">
          <span className="vt-title">Trends</span>
          <span className="vt-range">7 days</span>
        </div>

        {/* avg row */}
        <div className="vt-avg">
          <span className="vt-big">79</span>
          <span className="vt-den">avg</span>
          <span className="vt-trend">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7M9 7h8v8"/>
            </svg>
            +4 vs last wk
          </span>
        </div>

        {/* bar chart */}
        <div className="vt-chart">
          {BARS.map((b, i) => (
            <div
              key={b.day}
              ref={el => { barEls.current[i] = el }}
              className={`vhb${i === 2 ? ' vhb--on' : ''}${b.low ? ' vhb--sparse' : ''}`}
            >
              <span
                className="col"
                style={{ height: b.low ? '46%' : `${b.score}%` }}
              >
                {!b.low && <i />}
              </span>
              <span className="dl">{b.day[0]}</span>
            </div>
          ))}
        </div>

        {/* detail card */}
        <div className="vhd" ref={detailRef}>
          <span className="vhd-day" ref={dayRef}>Wed</span>
          <span className="vhd-score" ref={scoreRef}>82</span>
          <div className="vhd-meta">
            <span className="vhd-badge">Low confidence</span>
            <span className="vhd-verdict" ref={verdictRef} style={{ display: 'block' }}>On track</span>
            <span className="vhd-note" ref={noteRef} style={{ display: 'block' }}>All 4 signals in.</span>
          </div>
        </div>

        {/* ghost */}
        <div className="vhr" ref={rippleRef} />
        <div className="vhf" ref={fingerRef} />
      </div>
    </>
  )
}
