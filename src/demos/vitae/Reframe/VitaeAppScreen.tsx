'use client'

import { useState } from 'react'
import { V } from '../tokens'
import { PhoneShell } from '../ui/PhoneShell'

// ── icons (inline SVG strings to avoid dependency) ─────────────────────────
const IconUser  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M5.5 20a7 7 0 0 1 13 0"/></svg>
const IconMove  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5 12 12M12 12 5 19M12 12l4 7M12 12 8 5"/><circle cx="12" cy="12" r="2"/></svg>
const IconChev  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
const ARROW_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`

// ── CSS (scoped to .va-root) ────────────────────────────────────────────────
const APP_CSS = `
.va-root{position:absolute;inset:0;display:flex;flex-direction:column;padding:16px 15px 0;font-family:'DM Sans',sans-serif;color:${V.color.ink};background:${V.color.screenBg}}
.va-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.va-hi{font-family:'Space Mono',monospace;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:${V.color.muted}}
.va-greet{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:14px;color:${V.color.ink};margin-top:2px}
.va-av{width:30px;height:30px;border-radius:50%;background:${V.color.paper2};display:grid;place-content:center;color:${V.color.limeDeep}}
.va-hero{text-align:center;margin-bottom:14px}
.va-score{display:flex;align-items:baseline;justify-content:center;gap:4px;line-height:1}
.va-num{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:62px;letter-spacing:-.03em;color:${V.color.ink}}
.va-den{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:16px;color:${V.color.muted}}
/* .va-conf sits directly under the score number so the "relative, not absolute" framing
   reads together with the number itself, not as a footnote after the verdict/scale. */
.va-conf{font-family:'Space Mono',monospace;font-weight:500;font-size:10.5px;letter-spacing:.03em;color:${V.color.muted};margin:5px 0 10px}
.va-verdict{font-family:'Fraunces',serif;font-style:italic;font-size:16px;color:${V.color.limeDeep};margin:0 0 12px}
.va-band{height:7px;border-radius:99px;background:${V.color.paper2};overflow:hidden;margin:0 6px}
.va-band-fill{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,${V.color.lime},${V.color.limeDeep});transition:width .9s cubic-bezier(.16,1,.3,1)}
.va-scale{display:flex;justify-content:space-between;font-family:'Space Mono',monospace;font-size:7.5px;color:${V.color.muted};margin:5px 6px 0}
.va-move{display:flex;align-items:center;gap:9px;background:${V.color.paper2};border-radius:13px;padding:10px 11px;margin-bottom:9px;transition:background .3s}
.va-move--done{background:${V.alpha.lime28}}
.va-mic{width:26px;height:26px;border-radius:8px;background:${V.color.lime};display:grid;place-content:center;flex:none;color:${V.color.ink}}
.va-mt{font-size:10px;color:${V.color.inkSoft};line-height:1.35;flex:1}
.va-mt b{display:block;color:${V.color.ink};font-weight:700;font-size:11px;margin-top:1px}
.va-do{width:30px;height:30px;border-radius:9px;background:${V.color.limeDeep};color:${V.color.white};border:0;display:grid;place-content:center;flex:none;cursor:pointer;transition:transform .2s cubic-bezier(.34,1.56,.64,1),background .3s}
.va-do--done{background:${V.color.ink}}
.va-toggle{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:none;border:0;border-top:1px solid ${V.alpha.ink06};padding:11px 0 9px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:${V.color.muted};cursor:pointer}
.va-toggle svg{transition:transform .35s cubic-bezier(.16,1,.3,1)}
.va-toggle--open svg{transform:rotate(180deg)}
.va-inputs{max-height:0;overflow:hidden;transition:max-height .45s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column;gap:7px}
.va-inputs--open{max-height:140px}
.va-in{display:flex;align-items:center;gap:8px;font-size:9.5px}
.va-in .vl{width:42px;color:${V.color.inkSoft};flex:none}
.va-in .vb{flex:1;height:5px;border-radius:99px;background:${V.color.paper2};overflow:hidden}
.va-in .vb i{display:block;height:100%;background:${V.color.limeDeep};border-radius:99px}
.va-in .vv{width:30px;text-align:right;font-family:'Space Mono',monospace;font-size:9px;color:${V.color.ink};flex:none}
.va-context{margin-top:auto;border-top:1px solid ${V.alpha.ink06};padding:11px 2px;font-family:'Space Mono',monospace;font-size:8px;letter-spacing:.06em;text-transform:uppercase;text-align:center;color:${V.color.muted}}
`

// ── component ───────────────────────────────────────────────────────────────
export function VitaeAppScreen() {
  const [done, setDone] = useState(false)
  const [inputsOpen, setInputsOpen] = useState(false)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: APP_CSS }} />

      <PhoneShell>
      <div className="va-root">

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
            <span className="va-num">{done ? 88 : 82}</span>
            <span className="va-den">/100</span>
          </div>
          <div className="va-conf">vs your 14-day baseline</div>
          <div className="va-verdict">{done ? 'Ring closed' : 'On track today'}</div>
          <div className="va-band">
            <i className="va-band-fill" style={{ width: done ? '88%' : '82%' }} />
          </div>
          <div className="va-scale">
            <span>Rest</span><span>Balanced</span><span>Pushing</span>
          </div>
        </div>

        {/* one move */}
        <div className={`va-move${done ? ' va-move--done' : ''}`}>
          <span className="va-mic"><IconMove /></span>
          <span className="va-mt">
            Today&apos;s one move
            <b>A 10-min walk closes your ring.</b>
          </span>
          <button type="button" className={`va-do${done ? ' va-do--done' : ''}`}
            aria-label={done ? 'Reset daily move' : 'Mark daily move done'}
            aria-pressed={done}
            onClick={() => setDone(value => !value)}
            dangerouslySetInnerHTML={{ __html: done ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' : ARROW_SVG }} />
        </div>

        {/* inputs toggle */}
        <button type="button" className={`va-toggle${inputsOpen ? ' va-toggle--open' : ''}`}
          aria-expanded={inputsOpen} aria-controls="vitae-score-inputs"
          onClick={() => setInputsOpen(value => !value)}>
          <span>{inputsOpen ? 'Hide the 4 inputs' : 'Show the 4 inputs'}</span>
          <IconChev />
        </button>
        <div id="vitae-score-inputs" className={`va-inputs${inputsOpen ? ' va-inputs--open' : ''}`} aria-hidden={!inputsOpen}>
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

        <div className="va-context">Today · sample readings</div>
      </div>
      </PhoneShell>
    </>
  )
}
