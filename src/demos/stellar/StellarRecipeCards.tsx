'use client'

import { useRef, useEffect } from 'react'
import { S } from './tokens'

const STAR  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l2.9 6.3 6.8.7-5.1 4.6 1.4 6.7L12 17.5 6 20.9l1.4-6.7L2.3 9.6l6.8-.7z"/></svg>`
const FORK  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2a2 2 0 0 0 2-2V2M5 2v9m0 0v11M19 2a4 4 0 0 0-4 4v6h4m0-10v20"/></svg>`
const CLOCK = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`
const CHECK = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`
const BOOK  = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`
const ARROW = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`

const RECIPES = [
  { nm: 'Warming Chicken Noodle Soup', match: 96, rate: '4.4', ing: 10, min: 12, img: '/images/stellareating/recipe card/Warming Chicken Noodle Soup.jpg' },
  { nm: 'Grilled Coconut-Curry Tofu',  match: 91, rate: '4.6', ing: 10, min: 20, img: '/images/stellareating/recipe card/Grilled Coconut-Curry Tofu.jpg'  },
  { nm: 'One-Pot Tomato Pasta',        match: 88, rate: '4.5', ing:  9, min: 25, img: '/images/stellareating/recipe card/One-Pot Tomato Pasta.jpg'         },
  { nm: 'Black Bean & Rice Bowl',      match: 84, rate: '4.3', ing:  8, min: 18, img: '/images/stellareating/recipe card/Black bean.jpg'                   },
  { nm: 'Lemon Garlic Salmon',         match: 80, rate: '4.7', ing:  7, min: 22, img: '/images/stellareating/recipe card/lemon garlic salmon.jpg'          },
] as const

const C = 2 * Math.PI * 24

