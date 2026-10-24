'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { StellarPhone } from './StellarPhone'

/* Photo chat. The visitor takes the photo: camera, viewfinder, shutter, then the chef answers.
   Everything moves with transform or clip-path. No loop, so nothing runs off-screen. */

const PHOTO = '/images/stellareating/phone%20mockup%20content/ponsu%20query.jpg'
const DISH = '/images/stellareating/phone%20mockup%20content/ponsu%20glazed%20salmon.jpg'

const CSS = `
.s2-app{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--stellar-white)}
.s2-head{display:flex;align-items:center;gap:10px;padding:40px 16px 12px;border-bottom:1px solid color-mix(in srgb, var(--stellar-ink-app) 6%, transparent);flex-shrink:0}
.s2-chef-avatar{width:34px;height:34px;border-radius:10px;background:var(--stellar-lime-mid);display:grid;place-content:center;color:var(--stellar-white);flex-shrink:0}
.s2-who .nm{font-weight:700;font-size:15px;color:var(--stellar-ink-app);line-height:1.1}
.s2-who .st{font-size:10.5px;color:var(--stellar-green-deep);display:flex;align-items:center;gap:4px}
.s2-who .st::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--stellar-lime-mid);display:block}
.s2-msgs{flex:1;min-height:0;overflow:hidden;padding:14px 14px 8px;display:flex;flex-direction:column;justify-content:flex-end;gap:8px}
.s2-msgs[data-idle]{justify-content:flex-start}
.s2-idle{flex:1;display:grid;place-content:center;justify-items:center;gap:12px;text-align:center;color:var(--stellar-ink-soft-app);font-size:12px}
.s2-idle .frame{position:relative;width:150px;height:150px;display:grid;place-content:center;color:var(--stellar-green-deep)}
.s2-idle .frame i{position:absolute;width:26px;height:26px;border-color:var(--stellar-green-deep);border-style:solid;border-width:0}
.s2-idle .frame i:nth-child(1){top:0;left:0;border-top-width:3px;border-left-width:3px;border-top-left-radius:8px}
.s2-idle .frame i:nth-child(2){top:0;right:0;border-top-width:3px;border-right-width:3px;border-top-right-radius:8px}
.s2-idle .frame i:nth-child(3){bottom:0;left:0;border-bottom-width:3px;border-left-width:3px;border-bottom-left-radius:8px}
.s2-idle .frame i:nth-child(4){bottom:0;right:0;border-bottom-width:3px;border-right-width:3px;border-bottom-right-radius:8px}
.s2-in{animation:s2in .38s cubic-bezier(.16,1,.3,1) both}
@keyframes s2in{from{transform:translateY(14px) scale(.96);clip-path:inset(0 0 100% 0 round 17px)}to{transform:none;clip-path:inset(0 0 0 0 round 17px)}}
.s2-msg{max-width:82%;padding:10px 13px;border-radius:17px;font-size:12.5px;line-height:1.5}
.s2-msg.ai{align-self:flex-start;background:var(--stellar-surface-soft);color:var(--stellar-ink-app);border-bottom-left-radius:5px;box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--stellar-ink-app) 7%, transparent)}
.s2-msg.user{align-self:flex-end;background:var(--stellar-green-deep);color:var(--stellar-white);border-bottom-right-radius:5px}
.s2-photo{align-self:flex-end;width:150px;border-radius:17px;border-bottom-right-radius:5px;overflow:hidden;box-shadow:0 8px 20px color-mix(in srgb, var(--stellar-ink-app) 16%, transparent);transform-origin:100% 100%;animation:s2land .55s cubic-bezier(.34,1.56,.64,1) both}
@keyframes s2land{from{transform:translate(-40px,-160px) scale(1.9) rotate(-4deg)}to{transform:none}}
.s2-photo img{display:block;width:100%;height:92px;object-fit:cover}
.s2-typing{align-self:flex-start;background:var(--stellar-surface-soft);border-radius:17px;border-bottom-left-radius:5px;padding:12px 15px;display:flex;gap:4px}
.s2-typing i{width:6px;height:6px;border-radius:50%;background:var(--stellar-muted-app);animation:s2dot 1.1s cubic-bezier(.65,0,.35,1) infinite}
.s2-typing i:nth-child(2){animation-delay:.18s}.s2-typing i:nth-child(3){animation-delay:.36s}
@keyframes s2dot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-3px)}}
.s2-card{align-self:flex-start;width:88%;background:var(--stellar-white);border-radius:16px;border-bottom-left-radius:5px;overflow:hidden;box-shadow:0 0 0 1px color-mix(in srgb, var(--stellar-ink-app) 9%, transparent),0 8px 20px color-mix(in srgb, var(--stellar-ink-app) 9%, transparent)}
.s2-card .body{padding:11px 13px}
.s2-tag{display:inline-flex;align-items:center;gap:5px;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--stellar-green-deep);font-weight:700;margin-bottom:6px}
.s2-card .id{font-weight:600;font-size:12.5px;color:var(--stellar-ink-app)}
.s2-uses{list-style:none;padding:0;margin:8px 0 0;display:grid;gap:5px}
.s2-uses li{font-size:11.5px;color:var(--stellar-ink-soft-app);padding-left:14px;position:relative}
.s2-uses li::before{content:"";position:absolute;left:0;top:.55em;width:5px;height:5px;border-radius:50%;background:var(--stellar-lime-mid)}
.s2-card img{display:block;width:100%;height:64px;object-fit:cover}
.s2-dish{font-weight:700;font-size:13.5px;color:var(--stellar-ink-app)}
.s2-meta{display:flex;gap:12px;font-size:10.5px;color:var(--stellar-ink-soft-app);margin-top:3px}
.s2-input{flex-shrink:0;display:flex;align-items:center;gap:10px;padding:10px 14px 18px;border-top:1px solid color-mix(in srgb, var(--stellar-ink-app) 6%, transparent)}
.s2-cam{position:relative;width:40px;height:40px;border-radius:50%;border:0;background:var(--stellar-green-deep);color:var(--stellar-white);display:grid;place-content:center;flex-shrink:0;cursor:pointer;transition:transform .2s cubic-bezier(.34,1.56,.64,1)}
.s2-cam:active{transform:scale(.9)}
.s2-cam:disabled{background:var(--stellar-surface-soft);color:var(--stellar-muted-app);cursor:default}
.s2-field{flex:1;background:var(--stellar-surface-tint);border-radius:999px;padding:10px 14px;font-size:12px;color:var(--stellar-ink-soft-app);box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--stellar-ink-app) 9%, transparent)}
/* viewfinder */
.s2-finder{position:absolute;inset:0;z-index:20;background:var(--stellar-ink-app);display:flex;flex-direction:column;transform:translateY(100%);transition:transform .5s cubic-bezier(.65,0,.35,1),visibility 0s .5s;visibility:hidden}
.s2-finder[data-open]{transform:none;visibility:visible;transition:transform .5s cubic-bezier(.65,0,.35,1)}
.s2-finder[data-shot]{transform:translateY(100%);visibility:visible;transition:transform .45s cubic-bezier(.65,0,.35,1) .18s,visibility 0s .7s}
.s2-view{position:relative;flex:1;margin:44px 12px 0;border-radius:22px;overflow:hidden}
.s2-view img{width:100%;height:100%;object-fit:cover}
.s2-frame{position:absolute;inset:18% 16%;pointer-events:none}
.s2-frame i{position:absolute;width:22px;height:22px;border-color:var(--stellar-white);border-style:solid;border-width:0}
.s2-frame i:nth-child(1){top:0;left:0;border-top-width:3px;border-left-width:3px;border-top-left-radius:6px}
.s2-frame i:nth-child(2){top:0;right:0;border-top-width:3px;border-right-width:3px;border-top-right-radius:6px}
.s2-frame i:nth-child(3){bottom:0;left:0;border-bottom-width:3px;border-left-width:3px;border-bottom-left-radius:6px}
.s2-frame i:nth-child(4){bottom:0;right:0;border-bottom-width:3px;border-right-width:3px;border-bottom-right-radius:6px}
.s2-hint{position:absolute;left:0;right:0;top:12px;text-align:center;font-size:11px;font-weight:600;color:var(--stellar-white);text-shadow:0 1px 6px color-mix(in srgb, var(--stellar-ink-app) 70%, transparent)}
.s2-flash{position:absolute;inset:0;background:var(--stellar-white);clip-path:circle(0% at 50% 50%);pointer-events:none}
.s2-finder[data-shot] .s2-flash{animation:s2flash .4s cubic-bezier(.16,1,.3,1)}
@keyframes s2flash{0%{clip-path:circle(0% at 50% 50%)}45%,100%{clip-path:circle(75% at 50% 50%)}}
.s2-bar{display:flex;align-items:center;justify-content:center;gap:28px;padding:18px 0 26px}
.s2-shutter{width:62px;height:62px;border-radius:50%;border:0;background:var(--stellar-white);box-shadow:0 0 0 4px var(--stellar-ink-app),0 0 0 7px var(--stellar-white);cursor:pointer;transition:transform .18s cubic-bezier(.34,1.56,.64,1)}
.s2-shutter:active{transform:scale(.9)}
.s2-cancel{min-width:44px;min-height:44px;background:none;border:0;color:var(--stellar-white);font-size:12px;cursor:pointer}
.s2-app :focus-visible{outline:2px solid var(--stellar-lime-mid);outline-offset:3px}
@media(prefers-reduced-motion:reduce){.s2-cam,.s2-shutter{transition:none}.s2-in,.s2-photo,.s2-typing i,.s2-finder[data-shot] .s2-flash{animation:none}.s2-finder,.s2-finder[data-shot]{transition:none}}
`

