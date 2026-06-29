'use client'

import { useRef } from 'react'
import { V } from '../tokens'
import { useFingerBot } from './useFingerBot'

// ── icons (inline SVG strings to avoid dependency) ─────────────────────────
const IconUser  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M5.5 20a7 7 0 0 1 13 0"/></svg>
const IconMove  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5 12 12M12 12 5 19M12 12l4 7M12 12 8 5"/><circle cx="12" cy="12" r="2"/></svg>
const IconChev  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
const IconToday = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
const IconTrend = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 7-7"/></svg>
const IconMe    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M5.5 20a7 7 0 0 1 13 0"/></svg>
const ARROW_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`

// ── CSS (scoped to .va-root) ────────────────────────────────────────────────
const APP_CSS = `
.va-root{position:absolute;inset:0;display:flex;flex-direction:column;padding:16px 15px 0;font-family:'DM Sans',sans-serif;color:#14210d;background:#fbfdf7}
.va-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.va-hi{font-family:'Space Mono',monospace;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#8b9580}
.va-greet{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:14px;color:#14210d;margin-top:2px}
.va-av{width:30px;height:30px;border-radius:50%;background:#eef2e4;display:grid;place-content:center;color:#6fa01c}
.va-hero{text-align:center;margin-bottom:14px}
.va-score{display:flex;align-items:baseline;justify-content:center;gap:4px;line-height:1}
.va-num{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:62px;letter-spacing:-.03em;color:#14210d}
.va-den{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:16px;color:#8b9580}
.va-verdict{font-family:'Fraunces',serif;font-style:italic;font-size:16px;color:#6fa01c;margin:1px 0 12px}
.va-band{height:7px;border-radius:99px;background:#eef2e4;overflow:hidden;margin:0 6px}
.va-band-fill{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#a8e02d,#6fa01c);transition:width .9s cubic-bezier(.16,1,.3,1)}
.va-scale{display:flex;justify-content:space-between;font-family:'Space Mono',monospace;font-size:7.5px;color:#8b9580;margin:5px 6px 0}
.va-conf{font-family:'Space Mono',monospace;font-size:8.5px;color:#8b9580;margin-top:9px}
.va-move{display:flex;align-items:center;gap:9px;background:#eef2e4;border-radius:13px;padding:10px 11px;margin-bottom:9px;transition:background .3s}
.va-move--done{background:rgba(168,224,45,.28)}
.va-mic{width:26px;height:26px;border-radius:8px;background:#a8e02d;display:grid;place-content:center;flex:none;color:#14210d}
.va-mt{font-size:10px;color:#46553c;line-height:1.35;flex:1}
.va-mt b{display:block;color:#14210d;font-weight:700;font-size:11px;margin-top:1px}
.va-do{width:30px;height:30px;border-radius:9px;background:#6fa01c;color:#fff;border:0;display:grid;place-content:center;flex:none;cursor:pointer;transition:transform .2s cubic-bezier(.34,1.56,.64,1),background .3s}
.va-do--done{background:#14210d}
.va-toggle{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:none;border:0;border-top:1px solid rgba(20,33,13,.06);padding:11px 0 9px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#8b9580;cursor:pointer}
.va-toggle svg{transition:transform .35s cubic-bezier(.16,1,.3,1)}
.va-toggle--open svg{transform:rotate(180deg)}
.va-inputs{max-height:0;overflow:hidden;transition:max-height .45s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column;gap:7px}
.va-inputs--open{max-height:140px}
.va-in{display:flex;align-items:center;gap:8px;font-size:9.5px}
.va-in .vl{width:42px;color:#46553c;flex:none}
.va-in .vb{flex:1;height:5px;border-radius:99px;background:#eef2e4;overflow:hidden}
.va-in .vb i{display:block;height:100%;background:#6fa01c;border-radius:99px}
.va-in .vv{width:30px;text-align:right;font-family:'Space Mono',monospace;font-size:9px;color:#14210d;flex:none}
.va-tabs{margin-top:auto;display:flex;justify-content:space-between;border-top:1px solid rgba(20,33,13,.06);padding:9px 2px 9px}
.va-tab{display:flex;flex-direction:column;align-items:center;gap:3px;font-family:'Space Mono',monospace;font-size:7.5px;letter-spacing:.04em;text-transform:uppercase;color:#8b9580;flex:1;cursor:pointer;transition:color .25s;background:none;border:0}
.va-tab--on{color:#6fa01c}
/* ghost finger */
.va-finger{position:absolute;top:0;left:0;width:28px;height:28px;z-index:20;pointer-events:none;border-radius:50%;background:radial-gradient(circle at 38% 34%,rgba(20,33,13,.42),rgba(20,33,13,.28));border:1.5px solid rgba(255,255,255,.8);box-shadow:0 4px 14px rgba(20,33,13,.3);transform:translate(120px,300px);transition:transform .85s cubic-bezier(.5,0,.2,1);opacity:0}
.va-finger--show{opacity:1}
.va-finger--press{transform:translate(var(--fx),var(--fy)) scale(.78)!important;transition:transform .15s cubic-bezier(.16,1,.3,1)}
.va-ripple{position:absolute;top:0;left:0;width:28px;height:28px;z-index:19;pointer-events:none;border-radius:50%;border:2px solid #6fa01c;opacity:0;transform:translate(120px,300px) scale(.3)}
.va-ripple--go{animation:va-rip .55s cubic-bezier(.16,1,.3,1)}
@keyframes va-rip{0%{opacity:.6;transform:translate(var(--rx),var(--ry)) scale(.4)}100%{opacity:0;transform:translate(var(--rx),var(--ry)) scale(2.3)}}
@media(prefers-reduced-motion:reduce){.va-finger,.va-ripple{display:none}}
`

// ── component ───────────────────────────────────────────────────────────────
export function VitaeAppScreen() {
  const screenRef  = useRef<HTMLDivElement>(null)
  const fingerRef  = useRef<HTMLDivElement>(null)
  const rippleRef  = useRef<HTMLDivElement>(null)
  const numRef     = useRef<HTMLSpanElement>(null)
  const bandRef    = useRef<HTMLElement>(null)
  const verdictRef = useRef<HTMLDivElement>(null)
  const moveRef    = useRef<HTMLDivElement>(null)
  const doBtnRef   = useRef<HTMLButtonElement>(null)
  const toggleRef  = useRef<HTMLButtonElement>(null)
  const inputsRef  = useRef<HTMLDivElement>(null)
  const tabsRef    = useRef<(HTMLButtonElement | null)[]>([])

  useFingerBot({ screenRef, fingerRef, rippleRef, numRef, bandRef, verdictRef,
                 moveRef, doBtnRef, toggleRef, inputsRef, tabsRef })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: APP_CSS }} />

      {/* screen — passed as children into the phone shell */}
      <div ref={screenRef} className="va-root">

        {/* top bar */}
        <div className="va-top">
          <div>
            <div className="va-hi">Wed · Aug 10</div>
            <div className="va-greet">Morning, Sam</div>
          </div>
          <div className="va-av"><IconUser /></div>
        </div>

        {/* score hero */}
        <div className="va-hero">
          <div className="va-score">
            <span className="va-num" ref={numRef}>82</span>
            <span className="va-den">/100</span>
          </div>
          <div className="va-verdict" ref={verdictRef}>On track today</div>
          <div className="va-band">
            <i className="va-band-fill" ref={bandRef as React.RefObject<HTMLElement>} style={{ width: '82%' }} />
          </div>
          <div className="va-scale">
            <span>Rest</span><span>Balanced</span><span>Pushing</span>
          </div>
          <div className="va-conf">vs your 14-day baseline</div>
        </div>

        {/* one move */}
        <div className="va-move" ref={moveRef}>
          <span className="va-mic"><IconMove /></span>
          <span className="va-mt">
            Today&apos;s one move
            <b>A 10-min walk closes your ring.</b>
          </span>
          <button
            ref={doBtnRef}
            className="va-do"
            aria-label="Mark done"
            dangerouslySetInnerHTML={{ __html: ARROW_SVG }}
          />
        </div>

        {/* inputs toggle */}
        <button ref={toggleRef} className="va-toggle">
          <span>Show the 4 inputs</span>
          <IconChev />
        </button>
        <div ref={inputsRef} className="va-inputs">
          {[
            { l: 'Steps',   w: '72%', v: '7.2k' },
            { l: 'Sleep',   w: '88%', v: '7h20' },
            { l: 'Water',   w: '60%', v: '1.4L'  },
            { l: 'Rest HR', w: '80%', v: '58'    },
          ].map(({ l, w, v }) => (
            <div key={l} className="va-in">
              <span className="vl">{l}</span>
              <span className="vb"><i style={{ width: w }} /></span>
              <span className="vv">{v}</span>
            </div>
          ))}
        </div>

        {/* tab bar */}
        <div className="va-tabs">
          {[
            { icon: <IconToday />, label: 'Today' },
            { icon: <IconTrend />, label: 'Trends' },
            { icon: <IconMe />,    label: 'You'    },
          ].map(({ icon, label }, i) => (
            <button
              key={label}
              ref={el => { tabsRef.current[i] = el }}
              className={`va-tab${i === 0 ? ' va-tab--on' : ''}`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {/* ghost finger + ripple */}
        <div ref={rippleRef} className="va-ripple" />
        <div ref={fingerRef} className="va-finger" />
      </div>
    </>
  )
}
