'use client'

import { useRef, useEffect, useState } from 'react'
import { StellarPhone } from './StellarPhone'

const CSS = `
.s3-app{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--stellar-white);font-family:'DM Sans',sans-serif}

/* top */
.s3-top{flex:none;padding:18px 18px 10px;position:relative}
.s3-close{position:absolute;top:16px;right:16px;color:var(--stellar-ink-soft-app);cursor:default;background:none;border:0;padding:0;display:grid;place-content:center}
.s3-top h3{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:19px;color:var(--stellar-ink-app);margin:0;line-height:1.15}
.s3-top p{font-size:11.5px;color:var(--stellar-ink-soft-app);margin:3px 0 0}
.s3-search{display:flex;align-items:center;gap:8px;background:var(--stellar-surface-soft);border:1px solid color-mix(in srgb, var(--stellar-ink-app) 10%, transparent);border-radius:12px;padding:10px 13px;margin-top:12px}
.s3-search svg{color:var(--stellar-lime);flex:none}
.s3-search span{font-size:12px;color:var(--stellar-ink-soft-app)}

/* scrollable body */
.s3-body{flex:1;overflow-y:auto;padding:4px 18px 8px;scrollbar-width:none}
.s3-body::-webkit-scrollbar{display:none}
.s3-cat{font-size:11px;font-weight:700;color:var(--stellar-ink-app);margin:14px 0 8px;letter-spacing:.01em}
.s3-chips{display:flex;flex-wrap:wrap;gap:7px}
.s3-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--stellar-ink-soft-app);background:var(--stellar-white);border:1px solid color-mix(in srgb, var(--stellar-ink-app) 10%, transparent);border-radius:999px;padding:7px 12px 7px 10px;cursor:pointer;user-select:none}
.s3-chip .pl{display:grid;place-content:center;color:var(--stellar-lime);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}
.s3-chip:hover{border-color:var(--stellar-lime-mid)}
.s3-chip.sel{background:var(--stellar-green-deep);border-color:var(--stellar-green-deep);color:var(--stellar-white)}
.s3-chip.sel .pl{color:var(--stellar-white);transform:rotate(45deg)}

/* bottom bar */
.s3-bottom{flex:none;display:flex;align-items:center;gap:12px;padding:12px 16px 16px;border-top:1px solid color-mix(in srgb, var(--stellar-ink-app) 6%, transparent);background:var(--stellar-white)}
.s3-mini{width:38px;height:38px;display:grid;place-content:center;color:var(--stellar-ink-soft-app);cursor:default;background:transparent;border:0;border-radius:50%;flex:none}
.s3-mini:disabled,.s3-close:disabled{opacity:.38;cursor:default}
.s3-feed{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--stellar-green-deep);color:var(--stellar-white);font-weight:700;font-size:15px;padding:14px;border-radius:999px;border:0;cursor:pointer;box-shadow:0 8px 22px color-mix(in srgb, var(--stellar-green-deep) 30%, transparent);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}
.s3-feed:not(:disabled):active{transform:scale(.97)}
.s3-feed:disabled{background:var(--stellar-surface-soft);color:var(--stellar-ink-soft-app);box-shadow:none;cursor:not-allowed}
.s3-feed .cnt{font-family:'Space Mono',monospace;font-size:11px;background:color-mix(in srgb, var(--stellar-white) 25%, transparent);padding:1px 7px;border-radius:999px;font-weight:400}
.s3-status{position:absolute;left:18px;right:18px;bottom:70px;text-align:center;font-size:10px;color:var(--stellar-ink-soft-app);pointer-events:none}

/* cooking overlay */
.s3-cook{position:absolute;inset:0;z-index:30;background:var(--stellar-white);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:30px;text-align:center;clip-path:circle(0% at 80% 94%);visibility:hidden;pointer-events:none;transition:clip-path .45s cubic-bezier(.65,0,.35,1),visibility 0s .45s}
.s3-cook.show{clip-path:circle(150% at 80% 94%);visibility:visible;pointer-events:auto;transition:clip-path .45s cubic-bezier(.65,0,.35,1)}
.s3-pan{width:64px;height:64px;border-radius:50%;border:3px solid var(--stellar-cta-bg-strong);border-top-color:var(--stellar-lime);animation:s3spin 1s cubic-bezier(.65,0,.35,1) infinite}
@keyframes s3spin{to{transform:rotate(360deg)}}
.s3-cook .ct{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:16px;color:var(--stellar-ink-app)}
.s3-cook .cs{font-size:12px;color:var(--stellar-ink-soft-app);max-width:24ch}

/* result card */
.s3-result{position:absolute;inset:0;z-index:31;background:var(--stellar-white);display:flex;flex-direction:column;visibility:hidden;transform:translateY(100%);transition:transform .5s cubic-bezier(.65,0,.35,1),visibility 0s .5s}
.s3-result.show{visibility:visible;transform:none;transition:transform .5s cubic-bezier(.65,0,.35,1)}
@media(prefers-reduced-motion:reduce){.s3-cook,.s3-cook.show,.s3-result,.s3-result.show,.s3-chip .pl,.s3-feed{transition:none}.s3-pan{animation:none}}
.s3-rhead{position:relative;height:160px;background:radial-gradient(120% 120% at 40% 30%,var(--stellar-photo-green-light),var(--stellar-photo-green-dark));display:flex;align-items:flex-end;padding:14px 16px;flex:none}
.s3-rback{position:absolute;top:14px;left:14px;width:32px;height:32px;border-radius:50%;background:color-mix(in srgb, var(--stellar-white) 90%, transparent);display:grid;place-content:center;color:var(--stellar-ink-app);cursor:pointer;border:0}
.s3-rhead .rt{color:var(--stellar-white)}
.s3-rhead .rt .nm{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:19px;text-shadow:0 1px 8px color-mix(in srgb, var(--stellar-black) 30%, transparent)}
.s3-rhead .rt .rm{display:flex;gap:14px;font-size:11px;margin-top:3px;opacity:.95}
.s3-rbody{flex:1;overflow-y:auto;padding:16px;scrollbar-width:none}
.s3-rbody::-webkit-scrollbar{display:none}
.s3-rbody .lbl{font-size:11px;font-weight:700;color:var(--stellar-green-deep);text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px}
.s3-uses-from{font-size:11px;color:var(--stellar-ink-soft-app);margin-bottom:14px}
.s3-ing{display:flex;align-items:center;gap:9px;padding:9px 0;border-bottom:1px solid color-mix(in srgb, var(--stellar-ink-app) 6%, transparent);font-size:12.5px;color:var(--stellar-ink-app)}
.s3-ing .dot{width:18px;height:18px;border-radius:6px;background:var(--stellar-white);border:1px solid color-mix(in srgb, var(--stellar-ink-app) 18%, transparent);display:grid;place-content:center;color:var(--stellar-ink-soft-app);flex:none}
.s3-ing.have .dot{background:var(--stellar-green-deep);border-color:var(--stellar-green-deep);color:var(--stellar-white)}
.s3-ing .ix{margin-left:auto;font-size:10px;font-family:'Space Mono',monospace;color:var(--stellar-ink-soft-app)}
.s3-ing.have .ix{color:var(--stellar-green-deep)}

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

/* "Feed me!" result — a small recipe table. The recipe with the most overlap
   with the picks wins (ties go to the one needing fewer extra items). Every
   ingredient chip appears in at least one recipe. */
type Recipe = { name: string; mins: number; items: string[] }
const RECIPES: Recipe[] = [
  { name: 'Garlic Tomato Chicken Rice', mins: 30, items: ['Chicken', 'Rice', 'Tomatoes', 'Garlic', 'Olive Oil', 'Fresh Parsley'] },
  { name: 'Spinach Cheese Omelette & Toast', mins: 15, items: ['Eggs', 'Spinach', 'Cheese', 'Butter', 'Bread', 'Onion'] },
  { name: 'Lemon Butter Salmon', mins: 25, items: ['Salmon', 'Lemon', 'Butter', 'Garlic', 'Rice', 'Olive Oil'] },
  { name: 'Sticky Tofu Pepper Stir-Fry', mins: 20, items: ['Tofu', 'Peppers', 'Soy Sauce', 'Honey', 'Garlic', 'Rice'] },
  { name: 'Spiced Beef Pasta Bake', mins: 40, items: ['Beef', 'Pasta', 'Canned Tomatoes', 'Onion', 'Spices', 'Cheese'] },
  { name: 'Honey Yogurt Oat Bowl', mins: 5, items: ['Oats', 'Yogurt', 'Honey', 'Milk', 'Fresh Berries'] },
]
type Result = { recipe: Recipe; picked: string[] }

function pickRecipe(picked: string[]): Result {
  const have = new Set(picked)
  let best = RECIPES[0]
  let bestScore = -1
  let bestMissing = Infinity
  for (const r of RECIPES) {
    const score = r.items.filter(i => have.has(i)).length
    const missing = r.items.length - score
    if (score > bestScore || (score === bestScore && missing < bestMissing)) {
      best = r; bestScore = score; bestMissing = missing
    }
  }
  return { recipe: best, picked }
}

export function StellarScreen3({ announce }: { announce?: (message: string) => void } = {}) {
  const screenRef  = useRef<HTMLDivElement>(null)
  const bodyRef    = useRef<HTMLDivElement>(null)
  const feedRef    = useRef<HTMLButtonElement>(null)
  const cntRef     = useRef<HTMLSpanElement>(null)
  const cookRef    = useRef<HTMLDivElement>(null)
  const cookMsgRef = useRef<HTMLDivElement>(null)
  const resultRef  = useRef<HTMLDivElement>(null)
  const backRef    = useRef<HTMLButtonElement>(null)
  const statusRef  = useRef<HTMLDivElement>(null)
  const announceRef = useRef(announce)
  useEffect(() => { announceRef.current = announce }, [announce])
  const [result, setResult] = useState<Result>(() => pickRecipe(BOT_PICKS))

  useEffect(() => {
    const screen = screenRef.current
    const bodyEl = bodyRef.current
    if (!screen || !bodyEl) return
    const sc = screen
    const bd = bodyEl
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let selected = 0
    let timer = 0

    function toggleChip(el: HTMLElement) {
      el.classList.toggle('sel')
      el.setAttribute('aria-pressed', String(el.classList.contains('sel')))
      selected = sc.querySelectorAll('.s3-chip.sel').length
      if (cntRef.current) cntRef.current.textContent = String(selected)
      if (feedRef.current) feedRef.current.disabled = selected === 0
      if (statusRef.current) statusRef.current.textContent = selected ? `${selected} ingredient${selected === 1 ? '' : 's'} selected` : 'Choose at least one ingredient'
    }

    Object.entries(INGREDIENTS).forEach(([cat, items]) => {
      const wrap = bd.querySelector<HTMLDivElement>(`.s3-chips[data-cat="${cat}"]`)
      if (!wrap || wrap.childElementCount) return
      items.forEach(name => {
        const b = document.createElement('button')
        b.type = 'button'
        b.className = 's3-chip'
        b.dataset.name = name
        b.setAttribute('aria-pressed', 'false')
        b.innerHTML = `<span class="pl">${ICON_PLUS}</span><span>${name}</span>`
        b.addEventListener('click', () => toggleChip(b))
        wrap.appendChild(b)
      })
    })

    function showResult() {
      selected = sc.querySelectorAll('.s3-chip.sel').length
      if (!selected || !cookRef.current || !resultRef.current) return
      const picked = Array.from(sc.querySelectorAll<HTMLElement>('.s3-chip.sel')).map(el => el.dataset.name ?? '').filter(Boolean)
      const next = pickRecipe(picked)
      setResult(next)
      if (cookMsgRef.current) cookMsgRef.current.textContent = `Reading your ${selected} ingredient${selected === 1 ? '' : 's'}`
      cookRef.current.classList.add('show')
      timer = window.setTimeout(() => {
        cookRef.current?.classList.remove('show')
        resultRef.current?.classList.add('show')
        bd.setAttribute('inert', '')
        sc.querySelector('.s3-bottom')?.setAttribute('inert', '')
        backRef.current?.focus()
        const have = next.recipe.items.filter(i => picked.includes(i)).length
        const buy = next.recipe.items.length - have
        announceRef.current?.(`${next.recipe.name}. Uses ${have} of your picks. ${buy === 0 ? 'Nothing to buy.' : `${buy} to buy.`}`)
      }, reduced ? 50 : 700)
    }
    const closeResult = () => { resultRef.current?.classList.remove('show'); bd.removeAttribute('inert'); sc.querySelector('.s3-bottom')?.removeAttribute('inert'); feedRef.current?.focus() }
    const feedEl = feedRef.current
    const backEl = backRef.current
    feedEl?.addEventListener('click', showResult)
    backEl?.addEventListener('click', closeResult)
    return () => {
      window.clearTimeout(timer)
      feedEl?.removeEventListener('click', showResult)
      backEl?.removeEventListener('click', closeResult)
    }
  }, [])

  const pickedSet = new Set(result.picked)
  const haveCount = result.recipe.items.filter(i => pickedSet.has(i)).length
  const grabCount = result.recipe.items.length - haveCount

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <StellarPhone>
        <div ref={screenRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div className="s3-app">

            {/* top */}
            <div className="s3-top">
              <button type="button" className="s3-close" aria-label="Close unavailable in this sample" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
              <h3>What&apos;s in Your Kitchen?</h3>
              <p>Tap what you&apos;ve got, and I&apos;ll cook around it.</p>
              <div className="s3-search">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                <span>Type to search</span>
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
              <button type="button" className="s3-mini" aria-label="Filter unavailable in this sample" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
              </button>
              <button type="button" className="s3-mini" aria-label="Edit unavailable in this sample" disabled>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
              <button ref={feedRef} type="button" className="s3-feed" disabled>
                Feed me! <span ref={cntRef} className="cnt">0</span>
              </button>
            </div>
            <div ref={statusRef} className="s3-status" role={announce ? undefined : 'status'}>Choose at least one ingredient</div>

            {/* cooking overlay */}
            <div ref={cookRef} className="s3-cook">
              <div className="s3-pan" />
              <div className="ct">Cooking up something…</div>
              <div ref={cookMsgRef} className="cs">Reading your ingredients</div>
            </div>

            {/* result card */}
            <div ref={resultRef} className="s3-result">
              <div className="s3-rhead">
                <button ref={backRef} type="button" className="s3-rback" aria-label="Back">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className="rt">
                  <div className="nm">{result.recipe.name}</div>
                  <div className="rm"><span>{grabCount === 0 ? 'Nothing to buy' : `${grabCount} to buy`}</span><span>{result.recipe.mins} mins</span></div>
                </div>
              </div>
              <div className="s3-rbody">
                <p className="s3-uses-from">
                  Built from <b>{haveCount} thing{haveCount === 1 ? '' : 's'} you have</b>.
                </p>
                <p className="lbl">Ingredients</p>
                {result.recipe.items.map(name => {
                  const have = pickedSet.has(name)
                  return (
                    <div key={name} className={`s3-ing${have ? ' have' : ''}`}>
                      <span className="dot" dangerouslySetInnerHTML={{ __html: have ? ICON_CHECK : ICON_ADD }} />
                      {name}
                      <span className="ix">{have ? 'have' : 'to buy'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        </div>
      </StellarPhone>
    </>
  )
}