type Step = 'idle' | 'finder' | 'shot' | 'typing' | 'answer' | 'dish'

const IconCam = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" /><circle cx="12" cy="13" r="3" /></svg>
const IconCheck = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
const IconChef = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" /><path d="M6 17h12" /></svg>

const ORDER: Step[] = ['idle', 'finder', 'shot', 'typing', 'answer', 'dish']
const past = (step: Step, s: Step) => ORDER.indexOf(step) >= ORDER.indexOf(s)

export function StellarScreen2({ announce, resetKey = 0 }: { announce?: (message: string) => void; resetKey?: number }) {
  const [step, setStep] = useState<Step>('idle')
  const timers = useRef<number[]>([])
  const shutterRef = useRef<HTMLButtonElement>(null)
  const camRef = useRef<HTMLButtonElement>(null)
  const msgsRef = useRef<HTMLDivElement>(null)

  const clear = () => { timers.current.forEach(t => window.clearTimeout(t)); timers.current = [] }
  const later = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)) }
  useEffect(() => clear, [])
  useEffect(() => { clear(); setStep('idle') }, [resetKey])
  useEffect(() => { if (step === 'finder') shutterRef.current?.focus() }, [step])

  const openFinder = () => { setStep('finder'); announce?.('Camera open. Press the shutter to take the photo.') }
  const cancel = () => { setStep('idle'); camRef.current?.focus() }
  const shoot = () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const k = reduce ? 0.3 : 1
    setStep('shot')
    msgsRef.current?.focus()
    later(900 * k, () => setStep('typing'))
    later(2000 * k, () => setStep('answer'))
    later(3100 * k, () => {
      setStep('dish')
      announce?.('Photo sent. Chef says it is a bottle of Marukan Ponzu and suggests a ponzu glazed salmon bowl.')
    })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <StellarPhone>
        <div className="s2-app">
          <div className="s2-head">
            <span className="s2-chef-avatar"><IconChef /></span>
            <div className="s2-who"><div className="nm">Chef</div><div className="st">online</div></div>
          </div>

          <div ref={msgsRef} tabIndex={-1} aria-label="Chat with Chef" role="group" className="s2-msgs" data-idle={step === 'idle' || step === 'finder' || undefined}>
            <div className="s2-msg ai">Snap whatever you have and I&apos;ll find you something to cook.</div>
            {(step === 'idle' || step === 'finder') && <div className="s2-idle" aria-hidden="true">
              <div className="frame"><i /><i /><i /><i /><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4M11 2v3.5c0 .8-.4 1.4-1 2-.9.8-1.5 1.9-1.5 3.2V20a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-9.3c0-1.3-.6-2.4-1.5-3.2-.6-.6-1-1.2-1-2V2" /><path d="M8.5 13h7" /></svg></div>
              The bottle you bought for one dish
            </div>}
            {past(step, 'shot') && <>
              <div className="s2-photo"><Image src={PHOTO} alt="Photo of a bottle of ponzu sauce" width={300} height={224} /></div>
              <div className="s2-msg user s2-in" style={{ animationDelay: '.45s' }}>What can I make with this?</div>
            </>}
            {step === 'typing' && <div className="s2-typing s2-in" aria-hidden="true"><i /><i /><i /></div>}
            {past(step, 'answer') && <div className="s2-card s2-in"><div className="body">
              <span className="s2-tag"><IconCheck />Identified</span>
              <div className="id">That&apos;s Marukan Ponzu, a citrus soy sauce. Try it as</div>
              <ul className="s2-uses"><li>a marinade for salmon or chicken</li><li>a dip for dumplings</li><li>a quick salad dressing</li></ul>
            </div></div>}
            {past(step, 'dish') && <div className="s2-card s2-in">
              <Image src={DISH} alt="" width={300} height={160} />
              <div className="body"><div className="s2-dish">Ponzu glazed salmon bowl</div><div className="s2-meta"><span>8 ingredients</span><span>25 mins</span></div></div>
            </div>}
          </div>

          <div className="s2-input">
            <button ref={camRef} type="button" className="s2-cam" aria-label="Open the camera" onClick={openFinder} disabled={step !== 'idle'}><IconCam /></button>
            <div className="s2-field">{step === 'idle' ? 'Tap the camera to snap the bottle' : 'Aa'}</div>
          </div>

          <div className="s2-finder" data-open={step === 'finder' || undefined} data-shot={step === 'shot' || undefined} aria-hidden={step !== 'finder'}>
            <div className="s2-view">
              <Image src={PHOTO} alt="" fill sizes="320px" />
              <div className="s2-frame" aria-hidden="true"><i /><i /><i /><i /></div>
              <div className="s2-hint">Point at the bottle</div>
              <div className="s2-flash" />
            </div>
            <div className="s2-bar">
              <button type="button" className="s2-cancel" onClick={cancel} tabIndex={step === 'finder' ? 0 : -1}>Cancel</button>
              <button ref={shutterRef} type="button" className="s2-shutter" aria-label="Take the photo" onClick={shoot} tabIndex={step === 'finder' ? 0 : -1} />
              <span style={{ width: 44 }} aria-hidden="true" />
            </div>
          </div>
        </div>
      </StellarPhone>
    </>
  )
}
