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
  { nm: 'Warming Chicken Noodle Soup', match: 96, rate: '4.4', ing: 10, min: 12, p: 'p2', tags: [['Perfect Match', false], ['Feel Better', true]]  },
  { nm: 'Grilled Coconut-Curry Tofu',  match: 91, rate: '4.6', ing: 10, min: 20, p: 'p3', tags: [['Asian-inspired', true]]                          },
  { nm: 'One-Pot Tomato Pasta',         match: 88, rate: '4.5', ing:  9, min: 25, p: 'p5', tags: [['Comfort', true]]                                 },
  { nm: 'Black Bean & Rice Bowl',       match: 84, rate: '4.3', ing:  8, min: 18, p: 'p4', tags: [['High Protein', false], ['Budget', true]]         },
  { nm: 'Lemon Garlic Salmon',          match: 80, rate: '4.7', ing:  7, min: 22, p: 'p1', tags: [['Omega-3', true]]                                 },
] as const

const C = 2 * Math.PI * 24

const CSS = `
.rc-scope{color:#16210f;max-width:1180px;margin:0 auto;padding:clamp(4rem,10vw,8rem) clamp(1.2rem,5vw,3rem)}
.rc-head{display:flex;align-items:flex-end;justify-content:space-between;gap:2rem;margin-bottom:2.2rem;flex-wrap:wrap}
.rc-head .l .k{font-family:'Space Mono',monospace;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#2b6e34;display:inline-flex;align-items:center;gap:.6em;margin-bottom:1rem}
.rc-head .l .k::before{content:"";width:24px;height:1.5px;background:#2b6e34}
.rc-head .l h2{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;letter-spacing:-.03em;line-height:1.02;font-size:clamp(2rem,4.6vw,3.4rem);margin:0;color:#16210f}
.rc-head .l h2 em{font-family:'Fraunces',serif;font-style:italic;font-weight:500;color:#2b6e34}
.rc-head .l p{color:#4a5a42;margin:.8rem 0 0;max-width:42ch;font-family:'DM Sans',sans-serif}
.rc-nav{display:flex;gap:.6rem}
.rc-nav button{width:48px;height:48px;border-radius:50%;border:1px solid rgba(22,33,15,.10);background:#fff;color:#16210f;
  display:grid;place-content:center;cursor:pointer;transition:transform .2s cubic-bezier(.34,1.56,.64,1),background .2s,color .2s,border-color .2s,box-shadow .2s}
.rc-nav button:hover{background:#14A800;border-color:#14A800;color:#fff;box-shadow:0 10px 24px rgba(20,168,0,.3)}
.rc-nav button:active{transform:scale(.92)}
.rc-nav button:disabled{opacity:.3;cursor:default;background:#fff;color:#16210f;border-color:rgba(22,33,15,.10);box-shadow:none}

.rc-rail{display:flex;gap:1.4rem;overflow-x:auto;scroll-snap-type:x mandatory;padding:1.4rem .4rem 2rem;margin:0 -.4rem;
  scrollbar-width:none;-webkit-overflow-scrolling:touch}
.rc-rail::-webkit-scrollbar{display:none}

.rc-card{flex:0 0 clamp(290px,30vw,340px);scroll-snap-align:start;position:relative;aspect-ratio:3/4;border-radius:26px;overflow:hidden;
  cursor:pointer;isolation:isolate;background:#1a2410;
  box-shadow:0 2px 4px rgba(22,33,15,.05),0 18px 40px -12px rgba(22,33,15,.28);
  transition:transform .5s cubic-bezier(.16,1,.3,1),box-shadow .5s cubic-bezier(.16,1,.3,1)}
.rc-card:hover{transform:translateY(-10px);box-shadow:0 30px 60px -16px rgba(20,168,0,.4)}
.rc-card .photo{position:absolute;inset:0;z-index:0;background-size:cover;background-position:center;
  transition:transform .9s cubic-bezier(.16,1,.3,1);transform:scale(1.02)}
.rc-card:hover .photo{transform:scale(1.1)}
.rc-p1{background:radial-gradient(120% 110% at 35% 25%,#d7df84,#9aa83f 55%,#5c6a22)}
.rc-p2{background:radial-gradient(120% 110% at 35% 25%,#9fd86a,#46962f 55%,#235c1c)}
.rc-p3{background:radial-gradient(120% 110% at 35% 25%,#f0bf6a,#bd6f24 55%,#7a3f12)}
.rc-p4{background:radial-gradient(120% 110% at 35% 25%,#86c6bd,#3c8079 55%,#1f4a45)}
.rc-p5{background:radial-gradient(120% 110% at 35% 25%,#e89a8a,#c0533c 55%,#7a2c1d)}
.rc-card .veil{position:absolute;inset:0;z-index:1;
  background:linear-gradient(180deg,rgba(10,16,6,.42) 0%,rgba(10,16,6,0) 30%,rgba(10,16,6,.10) 52%,rgba(10,16,6,.85) 100%)}
.rc-top{position:absolute;top:14px;left:14px;right:14px;z-index:3;display:flex;align-items:flex-start;justify-content:space-between}
.rc-match{position:relative;width:54px;height:54px;flex:none}
.rc-match svg{transform:rotate(-90deg)}
.rc-match .track{stroke:rgba(255,255,255,.28)}
.rc-match .bar{stroke:#fff;stroke-linecap:round;transition:stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)}
.rc-match .pct{position:absolute;inset:0;display:grid;place-content:center;color:#fff;font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:14px;line-height:1}
.rc-match .lbl{position:absolute;top:56px;left:50%;transform:translateX(-50%);font-family:'Space Mono',monospace;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.85);white-space:nowrap}
.rc-save{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.16);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.28);
  display:grid;place-content:center;color:#fff;cursor:pointer;transition:background .2s,transform .2s cubic-bezier(.34,1.56,.64,1)}
.rc-save:hover{background:rgba(255,255,255,.3)}.rc-save:active{transform:scale(.88)}
.rc-save.saved{background:#fff;color:#14A800}
.rc-chips{position:absolute;top:78px;left:14px;z-index:3;display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.rc-chip{font-family:'Space Mono',monospace;font-size:9.5px;letter-spacing:.05em;text-transform:uppercase;font-weight:700;
  padding:5px 10px;border-radius:999px;display:inline-flex;align-items:center;gap:5px;
  background:rgba(255,255,255,.9);color:#0d7400;backdrop-filter:blur(6px);box-shadow:0 4px 12px rgba(0,0,0,.12)}
.rc-chip.alt{background:rgba(10,16,6,.42);color:#fff;border:1px solid rgba(255,255,255,.25)}
.rc-info{position:absolute;left:0;right:0;bottom:0;z-index:3;padding:18px 18px 20px;color:#fff}
.rc-rate{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#fff;margin-bottom:8px;
  background:rgba(255,255,255,.14);backdrop-filter:blur(6px);padding:4px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.2)}
.rc-rate svg{color:#ffd34d}
.rc-info h3{font-family:'Bricolage Grotesque',sans-serif;font-weight:700;letter-spacing:-.02em;font-size:1.45rem;line-height:1.08;margin:0;text-shadow:0 2px 14px rgba(0,0,0,.4)}
.rc-meta{display:flex;gap:16px;margin-top:10px;font-size:12px;color:rgba(255,255,255,.92)}
.rc-meta span{display:inline-flex;align-items:center;gap:6px}
.rc-cta{max-height:0;opacity:0;overflow:hidden;transition:max-height .45s cubic-bezier(.16,1,.3,1),opacity .4s cubic-bezier(.16,1,.3,1),margin-top .45s cubic-bezier(.16,1,.3,1)}
.rc-card:hover .rc-cta{max-height:60px;opacity:1;margin-top:14px}
.rc-cta button{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#16210f;
  border:0;border-radius:12px;padding:12px;font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:13.5px;cursor:pointer;transition:transform .2s cubic-bezier(.34,1.56,.64,1),background .2s,color .2s}
.rc-cta button:hover{background:#14A800;color:#fff}
.rc-cta button:active{transform:scale(.97)}
.rc-card::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;
  background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.14) 48%,transparent 60%);transition:opacity .5s}
.rc-card:hover::after{opacity:1}
.rc-prog{height:3px;background:rgba(22,33,15,.10);border-radius:99px;overflow:hidden;max-width:220px;margin-top:.4rem}
.rc-prog i{display:block;height:100%;background:#3fa14a;border-radius:99px;width:30%;transition:transform .2s cubic-bezier(.16,1,.3,1),width .2s cubic-bezier(.16,1,.3,1)}
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
      const chips = r.tags.map(([t, alt]) =>
        `<span class="rc-chip${alt ? ' alt' : ''}">${alt ? '' : CHECK}${t}</span>`
      ).join('')
      return `<article class="rc-card" data-i="${i}">
        <div class="photo rc-${r.p}"></div><div class="veil"></div>
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
            <p>Stellar returns a shelf of dishes you can actually make — each scored by how well it fits what you have and like.</p>
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