const CSS = `
.rc-scope{color:var(--stellar-ink-app);max-width:1180px;margin:0 auto;padding:clamp(4rem,10vw,8rem) clamp(1.2rem,5vw,3rem)}
.rc-head{display:flex;align-items:flex-end;justify-content:space-between;gap:2rem;margin-bottom:2.2rem;flex-wrap:wrap}
.rc-head .l .k{font-family:'Space Mono',monospace;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:var(--stellar-green-deep);display:inline-flex;align-items:center;gap:.6em;margin-bottom:1rem}
.rc-head .l .k::before{content:"";width:24px;height:1.5px;background:var(--stellar-green-deep)}
.rc-head .l h2{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;letter-spacing:-.03em;line-height:1.02;font-size:clamp(2rem,4.6vw,3.4rem);margin:0;color:var(--stellar-ink-app)}
.rc-head .l h2 em{font-family:'Fraunces',serif;font-style:italic;font-weight:500;color:var(--stellar-green-deep)}
.rc-head .l p{color:var(--stellar-ink-soft-app);margin:.8rem 0 0;max-width:42ch;font-family:'DM Sans',sans-serif}
.rc-nav{display:flex;gap:.6rem}
.rc-nav button{width:48px;height:48px;border-radius:50%;border:1px solid color-mix(in srgb, var(--stellar-ink-app) 10%, transparent);background:var(--stellar-white);color:var(--stellar-ink-app);
  display:grid;place-content:center;cursor:pointer;transition:transform .2s cubic-bezier(.34,1.56,.64,1),background .2s cubic-bezier(.65,0,.35,1),color .2s cubic-bezier(.65,0,.35,1),border-color .2s cubic-bezier(.65,0,.35,1),box-shadow .2s cubic-bezier(.65,0,.35,1)}
.rc-nav button:hover{background:var(--stellar-lime);border-color:var(--stellar-lime);color:var(--stellar-white);box-shadow:0 10px 24px color-mix(in srgb, var(--stellar-lime) 45%, transparent)}
.rc-nav button:active{transform:scale(.92)}
.rc-nav button:disabled{opacity:.3;cursor:default;background:var(--stellar-white);color:var(--stellar-ink-app);border-color:color-mix(in srgb, var(--stellar-ink-app) 10%, transparent);box-shadow:none}

.rc-rail{display:flex;gap:1.4rem;overflow-x:auto;scroll-snap-type:x mandatory;padding:1.4rem .4rem 2rem;margin:0 -.4rem;
  scrollbar-width:none;-webkit-overflow-scrolling:touch}
.rc-rail::-webkit-scrollbar{display:none}

.rc-card{flex:0 0 clamp(290px,30vw,340px);scroll-snap-align:start;position:relative;aspect-ratio:3/4;border-radius:26px;overflow:hidden;
  cursor:pointer;isolation:isolate;background:var(--stellar-forest-1);
  box-shadow:0 2px 4px color-mix(in srgb, var(--stellar-ink-app) 5%, transparent),0 18px 40px -12px color-mix(in srgb, var(--stellar-ink-app) 28%, transparent);
  transition:transform .5s cubic-bezier(.16,1,.3,1),box-shadow .5s cubic-bezier(.16,1,.3,1)}
.rc-card:hover{transform:translateY(-10px);box-shadow:0 30px 60px -16px color-mix(in srgb, var(--stellar-lime) 55%, transparent)}
.rc-card .photo{position:absolute;inset:0;z-index:0;overflow:hidden}
.rc-card .photo img{width:100%;height:100%;object-fit:cover;object-position:center;display:block;
  transition:transform .9s cubic-bezier(.16,1,.3,1);transform:scale(1.02)}
.rc-card:hover .photo img{transform:scale(1.1)}
.rc-card .veil{position:absolute;inset:0;z-index:1;
  background:linear-gradient(180deg,rgba(10,16,6,.42) 0%,rgba(10,16,6,0) 30%,rgba(10,16,6,.10) 52%,rgba(10,16,6,.85) 100%)}
.rc-top{position:absolute;top:14px;left:14px;right:14px;z-index:3;display:flex;align-items:flex-start;justify-content:space-between}
.rc-match{position:relative;width:54px;height:54px;flex:none}
.rc-match svg{transform:rotate(-90deg)}
.rc-match .track{stroke:color-mix(in srgb, var(--stellar-white) 28%, transparent)}
.rc-match .bar{stroke:var(--stellar-white);stroke-linecap:round;transition:stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)}
.rc-match .pct{position:absolute;inset:0;display:grid;place-content:center;color:var(--stellar-white);font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:14px;line-height:1}
.rc-match .lbl{position:absolute;top:56px;left:50%;transform:translateX(-50%);font-family:'Space Mono',monospace;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:color-mix(in srgb, var(--stellar-white) 85%, transparent);white-space:nowrap}
.rc-save{width:38px;height:38px;border-radius:50%;background:color-mix(in srgb, var(--stellar-white) 16%, transparent);backdrop-filter:blur(8px);border:1px solid color-mix(in srgb, var(--stellar-white) 28%, transparent);
  display:grid;place-content:center;color:var(--stellar-white);cursor:pointer;transition:background .2s cubic-bezier(.65,0,.35,1),transform .2s cubic-bezier(.34,1.56,.64,1)}
.rc-save:hover{background:color-mix(in srgb, var(--stellar-white) 30%, transparent)}.rc-save:active{transform:scale(.88)}
.rc-save.saved{background:var(--stellar-white);color:var(--stellar-lime)}
.rc-chips{position:absolute;top:78px;left:14px;z-index:3;display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.rc-chip{font-family:'Space Mono',monospace;font-size:9.5px;letter-spacing:.05em;text-transform:uppercase;font-weight:700;
  height:24px;padding:0 10px;border-radius:999px;display:inline-flex;align-items:center;gap:5px;
  background:color-mix(in srgb, var(--stellar-black) 52%, transparent);color:var(--stellar-white);border:1px solid color-mix(in srgb, var(--stellar-white) 25%, transparent);backdrop-filter:blur(6px);box-shadow:0 4px 12px color-mix(in srgb, var(--stellar-black) 12%, transparent)}
.rc-chip.alt{background:color-mix(in srgb, var(--stellar-black) 42%, transparent)}
.rc-chip svg{display:block;flex-shrink:0;position:relative;top:-0.5px}
.rc-info{position:absolute;left:0;right:0;bottom:0;z-index:3;padding:18px 18px 20px;color:var(--stellar-white)}
.rc-rate{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--stellar-white);margin-bottom:8px;
  background:color-mix(in srgb, var(--stellar-white) 14%, transparent);backdrop-filter:blur(6px);padding:4px 9px;border-radius:999px;border:1px solid color-mix(in srgb, var(--stellar-white) 20%, transparent)}
.rc-rate svg{color:var(--stellar-star)}
.rc-info h3{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;letter-spacing:-.02em;font-size:1.45rem;line-height:1.08;margin:0;color:var(--stellar-white);text-shadow:0 2px 14px color-mix(in srgb, var(--stellar-black) 40%, transparent)}
.rc-meta{display:flex;gap:16px;margin-top:10px;font-size:12px;color:color-mix(in srgb, var(--stellar-white) 92%, transparent)}
.rc-meta span{display:inline-flex;align-items:center;gap:6px}
.rc-cta{max-height:0;opacity:0;overflow:hidden;transition:max-height .45s cubic-bezier(.16,1,.3,1),opacity .4s cubic-bezier(.16,1,.3,1),margin-top .45s cubic-bezier(.16,1,.3,1)}
.rc-card:hover .rc-cta{max-height:60px;opacity:1;margin-top:14px}
.rc-cta button{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--stellar-white);color:var(--stellar-ink-app);
  border:0;border-radius:12px;padding:12px;font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:13.5px;cursor:pointer;transition:transform .2s cubic-bezier(.34,1.56,.64,1),background .2s cubic-bezier(.65,0,.35,1),color .2s cubic-bezier(.65,0,.35,1)}
.rc-cta button:hover{background:var(--stellar-lime);color:var(--stellar-white)}
.rc-cta button:active{transform:scale(.97)}
.rc-card::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;
  background:linear-gradient(120deg,transparent 30%,color-mix(in srgb, var(--stellar-white) 14%, transparent) 48%,transparent 60%);transition:opacity .5s cubic-bezier(.65,0,.35,1)}
.rc-card:hover::after{opacity:1}
.rc-prog{height:3px;background:color-mix(in srgb, var(--stellar-ink-app) 10%, transparent);border-radius:99px;overflow:hidden;max-width:220px;margin-top:.4rem}
.rc-prog i{display:block;height:100%;background:var(--stellar-green);border-radius:99px;width:30%;transition:transform .2s cubic-bezier(.16,1,.3,1),width .2s cubic-bezier(.16,1,.3,1)}
@media (prefers-reduced-motion:reduce){.rc-card,.rc-card .photo,.rc-cta{transition:none}}
`

