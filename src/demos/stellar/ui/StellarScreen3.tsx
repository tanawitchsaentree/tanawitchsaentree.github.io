'use client'

import { useRef, useEffect, useState } from 'react'
import { StellarPhone, useBotFinger } from './StellarPhone'

const CSS = `
.s3-app{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--stellar-white);font-family:'DM Sans',sans-serif}

/* top */
.s3-top{flex:none;padding:18px 18px 10px;position:relative}
.s3-close{position:absolute;top:16px;right:16px;color:var(--stellar-ink-soft-app);cursor:default;background:none;border:0;padding:0;display:grid;place-content:center}
.s3-top h3{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:19px;color:var(--stellar-ink-app);margin:0;line-height:1.15}
.s3-top p{font-size:11.5px;color:var(--stellar-muted-app);margin:3px 0 0}
.s3-search{display:flex;align-items:center;gap:8px;background:var(--stellar-surface-soft);border:1px solid color-mix(in srgb, var(--stellar-ink-app) 10%, transparent);border-radius:12px;padding:10px 13px;margin-top:12px}
.s3-search svg{color:var(--stellar-lime);flex:none}
.s3-search span{font-size:12px;color:var(--stellar-muted-app)}

/* scrollable body */
.s3-body{flex:1;overflow-y:auto;padding:4px 18px 8px;scrollbar-width:none}
.s3-body::-webkit-scrollbar{display:none}
.s3-cat{font-size:11px;font-weight:700;color:var(--stellar-ink-app);margin:14px 0 8px;letter-spacing:.01em}
.s3-chips{display:flex;flex-wrap:wrap;gap:7px}
.s3-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--stellar-ink-soft-app);background:var(--stellar-white);border:1px solid color-mix(in srgb, var(--stellar-ink-app) 10%, transparent);border-radius:999px;padding:7px 12px 7px 10px;cursor:pointer;transition:border-color .16s cubic-bezier(.16,1,.3,1),background .16s cubic-bezier(.16,1,.3,1),color .16s cubic-bezier(.16,1,.3,1);user-select:none}
.s3-chip .pl{display:grid;place-content:center;color:var(--stellar-lime);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}
.s3-chip:hover{border-color:var(--stellar-lime-mid)}
.s3-chip.sel{background:var(--stellar-lime);border-color:var(--stellar-lime);color:var(--stellar-white)}
.s3-chip.sel .pl{color:var(--stellar-white);transform:rotate(45deg)}

/* bottom bar */
.s3-bottom{flex:none;display:flex;align-items:center;gap:12px;padding:12px 16px 16px;border-top:1px solid color-mix(in srgb, var(--stellar-ink-app) 6%, transparent);background:var(--stellar-white)}
.s3-mini{width:38px;height:38px;display:grid;place-content:center;color:var(--stellar-ink-soft-app);cursor:default;background:transparent;border:0;border-radius:50%;flex:none}
.s3-feed{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(180deg,var(--stellar-lime-mid),var(--stellar-lime));color:var(--stellar-white);font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:15px;padding:14px;border-radius:999px;border:0;cursor:default;box-shadow:0 8px 22px color-mix(in srgb, var(--stellar-lime) 40%, transparent)}
.s3-feed .cnt{font-family:'Space Mono',monospace;font-size:11px;background:color-mix(in srgb, var(--stellar-white) 25%, transparent);padding:1px 7px;border-radius:999px;font-weight:400}

/* cooking overlay */
.s3-cook{position:absolute;inset:0;z-index:30;background:color-mix(in srgb, var(--stellar-white) 96%, transparent);backdrop-filter:blur(4px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:30px;text-align:center;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .35s cubic-bezier(.16,1,.3,1),visibility 0s linear .35s}
.s3-cook.show{opacity:1;visibility:visible;pointer-events:auto;transition:opacity .35s cubic-bezier(.16,1,.3,1)}
.s3-pan{width:64px;height:64px;border-radius:50%;border:3px solid var(--stellar-cta-bg-strong);border-top-color:var(--stellar-lime);animation:s3spin 1s cubic-bezier(.65,0,.35,1) infinite}
@keyframes s3spin{to{transform:rotate(360deg)}}
.s3-cook .ct{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:16px;color:var(--stellar-ink-app)}
.s3-cook .cs{font-size:12px;color:var(--stellar-muted-app);max-width:24ch}

/* result card */
.s3-result{position:absolute;inset:0;z-index:31;background:var(--stellar-white);display:flex;flex-direction:column;opacity:0;visibility:hidden;transform:translateY(18px);transition:opacity .4s cubic-bezier(.16,1,.3,1),transform .45s cubic-bezier(.34,1.56,.64,1),visibility 0s linear .45s}
.s3-result.show{opacity:1;visibility:visible;transform:none;transition:opacity .4s cubic-bezier(.16,1,.3,1),transform .45s cubic-bezier(.34,1.56,.64,1)}
.s3-rhead{position:relative;height:160px;background:radial-gradient(120% 120% at 40% 30%,var(--stellar-photo-green-light),var(--stellar-photo-green-dark));display:flex;align-items:flex-end;padding:14px 16px;flex:none}
.s3-rback{position:absolute;top:14px;left:14px;width:32px;height:32px;border-radius:50%;background:color-mix(in srgb, var(--stellar-white) 90%, transparent);display:grid;place-content:center;color:var(--stellar-ink-app);cursor:default;border:0}
.s3-rhead .rt{color:var(--stellar-white)}
.s3-rhead .rt .nm{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:19px;text-shadow:0 1px 8px color-mix(in srgb, var(--stellar-black) 30%, transparent)}
.s3-rhead .rt .rm{display:flex;gap:14px;font-size:11px;margin-top:3px;opacity:.95}
.s3-rbody{flex:1;overflow-y:auto;padding:16px;scrollbar-width:none}
.s3-rbody::-webkit-scrollbar{display:none}
.s3-rbody .lbl{font-size:11px;font-weight:700;color:var(--stellar-green-deep);text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px}
.s3-uses-from{font-size:11px;color:var(--stellar-muted-app);margin-bottom:14px}
.s3-ing{display:flex;align-items:center;gap:9px;padding:9px 0;border-bottom:1px solid color-mix(in srgb, var(--stellar-ink-app) 6%, transparent);font-size:12.5px;color:var(--stellar-ink-app)}
.s3-ing .dot{width:18px;height:18px;border-radius:6px;background:var(--stellar-cta-bg-soft);border:1px solid var(--stellar-cta-bg-strong);display:grid;place-content:center;color:var(--stellar-lime);flex:none}
.s3-ing.have .dot{background:var(--stellar-lime);border-color:var(--stellar-lime);color:var(--stellar-white)}
.s3-ing .ix{margin-left:auto;font-size:10px;font-family:'Space Mono',monospace;color:var(--stellar-muted-app)}
.s3-ing.have .ix{color:var(--stellar-green-deep)}

/* bot */
.sbot-finger{opacity:0;transition:opacity 300ms}
.sbot-finger.sbot-show{opacity:1}
.sbot-ripple{opacity:0}
.sbot-go{animation:sbot-rip .55s cubic-bezier(.16,1,.3,1)}
@keyframes sbot-rip{0%{opacity:.6;transform:translate(var(--rx),var(--ry)) scale(.4)}100%{opacity:0;transform:translate(var(--rx),var(--ry)) scale(2.4)}}
@media(prefers-reduced-motion:reduce){.sbot-finger,.sbot-ripple{display:none}}
`

