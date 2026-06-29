'use client'

import { useRef } from 'react'
import { V } from '../tokens'
import { useKilledBot } from './useKilledBot'

const _ms = `${V.motion.fingerMoveMs / 1000}s`

const SCREEN_CSS = `
/* segmented toggle */
.vk-root{position:absolute;inset:0;display:flex;flex-direction:column;padding:16px 15px;font-family:'DM Sans',sans-serif;color:#14210d}
.vk-seg{position:relative;display:flex;background:#eef2e4;border-radius:11px;padding:3px;margin-bottom:18px}
.vk-seg button{flex:1;position:relative;z-index:2;border:0;background:none;font-family:'DM Sans',sans-serif;font-weight:600;font-size:11px;color:#8b9580;padding:8px 0;cursor:pointer;transition:color .25s ${V.ease.expo};display:flex;align-items:center;justify-content:center;gap:5px}
.vk-pill{position:absolute;top:3px;bottom:3px;left:3px;width:calc(50% - 3px);background:#fff;border-radius:8px;box-shadow:0 2px 6px rgba(20,33,13,.12);transition:transform ${V.motion.durationFast} ${V.ease.spring}}
.vk-root[data-state="shipped"] .vk-pill{transform:translateX(100%)}
.vk-root[data-state="rejected"] button[data-s="rejected"]{color:#c0492f}
.vk-root[data-state="shipped"] button[data-s="shipped"]{color:#6fa01c}
/* body states */
.vk-body{position:relative;flex:1}
.vk-state{position:absolute;inset:0;display:flex;flex-direction:column;opacity:0;transform:translateY(8px);transition:opacity .4s ${V.ease.expo},transform .4s ${V.ease.expo};pointer-events:none}
.vk-root[data-state="rejected"] .vk-state-rej{opacity:1;transform:none;pointer-events:auto}
.vk-root[data-state="shipped"] .vk-state-shp{opacity:1;transform:none;pointer-events:auto}
.vk-kicker{font-family:'Space Mono',monospace;font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:#8b9580;margin-bottom:auto}
.vk-num-wrap{text-align:center;margin-top:10px}
.vk-num{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:70px;letter-spacing:-.03em;line-height:1}
.vk-den{font-family:'Bricolage Grotesque',sans-serif;font-weight:600;font-size:18px;color:#8b9580}
.vk-label{font-family:'Fraunces',serif;font-style:italic;font-size:17px;text-align:center;margin-top:4px}
.vk-base{font-family:'Space Mono',monospace;font-size:8.5px;color:#8b9580;text-align:center;margin-top:8px}
.vk-state-rej .vk-num{color:#c0492f}.vk-state-rej .vk-label{color:#c0492f}
.vk-state-shp .vk-num{color:#14210d}.vk-state-shp .vk-label{color:#6fa01c}
.vk-flag{margin-top:auto;display:flex;gap:8px;background:#fbe9e4;border:1px solid rgba(192,73,47,.25);border-radius:11px;padding:11px;font-size:10px;color:#c0492f;line-height:1.4}
.vk-flag svg{flex:none;margin-top:1px}
.vk-ok{margin-top:auto;display:flex;gap:8px;background:#eef2e4;border-radius:11px;padding:11px;font-size:10px;color:#46553c;line-height:1.4}
.vk-ok svg{flex:none;margin-top:1px;color:#6fa01c}
.vk-ok b{color:#14210d;font-weight:700}
.vk-band{height:7px;border-radius:99px;background:#eef2e4;overflow:hidden;margin:14px 2px 0}
.vk-band i{display:block;height:100%;width:82%;border-radius:99px;background:linear-gradient(90deg,#a8e02d,#6fa01c)}
/* ghost finger */
.vk-finger{position:absolute;top:0;left:0;width:28px;height:28px;z-index:20;pointer-events:none;border-radius:50%;background:radial-gradient(circle at 38% 34%,rgba(20,33,13,.42),rgba(20,33,13,.28));border:1.5px solid rgba(255,255,255,.8);box-shadow:0 4px 14px rgba(20,33,13,.3);transform:translate(120px,90px);transition:transform ${_ms} ${V.ease.glide};opacity:0}
.vk-finger--show{opacity:1}
.vk-finger--press{transform:translate(var(--fx),var(--fy)) scale(.78)!important;transition:transform .15s ${V.ease.expo}}
.vk-ripple{position:absolute;top:0;left:0;width:28px;height:28px;z-index:19;pointer-events:none;border-radius:50%;border:2px solid #14210d;opacity:0;transform:translate(120px,90px) scale(.3)}
.vk-ripple--go{animation:vkrip .55s ${V.ease.expo}}
@keyframes vkrip{0%{opacity:.55;transform:translate(var(--rx),var(--ry)) scale(.4)}100%{opacity:0;transform:translate(var(--rx),var(--ry)) scale(2.3)}}
@media(prefers-reduced-motion:reduce){.vk-finger,.vk-ripple{display:none}}
`

export function VitaeKilledScreen() {
  const screenRef = useRef<HTMLDivElement>(null)
  const fingerRef = useRef<HTMLDivElement>(null)
  const rippleRef = useRef<HTMLDivElement>(null)
  const rootRef   = useRef<HTMLDivElement>(null)
  const rejBtnRef = useRef<HTMLButtonElement>(null)
  const shpBtnRef = useRef<HTMLButtonElement>(null)

  useKilledBot({ screenRef, fingerRef, rippleRef, rejBtnRef, shpBtnRef, rootRef })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SCREEN_CSS }} />

      <div ref={screenRef} style={{ position: 'absolute', inset: 0 }}>
        <div ref={rootRef} className="vk-root" data-state="shipped">

          {/* segmented toggle */}
          <div className="vk-seg">
            <span className="vk-pill" />
            <button ref={rejBtnRef} data-s="rejected" onClick={() => { if (rootRef.current) rootRef.current.dataset.state = 'rejected' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              Rejected
            </button>
            <button ref={shpBtnRef} data-s="shipped" onClick={() => { if (rootRef.current) rootRef.current.dataset.state = 'shipped' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              Shipped
            </button>
          </div>

          {/* body */}
          <div className="vk-body">

            {/* rejected: absolute score */}
            <div className="vk-state vk-state-rej">
              <div className="vk-kicker">Health Score</div>
              <div className="vk-num-wrap">
                <span className="vk-num">78</span>
                <span className="vk-den">/100</span>
              </div>
              <div className="vk-label">You&rsquo;re healthy</div>
              <div className="vk-base">absolute · no context</div>
              <div className="vk-flag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>
                  <path d="M12 9v4M12 17h.01"/>
                </svg>
                <span>Implies a medical claim. A &ldquo;78&rdquo; the morning you&rsquo;re getting sick reassures the wrong person.</span>
              </div>
            </div>

            {/* shipped: relative score */}
            <div className="vk-state vk-state-shp">
              <div className="vk-kicker">Today vs your baseline</div>
              <div className="vk-num-wrap">
                <span className="vk-num">82</span>
                <span className="vk-den">/100</span>
              </div>
              <div className="vk-label">On track today</div>
              <div className="vk-band"><i /></div>
              <div className="vk-base">relative · last 14 days</div>
              <div className="vk-ok">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                <span>Reads your <b>momentum</b>, claims nothing about your health. Clinical signed off.</span>
              </div>
            </div>
          </div>

          <div className="vk-ripple" ref={rippleRef} />
          <div className="vk-finger" ref={fingerRef} />
        </div>
      </div>
    </>
  )
}