export function StellarRecipeCards() {
  const railRef = useRef<HTMLDivElement>(null)
  const progRef = useRef<HTMLElement>(null)
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const rail    = railRef.current
    const prog    = progRef.current
    const prevBtn = prevRef.current
    const nextBtn = nextRef.current
    if (!rail || !prog || !prevBtn || !nextBtn) return
    const rl = rail
    const pg = prog
    const pv = prevBtn
    const nx = nextBtn

    // inject cards
    rl.innerHTML = RECIPES.map((r, i) => {
      const off = (C * (1 - r.match / 100)).toFixed(1)
      const chips = ''
      return `<article class="rc-card" data-i="${i}">
        <div class="photo"><img src="${r.img}" alt="${r.nm}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${i === 0 ? 'high' : 'auto'}"/></div><div class="veil"></div>
        <div class="rc-top">
          <div class="rc-match">
            <svg width="54" height="54" viewBox="0 0 54 54">
              <circle class="track" cx="27" cy="27" r="24" fill="none" stroke-width="4"/>
              <circle class="bar" cx="27" cy="27" r="24" fill="none" stroke-width="4"
                stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}" data-off="${off}"/>
            </svg>
            <span class="pct">${r.match}<small style="font-size:8px">%</small></span>
            <span class="lbl">match</span>
          </div>
          <button class="rc-save" aria-label="save">${BOOK}</button>
        </div>
        <div class="rc-chips">${chips}</div>
        <div class="rc-info">
          <span class="rc-rate">${STAR}${r.rate}</span>
          <h3>${r.nm}</h3>
          <div class="rc-meta"><span>${FORK}${r.ing} ingredients</span><span>${CLOCK}${r.min} min</span></div>
          <div class="rc-cta"><button>View recipe ${ARROW}</button></div>
        </div>
      </article>`
    }).join('')

    // save toggle
    rl.querySelectorAll<HTMLButtonElement>('.rc-save').forEach(b =>
      b.addEventListener('click', e => { e.stopPropagation(); b.classList.toggle('saved') })
    )

    // animate rings on scroll into view
    const ringObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          rl.querySelectorAll<SVGCircleElement>('.bar').forEach(bar => {
            bar.style.strokeDashoffset = bar.dataset.off ?? '0'
          })
          ringObs.unobserve(e.target)
        }
      })
    }, { threshold: 0.3 })
    ringObs.observe(rl)

    function cardW() {
      const c = rl.querySelector<HTMLElement>('.rc-card')
      return c ? c.offsetWidth + 22 : 320
    }

    pv.addEventListener('click', () => rl.scrollBy({ left: -cardW(), behavior: 'smooth' }))
    nx.addEventListener('click', () => rl.scrollBy({ left:  cardW(), behavior: 'smooth' }))

    function update() {
      const max = rl.scrollWidth - rl.clientWidth
      const p   = max > 0 ? rl.scrollLeft / max : 0
      const vis = rl.clientWidth / rl.scrollWidth
      pg.style.width     = Math.max(18, vis * 100) + '%'
      pg.style.transform = `translateX(${p * (100 / Math.max(vis, 0.001) - 100)}%)`
      pv.disabled = rl.scrollLeft < 4
      nx.disabled = rl.scrollLeft > max - 4
    }

    rl.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()

    return () => {
      rl.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ringObs.disconnect()
    }
  }, [])

  return (
    <section
      id="recipe-cards"
      className="stellar-animate"
      style={{ background: S.color.paper2, borderRadius: 40 }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="rc-scope">

        {/* header */}
        <div className="rc-head">
          <div className="l">
            <span className="k">From your kitchen</span>
            <h2>Four matches, <em>ranked for you.</em></h2>
            <p>Stellar returns a shelf of dishes you can actually make. Each one is scored by how well it fits what you have and like.</p>
          </div>
          <nav className="rc-nav" aria-label="Recipe slider">
            <button ref={prevRef} aria-label="previous">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button ref={nextRef} aria-label="next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </nav>
        </div>

        <div ref={railRef} className="rc-rail" />
        <div className="rc-prog"><i ref={progRef} /></div>

      </div>
    </section>
  )
}