const ICON_PLUS = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`
const ICON_CHECK = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
const ICON_ADD = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`

const INGREDIENTS: Record<string, string[]> = {
  produce:  ['Tomatoes', 'Onion', 'Garlic', 'Peppers', 'Spinach', 'Lemon'],
  protein:  ['Chicken', 'Eggs', 'Salmon', 'Tofu', 'Beef'],
  dairy:    ['Milk', 'Cheese', 'Yogurt', 'Butter'],
  grain:    ['Rice', 'Pasta', 'Bread', 'Oats'],
  pantry:   ['Olive Oil', 'Canned Tomatoes', 'Spices', 'Soy Sauce', 'Honey'],
}

const BOT_PICKS = ['Tomatoes', 'Garlic', 'Chicken', 'Rice', 'Olive Oil']

export function StellarScreen3() {
  const screenRef  = useRef<HTMLDivElement>(null)
  const bodyRef    = useRef<HTMLDivElement>(null)
  const feedRef    = useRef<HTMLButtonElement>(null)
  const cntRef     = useRef<HTMLSpanElement>(null)
  const cookRef    = useRef<HTMLDivElement>(null)
  const cookMsgRef = useRef<HTMLDivElement>(null)
  const resultRef  = useRef<HTMLDivElement>(null)
  const backRef    = useRef<HTMLButtonElement>(null)

  const { fingerEl, rippleEl, bot } = useBotFinger(screenRef)

  /* WCAG 2.2.2 — auto-playing bot demo runs indefinitely, so it needs a
     user-operable pause control independent of prefers-reduced-motion. */
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)
  useEffect(() => { pausedRef.current = paused }, [paused])

  useEffect(() => {
    const screen = screenRef.current
    const bodyEl = bodyRef.current
    if (!screen || !bodyEl) return
    const sc = screen
    const bd = bodyEl
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let cancelled = false
    /* pauseable wait — polls the paused flag so the loop can be halted between steps */
    const wait = (ms: number) => new Promise<void>(resolve => {
      let remaining = ms
      const tick = () => {
        if (cancelled) { resolve(); return }
        if (pausedRef.current) { setTimeout(tick, 150); return }
        if (remaining <= 0) { resolve(); return }
        const step = Math.min(100, remaining)
        setTimeout(() => { remaining -= step; tick() }, step)
      }
      tick()
    })

    /* ---- build ingredient chips ---- */
    let selected = 0

    function toggleChip(el: HTMLElement) {
      el.classList.toggle('sel')
      selected = sc.querySelectorAll('.s3-chip.sel').length
      if (cntRef.current) cntRef.current.textContent = String(selected)
    }

    function buildChips() {
      Object.entries(INGREDIENTS).forEach(([cat, items]) => {
        const wrap = bd.querySelector<HTMLDivElement>(`.s3-chips[data-cat="${cat}"]`)
        if (!wrap) return
        items.forEach(name => {
          const b = document.createElement('div')
          b.className = 's3-chip'
          b.dataset.name = name
          b.innerHTML = `<span class="pl">${ICON_PLUS}</span><span>${name}</span>`
          b.addEventListener('click', () => toggleChip(b))
          wrap.appendChild(b)
        })
      })
    }
    buildChips()

    function chip(name: string): HTMLElement | null {
      return bd.querySelector<HTMLElement>(`.s3-chip[data-name="${name}"]`)
    }

    /* ---- scroll helper ---- */
    function inView(el: HTMLElement) {
      const br = bd.getBoundingClientRect()
      const cr = el.getBoundingClientRect()
      return cr.top >= br.top + 10 && cr.bottom <= br.bottom - 10
    }

    function smoothScroll(to: number) {
      return new Promise<void>(res => {
        const start = bd.scrollTop
        const max = bd.scrollHeight - bd.clientHeight
        const dest = Math.max(0, Math.min(to, max))
        const d = dest - start
        const dur = 520
        if (Math.abs(d) < 2) { res(); return }
        let t0: number | null = null
        function step(t: number) {
          if (!t0) t0 = t
          const p = Math.min((t - t0) / dur, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          bd.scrollTop = start + d * ease
          if (p < 1) requestAnimationFrame(step); else res()
        }
        requestAnimationFrame(step)
      })
    }

    async function bringIntoView(el: HTMLElement) {
      if (inView(el)) return
      const br = bd.getBoundingClientRect()
      const cr = el.getBoundingClientRect()
      await smoothScroll(bd.scrollTop + (cr.top - br.top) - br.height / 2 + cr.height / 2)
      await wait(140)
    }

    /* ---- reset ---- */
    function reset() {
      sc.querySelectorAll('.s3-chip.sel').forEach(c => c.classList.remove('sel'))
      selected = 0
      if (cntRef.current) cntRef.current.textContent = '0'
      bd.scrollTop = 0
      resultRef.current?.classList.remove('show')
      cookRef.current?.classList.remove('show')
    }

    /* ---- loop ---- */
    async function loop() {
      while (!cancelled) {
        reset()
        await wait(reduced ? 1400 : 700)

        if (reduced) {
          BOT_PICKS.forEach(n => { const c = chip(n); if (c) c.classList.add('sel') })
          selected = BOT_PICKS.length
          if (cntRef.current) cntRef.current.textContent = String(selected)
          await wait(1000)
          if (cookRef.current) cookRef.current.classList.add('show')
          await wait(1600)
          cookRef.current?.classList.remove('show')
          resultRef.current?.classList.add('show')
          await wait(4500)
          continue
        }

        bot.current.show()
        await wait(450)

        /* 1. tap each ingredient (scroll into view first) */
        for (const name of BOT_PICKS) {
          if (cancelled) return
          const c = chip(name)
          if (!c) continue
          await bringIntoView(c)
          await bot.current.tap(c, () => toggleChip(c))
          await wait(170)
        }
        await wait(400)

        /* 2. tap Feed me! */
        const feedEl = feedRef.current
        if (feedEl) await bot.current.tap(feedEl, () => {})
        bot.current.hide()

        /* 3. cooking overlay → result */
        if (cookMsgRef.current) cookMsgRef.current.textContent = `Reading your ${selected} ingredients`
        if (cookRef.current) cookRef.current.classList.add('show')
        await wait(1700)
        cookRef.current?.classList.remove('show')
        resultRef.current?.classList.add('show')
        await wait(2600)

        /* 4. tap back */
        bot.current.show()
        const backEl = backRef.current
        if (backEl) await bot.current.tap(backEl, () => { resultRef.current?.classList.remove('show') })
        bot.current.hide()
        await wait(900)
      }
    }

    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { io.disconnect(); setTimeout(loop, 700) }
    }, { threshold: 0.4 })
    io.observe(sc)
    return () => { cancelled = true; io.disconnect() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* pause/play control — WCAG 2.2.2, independent of prefers-reduced-motion.
     Rendered via StellarPhone's `controls` slot so it floats above the case,
     never overlapping in-app UI. */
  const pauseButton = (
    <button
      type="button"
      onClick={() => setPaused(p => !p)}
      aria-label={paused ? 'Play demo animation' : 'Pause demo animation'}
      aria-pressed={paused}
      style={{
        position: 'absolute', top: -20, right: -6, zIndex: 96,
        width: 34, height: 34, borderRadius: '50%',
        display: 'grid', placeContent: 'center',
        background: 'color-mix(in srgb, var(--stellar-black) 65%, transparent)',
        border: '1px solid color-mix(in srgb, var(--stellar-white) 30%, transparent)',
        color: 'var(--stellar-white)', cursor: 'pointer', padding: 0,
        backdropFilter: 'blur(4px)',
      }}
    >
      {paused ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
      )}
    </button>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <StellarPhone controls={pauseButton}>
        <div ref={screenRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div className="s3-app">

            {/* top */}
            <div className="s3-top">
              <button className="s3-close" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
              <h3>What&apos;s in Your Kitchen?</h3>
              <p>Tap what you&apos;ve got, and I&apos;ll cook around it.</p>
              <div className="s3-search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                <span>Type to search!</span>
              </div>
            </div>

            {/* scrollable ingredient list */}
            <div ref={bodyRef} className="s3-body">
              <div className="s3-cat">Produce</div>
              <div className="s3-chips" data-cat="produce" />
              <div className="s3-cat">Proteins</div>
              <div className="s3-chips" data-cat="protein" />
              <div className="s3-cat">Dairy</div>
              <div className="s3-chips" data-cat="dairy" />
              <div className="s3-cat">Grains</div>
              <div className="s3-chips" data-cat="grain" />
              <div className="s3-cat">Pantry</div>
              <div className="s3-chips" data-cat="pantry" />
            </div>

            {/* bottom bar */}
            <div className="s3-bottom">
              <button className="s3-mini" aria-label="Filter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
              </button>
              <button className="s3-mini" aria-label="Edit">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
              <button ref={feedRef} className="s3-feed" aria-label="Feed me">
                Feed me! <span ref={cntRef} className="cnt">0</span>
              </button>
            </div>

            {/* cooking overlay */}
            <div ref={cookRef} className="s3-cook">
              <div className="s3-pan" />
              <div className="ct">Cooking up something…</div>
              <div ref={cookMsgRef} className="cs">Reading your ingredients</div>
            </div>

            {/* result card */}
            <div ref={resultRef} className="s3-result">
              <div className="s3-rhead">
                <button ref={backRef} className="s3-rback" aria-label="Back">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className="rt">
                  <div className="nm">Garlic Tomato Chicken Rice</div>
                  <div className="rm"><span>1 to grab</span><span>30 mins</span></div>
                </div>
              </div>
              <div className="s3-rbody">
                <p className="s3-uses-from">Built from <b>5 things you have</b> + 1 to grab.</p>
                <p className="lbl">Ingredients</p>
                {[
                  { name: 'Chicken',    have: true },
                  { name: 'Rice',       have: true },
                  { name: 'Tomatoes',   have: true },
                  { name: 'Garlic',     have: true },
                  { name: 'Olive Oil',  have: true },
                  { name: 'Fresh parsley', have: false },
                ].map(({ name, have }) => (
                  <div key={name} className={`s3-ing${have ? ' have' : ''}`}>
                    <span className="dot" dangerouslySetInnerHTML={{ __html: have ? ICON_CHECK : ICON_ADD }} />
                    {name}
                    <span className="ix">{have ? 'have' : 'grab'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* bot overlay */}
          {rippleEl}
          {fingerEl}
        </div>
      </StellarPhone>
    </>
  )
}
